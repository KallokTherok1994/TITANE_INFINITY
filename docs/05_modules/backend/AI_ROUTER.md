# 🛣️ AI Router — Module Documentation

**Version:** v24.2.0  
**Module Path:** `src-tauri/src/ai/router.rs`  
**Type:** Backend (Rust)  
**Lines:** 431  
**Complexity:** ⭐⭐⭐⭐ (Advanced)

---

## 📋 MODULE OVERVIEW

### Purpose

AI Router est le **routeur intelligent central** pour toutes les requêtes AI de TITANE∞. Il sélectionne automatiquement le meilleur provider AI disponible et gère les fallbacks en cascade.

### Responsibilities

1. **Provider Selection** — Sélection intelligente du provider optimal (UnifiedIA, Gemini, Ollama)
2. **Health Checks** — Vérification santé providers (internet, API keys, services running)
3. **Cascade Fallback** — Fallback automatique si provider failed (UnifiedIA → Gemini → Ollama)
4. **Response Caching** — Cache LRU avec TTL 5min (optimisation latence)
5. **Status Management** — Tracking état système (Online, Degraded, Offline)

### Components

- **AIRouter** (struct principale)
- **Provider clients** (GeminiClient, OllamaClient, UnifiedIAEngine)
- **AIRouterCache** (LRU cache responses + provider statuses)
- **Status tracking** (Online/Degraded/Offline)

---

## 🏗️ ARCHITECTURE

### Cascade Strategy Flow

```
┌────────────────────────────────────────────────────────────┐
│                    AI ROUTER v20.1                         │
│                 (Intelligent Routing + Cache)              │
└────────────────────────────────────────────────────────────┘
                            ↓
    ┌──────────────────────────────────────────────────┐
    │  STAGE 0: CACHE CHECK (instant, ~0ms)            │
    │  - LRU cache avec TTL 5min                       │
    │  - Cache hit → Return immediately                │
    │  - Cache miss → Continue cascade                 │
    └──────────────────────────────────────────────────┘
                            ↓
    ┌──────────────────────────────────────────────────┐
    │  STAGE 1: UNIFIED IA ENGINE (primary, ~800-1500ms│
    │  - Claude (Anthropic) → OpenAI (GPT-4) fallback  │
    │  - Internal cascade (Claude first, OpenAI second)│
    │  - If success → Cache + Return                   │
    │  - If failed → Continue cascade                  │
    └──────────────────────────────────────────────────┘
                            ↓
    ┌──────────────────────────────────────────────────┐
    │  STAGE 2: GEMINI API (secondary, ~800-1200ms)    │
    │  - Check internet + API key configured           │
    │  - If success → Cache + Return                   │
    │  - If failed → Continue cascade                  │
    └──────────────────────────────────────────────────┘
                            ↓
    ┌──────────────────────────────────────────────────┐
    │  STAGE 3: OLLAMA LOCAL (tertiary, ~500-800ms)    │
    │  - Check localhost:11434 (Ollama daemon running) │
    │  - If success → Cache + Return                   │
    │  - If failed → Return error (no provider)        │
    └──────────────────────────────────────────────────┘
                            ↓
    ┌──────────────────────────────────────────────────┐
    │  ERROR: NO PROVIDER AVAILABLE                    │
    │  - Return AIError::NoProviderAvailable           │
    └──────────────────────────────────────────────────┘
```

### Local Mode Force (v21)

```rust
// Force Ollama if provider_preference = "local" or "ollama"
if request.provider_preference == "local" || "ollama" {
    // Bypass cascade, go direct to Ollama
    return query_ollama_direct(&request);
}
```

---

## 🔧 API REFERENCE

### Core Struct: `AIRouter`

```rust
pub struct AIRouter {
    gemini_client: Option<Arc<GeminiClient>>,
    ollama_client: Arc<OllamaClient>,
    unified_ia: Option<Arc<UnifiedIAEngine>>, // Claude + OpenAI
    status: Arc<RwLock<AIRouterStatus>>,
    cache: Arc<AIRouterCache>, // LRU cache v20.1
}
```

**Fields:**
- `gemini_client` — Optional Gemini API client (requires API key)
- `ollama_client` — Always present Ollama local client
- `unified_ia` — Optional UnifiedIA engine (Claude + OpenAI cascade)
- `status` — Current router status (Online, Degraded, Offline)
- `cache` — LRU cache (responses 5min TTL, provider statuses 30s TTL)

### Methods

#### `new(gemini_api_key: Option<String>, ollama_model: Option<String>) -> Self`

**Description:** Constructeur AIRouter v20.1 avec cache intégré

**Parameters:**
- `gemini_api_key` — Optional Gemini API key (si configured)
- `ollama_model` — Optional Ollama model name (default: "llama3")

**Returns:** `Self` (AIRouter instance)

**Example:**
```rust
let router = AIRouter::new(
    Some("YOUR_GEMINI_API_KEY".to_string()),
    Some("llama3".to_string())
);
```

---

#### `set_unified_ia(&mut self, unified_ia: Arc<UnifiedIAEngine>)`

**Description:** Attacher UnifiedIAEngine (Claude + OpenAI) au router

**Parameters:**
- `unified_ia` — Arc reference to UnifiedIAEngine

**Example:**
```rust
let unified_ia = Arc::new(UnifiedIAEngine::new());
router.set_unified_ia(unified_ia);
// Logs: "[AI Router v15] ✅ UnifiedIA Engine attached"
```

---

#### `query(&self, request: AIRequest) -> AIResult<AIResponse>`

**Description:** Main query method — cascade fallback automatique (Cache → UnifiedIA → Gemini → Ollama)

**Parameters:**
- `request` — AIRequest struct (prompt, temperature, max_tokens, provider_preference)

**Returns:** `AIResult<AIResponse>` (success) or `AIError::NoProviderAvailable` (all failed)

**Cascade Strategy:**
1. **Cache check** (TTL 5min) → Instant return si hit
2. **UnifiedIA** (Claude → OpenAI) → Cache + Return si success
3. **Gemini API** (if internet + API key) → Cache + Return si success
4. **Ollama local** (localhost:11434) → Cache + Return si success
5. **Error** → AIError::NoProviderAvailable

**Example:**
```rust
let request = AIRequest {
    prompt: "Explain AI routing".to_string(),
    temperature: 0.7,
    max_tokens: 500,
    provider_preference: None, // Auto cascade
};

let response = router.query(request).await?;
println!("Response: {}", response.content);
println!("Provider used: {:?}", response.provider);
println!("Tokens: {}", response.tokens);
```

**Logging:**
```
[AI Router v20.1] Query: prompt_len=17, temp=0.7, max_tokens=500
[AI Router v20.1] ✓ CACHE HIT: 42 tokens, 0ms   // If cached
[AI Router v15] Trying UnifiedIA (Claude→OpenAI) (primary)
[AI Router v20.1] ✓ UnifiedIA success: Claude engine, 42 tokens, 1250ms
```

---

#### `query_ollama_direct(&self, request: &AIRequest) -> AIResult<AIResponse>`

**Description:** Force direct Ollama query (bypass cascade) — used for local mode

**Parameters:**
- `request` — AIRequest reference

**Returns:** `AIResult<AIResponse>` or error

**Example:**
```rust
// v21 Local Mode Force
let request = AIRequest {
    provider_preference: Some("local".to_string()), // Force Ollama
    ..default
};

// Automatically routed to Ollama (no cascade)
let response = router.query(request).await?;
// Logs: "[AI Router v21] 🏠 LOCAL MODE FORCED - Direct Ollama"
```

---

#### `get_status(&self) -> AIRouterStatus`

**Description:** Get current router status

**Returns:** `AIRouterStatus` enum (Online, Degraded, Offline)

**Example:**
```rust
let status = router.get_status().await;
match status {
    AIRouterStatus::Online => println!("✅ All providers available"),
    AIRouterStatus::Degraded => println!("⚠️ Only Ollama available"),
    AIRouterStatus::Offline => println!("❌ No provider available"),
}
```

---

#### `get_available_providers(&self) -> Vec<AIProvider>`

**Description:** Liste providers disponibles actuellement

**Returns:** `Vec<AIProvider>` (Gemini, Ollama)

**Example:**
```rust
let providers = router.get_available_providers();
for provider in providers {
    println!("Available: {:?}", provider);
}
// Output: "Available: Gemini", "Available: Ollama"
```

---

#### `health_check(&self) -> serde_json::Value`

**Description:** Health check complet du router (JSON report)

**Returns:** JSON health report

**Example:**
```rust
let health = router.health_check().await;
println!("{}", serde_json::to_string_pretty(&health)?);
```

**Output:**
```json
{
  "status": "Online",
  "internet": true,
  "gemini": {
    "configured": true,
    "available": true
  },
  "ollama": {
    "available": true,
    "models": ["llama3", "gemini-pro"]
  },
  "unified_ia": {
    "available": true,
    "engines": ["Claude", "OpenAI"]
  },
  "cache": {
    "hits": 42,
    "misses": 15,
    "hit_rate": 0.74
  }
}
```

---

## 🧩 SUB-MODULES

### `cache.rs` — AI Router Cache

**Purpose:** LRU cache pour réponses AI + provider statuses (optimisation performance)

**Key Struct:**
```rust
pub struct AIRouterCache {
    response_cache: Arc<RwLock<LruCache<String, CachedAIResponse>>>,
    status_cache: Arc<RwLock<LruCache<String, bool>>>,
    response_ttl: Duration, // 5min
    status_ttl: Duration,   // 30s
}
```

**Methods:**
- `get_response(prompt, temp, max_tokens) -> Option<CachedAIResponse>` — Retrieve cached response
- `set_response(prompt, temp, max_tokens, response)` — Cache response (TTL 5min)
- `get_provider_status(provider) -> Option<bool>` — Check cached provider availability
- `set_provider_status(provider, available)` — Cache provider status (TTL 30s)

**Cache Benefits:**
- ⚡ **Instant responses** (~0ms latency si cache hit)
- 📉 **Reduced API costs** (avoid duplicate queries)
- 🔋 **Lower bandwidth** (less network calls)

---

### `gemini.rs` — Gemini Client

**Purpose:** Google Gemini API client

**Key Methods:**
- `new(api_key: String) -> Self` — Create Gemini client
- `is_available() -> bool` — Check if API key configured
- `query(&self, request: &AIRequest) -> AIResult<AIResponse>` — Query Gemini API

**Provider Details:**
- **Model:** `gemini-1.5-pro` (default)
- **Latency:** ~800-1200ms
- **Requires:** Internet + API key
- **Fallback:** If failed, cascade to Ollama

---

### `ollama.rs` — Ollama Client

**Purpose:** Ollama local AI client (localhost:11434)

**Key Methods:**
- `new(model: Option<String>) -> Self` — Create Ollama client
- `is_available() -> bool` — Check localhost:11434 daemon running
- `query(&self, request: &AIRequest) -> AIResult<AIResponse>` — Query Ollama

**Provider Details:**
- **Model:** `llama3` (default, configurable)
- **Latency:** ~500-800ms (local, no network)
- **Requires:** Ollama daemon running (systemctl start ollama)
- **Fallback:** Ultimate fallback (if all others failed)

---

## 💾 DATA STRUCTURES

### `AIRequest`

```rust
pub struct AIRequest {
    pub prompt: String,
    pub temperature: f32,          // 0.0 → 1.0
    pub max_tokens: usize,
    pub provider_preference: Option<String>, // "local", "ollama", "gemini", etc.
}
```

**Fields:**
- `prompt` — User query or prompt
- `temperature` — Creativity level (0.0 = deterministic, 1.0 = creative)
- `max_tokens` — Maximum response length
- `provider_preference` — Force specific provider (optional)

---

### `AIResponse`

```rust
pub struct AIResponse {
    pub content: String,
    pub tokens: usize,
    pub provider: AIProvider,
    pub timestamp: i64,
}
```

**Fields:**
- `content` — AI-generated response text
- `tokens` — Token count used
- `provider` — Provider used (Gemini, Ollama, UnifiedIA)
- `timestamp` — Unix timestamp response generated

---

### `AIProvider` (enum)

```rust
pub enum AIProvider {
    Gemini,
    Ollama,
    Offline,
}
```

**Variants:**
- `Gemini` — Google Gemini API
- `Ollama` — Ollama local AI
- `Offline` — No provider available (error state)

---

### `AIRouterStatus` (enum)

```rust
pub enum AIRouterStatus {
    Online,   // Gemini + Ollama available
    Degraded, // Only Ollama available (no internet/API key)
    Offline,  // No provider available
}
```

---

## 🧪 TESTING

### Unit Tests

**Location:** `src-tauri/src/ai/router.rs` (bottom of file, `#[cfg(test)]`)

**Key Tests:**

1. **test_router_new** — AIRouter initialization
   ```rust
   #[test]
   fn test_router_new() {
       let router = AIRouter::new(Some("test_key".to_string()), None);
       assert!(router.gemini_client.is_some());
   }
   ```

2. **test_cache_hit** — Cache hit scenario
   ```rust
   #[tokio::test]
   async fn test_cache_hit() {
       // First query (cache miss)
       let response1 = router.query(request.clone()).await.unwrap();
       
       // Second query (cache hit, instant)
       let start = Instant::now();
       let response2 = router.query(request).await.unwrap();
       let elapsed = start.elapsed().as_millis();
       
       assert_eq!(response1.content, response2.content);
       assert!(elapsed < 10); // Instant (cache hit)
   }
   ```

3. **test_cascade_fallback** — UnifiedIA → Gemini → Ollama
   ```rust
   #[tokio::test]
   async fn test_cascade_fallback() {
       // UnifiedIA unavailable → Should fallback to Gemini
       let router = AIRouter::new(Some("test_key".to_string()), None);
       // (do not attach unified_ia)
       
       let response = router.query(request).await.unwrap();
       assert_eq!(response.provider, AIProvider::Gemini);
   }
   ```

4. **test_local_mode_force** — Force Ollama (v21)
   ```rust
   #[tokio::test]
   async fn test_local_mode_force() {
       let request = AIRequest {
           provider_preference: Some("local".to_string()),
           ..default
       };
       
       let response = router.query(request).await.unwrap();
       assert_eq!(response.provider, AIProvider::Ollama);
   }
   ```

---

## ⚡ PERFORMANCE

### Latency Benchmarks

| Provider    | Cold (no cache) | Warm (cache hit) | Notes                          |
| ----------- | --------------- | ---------------- | ------------------------------ |
| **Cache**   | N/A             | **~0ms**         | Instant response (LRU TTL 5min)|
| **UnifiedIA**| 800-1500ms     | ~0ms (cached)    | Claude → OpenAI cascade        |
| **Gemini**  | 800-1200ms      | ~0ms (cached)    | Google Cloud API (network)     |
| **Ollama**  | 500-800ms       | ~0ms (cached)    | Local (localhost:11434)        |

**Cache Hit Rate:** ~60-80% typical (depends on usage patterns)

---

### Optimizations

1. **LRU Cache (v20.1)** — 5min TTL responses, 30s TTL provider statuses
   - **Impact:** -60% latency average (cache hits eliminate network calls)
   - **Before:** Every query = network call (800-1500ms)
   - **After:** Cache hit = instant (~0ms)

2. **Provider Status Cache** — 30s TTL (avoid repeated internet checks)
   - **Impact:** -20% overhead (health checks cached)
   - **Before:** Check internet every query (3s timeout)
   - **After:** Cached status (30s) = instant

3. **Cascade Optimization** — Early return on first success
   - **Impact:** -30% latency (no unnecessary provider tries)
   - **Strategy:** Try UnifiedIA → Success → Skip Gemini/Ollama

4. **Local Mode Force (v21)** — Bypass cascade for local preference
   - **Impact:** -50% latency (direct Ollama, no cascade)
   - **Use case:** Privacy-first mode (local AI only)

---

## 🔗 INTEGRATIONS

### OMEGA Pipeline (Integration Point)

**Stage 5: AI Generation Dispatch**

```rust
// OMEGA Pipeline calls AI Router
let ai_request = AIRequest {
    prompt: prompt_with_context,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
    provider_preference: request.provider_preference, // User choice
};

let ai_response = self.ai_router.query(ai_request).await?;
// → Router handles cascade: UnifiedIA → Gemini → Ollama
```

**Flow:**
1. OMEGA constructs final prompt (Stage 1-4: validation, context, intent, emotion)
2. OMEGA calls `ai_router.query(request)`
3. Router executes cascade (cache → UnifiedIA → Gemini → Ollama)
4. Router returns `AIResponse` to OMEGA
5. OMEGA continues post-processing (Stage 6-10)

---

### ConversationEngine (Integration Point)

**Stage 7: OMEGA Dispatch**

```rust
// ConversationEngine dispatches to OMEGA (which uses AI Router)
let conversation_response = self.pipeline.process(conversation_request).await?;
// → Pipeline → OMEGA → AI Router → Provider selection
```

---

### Frontend AIOrchestrator (Indirect Integration)

**Frontend → Tauri Command → Backend AI Router**

```typescript
// Frontend orchestrator.ts
const response = await aiOrchestrator.generate(message, history, {
  provider: 'auto', // Let backend AI Router decide
});

// → Tauri command → Backend conversation_generate
// → ConversationEngine → OMEGA → AI Router → Cascade
```

---

## 📚 CROSS-REFERENCES

### Related Modules

- **[OMEGA_PIPELINE.md](OMEGA_PIPELINE.md)** — OMEGA Pipeline (integrates AI Router at Stage 5)
- **[CONVERSATION_ENGINE.md](CONVERSATION_ENGINE.md)** — Conversation Engine (uses OMEGA → AI Router)
- **[UNIFIED_MEMORY.md](UNIFIED_MEMORY.md)** — UnifiedMemory (memory recalled for AI context)

### Architecture Docs

- **[ARCHITECTURE_CURRENT_v24.md](../../00_meta/ARCHITECTURE_CURRENT_v24.md)** — System architecture
- **[OMEGA_PIPELINE_DETAILED.md](../../02_architecture_reality/OMEGA_PIPELINE_DETAILED.md)** — OMEGA detailed architecture

### Guides

- **[QUICKSTART.md](../../04_guides/quickstart/QUICKSTART.md)** — User setup (provider configuration)
- **[SETUP.md](../../04_guides/development/SETUP.md)** — Developer setup (API keys, Ollama)

---

## 🎯 USE CASES

### 1. Auto Provider Selection (Default)

```rust
let request = AIRequest {
    prompt: "Explain quantum computing".to_string(),
    temperature: 0.7,
    max_tokens: 500,
    provider_preference: None, // Auto cascade
};

let response = router.query(request).await?;
// Cascade: Cache miss → UnifiedIA (Claude) → Success
// Provider used: Claude (via UnifiedIA)
```

---

### 2. Force Local Mode (Privacy-First)

```rust
let request = AIRequest {
    prompt: "Sensitive query".to_string(),
    provider_preference: Some("local".to_string()), // Force Ollama
    ..default
};

let response = router.query(request).await?;
// Direct Ollama (bypass cascade, no cloud APIs)
// Provider used: Ollama (localhost:11434)
```

---

### 3. Cache Hit (Instant Response)

```rust
// First query (cache miss)
let response1 = router.query(request.clone()).await?; // ~1200ms

// Second query (cache hit, within 5min TTL)
let response2 = router.query(request).await?; // ~0ms (instant)
```

---

### 4. Degraded Mode (Internet Down)

```rust
// Internet unavailable → Gemini/UnifiedIA failed → Ollama fallback
let response = router.query(request).await?;
// Provider used: Ollama (degraded mode, local only)

let status = router.get_status().await;
assert_eq!(status, AIRouterStatus::Degraded);
```

---

## 🚨 ERROR HANDLING

### Common Errors

1. **No Provider Available**
   ```rust
   // All providers failed (UnifiedIA + Gemini + Ollama)
   match router.query(request).await {
       Err(AIError::NoProviderAvailable) => {
           eprintln!("❌ No AI provider available");
           // Fallback: Display error to user
       }
       Ok(response) => { /* ... */ }
   }
   ```

2. **API Key Missing**
   ```rust
   // Gemini client not configured (no API key)
   let router = AIRouter::new(None, Some("llama3".to_string()));
   // → Will skip Gemini, try Ollama directly
   ```

3. **Ollama Daemon Not Running**
   ```bash
   # Check Ollama status
   systemctl status ollama
   # → inactive (dead)
   
   # Start Ollama
   systemctl start ollama
   ```

---

## 🛠️ CONFIGURATION

### Environment Variables

```bash
# Gemini API Key (optional, for Gemini provider)
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Ollama Model (optional, default: llama3)
export OLLAMA_MODEL="llama3"

# UnifiedIA Config (OpenAI + Claude API keys)
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
export ANTHROPIC_API_KEY="YOUR_CLAUDE_API_KEY"
```

### Initialization

```rust
// src-tauri/src/main.rs
let gemini_api_key = std::env::var("GEMINI_API_KEY").ok();
let ollama_model = std::env::var("OLLAMA_MODEL").ok();

let mut ai_router = AIRouter::new(gemini_api_key, ollama_model);

// Attach UnifiedIA if API keys configured
if let Ok(unified_ia) = UnifiedIAEngine::new() {
    ai_router.set_unified_ia(Arc::new(unified_ia));
}
```

---

## 🔮 FUTURE ENHANCEMENTS

1. **Dynamic Provider Ranking** — Score providers (latency, success rate, cost)
2. **A/B Testing** — Compare provider quality (Gemini vs Claude vs Ollama)
3. **Load Balancing** — Distribute queries across multiple providers
4. **Circuit Breaker** — Temporary disable failing providers (avoid cascade delays)
5. **Metrics Dashboard** — Provider usage stats (hits, latency, errors)

---

**Module Documentation généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ AI Router Team

---

_AI Router — Intelligent provider selection avec cascade fallback_ 🛣️✨
