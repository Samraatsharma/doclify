use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryItem {
    pub id: String,
    pub source_id: String,
    pub url: String,
    pub title: String,
    pub domain: String,
    pub path: String,
    pub visit_count: i64,
    pub last_visit_time: i64,      // Unix timestamp in milliseconds
    pub first_visit_time: i64,     // Unix timestamp in milliseconds
    pub relative_time: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryVisit {
    pub id: String,
    pub item_id: String,
    pub visit_time: i64,
    pub duration_seconds: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySource {
    pub id: String,
    pub source_type: String,
    pub name: String,
    pub enabled: bool,
    pub config_json: Option<String>,
    pub last_ingested_at: Option<i64>,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IngestionStats {
    pub source_id: String,
    pub items_indexed: usize,
    pub visits_indexed: usize,
    pub duration_ms: u128,
    pub total_stored_items: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryStats {
    pub total_items: i64,
    pub total_visits: i64,
    pub last_ingested_at: Option<i64>,
    pub is_paused: bool,
    pub database_path: String,
    pub database_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChromeAccessStatus {
    pub accessible: bool,
    pub path: String,
    pub exists: bool,
    pub item_count: Option<i64>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResultItem {
    pub item: MemoryItem,
    pub score: f64,
    pub matched_terms: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserAccount {
    pub id: String,
    pub email: String,
    pub name: Option<String>,
    pub avatar_url: Option<String>,
    pub google_id: Option<String>,
    pub signed_in_at: i64,
}
