use super::MemorySourceTrait;
use crate::db::models::{ChromeAccessStatus, IngestionStats, MemoryItem, MemoryVisit};
use crate::db::Database;
use rusqlite::{params, Connection, OpenFlags};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::PathBuf;
use std::time::Instant;
use url::Url;

const CHROME_EPOCH_OFFSET_MICROS: i64 = 11_644_473_600_000_000;

pub struct ChromeHistorySource;

impl ChromeHistorySource {
    pub fn new() -> Self {
        Self
    }

    /// Returns Chrome (and Chromium) history file paths for the current platform.
    pub fn get_chrome_history_paths() -> Vec<PathBuf> {
        let mut paths = Vec::new();

        #[cfg(target_os = "macos")]
        {
            if let Some(home_dir) = dirs::home_dir() {
                let chrome_base = home_dir
                    .join("Library")
                    .join("Application Support")
                    .join("Google")
                    .join("Chrome");
                Self::collect_chromium_profiles(&chrome_base, &mut paths);
            }
        }

        #[cfg(target_os = "windows")]
        {
            // Chrome: %LOCALAPPDATA%\Google\Chrome\User Data
            if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
                let chrome_base = PathBuf::from(local_app_data)
                    .join("Google")
                    .join("Chrome")
                    .join("User Data");
                Self::collect_chromium_profiles(&chrome_base, &mut paths);
            }
        }

        #[cfg(target_os = "linux")]
        {
            if let Some(home_dir) = dirs::home_dir() {
                let chrome_base = home_dir.join(".config").join("google-chrome");
                Self::collect_chromium_profiles(&chrome_base, &mut paths);
            }
        }

        paths
    }

    /// Collect Chromium-family History files from a base User Data directory.
    fn collect_chromium_profiles(base: &PathBuf, paths: &mut Vec<PathBuf>) {
        if !base.exists() {
            return;
        }
        // Default profile
        let default_history = base.join("Default").join("History");
        if default_history.exists() {
            paths.push(default_history);
        }
        // Profile N profiles
        if let Ok(entries) = fs::read_dir(base) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                        if name.starts_with("Profile ") {
                            let prof_history = path.join("History");
                            if prof_history.exists() {
                                paths.push(prof_history);
                            }
                        }
                    }
                }
            }
        }
    }

    /// Returns all browser history paths across Chrome, Edge, and Firefox.
    /// Label: "chrome" | "edge" | "firefox"
    pub fn get_all_browser_history_paths() -> Vec<(String, PathBuf)> {
        let mut results: Vec<(String, PathBuf)> = Vec::new();

        // --- Chrome ---
        for p in Self::get_chrome_history_paths() {
            results.push(("chrome".to_string(), p));
        }

        // --- Microsoft Edge (Chromium-based) ---
        #[cfg(target_os = "macos")]
        {
            if let Some(home_dir) = dirs::home_dir() {
                let edge_base = home_dir
                    .join("Library")
                    .join("Application Support")
                    .join("Microsoft Edge");
                let mut edge_paths = Vec::new();
                Self::collect_chromium_profiles(&edge_base, &mut edge_paths);
                for p in edge_paths {
                    results.push(("edge".to_string(), p));
                }
            }
        }
        #[cfg(target_os = "windows")]
        {
            if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
                let edge_base = PathBuf::from(local_app_data)
                    .join("Microsoft")
                    .join("Edge")
                    .join("User Data");
                let mut edge_paths = Vec::new();
                Self::collect_chromium_profiles(&edge_base, &mut edge_paths);
                for p in edge_paths {
                    results.push(("edge".to_string(), p));
                }
            }
        }

        // --- Firefox (places.sqlite) ---
        #[cfg(target_os = "macos")]
        {
            if let Some(home_dir) = dirs::home_dir() {
                let ff_base = home_dir
                    .join("Library")
                    .join("Application Support")
                    .join("Firefox")
                    .join("Profiles");
                if ff_base.exists() {
                    if let Ok(entries) = fs::read_dir(&ff_base) {
                        for entry in entries.flatten() {
                            let places = entry.path().join("places.sqlite");
                            if places.exists() {
                                results.push(("firefox".to_string(), places));
                            }
                        }
                    }
                }
            }
        }
        #[cfg(target_os = "windows")]
        {
            if let Some(app_data) = std::env::var_os("APPDATA") {
                let ff_base = PathBuf::from(app_data)
                    .join("Mozilla")
                    .join("Firefox")
                    .join("Profiles");
                if ff_base.exists() {
                    if let Ok(entries) = fs::read_dir(&ff_base) {
                        for entry in entries.flatten() {
                            let places = entry.path().join("places.sqlite");
                            if places.exists() {
                                results.push(("firefox".to_string(), places));
                            }
                        }
                    }
                }
            }
        }

        results
    }

    pub fn chrome_time_to_unix_millis(chrome_micros: i64) -> i64 {
        if chrome_micros <= CHROME_EPOCH_OFFSET_MICROS {
            0
        } else {
            (chrome_micros - CHROME_EPOCH_OFFSET_MICROS) / 1000
        }
    }

    pub fn unix_millis_to_chrome_time(unix_millis: i64) -> i64 {
        if unix_millis <= 0 {
            0
        } else {
            (unix_millis * 1000) + CHROME_EPOCH_OFFSET_MICROS
        }
    }

    fn generate_item_id(url: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(url.as_bytes());
        format!("chrome_{}", hex::encode(hasher.finalize()))
    }

    /// Expected Chrome history path for error messages on the current platform.
    fn expected_path_string() -> String {
        #[cfg(target_os = "macos")]
        {
            dirs::home_dir()
                .map(|h| {
                    h.join("Library/Application Support/Google/Chrome/Default/History")
                        .to_string_lossy()
                        .to_string()
                })
                .unwrap_or_default()
        }
        #[cfg(target_os = "windows")]
        {
            std::env::var("LOCALAPPDATA")
                .map(|p| {
                    format!(
                        r"{}\Google\Chrome\User Data\Default\History",
                        p
                    )
                })
                .unwrap_or_else(|_| r"%LOCALAPPDATA%\Google\Chrome\User Data\Default\History".to_string())
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            "~/.config/google-chrome/Default/History".to_string()
        }
    }
}

// Minimal hex encoder to avoid extra dependencies
mod hex {
    pub fn encode(data: impl AsRef<[u8]>) -> String {
        data.as_ref()
            .iter()
            .map(|b| format!("{:02x}", b))
            .collect()
    }
}

impl MemorySourceTrait for ChromeHistorySource {
    fn source_id(&self) -> &str {
        "chrome_history"
    }

    fn source_name(&self) -> &str {
        "Google Chrome"
    }

    fn check_access(&self) -> ChromeAccessStatus {
        let paths = Self::get_chrome_history_paths();
        if paths.is_empty() {
            return ChromeAccessStatus {
                accessible: false,
                path: Self::expected_path_string(),
                exists: false,
                item_count: None,
                error_message: Some(
                    "Google Chrome history file not found. Chrome may not be installed or hasn't created history yet.".to_string(),
                ),
            };
        }

        let primary_path = &paths[0];
        let temp_path = std::env::temp_dir()
            .join(format!("revia_chrome_check_{}.db", std::process::id()));

        // Try safe copy and read
        if let Err(e) = fs::copy(primary_path, &temp_path) {
            return ChromeAccessStatus {
                accessible: false,
                path: primary_path.to_string_lossy().to_string(),
                exists: true,
                item_count: None,
                error_message: Some(format!(
                    "Permission denied reading Chrome history: {}. Full Disk Access may be needed.",
                    e
                )),
            };
        }

        let result = (|| -> Result<i64, String> {
            let conn =
                Connection::open_with_flags(&temp_path, OpenFlags::SQLITE_OPEN_READ_ONLY)
                    .map_err(|e| format!("Failed to open copied database: {}", e))?;
            let count: i64 = conn
                .query_row("SELECT COUNT(*) FROM urls", [], |row| row.get(0))
                .map_err(|e| format!("Failed to query urls: {}", e))?;
            Ok(count)
        })();

        let _ = fs::remove_file(&temp_path);

        match result {
            Ok(count) => ChromeAccessStatus {
                accessible: true,
                path: primary_path.to_string_lossy().to_string(),
                exists: true,
                item_count: Some(count),
                error_message: None,
            },
            Err(e) => ChromeAccessStatus {
                accessible: false,
                path: primary_path.to_string_lossy().to_string(),
                exists: true,
                item_count: None,
                error_message: Some(e),
            },
        }
    }

    fn ingest(&self, db: &Database, force_full: bool) -> Result<IngestionStats, String> {
        let start_time = Instant::now();
        let paths = Self::get_chrome_history_paths();
        if paths.is_empty() {
            return Err("Chrome history database not found".to_string());
        }

        let marker_unix_ms = if force_full {
            0
        } else {
            db.get_ingestion_marker(self.source_id()).unwrap_or(0)
        };
        let marker_chrome_time = Self::unix_millis_to_chrome_time(marker_unix_ms);

        let mut total_items_indexed = 0;
        let mut total_visits_indexed = 0;
        let mut max_visit_time_seen = marker_unix_ms;

        for history_path in paths {
            let temp_id = format!(
                "revia_chrome_ingest_{}_{}",
                std::process::id(),
                start_time.elapsed().as_micros()
            );
            let temp_path = std::env::temp_dir().join(format!("{}.db", temp_id));

            if let Err(e) = fs::copy(&history_path, &temp_path) {
                eprintln!("Failed to copy Chrome history from {:?}: {}", history_path, e);
                continue;
            }

            let result = (|| -> Result<(usize, usize, i64), String> {
                let conn =
                    Connection::open_with_flags(&temp_path, OpenFlags::SQLITE_OPEN_READ_ONLY)
                        .map_err(|e| format!("Failed to open temp DB: {}", e))?;

                let mut stmt = conn
                    .prepare(
                        "SELECT u.id, u.url, u.title, u.visit_count, u.last_visit_time
                         FROM urls u
                         WHERE u.last_visit_time > ?1
                         ORDER BY u.last_visit_time ASC",
                    )
                    .map_err(|e| format!("Prepare query failed: {}", e))?;

                let mut rows = stmt
                    .query(params![marker_chrome_time])
                    .map_err(|e| format!("Query failed: {}", e))?;

                let mut items = Vec::new();
                let mut visits = Vec::new();
                let mut local_max_time = marker_unix_ms;

                while let Some(row) = rows.next().map_err(|e| format!("Row read failed: {}", e))? {
                    let chrome_url_id: i64 = row.get(0).unwrap_or(0);
                    let raw_url: String = row.get(1).unwrap_or_default();
                    let raw_title: String = row.get(2).unwrap_or_default();
                    let visit_count: i64 = row.get(3).unwrap_or(1);
                    let last_visit_chrome: i64 = row.get(4).unwrap_or(0);

                    // Only index valid HTTP/HTTPS URLs
                    if !raw_url.starts_with("http://") && !raw_url.starts_with("https://") {
                        continue;
                    }

                    let parsed_url = match Url::parse(&raw_url) {
                        Ok(u) => u,
                        Err(_) => continue,
                    };

                    let domain = parsed_url.host_str().unwrap_or("").to_lowercase();
                    if domain.is_empty() {
                        continue;
                    }

                    let path = parsed_url.path().to_string();
                    let last_visit_ms = Self::chrome_time_to_unix_millis(last_visit_chrome);
                    if last_visit_ms > local_max_time {
                        local_max_time = last_visit_ms;
                    }

                    let clean_title = if raw_title.trim().is_empty() {
                        format!("{} - {}", domain, path.trim_start_matches('/'))
                    } else {
                        raw_title.trim().to_string()
                    };

                    let item_id = Self::generate_item_id(&raw_url);
                    let now_ms = chrono::Utc::now().timestamp_millis();

                    let item = MemoryItem {
                        id: item_id.clone(),
                        source_id: "chrome_history".to_string(),
                        url: raw_url.clone(),
                        title: clean_title,
                        domain,
                        path,
                        visit_count,
                        last_visit_time: last_visit_ms,
                        first_visit_time: last_visit_ms,
                        relative_time: None,
                        metadata: Some(serde_json::json!({
                            "browser": "Chrome",
                            "chrome_url_id": chrome_url_id
                        })),
                        created_at: now_ms,
                        updated_at: now_ms,
                    };
                    items.push(item);

                    // Add a primary visit record
                    visits.push(MemoryVisit {
                        id: format!("visit_{}_{}", item_id, last_visit_ms),
                        item_id,
                        visit_time: last_visit_ms,
                        duration_seconds: 0,
                    });

                    // Flush in chunks of 500
                    if items.len() >= 500 {
                        db.batch_upsert_items_and_visits(&items, &visits)
                            .map_err(|e| format!("Batch upsert failed: {}", e))?;
                        items.clear();
                        visits.clear();
                    }
                }

                if !items.is_empty() {
                    db.batch_upsert_items_and_visits(&items, &visits)
                        .map_err(|e| format!("Final batch upsert failed: {}", e))?;
                }

                Ok((items.len(), visits.len(), local_max_time))
            })();

            let _ = fs::remove_file(&temp_path);

            match result {
                Ok((items_count, visits_count, local_max)) => {
                    total_items_indexed += items_count;
                    total_visits_indexed += visits_count;
                    if local_max > max_visit_time_seen {
                        max_visit_time_seen = local_max;
                    }
                }
                Err(err) => {
                    eprintln!("Error during Chrome history read: {}", err);
                }
            }
        }

        // Update ingestion watermark
        db.update_ingestion_state(
            self.source_id(),
            max_visit_time_seen,
            total_items_indexed,
            "success",
            None,
        )
        .map_err(|e| format!("Failed to update ingestion state: {}", e))?;

        let stats = db
            .get_memory_stats(false)
            .map_err(|e| format!("Failed to get stats: {}", e))?;

        Ok(IngestionStats {
            source_id: self.source_id().to_string(),
            items_indexed: total_items_indexed,
            visits_indexed: total_visits_indexed,
            duration_ms: start_time.elapsed().as_millis(),
            total_stored_items: stats.total_items as usize,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chrome_time_conversion_roundtrip() {
        let original_unix_ms = 1_700_000_000_000i64;
        let chrome_time = ChromeHistorySource::unix_millis_to_chrome_time(original_unix_ms);
        let converted_back = ChromeHistorySource::chrome_time_to_unix_millis(chrome_time);
        assert_eq!(original_unix_ms, converted_back);
    }

    #[test]
    fn test_generate_item_id_deterministic() {
        let id1 = ChromeHistorySource::generate_item_id("https://github.com/rust-lang/rust");
        let id2 = ChromeHistorySource::generate_item_id("https://github.com/rust-lang/rust");
        let id3 = ChromeHistorySource::generate_item_id("https://openai.com");
        assert_eq!(id1, id2);
        assert_ne!(id1, id3);
        assert!(id1.starts_with("chrome_"));
    }

    #[test]
    fn test_real_chrome_history_ingestion() {
        let source = ChromeHistorySource::new();
        let access = source.check_access();
        if access.accessible {
            let temp_db_path = std::env::temp_dir().join(format!(
                "revia_chrome_ingest_test_{}.db",
                std::process::id()
            ));
            let _ = fs::remove_file(&temp_db_path);

            let db = Database::new(&temp_db_path).expect("Failed to create test DB");
            let stats = source.ingest(&db, true).expect("Ingestion failed");

            assert!(
                stats.total_stored_items > 0,
                "Should have indexed real history items"
            );
            println!(
                "Successfully indexed {} items from Chrome in {}ms",
                stats.total_stored_items, stats.duration_ms
            );

            let semantic_engine = crate::search::semantic::SemanticEngine::new();
            let search_results =
                crate::search::search(&db, &semantic_engine, "instagram", 5)
                    .expect("Search failed");
            assert!(!search_results.is_empty(), "Search should return items");
            println!(
                "Found {} results for 'instagram': first result is '{}' ({})",
                search_results.len(),
                search_results[0].title,
                search_results[0].url
            );

            let empty_query_results =
                crate::search::search(&db, &semantic_engine, "", 5).expect("Empty search failed");
            assert!(
                !empty_query_results.is_empty(),
                "Empty search should return recent items"
            );
            println!("Found {} recent items", empty_query_results.len());

            let _ = fs::remove_file(&temp_db_path);
        } else {
            println!(
                "Chrome history not accessible in test environment (access: {:?})",
                access
            );
        }
    }

    #[test]
    fn test_populate_canonical_db() {
        let default_path = Database::default_path();
        if let Ok(db) = Database::new(&default_path) {
            let source = ChromeHistorySource::new();
            if source.check_access().accessible {
                let _ = source.ingest(&db, false);
                let stats = db.get_memory_stats(false).unwrap();
                println!("Canonical DB populated: {} items", stats.total_items);
            }
        }
    }
}
