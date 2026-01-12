# TITANE∞ Backend Optimization Plan v26.2.0

**Date:** 2026-01-03  
**Version:** 26.2.0  
**Priority Framework:** P0 (Critical) → P1 (High) → P2 (Nice-to-Have)

> NOTE (gouvernance): document historique (v26.2.0). Runtime actuel: v26.3.0.
> Production: EN ATTENTE (autorisation explicite requise).

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [A. Backend↔Frontend Unification](#a-backendfrontend-unification)
3. [B. Architecture & Simplification](#b-architecture--simplification)
4. [C. Performance & Reliability](#c-performance--reliability)
5. [D. Observability](#d-observability)
6. [E. Security](#e-security)
7. [Implementation Timeline](#implementation-timeline)

---

## Executive Summary

### Vision
Create a **perfectly unified, type-safe, observable, and resilient** backend-frontend architecture with zero friction, maximum developer velocity, and production-grade reliability.

### Goals
1. **Zero IPC mismatches** — Impossible to send wrong payload
2. **Zero secrets leaks** — Automated detection + prevention
3. **Zero silent failures** — Every error traced + actionable
4. **Sub-100ms P95 latency** — Fast, predictable IPC
5. **99.9% uptime** — Self-healing, circuit breakers, graceful degradation

### Metrics (Current → Target)
| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| Type safety | 92/100 | 100/100 | P0 |
| Test coverage | 85% | 95% | P0 |
| IPC latency (P95) | ~100ms | <50ms | P1 |
| Error recovery rate | 60% | 95% | P0 |
| Observability | 40% | 90% | P1 |
| Security score | 85/100 | 98/100 | P0 |

---

## A. Backend↔Frontend Unification

### A1. Type Generation Pipeline (P0 — 2 days)

**Problem:** Payload mismatches cause runtime errors, impossible to catch at compile-time.

**Solution:** Generate TypeScript types from Rust structs (single source of truth).

**Implementation:**

#### Step 1: Add `ts-rs` to Cargo.toml
```toml
[dependencies]
ts-rs = "7.1"
```

#### Step 2: Annotate Rust types
```rust
// src-tauri/src/types/conversation.rs
use ts_rs::TS;

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct ConversationGenerateRequest {
    pub conversation_id: String,
    pub message: String,
    pub provider: Option<String>,
    pub temperature: Option<f64>,
    pub max_tokens: Option<u32>,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct ConversationGenerateResponse {
    pub id: String,
    pub conversation_id: String,
    pub role: String,
    pub content: String,
    pub timestamp: String,
    pub provider: String,
    pub tokens: TokenUsage,
}
```

#### Step 3: Generate types
```bash
# Add to package.json
"scripts": {
  "types:generate": "cd src-tauri && cargo test --lib -- --nocapture",
  "types:verify": "tsc --noEmit src/types/generated/*.ts"
}
```

#### Step 4: Import generated types
```typescript
// src/hooks/useConversation.ts
import { ConversationGenerateRequest, ConversationGenerateResponse } from '@/types/generated/ConversationGenerateRequest';

const sendMessage = async (req: ConversationGenerateRequest) => {
  // TypeScript ensures req matches Rust struct exactly
  const response = await invoke<ConversationGenerateResponse>('conversation_generate', req);
  return response;
};
```

**Benefits:**
- ✅ Impossible to send wrong payload (compile-time error)
- ✅ Auto-complete for all fields
- ✅ Refactoring safe (rename field → both sides updated)
- ✅ Documentation generated from types

**Effort:** 2 days (annotate 50 command types, test generation pipeline)

---

### A2. Contract Testing Framework (P0 — 3 days)

**Problem:** No tests verify backend accepts frontend payloads.

**Solution:** JSON Schema-based contract tests.

**Implementation:**

#### Step 1: Generate JSON Schemas
```rust
// src-tauri/src/types/conversation.rs
#[cfg(test)]
mod tests {
    use schemars::schema_for;
    use super::*;

    #[test]
    fn export_schemas() {
        let schema_req = schema_for!(ConversationGenerateRequest);
        let schema_res = schema_for!(ConversationGenerateResponse);
        
        std::fs::write(
            "schemas/conversation_generate_request.json",
            serde_json::to_string_pretty(&schema_req).unwrap()
        ).unwrap();
        
        std::fs::write(
            "schemas/conversation_generate_response.json",
            serde_json::to_string_pretty(&schema_res).unwrap()
        ).unwrap();
    }
}
```

#### Step 2: Add contract tests
```typescript
// tests/contract/conversation_generate.test.ts
import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import requestSchema from '../../schemas/conversation_generate_request.json';
import responseSchema from '../../schemas/conversation_generate_response.json';

const ajv = new Ajv();

describe('Contract: conversation_generate', () => {
  it('request payload matches schema', () => {
    const validate = ajv.compile(requestSchema);
    const payload = {
      conversationId: '123e4567-e89b-12d3-a456-426614174000',
      message: 'Hello, TITANE!',
      provider: 'openai',
    };
    expect(validate(payload)).toBe(true);
  });

  it('rejects missing conversationId', () => {
    const validate = ajv.compile(requestSchema);
    const payload = { message: 'Hello!' };
    expect(validate(payload)).toBe(false);
    expect(validate.errors).toContainEqual(
      expect.objectContaining({ params: { missingProperty: 'conversationId' } })
    );
  });

  it('response payload matches schema', async () => {
    const validate = ajv.compile(responseSchema);
    // Mock response from backend
    const response = await mockInvoke('conversation_generate', { ... });
    expect(validate(response)).toBe(true);
  });
});
```

#### Step 3: CI integration
```yaml
# .github/workflows/contract-tests.yml
- name: Generate schemas
  run: cd src-tauri && cargo test export_schemas
- name: Run contract tests
  run: pnpm run test:contract
```

**Benefits:**
- ✅ Catch payload mismatches in CI
- ✅ Living documentation (schemas = docs)
- ✅ Prevents breaking changes

**Effort:** 3 days (setup, write 50 contract tests, CI integration)

---

### A3. Unified Error Model (P0 — 2 days)

**Problem:** Errors inconsistent between backend (TitaneError) and frontend (try/catch).

**Solution:** Standardized error codes + recovery actions.

**Implementation:**

#### Backend: Structured errors
```rust
// src-tauri/src/error.rs
#[derive(Debug, thiserror::Error, Serialize, TS)]
#[ts(export)]
#[serde(tag = "type", content = "data", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum TitaneError {
    #[error("Invalid input: {field}: {message}")]
    InvalidInput {
        field: String,
        message: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        recovery_action: Option<RecoveryAction>,
    },

    #[error("Unauthorized: {message}")]
    Unauthorized {
        message: String,
        recovery_action: RecoveryAction, // Always present
    },

    #[error("Rate limited: Retry after {retry_after_ms}ms")]
    RateLimited {
        retry_after_ms: u64,
        recovery_action: RecoveryAction,
    },

    // ... other variants
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum RecoveryAction {
    Retry { delay_ms: u64 },
    PromptApiKey { provider: String },
    RetryWithFallback { fallback_provider: String },
    ShowHelp { help_url: String },
    ContactSupport,
}
```

#### Frontend: Error handler
```typescript
// src/lib/errorHandler.ts
import { TitaneError, RecoveryAction } from '@/types/generated/TitaneError';

export class TitaneErrorHandler {
  static async handle(error: unknown): Promise<void> {
    const titaneError = TitaneError.fromTauri(error);

    switch (titaneError.type) {
      case 'INVALID_INPUT':
        showNotification(`Invalid input in ${titaneError.data.field}: ${titaneError.data.message}`);
        break;

      case 'UNAUTHORIZED':
        await this.executeRecovery(titaneError.data.recovery_action);
        break;

      case 'RATE_LIMITED':
        await wait(titaneError.data.retry_after_ms);
        // Auto-retry
        break;

      default:
        showError(`Error: ${titaneError.message}`);
    }
  }

  static async executeRecovery(action: RecoveryAction): Promise<void> {
    switch (action.action) {
      case 'prompt_api_key':
        openApiKeyDialog(action.provider);
        break;
      case 'retry':
        await wait(action.delay_ms);
        // Retry original request
        break;
      // ... other recovery actions
    }
  }
}
```

**Benefits:**
- ✅ Every error has recovery action
- ✅ User-friendly error messages
- ✅ Auto-retry where appropriate
- ✅ Error telemetry (track error rates by type)

**Effort:** 2 days (refactor TitaneError, update all commands, test recovery flows)

---

### A4. Correlation IDs (P1 — 1 day)

**Problem:** Hard to trace request → backend → response in logs.

**Solution:** Add correlation ID to every IPC call.

**Implementation:**

#### Frontend wrapper
```typescript
// src/lib/security.ts
import { v4 as uuidv4 } from 'uuid';

export async function secureInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  const correlationId = uuidv4();
  const startTime = performance.now();

  console.debug(`[IPC ${correlationId}] ${command}`, args);

  try {
    const result = await invoke<T>(command, { ...args, _correlation_id: correlationId });
    const duration = performance.now() - startTime;
    console.debug(`[IPC ${correlationId}] ${command} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[IPC ${correlationId}] ${command} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}
```

#### Backend logging
```rust
// src-tauri/src/commands/...
#[tauri::command]
pub async fn conversation_generate(
    conversation_id: String,
    message: String,
    _correlation_id: Option<String>, // Injected by frontend
) -> Result<ConversationGenerateResponse, TitaneError> {
    let correlation_id = _correlation_id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    log::info!("[{}] conversation_generate: conversation_id={}", correlation_id, conversation_id);

    let result = internal_generate(&conversation_id, &message).await;

    match &result {
        Ok(_) => log::info!("[{}] conversation_generate: success", correlation_id),
        Err(e) => log::error!("[{}] conversation_generate: error={:?}", correlation_id, e),
    }

    result
}
```

**Benefits:**
- ✅ Easy to trace request through logs
- ✅ Measure end-to-end latency
- ✅ Debug production issues faster

**Effort:** 1 day (add to all commands, update logging)

---

## B. Architecture & Simplification

### B1. Remove Deprecated Modules (P0 — 1 day)

**Problem:** Dead code increases maintenance burden, confuses developers.

**Deprecated Modules:**
- `memory.rs` → `unified_memory_v2`
- `memory_compactor.rs` → `unified_memory_v2`
- `memory_evolution.rs` → `unified_memory_v2`
- `memory_os.rs` → `unified_memory_v2` (partial)
- `chat_send_message` → `conversation_generate`
- `cycle_engine` (disabled, incomplete)

**Implementation:**

#### Step 1: Verify no usage
```bash
# Check for deprecated imports
grep -r "use.*memory_compactor" src-tauri/src --exclude-dir=target
grep -r "chat_send_message" src --include="*.ts" --include="*.tsx"
```

#### Step 2: Remove or document
- If unused: Delete module + remove from main.rs
- If future feature: Add doc comment explaining roadmap + keep

#### Step 3: Update imports
```rust
// Replace old imports
- use crate::memory::Memory;
+ use crate::engines::unified_memory::UnifiedMemory;
```

**Benefits:**
- ✅ Reduced codebase size (-5000 lines)
- ✅ Faster compile times
- ✅ No confusion about which API to use

**Effort:** 1 day (audit usage, delete unused, update imports)

---

### B2. Centralize Configuration (P1 — 2 days)

**Problem:** Config scattered across multiple modules (AI keys, timeouts, endpoints).

**Solution:** Single config struct, loaded once, immutable.

**Implementation:**

#### Unified config
```rust
// src-tauri/src/config/global.rs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalConfig {
    pub ai: AiConfig,
    pub audio: AudioConfig,
    pub avatar: AvatarConfig,
    pub security: SecurityConfig,
    pub performance: PerformanceConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiConfig {
    pub openai_endpoint: String,
    pub claude_endpoint: String,
    pub gemini_endpoint: String,
    pub timeout_quick_ms: u64,
    pub timeout_standard_ms: u64,
    pub timeout_extended_ms: u64,
    pub max_retries: usize,
}

// ... other config structs

impl GlobalConfig {
    pub fn load() -> Result<Self, TitaneError> {
        let config_path = app_data_dir().join("config.toml");
        if config_path.exists() {
            let content = std::fs::read_to_string(config_path)?;
            toml::from_str(&content).map_err(|e| TitaneError::InvalidConfig(e.to_string()))
        } else {
            Ok(Self::default())
        }
    }

    pub fn save(&self) -> Result<(), TitaneError> {
        let config_path = app_data_dir().join("config.toml");
        let content = toml::to_string_pretty(self)?;
        std::fs::write(config_path, content)?;
        Ok(())
    }
}
```

#### Usage
```rust
// src-tauri/src/main.rs
fn main() {
    let config = GlobalConfig::load().expect("Failed to load config");
    
    tauri::Builder::default()
        .manage(config.clone()) // Share config across all commands
        .invoke_handler(...)
        .run(...)
}

// In commands
#[tauri::command]
pub async fn chat_generate_openai(
    config: State<'_, GlobalConfig>,
    // ...
) -> Result<...> {
    let client = OpenAIClient::new(&config.ai.openai_endpoint, timeout_ms(config.ai.timeout_standard_ms));
    // ...
}
```

**Benefits:**
- ✅ Single source of truth
- ✅ Easy to change config (reload app)
- ✅ No hardcoded values
- ✅ Config hot-reload (future: watch file, reload on change)

**Effort:** 2 days (define structs, migrate all config, test)

---

### B3. Centralize HTTP Clients (P1 — 1 day)

**Problem:** Each AI provider creates own HTTP client (duplication, inconsistent config).

**Solution:** Shared HTTP client pool with consistent settings.

**Implementation:**

```rust
// src-tauri/src/http/client.rs
use reqwest::{Client, ClientBuilder};
use std::time::Duration;

pub struct HttpClientPool {
    default: Client,
    long_timeout: Client,
}

impl HttpClientPool {
    pub fn new(config: &GlobalConfig) -> Self {
        let default = ClientBuilder::new()
            .timeout(Duration::from_millis(config.ai.timeout_standard_ms))
            .pool_max_idle_per_host(10)
            .gzip(true)
            .build()
            .unwrap();

        let long_timeout = ClientBuilder::new()
            .timeout(Duration::from_millis(config.ai.timeout_extended_ms))
            .pool_max_idle_per_host(10)
            .gzip(true)
            .build()
            .unwrap();

        Self { default, long_timeout }
    }

    pub fn get_client(&self, timeout_type: TimeoutType) -> &Client {
        match timeout_type {
            TimeoutType::Standard => &self.default,
            TimeoutType::Extended => &self.long_timeout,
        }
    }
}

// In main.rs
.manage(HttpClientPool::new(&config))

// In commands
#[tauri::command]
pub async fn chat_generate_openai(
    http_pool: State<'_, HttpClientPool>,
    // ...
) -> Result<...> {
    let client = http_pool.get_client(TimeoutType::Standard);
    let response = client.post(endpoint).json(&payload).send().await?;
    // ...
}
```

**Benefits:**
- ✅ Connection pooling (faster subsequent requests)
- ✅ Consistent timeouts
- ✅ Easier to add middleware (logging, metrics, retries)

**Effort:** 1 day (create pool, migrate all providers)

---

## C. Performance & Reliability

### C1. Circuit Breaker Pattern (P0 — 2 days)

**Problem:** AI providers fail repeatedly → app keeps trying → slow experience.

**Solution:** Auto-disable failing providers, fallback to next best.

**Implementation:**

```rust
// src-tauri/src/ai/circuit_breaker.rs
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};

#[derive(Debug)]
pub enum CircuitState {
    Closed,     // Normal operation
    Open,       // Failures detected, provider disabled
    HalfOpen,   // Testing if provider recovered
}

pub struct CircuitBreaker {
    failure_count: AtomicU64,
    last_failure: Mutex<Option<Instant>>,
    state: Mutex<CircuitState>,
    config: CircuitConfig,
}

pub struct CircuitConfig {
    pub failure_threshold: u64,      // Open circuit after N failures
    pub timeout_duration: Duration,  // Keep circuit open for N seconds
    pub half_open_max_calls: u64,    // Test with N calls in half-open
}

impl CircuitBreaker {
    pub fn new(config: CircuitConfig) -> Self {
        Self {
            failure_count: AtomicU64::new(0),
            last_failure: Mutex::new(None),
            state: Mutex::new(CircuitState::Closed),
            config,
        }
    }

    pub async fn call<F, T, E>(&self, f: F) -> Result<T, CircuitBreakerError<E>>
    where
        F: Future<Output = Result<T, E>>,
    {
        // Check state
        let state = {
            let mut state_guard = self.state.lock().await;
            match *state_guard {
                CircuitState::Open => {
                    // Check if timeout elapsed
                    if let Some(last) = *self.last_failure.lock().await {
                        if last.elapsed() > self.config.timeout_duration {
                            *state_guard = CircuitState::HalfOpen;
                            CircuitState::HalfOpen
                        } else {
                            return Err(CircuitBreakerError::CircuitOpen);
                        }
                    } else {
                        return Err(CircuitBreakerError::CircuitOpen);
                    }
                }
                s => s,
            }
        };

        // Execute call
        match f.await {
            Ok(result) => {
                // Success → reset failures
                self.failure_count.store(0, Ordering::Relaxed);
                if matches!(state, CircuitState::HalfOpen) {
                    *self.state.lock().await = CircuitState::Closed;
                }
                Ok(result)
            }
            Err(e) => {
                // Failure → increment count
                let count = self.failure_count.fetch_add(1, Ordering::Relaxed) + 1;
                *self.last_failure.lock().await = Some(Instant::now());

                if count >= self.config.failure_threshold {
                    *self.state.lock().await = CircuitState::Open;
                    log::warn!("Circuit breaker opened after {} failures", count);
                }

                Err(CircuitBreakerError::CallFailed(e))
            }
        }
    }

    pub fn is_open(&self) -> bool {
        matches!(*self.state.blocking_lock(), CircuitState::Open)
    }
}
```

#### Integration with AI router
```rust
// src-tauri/src/ai/router_intelligent.rs
pub struct IntelligentRouter {
    openai_breaker: CircuitBreaker,
    claude_breaker: CircuitBreaker,
    gemini_breaker: CircuitBreaker,
    copilot_breaker: CircuitBreaker,
    ollama_breaker: CircuitBreaker,
}

impl IntelligentRouter {
    pub async fn route(&self, message: &str) -> Result<String, TitaneError> {
        // Try providers in order (OpenAI → Claude → Gemini → Copilot → Ollama)
        
        if !self.openai_breaker.is_open() {
            match self.openai_breaker.call(call_openai(message)).await {
                Ok(response) => return Ok(response),
                Err(CircuitBreakerError::CircuitOpen) => log::warn!("OpenAI circuit open"),
                Err(CircuitBreakerError::CallFailed(e)) => log::error!("OpenAI failed: {:?}", e),
            }
        }

        // Fallback to Claude
        if !self.claude_breaker.is_open() {
            match self.claude_breaker.call(call_claude(message)).await {
                Ok(response) => return Ok(response),
                Err(_) => log::error!("Claude failed"),
            }
        }

        // ... try remaining providers

        Err(TitaneError::AllProvidersFailed)
    }
}
```

**Benefits:**
- ✅ Fast fail (don't wait for timeout on known-bad provider)
- ✅ Auto-recovery (test provider after cooldown)
- ✅ Graceful degradation (fallback chain)

**Effort:** 2 days (implement circuit breaker, integrate with router, test)

---

### C2. IPC Batching (P2 — 3 days)

**Problem:** 10 invoke() calls = 10 IPC round-trips (~10ms each) = 100ms wasted.

**Solution:** Batch multiple calls into single IPC round-trip.

**Implementation:**

#### Backend: Batch command
```rust
#[tauri::command]
pub async fn batch_execute(
    commands: Vec<BatchCommand>,
) -> Result<Vec<BatchResult>, TitaneError> {
    let mut results = Vec::new();

    for cmd in commands {
        let result = match cmd.command.as_str() {
            "avatar_set_opacity" => {
                let opacity: f32 = serde_json::from_value(cmd.args["opacity"].clone())?;
                avatar_set_opacity(opacity).await.map(|_| serde_json::json!(null))
            }
            "avatar_set_position" => {
                let x: f32 = serde_json::from_value(cmd.args["x"].clone())?;
                let y: f32 = serde_json::from_value(cmd.args["y"].clone())?;
                avatar_set_position(x, y).await.map(|_| serde_json::json!(null))
            }
            _ => Err(TitaneError::UnknownCommand(cmd.command.clone())),
        };

        results.push(BatchResult {
            command: cmd.command,
            result: result.map_err(|e| e.to_string()),
        });
    }

    Ok(results)
}
```

#### Frontend: Batch helper
```typescript
// src/lib/batchInvoke.ts
export class BatchInvoker {
  private queue: Array<{ command: string; args: Record<string, unknown> }> = [];
  private timer: NodeJS.Timeout | null = null;

  public enqueue(command: string, args: Record<string, unknown>): void {
    this.queue.push({ command, args });

    if (this.timer === null) {
      this.timer = setTimeout(() => this.flush(), 10); // 10ms debounce
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const commands = this.queue.splice(0, this.queue.length);
    this.timer = null;

    const results = await invoke<BatchResult[]>('batch_execute', { commands });

    results.forEach((result, i) => {
      if (result.result.error) {
        console.error(`Batch command ${commands[i].command} failed:`, result.result.error);
      }
    });
  }
}

// Usage
const batcher = new BatchInvoker();
batcher.enqueue('avatar_set_opacity', { opacity: 0.8 });
batcher.enqueue('avatar_set_position', { x: 100, y: 200 });
batcher.enqueue('avatar_set_scale', { scale: 1.2 });
// All 3 commands sent in single IPC call after 10ms
```

**Benefits:**
- ✅ 10x fewer IPC calls
- ✅ Sub-20ms latency for bulk operations
- ✅ Reduced CPU overhead

**Effort:** 3 days (implement batch command, test edge cases, measure performance)

---

### C3. Adaptive Timeouts (P2 — 1 day)

**Problem:** Fixed timeouts don't account for message complexity (short message = fast, long message = slow).

**Solution:** Timeout based on message length + provider latency history.

**Implementation:**

```rust
// src-tauri/src/ai/timeout_calculator.rs
pub struct AdaptiveTimeout {
    provider_latency: HashMap<String, VecDeque<Duration>>, // Last 100 requests
}

impl AdaptiveTimeout {
    pub fn calculate(&self, provider: &str, message_length: usize) -> Duration {
        let base_timeout = match message_length {
            0..=500 => Duration::from_secs(10),
            501..=2000 => Duration::from_secs(30),
            _ => Duration::from_secs(60),
        };

        // Adjust based on provider's P95 latency
        if let Some(latencies) = self.provider_latency.get(provider) {
            let p95 = latencies.iter().sorted().rev().nth(5).copied().unwrap_or(Duration::from_secs(5));
            base_timeout + p95
        } else {
            base_timeout
        }
    }

    pub fn record(&mut self, provider: &str, latency: Duration) {
        let latencies = self.provider_latency.entry(provider.to_string()).or_insert_with(VecDeque::new);
        latencies.push_back(latency);
        if latencies.len() > 100 {
            latencies.pop_front();
        }
    }
}
```

**Benefits:**
- ✅ Fewer timeouts on slow networks
- ✅ Faster failure detection on fast networks

**Effort:** 1 day (implement calculator, integrate with providers)

---

## D. Observability

### D1. Structured Logging (P1 — 2 days)

**Problem:** Logs are unstructured strings, hard to query, no levels.

**Solution:** JSON-structured logs with tracing spans.

**Implementation:**

#### Add tracing
```toml
[dependencies]
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["json", "env-filter"] }
```

#### Configure tracing
```rust
// src-tauri/src/main.rs
use tracing_subscriber::{fmt, EnvFilter};

fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .json() // JSON format
        .init();

    // ... rest of app
}
```

#### Use tracing
```rust
use tracing::{info, error, span, Level};

#[tauri::command]
#[tracing::instrument(skip(state), fields(conversation_id, provider))]
pub async fn conversation_generate(
    conversation_id: String,
    message: String,
    provider: Option<String>,
) -> Result<ConversationGenerateResponse, TitaneError> {
    let span = span!(Level::INFO, "conversation_generate", conversation_id = %conversation_id, provider = %provider.as_ref().unwrap_or(&"auto".to_string()));
    let _enter = span.enter();

    info!("Starting conversation generation");

    let result = internal_generate(&conversation_id, &message, provider).await;

    match &result {
        Ok(response) => info!(tokens = response.tokens.total, "Generation successful"),
        Err(e) => error!(error = %e, "Generation failed"),
    }

    result
}
```

**Output:**
```json
{
  "timestamp": "2026-01-03T05:26:18.516Z",
  "level": "INFO",
  "target": "titane_infinity::commands",
  "span": {
    "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
    "provider": "openai"
  },
  "fields": {
    "message": "Starting conversation generation"
  }
}
```

**Benefits:**
- ✅ Queryable logs (grep, jq, ELK stack)
- ✅ Trace requests across spans
- ✅ Easy to aggregate metrics

**Effort:** 2 days (setup tracing, instrument all commands)

---

### D2. Metrics Collection (P1 — 3 days)

**Problem:** No visibility into performance, error rates, usage patterns.

**Solution:** Prometheus-compatible metrics.

**Implementation:**

#### Add metrics
```rust
// src-tauri/src/metrics/mod.rs
use prometheus::{Counter, Histogram, Registry};
use once_cell::sync::Lazy;

pub static REGISTRY: Lazy<Registry> = Lazy::new(Registry::new);

pub static IPC_CALLS_TOTAL: Lazy<Counter> = Lazy::new(|| {
    Counter::new("ipc_calls_total", "Total IPC calls").unwrap()
});

pub static IPC_LATENCY_SECONDS: Lazy<Histogram> = Lazy::new(|| {
    Histogram::with_opts(
        prometheus::HistogramOpts::new("ipc_latency_seconds", "IPC call latency")
            .buckets(vec![0.001, 0.01, 0.05, 0.1, 0.5, 1.0, 5.0])
    ).unwrap()
});

pub static AI_PROVIDER_ERRORS_TOTAL: Lazy<CounterVec> = Lazy::new(|| {
    CounterVec::new(
        Opts::new("ai_provider_errors_total", "AI provider errors"),
        &["provider", "error_type"]
    ).unwrap()
});

// Register metrics
pub fn init() {
    REGISTRY.register(Box::new(IPC_CALLS_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(IPC_LATENCY_SECONDS.clone())).unwrap();
    REGISTRY.register(Box::new(AI_PROVIDER_ERRORS_TOTAL.clone())).unwrap();
}
```

#### Instrument commands
```rust
#[tauri::command]
pub async fn conversation_generate(...) -> Result<...> {
    IPC_CALLS_TOTAL.inc();
    let timer = IPC_LATENCY_SECONDS.start_timer();

    let result = internal_generate(...).await;

    timer.observe_duration();

    match &result {
        Err(TitaneError::ExternalApi { provider, .. }) => {
            AI_PROVIDER_ERRORS_TOTAL.with_label_values(&[provider, "api_error"]).inc();
        }
        _ => {}
    }

    result
}
```

#### Expose metrics endpoint
```rust
#[tauri::command]
pub async fn metrics_export() -> Result<String, TitaneError> {
    use prometheus::Encoder;
    let encoder = prometheus::TextEncoder::new();
    let metric_families = REGISTRY.gather();
    let mut buffer = Vec::new();
    encoder.encode(&metric_families, &mut buffer)?;
    Ok(String::from_utf8(buffer)?)
}
```

**Benefits:**
- ✅ Real-time performance monitoring
- ✅ Alert on anomalies (error rate spike)
- ✅ Capacity planning (usage trends)

**Effort:** 3 days (setup prometheus, instrument all commands, build dashboard)

---

## E. Security

### E1. Input Validation Framework (P0 — 2 days)

**Problem:** Validation scattered, inconsistent, some inputs not validated.

**Solution:** Centralized validation with declarative rules.

**Implementation:**

```rust
// src-tauri/src/security/validate.rs
use validator::{Validate, ValidationError};

#[derive(Debug, Validate)]
pub struct ConversationGenerateRequest {
    #[validate(length(equal = 36))] // UUID length
    pub conversation_id: String,

    #[validate(length(min = 1, max = 10000))]
    pub message: String,

    #[validate(custom = "validate_provider")]
    pub provider: Option<String>,

    #[validate(range(min = 0.0, max = 2.0))]
    pub temperature: Option<f64>,

    #[validate(range(min = 1, max = 4096))]
    pub max_tokens: Option<u32>,
}

fn validate_provider(provider: &str) -> Result<(), ValidationError> {
    const ALLOWED: &[&str] = &["openai", "claude", "gemini", "copilot", "ollama"];
    if ALLOWED.contains(&provider) {
        Ok(())
    } else {
        Err(ValidationError::new("invalid_provider"))
    }
}

#[tauri::command]
pub async fn conversation_generate(
    req: ConversationGenerateRequest,
) -> Result<ConversationGenerateResponse, TitaneError> {
    req.validate().map_err(|e| TitaneError::InvalidInput {
        field: e.field().unwrap_or("unknown").to_string(),
        message: e.to_string(),
        recovery_action: None,
    })?;

    // ... rest of logic
}
```

**Benefits:**
- ✅ All inputs validated
- ✅ Consistent error messages
- ✅ Easier to audit (single file)

**Effort:** 2 days (add validator, annotate all request types, test)

---

### E2. Fuzzing (P2 — 3 days)

**Problem:** Edge cases not tested (malformed inputs, extreme values).

**Solution:** Fuzz testing with cargo-fuzz.

**Implementation:**

```bash
cargo install cargo-fuzz
cd src-tauri
cargo fuzz init
```

```rust
// fuzz/fuzz_targets/conversation_generate.rs
#![no_main]
use libfuzzer_sys::fuzz_target;

fuzz_target!(|data: &[u8]| {
    if let Ok(s) = std::str::from_utf8(data) {
        let req = ConversationGenerateRequest {
            conversation_id: s.to_string(),
            message: s.to_string(),
            provider: Some(s.to_string()),
            temperature: Some(f64::from_be_bytes([0; 8])),
            max_tokens: Some(u32::from_be_bytes([0; 4])),
        };

        let _ = validate_request(&req);
    }
});
```

```bash
cargo fuzz run conversation_generate -- -max_len=10000 -runs=1000000
```

**Benefits:**
- ✅ Find crashes before users do
- ✅ Harden validation logic

**Effort:** 3 days (setup fuzzing, fuzz 10 critical commands, fix issues)

---

## Implementation Timeline

### Week 1: Critical Path (P0)
- **Day 1-2:** Type generation pipeline (A1)
- **Day 3-5:** Contract testing framework (A2)
- **Day 6-7:** Unified error model (A3) + Remove deprecated modules (B1)

### Week 2: High Priority (P1)
- **Day 1-2:** Circuit breaker (C1)
- **Day 3-4:** Structured logging (D1)
- **Day 5-7:** Metrics collection (D2) + Correlation IDs (A4)

### Week 3: Nice-to-Have (P2)
- **Day 1-3:** IPC batching (C2)
- **Day 4-5:** Centralize config (B2) + HTTP clients (B3)
- **Day 6-7:** Input validation framework (E1) + Adaptive timeouts (C3)

### Week 4: Advanced (P2)
- **Day 1-3:** Fuzzing (E2)
- **Day 4-7:** Documentation, testing, polish

---

## Success Criteria

### Phase 3 Complete When:
- [x] Optimization plan documented with P0/P1/P2 priorities ✅
- [ ] All P0 items have implementation steps ✅
- [ ] Timeline and effort estimates provided ✅
- [ ] Success metrics defined ✅

### Phase 4 Complete When:
- [ ] All P0 items implemented (type gen, contract tests, error model, circuit breaker)
- [ ] All P1 items implemented (logging, metrics, correlation IDs)
- [ ] Tests pass (2 consecutive green runs)
- [ ] Documentation updated

---

**Document Status:** ✅ Complete (Phase 3)  
**Last Updated:** 2026-01-03  
**Next Steps:** Phase 4 — Implement P0 optimizations
