use fastembed::{EmbeddingModel, InitOptions, TextEmbedding};
use rusqlite::{params, Connection, Result as SqlResult};
use std::sync::{Arc, Mutex};

pub struct SemanticEngine {
    model: Mutex<Option<TextEmbedding>>,
    is_initializing: Mutex<bool>,
}

impl SemanticEngine {
    pub fn new() -> Arc<Self> {
        let engine = Arc::new(Self {
            model: Mutex::new(None),
            is_initializing: Mutex::new(false),
        });

        // Initialize model in background to avoid blocking app startup
        let engine_clone = Arc::clone(&engine);
        std::thread::spawn(move || {
            engine_clone.init_model();
        });

        engine
    }

    pub fn new_empty() -> Arc<Self> {
        Arc::new(Self {
            model: Mutex::new(None),
            is_initializing: Mutex::new(false),
        })
    }

    fn init_model(&self) {
        {
            let mut init_flag = self.is_initializing.lock().unwrap();
            if *init_flag {
                return;
            }
            *init_flag = true;
        }

        println!("Initializing local semantic embedding model (AllMiniLML6V2Q)...");
        let mut options = InitOptions::default();
        options.model_name = EmbeddingModel::AllMiniLML6V2Q;
        options.show_download_progress = false;

        match TextEmbedding::try_new(options) {
            Ok(embed_model) => {
                let mut guard = self.model.lock().unwrap();
                *guard = Some(embed_model);
                println!("Semantic embedding model initialized successfully.");
            }
            Err(e) => {
                eprintln!("Warning: Failed to load FastEmbed model (will use keyword fallback): {}", e);
            }
        }

        let mut init_flag = self.is_initializing.lock().unwrap();
        *init_flag = false;
    }

    pub fn is_ready(&self) -> bool {
        self.model.lock().unwrap().is_some()
    }

    pub fn generate_embedding(&self, text: &str) -> Option<Vec<f32>> {
        let clean = text.trim();
        if clean.is_empty() {
            return None;
        }

        let mut guard = self.model.lock().unwrap();
        if let Some(ref mut model) = *guard {
            if let Ok(embeddings) = model.embed(vec![clean], None) {
                if let Some(first) = embeddings.into_iter().next() {
                    return Some(first);
                }
            }
        }
        None
    }

    pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
        if a.len() != b.len() || a.is_empty() {
            return 0.0;
        }

        let mut dot = 0.0f32;
        let mut norm_a = 0.0f32;
        let mut norm_b = 0.0f32;

        for (x, y) in a.iter().zip(b.iter()) {
            dot += x * y;
            norm_a += x * x;
            norm_b += y * y;
        }

        if norm_a <= 0.0 || norm_b <= 0.0 {
            return 0.0;
        }

        (dot / (norm_a.sqrt() * norm_b.sqrt())).max(0.0).min(1.0)
    }

    pub fn serialize_embedding(vec: &[f32]) -> Vec<u8> {
        let mut bytes = Vec::with_capacity(vec.len() * 4);
        for &val in vec {
            bytes.extend_from_slice(&val.to_le_bytes());
        }
        bytes
    }

    pub fn deserialize_embedding(bytes: &[u8]) -> Vec<f32> {
        let mut vec = Vec::with_capacity(bytes.len() / 4);
        for chunk in bytes.chunks_exact(4) {
            let val = f32::from_le_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]);
            vec.push(val);
        }
        vec
    }
}

// Database embedding storage helpers
pub fn store_embedding(
    conn: &Connection,
    item_id: &str,
    embedding: &[f32],
    model_version: &str,
) -> SqlResult<()> {
    let bytes = SemanticEngine::serialize_embedding(embedding);
    let now = chrono::Utc::now().timestamp_millis();

    conn.execute(
        "INSERT INTO memory_embeddings (item_id, embedding, model_version, created_at)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(item_id) DO UPDATE SET
             embedding = excluded.embedding,
             model_version = excluded.model_version,
             created_at = excluded.created_at",
        params![item_id, bytes, model_version, now],
    )?;

    Ok(())
}

pub fn get_unembedded_items(conn: &Connection, limit: usize) -> SqlResult<Vec<(String, String, String)>> {
    let mut stmt = conn.prepare(
        "SELECT i.id, i.title, i.domain
         FROM memory_items i
         LEFT JOIN memory_embeddings e ON i.id = e.item_id
         WHERE e.item_id IS NULL
         LIMIT ?1"
    )?;

    let rows = stmt.query_map(params![limit as i64], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    })?;

    let mut items = Vec::new();
    for r in rows {
        if let Ok(item) = r {
            items.push(item);
        }
    }
    Ok(items)
}

pub fn get_all_embeddings(conn: &Connection) -> SqlResult<Vec<(String, Vec<f32>)>> {
    let mut stmt = conn.prepare("SELECT item_id, embedding FROM memory_embeddings")?;
    let rows = stmt.query_map([], |row| {
        let id: String = row.get(0)?;
        let bytes: Vec<u8> = row.get(1)?;
        let vec = SemanticEngine::deserialize_embedding(&bytes);
        Ok((id, vec))
    })?;

    let mut list = Vec::new();
    for r in rows {
        if let Ok(item) = r {
            list.push(item);
        }
    }
    Ok(list)
}
