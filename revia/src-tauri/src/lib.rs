pub mod commands;
pub mod db;
pub mod search;
pub mod settings;
pub mod sources;

use db::Database;
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
}

fn toggle_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.unminimize();
            let _ = window.set_focus();
        }
    }
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

    let state = AppState {
        db: Arc::clone(&db),
        is_paused: Arc::clone(&is_paused),
        chrome_source,
    };

    let shortcut_str = initial_settings.global_shortcut.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        toggle_window(app);
                    }
                })
                .build(),
        )
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
            commands::show_search_window
        ])
        .setup(move |app| {
            // Register global shortcut
            if let Ok(shortcut) = shortcut_str.parse::<Shortcut>() {
                if let Err(e) = app.global_shortcut().register(shortcut) {
                    eprintln!("Failed to register global shortcut '{}': {}", shortcut_str, e);
                } else {
                    println!("Registered global shortcut: {}", shortcut_str);
                }
            }

            // Create System Tray Menu
            let search_item = MenuItem::with_id(app, "search", "Search Revia", true, None::<&str>)?;
            let pause_item = MenuItem::with_id(app, "pause_toggle", "Pause / Resume Memory", true, None::<&str>)?;
            let reindex_item = MenuItem::with_id(app, "reindex", "Re-index Chrome History", true, None::<&str>)?;
            let settings_item = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit Revia", true, None::<&str>)?;

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

            let _tray = TrayIconBuilder::new()
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .tooltip("Revia — Your computer remembers")
                .on_menu_event(|app, event| {
                    match event.id().as_ref() {
                        "search" => {
                            toggle_window(app);
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
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.unminimize();
                                let _ = window.set_focus();
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

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Revia");
}
