# P3 Provider Orchestration — Contract Reference

**Sealed**: 2026-02-16 17:21:21 UTC  
**Authority**: TITANE∞ P3 Governance (Ring 0—immutable)  
**Scope**: Provider meta decision-making contract + invariants

---

## Core Contract: ProviderDecisionMeta

**Location**: `src-tauri/src/types.rs` (canonical source of truth)  
**Ring**: 1 (Types—no runtime logic)  
**Stability**: 🔒 LOCKED post-P3-2

### Struct Definition

```rust
pub struct ProviderDecisionMeta {
    /// Which provider executed this response (e.g., "ollama", "unified_ia", "offline")
    pub provider_used: String,
    
    /// Classification: Local (localhost), Remote (API), Hybrid (cached+remote)
    pub provider_class: ProviderClass,
    
    /// Execution mode: Local|Remote|Offline|Cached|Error
    pub mode: ProviderMode,
    
    /// Reason for mode selection (ReasonCode enum ~18 variants)
    pub reason_code: ReasonCode,
    
    /// True if response traversed network (provider_class=Remote)
    pub network_used: bool,
    
    /// Attempt history (always non-empty)
    pub attempts: Vec<ProviderAttemptMeta>,
    
    /// Total latency in milliseconds
    pub latency_ms_total: u64,
    
    /// Timeout threshold used (milliseconds)
    pub timeout_ms: u32,
    
    /// Number of retry attempts made
    pub retries: u32,
    
    /// True if response served from cache
    pub cache_hit: bool,
    
    /// Policy applied (e.g., "local_only", "force_offline", "auto")
    pub policy: String,
}
```

### Enums (Canonical)

**ProviderClass**:
```
Local    → provider_used in {"ollama", "offline"}
Remote   → provider_used in {"unified_ia", "gemini", "anthropic"}
Hybrid   → Cache + Remote fallback
```

**ProviderMode**:
```
Local    → Executed on localhost (Ollama or error handler)
Remote   → Executed on external API (UnifiedIA, Gemini, etc.)
Offline  → No internet; forced local or error
Cached   → Served from cache (no execution)
Error    → Provider selection failed; no valid response
```

**ReasonCode** (~18 variants):
```
Ok                          → Normal execution
Ok_Cached                   → Served from cache
PolicyLocalOnly             → User policy="local_only"
PolicyForcedOffline         → User policy="force_offline"
FallbackOffline             → Internet down; offline fallback
TimeoutPrimary              → Primary provider timeout
TimeoutAll                  → All providers timeout
NetworkCheckFailed          → check_internet() returned false
ProviderUnreachable         → Provider HTTP error (e.g., 503)
ProviderInvalid             → Config issue (bad API key)
MaxRetriesExceeded          → Retry logic exhausted
CacheExpired                → Cache entry stale
InvalidRequest              → Malformed ConversationRequest
DecisionEngineError         → Internal engine error
OfflineSimulation           → Test mode (OFFLINE_SIM=1)
[others...]
```

---

## Invariants (Ring Locked)

### Invariant INV-1: Meta Presence
**Statement**: Every ConversationResponse must contain a valid ProviderDecisionMeta.  
**Enforcement**: Ring 3 (AIRouter) accumulator; asserted at IPC boundary (Ring 4).  
**Test**: P3-4, P3-6 smoke tests (165+ messages validated).

### Invariant INV-2: Provider-Class Coherence
**Statement**: 
- If `network_used=true` → `provider_class` must be `Remote`
- If `provider_class=Local` → `network_used` must be `false`
- If `provider_class=Hybrid` → `network_used` may be true or false (depends on cache)

**Enforcement**: `assert_meta()` validation in test harness.  
**Test**: P3-6 `assert_meta()` coverage across all provider paths.

### Invariant INV-3: Determinism Under OFFLINE_SIM
**Statement**: When `OFFLINE_SIM=1` env var is set, repeated invocations with identical input produce identical meta signatures (provider_used, provider_class, mode, reason_code).  
**Enforcement**: Test harness `test_p3_determinism_signature_x3()` (3 runs, signature equality).  
**Test**: P3-6 recovery harness; 3 runs PASS.

### Invariant INV-4: Offline Fallback Contract
**Statement**: When `mode=Offline`, then `reason_code ∈ {FallbackOffline, PolicyForcedOffline, OfflineSimulation}` and `network_used=false`.  
**Enforcement**: Ring 3 isolation + test validation.  
**Test**: P3-6 `test_p3_offline5_offlinesim_x3()` (validates OFFLINE_SIM → mode=Offline).

### Invariant INV-5: No Unauthorized Network Reach
**Statement**: New provider instrumentation (P3-3, P3-4) introduces no new uncontrolled HTTP callouts. All remote providers are:
- Configured (API keys stored in secure config)
- Authenticated (Bearer tokens in request headers)
- Gated (behind policy checks, timeout breakers)
- Observable (meta log all attempts)

**Enforcement**: Scan ring (no-network patterns) + test evidence.  
**Test**: P3-6 No-network scans (src-tauri, src); anti-Vite scan (Vite strings are artifacts, not runtime).

### Invariant INV-6: Ring Discipline
**Statement**: 
- Ring 1 (Types): No runtime logic
- Ring 2 (Engines): Pure logic, no I/O
- Ring 3 (Services): Controlled I/O, meta accumulation
- Ring 4 (Modules/UI/Tests): User-facing, error handling

Any change outside Ring 4 (tests/UI) must pass ring-specific audit.

**Enforcement**: P1/P2-level stop-the-line gates + manual review.  
**Test**: File-change boundary check in P3-6 proof pack.

---

## AIRouter Provider Cascade (Ring 3 Service)

**Location**: `src-tauri/src/ai/router.rs`  
**Stability**: 🔒 LOCKED post-P3-3

### Cascade Logic

```
Input: ConversationRequest { message, provider_preference, policy }
         ↓
    Check Cache (if available)
         ↓ (CACHE_HIT)
    Return Cached + meta { mode=Cached, reason_code=Ok_Cached, network_used=false }
         ↓ (CACHE_MISS)
    Check Internet (3s timeout)
         ↓ (NO_INTERNET)
    Return Offline Error + meta { mode=Offline, reason_code=FallbackOffline, network_used=false }
         ↓ (ONLINE)
    Apply provider_preference:
      - "local_only" → Ollama only
      - "remote_only" → UnifiedIA/Gemini only
      - "auto" → Cascade (UnifiedIA → Gemini → Ollama → Offline)
         ↓
    Try UnifiedIA (if allowed)
      ✅ → Return + meta { provider_used="unified_ia", mode=Remote, network_used=true }
      ❌ → Retry up to 3 times on timeout
      ❌❌ → Fallback to Gemini
         ↓
    Try Gemini (if allowed)
      ✅ → Return + meta { provider_used="gemini", mode=Remote, network_used=true }
      ❌ → Fallback to Ollama
         ↓
    Try Ollama (localhost:11434)
      ✅ → Return + meta { provider_used="ollama", mode=Local, network_used=false }
      ❌ → Return Offline Error + meta { mode=Offline, reason_code=ProviderUnreachable }
```

### Test-Only Hooks

**OFFLINE_SIM Environment Variable** (Ring 3, guarded):
- When set to "1", AIRouter immediately returns mock offline response
- **Purpose**: Deterministic testing without external provider dependency
- **Enforcement**: Gated to test-only; not accessible in production
- **Proof**: P3-3 and P3-6 test harness validation

---

## IPC Contract (Ring 4)

**Command**: `conversation_generate`  
**Location**: `src-tauri/src/commands/conversation.rs`  

### Request (ConversationRequest)

```typescript
{
  message: string,
  provider_preference?: "local_only" | "remote_only" | "auto",
  policy?: string,
  timeout_ms?: number,
}
```

### Response (ConversationResponse)

```typescript
{
  ok: boolean,
  content?: {
    assistant_message: string,
    metadata: ProviderDecisionMeta
  },
  error?: string
}
```

**Contract Guarantee**: 
- If `ok=true`, then `content.metadata` is always valid ProviderDecisionMeta
- If `ok=false`, then `error` is non-empty, and `metadata` may be partial

**Test Coverage**: P3-4 (IPC round-trip), P3-6 (smoke tests with full meta validation)

---

## Governance Seals

**P3-0 to P3-5**: ✅ PASS (prior phases established types, instrumentation, IPC, UI)  
**P3-6 Initial**: ❌ BLOCKED (Vite violation; evidence preserved)  
**P3-6 Recovery**: ✅ PASS (no-Vite harness; determinism verified)  
**P3-7 Seal**: 🔒 **THIS DOCUMENT** (Contract locked for archive)

---

**Authority**: Copilot (Windows AI Studio), AUTO mode  
**Date Sealed**: 2026-02-16 17:21:21 UTC  
**Next Phase**: Archive immutable to deployment/latest/certification/p3/
