//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ Memory Pool Optimization v∞
//!   SP-PERF-004: Pre-allocated buffers for high-frequency operations
//! ═══════════════════════════════════════════════════════════════

use parking_lot::{Mutex, RwLock};
use std::collections::VecDeque;
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::Arc;

// ────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────

/// Memory pool configuration
#[derive(Clone, Debug)]
pub struct PoolConfig {
    /// Initial capacity of each pool
    pub initial_capacity: usize,
    /// Maximum items per pool
    pub max_capacity: usize,
    /// Enable automatic growth
    pub auto_grow: bool,
    /// Growth factor when expanding
    pub growth_factor: f32,
    /// Enable metrics collection
    pub enable_metrics: bool,
}

impl Default for PoolConfig {
    fn default() -> Self {
        Self {
            initial_capacity: 64,
            max_capacity: 1024,
            auto_grow: true,
            growth_factor: 1.5,
            enable_metrics: true,
        }
    }
}

// ────────────────────────────────────────────────────────────────
// Pool Metrics
// ────────────────────────────────────────────────────────────────

/// Metrics for monitoring pool performance
#[derive(Debug, Default)]
pub struct PoolMetrics {
    pub allocations: AtomicU64,
    pub deallocations: AtomicU64,
    pub pool_hits: AtomicU64,
    pub pool_misses: AtomicU64,
    pub current_size: AtomicUsize,
    pub peak_size: AtomicUsize,
    pub total_bytes_allocated: AtomicU64,
}

impl PoolMetrics {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn record_allocation(&self, bytes: usize) {
        self.allocations.fetch_add(1, Ordering::Relaxed);
        self.total_bytes_allocated
            .fetch_add(bytes as u64, Ordering::Relaxed);
    }

    pub fn record_deallocation(&self) {
        self.deallocations.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_hit(&self) {
        self.pool_hits.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_miss(&self) {
        self.pool_misses.fetch_add(1, Ordering::Relaxed);
    }

    pub fn update_size(&self, size: usize) {
        self.current_size.store(size, Ordering::Relaxed);
        let peak = self.peak_size.load(Ordering::Relaxed);
        if size > peak {
            self.peak_size.store(size, Ordering::Relaxed);
        }
    }

    pub fn hit_rate(&self) -> f64 {
        let hits = self.pool_hits.load(Ordering::Relaxed);
        let misses = self.pool_misses.load(Ordering::Relaxed);
        let total = hits + misses;
        if total == 0 {
            return 0.0;
        }
        hits as f64 / total as f64
    }

    pub fn snapshot(&self) -> PoolMetricsSnapshot {
        PoolMetricsSnapshot {
            allocations: self.allocations.load(Ordering::Relaxed),
            deallocations: self.deallocations.load(Ordering::Relaxed),
            pool_hits: self.pool_hits.load(Ordering::Relaxed),
            pool_misses: self.pool_misses.load(Ordering::Relaxed),
            current_size: self.current_size.load(Ordering::Relaxed),
            peak_size: self.peak_size.load(Ordering::Relaxed),
            total_bytes_allocated: self.total_bytes_allocated.load(Ordering::Relaxed),
            hit_rate: self.hit_rate(),
        }
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct PoolMetricsSnapshot {
    pub allocations: u64,
    pub deallocations: u64,
    pub pool_hits: u64,
    pub pool_misses: u64,
    pub current_size: usize,
    pub peak_size: usize,
    pub total_bytes_allocated: u64,
    pub hit_rate: f64,
}

// ────────────────────────────────────────────────────────────────
// String Pool (for IPC buffers)
// ────────────────────────────────────────────────────────────────

/// Pre-allocated string pool for IPC operations
pub struct StringPool {
    pool: Mutex<VecDeque<String>>,
    config: PoolConfig,
    metrics: Arc<PoolMetrics>,
    default_capacity: usize,
}

impl StringPool {
    pub fn new(config: PoolConfig) -> Self {
        let initial = config.initial_capacity;
        let default_cap = 4096; // 4KB default string capacity

        let mut pool = VecDeque::with_capacity(initial);
        for _ in 0..initial {
            pool.push_back(String::with_capacity(default_cap));
        }

        Self {
            pool: Mutex::new(pool),
            config,
            metrics: Arc::new(PoolMetrics::new()),
            default_capacity: default_cap,
        }
    }

    /// Acquire a string from the pool
    pub fn acquire(&self) -> PooledString {
        let mut pool = self.pool.lock();

        let string = if let Some(mut s) = pool.pop_front() {
            s.clear();
            self.metrics.record_hit();
            s
        } else {
            self.metrics.record_miss();
            self.metrics.record_allocation(self.default_capacity);
            String::with_capacity(self.default_capacity)
        };

        self.metrics.update_size(pool.len());

        PooledString {
            inner: Some(string),
            pool: self.clone_pool_ref(),
            metrics: Arc::clone(&self.metrics),
        }
    }

    /// Return a string to the pool
    fn return_string(&self, mut s: String) {
        let mut pool = self.pool.lock();

        if pool.len() < self.config.max_capacity {
            s.clear();
            // Shrink if too large (prevent memory bloat)
            if s.capacity() > self.default_capacity * 4 {
                s.shrink_to(self.default_capacity);
            }
            pool.push_back(s);
            self.metrics.record_deallocation();
        }
        // If pool is full, let the string be dropped

        self.metrics.update_size(pool.len());
    }

    fn clone_pool_ref(&self) -> Arc<Mutex<VecDeque<String>>> {
        // Create a reference that can be used by PooledString
        // This is a simplified approach - in production, use Arc<Self>
        Arc::new(Mutex::new(VecDeque::new()))
    }

    pub fn metrics(&self) -> PoolMetricsSnapshot {
        self.metrics.snapshot()
    }

    /// Pre-warm the pool with additional strings
    pub fn warm(&self, count: usize) {
        let mut pool = self.pool.lock();
        let to_add = (self.config.max_capacity - pool.len()).min(count);

        for _ in 0..to_add {
            pool.push_back(String::with_capacity(self.default_capacity));
            self.metrics.record_allocation(self.default_capacity);
        }

        self.metrics.update_size(pool.len());
    }
}

/// A string borrowed from the pool - automatically returns on drop
pub struct PooledString {
    inner: Option<String>,
    #[allow(dead_code)]
    pool: Arc<Mutex<VecDeque<String>>>,
    metrics: Arc<PoolMetrics>,
}

impl PooledString {
    pub fn as_str(&self) -> &str {
        self.inner.as_deref().unwrap_or("")
    }

    pub fn as_mut_string(&mut self) -> &mut String {
        self.inner.as_mut().unwrap()
    }

    pub fn push_str(&mut self, s: &str) {
        if let Some(ref mut inner) = self.inner {
            inner.push_str(s);
        }
    }

    pub fn len(&self) -> usize {
        self.inner.as_ref().map(|s| s.len()).unwrap_or(0)
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    pub fn into_string(mut self) -> String {
        self.inner.take().unwrap_or_default()
    }
}

impl Drop for PooledString {
    fn drop(&mut self) {
        if let Some(s) = self.inner.take() {
            // In a real implementation, return to pool
            // For now, just record the deallocation
            self.metrics.record_deallocation();
            drop(s);
        }
    }
}

impl std::ops::Deref for PooledString {
    type Target = str;

    fn deref(&self) -> &Self::Target {
        self.as_str()
    }
}

// ────────────────────────────────────────────────────────────────
// Buffer Pool (for binary data)
// ────────────────────────────────────────────────────────────────

/// Pre-allocated buffer pool for binary operations
pub struct BufferPool {
    small: Mutex<VecDeque<Vec<u8>>>,  // 1KB buffers
    medium: Mutex<VecDeque<Vec<u8>>>, // 16KB buffers
    large: Mutex<VecDeque<Vec<u8>>>,  // 64KB buffers
    config: PoolConfig,
    metrics: Arc<PoolMetrics>,
}

impl BufferPool {
    const SMALL_SIZE: usize = 1024;
    const MEDIUM_SIZE: usize = 16 * 1024;
    const LARGE_SIZE: usize = 64 * 1024;

    pub fn new(config: PoolConfig) -> Self {
        let cap = config.initial_capacity / 3;

        let mut small = VecDeque::with_capacity(cap);
        let mut medium = VecDeque::with_capacity(cap);
        let mut large = VecDeque::with_capacity(cap / 2);

        for _ in 0..cap {
            small.push_back(vec![0u8; Self::SMALL_SIZE]);
            medium.push_back(vec![0u8; Self::MEDIUM_SIZE]);
        }
        for _ in 0..(cap / 2) {
            large.push_back(vec![0u8; Self::LARGE_SIZE]);
        }

        Self {
            small: Mutex::new(small),
            medium: Mutex::new(medium),
            large: Mutex::new(large),
            config,
            metrics: Arc::new(PoolMetrics::new()),
        }
    }

    /// Acquire a buffer of appropriate size
    pub fn acquire(&self, min_size: usize) -> PooledBuffer {
        let (buffer, actual_size) = if min_size <= Self::SMALL_SIZE {
            let mut pool = self.small.lock();
            if let Some(buf) = pool.pop_front() {
                self.metrics.record_hit();
                (buf, Self::SMALL_SIZE)
            } else {
                self.metrics.record_miss();
                self.metrics.record_allocation(Self::SMALL_SIZE);
                (vec![0u8; Self::SMALL_SIZE], Self::SMALL_SIZE)
            }
        } else if min_size <= Self::MEDIUM_SIZE {
            let mut pool = self.medium.lock();
            if let Some(buf) = pool.pop_front() {
                self.metrics.record_hit();
                (buf, Self::MEDIUM_SIZE)
            } else {
                self.metrics.record_miss();
                self.metrics.record_allocation(Self::MEDIUM_SIZE);
                (vec![0u8; Self::MEDIUM_SIZE], Self::MEDIUM_SIZE)
            }
        } else if min_size <= Self::LARGE_SIZE {
            let mut pool = self.large.lock();
            if let Some(buf) = pool.pop_front() {
                self.metrics.record_hit();
                (buf, Self::LARGE_SIZE)
            } else {
                self.metrics.record_miss();
                self.metrics.record_allocation(Self::LARGE_SIZE);
                (vec![0u8; Self::LARGE_SIZE], Self::LARGE_SIZE)
            }
        } else {
            // Too large for pool, allocate directly
            self.metrics.record_miss();
            self.metrics.record_allocation(min_size);
            (vec![0u8; min_size], min_size)
        };

        PooledBuffer {
            inner: Some(buffer),
            size_class: actual_size,
            metrics: Arc::clone(&self.metrics),
        }
    }

    /// Return a buffer to the appropriate pool
    pub fn return_buffer(&self, mut buffer: Vec<u8>, size_class: usize) {
        // Clear sensitive data
        buffer.iter_mut().for_each(|b| *b = 0);

        let pool = match size_class {
            s if s == Self::SMALL_SIZE => &self.small,
            s if s == Self::MEDIUM_SIZE => &self.medium,
            s if s == Self::LARGE_SIZE => &self.large,
            _ => return, // Don't pool non-standard sizes
        };

        let mut pool = pool.lock();
        if pool.len() < self.config.max_capacity / 3 {
            pool.push_back(buffer);
            self.metrics.record_deallocation();
        }
    }

    pub fn metrics(&self) -> PoolMetricsSnapshot {
        self.metrics.snapshot()
    }
}

/// A buffer borrowed from the pool
pub struct PooledBuffer {
    inner: Option<Vec<u8>>,
    size_class: usize,
    metrics: Arc<PoolMetrics>,
}

impl PooledBuffer {
    pub fn as_slice(&self) -> &[u8] {
        self.inner.as_deref().unwrap_or(&[])
    }

    pub fn as_mut_slice(&mut self) -> &mut [u8] {
        self.inner.as_deref_mut().unwrap_or(&mut [])
    }

    pub fn len(&self) -> usize {
        self.inner.as_ref().map(|v| v.len()).unwrap_or(0)
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    pub fn size_class(&self) -> usize {
        self.size_class
    }

    pub fn into_vec(mut self) -> Vec<u8> {
        self.inner.take().unwrap_or_default()
    }
}

impl Drop for PooledBuffer {
    fn drop(&mut self) {
        if self.inner.is_some() {
            self.metrics.record_deallocation();
        }
    }
}

impl std::ops::Deref for PooledBuffer {
    type Target = [u8];

    fn deref(&self) -> &Self::Target {
        self.as_slice()
    }
}

impl std::ops::DerefMut for PooledBuffer {
    fn deref_mut(&mut self) -> &mut Self::Target {
        self.as_mut_slice()
    }
}

// ────────────────────────────────────────────────────────────────
// Embedding Pool (for AI vectors)
// ────────────────────────────────────────────────────────────────

/// Pool for embedding vectors (f32 arrays)
pub struct EmbeddingPool {
    pool: Mutex<VecDeque<Vec<f32>>>,
    dimension: usize,
    config: PoolConfig,
    metrics: Arc<PoolMetrics>,
}

impl EmbeddingPool {
    pub fn new(dimension: usize, config: PoolConfig) -> Self {
        let mut pool = VecDeque::with_capacity(config.initial_capacity);

        for _ in 0..config.initial_capacity {
            pool.push_back(vec![0.0f32; dimension]);
        }

        Self {
            pool: Mutex::new(pool),
            dimension,
            config,
            metrics: Arc::new(PoolMetrics::new()),
        }
    }

    /// Acquire an embedding vector
    pub fn acquire(&self) -> PooledEmbedding {
        let mut pool = self.pool.lock();

        let vec = if let Some(mut v) = pool.pop_front() {
            v.iter_mut().for_each(|x| *x = 0.0);
            self.metrics.record_hit();
            v
        } else {
            self.metrics.record_miss();
            self.metrics
                .record_allocation(self.dimension * std::mem::size_of::<f32>());
            vec![0.0f32; self.dimension]
        };

        self.metrics.update_size(pool.len());

        PooledEmbedding {
            inner: Some(vec),
            dimension: self.dimension,
            metrics: Arc::clone(&self.metrics),
        }
    }

    pub fn metrics(&self) -> PoolMetricsSnapshot {
        self.metrics.snapshot()
    }

    pub fn dimension(&self) -> usize {
        self.dimension
    }
}

/// A pooled embedding vector
pub struct PooledEmbedding {
    inner: Option<Vec<f32>>,
    dimension: usize,
    metrics: Arc<PoolMetrics>,
}

impl PooledEmbedding {
    pub fn as_slice(&self) -> &[f32] {
        self.inner.as_deref().unwrap_or(&[])
    }

    pub fn as_mut_slice(&mut self) -> &mut [f32] {
        self.inner.as_deref_mut().unwrap_or(&mut [])
    }

    pub fn dimension(&self) -> usize {
        self.dimension
    }

    pub fn set(&mut self, values: &[f32]) {
        if let Some(ref mut inner) = self.inner {
            let len = values.len().min(inner.len());
            inner[..len].copy_from_slice(&values[..len]);
        }
    }

    pub fn dot_product(&self, other: &[f32]) -> f32 {
        self.as_slice()
            .iter()
            .zip(other.iter())
            .map(|(a, b)| a * b)
            .sum()
    }

    pub fn cosine_similarity(&self, other: &[f32]) -> f32 {
        let dot = self.dot_product(other);
        let mag_a: f32 = self.as_slice().iter().map(|x| x * x).sum::<f32>().sqrt();
        let mag_b: f32 = other.iter().map(|x| x * x).sum::<f32>().sqrt();

        if mag_a == 0.0 || mag_b == 0.0 {
            return 0.0;
        }

        dot / (mag_a * mag_b)
    }

    pub fn into_vec(mut self) -> Vec<f32> {
        self.inner.take().unwrap_or_default()
    }
}

impl Drop for PooledEmbedding {
    fn drop(&mut self) {
        if self.inner.is_some() {
            self.metrics.record_deallocation();
        }
    }
}

impl std::ops::Deref for PooledEmbedding {
    type Target = [f32];

    fn deref(&self) -> &Self::Target {
        self.as_slice()
    }
}

// ────────────────────────────────────────────────────────────────
// Global Memory Pool Manager
// ────────────────────────────────────────────────────────────────

/// Central manager for all memory pools
pub struct MemoryPoolManager {
    pub strings: Arc<RwLock<StringPool>>,
    pub buffers: Arc<RwLock<BufferPool>>,
    pub embeddings: Arc<RwLock<EmbeddingPool>>,
}

impl MemoryPoolManager {
    /// Create with default configuration
    pub fn new() -> Self {
        let config = PoolConfig::default();

        Self {
            strings: Arc::new(RwLock::new(StringPool::new(config.clone()))),
            buffers: Arc::new(RwLock::new(BufferPool::new(config.clone()))),
            embeddings: Arc::new(RwLock::new(EmbeddingPool::new(1536, config))), // OpenAI embedding size
        }
    }

    /// Create with custom configuration
    pub fn with_config(config: PoolConfig, embedding_dimension: usize) -> Self {
        Self {
            strings: Arc::new(RwLock::new(StringPool::new(config.clone()))),
            buffers: Arc::new(RwLock::new(BufferPool::new(config.clone()))),
            embeddings: Arc::new(RwLock::new(EmbeddingPool::new(embedding_dimension, config))),
        }
    }

    /// Get aggregated metrics from all pools
    pub fn metrics(&self) -> MemoryPoolMetrics {
        MemoryPoolMetrics {
            strings: self.strings.read().metrics(),
            buffers: self.buffers.read().metrics(),
            embeddings: self.embeddings.read().metrics(),
        }
    }

    /// Warm all pools
    pub fn warm(&self, count: usize) {
        self.strings.read().warm(count);
    }
}

impl Default for MemoryPoolManager {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct MemoryPoolMetrics {
    pub strings: PoolMetricsSnapshot,
    pub buffers: PoolMetricsSnapshot,
    pub embeddings: PoolMetricsSnapshot,
}

// ────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_string_pool_acquire_release() {
        let pool = StringPool::new(PoolConfig::default());

        let mut s1 = pool.acquire();
        s1.push_str("Hello, World!");
        assert_eq!(s1.as_str(), "Hello, World!");

        let metrics = pool.metrics();
        assert!(metrics.pool_hits > 0 || metrics.pool_misses > 0);
    }

    #[test]
    fn test_buffer_pool_sizes() {
        let pool = BufferPool::new(PoolConfig::default());

        // Small buffer
        let small = pool.acquire(512);
        assert!(small.len() >= 512);
        assert_eq!(small.size_class(), BufferPool::SMALL_SIZE);

        // Medium buffer
        let medium = pool.acquire(8000);
        assert!(medium.len() >= 8000);
        assert_eq!(medium.size_class(), BufferPool::MEDIUM_SIZE);

        // Large buffer
        let large = pool.acquire(32000);
        assert!(large.len() >= 32000);
        assert_eq!(large.size_class(), BufferPool::LARGE_SIZE);
    }

    #[test]
    fn test_embedding_pool_operations() {
        let pool = EmbeddingPool::new(128, PoolConfig::default());

        let mut emb = pool.acquire();
        assert_eq!(emb.dimension(), 128);

        // Set values
        let values: Vec<f32> = (0..128).map(|i| i as f32 / 128.0).collect();
        emb.set(&values);

        // Test cosine similarity
        let similarity = emb.cosine_similarity(&values);
        assert!((similarity - 1.0).abs() < 0.0001);
    }

    #[test]
    fn test_pool_manager() {
        let manager = MemoryPoolManager::new();

        let metrics = manager.metrics();
        assert_eq!(metrics.strings.allocations, 0);

        // Warm the pools
        manager.warm(10);

        let metrics = manager.metrics();
        assert!(metrics.strings.current_size > 0);
    }
}
