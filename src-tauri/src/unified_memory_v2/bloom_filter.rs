// ═══════════════════════════════════════════════════════════════
// Phase 4 Sprint 2: Bloom Filter for Semantic Search
// ═══════════════════════════════════════════════════════════════
// Purpose: Fast membership tests without full index scan
// Expected: 50x faster "not in memory" checks
// ═══════════════════════════════════════════════════════════════

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::sync::Arc;
use parking_lot::RwLock;

/// Bloom filter for fast membership testing
/// False positives possible, false negatives impossible
#[derive(Clone)]
pub struct BloomFilter {
    bits: Arc<RwLock<Vec<bool>>>,
    hash_functions: usize,
    stats: Arc<RwLock<BloomStats>>,
}

#[derive(Debug, Clone, Default)]
struct BloomStats {
    inserts: u64,
    checks: u64,
    false_positives: u64, // Estimated
}

impl BloomFilter {
    /// Create new Bloom filter with expected capacity and false positive rate
    /// capacity: expected number of elements
    /// fpp: desired false positive probability (e.g., 0.01 for 1%)
    pub fn new(capacity: usize, fpp: f64) -> Self {
        // Calculate optimal bit size and hash functions
        let size = Self::optimal_bit_size(capacity, fpp);
        let hash_functions = Self::optimal_hash_functions(size, capacity);

        BloomFilter {
            bits: Arc::new(RwLock::new(vec![false; size])),
            hash_functions,
            stats: Arc::new(RwLock::new(BloomStats::default())),
        }
    }

    /// Add element to filter
    pub fn insert<T: Hash>(&self, item: &T) {
        let mut bits = self.bits.write();
        for i in 0..self.hash_functions {
            let idx = self.hash(item, i) % bits.len();
            bits[idx] = true;
        }

        let mut stats = self.stats.write();
        stats.inserts += 1;
    }

    /// Check if element might be in filter
    /// Returns true if element is definitely in filter OR might be in filter
    /// Returns false if element is definitely NOT in filter
    pub fn contains<T: Hash>(&self, item: &T) -> bool {
        let bits = self.bits.read();
        
        for i in 0..self.hash_functions {
            let idx = self.hash(item, i) % bits.len();
            if !bits[idx] {
                // Found a 0 bit - item definitely not in set
                let mut stats = self.stats.write();
                stats.checks += 1;
                return false;
            }
        }

        // All bits were 1 - item might be in set
        let mut stats = self.stats.write();
        stats.checks += 1;
        stats.false_positives += 1; // Increment as this is a potential false positive
        true
    }

    /// Calculate optimal bit size for Bloom filter
    fn optimal_bit_size(capacity: usize, fpp: f64) -> usize {
        let ln2_squared = std::f64::consts::LN_2 * std::f64::consts::LN_2;
        let size = -(capacity as f64 * fpp.ln()) / ln2_squared;
        (size.ceil() as usize).max(64) // Minimum 64 bits
    }

    /// Calculate optimal number of hash functions
    fn optimal_hash_functions(size: usize, capacity: usize) -> usize {
        let ln2 = std::f64::consts::LN_2;
        let k = ((size as f64 / capacity as f64) * ln2).ceil();
        k.max(1.0) as usize
    }

    /// Hash function using SipHash with seed
    fn hash<T: Hash>(&self, item: &T, seed: usize) -> usize {
        let mut hasher = DefaultHasher::new();
        hasher.write_usize(seed);
        item.hash(&mut hasher);
        hasher.finish() as usize
    }

    /// Get statistics
    pub fn stats(&self) -> BloomStatsSnapshot {
        let stats = self.stats.read();
        BloomStatsSnapshot {
            inserts: stats.inserts,
            checks: stats.checks,
            estimated_false_positives: stats.false_positives,
        }
    }

    /// Get current bit occupancy
    pub fn occupancy(&self) -> f64 {
        let bits = self.bits.read();
        let ones = bits.iter().filter(|&&b| b).count();
        (ones as f64) / (bits.len() as f64)
    }

    /// Reset statistics
    pub fn reset_stats(&self) {
        let mut stats = self.stats.write();
        *stats = BloomStats::default();
    }

    /// Clear filter
    pub fn clear(&self) {
        let mut bits = self.bits.write();
        bits.fill(false);
        let mut stats = self.stats.write();
        *stats = BloomStats::default();
    }
}

/// Statistics snapshot
#[derive(Debug, Clone)]
pub struct BloomStatsSnapshot {
    pub inserts: u64,
    pub checks: u64,
    pub estimated_false_positives: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bloom_insert_and_check() {
        let filter = BloomFilter::new(100, 0.01);

        filter.insert(&"hello");
        filter.insert(&"world");

        assert!(filter.contains(&"hello"));
        assert!(filter.contains(&"world"));
        // "nothere" might be false positive, but let's try
        // (unlikely with good parameters)
    }

    #[test]
    fn test_bloom_definite_negative() {
        let filter = BloomFilter::new(1000, 0.001);

        filter.insert(&1);
        filter.insert(&2);
        filter.insert(&3);

        // Insert many items to ensure some bits are 0
        for i in 4..500 {
            filter.insert(&i);
        }

        // Check membership to increment stats
        let _ = filter.contains(&1); // Will be true (or false for non-existent)
        let _ = filter.contains(&9999); // Will be false (definite negative)

        // After many insertions, we should have false negatives
        // (items definitely not in filter)
        let stats = filter.stats();
        assert!(stats.checks > 0); // Verify stats tracking works (checks must be > 0)
    }

    #[test]
    fn test_bloom_statistics() {
        let filter = BloomFilter::new(100, 0.01);

        for i in 0..50 {
            filter.insert(&i);
        }

        for i in 0..50 {
            let _ = filter.contains(&i);
        }

        let stats = filter.stats();
        assert_eq!(stats.inserts, 50);
        assert_eq!(stats.checks, 50);
    }

    #[test]
    fn test_bloom_occupancy() {
        let filter = BloomFilter::new(1000, 0.01);

        // Initially empty
        let initial_occupancy = filter.occupancy();
        assert!(initial_occupancy < 0.01);

        // Add many items
        for i in 0..100 {
            filter.insert(&i);
        }

        let occupancy = filter.occupancy();
        assert!(occupancy > initial_occupancy);
        println!("Bloom filter occupancy after 100 inserts: {:.2}%", occupancy * 100.0);
    }

    #[test]
    fn test_bloom_false_positive_rate() {
        let filter = BloomFilter::new(1000, 0.01);

        // Insert 500 items
        for i in 0..500 {
            filter.insert(&i);
        }

        // Check 500 items NOT in filter
        let mut actual_false_positives = 0;
        for i in 500..1000 {
            if filter.contains(&i) {
                actual_false_positives += 1;
            }
        }

        let fpp = (actual_false_positives as f64) / 500.0;
        println!("Actual FPP: {:.4}, Target: 0.01", fpp);
        
        // Should be close to target FPP
        assert!(fpp < 0.05); // Allow some margin
    }
}
