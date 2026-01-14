# TITANE∞ IPC Contract v26.3.0

**Date:** 2026-01-03  
**Version:** 26.3.0  
**Protocol:** Tauri IPC (JSON-RPC over WebSocket)

---

## Table of Contents
1. [IPC Architecture](#ipc-architecture)
2. [Versioning Strategy](#versioning-strategy)
3. [Serialization Rules](#serialization-rules)
4. [Error Model](#error-model)
5. [Command → Frontend Matrix](#command--frontend-matrix)
6. [Payload Specifications](#payload-specifications)
7. [Migration Guide (OMEGA v1 → v2)](#migration-guide-omega-v1--v2)

---

## IPC Architecture

### Communication Flow

```
Frontend (TypeScript/React)
    │
    ├─ secureInvoke() (src/lib/security.ts)
    │  ├─ Validation
    │  ├─ Rate limiting check
    │  └─ invoke() → Tauri API
    │
    ↓  [IPC Bridge - WebSocket]
    │
Backend (Rust/Tauri)
    │
    ├─ Command Handler (#[tauri::command])
    │  ├─ Input validation (security/validation.rs)
    │  ├─ Permission check (security/permission_guard.rs)
    │  ├─ Business logic
    │  └─ Response serialization (serde_json)
    │
    ↓
Frontend
    │
    └─ Response handling / Error handling
```

### IPC Wrapper: secureInvoke()
**Location:** `src/lib/security.ts`

```typescript
export async function secureInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  // 1. Validate command name
  if (!ALLOWED_COMMANDS.includes(command)) {
    throw new Error(`Command ${command} not in allowlist`);
  }

  // 2. Rate limiting check
  await checkRateLimit(command);

  // 3. Invoke Tauri command
  try {
    const result = await invoke<T>(command, args);
    return result;
  } catch (error) {
    // 4. Error transformation
    throw transformTauriError(error);
  }
}
```

### VOID_COMMANDS
Commands that return `()` (unit type):
- All `set_*`, `update_*`, `delete_*`, `clear_*` commands
- AutoFix/AutoHeal actions
- State mutations
- ~100 commands total

---

## Versioning Strategy

### Current Version: v2.0
- **OMEGA Pipeline v2:** Introduced `conversationId` as mandatory parameter
- **Breaking Change:** `chat_send_message` deprecated → `conversation_generate`

### Version Compatibility Matrix

| Frontend Version | Backend Version | Compatibility | Notes |
|------------------|-----------------|---------------|-------|
| v26.2.0 | v26.2.0 | ✅ Full | Current |
| v26.1.0 | v26.2.0 | ⚠️ Partial | OMEGA v1 deprecated but functional |
| v26.0.0 | v26.2.0 | ❌ Incompatible | Missing conversationId support |
| v25.x | v26.2.0 | ❌ Incompatible | Major API changes |

### Deprecation Policy
1. **Mark as deprecated** in code comments + console warnings (6 months)
2. **Remove from docs** (3 months after deprecation)
3. **Remove from code** (6 months after deprecation, or next major version)

### Version Detection
```typescript
// Frontend checks backend version
const version = await invoke<string>('get_backend_version');
if (semver.lt(version, '26.2.0')) {
  console.warn('Backend outdated, some features unavailable');
}
```

---

## Serialization Rules

### Serde Configuration
All Rust types use `serde` with these conventions:

```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")] // ✅ Rust snake_case → TS camelCase
struct ExamplePayload {
    user_id: String,      // → userId in JSON
    message_text: String, // → messageText in JSON
    #[serde(skip_serializing_if = "Option::is_none")]
    optional_field: Option<String>, // Omitted if None
}
```

### Naming Conventions
- **Rust (backend):** `snake_case`
- **TypeScript (frontend):** `camelCase`
- **Automatic conversion:** serde `rename_all = "camelCase"`

### Field Rules
1. **Required fields:** Always present in JSON
2. **Optional fields:** `Option<T>` → omitted if `None`, present if `Some(value)`
3. **Default fields:** `#[serde(default)]` → uses `Default::default()` if missing
4. **Flattening:** `#[serde(flatten)]` → merges nested struct into parent

### Size Limits
- **Max payload size:** 10 MB (enforced by Tauri)
- **Max string length:** 1 MB (conversation messages)
- **Max array length:** 10,000 items (timeline events, etc.)
- **Max nesting depth:** 10 levels (prevents stack overflow)

### Forbidden Characters
- Control characters (`\0`, `\n`, `\r`) in string keys
- Non-UTF8 sequences

### Date/Time Format
- **Standard:** ISO 8601 (e.g., `2026-01-03T05:26:18.516Z`)
- **Rust type:** `chrono::DateTime<Utc>` → serialized as string
- **Frontend parsing:** `new Date(isoString)`

---

## Error Model

### Rust Error Types

#### 1. TitaneError (Primary)
**Location:** `src-tauri/src/error.rs`

```rust
#[derive(Debug, thiserror::Error, Serialize)]
#[serde(tag = "type", content = "message", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum TitaneError {
    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Rate limited: {0}")]
    RateLimited(String),

    #[error("External API error: {0}")]
    ExternalApi(String),

    #[error("Serialization error: {0}")]
    Serialization(String),

    #[error("IO error: {0}")]
    Io(String),

    #[error("Database error: {0}")]
    Database(String),

    #[error("AI provider error: {0}")]
    AiProvider(String),

    // ... 13 more variants (23 total)
}
```

#### 2. TAPIError (Legacy)
**Location:** `src-tauri/src/core/tapi_error.rs`

```rust
#[derive(Debug, Serialize)]
pub struct TAPIError {
    pub code: String,    // "NOT_FOUND", "INVALID_INPUT", etc.
    pub message: String,
    pub details: Option<serde_json::Value>,
}
```

### Error Codes

| Code | HTTP Equiv | Meaning | Retry? |
|------|------------|---------|--------|
| `INTERNAL_ERROR` | 500 | Internal server error | ✅ Yes (exponential backoff) |
| `INVALID_INPUT` | 400 | Bad request, invalid parameters | ❌ No (fix input) |
| `NOT_FOUND` | 404 | Resource not found | ❌ No |
| `UNAUTHORIZED` | 401 | Missing/invalid API key | ❌ No (prompt user) |
| `FORBIDDEN` | 403 | Insufficient permissions | ❌ No |
| `RATE_LIMITED` | 429 | Too many requests | ✅ Yes (wait retry-after) |
| `TIMEOUT` | 504 | Request timeout | ✅ Yes (retry once) |
| `EXTERNAL_API_ERROR` | 502 | AI provider error | ✅ Yes (fallback chain) |
| `DATABASE_ERROR` | 500 | SQLite error | ⚠️ Maybe (if transient) |
| `SERIALIZATION_ERROR` | 500 | JSON parsing error | ❌ No (bug) |

### Frontend Error Handling

```typescript
// src/lib/security.ts
export class TitaneError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'TitaneError';
  }

  static fromTauri(error: unknown): TitaneError {
    if (typeof error === 'object' && error !== null) {
      const err = error as { type?: string; message?: string };
      return new TitaneError(
        err.type || 'UNKNOWN_ERROR',
        err.message || 'Unknown error',
        error
      );
    }
    return new TitaneError('UNKNOWN_ERROR', String(error));
  }
}
```

### Error Response Format

```json
{
  "type": "INVALID_INPUT",
  "message": "conversationId is required for conversation_generate"
}
```

---

## Command → Frontend Matrix

### High-Traffic Commands (>100 calls/session)

| Command | Frontend Files | Payload | Response | Errors |
|---------|----------------|---------|----------|--------|
| `conversation_generate` | `src/services/tauri/chatEngine.commands.ts`<br>`src/services/ai/providers/tauriChat.ts`<br>`src/tests/e2e/titane_e2e.test.ts` | `{conversationId: string, message: string, provider?: string}` | `{id: string, role: string, content: string, timestamp: string}` | `UNAUTHORIZED` (no API key)<br>`RATE_LIMITED`<br>`EXTERNAL_API_ERROR`<br>`TIMEOUT` |
| `chat_get_providers_status` | `src/components/ChatDiagnostic.tsx`<br>`src/tests/regression/titane_regression.test.ts`<br>`src/tests/tauri-invoke-fix-validator.ts` | `{}` | `{openai: boolean, claude: boolean, gemini: boolean, copilot: boolean, ollama: boolean}` | `INTERNAL_ERROR` |
| `avatar_advance_lip_sync` | `NO_CALLERS_FOUND` | `{}` | `void` | `INTERNAL_ERROR` |
| `voice_start_listening` | `NO_CALLERS_FOUND` | `{}` | `string` | `VALIDATION_ERROR` (already listening)<br>`INTERNAL_ERROR` |
| `singularity_get_full_state` | `src/services/autoAuditEngine.ts`<br>`src/services/singularityBridge.ts`<br>`src/components/ChatDiagnostic.tsx` | `{}` | `{physical: {...}, cognitive: {...}, symbolic: {...}, adaptive: {...}, meta: {...}}` | `INTERNAL_ERROR` |
| `get_memory_state` | `src/services/tauri/backend-v17.2.commands.ts`<br>`src/services/singularityConnections.ts`<br>`src/services/autoAuditEngine.ts` | `{}` | `{stm: [...], mtm: [...], ltm: [...], stats: {...}}` | `DATABASE_ERROR` |
| `add_timeline_event` | `src/engines/selfHealing/selfHealingEngine.ts`<br>`src/services/tauri/backend-v17.2.commands.ts`<br>`src/tests/e2e/titane_e2e.test.ts` | `{event: TimelineEvent}` | `void` | `INVALID_INPUT`<br>`DATABASE_ERROR` |

### Medium-Traffic Commands (10-100 calls/session)

| Command | Frontend Files | Payload | Response | Errors |
|---------|----------------|---------|----------|--------|
| `chat_set_gemini_key` | `src/features/governance-center/services/governanceService.ts`<br>`src/utils/secureSecrets.ts`<br>`src/services/ai/providers/tauriChat.ts` | `{api_key: string}` | `SecureResponse<GeminiKeyStatus>` | `Err(String)` |
| `get_gemini_key_status` | `src/features/governance-center/services/governanceService.ts`<br>`src/utils/secureSecrets.ts`<br>`src/services/ai/providers/gemini.ts` | `{}` | `SecureResponse<GeminiKeyStatus>` | `Err(String)` |
| `chat_set_openai_key` | `src/features/governance-center/services/governanceService.ts`<br>`src/utils/secureSecrets.ts` | `{api_key: string}` | `SecureResponse<GeminiKeyStatus>` | `Err(String)` |
| `get_openai_key_status` | `src/features/governance-center/services/governanceService.ts`<br>`src/utils/secureSecrets.ts`<br>`src/services/ai/providers/openai.ts` | `{}` | `SecureResponse<GeminiKeyStatus>` | `Err(String)` |
| `chat_set_anthropic_key` | `src/features/governance-center/services/governanceService.ts`<br>`src/utils/secureSecrets.ts` | `{api_key: string}` | `SecureResponse<GeminiKeyStatus>` | `Err(String)` |
| `get_anthropic_key_status` | `src/features/governance-center/services/governanceService.ts`<br>`src/utils/secureSecrets.ts`<br>`src/services/ai/providers/claude.ts` | `{}` | `SecureResponse<GeminiKeyStatus>` | `Err(String)` |
| `get_copilot_key_status` | `src/features/governance-center/services/governanceService.ts`<br>`src/services/ai/providers/copilot.ts` | `{}` | `CopilotKeyStatus` | `Err(String)` |
| `chat_set_copilot_key` | `src/features/governance-center/services/governanceService.ts`<br>`src/services/ai/providers/copilot.ts` | `{api_key: string}` | `CopilotKeyStatus` | `Err(String)` |
| `avatar_set_appearance` | `src/modules/avatar/appearance/appearanceEngine.ts` | `{style: object}` | `void` | `SERIALIZATION_ERROR` |
| `autoheal_detect_broken_modules` | `src/__tests__/singularity-fusion-integration.test.ts`<br>`src/__tests__/e2e-automated-validation.test.tsx`<br>`src/__tests__/singularity-fusion-mocked.test.ts` | `{}` | `BrokenModule[]` | `INTERNAL_ERROR` |
| `performance_get_metrics` | `src/services/systemCenter/SystemAPI.ts`<br>`src/__tests__/e2e-automated-validation.test.tsx`<br>`src/__tests__/singularity-fusion-integration.test.ts` | `{}` | `{cpu_usage: number, gpu_usage: number, memory_usage: number, memory_available: number, fps: number, frame_time: number, render_time: number, idle_time: number, gc_time: number, network_latency: number, timestamp: number}` | `INTERNAL_ERROR` |

### Low-Traffic Commands (<10 calls/session)

| Command | Frontend Files | Payload | Response | Errors |
|---------|----------------|---------|----------|--------|
| `is_onboarding_complete` | `src/App.tsx`<br>`src/components/Onboarding/INTEGRATION_GUIDE.md` | `{}` | `boolean` | - |
| `export_security_log` | `src/features/governance-center/services/governanceService.ts` | `{format: "json" \| "csv"}` | `{path: string}` | `IO_ERROR` |
| `sc_run_full_diagnostics` | `src/features/system-center/hooks/useSystemDiagnostics.ts` | `{}` | `{results: [...]}` | `TIMEOUT` |
| `secure_store_secret` | `src/features/governance-center/services/governanceService.ts`<br>`src/utils/secureSecrets.ts` | `{key: string, value: string, purge_env?: boolean, env_variable?: string}` | `SecureResponse<SecretOperationResult>` | `Err(String)` |
| `secure_import_file` | `NO_CALLERS_FOUND` (allowlisted: `src/lib/security.ts`) | `{filename: string, data: number[]}` | `SecureResponse<string>` | `Err(String)` |
| `secure_read_file` | `NO_CALLERS_FOUND` (allowlisted: `src/lib/security.ts`) | `{safe_name: string}` | `SecureResponse<number[]>` | `Err(String)` |
| `secure_list_files` | `src/tests/e2e/titane_e2e.test.ts`<br>`src/test/setup.ts` (mock) | `{}` | `SecureResponse<string[]>` | `Err(String)` |
| `secure_delete_file` | `NO_CALLERS_FOUND` (allowlisted: `src/lib/security.ts`) | `{safe_name: string}` | `SecureResponse<void>` | `Err(String)` |
| `get_permission_audit` | `src/features/governance-center/services/governanceService.ts` | `{}` | `SecureResponse<string>` | `Err(String)` |
| `validate_chat_message` | `NO_CALLERS_FOUND` (allowlisted: `src/lib/security.ts`) | `{message: string}` | `SecureResponse<string>` | `Err(String)` |
| `check_system_integrity` | `src/features/governance-center/services/governanceService.ts`<br>`src/services/autoAuditEngine.ts`<br>`src/components/ChatDiagnostic.tsx` | `{}` | `SecureResponse<string>` | `Err(String)` |

### Orphaned Commands (No Frontend Callers - TO VERIFY)
- `memory_compactor_*` commands (deprecated)
- Some `cycle_engine_*` commands (disabled)
- Some legacy `singularity_*` commands (replaced by `singularity_state`)

---

## Payload Specifications

### 1. conversation_generate (OMEGA v2)

**Command:** `conversation_generate`

**Request:**
```typescript
interface ConversationGenerateRequest {
  conversationId: string;         // MANDATORY (BREAKING CHANGE from v1)
  message: string;                // User message (1-10,000 chars)
  provider?: "openai" | "claude" | "gemini" | "copilot" | "ollama"; // Optional, auto-routed if omitted
  temperature?: number;           // 0.0-2.0, default 0.7
  maxTokens?: number;             // 1-4096, default 2048
  systemPrompt?: string;          // Optional system context
}
```

**Response:**
```typescript
interface ConversationGenerateResponse {
  id: string;                     // Message ID (UUID)
  conversationId: string;         // Same as request
  role: "assistant";              // Always assistant for generated responses
  content: string;                // AI-generated response
  timestamp: string;              // ISO 8601
  provider: string;               // Which provider was used
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  metadata?: {
    model: string;                // e.g., "gpt-4-turbo"
    finishReason: string;         // "stop", "length", "content_filter"
  };
}
```

**Errors:**
- `INVALID_INPUT`: Missing `conversationId` or empty `message`
- `UNAUTHORIZED`: No API key for selected/routed provider
- `RATE_LIMITED`: Provider rate limit hit
- `EXTERNAL_API_ERROR`: Provider returned error (e.g., invalid API key, model unavailable)
- `TIMEOUT`: Request exceeded timeout (10s/30s/60s based on message length)

### 2. chat_get_providers_status

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
interface ProvidersStatusResponse {
  openai: boolean;      // true if API key set and valid
  claude: boolean;
  gemini: boolean;
  copilot: boolean;
  ollama: boolean;      // true if Ollama server reachable
  lastChecked: string;  // ISO 8601
}
```

### 3. avatar_advance_lip_sync

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
void // No return value
```

**Errors:**
- `INTERNAL_ERROR`: Backend returned `Err(String)`

### 4. singularity_get_full_state

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
interface SingularityState {
  physical: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
    health: number; // 0-100
  };
  cognitive: {
    attentionScore: number;       // 0-100
    workingMemoryLoad: number;    // 0-100
    processingSpeed: number;      // ops/sec
    emotionalState: string;       // "neutral", "curious", "excited", etc.
  };
  symbolic: {
    activePatterns: string[];
    symbolSpace: Record<string, unknown>;
  };
  adaptive: {
    learningRate: number;         // 0-1
    adaptationScore: number;      // 0-100
    recentAdaptations: string[];
  };
  meta: {
    coherenceScore: number;       // 0-100 (global coherence)
    selfAwarenessLevel: number;   // 0-100
    metaCognitiveState: string;
  };
  timestamp: string;              // ISO 8601
}
```

### 5. add_timeline_event

**Request:**
```typescript
interface TimelineEvent {
  id: string;
  timestamp: number;              // i64 côté Rust
  event_type: "SystemStart" | "ModuleInit" | "HealthChange" | "Repair" | "Snapshot" | "Alert";
  description: string;
  data: Record<string, unknown>;  // HashMap<String, serde_json::Value> côté Rust
}
```

**Response:**
```typescript
void // No return value
```

**Errors:**
- `INVALID_INPUT`: Champ manquant / invalide dans `event`
- `INTERNAL_ERROR`: Erreur backend (MemoryCore / AppResult)

### 6. autoheal_detect_broken_modules

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
interface BrokenModule {
  module_type: string;
  severity: string;
  error: string;
  detected_at: number; // u64 côté Rust
}

type AutoHealDetectBrokenModulesResponse = BrokenModule[]
```

### 7a. chat_set_gemini_key

**Request:**
```typescript
interface SetApiKeyRequest {
  api_key: string;                // Gemini API key
}
```

**Response:**
```typescript
type ChatSetGeminiKeyResponse = SecureResponse<GeminiKeyStatus>
```

**Errors:**
- Peut retourner `ok=false` avec `error` (validation côté backend)
- Peut échouer en `Err(String)` (permission / stockage)

### 7. chat_set_openai_key

**Request:**
```typescript
interface SetApiKeyRequest {
  api_key: string;                // OpenAI API key
}
```

**Response:**
```typescript
interface SecureResponse<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

interface GeminiKeyStatus {
  configured: boolean;
  provider_enabled: boolean;
  masked_key: string | null;
  env_present: boolean;
  env_purged: boolean;
  was_updated: boolean;
}

type ChatSetOpenAIKeyResponse = SecureResponse<GeminiKeyStatus>
```

**Errors:**
- Peut retourner `ok=false` avec `error` (validation côté backend)
- Peut échouer en `Err(String)` (permission / stockage)

### 7d. get_gemini_key_status

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
type GetGeminiKeyStatusResponse = SecureResponse<GeminiKeyStatus>
```

**Errors:**
- Peut échouer en `Err(String)` (permission / lecture)

### 7e. get_openai_key_status

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
type GetOpenAIKeyStatusResponse = SecureResponse<GeminiKeyStatus>
```

**Errors:**
- Peut échouer en `Err(String)` (permission / lecture)

### 7f. chat_set_anthropic_key

**Request:**
```typescript
interface SetAnthropicKeyRequest {
  api_key: string;                // Anthropic API key
}
```

**Response:**
```typescript
type ChatSetAnthropicKeyResponse = SecureResponse<GeminiKeyStatus>
```

**Errors:**
- Peut retourner `ok=false` avec `error` (validation côté backend)
- Peut échouer en `Err(String)` (permission / stockage)

### 7g. get_anthropic_key_status

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
type GetAnthropicKeyStatusResponse = SecureResponse<GeminiKeyStatus>
```

**Errors:**
- Peut échouer en `Err(String)` (permission / lecture)

### 7b. get_copilot_key_status

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
interface CopilotKeyStatus {
  configured: boolean;
  status: string;
  message: string | null;
}

// NOTE: retour direct du backend Rust (pas d'enveloppe SecureResponse)
type GetCopilotKeyStatusResponse = CopilotKeyStatus
```

**Errors:**
- Peut échouer en `Err(String)` (permission / lecture)

### 7c. chat_set_copilot_key

**Request:**
```typescript
interface SetCopilotKeyRequest {
  api_key: string;                // GitHub token
}
```

**Response:**
```typescript
type ChatSetCopilotKeyResponse = CopilotKeyStatus
```

**Errors:**
- Peut échouer en `Err(String)` (permission / stockage)

### 7h. secure_store_secret

**Request:**
```typescript
interface SecureSecretRequest {
  key: string;
  value: string;
  purge_env?: boolean;
  env_variable?: string;
}
```

**Response:**
```typescript
interface SecretOperationResult {
  key: string;
  stored: boolean;
  env_purged: boolean;
}

type SecureStoreSecretResponse = SecureResponse<SecretOperationResult>
```

**Errors:**
- Peut retourner `ok=false` avec `error` (validation côté backend)
- Peut échouer en `Err(String)` (permission / stockage)

### 7i. secure_import_file

**Request:**
```typescript
interface SecureImportFileRequest {
  filename: string;
  data: number[]; // bytes (Vec<u8> côté Rust)
}
```

**Response:**
```typescript
// Retourne le "safe_name" dans la sandbox
type SecureImportFileResponse = SecureResponse<string>
```

**Errors:**
- Peut retourner `ok=false` avec `error` (validation / import)
- Peut échouer en `Err(String)` (permission)

### 7j. secure_read_file

**Request:**
```typescript
interface SecureReadFileRequest {
  safe_name: string;
}
```

**Response:**
```typescript
type SecureReadFileResponse = SecureResponse<number[]> // bytes (Vec<u8> côté Rust)
```

**Errors:**
- Peut retourner `ok=false` avec `error` (validation / read)
- Peut échouer en `Err(String)` (permission)

### 7k. secure_list_files

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
type SecureListFilesResponse = SecureResponse<string[]>
```

**Errors:**
- Peut retourner `ok=false` avec `error` (list)
- Peut échouer en `Err(String)` (permission)

### 7l. secure_delete_file

**Request:**
```typescript
interface SecureDeleteFileRequest {
  safe_name: string;
}
```

**Response:**
```typescript
type SecureDeleteFileResponse = SecureResponse<void>
```

**Errors:**
- Peut retourner `ok=false` avec `error` (validation / delete)
- Peut échouer en `Err(String)` (permission)

### 7m. get_permission_audit

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
// Le backend retourne un JSON sérialisé dans un string
type GetPermissionAuditResponse = SecureResponse<string>
```

**Errors:**
- Peut retourner `ok=false` avec `error` (export)
- Peut échouer en `Err(String)` (permission)

### 7n. validate_chat_message

**Request:**
```typescript
interface ValidateChatMessageRequest {
  message: string;
}
```

**Response:**
```typescript
// Retourne le message sanitizé (anti-XSS)
type ValidateChatMessageResponse = SecureResponse<string>
```

**Errors:**
- Peut retourner `ok=false` avec `error` (validation)
- Peut échouer en `Err(String)` (permission)

### 7o. check_system_integrity

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
// Rapport multi-lignes (string)
type CheckSystemIntegrityResponse = SecureResponse<string>
```

**Errors:**
- Peut retourner `ok=false` avec `error` (integrity check)
- Peut échouer en `Err(String)` (permission)

### 8. voice_start_listening

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
string // ex: "Écoute activée"
```

**Errors:**
- `VALIDATION_ERROR`: Déjà en écoute
- `INTERNAL_ERROR`: Erreur backend (TAPIError)

### 9. performance_get_metrics

**Request:**
```typescript
{} // No parameters
```

**Response:**
```typescript
interface PerformanceMetrics {
  cpu_usage: number;
  gpu_usage: number;
  memory_usage: number;
  memory_available: number;
  fps: number;
  frame_time: number;
  render_time: number;
  idle_time: number;
  gc_time: number;
  network_latency: number;
  timestamp: number;
}
```

---

## Migration Guide (OMEGA v1 → v2)

### Breaking Change: conversationId Mandatory

**Old (v1) - DEPRECATED:**
```typescript
// ❌ This will fail in v26.2+
await invoke('chat_send_message', {
  message: 'Hello!',
  provider: 'openai'
});
```

**New (v2) - REQUIRED:**
```typescript
// ✅ Correct usage
const conversationId = await invoke<string>('chat_create_conversation', {});
await invoke('conversation_generate', {
  conversationId,
  message: 'Hello!',
  provider: 'openai'
});
```

### Migration Checklist

1. **Replace `chat_send_message` with `conversation_generate`**
   - Add `conversationId` parameter (get from `chat_create_conversation`)
   - Update response handling (new structure with `tokens`, `metadata`)

2. **Update conversation management**
   - Use `chat_create_conversation` to get `conversationId`
   - Store `conversationId` in component state or Zustand
   - Use same `conversationId` for entire conversation thread

3. **Update error handling**
   - `conversation_generate` has different error codes
   - Add handling for `UNAUTHORIZED` (prompt for API key)

4. **Testing**
   - Test with all providers (OpenAI, Claude, Gemini, Copilot, Ollama)
   - Test error scenarios (missing API key, rate limit, timeout)
   - Test conversation continuity (multiple messages in same conversation)

### Example Migration

**Before (v1):**
```typescript
// src/hooks/useChat.ts (v1 - OLD)
const sendMessage = async (message: string) => {
  try {
    const response = await invoke<string>('chat_send_message', { message });
    setMessages([...messages, { role: 'assistant', content: response }]);
  } catch (error) {
    console.error('Chat error:', error);
  }
};
```

**After (v2):**
```typescript
// src/hooks/useChat.ts (v2 - NEW)
const [conversationId, setConversationId] = useState<string | null>(null);

const initConversation = async () => {
  const id = await invoke<string>('chat_create_conversation', {});
  setConversationId(id);
};

const sendMessage = async (message: string) => {
  if (!conversationId) {
    await initConversation();
  }

  try {
    const response = await invoke<ConversationGenerateResponse>(
      'conversation_generate',
      {
        conversationId: conversationId!,
        message,
        provider: 'openai' // optional
      }
    );

    setMessages([
      ...messages,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      {
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
        metadata: response.metadata
      }
    ]);
  } catch (error) {
    const titaneError = TitaneError.fromTauri(error);

    if (titaneError.code === 'UNAUTHORIZED') {
      // Prompt user to set API key
      openApiKeyDialog();
    } else if (titaneError.code === 'RATE_LIMITED') {
      // Show rate limit message
      showNotification('Rate limited. Please wait before sending more messages.');
    } else {
      console.error('Chat error:', titaneError);
    }
  }
};
```

---

## Invariants

### Request Invariants
1. All string fields are UTF-8 encoded
2. All timestamps are ISO 8601 format
3. All IDs are UUIDs (v4)
4. All numeric ranges are validated (e.g., `temperature: 0-2`)
5. All required fields are present (Rust `Option<T>` = optional)

### Response Invariants
1. Always returns `Result<T, TitaneError>` (Rust) → Promise<T> or throws (TS)
2. Void commands return `()` → `Promise<void>`
3. All timestamps are server-assigned (client cannot override)
4. All IDs are server-generated (client cannot override)

### Error Invariants
1. All errors include `type` (error code) and `message` (human-readable)
2. `INTERNAL_ERROR` always logged server-side (never exposes stack traces)
3. `INVALID_INPUT` errors include field name in message
4. `EXTERNAL_API_ERROR` includes provider name

---

## Changelog

### v2.0 (2026-01-03)
- **BREAKING:** `conversation_generate` requires `conversationId`
- **DEPRECATED:** `chat_send_message` (OMEGA v1)
- **NEW:** GitHub Copilot provider support
- **IMPROVED:** Error codes standardized across all commands

### v1.0 (2025-11-01)
- Initial IPC contract documentation
- OMEGA Pipeline v1 (no conversationId)

---

**Document Status:** ✅ Complete (Phase 0)  
**Last Updated:** 2026-01-14  
**Next Review:** Phase 1 Audit (Validate all payload structures)
