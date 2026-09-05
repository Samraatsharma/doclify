pub mod models;
pub mod schema;

use models::{MemoryItem, MemoryStats, MemoryVisit};
use rusqlite::{params, Connection, Result};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

pub struct Database {
    conn: Mutex<Connection>,
    pub db_path: PathBuf,
}

impl Database {
    pub fn new(path: &Path) -> Result<Self> {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        let conn = Connection::open(path)?;
        let _: String = conn.query_row("PRAGMA journal_mode = WAL", [], |row| row.get(0))?;
        conn.pragma_update(None, "foreign_keys", "ON")?;
        conn.pragma_update(None, "synchronous", "NORMAL")?;

        schema::run_migrations(&conn)?;

        Ok(Self {
            conn: Mutex::new(conn),
            db_path: path.to_path_buf(),
        })
    }

    pub fn default_path() -> PathBuf {
        if let Some(mut data_dir) = dirs::data_dir() {
            data_dir.push("com.revia.app");
            data_dir.push("revia.db");
            data_dir
        } else {
            PathBuf::from("revia.db")
        }
    }

    pub fn get_memory_stats(&self, is_paused: bool) -> Result<MemoryStats> {
        let conn = self.conn.lock().unwrap();

        let total_items: i64 = conn.query_row(
            "SELECT COUNT(*) FROM memory_items",
            [],
            |row| row.get(0),
        ).unwrap_or(0);

        let total_visits: i64 = conn.query_row(
            "SELECT COUNT(*) FROM memory_visits",
            [],
            |row| row.get(0),
        ).unwrap_or(0);

        let last_ingested_at: Option<i64> = conn.query_row(
            "SELECT MAX(last_ingested_at) FROM memory_sources",
            [],
            |row| row.get(0),
        ).ok();

        let size_bytes = fs::metadata(&self.db_path)
            .map(|m| m.len())
            .unwrap_or(0);

        Ok(MemoryStats {
            total_items,
            total_visits,
            last_ingested_at,
            is_paused,
            database_path: self.db_path.to_string_lossy().to_string(),
            database_size_bytes: size_bytes,
        })
    }

    pub fn get_ingestion_marker(&self, source_id: &str) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        let marker: Option<i64> = conn.query_row(
            "SELECT last_visit_time_marker FROM ingestion_state WHERE source_id = ?1",
            params![source_id],
            |row| row.get(0),
        ).ok();
        Ok(marker.unwrap_or(0))
    }

    pub fn update_ingestion_state(
        &self,
        source_id: &str,
        marker: i64,
        items_count: usize,
        status: &str,
        error_msg: Option<&str>,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().timestamp_millis();

        conn.execute(
            "INSERT INTO ingestion_state (source_id, last_visit_time_marker, total_items_indexed, last_status, last_error, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(source_id) DO UPDATE SET
                last_visit_time_marker = MAX(last_visit_time_marker, ?2),
                total_items_indexed = total_items_indexed + ?3,
                last_status = ?4,
                last_error = ?5,
                updated_at = ?6;",
            params![source_id, marker, items_count as i64, status, error_msg, now],
        )?;

        conn.execute(
            "UPDATE memory_sources SET last_ingested_at = ?1 WHERE id = ?2;",
            params![now, source_id],
        )?;

        Ok(())
    }

    pub fn clear_memory(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "DELETE FROM memory_visits;
             DELETE FROM memory_items;
             DELETE FROM memory_embeddings;
             DELETE FROM ingestion_state;
             UPDATE memory_sources SET last_ingested_at = NULL;
             -- Clear FTS5 virtual table
             DELETE FROM memory_items_fts;
             VACUUM;"
        )?;
        Ok(())
    }

    pub fn get_item_by_id(&self, id: &str) -> Result<Option<MemoryItem>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, source_id, url, title, domain, path, visit_count,
                    last_visit_time, first_visit_time, metadata_json, created_at, updated_at
             FROM memory_items WHERE id = ?1"
        )?;
        let mut rows = stmt.query_map(params![id], |row| {
            let meta_str: Option<String> = row.get(9)?;
            let metadata = meta_str.and_then(|s| serde_json::from_str(&s).ok());
            Ok(MemoryItem {
                id: row.get(0)?,
                source_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                domain: row.get(4)?,
                path: row.get(5)?,
                visit_count: row.get(6)?,
                last_visit_time: row.get(7)?,
                first_visit_time: row.get(8)?,
                relative_time: None,
                metadata,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })?;

        if let Some(res) = rows.next() {
            Ok(Some(res?))
        } else {
            Ok(None)
        }
    }

    pub fn with_conn<F, R>(&self, f: F) -> Result<R>
    where
        F: FnOnce(&Connection) -> Result<R>,
    {
        let conn = self.conn.lock().unwrap();
        f(&conn)
    }


    pub fn get_setting(&self, key: &str) -> Result<Option<String>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT value FROM app_settings WHERE key = ?1")?;
        let res = stmt.query_row(params![key], |row| row.get(0)).ok();
        Ok(res)
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().timestamp_millis();
        conn.execute(
            "INSERT INTO app_settings (key, value, updated_at)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = ?3;",
            params![key, value, now],
        )?;
        Ok(())
    }

    pub fn batch_upsert_items_and_visits(
        &self,
        items: &[MemoryItem],
        visits: &[MemoryVisit],
    ) -> Result<()> {
        let mut conn = self.conn.lock().unwrap();
        let tx = conn.transaction()?;

        {
            let mut item_stmt = tx.prepare(
                "INSERT INTO memory_items (
                    id, source_id, url, title, domain, path, visit_count,
                    last_visit_time, first_visit_time, metadata_json, created_at, updated_at
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
                ON CONFLICT(url) DO UPDATE SET
                    title = CASE WHEN length(excluded.title) > 0 THEN excluded.title ELSE memory_items.title END,
                    visit_count = memory_items.visit_count + excluded.visit_count,
                    last_visit_time = MAX(memory_items.last_visit_time, excluded.last_visit_time),
                    first_visit_time = MIN(memory_items.first_visit_time, excluded.first_visit_time),
                    updated_at = excluded.updated_at;"
            )?;

            for item in items {
                let meta_str = item.metadata.as_ref().map(|m| m.to_string());
                item_stmt.execute(params![
                    item.id,
                    item.source_id,
                    item.url,
                    item.title,
                    item.domain,
                    item.path,
                    item.visit_count,
                    item.last_visit_time,
                    item.first_visit_time,
                    meta_str,
                    item.created_at,
                    item.updated_at,
                ])?;
            }
        }

        {
            let mut visit_stmt = tx.prepare(
                "INSERT OR IGNORE INTO memory_visits (id, item_id, visit_time, duration_seconds)
                 VALUES (?1, ?2, ?3, ?4);"
            )?;

            for visit in visits {
                visit_stmt.execute(params![
                    visit.id,
                    visit.item_id,
                    visit.visit_time,
                    visit.duration_seconds,
                ])?;
            }
        }

        tx.commit()?;
        Ok(())
    }

    pub fn get_recent_items(&self, limit: usize) -> Result<Vec<MemoryItem>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, source_id, url, title, domain, path, visit_count,
                    last_visit_time, first_visit_time, metadata_json, created_at, updated_at
             FROM memory_items
             ORDER BY last_visit_time DESC
             LIMIT ?1"
        )?;

        let rows = stmt.query_map(params![limit as i64], |row| {
            let meta_str: Option<String> = row.get(9)?;
            let metadata = meta_str.and_then(|s| serde_json::from_str(&s).ok());
            Ok(MemoryItem {
                id: row.get(0)?,
                source_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                domain: row.get(4)?,
                path: row.get(5)?,
                visit_count: row.get(6)?,
                last_visit_time: row.get(7)?,
                first_visit_time: row.get(8)?,
                relative_time: None,
                metadata,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })?;

        let mut items = Vec::new();
        for item in rows {
            items.push(item?);
        }
        Ok(items)
    }

    pub fn search_fts(
        &self,
        fts_query: &str,
        start_time: Option<i64>,
        end_time: Option<i64>,
        limit: usize,
    ) -> Result<Vec<MemoryItem>> {
        let conn = self.conn.lock().unwrap();

        let mut sql = String::from(
            "SELECT m.id, m.source_id, m.url, m.title, m.domain, m.path, m.visit_count,
                    m.last_visit_time, m.first_visit_time, m.metadata_json, m.created_at, m.updated_at
             FROM memory_items m
             JOIN memory_items_fts f ON m.rowid = f.rowid
             WHERE memory_items_fts MATCH ?1"
        );

        if start_time.is_some() {
            sql.push_str(" AND m.last_visit_time >= ?2");
        }
        if end_time.is_some() {
            sql.push_str(" AND m.last_visit_time <= ?3");
        }

        sql.push_str(" ORDER BY bm25(memory_items_fts, 10.0, 5.0, 2.0, 1.0) ASC, m.last_visit_time DESC LIMIT ?4");

        let mut stmt = conn.prepare(&sql)?;

        let start_val = start_time.unwrap_or(0);
        let end_val = end_time.unwrap_or(i64::MAX);

        let rows = stmt.query_map(params![fts_query, start_val, end_val, limit as i64], |row| {
            let meta_str: Option<String> = row.get(9)?;
            let metadata = meta_str.and_then(|s| serde_json::from_str(&s).ok());
            Ok(MemoryItem {
                id: row.get(0)?,
                source_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                domain: row.get(4)?,
                path: row.get(5)?,
                visit_count: row.get(6)?,
                last_visit_time: row.get(7)?,
                first_visit_time: row.get(8)?,
                relative_time: None,
                metadata,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })?;

        let mut items = Vec::new();
        for item in rows {
            items.push(item?);
        }
        Ok(items)
    }

    pub fn search_fallback_like(
        &self,
        keywords: &[String],
        start_time: Option<i64>,
        end_time: Option<i64>,
        limit: usize,
    ) -> Result<Vec<MemoryItem>> {
        let conn = self.conn.lock().unwrap();

        // When no keywords, return recent items using the ALREADY HELD conn lock.
        // CRITICAL: Do NOT call self.get_recent_items() here — that method also
        // tries to acquire self.conn.lock(), causing a Mutex deadlock / crash.
        if keywords.is_empty() {
            let mut time_filter = String::new();
            let mut time_params: Vec<rusqlite::types::Value> = Vec::new();
            if let Some(st) = start_time {
                time_filter.push_str(" WHERE last_visit_time >= ?");
                time_params.push(st.into());
            }
            if let Some(et) = end_time {
                if time_filter.is_empty() {
                    time_filter.push_str(" WHERE last_visit_time <= ?");
                } else {
                    time_filter.push_str(" AND last_visit_time <= ?");
                }
                time_params.push(et.into());
            }
            time_params.push((limit as i64).into());

            let sql = format!(
                "SELECT id, source_id, url, title, domain, path, visit_count,
                        last_visit_time, first_visit_time, metadata_json, created_at, updated_at
                 FROM memory_items{}
                 ORDER BY last_visit_time DESC
                 LIMIT ?",
                time_filter
            );
            let mut stmt = conn.prepare(&sql)?;
            let rows = stmt.query_map(rusqlite::params_from_iter(time_params.iter()), |row| {
                let meta_str: Option<String> = row.get(9)?;
                let metadata = meta_str.and_then(|s| serde_json::from_str(&s).ok());
                Ok(MemoryItem {
                    id: row.get(0)?,
                    source_id: row.get(1)?,
                    url: row.get(2)?,
                    title: row.get(3)?,
                    domain: row.get(4)?,
                    path: row.get(5)?,
                    visit_count: row.get(6)?,
                    last_visit_time: row.get(7)?,
                    first_visit_time: row.get(8)?,
                    relative_time: None,
                    metadata,
                    created_at: row.get(10)?,
                    updated_at: row.get(11)?,
                })
            })?;
            let mut items = Vec::new();
            for item in rows {
                items.push(item?);
            }
            return Ok(items);
        }

        let mut conditions = Vec::new();
        let mut query_params: Vec<rusqlite::types::Value> = Vec::new();

        for kw in keywords {
            let pattern = format!("%{}%", kw);
            conditions.push("(LOWER(title) LIKE ? OR LOWER(domain) LIKE ? OR LOWER(url) LIKE ?)");
            query_params.push(pattern.clone().into());
            query_params.push(pattern.clone().into());
            query_params.push(pattern.into());
        }

        let mut sql = format!(
            "SELECT id, source_id, url, title, domain, path, visit_count,
                    last_visit_time, first_visit_time, metadata_json, created_at, updated_at
             FROM memory_items
             WHERE ({})",
            conditions.join(" AND ")
        );

        if let Some(st) = start_time {
            sql.push_str(" AND last_visit_time >= ?");
            query_params.push(st.into());
        }
        if let Some(et) = end_time {
            sql.push_str(" AND last_visit_time <= ?");
            query_params.push(et.into());
        }

        sql.push_str(" ORDER BY last_visit_time DESC LIMIT ?");
        query_params.push((limit as i64).into());

        let mut stmt = conn.prepare(&sql)?;
        let rows = stmt.query_map(rusqlite::params_from_iter(query_params.iter()), |row| {
            let meta_str: Option<String> = row.get(9)?;
            let metadata = meta_str.and_then(|s| serde_json::from_str(&s).ok());
            Ok(MemoryItem {
                id: row.get(0)?,
                source_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                domain: row.get(4)?,
                path: row.get(5)?,
                visit_count: row.get(6)?,
                last_visit_time: row.get(7)?,
                first_visit_time: row.get(8)?,
                relative_time: None,
                metadata,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })?;

        let mut items = Vec::new();
        for item in rows {
            items.push(item?);
        }
        Ok(items)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_db_lifecycle_and_search() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("revia_test_{}.db", std::process::id()));
        let _ = fs::remove_file(&db_path);

        let db = Database::new(&db_path).expect("Failed to create test DB");

        // Insert test memory item
        let now = chrono::Utc::now().timestamp_millis();
        let item = MemoryItem {
            id: "chrome_test1".to_string(),
            source_id: "chrome_history".to_string(),
            url: "https://github.com/rust-lang/rust".to_string(),
            title: "GitHub - rust-lang/rust: Empowering everyone to build reliable and efficient software".to_string(),
            domain: "github.com".to_string(),
            path: "/rust-lang/rust".to_string(),
            visit_count: 5,
            last_visit_time: now,
            first_visit_time: now - 3600_000,
            relative_time: None,
            metadata: None,
            created_at: now,
            updated_at: now,
        };

        let visit = MemoryVisit {
            id: "visit_test1".to_string(),
            item_id: "chrome_test1".to_string(),
            visit_time: now,
            duration_seconds: 45,
        };

        db.batch_upsert_items_and_visits(&[item], &[visit]).expect("Batch upsert failed");

        // Verify stats
        let stats = db.get_memory_stats(false).expect("Get stats failed");
        assert_eq!(stats.total_items, 1);
        assert_eq!(stats.total_visits, 1);

        // Verify FTS5 search
        let results = db.search_fts("\"rust\"*", None, None, 10).expect("FTS search failed");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].domain, "github.com");

        // Verify clear memory
        db.clear_memory().expect("Clear memory failed");
        let stats_after = db.get_memory_stats(false).expect("Get stats after clear failed");
        assert_eq!(stats_after.total_items, 0);
        assert_eq!(stats_after.total_visits, 0);

        let _ = fs::remove_file(&db_path);
    }
}
