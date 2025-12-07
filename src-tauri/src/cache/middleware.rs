// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.2 — Cache Middleware for Tauri Commands
//   P2-2: Intelligent caching integration with IPC
// ═══════════════════════════════════════════════════════════════

use super::{IntelligentCache, CacheKey, CacheConfig};
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::sync::Arc;
use std::time::Duration;
use once_cell::sync::Lazy;

// ────────────────────────────────────────────────────────────────
// Global Cache Instance
// ────────────────────────────────────────────────────────────────

/// Global cache instance (singleton pattern)
pub static GLOBAL_CACHE: Lazy<Arc<IntelligentCache>> = Lazy::new(|| {
    Arc::new(IntelligentCache::new(CacheConfig {
        max_entries: 1000,
        default_ttl: Duration::from_secs(5),
        enable_persistence: false,
        persistence_path: None,
    }))
});

// ────────────────────────────────────────────────────────────────
// Cache Strategy
// ────────────────────────────────────────────────────────────────

/// Cache strategy for different command types
#[derive(Debug, Clone, Copy)]
pub enum CacheStrategy {
    /// No caching
    None,
    /// Cache with custom TTL
    Custom(Duration),
    /// Fast commands (TTL: 2s)
    Fast,
    /// Standard commands (TTL: 5s)
    Standard,
    /// Long-lived data (TTL: 30s)
    Long,
}

impl CacheStrategy {
    pub fn ttl(&self) -> Option<Duration> {
        match self {
            CacheStrategy::None => None,
            CacheStrategy::Custom(duration) => Some(*duration),
            CacheStrategy::Fast => Some(Duration::from_secs(2)),
            CacheStrategy::Standard => Some(Duration::from_secs(5)),
            CacheStrategy::Long => Some(Duration::from_secs(30)),
        }
    }
}

// ────────────────────────────────────────────────────────────────
// Cached Invoke Wrapper
// ────────────────────────────────────────────────────────────────

/// Execute a command with automatic caching
///
/// # Example
/// ```rust
/// let result = cached_invoke(
///     "get_system_health",
///     json!({}),
///     CacheStrategy::Fast,
///     || async {
///         // Actual command execution
///         system_health::get_health().await
///     }
/// ).await?;
/// ```
pub async fn cached_invoke<T, F, Fut>(
    command: &str,
    params: serde_json::Value,
    strategy: CacheStrategy,
    executor: F,
) -> Result<T, String>
where
    T: DeserializeOwned + Serialize,
    F: FnOnce() -> Fut,
    Fut: std::future::Future<Output = Result<T, String>>,
{
    // If no caching, execute directly
    let ttl = match strategy.ttl() {
        Some(duration) => duration,
        None => return executor().await,
    };

    // Create cache key
    let cache_key = CacheKey::new(command, params.clone());

    // Try to get from cache
    if let Some(cached_value) = GLOBAL_CACHE.get::<T>(&cache_key) {
        return Ok(cached_value);
    }

    // Cache miss - execute command
    let result = executor().await?;

    // Store in cache (serialize as JSON)
    let json_value = serde_json::to_value(&result)
        .map_err(|e| format!("Cache serialization failed: {}", e))?;

    GLOBAL_CACHE.set(cache_key, json_value, ttl);

    Ok(result)
}

/// Execute a command with automatic caching (sync version)
pub fn cached_invoke_sync<T, F>(
    command: &str,
    params: serde_json::Value,
    strategy: CacheStrategy,
    executor: F,
) -> Result<T, String>
where
    T: DeserializeOwned + Serialize,
    F: FnOnce() -> Result<T, String>,
{
    // If no caching, execute directly
    let ttl = match strategy.ttl() {
        Some(duration) => duration,
        None => return executor(),
    };

    // Create cache key
    let cache_key = CacheKey::new(command, params.clone());

    // Try to get from cache
    if let Some(cached_value) = GLOBAL_CACHE.get::<T>(&cache_key) {
        return Ok(cached_value);
    }

    // Cache miss - execute command
    let result = executor()?;

    // Store in cache
    let json_value = serde_json::to_value(&result)
        .map_err(|e| format!("Cache serialization failed: {}", e))?;

    GLOBAL_CACHE.set(cache_key, json_value, ttl);

    Ok(result)
}

// ────────────────────────────────────────────────────────────────
// Cache Management Commands
// ────────────────────────────────────────────────────────────────

/// Invalidate cache by pattern (prefix)
pub fn invalidate_cache_pattern(pattern: &str) {
    GLOBAL_CACHE.invalidate_pattern(pattern);
}

/// Clear all cache
pub fn clear_cache() {
    GLOBAL_CACHE.clear();
}

/// Get cache metrics
pub fn get_cache_metrics() -> serde_json::Value {
    let metrics = GLOBAL_CACHE.metrics();
    serde_json::json!({
        "hits": metrics.hits(),
        "misses": metrics.misses(),
        "evictions": metrics.evictions(),
        "total_queries": metrics.total_queries(),
        "hit_rate": metrics.hit_rate(),
    })
}

/// Cleanup expired entries
pub fn cleanup_cache() {
    GLOBAL_CACHE.cleanup_expired();
}

// ────────────────────────────────────────────────────────────────
// Tauri Commands (for external access)
// ────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn cache_invalidate_pattern(pattern: String) -> Result<(), String> {
    invalidate_cache_pattern(&pattern);
    Ok(())
}

#[tauri::command]
pub fn cache_clear() -> Result<(), String> {
    clear_cache();
    Ok(())
}

#[tauri::command]
pub fn cache_get_metrics() -> Result<serde_json::Value, String> {
    Ok(get_cache_metrics())
}

#[tauri::command]
pub fn cache_cleanup() -> Result<(), String> {
    cleanup_cache();
    Ok(())
}

// ────────────────────────────────────────────────────────────────
// Helper Macros
// ────────────────────────────────────────────────────────────────

/// Macro to quickly wrap a command with caching
///
/// # Example
/// ```rust
/// #[tauri::command]
/// pub async fn get_system_health() -> Result<SystemHealth, String> {
///     cache_or_execute!("get_system_health", {}, CacheStrategy::Fast, {
///         // Your actual implementation
///         system_health::compute_health().await
///     })
/// }
/// ```
#[macro_export]
macro_rules! cache_or_execute {
    ($command:expr, $params:expr, $strategy:expr, $block:block) => {
        $crate::cache::middleware::cached_invoke(
            $command,
            serde_json::json!($params),
            $strategy,
            || async move { $block },
        )
        .await
    };
}
