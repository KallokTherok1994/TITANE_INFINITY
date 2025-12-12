//! ═══════════════════════════════════════════════════════════════════
//! TITANE∞ v21.5 — UNIFIED API GATEWAY (Rust Backend)
//! Plan d'implémentation complet
//! ═══════════════════════════════════════════════════════════════════

/**
 * ARCHITECTURE MODULES
 * ─────────────────────────────────────────────────────────────────
 * 
 * src-tauri/src/gateway/
 *   ├── mod.rs              ✅ Public API + command registration
 *   ├── config.rs           ✅ GatewayConfig + defaults
 *   ├── router.rs           ✅ Smart provider selection
 *   ├── cache.rs            🧠 Cognitive cache (singularity-aware)
 *   ├── circuit_breaker.rs  🔧 Self-healing circuit breaker
 *   ├── metrics.rs          📊 Unified observability
 *   ├── retry.rs            ♻️ Adaptive retry logic
 *   ├── rate_limiter.rs     💰 Cost control
 *   └── providers/
 *       ├── mod.rs          ✅ Provider trait
 *       ├── gemini.rs       ✅ Already exists (adapt)
 *       ├── openai.rs       ✅ Already exists (adapt)
 *       ├── claude.rs       ✅ Already exists (adapt)
 *       └── ollama.rs       ✅ Already exists (adapt)
 */

// ═══════════════════════════════════════════════════════════════════
// STEP 1: Provider Trait (Common Interface)
// ═══════════════════════════════════════════════════════════════════

/// File: src-tauri/src/gateway/providers/mod.rs

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderRequest {
    pub message: String,
    pub history: Vec<ChatMessage>,
    pub temperature: f32,
    pub max_tokens: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderResponse {
    pub content: String,
    pub model: String,
    pub tokens: Option<u32>,
    pub finish_reason: Option<String>,
}

#[derive(Debug)]
pub struct ProviderError {
    pub kind: ErrorKind,
    pub message: String,
    pub retryable: bool,
}

#[derive(Debug)]
pub enum ErrorKind {
    NetworkError,
    RateLimitExceeded,
    InvalidApiKey,
    Timeout,
    ServerError,
    Other,
}

/// Trait commun pour tous les providers
#[async_trait]
pub trait Provider: Send + Sync {
    /// Nom du provider
    fn name(&self) -> &str;
    
    /// Tester disponibilité
    async fn health_check(&self) -> Result<bool, ProviderError>;
    
    /// Générer réponse
    async fn generate(&self, request: ProviderRequest) -> Result<ProviderResponse, ProviderError>;
    
    /// Coût estimé par token (USD)
    fn cost_per_token(&self) -> f64;
}

// ═══════════════════════════════════════════════════════════════════
// STEP 2: Cognitive Cache Implementation
// ═══════════════════════════════════════════════════════════════════

/// File: src-tauri/src/gateway/cache.rs

use dashmap::DashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};

#[derive(Clone)]
pub struct CacheEntry {
    pub value: String,
    pub created_at: Instant,
    pub ttl: Duration,
    pub access_count: u32,
    pub pattern_id: Option<String>, // Lien avec SingularityMemory
}

pub struct CognitiveCache {
    store: Arc<DashMap<String, CacheEntry>>,
    max_size: usize,
    default_ttl: Duration,
    
    // 🧠 Cognitive integration
    consciousness_threshold: f64,
    current_consciousness: Arc<parking_lot::RwLock<f64>>,
}

impl CognitiveCache {
    pub fn new(max_size: usize, default_ttl: Duration) -> Self {
        Self {
            store: Arc::new(DashMap::new()),
            max_size,
            default_ttl,
            consciousness_threshold: 60.0,
            current_consciousness: Arc::new(parking_lot::RwLock::new(100.0)),
        }
    }
    
    /// 🧠 Mettre à jour niveau de conscience
    pub fn update_consciousness(&self, level: f64) {
        *self.current_consciousness.write() = level;
    }
    
    /// Obtenir entrée si valide cognitivement
    pub fn get(&self, key: &str) -> Option<String> {
        // 🧠 Check consciousness threshold
        let consciousness = *self.current_consciousness.read();
        if consciousness < self.consciousness_threshold {
            // Système incohérent, invalider cache
            return None;
        }
        
        if let Some(mut entry) = self.store.get_mut(key) {
            // Check TTL
            if entry.created_at.elapsed() > entry.ttl {
                drop(entry);
                self.store.remove(key);
                return None;
            }
            
            // Update access count
            entry.access_count += 1;
            
            // 🧠 Extend TTL for frequent patterns
            if entry.access_count > 10 {
                entry.ttl = self.default_ttl * 2;
            }
            
            Some(entry.value.clone())
        } else {
            None
        }
    }
    
    /// Stocker avec TTL adaptatif
    pub fn set(&self, key: String, value: String, pattern_id: Option<String>) {
        // Evict LRU if full
        if self.store.len() >= self.max_size {
            self.evict_lru();
        }
        
        let entry = CacheEntry {
            value,
            created_at: Instant::now(),
            ttl: self.default_ttl,
            access_count: 1,
            pattern_id,
        };
        
        self.store.insert(key, entry);
    }
    
    fn evict_lru(&self) {
        // Find least recently used (lowest access_count)
        let mut min_access = u32::MAX;
        let mut evict_key = None;
        
        for entry in self.store.iter() {
            if entry.access_count < min_access {
                min_access = entry.access_count;
                evict_key = Some(entry.key().clone());
            }
        }
        
        if let Some(key) = evict_key {
            self.store.remove(&key);
        }
    }
    
    pub fn stats(&self) -> CacheStats {
        CacheStats {
            size: self.store.len(),
            consciousness: *self.current_consciousness.read(),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct CacheStats {
    pub size: usize,
    pub consciousness: f64,
}

// ═══════════════════════════════════════════════════════════════════
// STEP 3: Circuit Breaker
// ═══════════════════════════════════════════════════════════════════

/// File: src-tauri/src/gateway/circuit_breaker.rs

use std::sync::Arc;
use parking_lot::RwLock;
use std::collections::HashMap;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum CircuitState {
    Closed,    // Normal operation
    Open,      // Too many failures, reject requests
    HalfOpen,  // Testing recovery
}

struct CircuitStatus {
    state: CircuitState,
    failure_count: u32,
    success_count: u32,
    last_failure: Option<Instant>,
}

pub struct CircuitBreaker {
    circuits: Arc<RwLock<HashMap<String, CircuitStatus>>>,
    failure_threshold: u32,
    recovery_timeout: Duration,
    half_open_requests: u32,
}

impl CircuitBreaker {
    pub fn new(failure_threshold: u32, recovery_timeout: Duration) -> Self {
        Self {
            circuits: Arc::new(RwLock::new(HashMap::new())),
            failure_threshold,
            recovery_timeout,
            half_open_requests: 3,
        }
    }
    
    pub fn allow_request(&self, provider: &str) -> bool {
        let mut circuits = self.circuits.write();
        let status = circuits.entry(provider.to_string())
            .or_insert(CircuitStatus {
                state: CircuitState::Closed,
                failure_count: 0,
                success_count: 0,
                last_failure: None,
            });
        
        match status.state {
            CircuitState::Closed => true,
            CircuitState::Open => {
                // Check if recovery timeout passed
                if let Some(last_failure) = status.last_failure {
                    if last_failure.elapsed() > self.recovery_timeout {
                        status.state = CircuitState::HalfOpen;
                        status.success_count = 0;
                        true
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            CircuitState::HalfOpen => {
                status.success_count < self.half_open_requests
            }
        }
    }
    
    pub fn record_success(&self, provider: &str) {
        let mut circuits = self.circuits.write();
        if let Some(status) = circuits.get_mut(provider) {
            match status.state {
                CircuitState::HalfOpen => {
                    status.success_count += 1;
                    if status.success_count >= self.half_open_requests {
                        status.state = CircuitState::Closed;
                        status.failure_count = 0;
                    }
                }
                CircuitState::Closed => {
                    status.failure_count = 0;
                }
                _ => {}
            }
        }
    }
    
    pub fn record_failure(&self, provider: &str) {
        let mut circuits = self.circuits.write();
        if let Some(status) = circuits.get_mut(provider) {
            status.failure_count += 1;
            status.last_failure = Some(Instant::now());
            
            if status.failure_count >= self.failure_threshold {
                status.state = CircuitState::Open;
            }
        }
    }
    
    pub fn get_state(&self, provider: &str) -> CircuitState {
        self.circuits.read()
            .get(provider)
            .map(|s| s.state)
            .unwrap_or(CircuitState::Closed)
    }
}

// ═══════════════════════════════════════════════════════════════════
// STEP 4: Provider Router (Smart Selection)
// ═══════════════════════════════════════════════════════════════════

/// File: src-tauri/src/gateway/router.rs

use super::circuit_breaker::{CircuitBreaker, CircuitState};

pub struct ProviderRouter {
    circuit_breaker: Arc<CircuitBreaker>,
    default_provider: String,
}

impl ProviderRouter {
    pub fn new(circuit_breaker: Arc<CircuitBreaker>, default_provider: String) -> Self {
        Self {
            circuit_breaker,
            default_provider,
        }
    }
    
    /// Sélectionner provider optimal
    pub fn select_provider(
        &self,
        available_providers: &[String],
        forced_provider: Option<&str>,
    ) -> Option<String> {
        // 1. Si provider forcé et circuit fermé
        if let Some(forced) = forced_provider {
            if self.circuit_breaker.allow_request(forced) {
                return Some(forced.to_string());
            }
        }
        
        // 2. Essayer default provider
        if self.circuit_breaker.allow_request(&self.default_provider) {
            return Some(self.default_provider.clone());
        }
        
        // 3. Fallback cascade
        for provider in available_providers {
            if self.circuit_breaker.allow_request(provider) {
                return Some(provider.clone());
            }
        }
        
        None
    }
    
    pub fn get_fallback_chain(&self, failed_provider: &str) -> Vec<String> {
        let all_providers = vec!["gemini", "openai", "claude", "ollama"];
        
        all_providers
            .iter()
            .filter(|p| *p != failed_provider)
            .filter(|p| self.circuit_breaker.get_state(p) != CircuitState::Open)
            .map(|s| s.to_string())
            .collect()
    }
}

// ═══════════════════════════════════════════════════════════════════
// STEP 5: Main Gateway
// ═══════════════════════════════════════════════════════════════════

/// File: src-tauri/src/gateway/mod.rs

use serde::{Deserialize, Serialize};
use std::sync::Arc;

pub mod config;
pub mod cache;
pub mod circuit_breaker;
pub mod router;
pub mod providers;

use cache::CognitiveCache;
use circuit_breaker::CircuitBreaker;
use router::ProviderRouter;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedChatRequest {
    pub message: String,
    pub history: Vec<providers::ChatMessage>,
    pub mode: Option<String>,
    pub force_provider: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedChatResponse {
    pub content: String,
    pub provider: String,
    pub model: String,
    pub latency_ms: u64,
    pub cached: bool,
    pub retries: u32,
}

pub struct APIGateway {
    cache: Arc<CognitiveCache>,
    circuit_breaker: Arc<CircuitBreaker>,
    router: Arc<ProviderRouter>,
    
    // Providers (à injecter)
    providers: Arc<DashMap<String, Box<dyn Provider>>>,
}

impl APIGateway {
    pub fn new() -> Self {
        let cache = Arc::new(CognitiveCache::new(100, Duration::from_secs(300)));
        let circuit_breaker = Arc::new(CircuitBreaker::new(3, Duration::from_secs(30)));
        let router = Arc::new(ProviderRouter::new(
            circuit_breaker.clone(),
            "gemini".to_string()
        ));
        
        Self {
            cache,
            circuit_breaker,
            router,
            providers: Arc::new(DashMap::new()),
        }
    }
    
    /// 🎯 Point d'entrée principal
    pub async fn chat(&self, request: UnifiedChatRequest) -> Result<UnifiedChatResponse, String> {
        let start = Instant::now();
        
        // 1. Generate cache key
        let cache_key = self.generate_cache_key(&request);
        
        // 2. Check cache
        if let Some(cached_content) = self.cache.get(&cache_key) {
            return Ok(UnifiedChatResponse {
                content: cached_content,
                provider: "cache".to_string(),
                model: "cached".to_string(),
                latency_ms: start.elapsed().as_millis() as u64,
                cached: true,
                retries: 0,
            });
        }
        
        // 3. Select provider
        let providers_list = vec!["gemini".to_string(), "openai".to_string(), "claude".to_string()];
        let selected = self.router.select_provider(
            &providers_list,
            request.force_provider.as_deref()
        ).ok_or("No available provider")?;
        
        // 4. Execute with retries
        let mut retries = 0;
        let max_retries = 3;
        
        loop {
            match self.execute_provider(&selected, &request).await {
                Ok(response) => {
                    self.circuit_breaker.record_success(&selected);
                    
                    // 5. Cache result
                    self.cache.set(cache_key, response.content.clone(), None);
                    
                    return Ok(UnifiedChatResponse {
                        content: response.content,
                        provider: selected,
                        model: response.model,
                        latency_ms: start.elapsed().as_millis() as u64,
                        cached: false,
                        retries,
                    });
                }
                Err(e) if retries < max_retries && e.retryable => {
                    retries += 1;
                    tokio::time::sleep(Duration::from_millis(1000 * retries as u64)).await;
                }
                Err(e) => {
                    self.circuit_breaker.record_failure(&selected);
                    return Err(format!("Provider failed: {}", e.message));
                }
            }
        }
    }
    
    async fn execute_provider(
        &self,
        provider_name: &str,
        request: &UnifiedChatRequest
    ) -> Result<providers::ProviderResponse, providers::ProviderError> {
        let provider = self.providers.get(provider_name)
            .ok_or(providers::ProviderError {
                kind: providers::ErrorKind::Other,
                message: format!("Provider {} not found", provider_name),
                retryable: false,
            })?;
        
        let provider_request = providers::ProviderRequest {
            message: request.message.clone(),
            history: request.history.clone(),
            temperature: request.temperature.unwrap_or(0.7),
            max_tokens: request.max_tokens.unwrap_or(2048),
        };
        
        provider.generate(provider_request).await
    }
    
    fn generate_cache_key(&self, request: &UnifiedChatRequest) -> String {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(request.message.as_bytes());
        for msg in &request.history {
            hasher.update(msg.content.as_bytes());
        }
        format!("{:x}", hasher.finalize())
    }
    
    /// 🧠 Connecter SingularityKernel
    pub fn update_consciousness(&self, level: f64) {
        self.cache.update_consciousness(level);
    }
}

// ═══════════════════════════════════════════════════════════════════
// STEP 6: Tauri Command
// ═══════════════════════════════════════════════════════════════════

/// File: src-tauri/src/commands/gateway.rs

use tauri::State;
use crate::gateway::{APIGateway, UnifiedChatRequest, UnifiedChatResponse};

#[tauri::command]
pub async fn unified_chat(
    request: UnifiedChatRequest,
    gateway: State<'_, APIGateway>,
) -> Result<UnifiedChatResponse, String> {
    gateway.chat(request).await
}

#[tauri::command]
pub async fn update_gateway_consciousness(
    level: f64,
    gateway: State<'_, APIGateway>,
) -> Result<(), String> {
    gateway.update_consciousness(level);
    Ok(())
}

/**
 * REGISTRATION dans main.rs:
 * 
 * fn main() {
 *     let gateway = APIGateway::new();
 *     
 *     tauri::Builder::default()
 *         .manage(gateway)
 *         .invoke_handler(tauri::generate_handler![
 *             unified_chat,
 *             update_gateway_consciousness,
 *         ])
 *         .run(tauri::generate_context!())
 *         .expect("error while running tauri application");
 * }
 */
