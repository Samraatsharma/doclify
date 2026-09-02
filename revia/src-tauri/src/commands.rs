use crate::db::models::{ChromeAccessStatus, IngestionStats, MemoryItem, MemoryStats};
use crate::search;
use crate::settings::{load_settings, save_settings, AppSettings};
use crate::AppState;
use std::sync::atomic::Ordering;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};
use url::Url;

#[tauri::command]
pub fn search_memory(
    state: State<'_, AppState>,
    query: String,
    limit: Option<usize>,
) -> Result<Vec<MemoryItem>, String> {
    let lim = limit.unwrap_or(20);
    search::search(&state.db, &query, lim)
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
    state.chrome_source.ingest(&state.db, force_full.unwrap_or(false))
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
        if let Ok(new_shortcut) = settings.global_shortcut.parse::<Shortcut>() {
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

    #[cfg(not(target_os = "macos"))]
    {
        open::that(trimmed).map_err(|e| format!("Failed to open URL: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn hide_search_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
    Ok(())
}

#[tauri::command]
pub fn show_search_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
    Ok(())
}
