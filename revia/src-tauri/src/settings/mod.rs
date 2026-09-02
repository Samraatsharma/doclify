use crate::db::Database;
use serde::{Deserialize, Serialize};

pub const DEFAULT_SHORTCUT: &str = "CommandOrControl+Shift+Space";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub launch_at_login: bool,
    pub global_shortcut: String,
    pub max_results: usize,
    pub is_paused: bool,
    pub has_completed_onboarding: bool,
    pub last_sync_timestamp: Option<i64>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            launch_at_login: false,
            global_shortcut: DEFAULT_SHORTCUT.to_string(),
            max_results: 20,
            is_paused: false,
            has_completed_onboarding: false,
            last_sync_timestamp: None,
        }
    }
}

pub fn load_settings(db: &Database) -> AppSettings {
    let mut settings = AppSettings::default();

    if let Ok(Some(val)) = db.get_setting("launch_at_login") {
        settings.launch_at_login = val == "true";
    }
    if let Ok(Some(val)) = db.get_setting("global_shortcut") {
        if !val.trim().is_empty() {
            settings.global_shortcut = val;
        }
    }
    if let Ok(Some(val)) = db.get_setting("max_results") {
        if let Ok(num) = val.parse::<usize>() {
            settings.max_results = num.clamp(5, 100);
        }
    }
    if let Ok(Some(val)) = db.get_setting("is_paused") {
        settings.is_paused = val == "true";
    }
    if let Ok(Some(val)) = db.get_setting("has_completed_onboarding") {
        settings.has_completed_onboarding = val == "true";
    }
    if let Ok(Some(val)) = db.get_setting("last_sync_timestamp") {
        settings.last_sync_timestamp = val.parse::<i64>().ok();
    }

    settings
}

pub fn save_settings(db: &Database, settings: &AppSettings) -> Result<(), String> {
    db.set_setting("launch_at_login", if settings.launch_at_login { "true" } else { "false" })
        .map_err(|e| e.to_string())?;
    db.set_setting("global_shortcut", &settings.global_shortcut)
        .map_err(|e| e.to_string())?;
    db.set_setting("max_results", &settings.max_results.to_string())
        .map_err(|e| e.to_string())?;
    db.set_setting("is_paused", if settings.is_paused { "true" } else { "false" })
        .map_err(|e| e.to_string())?;
    db.set_setting("has_completed_onboarding", if settings.has_completed_onboarding { "true" } else { "false" })
        .map_err(|e| e.to_string())?;
    if let Some(ts) = settings.last_sync_timestamp {
        db.set_setting("last_sync_timestamp", &ts.to_string())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
