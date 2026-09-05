use rusqlite::{Connection, Result};

pub const CURRENT_SCHEMA_VERSION: i32 = 2;

pub fn run_migrations(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL
        );"
    )?;

    let mut stmt = conn.prepare("SELECT COALESCE(MAX(version), 0) FROM schema_migrations")?;
    let current_version: i32 = stmt.query_row([], |row| row.get(0)).unwrap_or(0);

    if current_version < 1 {
        apply_migration_v1(conn)?;
    }

    if current_version < 2 {
        apply_migration_v2(conn)?;
    }

    Ok(())
}

fn apply_migration_v1(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "
        -- Memory sources table (extensible for Chrome, Safari, Files, etc.)
        CREATE TABLE IF NOT EXISTS memory_sources (
            id TEXT PRIMARY KEY,
            source_type TEXT NOT NULL,
            name TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 1,
            config_json TEXT,
            last_ingested_at INTEGER,
            created_at INTEGER NOT NULL
        );

        -- Memory items table
        CREATE TABLE IF NOT EXISTS memory_items (
            id TEXT PRIMARY KEY,
            source_id TEXT NOT NULL REFERENCES memory_sources(id),
            url TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            domain TEXT NOT NULL,
            path TEXT NOT NULL DEFAULT '',
            visit_count INTEGER NOT NULL DEFAULT 1,
            last_visit_time INTEGER NOT NULL,
            first_visit_time INTEGER NOT NULL,
            metadata_json TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );

        -- Indexes for memory_items
        CREATE INDEX IF NOT EXISTS idx_memory_items_source ON memory_items(source_id);
        CREATE INDEX IF NOT EXISTS idx_memory_items_domain ON memory_items(domain);
        CREATE INDEX IF NOT EXISTS idx_memory_items_last_visit ON memory_items(last_visit_time DESC);
        CREATE INDEX IF NOT EXISTS idx_memory_items_visit_count ON memory_items(visit_count DESC);

        -- Memory visits log
        CREATE TABLE IF NOT EXISTS memory_visits (
            id TEXT PRIMARY KEY,
            item_id TEXT NOT NULL REFERENCES memory_items(id) ON DELETE CASCADE,
            visit_time INTEGER NOT NULL,
            duration_seconds INTEGER DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_memory_visits_item ON memory_visits(item_id);
        CREATE INDEX IF NOT EXISTS idx_memory_visits_time ON memory_visits(visit_time DESC);

        -- Incremental ingestion tracking
        CREATE TABLE IF NOT EXISTS ingestion_state (
            source_id TEXT PRIMARY KEY,
            last_visit_time_marker INTEGER NOT NULL DEFAULT 0,
            total_items_indexed INTEGER NOT NULL DEFAULT 0,
            last_status TEXT NOT NULL DEFAULT 'idle',
            last_error TEXT,
            updated_at INTEGER NOT NULL
        );

        -- Key-value settings table
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        );

        -- FTS5 Full Text Search Virtual Table
        CREATE VIRTUAL TABLE IF NOT EXISTS memory_items_fts USING fts5(
            title,
            domain,
            path,
            url,
            content='memory_items',
            content_rowid='rowid',
            tokenize='porter unicode61'
        );

        -- FTS synchronization triggers
        CREATE TRIGGER IF NOT EXISTS memory_items_ai AFTER INSERT ON memory_items BEGIN
            INSERT INTO memory_items_fts(rowid, title, domain, path, url)
            VALUES (new.rowid, new.title, new.domain, new.path, new.url);
        END;

        CREATE TRIGGER IF NOT EXISTS memory_items_ad AFTER DELETE ON memory_items BEGIN
            INSERT INTO memory_items_fts(memory_items_fts, rowid, title, domain, path, url)
            VALUES('delete', old.rowid, old.title, old.domain, old.path, old.url);
        END;

        CREATE TRIGGER IF NOT EXISTS memory_items_au AFTER UPDATE ON memory_items BEGIN
            INSERT INTO memory_items_fts(memory_items_fts, rowid, title, domain, path, url)
            VALUES('delete', old.rowid, old.title, old.domain, old.path, old.url);
            INSERT INTO memory_items_fts(rowid, title, domain, path, url)
            VALUES (new.rowid, new.title, new.domain, new.path, new.url);
        END;

        -- Record initial source: chrome_history
        INSERT OR IGNORE INTO memory_sources (id, source_type, name, enabled, created_at)
        VALUES ('chrome_history', 'browser_history', 'Google Chrome', 1, strftime('%s', 'now') * 1000);

        -- Record migration completion
        INSERT INTO schema_migrations (version, applied_at)
        VALUES (1, datetime('now'));
        "
    )?;

    Ok(())
}

fn apply_migration_v2(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS memory_embeddings (
            item_id TEXT PRIMARY KEY REFERENCES memory_items(id) ON DELETE CASCADE,
            embedding BLOB NOT NULL,
            model_version TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_embeddings_model ON memory_embeddings(model_version);

        INSERT INTO schema_migrations (version, applied_at)
        VALUES (2, datetime('now'));
        "
    )?;

    Ok(())
}

