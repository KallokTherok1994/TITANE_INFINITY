//! ═══════════════════════════════════════════════════════════════════════════
//!   TITANE∞ v19.5.2 — VECTOR STORE API (Backend Rust)
//!   Migration from TypeScript SQLiteVectorStore to Rust
//!   
//!   Features:
//!   - SQLite-based vector storage
//!   - Cosine similarity search
//!   - CRUD operations on embeddings
//!   - Multi-tier memory support
//!   - Thread-safe operations
//! ═══════════════════════════════════════════════════════════════════════════

use ndarray::Array1;
use parking_lot::RwLock;
use rusqlite::{params, Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorStoreConfig {
    pub db_path: String,
    pub table_name: String,
    pub dimensions: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorEntry {
    pub id: String,
    pub tier: String,
    #[serde(rename = "type")]
    pub entry_type: String,
    pub summary: String,
    pub details: Option<String>,
    pub embedding: Vec<f32>,
    pub owner: String,
    pub tags: Vec<String>,
    pub source_type: String,
    pub source_id: Option<String>,
    pub source_timestamp: i64,
    pub importance: f32,
    pub access_count: u32,
    pub created_at: i64,
    pub updated_at: i64,
    pub last_accessed: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub entry: VectorEntry,
    pub score: f32,
    pub distance: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorStoreStats {
    pub total_entries: u32,
    pub by_tier: std::collections::HashMap<String, u32>,
    pub by_type: std::collections::HashMap<String, u32>,
    pub avg_importance: f32,
    pub db_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchOptions {
    pub top_k: Option<usize>,
    pub min_score: Option<f32>,
    pub tier_filter: Option<Vec<String>>,
    pub type_filter: Option<Vec<String>>,
    pub owner_filter: Option<String>,
}

// ═══════════════════════════════════════════════════════════════════════════
// VECTOR STORE
// ═══════════════════════════════════════════════════════════════════════════

pub struct VectorStore {
    conn: Arc<RwLock<Connection>>,
    config: VectorStoreConfig,
}

impl VectorStore {
    /// Create or open vector store
    pub fn new(config: VectorStoreConfig) -> Result<Self, String> {
        // Ensure parent directory exists
        if let Some(parent) = PathBuf::from(&config.db_path).parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create database directory: {}", e))?;
        }

        // Open connection
        let conn = Connection::open(&config.db_path)
            .map_err(|e| format!("Failed to open database: {}", e))?;

        // Enable WAL mode for better performance
        conn.execute("PRAGMA journal_mode = WAL", [])
            .map_err(|e| format!("Failed to enable WAL mode: {}", e))?;
        conn.execute("PRAGMA synchronous = NORMAL", [])
            .map_err(|e| format!("Failed to set synchronous mode: {}", e))?;
        conn.execute("PRAGMA cache_size = -64000", [])
            .map_err(|e| format!("Failed to set cache size: {}", e))?;

        let store = Self {
            conn: Arc::new(RwLock::new(conn)),
            config,
        };

        // Create tables
        store.create_tables()?;
        store.create_indexes()?;

        Ok(store)
    }

    /// Create database tables
    fn create_tables(&self) -> Result<(), String> {
        let conn = self.conn.write();

        let sql = format!(
            r#"
            CREATE TABLE IF NOT EXISTS {} (
                id TEXT PRIMARY KEY,
                tier TEXT NOT NULL,
                type TEXT NOT NULL,
                summary TEXT NOT NULL,
                details TEXT,
                embedding BLOB NOT NULL,
                owner TEXT NOT NULL,
                tags TEXT NOT NULL,
                source_type TEXT NOT NULL,
                source_id TEXT,
                source_timestamp INTEGER NOT NULL,
                importance REAL NOT NULL,
                access_count INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                last_accessed INTEGER NOT NULL
            )
            "#,
            self.config.table_name
        );

        conn.execute(&sql, [])
            .map_err(|e| format!("Failed to create table: {}", e))?;

        Ok(())
    }

    /// Create indexes for performance
    fn create_indexes(&self) -> Result<(), String> {
        let conn = self.conn.write();
        let table = &self.config.table_name;

        let indexes = vec![
            format!(
                "CREATE INDEX IF NOT EXISTS idx_{}_tier ON {} (tier)",
                table, table
            ),
            format!(
                "CREATE INDEX IF NOT EXISTS idx_{}_type ON {} (type)",
                table, table
            ),
            format!(
                "CREATE INDEX IF NOT EXISTS idx_{}_owner ON {} (owner)",
                table, table
            ),
            format!(
                "CREATE INDEX IF NOT EXISTS idx_{}_importance ON {} (importance DESC)",
                table, table
            ),
            format!(
                "CREATE INDEX IF NOT EXISTS idx_{}_created ON {} (created_at DESC)",
                table, table
            ),
        ];

        for index_sql in indexes {
            conn.execute(&index_sql, [])
                .map_err(|e| format!("Failed to create index: {}", e))?;
        }

        Ok(())
    }

    /// Insert vector entry
    pub fn insert(&self, entry: &VectorEntry) -> Result<(), String> {
        let conn = self.conn.write();

        // Serialize embedding to bytes
        let embedding_bytes = Self::serialize_embedding(&entry.embedding)?;
        let tags_json = serde_json::to_string(&entry.tags)
            .map_err(|e| format!("Failed to serialize tags: {}", e))?;

        let sql = format!(
            r#"
            INSERT OR REPLACE INTO {} 
            (id, tier, type, summary, details, embedding, owner, tags, 
             source_type, source_id, source_timestamp, importance, 
             access_count, created_at, updated_at, last_accessed)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)
            "#,
            self.config.table_name
        );

        conn.execute(
            &sql,
            params![
                entry.id,
                entry.tier,
                entry.entry_type,
                entry.summary,
                entry.details,
                embedding_bytes,
                entry.owner,
                tags_json,
                entry.source_type,
                entry.source_id,
                entry.source_timestamp,
                entry.importance,
                entry.access_count,
                entry.created_at,
                entry.updated_at,
                entry.last_accessed,
            ],
        )
        .map_err(|e| format!("Failed to insert entry: {}", e))?;

        Ok(())
    }

    /// Search vectors by similarity
    pub fn search(
        &self,
        query_embedding: &[f32],
        options: SearchOptions,
    ) -> Result<Vec<SearchResult>, String> {
        let conn = self.conn.write();
        let top_k = options.top_k.unwrap_or(10);
        let min_score = options.min_score.unwrap_or(0.0);

        // Build WHERE clause
        let mut where_clauses = Vec::new();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(tiers) = &options.tier_filter {
            let placeholders = vec!["?"; tiers.len()].join(",");
            where_clauses.push(format!("tier IN ({})", placeholders));
            for tier in tiers {
                params.push(Box::new(tier.clone()));
            }
        }

        if let Some(types) = &options.type_filter {
            let placeholders = vec!["?"; types.len()].join(",");
            where_clauses.push(format!("type IN ({})", placeholders));
            for t in types {
                params.push(Box::new(t.clone()));
            }
        }

        if let Some(owner) = &options.owner_filter {
            where_clauses.push("owner = ?".to_string());
            params.push(Box::new(owner.clone()));
        }

        let where_sql = if where_clauses.is_empty() {
            String::new()
        } else {
            format!("WHERE {}", where_clauses.join(" AND "))
        };

        let sql = format!("SELECT * FROM {} {}", self.config.table_name, where_sql);

        let mut stmt = conn
            .prepare(&sql)
            .map_err(|e| format!("Failed to prepare statement: {}", e))?;

        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();

        let rows = stmt
            .query_map(param_refs.as_slice(), |row| {
                Ok((
                    self.row_to_entry(row)?,
                    row.get::<_, Vec<u8>>(5)?, // embedding bytes
                ))
            })
            .map_err(|e| format!("Failed to query: {}", e))?;

        // Calculate similarities
        let mut results = Vec::new();
        for row_result in rows {
            let (entry, embedding_bytes) =
                row_result.map_err(|e| format!("Failed to read row: {}", e))?;

            let embedding = Self::deserialize_embedding(&embedding_bytes)?;
            let score = Self::cosine_similarity(query_embedding, &embedding);

            if score >= min_score {
                results.push(SearchResult {
                    entry,
                    score,
                    distance: 1.0 - score,
                });
            }
        }

        // Sort by score descending
        results.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        results.truncate(top_k);

        Ok(results)
    }

    /// Get entry by ID
    pub fn get(&self, id: &str) -> Result<Option<VectorEntry>, String> {
        let conn = self.conn.read();

        let sql = format!("SELECT * FROM {} WHERE id = ?1", self.config.table_name);

        let mut stmt = conn
            .prepare(&sql)
            .map_err(|e| format!("Failed to prepare statement: {}", e))?;

        let result = stmt.query_row([id], |row| self.row_to_entry(row));

        match result {
            Ok(entry) => Ok(Some(entry)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("Failed to get entry: {}", e)),
        }
    }

    /// Update entry fields
    pub fn update(&self, id: &str, updates: serde_json::Value) -> Result<(), String> {
        let conn = self.conn.write();

        // Build UPDATE clause dynamically
        let mut set_clauses = Vec::new();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(obj) = updates.as_object() {
            for (key, value) in obj {
                match key.as_str() {
                    "importance" => {
                        set_clauses.push("importance = ?");
                        params.push(Box::new(value.as_f64().unwrap_or(0.0) as f32));
                    }
                    "access_count" => {
                        set_clauses.push("access_count = ?");
                        params.push(Box::new(value.as_i64().unwrap_or(0) as u32));
                    }
                    "summary" => {
                        set_clauses.push("summary = ?");
                        params.push(Box::new(value.as_str().unwrap_or("").to_string()));
                    }
                    "details" => {
                        set_clauses.push("details = ?");
                        params.push(Box::new(value.as_str().map(|s| s.to_string())));
                    }
                    _ => {}
                }
            }
        }

        if set_clauses.is_empty() {
            return Ok(());
        }

        set_clauses.push("updated_at = ?");
        params.push(Box::new(chrono::Utc::now().timestamp()));

        let sql = format!(
            "UPDATE {} SET {} WHERE id = ?",
            self.config.table_name,
            set_clauses.join(", ")
        );

        params.push(Box::new(id.to_string()));

        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();

        conn.execute(&sql, param_refs.as_slice())
            .map_err(|e| format!("Failed to update entry: {}", e))?;

        Ok(())
    }

    /// Delete entry
    pub fn delete(&self, id: &str) -> Result<(), String> {
        let conn = self.conn.write();

        let sql = format!("DELETE FROM {} WHERE id = ?1", self.config.table_name);

        conn.execute(&sql, [id])
            .map_err(|e| format!("Failed to delete entry: {}", e))?;

        Ok(())
    }

    /// Get statistics
    pub fn get_stats(&self) -> Result<VectorStoreStats, String> {
        let conn = self.conn.read();

        // Total entries
        let total: u32 = conn
            .query_row(
                &format!("SELECT COUNT(*) FROM {}", self.config.table_name),
                [],
                |row| row.get(0),
            )
            .map_err(|e| format!("Failed to get count: {}", e))?;

        // By tier
        let mut by_tier = std::collections::HashMap::new();
        let mut stmt = conn
            .prepare(&format!(
                "SELECT tier, COUNT(*) FROM {} GROUP BY tier",
                self.config.table_name
            ))
            .map_err(|e| format!("Failed to prepare tier query: {}", e))?;

        let tier_rows = stmt
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, u32>(1)?))
            })
            .map_err(|e| format!("Failed to query tiers: {}", e))?;

        for row in tier_rows {
            let (tier, count) = row.map_err(|e| format!("Failed to read tier: {}", e))?;
            by_tier.insert(tier, count);
        }

        // By type
        let mut by_type = std::collections::HashMap::new();
        let mut stmt = conn
            .prepare(&format!(
                "SELECT type, COUNT(*) FROM {} GROUP BY type",
                self.config.table_name
            ))
            .map_err(|e| format!("Failed to prepare type query: {}", e))?;

        let type_rows = stmt
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, u32>(1)?))
            })
            .map_err(|e| format!("Failed to query types: {}", e))?;

        for row in type_rows {
            let (t, count) = row.map_err(|e| format!("Failed to read type: {}", e))?;
            by_type.insert(t, count);
        }

        // Average importance
        let avg_importance: f32 = conn
            .query_row(
                &format!("SELECT AVG(importance) FROM {}", self.config.table_name),
                [],
                |row| row.get(0),
            )
            .unwrap_or(0.0);

        // DB size
        let db_size_bytes = std::fs::metadata(&self.config.db_path)
            .map(|m| m.len())
            .unwrap_or(0);

        Ok(VectorStoreStats {
            total_entries: total,
            by_tier,
            by_type,
            avg_importance,
            db_size_bytes,
        })
    }

    // ═══════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════

    fn row_to_entry(&self, row: &rusqlite::Row) -> SqlResult<VectorEntry> {
        let tags_json: String = row.get(7)?;
        let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

        let embedding_bytes: Vec<u8> = row.get(5)?;
        let embedding = Self::deserialize_embedding(&embedding_bytes)
            .map_err(|e| rusqlite::Error::InvalidQuery)?;

        Ok(VectorEntry {
            id: row.get(0)?,
            tier: row.get(1)?,
            entry_type: row.get(2)?,
            summary: row.get(3)?,
            details: row.get(4)?,
            embedding,
            owner: row.get(6)?,
            tags,
            source_type: row.get(8)?,
            source_id: row.get(9)?,
            source_timestamp: row.get(10)?,
            importance: row.get(11)?,
            access_count: row.get(12)?,
            created_at: row.get(13)?,
            updated_at: row.get(14)?,
            last_accessed: row.get(15)?,
        })
    }

    fn serialize_embedding(embedding: &[f32]) -> Result<Vec<u8>, String> {
        let bytes: Vec<u8> = embedding.iter().flat_map(|&f| f.to_le_bytes()).collect();
        Ok(bytes)
    }

    fn deserialize_embedding(bytes: &[u8]) -> Result<Vec<f32>, String> {
        if bytes.len() % 4 != 0 {
            return Err("Invalid embedding byte length".to_string());
        }

        let floats: Vec<f32> = bytes
            .chunks_exact(4)
            .map(|chunk| f32::from_le_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]))
            .collect();

        Ok(floats)
    }

    fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
        if a.len() != b.len() {
            return 0.0;
        }

        let a_arr = Array1::from_vec(a.to_vec());
        let b_arr = Array1::from_vec(b.to_vec());

        let dot = a_arr.dot(&b_arr);
        let norm_a = a_arr.dot(&a_arr).sqrt();
        let norm_b = b_arr.dot(&b_arr).sqrt();

        if norm_a == 0.0 || norm_b == 0.0 {
            return 0.0;
        }

        dot / (norm_a * norm_b)
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

use std::collections::HashMap;
use tauri::State;

type VectorStoreRegistry = Arc<RwLock<HashMap<String, Arc<VectorStore>>>>;

#[tauri::command]
pub async fn vector_store_init(
    registry: State<'_, VectorStoreRegistry>,
    config: VectorStoreConfig,
) -> Result<String, String> {
    let store_id = config.db_path.clone();
    let store = VectorStore::new(config)?;

    let mut reg = registry.write();
    reg.insert(store_id.clone(), Arc::new(store));

    Ok(store_id)
}

#[tauri::command]
pub async fn vector_store_insert(
    registry: State<'_, VectorStoreRegistry>,
    store_id: String,
    entry: VectorEntry,
) -> Result<(), String> {
    let reg = registry.read();
    let store = reg.get(&store_id).ok_or("Vector store not found")?;
    store.insert(&entry)
}

#[tauri::command]
pub async fn vector_search(
    registry: State<'_, VectorStoreRegistry>,
    store_id: String,
    embedding: Vec<f32>,
    options: SearchOptions,
) -> Result<Vec<SearchResult>, String> {
    let reg = registry.read();
    let store = reg.get(&store_id).ok_or("Vector store not found")?;
    store.search(&embedding, options)
}

#[tauri::command]
pub async fn vector_store_get(
    registry: State<'_, VectorStoreRegistry>,
    store_id: String,
    id: String,
) -> Result<Option<VectorEntry>, String> {
    let reg = registry.read();
    let store = reg.get(&store_id).ok_or("Vector store not found")?;
    store.get(&id)
}

#[tauri::command]
pub async fn vector_store_update(
    registry: State<'_, VectorStoreRegistry>,
    store_id: String,
    id: String,
    updates: serde_json::Value,
) -> Result<(), String> {
    let reg = registry.read();
    let store = reg.get(&store_id).ok_or("Vector store not found")?;
    store.update(&id, updates)
}

#[tauri::command]
pub async fn vector_store_delete(
    registry: State<'_, VectorStoreRegistry>,
    store_id: String,
    id: String,
) -> Result<(), String> {
    let reg = registry.read();
    let store = reg.get(&store_id).ok_or("Vector store not found")?;
    store.delete(&id)
}

#[tauri::command]
pub async fn vector_store_get_stats(
    registry: State<'_, VectorStoreRegistry>,
    store_id: String,
) -> Result<VectorStoreStats, String> {
    let reg = registry.read();
    let store = reg.get(&store_id).ok_or("Vector store not found")?;
    store.get_stats()
}

/// Initialize registry (call from main.rs)
pub fn init_vector_store_registry() -> VectorStoreRegistry {
    Arc::new(RwLock::new(HashMap::new()))
}

// ═══════════════════════════════════════════════════════════════════════════
// SQLITE AVAILABILITY CHECK (Called by frontend to verify backend readiness)
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn check_sqlite_available() -> Result<bool, String> {
    // Test SQLite availability by opening an in-memory database
    match Connection::open_in_memory() {
        Ok(conn) => {
            // Verify we can execute queries
            match conn.execute("SELECT 1", []) {
                Ok(_) => {
                    log::info!("[VectorStoreAPI] SQLite available and operational");
                    Ok(true)
                }
                Err(e) => {
                    log::warn!("[VectorStoreAPI] SQLite available but query failed: {}", e);
                    Err(format!("SQLite query failed: {}", e))
                }
            }
        }
        Err(e) => {
            log::error!("[VectorStoreAPI] SQLite not available: {}", e);
            Err(format!("SQLite not available: {}", e))
        }
    }
}
