# A4 — FIX PLAN

## Fix Strategy

**Approach:** Fix B (Unconditional module declaration)

Reasoning:
- Binary/library compilation difference is timing of module availability
- Solution: Make module path ALWAYS available to compiler
- Implementation details stay conditional (feature-gated)

---

## Implementation Plan

### Step 1: Make mod.rs capture declaration UNCONDITIONAL

**File:** `src-tauri/src/audio/mod.rs`

**Current (line 8-9):**
```rust
#[cfg(feature = "audio-capture")]
pub mod capture;
```

**Change to:**
```rust
pub mod capture;
```

**Effect:**
- Module path `crate::audio::capture` always resolvable
- Import at commands.rs:1436 will find the path
- E0432 resolved

---

### Step 2: Make mod.rs capture exports CONDITIONAL or DUAL

**File:** `src-tauri/src/audio/mod.rs`

**Current (line 18):**
```rust
#[cfg(feature = "audio-capture")]
pub use capture::{list_input_devices, list_output_devices, AudioCaptureState};
```

**Keep as-is:**
- Re-exports stay conditional
- API visible only when feature active (expected behavior)
- Module path exists regardless

---

### Step 3: Restructure capture.rs to handle both cases

**File:** `src-tauri/src/audio/capture.rs`

**Current structure:**
- ~415 lines of real implementation
- Tests at end
- Uses cpal + ALSA

**New structure:**
```rust
// ─────────────────────────────────────────────────
//  ACTUAL IMPLEMENTATION (when feature active)
// ─────────────────────────────────────────────────

#[cfg(feature = "audio-capture")]
pub struct AudioCaptureState {
    // real impl ...
}

#[cfg(feature = "audio-capture")]
pub fn list_input_devices() -> Vec<...> {
    // real impl
}

#[cfg(feature = "audio-capture")]
pub fn list_output_devices() -> Vec<...> {
    // real impl
}

// ─────────────────────────────────────────────────
//  FALLBACK STUBS (when feature NOT active)
// ─────────────────────────────────────────────────

#[cfg(not(feature = "audio-capture"))]
pub struct AudioCaptureState;

#[cfg(not(feature = "audio-capture"))]
pub fn list_input_devices() -> Vec<String> {
    vec![]
}

#[cfg(not(feature = "audio-capture"))]
pub fn list_output_devices() -> Vec<String> {
    vec![]
}

// ─────────────────────────────────────────────────
//  TESTS (unchanged, will compile only with feature)
// ─────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    // existing tests ...
}
```

**Key points:**
- Types always defined (different impls based on feature)
- Functions always defined (return empty/stub values)
- Tests stay conditional (no change needed)
- Binary gets stubs when feature OFF
- Tests run when feature ON

---

## Expected Outcome

1. ✅ `pub mod capture;` unconditional → path always resolvable
2. ✅ Structures/functions defined in both cases → no E0432
3. ✅ Real implementation available when feature active
4. ✅ Graceful fallback when feature inactive
5. ✅ `pnpm tauri build` succeeds

---

## Risk Assessment

**Low risk:**
- Change is surgical (minimal scope)
- Only affects module visibility, not logic
- Feature already in defaults (will be ON in most cases)
- Fallbacks are no-op (safe for binary without audio)

**No breaking changes:**
- API surface same when feature ON
- Only difference: module path always exists (improvement)

---

## Rollback Plan

If fix fails:
```bash
git diff src-tauri/src/audio/mod.rs
git diff src-tauri/src/audio/capture.rs
git restore src-tauri/src/audio/mod.rs src-tauri/src/audio/capture.rs
```

---

## Next Step

→ Apply fix (PHASE 4 Implementation)

