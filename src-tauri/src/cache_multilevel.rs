// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v21.1Ω — MULTI-LEVEL CACHING SYSTEM
//   Super-Prompt B2: L1 (memory) + L2 (compressed) + L3 (disk)
// ═══════════════════════════════════════════════════════════════

use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::collections::HashMap;
use std::hash::Hash;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;

use crate::error::{TitaneError, TitaneResult};

// ═══════════════════════════════════════════════════════════════
//   CACHE KEY & VALUE
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Hash, Eq, PartialEq, Serialize, Deserialize)]
pub struct CacheKey(String);

impl CacheKey {
    pub fn new(key: impl Into<String>) -> Self {
        Self(key.into())
    }

    pub fn from_input(input: &str, context: &str) -> Self {
        let hash = Self::hash_input(input, context);
        Self(format!("{}:{}", context, hash))
    }

    fn hash_input(input: &str, context: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::Hasher;

        let mut hasher = DefaultHasher::new();
        hasher.write(input.as_bytes());
        hasher.write(context.as_bytes());
        format!("{:x}", hasher.finish())
    }
}

impl From<String> for CacheKey {
    fn from(s: String) -> Self {
        Self(s)
    }
}

impl AsRef<str> for CacheKey {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

// ═══════════════════════════════════════════════════════════════
//   CACHE METRICS
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CacheMetrics {
    pub l1_hits: u64,
    pub l2_hits: u64,
    pub l3_hits: u64,
    pub misses: u64,
    pub evictions: u64,
    pub total_size_bytes: u64,
}

impl CacheMetrics {
    pub fn hit_rate(&self) -> f64 {
        let total_hits = self.l1_hits + self.l2_hits + self.l3_hits;
        let total_requests = total_hits + self.misses;

        if total_requests == 0 {
            0.0
        } else {
            total_hits as f64 / total_requests as f64
        }
    }

    pub fn l1_hit_rate(&self) -> f64 {
        let total = self.l1_hits + self.l2_hits + self.l3_hits + self.misses;
        if total == 0 {
            0.0
        } else {
            self.l1_hits as f64 / total as f64
        }
    }

    pub fn record_l1_hit(&mut self) {
        self.l1_hits += 1;
    }

    pub fn record_l2_hit(&mut self) {
        self.l2_hits += 1;
    }

    pub fn record_l3_hit(&mut self) {
        self.l3_hits += 1;
    }

    pub fn record_miss(&mut self) {
        self.misses += 1;
    }

    pub fn record_eviction(&mut self) {
        self.evictions += 1;
    }
}

// ═══════════════════════════════════════════════════════════════
//   L1 CACHE (FAST IN-MEMORY)
// ═══════════════════════════════════════════════════════════════

use lru::LruCache;
use std::num::NonZeroUsize;

pub struct L1Cache<V> {
    cache: LruCache<CacheKey, V>,
    ttl: Duration,
    access_times: HashMap<CacheKey, std::time::Instant>,
}

impl<V: Clone> L1Cache<V> {
    pub fn new(capacity: usize, ttl_seconds: u64) -> Self {
        Self {
            cache: LruCache::new(NonZeroUsize::new(capacity).unwrap_or(NonZeroUsize::new(1000).unwrap())),
            ttl: Duration::from_secs(ttl_seconds),
            access_times: HashMap::new(),
        }
    }

    pub fn get(&mut self, key: &CacheKey) -> Option<V> {
        // Check if expired
        if let Some(access_time) = self.access_times.get(key) {
            if access_time.elapsed() > self.ttl {
                self.cache.pop(key);
                self.access_times.remove(key);
                return None;
            }
        }

        self.cache.get(key).cloned()
    }

    pub fn insert(&mut self, key: CacheKey, value: V) {
        self.cache.put(key.clone(), value);
        self.access_times.insert(key, std::time::Instant::now());
    }

    pub fn len(&self) -> usize {
        self.cache.len()
    }

    pub fn is_empty(&self) -> bool {
        self.cache.is_empty()
    }
}

// ═══════════════════════════════════════════════════════════════
//   L2 CACHE (COMPRESSED MEMORY)
// ═══════════════════════════════════════════════════════════════

pub struct L2Cache {
    cache: LruCache<CacheKey, Vec<u8>>,
}

impl L2Cache {
    pub fn new(capacity: usize) -> Self {
        Self {
            cache: LruCache::new(NonZeroUsize::new(capacity).unwrap_or(NonZeroUsize::new(5000).unwrap())),
        }
    }

    pub fn get(&mut self, key: &CacheKey) -> Option<Vec<u8>> {
        self.cache.get(key).cloned()
    }

    pub fn insert(&mut self, key: CacheKey, compressed_data: Vec<u8>) {
        self.cache.put(key, compressed_data);
    }

    pub fn len(&self) -> usize {
        self.cache.len()
    }

    pub fn is_empty(&self) -> bool {
        self.cache.is_empty()
    }
}

// ═══════════════════════════════════════════════════════════════
//   L3 CACHE (DISK)
// ═══════════════════════════════════════════════════════════════

pub struct L3Cache {
    cache_dir: PathBuf,
    max_size_bytes: u64,
}

impl L3Cache {
    pub fn new(cache_dir: PathBuf, max_size_bytes: u64) -> Self {
        // Create cache directory if not exists
        if !cache_dir.exists() {
            let _ = std::fs::create_dir_all(&cache_dir);
        }

        Self {
            cache_dir,
            max_size_bytes,
        }
    }

    pub async fn get(&self, key: &CacheKey) -> TitaneResult<Option<Vec<u8>>> {
        let path = self.key_to_path(key);

        if !path.exists() {
            return Ok(None);
        }

        match tokio::fs::read(&path).await {
            Ok(data) => Ok(Some(data)),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
            Err(e) => Err(TitaneError::InternalError(format!(
                "Failed to read cache file: {}",
                e
            ))),
        }
    }

    pub async fn insert(&self, key: &CacheKey, data: &[u8]) -> TitaneResult<()> {
        let path = self.key_to_path(key);

        // Create parent directory
        if let Some(parent) = path.parent() {
            tokio::fs::create_dir_all(parent).await.map_err(|e| {
                TitaneError::InternalError(format!("Failed to create cache directory: {}", e))
            })?;
        }

        tokio::fs::write(&path, data).await.map_err(|e| {
            TitaneError::InternalError(format!("Failed to write cache file: {}", e))
        })?;

        Ok(())
    }

    fn key_to_path(&self, key: &CacheKey) -> PathBuf {
        let key_str = key.as_ref();
        let hash = format!("{:x}", md5::compute(key_str.as_bytes()));
        self.cache_dir.join(format!("{}.cache", hash))
    }
}

// ═══════════════════════════════════════════════════════════════
//   MULTI-LEVEL CACHE
// ═══════════════════════════════════════════════════════════════

pub struct MultiLevelCache<V> {
    l1: Arc<RwLock<L1Cache<V>>>,
    l2: Arc<RwLock<L2Cache>>,
    l3: Arc<L3Cache>,
    metrics: Arc<RwLock<CacheMetrics>>,
}

impl<V> MultiLevelCache<V>
where
    V: Serialize + DeserializeOwned + Clone + Send + Sync + 'static,
{
    pub fn new(
        l1_capacity: usize,
        l1_ttl_seconds: u64,
        l2_capacity: usize,
        l3_cache_dir: PathBuf,
        l3_max_size: u64,
    ) -> Self {
        Self {
            l1: Arc::new(RwLock::new(L1Cache::new(l1_capacity, l1_ttl_seconds))),
            l2: Arc::new(RwLock::new(L2Cache::new(l2_capacity))),
            l3: Arc::new(L3Cache::new(l3_cache_dir, l3_max_size)),
            metrics: Arc::new(RwLock::new(CacheMetrics::default())),
        }
    }

    /// Get value from cache or compute
    pub async fn get_or_compute<F, Fut>(
        &self,
        key: &CacheKey,
        compute: F,
    ) -> TitaneResult<V>
    where
        F: FnOnce() -> Fut,
        Fut: std::future::Future<Output = TitaneResult<V>>,
    {
        // Try L1
        {
            let mut l1 = self.l1.write().await;
            if let Some(value) = l1.get(key) {
                self.metrics.write().await.record_l1_hit();
                return Ok(value);
            }
        }

        // Try L2
        {
            let mut l2 = self.l2.write().await;
            if let Some(compressed) = l2.get(key) {
                let value = self.decompress(&compressed)?;
                // Populate L1
                self.l1.write().await.insert(key.clone(), value.clone());
                self.metrics.write().await.record_l2_hit();
                return Ok(value);
            }
        }

        // Try L3
        if let Some(disk_data) = self.l3.get(key).await? {
            let value: V = bincode::deserialize(&disk_data)
                .map_err(|e| TitaneError::InternalError(format!("Deserialization failed: {}", e)))?;

            // Populate L2 and L1
            let compressed = self.compress(&value)?;
            self.l2.write().await.insert(key.clone(), compressed);
            self.l1.write().await.insert(key.clone(), value.clone());

            self.metrics.write().await.record_l3_hit();
            return Ok(value);
        }

        // Cache miss - compute
        self.metrics.write().await.record_miss();
        let value = compute().await?;

        // Populate all caches
        self.l1.write().await.insert(key.clone(), value.clone());

        let compressed = self.compress(&value)?;
        self.l2.write().await.insert(key.clone(), compressed);

        let serialized = bincode::serialize(&value)
            .map_err(|e| TitaneError::InternalError(format!("Serialization failed: {}", e)))?;
        self.l3.insert(key, &serialized).await?;

        Ok(value)
    }

    /// Get metrics
    pub async fn metrics(&self) -> CacheMetrics {
        self.metrics.read().await.clone()
    }

    /// Compress value
    fn compress(&self, value: &V) -> TitaneResult<Vec<u8>> {
        let serialized = bincode::serialize(value)
            .map_err(|e| TitaneError::InternalError(format!("Serialization failed: {}", e)))?;

        // Simple compression (could use lz4, zstd, etc.)
        Ok(serialized) // TODO: Add actual compression
    }

    /// Decompress value
    fn decompress(&self, compressed: &[u8]) -> TitaneResult<V> {
        // Simple decompression
        bincode::deserialize(compressed)
            .map_err(|e| TitaneError::InternalError(format!("Deserialization failed: {}", e)))
    }

    /// Clear all caches
    pub async fn clear(&self) {
        self.l1.write().await.cache.clear();
        self.l2.write().await.cache.clear();
        // L3 clear would require filesystem operations
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cache_key() {
        let key1 = CacheKey::from_input("hello", "context1");
        let key2 = CacheKey::from_input("hello", "context1");
        let key3 = CacheKey::from_input("hello", "context2");

        assert_eq!(key1, key2);
        assert_ne!(key1, key3);
    }

    #[test]
    fn test_l1_cache() {
        let mut cache = L1Cache::new(2, 60);

        cache.insert(CacheKey::new("key1"), "value1".to_string());
        cache.insert(CacheKey::new("key2"), "value2".to_string());

        assert_eq!(cache.get(&CacheKey::new("key1")), Some("value1".to_string()));
        assert_eq!(cache.len(), 2);
    }

    #[test]
    fn test_cache_metrics() {
        let mut metrics = CacheMetrics::default();

        metrics.record_l1_hit();
        metrics.record_l2_hit();
        metrics.record_miss();

        assert_eq!(metrics.l1_hits, 1);
        assert_eq!(metrics.l2_hits, 1);
        assert_eq!(metrics.misses, 1);
        assert_eq!(metrics.hit_rate(), 2.0 / 3.0);
    }

    #[tokio::test]
    async fn test_multi_level_cache() {
        let now_nanos = match std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH) {
            Ok(d) => d.as_nanos(),
            Err(_) => 0,
        };
        let cache_dir = std::env::temp_dir().join(format!(
            "titane_cache_test_{}_{}",
            std::process::id(),
            now_nanos
        ));

        // Ensure isolation even if a previous run left artifacts.
        let _ = tokio::fs::remove_dir_all(&cache_dir).await;
        let cache = MultiLevelCache::<String>::new(
            100,  // L1 capacity
            60,   // L1 TTL
            500,  // L2 capacity
            cache_dir,
            1_000_000, // 1MB L3
        );

        let key = CacheKey::new("test_key");

        // First access - cache miss
        let value = cache
            .get_or_compute(&key, || async { Ok("computed_value".to_string()) })
            .await
            .unwrap();

        assert_eq!(value, "computed_value");

        // Second access - L1 hit
        let value2 = cache
            .get_or_compute(&key, || async { Ok("should_not_compute".to_string()) })
            .await
            .unwrap();

        assert_eq!(value2, "computed_value");

        let metrics = cache.metrics().await;
        assert_eq!(metrics.l1_hits, 1);
        assert_eq!(metrics.misses, 1);
    }
}
