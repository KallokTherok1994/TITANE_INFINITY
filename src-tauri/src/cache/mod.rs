// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.2 — Intelligent Cache Module
//   P2-2: Cache LRU + Persistent - FULL IMPLEMENTATION
//   SP-PERF-003: Semantic Cache for AI Responses
//   Phase 4: LZ4 Compression Layer
// ═══════════════════════════════════════════════════════════════

pub mod compression;
pub mod middleware;
pub mod semantic_cache;

use dashmap::DashMap;
use serde::de::DeserializeOwned;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

// ────────────────────────────────────────────────────────────────
// Types & Structures
// ────────────────────────────────────────────────────────────────

#[derive(Clone, Hash, Eq, PartialEq, Debug, serde::Serialize, serde::Deserialize)]
pub struct CacheKey {
    command: String,
    params_hash: u64,
}

impl CacheKey {
    pub fn new(command: &str, params: serde_json::Value) -> Self {
        let mut hasher = DefaultHasher::new();
        params.to_string().hash(&mut hasher);

        Self {
            command: command.to_string(),
            params_hash: hasher.finish(),
        }
    }
}

pub struct CacheEntry {
    value: serde_json::Value,
    created_at: Instant,
    ttl: Duration,
    hit_count: AtomicU64,
}

impl CacheEntry {
    fn is_expired(&self) -> bool {
        self.created_at.elapsed() > self.ttl
    }
}

#[derive(Clone)]
pub struct CacheConfig {
    pub max_entries: usize,
    pub default_ttl: Duration,
    pub enable_persistence: bool,
    pub persistence_path: Option<PathBuf>,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            max_entries: 1000,
            default_ttl: Duration::from_secs(5),
            enable_persistence: false,
            persistence_path: None,
        }
    }
}

#[derive(Clone)]
pub struct CacheMetrics {
    hits: Arc<AtomicU64>,
    misses: Arc<AtomicU64>,
    evictions: Arc<AtomicU64>,
    total_queries: Arc<AtomicU64>,
}

impl CacheMetrics {
    fn new() -> Self {
        Self {
            hits: Arc::new(AtomicU64::new(0)),
            misses: Arc::new(AtomicU64::new(0)),
            evictions: Arc::new(AtomicU64::new(0)),
            total_queries: Arc::new(AtomicU64::new(0)),
        }
    }

    pub fn hits(&self) -> u64 {
        self.hits.load(Ordering::Relaxed)
    }

    pub fn misses(&self) -> u64 {
        self.misses.load(Ordering::Relaxed)
    }

    pub fn evictions(&self) -> u64 {
        self.evictions.load(Ordering::Relaxed)
    }

    pub fn total_queries(&self) -> u64 {
        self.total_queries.load(Ordering::Relaxed)
    }

    pub fn hit_rate(&self) -> f64 {
        let total = self.total_queries();
        if total == 0 {
            return 0.0;
        }
        self.hits() as f64 / total as f64
    }

    fn record_hit(&self) {
        self.hits.fetch_add(1, Ordering::Relaxed);
        self.total_queries.fetch_add(1, Ordering::Relaxed);
    }

    fn record_miss(&self) {
        self.misses.fetch_add(1, Ordering::Relaxed);
        self.total_queries.fetch_add(1, Ordering::Relaxed);
    }

    fn record_eviction(&self) {
        self.evictions.fetch_add(1, Ordering::Relaxed);
    }
}

pub struct IntelligentCache {
    data: Arc<DashMap<CacheKey, CacheEntry>>,
    lru: Arc<DashMap<CacheKey, Instant>>,
    config: CacheConfig,
    metrics: CacheMetrics,
}

// ────────────────────────────────────────────────────────────────
// Implementation
// ────────────────────────────────────────────────────────────────

impl IntelligentCache {
    pub fn new(config: CacheConfig) -> Self {
        Self {
            data: Arc::new(DashMap::new()),
            lru: Arc::new(DashMap::new()),
            config,
            metrics: CacheMetrics::new(),
        }
    }

    /// Get cached value if valid (not expired)
    pub fn get<T: DeserializeOwned>(&self, key: &CacheKey) -> Option<T> {
        // Try to get entry
        let entry_ref = match self.data.get(key) {
            Some(entry) => entry,
            None => {
                // Key doesn't exist - record miss
                self.metrics.record_miss();
                return None;
            }
        };

        // Check if expired
        if entry_ref.is_expired() {
            // Drop the reference before removing
            drop(entry_ref);

            // Remove expired entry
            self.data.remove(key);
            self.lru.remove(key);
            self.metrics.record_miss();
            return None;
        }

        // Update hit count
        entry_ref.hit_count.fetch_add(1, Ordering::Relaxed);

        // Update LRU (mark as recently used)
        self.lru.insert(key.clone(), Instant::now());

        // Deserialize value
        let value = entry_ref.value.clone();
        drop(entry_ref);

        // Record hit
        self.metrics.record_hit();

        // Try to deserialize
        serde_json::from_value(value).ok()
    }

    /// Set value with TTL
    pub fn set(&self, key: CacheKey, value: serde_json::Value, ttl: Duration) {
        // Check if we need to evict
        if self.data.len() >= self.config.max_entries {
            self.evict_lru();
        }

        // Create entry
        let entry = CacheEntry {
            value,
            created_at: Instant::now(),
            ttl,
            hit_count: AtomicU64::new(0),
        };

        // Insert entry
        self.data.insert(key.clone(), entry);

        // Update LRU
        self.lru.insert(key, Instant::now());
    }

    /// Evict least recently used entry
    fn evict_lru(&self) {
        // Find entry with oldest LRU timestamp
        let mut oldest_key: Option<CacheKey> = None;
        let mut oldest_time = Instant::now();

        for entry in self.lru.iter() {
            if *entry.value() < oldest_time {
                oldest_time = *entry.value();
                oldest_key = Some(entry.key().clone());
            }
        }

        // Evict if found
        if let Some(key) = oldest_key {
            self.data.remove(&key);
            self.lru.remove(&key);
            self.metrics.record_eviction();
        }
    }

    /// Invalidate specific key
    pub fn invalidate(&self, key: &CacheKey) {
        self.data.remove(key);
        self.lru.remove(key);
    }

    /// Invalidate all keys matching pattern (prefix)
    pub fn invalidate_pattern(&self, pattern: &str) {
        let keys_to_remove: Vec<CacheKey> = self
            .data
            .iter()
            .filter(|entry| entry.key().command.starts_with(pattern))
            .map(|entry| entry.key().clone())
            .collect();

        for key in keys_to_remove {
            self.data.remove(&key);
            self.lru.remove(&key);
        }
    }

    /// Clear all cache
    pub fn clear(&self) {
        self.data.clear();
        self.lru.clear();
    }

    /// Get metrics
    pub fn metrics(&self) -> CacheMetrics {
        self.metrics.clone()
    }

    /// Cleanup expired entries
    pub fn cleanup_expired(&self) {
        let keys_to_remove: Vec<CacheKey> = self
            .data
            .iter()
            .filter(|entry| entry.value().is_expired())
            .map(|entry| entry.key().clone())
            .collect();

        for key in keys_to_remove {
            self.data.remove(&key);
            self.lru.remove(&key);
        }
    }

    /// Save cache to disk (if persistence enabled)
    pub fn persist(&self) -> Result<(), String> {
        if !self.config.enable_persistence {
            return Err("Persistence not enabled".to_string());
        }

        let path = self
            .config
            .persistence_path
            .as_ref()
            .ok_or_else(|| "No persistence path configured".to_string())?;

        // Collect non-expired entries
        let entries: Vec<(CacheKey, serde_json::Value, u64)> = self
            .data
            .iter()
            .filter(|entry| !entry.value().is_expired())
            .map(|entry| {
                let key = entry.key().clone();
                let value = entry.value().value.clone();
                let ttl_secs = entry.value().ttl.as_secs();
                (key, value, ttl_secs)
            })
            .collect();

        // Serialize to JSON
        let json = serde_json::to_string_pretty(&entries)
            .map_err(|e| format!("Serialization error: {}", e))?;

        // Write to file
        std::fs::write(path, json).map_err(|e| format!("IO error: {}", e))?;

        Ok(())
    }

    /// Load cache from disk
    pub fn restore(&mut self) -> Result<(), String> {
        if !self.config.enable_persistence {
            return Err("Persistence not enabled".to_string());
        }

        let path = self
            .config
            .persistence_path
            .as_ref()
            .ok_or_else(|| "No persistence path configured".to_string())?;

        // Read file
        let json = std::fs::read_to_string(path).map_err(|e| format!("IO error: {}", e))?;

        // Deserialize
        let entries: Vec<(CacheKey, serde_json::Value, u64)> =
            serde_json::from_str(&json).map_err(|e| format!("Deserialization error: {}", e))?;

        // Restore entries
        for (key, value, ttl_secs) in entries {
            self.set(key, value, Duration::from_secs(ttl_secs));
        }

        Ok(())
    }
}

#[derive(Debug)]
pub enum CacheError {
    SerializationError(String),
    IoError(String),
}
