# A3 — ROOT CAUSE ANALYSIS (STRICT VERDICT)

## Classification

**Type:** Type 4 — Module exists but cfg gate NOT applied to binary correctly

---

## Root Cause (Evidence-Based)

The Rust compiler's module resolution happens in separate phases:

1. **Parse phase:** Reads all syntax including `#[cfg(...)]` attributes
2. **Import resolution phase:** Validates that paths exist (e.g., `crate::audio::capture`)
3. **Type checking phase:** Verifies type compatibility
4. **CFG evaluation phase:** Applies conditional compilation AFTER path validation

### What happens during E0432:

1. Compiler analyzes `src-tauri/src/audio/commands.rs:1436`:
   ```rust
   #[cfg(feature = "audio-capture")]
   use crate::audio::capture::{ ... };
   ```

2. Path resolution: Checks if `crate::audio::capture` exists

3. Module lookup in `audio/mod.rs`:
   ```rust
   #[cfg(feature = "audio-capture")]
   pub mod capture;          ← PROBLEM: Module itself is gated
   ```

4. **When binary compiled:** Feature flag NOT active (or not propagated) → module doesn't exist
5. Compiler rejects: **E0432 unresolved import**
6. **After** this error, the outer `#[cfg(feature = "audio-capture")]` on the import would have hidden it anyway

### Why library tests work:

- `cargo test --lib --features "audio-capture"` works ✅
- Library explicitly includes feature: path found, module exists
- Type checking succeeds
- Implementation runs fine

### Why binary fails:

- `pnpm tauri build` (which calls `cargo build` on binary target)
- Feature flag for binary differs or missing feature propagation
- Module declaration is conditionally hidden
- Import resolution fails BEFORE the import's own `#[cfg]` gate takes effect

---

## Proof (Linked to A2_cfg_truth_pack.md)

1. **Module declaration is gated (A2 line 8-9):**
   ```rust
   #[cfg(feature = "audio-capture")]
   pub mod capture;
   ```

2. **Import is gated (A2 line 1432-1436):**
   ```rust
   #[cfg(feature = "audio-capture")]
   mod capture_commands {
       use crate::audio::capture::{ ... };
   }
   ```

3. **Error manifests (A1_repro.log line 749):**
   ```
   error[E0432]: unresolved import `crate::audio::capture`
   could not find `capture` in `audio`
   ```

4. **Library succeeds with feature (from previous session logs):**
   - `cargo test --lib --features "audio-capture"` → 4309 tests PASS
   - Features propagate correctly to lib target

5. **Binary fails despite features in Cargo.toml defaults:**
   - audio-capture IS in default features (A2 line 104)
   - But binary compilation doesn't see module available

---

## Why Simple Fixes Don't Work

### ❌ Fix Attempt: Add nested #[cfg] to import
```rust
#[cfg(feature = "audio-capture")]
use crate::audio::capture::{ ... };
```
**Why it fails:** Import resolution happens BEFORE outer #[cfg] is evaluated. Path doesn't exist → error.

### ❌ Fix Attempt: Use CLI feature flag
```bash
pnpm tauri build --features "audio-capture,..."
```
**Why it fails:** Binary target module path not visible during import resolution phase. Feature flag applied too late.

### ✅ Fix Solution: Make module ALWAYS available
```rust
pub mod capture;           ← NO cfg gate on declaration
```

Then INSIDE capture.rs, hide implementation:
```rust
#[cfg(feature = "audio-capture")]
pub struct/fn/impl { ... }

#[cfg(not(feature = "audio-capture"))]
pub struct/fn/impl NotImplemented { ... }
```

This way:
- Module path always exists (import resolution succeeds)
- Implementation is conditional (feature-gated)
- Import can proceed without E0432

---

## Verdict

**Cause:** Rust's import resolution validates paths BEFORE cfg gates take effect. 
Module declaration is gated → path doesn't exist when binary compiled.

**Solution:** Unconditional module declaration + internal conditionals.

**Status:** CLEAR FIX, ready for PHASE 4.

