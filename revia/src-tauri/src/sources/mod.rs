pub mod chrome;

use crate::db::models::{ChromeAccessStatus, IngestionStats};
use crate::db::Database;

pub trait MemorySourceTrait: Send + Sync {
    fn source_id(&self) -> &str;
    fn source_name(&self) -> &str;
    fn check_access(&self) -> ChromeAccessStatus;
    fn ingest(&self, db: &Database, force_full: bool) -> Result<IngestionStats, String>;
}
