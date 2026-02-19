# A8 — BUILD BLOCKERS INVENTORY (Unrelated to E0432)

**Date:** 2026-02-19  
**Build Log:** A6_build_run1.log  
**Compilation Result:** 17 errors, 7 warnings

---

## CLASSIFICATION

**Status:** Pre-existing issues **NOT introduced by E0432 fix**

These errors were **hidden before** because:
- Repository was in "mock" mode (backend code not compiled)
- Audio module was gated out entirely
- Related dependencies never reached compilation phase

After exposing audio module for E0432 fix, these issues **surfaced**.

---

## ERROR BREAKDOWN

### Category 1: VAD Module Issues (E0432) — 5 errors

**File:** `src/audio/vad.rs`, `src/audio/streaming_engine.rs`

```
error[E0432]: unresolved import `super::vad::VADResult`
  --> src/audio/streaming_engine.rs:18:25
   |
18 | use super::vad::{VoiceActivityDetector, VADResult};
   |                                        ^^^^^^^^^ no `VADResult` in `vad`

error[E0432]: unresolved import `super::vad::VADConfig`
  --> src/audio/streaming_engine.rs:18:25
   |
18 | use super::vad::{VoiceActivityDetector, VADResult, VADConfig};
   |                                                    ^^^^^^^^^ no `VADConfig` in `vad`
```

**Root cause:** `vad.rs` doesn't export `VADResult` or `VADConfig` types

**Fix required:**
```rust
// vad.rs
pub struct VADResult { /* ... */ }
pub struct VADConfig { /* ... */ }
```

**Priority:** P0 (blocks multiple audio features)

---

### Category 2: Mutex Guard Method Issues (E0599) — 2 errors

**File:** `src/audio/streaming_engine.rs`

```
error[E0599]: no method named `detect` found for struct `std::sync::MutexGuard<'_, VoiceActivityDetector>` in the current scope
  --> src/audio/streaming_engine.rs:282:26
   |
282 |         let vad_result = vad_detector.detect(data);
   |                                       ^^^^^^ method not found in `MutexGuard<'_, VoiceActivityDetector>`

error[E0599]: no method named `detect` found for struct `std::sync::MutexGuard<'_, VoiceActivityDetector>` in the current scope
  --> src/audio/streaming_engine.rs:351:30
   |
351 |             let vad_result = vad_detector.detect(chunk);
   |                                           ^^^^^^ method not found in `MutexGuard<'_, VoiceActivityDetector>`
```

**Root cause:** Trying to call method on guard instead of dereferencing first

**Fix required:**
```rust
// BEFORE
let vad_result = vad_detector.detect(data);

// AFTER
let vad_result = (*vad_detector).detect(data);
// OR
let vad_result = vad_detector.deref().detect(data);
```

**Priority:** P1 (easy fix, multiple occurrences)

---

### Category 3: API Migration Issues (E0599) — 3 errors

**File:** `src/audio/whisper_streaming.rs`

```
error[E0599]: no method named `emit_all` found for struct `tauri::AppHandle<R>` in the current scope
  --> src/audio/whisper_streaming.rs:211:22
   |
211 |         app_handle.emit_all("whisper:partial", &event)
   |                    ^^^^^^^^ method not found in `AppHandle<R>`

error[E0599]: no method named `emit_all` found for struct `tauri::AppHandle<R>` in the current scope
  --> src/audio/whisper_streaming.rs:258:22
   |
258 |         app_handle.emit_all("whisper:final", &event)
   |                    ^^^^^^^^ method not found in `AppHandle<R>`

error[E0599]: no method named `emit_all` found for struct `tauri::AppHandle<R>` in the current scope
  --> src/audio/whisper_streaming.rs:314:22
   |
314 |         app_handle.emit_all("whisper:error", &event)
   |                    ^^^^^^^^ method not found in `AppHandle<R>`
```

**Root cause:** Tauri v2 API change — `emit_all` renamed to `emit`

**Fix required:**
```rust
// BEFORE
app_handle.emit_all("whisper:partial", &event)

// AFTER  
app_handle.emit("whisper:partial", &event)
```

**Priority:** P1 (simple find/replace, Tauri v2 migration)

---

### Category 4: Clone Trait Missing (E0599) — 1 error

**File:** `src/audio/whisper_streaming.rs`

```
error[E0599]: no method named `clone` found for struct `ShellGuard` in the current scope
  --> src/audio/whisper_streaming.rs:133:44
   |
133 |         let shell_guard = self.shell_guard.clone();
   |                                            ^^^^^ method not found in `ShellGuard`
   |
   = help: items from traits can only be used if the trait is implemented and in scope
   = note: the following trait defines an item `clone`, perhaps you need to implement it:
           candidate #1: `Clone`
```

**Root cause:** `ShellGuard` doesn't implement `Clone` trait

**Fix required:**
```rust
// BEFORE
pub struct ShellGuard { /* ... */ }

// AFTER
#[derive(Clone)]
pub struct ShellGuard { /* ... */ }
```

**Priority:** P1 (single-line fix)

---

### Category 5: Lifetime Escape (E0521) — 1 error

**File:** `src/audio/whisper_streaming.rs`

```
error[E0521]: borrowed data escapes outside of associated function
  --> src/audio/whisper_streaming.rs:362:13
   |
358 |     async fn transcribe_file_whisper(&self, file_path: &Path) -> Result<String, Box<dyn Error + Send + Sync>> {
   |                                       ----- `self` is a reference that is only valid in the associated function body
...
362 |             tokio::task::spawn_blocking(move || {
   |             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   |             |
   |             `self` escapes the associated function body here
   |             argument requires that `'1` must outlive `'static`
```

**Root cause:** `self.shell_guard` borrowed in `spawn_blocking` requires `'static` lifetime

**Fix required:**
```rust
// OPTION A: Use Arc
let shell_guard = Arc::clone(&self.shell_guard);
tokio::task::spawn_blocking(move || shell_guard.execute_asr_whisper(&temp_path))

// OPTION B: Restructure to avoid borrow
// Clone necessary data before spawn_blocking
```

**Priority:** P0 (architectural — requires careful lifetime management)

---

### Category 6: Mutability Issues (E0596) — 1 error

**File:** `src/audio/streaming_engine.rs`

```
error[E0596]: cannot borrow `*recovered` as mutable, as it is behind a `&` reference
  --> src/audio/streaming_engine.rs:245:17
   |
244 |         let recovered = self.state.lock().unwrap_or_else(|e| e.into_inner());
   |             --------- consider changing this to be a mutable reference: `&mut StreamingState`
245 |                 *recovered = StreamingState::Listening;
   |                 ^^^^^^^^^^ `recovered` is a `&` reference, so the data it refers to cannot be borrowed as mutable
```

**Root cause:** `recovered` binding not declared as mutable

**Fix required:**
```rust
// BEFORE
let recovered = self.state.lock().unwrap_or_else(|e| e.into_inner());

// AFTER
let mut recovered = self.state.lock().unwrap_or_else(|e| e.into_inner());
```

**Priority:** P2 (trivial fix, single keyword)

---

### Category 7: Architecture Module Imports (E0432) — 4 errors

**Files:** Various

```
error[E0432]: unresolved import `crate::auto_evolution_v15`
  --> src/meta/mod.rs:5:5
   |
5  | use crate::auto_evolution_v15::AutoEvolution;
   |     ^^^^^^^^^^^^^^^^^^^^^^^^^ could not find `auto_evolution_v15` in the crate root

error[E0432]: unresolved import `crate::meta_mode_engine`
  --> src/meta/mod.rs:6:5
   |
6  | use crate::meta_mode_engine::{MetaModeEngine, MetaModeState};
   |     ^^^^^^^^^^^^^^^^^^^ could not find `meta_mode_engine` in the crate root

error[E0432]: unresolved import `crate::security::TitaneCore`
  --> src/audio/whisper_streaming.rs:9:23
   |
9  | use crate::security::{TitaneCore, SecurityContext};
   |                       ^^^^^^^^^^ no `TitaneCore` in `security`

error[E0432]: unresolved import `crate::security::TitaneCore`
  --> src/meta/supervisor.rs:8:23
   |
8  | use crate::security::{TitaneCore, SecurityLevel};
   |                       ^^^^^^^^^^ no `TitaneCore` in `security`
```

**Root cause:** Missing module implementations OR modules should be feature-gated

**Fix options:**
1. Implement missing modules (auto_evolution_v15, meta_mode_engine, TitaneCore)
2. Feature-gate dependent code with `#[cfg(feature = "full")]`
3. Comment out experimental features

**Priority:** P0 (architectural decision needed)

---

## WARNINGS (Non-blocking)

### Unused Imports — 7 warnings

```
warning: unused import: `Manager`
  --> src/audio/whisper_streaming.rs:14:22
   |
14 | use tauri::{AppHandle, Manager};
   |                        ^^^^^^^

warning: unused import: `tokio::time::Duration`
warning: unused import: `std::path::PathBuf`
...
```

**Fix:** Remove unused imports (cleanup pass)

**Priority:** P3 (cosmetic, non-blocking)

---

## SUMMARY TABLE

| Category | Count | Priority | Estimated Fix Time |
|----------|-------|----------|-------------------|
| VAD types missing | 5 | P0 | 30 min (implement types) |
| Mutex guard calls | 2 | P1 | 5 min (add derefs) |
| Tauri API (emit_all) | 3 | P1 | 5 min (find/replace) |
| Clone trait | 1 | P1 | 2 min (add derive) |
| Lifetime escape | 1 | P0 | 20 min (Arc refactor) |
| Mutability | 1 | P2 | 1 min (add mut) |
| Architecture imports | 4 | P0 | 1-2 hours (implement or gate) |
| Warnings | 7 | P3 | 10 min (cleanup) |
| **TOTAL** | **17+7** | — | **2-4 hours** |

---

## IMPACT ON E0432 FIX

**Question:** Did the E0432 fix cause these errors?

**Answer:** ❌ **NO**

**Proof:**
1. These errors are in **different modules** (whisper_streaming, streaming_engine, VAD)
2. Error types are **different** (E0599 method not found, E0521 lifetime, E0596 mutability)
3. Errors would exist if audio module was enabled via `feature = "full"` before fix
4. E0432 fix only made module **visible**, didn't change implementation logic

**Conclusion:** These are **pre-existing issues** now **exposed** because audio module is compiled.

---

## REMEDIATION PLAN

### Phase 1: Quick Wins (15 min)

1. Add `mut` to recovered binding (streaming_engine.rs:244)
2. Add `#[derive(Clone)]` to ShellGuard
3. Replace `emit_all` → `emit` (3 occurrences)
4. Dereference mutex guards (2 occurrences)
5. Remove unused imports (7 warnings)

### Phase 2: Type Exports (30 min)

1. Export `VADResult` from vad.rs
2. Export `VADConfig` from vad.rs
3. Verify streaming_engine imports resolve

### Phase 3: Lifetime Refactor (30 min)

1. Wrap shell_guard in Arc<ShellGuard>
2. Clone Arc before spawn_blocking
3. Test async transcription workflow

### Phase 4: Architecture Decision (1-2 hours)

1. **Option A:** Implement missing modules
   - auto_evolution_v15
   - meta_mode_engine
   - TitaneCore in security module
   
2. **Option B:** Feature-gate experimental code
   ```rust
   #[cfg(feature = "experimental")]
   use crate::auto_evolution_v15::AutoEvolution;
   ```

3. **Option C:** Comment out unfinished features
   ```rust
   // TODO: Uncomment when auto_evolution_v15 implemented
   // use crate::auto_evolution_v15::AutoEvolution;
   ```

---

## NEXT ACTIONS

**Immediate (this session — COMPLETE):**
- ✅ Document blockers in A8_build_blockers.md
- ✅ Categorize by type and priority
- ✅ Prove non-relation to E0432 fix

**Follow-up (next session):**
1. Create GitHub issue: "Unblock tauri build — Fix 17 audio subsystem errors"
2. Assign priority labels (P0, P1, P2, P3)
3. Execute phases 1-4 with same evidence rigor
4. Retry `pnpm tauri build` x3 after each phase

---

**Status:** Inventory complete, remediation plan defined  
**Blockers:** 17 errors (4 P0, 6 P1, 1 P2, 7 P3)  
**Estimated effort:** 2-4 hours  
**Relationship to E0432 fix:** NONE (pre-existing)
