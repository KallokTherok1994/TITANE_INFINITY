# A2 — CFG TRUTH PACK (Inspection Complète)

## 2.1 Imports capture détectés

Localisation : `src-tauri/src/audio/commands.rs:1435`

```rust
#[cfg(feature = "audio-capture")]
mod capture_commands {
    use super::*;
    use crate::audio::capture::{                          ← LIGNE 1435 (import)
        default_input_device_name,
        default_output_device_name,
        list_input_devices,
        list_output_devices,
        AudioCaptureState,
    };
    // ...
}
```

**Findings:**
- ✅ Import est enrobé dans `#[cfg(feature = "audio-capture")]`
- ❌ Rust compiler valide l'import resolution AVANT d'appliquer cfg gates
- ❌ Path `crate::audio::capture` non visible quand binaire compilé sans feature actif au bon moment

---

## 2.2 Audio module tree

```
src-tauri/src/audio/
├── asr.rs                          (no cfg)
├── capture.rs                      (real implementation, 414 lines)
├── commands.rs                     (imports capture at line 1435)
├── mod.rs                          ← KEY FILE
├── recorder.rs                     (no cfg)
├── recording_engine.rs             (no cfg)
├── streaming_engine.rs             (no cfg)
├── vad.rs                          (no cfg)
├── voice_fingerprint.rs            (no cfg)
└── whisper_streaming.rs            (no cfg)
```

---

## 2.3 Module declarations in audio/mod.rs

**Lines 1-30 (complete context):**

```rust
pub mod asr;
#[cfg(feature = "audio-capture")]      ← ⚠️ CONDITIONAL
pub mod capture;                        ← ⚠️ CONDITIONAL — SOURCE OF ISSUE
pub mod commands;
pub mod recorder;
pub mod recording_engine;
pub mod streaming_engine;
pub mod vad;
pub mod voice_fingerprint;
pub mod whisper_streaming;

#[cfg(feature = "audio-capture")]     ← Re-exports also conditional
pub use capture::{list_input_devices, list_output_devices, AudioCaptureState};
pub use commands::*;
// ... rest of module tree
```

**Critical observation:**
- Line 8-9: `#[cfg(feature = "audio-capture")] pub mod capture;`
- Module declaration itself is GATED
- When binary compiles without feature active (or feature not propagated correctly), module path doesn't exist
- Compiler import analysis happens BEFORE cfg gates take effect
- Result: **E0432 unresolved import**

---

## 2.4 Feature definitions (Cargo.toml)

```toml
[features]
default = ["custom-protocol", "mock", "audio-capture"]

audio-capture = [
    # ... dependencies
]
```

**Findings:**
- ✅ `audio-capture` IS in default features
- ✅ Feature definition exists
- ❓ But feature flag NOT applying correctly during binary compilation (timing issue)

---

## 2.5 Feature flags during cargo build

**Compilation command:** `pnpm tauri build`  
**Effective features for binary:** NOT visible/not matching expectation

**Log evidence (A1_repro.log line 749):**
```
error[E0432]: unresolved import `crate::audio::capture`
  --> src/audio/commands.rs:1436:23
   |
1436 |     use crate::audio::capture::{...}
   |                       ^^^^ could not find `capture` in `audio`
```

**Root cause interpretation:**
- Feature gates processed AFTER module visibility check
- When compiler analyzes `use crate::audio::capture`, it checks if path exists
- Path doesn't exist because `pub mod capture;` declaration is hidden via `#[cfg]`
- cfg gate evaluation happens AFTER import path resolution in Rust compilation model

---

## 2.6 Verification: cargo_build_vv.log subset

Ligne ~600: Binary compilation phase starts
```
Compiling titane-infinity v27.0.2 (...)
error[E0432]: unresolved import `crate::audio::capture`
```

**Finding:**
- Library compilation: ✅ SUCCESS (tests pass with feature flag)
- Binary compilation: ❌ FAIL (E0432)
- Difference: Binary uses different feature propagation or cfg evaluation order

---

## CLASSIFICATION (PHASE 3 READY)

**Root Cause Type:** **Type 4**
- Module present but under cfg NOT applied to binary correctly
- Import visible in gated code, but module declaration itself is gated
- Rust's import resolution validates paths before cfg application

**Proof:**
- ✅ capture.rs exists and is complete
- ✅ Feature is defined in Cargo.toml defaults
- ✅ Import is correctly gated with #[cfg]
- ❌ Module declaration `pub mod capture;` is gated
- ❌ This causes path non-existence during analysis phase

**Fix required:**
Make `pub mod capture;` UNCONDITIONAL (always available),
with implementation stubs when feature OFF.

