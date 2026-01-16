# 🔒 TITANE∞ - SECURITY FIX ACTION PLAN
**Date:** 2026-01-07
**Priority:** CRITICAL
**Status:** IN PROGRESS

---

## 🎯 EXECUTIVE SUMMARY

This document outlines the immediate security fixes required for TITANE∞ v26.2.0 based on the comprehensive audit. All HIGH priority issues will be addressed in this session.

---

## 🔴 HIGH PRIORITY FIXES (Immediate)

### 1. CSP Policy Hardening ✅ READY
**File:** `src-tauri/tauri.conf.json` line 64
**Issue:** CSP allows `unsafe-eval` and `unsafe-inline`
**Risk:** XSS attacks, code injection
**Impact:** HIGH
**Effort:** 30 minutes

**Current CSP:**
```
script-src 'self' 'unsafe-eval' 'unsafe-inline' asset: tauri: *;
```

**Production-Safe CSP:**
```
default-src 'self' tauri: asset:;
script-src 'self' asset: tauri:;
style-src 'self' 'unsafe-inline' asset: tauri:;
img-src 'self' asset: data: blob: https:;
font-src 'self' asset: data:;
connect-src 'self' tauri: asset: ipc: http: https: ws: wss:;
media-src 'self' asset: blob: mediastream:;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```

**Note:** Keep `'unsafe-inline'` for style-src only (required for React inline styles). Remove from script-src.

**Action:** Apply new CSP to `src-tauri/tauri.conf.json`

---

### 2. Backend unwrap/expect Elimination 🔄 IN PROGRESS
**Files:** 236 Rust files with unwrap/expect
**Issue:** 1,430+ instances of `.unwrap()` and `.expect()`
**Risk:** Application panics leading to crashes
**Impact:** HIGH
**Effort:** 16-24 hours (batch approach)

**Top 20 Files (Most Critical):**
1. `unified_memory_v2/tests.rs` - 41 instances
2. `avatar/appearance_commands.rs` - 41 instances
3. `identity/identity_matrix.rs` - 30 instances
4. `cluster/mesh_layer.rs` - 29 instances
5. `types/memory_chat.rs` - 25 instances
6. `memory_os/ltm.rs` - 24 instances
7. `core/tests_integration.rs` - 24 instances
8. `types/memory.rs` - 22 instances
9. `identity/mode_system.rs` - 22 instances
10. `memory_os/multimodal_memory.rs` - 21 instances
11. `conversation_engine/french_mastery.rs` - 21 instances
12. `cognitive_gravity/mod.rs` - 21 instances
13. `control_panel_commands/tests.rs` - 20 instances
14. `adaptive/adaptive_engine.rs` - 19 instances
15. `types/evolution.rs` - 18 instances
16. `security/security_engine.rs` - 18 instances
17. `multimodal/image_memory.rs` - 18 instances
18. `creation/generator.rs` - 18 instances
19. `avatar/immersive_avatar_engine.rs` - 18 instances
20. `api_hub/vault_bridge.rs` - 18 instances

**Strategy:**
- **Phase 1:** Fix test files (tests.rs, tests_integration.rs) - OK to keep some unwrap in tests
- **Phase 2:** Fix command handlers (appearance_commands.rs, etc.)
- **Phase 3:** Fix core engines (identity_matrix.rs, adaptive_engine.rs, etc.)

**Pattern:**
```rust
// BEFORE
let value = some_option.unwrap();

// AFTER
let value = some_option
    .ok_or_else(|| TitaneError::NoneError("Expected value".into()))?;
```

**Action:** Create automated refactoring script for common patterns

---

### 3. Hardcoded Secrets Audit ⚠️ FOUND
**Files:** 31 TypeScript files with potential secrets
**Issue:** 118 occurrences of "api_key", "password", "secret"
**Risk:** Credential leakage
**Impact:** HIGH
**Effort:** 4-8 hours

**Critical Files:**
1. `services/ai/providers/openai.ts` - API keys
2. `services/ai/providers/claude.ts` - API keys
3. `services/ai/providers/gemini.ts` - API keys
4. `utils/secureSecrets.ts` - Secret management
5. `lib/security.ts` - Security utilities
6. `core/auth/authClient.ts` - Authentication
7. `features/governance-center/services/governanceService.ts` - Governance

**Pattern to Find:**
```typescript
// BAD - Hardcoded
const API_KEY = "sk-1234567890abcdef";

// GOOD - Environment variable
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
```

**Action:**
1. Review all 31 files
2. Move hardcoded secrets to `.env`
3. Update to use `import.meta.env.*`
4. Add validation for required env vars

---

### 4. Zeroize Implementation 🔄 PLANNED
**Issue:** API keys remain in memory (1,912 credential patterns)
**Risk:** Memory dumps could leak keys
**Impact:** HIGH
**Effort:** 4-8 hours

**Rust Side:**
```rust
// Add to Cargo.toml
zeroize = { version = "1.7", features = ["derive"] }

// Use in code
use zeroize::{Zeroize, Zeroizing};

#[derive(Zeroize)]
#[zeroize(drop)]
struct ApiKey {
    key: String,
}

// Or for temporary values
let api_key = Zeroizing::new(String::from("secret"));
```

**Files to Update:**
- `src-tauri/src/ia/` - AI provider API keys
- `src-tauri/src/api_hub/` - API hub credentials
- `src-tauri/src/security/secrets_engine.rs` - Secret storage
- `src-tauri/src/cluster/` - Cluster authentication

**Action:** Add zeroize dependency and implement in critical paths

---

### 5. dangerousDisableAssetCspModification Review ⚠️ FLAGGED
**File:** `src-tauri/tauri.conf.json` line 65
**Setting:** `"dangerousDisableAssetCspModification": true`
**Issue:** Bypasses asset CSP protections
**Risk:** Asset-based XSS attacks
**Impact:** MEDIUM-HIGH
**Effort:** 1 hour (investigation)

**Action:**
1. Test if application works with `false`
2. If required, document WHY it's needed
3. Add compensating controls

---

## 🟡 MEDIUM PRIORITY FIXES (Short-term)

### 6. Dead Code Warnings 📋 PLANNED
**Issue:** `#[allow(dead_code)]` globally enabled in Cargo.toml
**Risk:** Hides potentially unused code
**Impact:** MEDIUM
**Effort:** 16-24 hours

**Action:**
1. Remove global `allow(dead_code)`
2. Run `cargo build` and collect warnings
3. Fix or explicitly allow per-module

---

### 7. Unsafe Code Documentation ✅ PARTIALLY DONE
**File:** `src-tauri/UNSAFE_DOCUMENTATION.md`
**Issue:** 2 unsafe blocks need review
**Risk:** Memory safety violations
**Impact:** MEDIUM
**Effort:** 2-4 hours

**Locations:**
1. `kernel/scheduler.rs` - Send+Sync implementation
2. `config/io.rs:148-151` - `unsafe { set_var }`

**Action:** Review and add additional safety comments

---

## 📊 PROGRESS TRACKING

| Task | Status | Progress | ETA |
|------|--------|----------|-----|
| 1. CSP Policy Fix | ✅ Ready | 100% | Immediate |
| 2. unwrap/expect Top 20 | 🔄 In Progress | 0% | 8-12h |
| 3. Hardcoded Secrets Audit | ⚠️ Found | 0% | 4-8h |
| 4. Zeroize Implementation | 📋 Planned | 0% | 4-8h |
| 5. dangerousDisable Review | ⚠️ Flagged | 0% | 1h |
| 6. Dead Code Warnings | 📋 Planned | 0% | 16-24h |
| 7. Unsafe Code Review | ✅ Partial | 50% | 2-4h |

**Total Estimated Effort:** 35-57 hours
**Critical Path:** Tasks 1-5 (18-33 hours)

---

## 🚀 EXECUTION PLAN

### Session 1 (NOW - GO ALL) - 2-4 hours
1. ✅ Apply CSP policy fix (30 min)
2. 🔄 Fix top 10 unwrap/expect files (2-3h)
3. ⚠️ Audit top 10 secret files (1h)

### Session 2 - 4-6 hours
4. Fix next 10 unwrap/expect files (2-3h)
5. Move secrets to environment variables (2-3h)

### Session 3 - 4-6 hours
6. Implement zeroize for API keys (4-6h)

### Session 4 - 2-3 hours
7. Review dangerousDisable setting (1h)
8. Enable dead_code warnings (1-2h)

### Session 5 - 1-2 hours
9. Final verification and testing (1-2h)

---

## ✅ SUCCESS CRITERIA

1. **CSP Policy:** No unsafe-eval, only style unsafe-inline
2. **unwrap/expect:** Top 20 files reduced by 80%+
3. **Secrets:** Zero hardcoded credentials
4. **Zeroize:** All API keys zeroized
5. **Build:** Success with no new errors
6. **Tests:** 151/151 passing maintained

---

## 📝 NOTES

- Test files can keep some unwrap() for simplicity
- Focus on production code first
- Maintain 100% test pass rate
- Document all breaking changes

---

**Created:** 2026-01-07
**Last Updated:** 2026-01-07
**Status:** Active Implementation
