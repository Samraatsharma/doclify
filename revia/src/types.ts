export interface MemoryItem {
  id: string;
  source_id: string;
  url: string;
  title: string;
  domain: string;
  path: string;
  visit_count: number;
  last_visit_time: number;
  first_visit_time: number;
  relative_time?: string;
  metadata?: Record<string, any>;
  created_at: number;
  updated_at: number;
}

export interface MemoryStats {
  total_items: number;
  total_visits: number;
  last_ingested_at: number | null;
  is_paused: boolean;
  database_path: string;
  database_size_bytes: number;
}

export interface AppSettings {
  launch_at_login: boolean;
  global_shortcut: string;
  max_results: number;
  is_paused: boolean;
  has_completed_onboarding: boolean;
  last_sync_timestamp: number | null;
}

export interface IngestionStats {
  source_id: string;
  items_indexed: number;
  visits_indexed: number;
  duration_ms: number;
  total_stored_items: number;
}

export interface ChromeAccessStatus {
  accessible: boolean;
  path: string;
  exists: boolean;
  item_count: number | null;
  error_message: string | null;
}
