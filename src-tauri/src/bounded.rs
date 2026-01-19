// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v21.1Ω — BOUNDED COLLECTIONS FOR MEMORY SAFETY
//   Super-Prompt C1: Replace unbounded collections with bounded
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::hash::Hash;
use std::time::Instant;

// ═══════════════════════════════════════════════════════════════
//   EVICTION POLICY
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EvictionPolicy {
    /// First In First Out
    FIFO,
    /// Last In First Out
    LIFO,
    /// Least Recently Used
    LRU,
}

// ═══════════════════════════════════════════════════════════════
//   BOUNDED METRICS
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BoundedMetrics {
    /// Total items added
    pub items_added: u64,
    /// Total items evicted
    pub items_evicted: u64,
    /// Current size
    pub current_size: usize,
    /// Maximum size
    pub max_size: usize,
}

impl BoundedMetrics {
    /// Calculate eviction rate (0.0-1.0)
    pub fn eviction_rate(&self) -> f64 {
        if self.items_added == 0 {
            0.0
        } else {
            self.items_evicted as f64 / self.items_added as f64
        }
    }

    /// Calculate fill rate (0.0-1.0)
    pub fn fill_rate(&self) -> f64 {
        if self.max_size == 0 {
            0.0
        } else {
            self.current_size as f64 / self.max_size as f64
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   BOUNDED VEC DEQUE
// ═══════════════════════════════════════════════════════════════

/// Bounded VecDeque with automatic eviction
pub struct BoundedVecDeque<T> {
    inner: VecDeque<T>,
    max_size: usize,
    eviction_policy: EvictionPolicy,
    metrics: BoundedMetrics,
}

impl<T> BoundedVecDeque<T> {
    /// Create new bounded VecDeque with FIFO eviction
    pub fn new(max_size: usize) -> Self {
        Self::with_policy(max_size, EvictionPolicy::FIFO)
    }

    /// Create new bounded VecDeque with specified eviction policy
    pub fn with_policy(max_size: usize, policy: EvictionPolicy) -> Self {
        Self {
            inner: VecDeque::with_capacity(max_size),
            max_size,
            eviction_policy: policy,
            metrics: BoundedMetrics {
                max_size,
                ..Default::default()
            },
        }
    }

    /// Push item to back (auto-evicts if needed)
    pub fn push(&mut self, item: T) {
        if self.inner.len() >= self.max_size {
            self.evict_one();
        }
        self.inner.push_back(item);
        self.metrics.items_added += 1;
        self.metrics.current_size = self.inner.len();
    }

    /// Push item to front (auto-evicts if needed)
    pub fn push_front(&mut self, item: T) {
        if self.inner.len() >= self.max_size {
            self.evict_one();
        }
        self.inner.push_front(item);
        self.metrics.items_added += 1;
        self.metrics.current_size = self.inner.len();
    }

    /// Pop item from front
    pub fn pop(&mut self) -> Option<T> {
        let item = self.inner.pop_front();
        self.metrics.current_size = self.inner.len();
        item
    }

    /// Pop item from back
    pub fn pop_back(&mut self) -> Option<T> {
        let item = self.inner.pop_back();
        self.metrics.current_size = self.inner.len();
        item
    }

    /// Get reference to front item
    pub fn front(&self) -> Option<&T> {
        self.inner.front()
    }

    /// Get reference to back item
    pub fn back(&self) -> Option<&T> {
        self.inner.back()
    }

    /// Current length
    pub fn len(&self) -> usize {
        self.inner.len()
    }

    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.inner.is_empty()
    }

    /// Check if full
    pub fn is_full(&self) -> bool {
        self.inner.len() >= self.max_size
    }

    /// Clear all items
    pub fn clear(&mut self) {
        self.inner.clear();
        self.metrics.current_size = 0;
    }

    /// Get metrics
    pub fn metrics(&self) -> &BoundedMetrics {
        &self.metrics
    }

    /// Iterate over items
    pub fn iter(&self) -> impl Iterator<Item = &T> {
        self.inner.iter()
    }

    /// Evict one item according to policy
    fn evict_one(&mut self) {
        match self.eviction_policy {
            EvictionPolicy::FIFO => {
                self.inner.pop_front();
            }
            EvictionPolicy::LIFO => {
                self.inner.pop_back();
            }
            EvictionPolicy::LRU => {
                // For VecDeque, LRU = FIFO (front is oldest)
                self.inner.pop_front();
            }
        }
        self.metrics.items_evicted += 1;
    }
}

// ═══════════════════════════════════════════════════════════════
//   BOUNDED HASH MAP
// ═══════════════════════════════════════════════════════════════

/// Bounded HashMap with LRU eviction
pub struct BoundedHashMap<K, V> {
    inner: HashMap<K, V>,
    access_times: HashMap<K, Instant>,
    max_size: usize,
    metrics: BoundedMetrics,
}

impl<K: Hash + Eq + Clone, V> BoundedHashMap<K, V> {
    /// Create new bounded HashMap
    pub fn new(max_size: usize) -> Self {
        Self {
            inner: HashMap::with_capacity(max_size),
            access_times: HashMap::with_capacity(max_size),
            max_size,
            metrics: BoundedMetrics {
                max_size,
                ..Default::default()
            },
        }
    }

    /// Insert key-value pair (auto-evicts LRU if needed)
    pub fn insert(&mut self, key: K, value: V) -> Option<V> {
        // Evict LRU if at capacity and key doesn't exist
        if self.inner.len() >= self.max_size && !self.inner.contains_key(&key) {
            self.evict_lru();
        }

        // Update access time
        self.access_times.insert(key.clone(), Instant::now());
        self.metrics.items_added += 1;

        let old = self.inner.insert(key, value);
        self.metrics.current_size = self.inner.len();
        old
    }

    /// Get value by key (updates access time)
    pub fn get(&mut self, key: &K) -> Option<&V> {
        if self.inner.contains_key(key) {
            self.access_times.insert(key.clone(), Instant::now());
            self.inner.get(key)
        } else {
            None
        }
    }

    /// Get value without updating access time
    pub fn get_no_touch(&self, key: &K) -> Option<&V> {
        self.inner.get(key)
    }

    /// Remove key-value pair
    pub fn remove(&mut self, key: &K) -> Option<V> {
        self.access_times.remove(key);
        let value = self.inner.remove(key);
        self.metrics.current_size = self.inner.len();
        value
    }

    /// Check if key exists
    pub fn contains_key(&self, key: &K) -> bool {
        self.inner.contains_key(key)
    }

    /// Current length
    pub fn len(&self) -> usize {
        self.inner.len()
    }

    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.inner.is_empty()
    }

    /// Check if full
    pub fn is_full(&self) -> bool {
        self.inner.len() >= self.max_size
    }

    /// Clear all items
    pub fn clear(&mut self) {
        self.inner.clear();
        self.access_times.clear();
        self.metrics.current_size = 0;
    }

    /// Get metrics
    pub fn metrics(&self) -> &BoundedMetrics {
        &self.metrics
    }

    /// Iterate over key-value pairs
    pub fn iter(&self) -> impl Iterator<Item = (&K, &V)> {
        self.inner.iter()
    }

    /// Evict least recently used item
    fn evict_lru(&mut self) {
        if let Some((oldest_key, _)) = self
            .access_times
            .iter()
            .min_by_key(|(_, time)| *time)
            .map(|(k, t)| (k.clone(), *t))
        {
            self.inner.remove(&oldest_key);
            self.access_times.remove(&oldest_key);
            self.metrics.items_evicted += 1;
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   TIME-BOUNDED VEC
// ═══════════════════════════════════════════════════════════════

/// Vec with time-based eviction (TTL)
pub struct TimeBoundedVec<T> {
    items: Vec<(T, Instant)>,
    ttl: std::time::Duration,
    metrics: BoundedMetrics,
}

impl<T> TimeBoundedVec<T> {
    /// Create new time-bounded Vec
    pub fn new(ttl_seconds: u64) -> Self {
        Self {
            items: Vec::new(),
            ttl: std::time::Duration::from_secs(ttl_seconds),
            metrics: BoundedMetrics {
                max_size: usize::MAX, // No hard limit, only time-based
                ..Default::default()
            },
        }
    }

    /// Push item with current timestamp
    pub fn push(&mut self, item: T) {
        self.gc();
        self.items.push((item, Instant::now()));
        self.metrics.items_added += 1;
        self.metrics.current_size = self.items.len();
    }

    /// Garbage collect expired items
    pub fn gc(&mut self) {
        let now = Instant::now();
        let before = self.items.len();

        self.items.retain(|(_, time)| {
            let elapsed = now.duration_since(*time);
            elapsed < self.ttl
        });

        let evicted = before - self.items.len();
        self.metrics.items_evicted += evicted as u64;
        self.metrics.current_size = self.items.len();
    }

    /// Get all valid items (triggers GC)
    pub fn items(&mut self) -> Vec<&T> {
        self.gc();
        self.items.iter().map(|(item, _)| item).collect()
    }

    /// Current length (including potentially expired)
    pub fn len(&self) -> usize {
        self.items.len()
    }

    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    /// Clear all items
    pub fn clear(&mut self) {
        self.items.clear();
        self.metrics.current_size = 0;
    }

    /// Get metrics
    pub fn metrics(&self) -> &BoundedMetrics {
        &self.metrics
    }
}

// ═══════════════════════════════════════════════════════════════
//   MEMORY SIZE TRAIT
// ═══════════════════════════════════════════════════════════════

/// Trait for estimating memory size
pub trait MemorySize {
    fn estimated_size(&self) -> usize;
}

impl MemorySize for String {
    fn estimated_size(&self) -> usize {
        std::mem::size_of::<String>() + self.capacity()
    }
}

impl<T: MemorySize> MemorySize for Vec<T> {
    fn estimated_size(&self) -> usize {
        std::mem::size_of::<Vec<T>>() + self.iter().map(|item| item.estimated_size()).sum::<usize>()
    }
}

impl<T: MemorySize> BoundedVecDeque<T> {
    /// Estimate current memory usage
    pub fn estimated_memory(&self) -> usize {
        std::mem::size_of::<Self>()
            + self
                .inner
                .iter()
                .map(|item| item.estimated_size())
                .sum::<usize>()
    }
}

impl<K: MemorySize, V: MemorySize> BoundedHashMap<K, V> {
    /// Estimate current memory usage
    pub fn estimated_memory(&self) -> usize {
        std::mem::size_of::<Self>()
            + self
                .inner
                .iter()
                .map(|(k, v)| k.estimated_size() + v.estimated_size())
                .sum::<usize>()
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bounded_vecdeque_capacity() {
        let mut deque = BoundedVecDeque::new(3);

        deque.push(1);
        deque.push(2);
        deque.push(3);
        assert_eq!(deque.len(), 3);

        // Should evict oldest (FIFO)
        deque.push(4);
        assert_eq!(deque.len(), 3);
        assert_eq!(deque.front(), Some(&2));
    }

    #[test]
    fn test_bounded_vecdeque_lifo() {
        let mut deque = BoundedVecDeque::with_policy(3, EvictionPolicy::LIFO);

        deque.push(1);
        deque.push(2);
        deque.push(3);

        // Should evict newest (LIFO) from back, which is 3
        deque.push(4);
        assert_eq!(deque.len(), 3);
        // After evicting 3, we have [1, 2, 4]
        assert_eq!(deque.back(), Some(&4));
        assert_eq!(deque.front(), Some(&1));
    }

    #[test]
    fn test_bounded_hashmap_lru() {
        let mut map = BoundedHashMap::new(3);

        map.insert("a", 1);
        map.insert("b", 2);
        map.insert("c", 3);

        // Access "a" to make it recently used
        let _ = map.get(&"a");

        // Insert new item should evict "b" (least recently used)
        map.insert("d", 4);

        assert!(map.contains_key(&"a"));
        assert!(!map.contains_key(&"b"));
        assert!(map.contains_key(&"c"));
        assert!(map.contains_key(&"d"));
    }

    #[test]
    fn test_time_bounded_vec() {
        let mut vec = TimeBoundedVec::new(1); // 1 second TTL

        vec.push("item1");
        assert_eq!(vec.len(), 1);

        // Immediate check should have item
        let items = vec.items();
        assert_eq!(items.len(), 1);

        // Sleep and check again (would need actual sleep for real test)
        // In real scenario, after 1+ seconds, GC would remove item
    }

    #[test]
    fn test_metrics() {
        let mut deque = BoundedVecDeque::new(2);

        deque.push(1);
        deque.push(2);
        deque.push(3); // Evicts 1

        let metrics = deque.metrics();
        assert_eq!(metrics.items_added, 3);
        assert_eq!(metrics.items_evicted, 1);
        assert_eq!(metrics.current_size, 2);
        assert_eq!(metrics.eviction_rate(), 1.0 / 3.0);
        assert_eq!(metrics.fill_rate(), 1.0);
    }
}
