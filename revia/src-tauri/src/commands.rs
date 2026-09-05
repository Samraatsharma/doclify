use crate::db::models::{ChromeAccessStatus, IngestionStats, MemoryItem, MemoryStats};
use crate::search;
use crate::settings::{load_settings, save_settings, AppSettings};
use crate::AppState;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use url::Url;

#[tauri::command]
pub fn search_memory(
    state: State<'_, AppState>,
    query: String,
    limit: Option<usize>,
) -> Result<Vec<MemoryItem>, String> {
    let lim = limit.unwrap_or(20);
    search::search(&state.db, &state.semantic_engine, &query, lim)
}

#[tauri::command]
pub fn ingest_chrome_history(
    state: State<'_, AppState>,
    force_full: Option<bool>,
) -> Result<IngestionStats, String> {
    if state.is_paused.load(Ordering::Relaxed) {
        return Err("Indexing is currently paused. Resume memory to index.".to_string());
    }
    use crate::sources::MemorySourceTrait;
    let res = state.chrome_source.ingest(&state.db, force_full.unwrap_or(false))?;

    // Spawn background worker to compute embeddings for newly ingested items
    let db = Arc::clone(&state.db);
    let engine = Arc::clone(&state.semantic_engine);
    std::thread::spawn(move || {
        crate::spawn_embedding_worker(db, engine);
    });

    Ok(res)
}

#[tauri::command]
pub fn get_memory_stats(state: State<'_, AppState>) -> Result<MemoryStats, String> {
    let paused = state.is_paused.load(Ordering::Relaxed);
    state.db.get_memory_stats(paused).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_memory(state: State<'_, AppState>) -> Result<(), String> {
    state.db.clear_memory().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_pause_memory(state: State<'_, AppState>, paused: bool) -> Result<bool, String> {
    state.is_paused.store(paused, Ordering::Relaxed);
    let mut current_settings = load_settings(&state.db);
    current_settings.is_paused = paused;
    let _ = save_settings(&state.db, &current_settings);
    Ok(paused)
}

#[tauri::command]
pub fn get_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    Ok(load_settings(&state.db))
}

#[tauri::command]
pub fn update_settings(
    app: AppHandle,
    state: State<'_, AppState>,
    settings: AppSettings,
) -> Result<(), String> {
    state.is_paused.store(settings.is_paused, Ordering::Relaxed);

    // Update global shortcut if changed
    let old_settings = load_settings(&state.db);
    if old_settings.global_shortcut != settings.global_shortcut {
        if let Ok(new_shortcut) = crate::settings::parse_shortcut(&settings.global_shortcut) {
            let _ = app.global_shortcut().unregister_all();
            let _ = app.global_shortcut().register(new_shortcut);
        }
    }

    save_settings(&state.db, &settings)?;
    Ok(())
}

#[tauri::command]
pub fn check_chrome_history_access(state: State<'_, AppState>) -> Result<ChromeAccessStatus, String> {
    use crate::sources::MemorySourceTrait;
    Ok(state.chrome_source.check_access())
}

#[tauri::command]
pub fn open_url(url: String) -> Result<(), String> {
    let trimmed = url.trim();
    // Strictly validate external URL scheme
    if !trimmed.starts_with("http://") && !trimmed.starts_with("https://") {
        return Err("Security error: Only HTTP and HTTPS URLs are permitted.".to_string());
    }

    let parsed = Url::parse(trimmed).map_err(|e| format!("Invalid URL: {}", e))?;
    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err("Security error: Forbidden scheme.".to_string());
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(trimmed)
            .spawn()
            .map_err(|e| format!("Failed to open URL in browser: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        // Use Windows default browser via ShellExecute-equivalent
        std::process::Command::new("cmd")
            .args(["/C", "start", "", trimmed])
            .spawn()
            .map_err(|e| format!("Failed to open URL on Windows: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(trimmed)
            .spawn()
            .map_err(|e| format!("Failed to open URL on Linux: {}", e))?;
    }

    Ok(())
}

pub static IS_VOICE_LISTENING: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

#[tauri::command]
pub fn hide_search_window(app: AppHandle) -> Result<(), String> {
    IS_VOICE_LISTENING.store(false, Ordering::Relaxed);
    #[cfg(target_os = "macos")]
    {
        unsafe {
            mac_stop_speech_recognition();
        }
    }
    let app_clone = app.clone();
    let _ = app.run_on_main_thread(move || {
        if let Some(window) = app_clone.get_webview_window("main") {
            let _ = window.hide();
        }
    });
    Ok(())
}

#[tauri::command]
pub fn show_search_window(app: AppHandle) -> Result<(), String> {
    crate::show_and_focus_window(&app);
    Ok(())
}



#[cfg(target_os = "macos")]
extern "C" {
    fn mac_check_microphone_permission() -> i32;
    fn mac_request_microphone_permission(callback: extern "C" fn(bool));
    fn mac_check_accessibility_permission() -> bool;
    fn mac_request_accessibility_permission() -> bool;
    fn mac_open_privacy_settings(pane: *const std::os::raw::c_char);
    fn mac_check_speech_permission() -> i32;
    fn mac_request_speech_permission(callback: extern "C" fn(bool));
    fn mac_start_speech_recognition(
        on_transcript: extern "C" fn(*const std::os::raw::c_char, bool),
        on_error: extern "C" fn(*const std::os::raw::c_char),
    );
    pub fn mac_stop_speech_recognition();
    pub fn mac_show_and_order_front(ns_window_ptr: *mut std::ffi::c_void);
    pub fn mac_configure_transparent_window(ns_window_ptr: *mut std::ffi::c_void);
    fn mac_anchor_window_top_right(
        ns_window_ptr: *mut std::ffi::c_void,
        target_width: f64,
        target_height: f64,
        margin_right: f64,
        margin_top: f64,
    );
    fn mac_center_window(
        ns_window_ptr: *mut std::ffi::c_void,
        target_width: f64,
        target_height: f64,
    );
}

pub static GLOBAL_APP_HANDLE: std::sync::Mutex<Option<AppHandle>> = std::sync::Mutex::new(None);

#[cfg(target_os = "macos")]
extern "C" fn on_speech_transcript(text: *const std::os::raw::c_char, is_final: bool) {
    if text.is_null() { return; }
    if is_final {
        IS_VOICE_LISTENING.store(false, Ordering::Relaxed);
    }
    let c_str = unsafe { std::ffi::CStr::from_ptr(text) };
    if let Ok(s) = c_str.to_str() {
        log_runtime("SPEECH_TRANSCRIPT", &format!("{}: {}", if is_final { "FINAL" } else { "INTERIM" }, s));
        if let Ok(guard) = GLOBAL_APP_HANDLE.lock() {
            if let Some(ref app) = *guard {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("voice-transcript", serde_json::json!({
                        "text": s,
                        "is_final": is_final
                    }));
                }
            }
        }
    }
}

#[cfg(target_os = "macos")]
extern "C" fn on_speech_error(err: *const std::os::raw::c_char) {
    IS_VOICE_LISTENING.store(false, Ordering::Relaxed);
    if err.is_null() { return; }
    let c_str = unsafe { std::ffi::CStr::from_ptr(err) };
    if let Ok(s) = c_str.to_str() {
        log_runtime("SPEECH_ERROR", s);
        if let Ok(guard) = GLOBAL_APP_HANDLE.lock() {
            if let Some(ref app) = *guard {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("voice-error", s);
                }
            }
        }
    }
}

#[tauri::command]
pub fn start_voice_transcription(app: AppHandle) -> Result<(), String> {
    log_runtime("VOICE_TRANSCRIPTION_START", "Starting native speech recognition");
    IS_VOICE_LISTENING.store(true, Ordering::Relaxed);
    if let Ok(mut guard) = GLOBAL_APP_HANDLE.lock() {
        *guard = Some(app.clone());
    }
    #[cfg(target_os = "macos")]
    {
        unsafe {
            mac_start_speech_recognition(on_speech_transcript, on_speech_error);
        }
    }
    Ok(())
}

#[tauri::command]
pub fn stop_voice_transcription() -> Result<(), String> {
    log_runtime("VOICE_TRANSCRIPTION_STOP", "Stopping native speech recognition");
    IS_VOICE_LISTENING.store(false, Ordering::Relaxed);
    #[cfg(target_os = "macos")]
    {
        unsafe {
            mac_stop_speech_recognition();
        }
    }
    Ok(())
}

pub fn log_runtime(event: &str, details: &str) {
    use std::io::Write;
    let ts = chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();
    let line = format!("[{}] [{}] {}\n", ts, event, details);
    eprint!("{}", line);
    let log_path = std::env::temp_dir().join("revia_runtime.log");
    if let Ok(mut f) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
    {
        let _ = f.write_all(line.as_bytes());
    }
}

#[tauri::command]
pub fn log_frontend_event(event: String, details: String) {
    log_runtime(&event, &details);
}

#[tauri::command]
pub fn check_microphone_permission() -> String {
    #[cfg(target_os = "macos")]
    {
        let code = unsafe { mac_check_microphone_permission() };
        let status = match code {
            0 => "not_determined",
            1 => "restricted",
            2 => "denied",
            3 => "authorized",
            _ => "unknown",
        };
        log_runtime("MICROPHONE_PERMISSION_CHECK", status);
        status.to_string()
    }
    #[cfg(not(target_os = "macos"))]
    {
        "authorized".to_string()
    }
}

#[cfg(target_os = "macos")]
static MIC_CALLBACK: std::sync::Mutex<Option<std::sync::mpsc::Sender<bool>>> =
    std::sync::Mutex::new(None);

#[cfg(target_os = "macos")]
extern "C" fn on_mic_permission_response(granted: bool) {
    log_runtime(
        "MICROPHONE_PERMISSION_RESPONSE",
        if granted { "granted" } else { "denied" },
    );
    if let Ok(mut guard) = MIC_CALLBACK.lock() {
        if let Some(tx) = guard.take() {
            let _ = tx.send(granted);
        }
    }
}

#[tauri::command]
pub async fn request_microphone_permission() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        log_runtime("PERMISSION_REQUEST", "Requesting macOS microphone permission...");
        let (tx, rx) = std::sync::mpsc::channel::<bool>();
        {
            let mut guard = MIC_CALLBACK.lock().unwrap();
            *guard = Some(tx);
        }

        unsafe {
            mac_request_microphone_permission(on_mic_permission_response);
        }

        // Wait up to 30s for user response in background
        match rx.recv_timeout(std::time::Duration::from_secs(30)) {
            Ok(granted) => Ok(granted),
            Err(_) => {
                let status = check_microphone_permission();
                Ok(status == "authorized")
            }
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        Ok(true)
    }
}

#[tauri::command]
pub fn open_microphone_settings() {
    #[cfg(target_os = "macos")]
    {
        log_runtime("OPEN_SETTINGS", "Opening Privacy & Security -> Microphone");
        let pane = std::ffi::CString::new("x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone").unwrap();
        unsafe {
            mac_open_privacy_settings(pane.as_ptr());
        }
    }
    #[cfg(target_os = "windows")]
    {
        log_runtime("OPEN_SETTINGS", "Opening Windows microphone privacy settings");
        let _ = std::process::Command::new("cmd")
            .args(["/C", "start", "ms-settings:privacy-microphone"])
            .spawn();
    }
}

#[tauri::command]
pub fn open_accessibility_settings() {
    #[cfg(target_os = "macos")]
    {
        log_runtime("OPEN_SETTINGS", "Opening Privacy & Security -> Accessibility");
        let pane = std::ffi::CString::new("x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility").unwrap();
        unsafe {
            mac_open_privacy_settings(pane.as_ptr());
        }
    }
    // Windows: no equivalent permission required for global shortcuts via RegisterHotKey
}

#[tauri::command]
pub fn check_speech_permission() -> String {
    #[cfg(target_os = "macos")]
    {
        let code = unsafe { mac_check_speech_permission() };
        let status = match code {
            0 => "not_determined",
            1 => "denied",
            2 => "restricted",
            3 => "authorized",
            _ => "unknown",
        };
        log_runtime("SPEECH_PERMISSION_CHECK", status);
        status.to_string()
    }
    #[cfg(not(target_os = "macos"))]
    {
        "authorized".to_string()
    }
}

#[cfg(target_os = "macos")]
static SPEECH_CALLBACK: std::sync::Mutex<Option<std::sync::mpsc::Sender<bool>>> =
    std::sync::Mutex::new(None);

#[cfg(target_os = "macos")]
extern "C" fn on_speech_permission_response(granted: bool) {
    log_runtime(
        "SPEECH_PERMISSION_RESPONSE",
        if granted { "granted" } else { "denied" },
    );
    if let Ok(mut guard) = SPEECH_CALLBACK.lock() {
        if let Some(tx) = guard.take() {
            let _ = tx.send(granted);
        }
    }
}

#[tauri::command]
pub async fn request_speech_permission() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        log_runtime("PERMISSION_REQUEST", "Requesting macOS Speech Recognition permission...");
        let (tx, rx) = std::sync::mpsc::channel::<bool>();
        {
            let mut guard = SPEECH_CALLBACK.lock().unwrap();
            *guard = Some(tx);
        }

        unsafe {
            mac_request_speech_permission(on_speech_permission_response);
        }

        match rx.recv_timeout(std::time::Duration::from_secs(30)) {
            Ok(granted) => Ok(granted),
            Err(_) => {
                let status = check_speech_permission();
                Ok(status == "authorized")
            }
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        Ok(true)
    }
}

#[tauri::command]
pub fn position_setup_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        #[cfg(target_os = "macos")]
        {
            if let Ok(ns_win) = window.ns_window() {
                unsafe {
                    mac_center_window(ns_win as *mut std::ffi::c_void, 590.0, 470.0);
                }
                log_runtime("WINDOW_POSITIONED", "Centered setup window on active display (590x470)");
                return Ok(());
            }
        }
        let _ = window.set_size(tauri::LogicalSize::new(590.0, 470.0));
        let _ = window.center();
    }
    Ok(())
}

#[tauri::command]
pub fn position_capsule_window(app: AppHandle, content_height: Option<f64>) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let ch = content_height.unwrap_or(52.0).max(52.0);
        let win_w = 440.0;
        let win_h = ch + 20.0; // 10px padding buffer for transparent edges & soft shadows

        #[cfg(target_os = "macos")]
        {
            if let Ok(ns_win) = window.ns_window() {
                unsafe {
                    // margin_right = 18.0 (420px pill sits at 28px from right)
                    // margin_top = 34.0 (52px pill sits at 44px from top)
                    mac_anchor_window_top_right(ns_win as *mut std::ffi::c_void, win_w, win_h, 18.0, 34.0);
                }
                log_runtime("WINDOW_POSITIONED", &format!("Anchored capsule to top-right (content_h: {}, win_h: {})", ch, win_h));
                return Ok(());
            }
        }

        // Windows & Linux: position top-right of monitor using Tauri monitor APIs
        #[cfg(not(target_os = "macos"))]
        {
            let monitor_opt = window.current_monitor()
                .ok()
                .flatten()
                .or_else(|| window.primary_monitor().ok().flatten());

            if let Some(monitor) = monitor_opt {
                let scale = monitor.scale_factor();
                let size = monitor.size(); // physical pixels
                let pos = monitor.position(); // physical pixels

                // Convert logical dimensions to physical
                let phys_w = (win_w * scale) as u32;
                let phys_h = (win_h * scale) as u32;

                // margin_right = 18 logical px, margin_top = 44 logical px (below taskbar)
                let margin_right_phys = (18.0 * scale) as i32;
                let margin_top_phys = (44.0 * scale) as i32;

                let x = pos.x + (size.width as i32) - phys_w as i32 - margin_right_phys;
                let y = pos.y + margin_top_phys;

                let _ = window.set_size(tauri::PhysicalSize::new(phys_w, phys_h));
                let _ = window.set_position(tauri::PhysicalPosition::new(x, y));
                log_runtime("WINDOW_POSITIONED", &format!("Windows top-right anchor: ({}, {}) size: {}x{} scale: {}", x, y, phys_w, phys_h, scale));
                return Ok(());
            }
        }

        // Final fallback: logical size only
        let _ = window.set_size(tauri::LogicalSize::new(win_w, win_h));
    }
    Ok(())
}

#[tauri::command]
pub fn set_window_height(app: AppHandle, height: f64) -> Result<(), String> {
    if crate::IS_ONBOARDING_ACTIVE.load(Ordering::Relaxed) {
        return position_setup_window(app);
    }
    position_capsule_window(app, Some(height))
}

#[tauri::command]
pub fn check_accessibility_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        unsafe { mac_check_accessibility_permission() }
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

#[tauri::command]
pub fn request_accessibility_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        log_runtime("PERMISSION_REQUEST", "Requesting macOS Accessibility permission...");
        unsafe { mac_request_accessibility_permission() }
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

#[tauri::command]
pub fn position_near_top(app: AppHandle) -> Result<(), String> {
    if crate::IS_ONBOARDING_ACTIVE.load(Ordering::Relaxed) {
        position_setup_window(app)
    } else {
        position_capsule_window(app, Some(52.0))
    }
}

#[tauri::command]
pub fn complete_onboarding(state: State<'_, AppState>) -> Result<(), String> {
    crate::IS_ONBOARDING_ACTIVE.store(false, std::sync::atomic::Ordering::Relaxed);
    let mut current = load_settings(&state.db);
    current.has_completed_onboarding = true;
    save_settings(&state.db, &current)?;
    Ok(())
}

#[tauri::command]
pub fn reset_onboarding(state: State<'_, AppState>) -> Result<(), String> {
    crate::IS_ONBOARDING_ACTIVE.store(true, std::sync::atomic::Ordering::Relaxed);
    let mut current = load_settings(&state.db);
    current.has_completed_onboarding = false;
    save_settings(&state.db, &current)?;
    Ok(())
}

#[tauri::command]
pub fn check_is_first_run(state: State<'_, AppState>) -> bool {
    let settings = load_settings(&state.db);
    !settings.has_completed_onboarding
}

