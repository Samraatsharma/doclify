pub mod auth;
pub mod commands;
pub mod db;
pub mod modifier_tap;
pub mod search;
pub mod settings;
pub mod sources;

use db::Database;
use search::semantic::SemanticEngine;
use settings::load_settings;
use sources::chrome::ChromeHistorySource;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

pub struct AppState {
    pub db: Arc<Database>,
    pub is_paused: Arc<AtomicBool>,
    pub chrome_source: ChromeHistorySource,
    pub semantic_engine: Arc<SemanticEngine>,
}

pub fn spawn_embedding_worker(db: Arc<Database>, semantic_engine: Arc<SemanticEngine>) {
    std::thread::spawn(move || {
        // Wait up to 15s for model initialization if needed
        for _ in 0..30 {
            if semantic_engine.is_ready() {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }

        if !semantic_engine.is_ready() {
            return;
        }

        loop {
            let batch = db.with_conn(|conn| {
                crate::search::semantic::get_unembedded_items(conn, 50)
            });

            match batch {
                Ok(items) if !items.is_empty() => {
                    for (id, title, domain) in items {
                        let text = format!("{} {}", title, domain);
                        if let Some(emb) = semantic_engine.generate_embedding(&text) {
                            let _ = db.with_conn(|conn| {
                                crate::search::semantic::store_embedding(conn, &id, &emb, "all-minilm-l6-v2-q")
                            });
                        }
                    }
                    std::thread::sleep(std::time::Duration::from_millis(50));
                }
                _ => break,
            }
        }
    });
}

#[cfg(target_os = "macos")]
pub fn activate_app_macos() {
    use objc2_app_kit::NSApplication;
    use objc2::MainThreadMarker;
    if let Some(mtm) = MainThreadMarker::new() {
        let app = NSApplication::sharedApplication(mtm);
        #[allow(deprecated)]
        app.activateIgnoringOtherApps(true);
    }
}

#[cfg(not(target_os = "macos"))]
pub fn activate_app_macos() {}

pub static LAST_SHOWN_TIME_MS: std::sync::atomic::AtomicI64 = std::sync::atomic::AtomicI64::new(0);
pub static IS_ONBOARDING_ACTIVE: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

fn current_time_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

pub fn trigger_background_sync(app: &AppHandle) {
    let app_handle = app.clone();
    std::thread::spawn(move || {
        if let Some(state) = app_handle.try_state::<AppState>() {
            if !state.is_paused.load(Ordering::Relaxed) {
                use crate::sources::MemorySourceTrait;
                match state.chrome_source.ingest(&state.db, false) {
                    Ok(stats) => {
                        if stats.items_indexed > 0 {
                            crate::commands::log_runtime(
                                "SYNC_COMPLETED",
                                &format!("Incremental sync indexed {} items", stats.items_indexed),
                            );
                            let db = Arc::clone(&state.db);
                            let engine = Arc::clone(&state.semantic_engine);
                            spawn_embedding_worker(db, engine);

                            if let Some(win) = app_handle.get_webview_window("main") {
                                let _ = win.emit("memory-updated", ());
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("Background sync error: {}", e);
                    }
                }
            }
        }
    });
}

#[cfg(target_os = "macos")]
extern "C" {
    fn mac_install_modifier_monitor(callback: extern "C" fn());
    fn mac_set_dismiss_callback(callback: extern "C" fn());
}

static GLOBAL_APP_HANDLE: std::sync::RwLock<Option<AppHandle>> = std::sync::RwLock::new(None);

#[cfg(target_os = "macos")]
extern "C" fn on_cocoa_double_control() {
    if let Ok(guard) = GLOBAL_APP_HANDLE.read() {
        if let Some(app) = guard.as_ref() {
            handle_double_control_shortcut(app);
        }
    }
}

#[cfg(target_os = "macos")]
extern "C" fn on_cocoa_escape_dismiss() {
    if let Ok(guard) = GLOBAL_APP_HANDLE.read() {
        if let Some(app) = guard.as_ref() {
            let _ = commands::hide_search_window(app.clone());
        }
    }
}

pub fn handle_double_control_shortcut(app: &AppHandle) {
    let now = current_time_ms();
    let last = LAST_SHOWN_TIME_MS.load(Ordering::Relaxed);
    if now - last < 150 {
        return;
    }
    LAST_SHOWN_TIME_MS.store(now, Ordering::Relaxed);
    let app_handle = app.clone();
    trigger_background_sync(app);
    let _ = app.run_on_main_thread(move || {
        if let Some(window) = app_handle.get_webview_window("main") {
            let is_visible = window.is_visible().unwrap_or(false);

            // If capsule is already visible, pressing summon shortcut toggles it closed
            if is_visible {
                #[cfg(target_os = "macos")]
                {
                    unsafe { commands::mac_stop_speech_recognition(); }
                }
                commands::IS_VOICE_LISTENING.store(false, Ordering::Relaxed);
                let _ = window.emit("session-ended", ());
                let _ = window.hide();
                crate::commands::log_runtime("SESSION_DISMISSED", "Capsule dismissed via shortcut toggle.");
                return;
            }

            crate::modifier_tap::log_diagnostic("SUMMON WITH VOICE");
            LAST_SHOWN_TIME_MS.store(current_time_ms(), Ordering::Relaxed);
            let _ = commands::position_capsule_window(app_handle.clone(), Some(52.0));
            let _ = window.show();
            let _ = window.unminimize();
            let _ = window.set_focus();

            #[cfg(target_os = "macos")]
            {
                if let Ok(ns_win) = window.ns_window() {
                    unsafe {
                        commands::mac_show_and_order_front(ns_win as *mut std::ffi::c_void);
                    }
                }
                activate_app_macos();
            }

            let _ = window.emit("start-new-session", serde_json::json!({ "auto_voice": true }));
            crate::commands::log_runtime("SESSION_SUMMONED", "Summoned with voice mode active.");
            crate::modifier_tap::log_diagnostic("WINDOW VISIBLE (VOICE)");
        }
    });
}

pub fn show_and_focus_window(app: &AppHandle) {
    let app_handle = app.clone();
    trigger_background_sync(app);
    let _ = app.run_on_main_thread(move || {
        crate::modifier_tap::log_diagnostic("SHOW WINDOW");
        LAST_SHOWN_TIME_MS.store(current_time_ms(), Ordering::Relaxed);
        let _ = commands::position_near_top(app_handle.clone());
        if let Some(window) = app_handle.get_webview_window("main") {
            let _ = window.show();
            let _ = window.unminimize();
            let _ = window.set_focus();

            #[cfg(target_os = "macos")]
            {
                if let Ok(ns_win) = window.ns_window() {
                    unsafe {
                        commands::mac_show_and_order_front(ns_win as *mut std::ffi::c_void);
                    }
                }
                activate_app_macos();
            }

            let _ = window.emit("start-new-session", serde_json::json!({ "auto_voice": false }));
            crate::modifier_tap::log_diagnostic("WINDOW VISIBLE");
        }
    });
}

pub fn toggle_window(app: &AppHandle) {
    let app_handle = app.clone();
    let _ = app.run_on_main_thread(move || {
        if let Some(window) = app_handle.get_webview_window("main") {
            if window.is_visible().unwrap_or(false) {
                #[cfg(target_os = "macos")]
                {
                    unsafe { commands::mac_stop_speech_recognition(); }
                }
                commands::IS_VOICE_LISTENING.store(false, Ordering::Relaxed);
                let _ = window.emit("session-ended", ());
                let _ = window.hide();
                crate::commands::log_runtime("SESSION_DISMISSED", "Capsule dismissed via shortcut toggle.");
            } else {
                handle_double_control_shortcut(&app_handle);
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = Database::default_path();
    let db = match Database::new(&db_path) {
        Ok(d) => Arc::new(d),
        Err(e) => {
            eprintln!("Failed to initialize database at {:?}: {}", db_path, e);
            let fallback_path = std::env::temp_dir().join("revia_fallback.db");
            Arc::new(Database::new(&fallback_path).expect("Failed to create fallback DB"))
        }
    };

    let initial_settings = load_settings(&db);
    let is_paused = Arc::new(AtomicBool::new(initial_settings.is_paused));
    let chrome_source = ChromeHistorySource::new();
    let semantic_engine = SemanticEngine::new();

    let state = AppState {
        db: Arc::clone(&db),
        is_paused: Arc::clone(&is_paused),
        chrome_source,
        semantic_engine: Arc::clone(&semantic_engine),
    };

    let shortcut_str = initial_settings.global_shortcut.clone();
    let is_first_launch = !initial_settings.has_completed_onboarding;

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_and_focus_window(app);
        }))
        .plugin({
            #[cfg(target_os = "macos")]
            let launcher = tauri_plugin_autostart::MacosLauncher::LaunchAgent;
            #[cfg(not(target_os = "macos"))]
            let launcher = tauri_plugin_autostart::MacosLauncher::LaunchAgent; // unused on Windows, plugin handles it
            tauri_plugin_autostart::init(launcher, Some(vec!["--minimized"]))
        })
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        toggle_window(app);
                    }
                })
                .build(),
        )
        .on_window_event(|window, event| {
            match event {
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    api.prevent_close();
                    let _ = window.hide();
                    commands::log_runtime("SESSION_HIDDEN", "Capsule hidden via close requested.");
                }
                tauri::WindowEvent::Focused(false) => {
                    if !IS_ONBOARDING_ACTIVE.load(Ordering::Relaxed) {
                        // Only dismiss if outside the 800ms activation window
                        if current_time_ms() - LAST_SHOWN_TIME_MS.load(Ordering::Relaxed) > 800 {
                            #[cfg(target_os = "macos")]
                            {
                                unsafe { commands::mac_stop_speech_recognition(); }
                            }
                            commands::IS_VOICE_LISTENING.store(false, Ordering::Relaxed);
                            let _ = window.emit("session-ended", ());
                            let _ = window.hide();
                            commands::log_runtime("SESSION_HIDDEN", "Capsule hidden via focus loss.");
                        }
                    }
                }
                _ => {}
            }
        })
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::search_memory,
            commands::ingest_chrome_history,
            commands::get_memory_stats,
            commands::clear_memory,
            commands::set_pause_memory,
            commands::get_settings,
            commands::update_settings,
            commands::check_chrome_history_access,
            commands::open_url,
            commands::hide_search_window,
            commands::show_search_window,
            commands::set_window_height,
            commands::position_near_top,
            commands::position_setup_window,
            commands::position_capsule_window,
            commands::complete_onboarding,
            commands::reset_onboarding,
            commands::check_is_first_run,
            commands::check_accessibility_permission,
            commands::request_accessibility_permission,
            commands::log_frontend_event,
            commands::check_microphone_permission,
            commands::request_microphone_permission,
            commands::open_microphone_settings,
            commands::open_accessibility_settings,
            commands::start_voice_transcription,
            commands::stop_voice_transcription,
            commands::check_speech_permission,
            commands::request_speech_permission,
            commands::exit_app,
            auth::get_account_profile,
            auth::initiate_google_auth,
            auth::sign_out_account
        ])
        .setup(move |app| {
            if let Ok(mut guard) = commands::GLOBAL_APP_HANDLE.lock() {
                *guard = Some(app.handle().clone());
            }
            commands::log_runtime("TAURI_SETUP", "Initializing Revia background services...");

            #[cfg(target_os = "macos")]
            {
                let _ = app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }

            // First-run: show the centered setup window
            // Returning user: hide to background (they'll use ⌃⌃ or tray)
            if let Some(window) = app.get_webview_window("main") {
                #[cfg(target_os = "macos")]
                {
                    if let Ok(ns_win) = window.ns_window() {
                        unsafe {
                            commands::mac_configure_transparent_window(ns_win as *mut std::ffi::c_void);
                        }
                    }
                }

                if !is_first_launch {
                    let _ = commands::position_capsule_window(app.handle().clone(), Some(52.0));
                    let _ = window.hide();
                    commands::log_runtime("WINDOW_CREATED", "Main window created and hidden (returning user)");
                } else {
                    IS_ONBOARDING_ACTIVE.store(true, Ordering::Relaxed);
                    LAST_SHOWN_TIME_MS.store(current_time_ms(), Ordering::Relaxed);
                    let _ = commands::position_setup_window(app.handle().clone());
                    let app_h = app.handle().clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_millis(150));
                        let app_main = app_h.clone();
                        let _ = app_h.run_on_main_thread(move || {
                            if let Some(win) = app_main.get_webview_window("main") {
                                let _ = commands::position_setup_window(app_main.clone());
                                let _ = win.show();
                                let _ = win.unminimize();
                                let _ = win.set_focus();
                                #[cfg(target_os = "macos")]
                                {
                                    if let Ok(ns_win) = win.ns_window() {
                                        unsafe {
                                            commands::mac_show_and_order_front(ns_win as *mut std::ffi::c_void);
                                        }
                                    }
                                    activate_app_macos();
                                }
                            }
                        });
                    });
                    commands::log_runtime("WINDOW_CREATED", "Main window created and shown centered (first launch)");
                }
            }

            if let Ok(mut guard) = GLOBAL_APP_HANDLE.write() {
                *guard = Some(app.handle().clone());
            }

            #[cfg(target_os = "macos")]
            unsafe {
                mac_install_modifier_monitor(on_cocoa_double_control);
                mac_set_dismiss_callback(on_cocoa_escape_dismiss);
            }

            // Start Double-Modifier Listener (Default: Double Control ⌃ ⌃)
            let mod_target = crate::modifier_tap::ModifierTarget::from_str(&shortcut_str);
            crate::modifier_tap::start_modifier_listener(app.handle().clone(), mod_target);

            // Register global shortcut fallback / combo
            let sc = crate::settings::parse_shortcut(&shortcut_str)
                .unwrap_or_else(|_| "Alt+Space".parse::<Shortcut>().unwrap());
            if let Err(e) = app.global_shortcut().register(sc) {
                eprintln!("Failed to register global shortcut '{}': {}", shortcut_str, e);
                if let Ok(alt_sc) = "Alt+Space".parse::<Shortcut>() {
                    let _ = app.global_shortcut().register(alt_sc);
                }
            } else {
                println!("Registered global shortcut: {}", shortcut_str);
            }

            // Create System Tray Menu
            let search_item = MenuItem::with_id(app, "search", "Open Revia", true, None::<&str>)?;
            let pause_item = MenuItem::with_id(app, "pause_toggle", "Pause / Resume Memory", true, None::<&str>)?;
            let reindex_item = MenuItem::with_id(app, "reindex", "Re-index Chrome History", true, None::<&str>)?;
            let settings_item = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit Revia", true, Some("CmdOrCtrl+Q"))?;

            let tray_menu = Menu::with_items(
                app,
                &[
                    &search_item,
                    &pause_item,
                    &reindex_item,
                    &settings_item,
                    &quit_item,
                ],
            )?;

            let tray_icon = app.default_window_icon().cloned().unwrap();
            let _tray = TrayIconBuilder::new()
                .icon(tray_icon)
                .icon_as_template(true)
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .tooltip("Revia — Your computer remembers (Alt+Space)")
                .on_menu_event(|app, event| {
                    match event.id().as_ref() {
                        "search" => {
                            show_and_focus_window(app);
                        }
                        "pause_toggle" => {
                            if let Some(state) = app.try_state::<AppState>() {
                                let current = state.is_paused.load(Ordering::Relaxed);
                                let new_state = !current;
                                let _ = commands::set_pause_memory(state, new_state);
                            }
                        }
                        "reindex" => {
                            let app_handle = app.clone();
                            std::thread::spawn(move || {
                                if let Some(state) = app_handle.try_state::<AppState>() {
                                    let _ = commands::ingest_chrome_history(state, Some(false));
                                }
                            });
                        }
                        "settings" => {
                            show_and_focus_window(app);
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.emit("open-settings", ());
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        toggle_window(app);
                    }
                })
                .build(app)?;

            // Start background embedding worker
            spawn_embedding_worker(Arc::clone(&db), Arc::clone(&semantic_engine));

            // Start continuous background history synchronizer (runs immediately after startup and every 8s)
            let app_bg = app.handle().clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_millis(600));
                trigger_background_sync(&app_bg);

                loop {
                    std::thread::sleep(std::time::Duration::from_secs(8));
                    trigger_background_sync(&app_bg);
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Revia");
}
