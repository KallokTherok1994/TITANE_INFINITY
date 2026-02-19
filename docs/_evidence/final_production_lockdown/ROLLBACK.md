# ROLLBACK PROCEDURE — E0432 Fix

**Campaign:** vΩ.FINAL Production Lockdown  
**Date:** 2026-02-19  
**Changes:** 7 files modified (E0432 audio::capture fix + warnings cleanup)

---

## ROLLBACK DECISION CRITERIA

Revert changes if:

1. ❌ E0432 fix causes regressions in other modules
2. ❌ Library tests fail (cargo test --lib)
3. ❌ Feature behavior broken (audio-capture stubs not working)
4. ❌ Binary size increases unexpectedly when feature OFF
5. ❌ Conflicts with upcoming merges

**Current status:** ✅ **NO REVERT NEEDED** (fix successful)

---

## QUICK ROLLBACK (Single Command)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Restore all modified files
git restore \
  package.json \
  pnpm-lock.yaml \
  src-tauri/Cargo.toml \
  src-tauri/src/lib.rs \
  src-tauri/src/audio/mod.rs \
  src-tauri/src/audio/capture.rs \
  src-tauri/src/perf_metrics_capture.rs \
  src-tauri/src/perf_bench.rs

# Reinstall original dependencies
pnpm install --frozen-lockfile

# Verify restoration
git status
git diff
```

**Expected result:**
```
On branch main
nothing to commit, working tree clean
```

---

## FILE-BY-FILE ROLLBACK

If selective restoration needed:

### 1. package.json (Tauri API version)

```bash
git restore package.json
pnpm install --frozen-lockfile
```

**Effect:** Reverts @tauri-apps/api from 2.10.1 → 2.9.1 (version mismatch warning returns)

---

### 2. src-tauri/Cargo.toml (Feature defaults)

```bash
git restore src-tauri/Cargo.toml
```

**Effect:** No change (defaults unchanged in fix)

**Note:** If Cargo.toml was modified during experimentation, this restores original defaults:
```toml
default = ["custom-protocol", "mock", "audio-capture"]
```

---

### 3. src-tauri/src/lib.rs (Audio module gate)

```bash
git restore src-tauri/src/lib.rs
```

**Effect:** Re-gates audio module behind `#[cfg(all(not(feature = "mock"), feature = "full"))]`

**WARNING:** This will **re-introduce E0432 error** in binary builds.

**Original state:**
```rust
#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod audio;
```

**Current state (FIXED):**
```rust
// Audio module available in both mock and full modes (capture has internal stubs)
pub mod audio;
```

---

### 4. src-tauri/src/audio/mod.rs (Capture submodule gate)

```bash
git restore src-tauri/src/audio/mod.rs
```

**Effect:** Re-gates capture module behind `#[cfg(feature = "audio-capture")]`

**WARNING:** This will **re-introduce E0432 error** in binary builds.

**Original state:**
```rust
#[cfg(feature = "audio-capture")]
pub mod capture;
```

**Current state (FIXED):**
```rust
pub mod capture;  // Module always available; contents gated below
```

---

### 5. src-tauri/src/audio/capture.rs (Dual-mode implementation)

```bash
git restore src-tauri/src/audio/capture.rs
```

**Effect:** Reverts to original 414-line implementation (no stubs)

**WARNING:** Without unconditional module declarations (lib.rs + mod.rs), this alone doesn't help.

**Original state:** Full cpal implementation, no stubs (module gated at parent level)  
**Current state (FIXED):** Dual-mode (stubs + real impl with #[cfg] guards)

---

### 6. src-tauri/src/perf_metrics_capture.rs (Warnings cleanup)

```bash
git restore src-tauri/src/perf_metrics_capture.rs
```

**Effect:** Re-introduces 2 warnings (unused Duration + HashMap imports)

**Side effects:** None (cosmetic change only)

---

### 7. src-tauri/src/perf_bench.rs (Warnings cleanup)

```bash
git restore src-tauri/src/perf_bench.rs
```

**Effect:** Re-introduces 1 warning (unnecessary mut on bench variable)

**Side effects:** None (cosmetic change only)

---

## VERIFICATION AFTER ROLLBACK

### 1. Confirm E0432 Returns

```bash
cargo check --bin titane-infinity 2>&1 | grep "E0432.*audio::capture"
```

**Expected output:**
```
error[E0432]: unresolved import `crate::audio::capture`
  --> src/audio/commands.rs:1436:23
```

✅ If output matches → Rollback successful (original state restored)

---

### 2. Library Tests Still Pass

```bash
cargo test --lib --features "audio-capture"
```

**Expected:** ✅ All tests pass (rollback doesn't break test mode)

---

### 3. No Uncommitted Changes

```bash
git status
```

**Expected:**
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

## ALTERNATIVE: CHERRY-PICK WARNINGS FIX ONLY

If you want **warnings cleanup** but NOT E0432 fix:

```bash
# Restore all
git restore .

# Re-apply only warnings fixes manually
# perf_metrics_capture.rs
sed -i 's/use std::time::{Duration, Instant};/use std::time::Instant;/' \
  src-tauri/src/perf_metrics_capture.rs
sed -i '/use std::collections::HashMap;/d' \
  src-tauri/src/perf_metrics_capture.rs

# perf_bench.rs
sed -i 's/let mut bench = PerfBench::new();/let bench = PerfBench::new();/' \
  src-tauri/src/perf_bench.rs
```

**Result:** Warnings fixed, E0432 still present

---

## ROLLBACK TESTING CHECKLIST

After rollback, verify:

- [ ] `git status` shows clean working tree
- [ ] `cargo check --bin titane-infinity` reproduces E0432 error
- [ ] `cargo test --lib` still passes (4309 tests)
- [ ] `pnpm install` completes without errors
- [ ] No unexpected file changes (`git diff` empty)

---

## COMMIT HISTORY CLEANUP (if changes were committed)

If fix was committed but needs removal:

### Option A: Soft Reset (Keep Changes as Uncommitted)

```bash
git reset --soft HEAD~1
```

**Effect:** Removes commit, keeps file changes in staging area

---

### Option B: Hard Reset (Discard Changes)

```bash
git reset --hard HEAD~1
```

**Effect:** Removes commit AND discards all changes

**WARNING:** This is **destructive** — cannot undo

---

### Option C: Revert Commit (Create Reverse Commit)

```bash
git revert HEAD
```

**Effect:** Creates new commit that undoes previous changes

**Advantage:** Preserves history (safer for shared branches)

---

## EMERGENCY ROLLBACK (Build Broken)

If production build broken after merge:

```bash
# Find last working commit
git log --oneline -10

# Hard reset to last known good state
git reset --hard abb1fedd  # (OPTION B++ baseline)

# Force push (USE WITH CAUTION on shared branches)
git push --force-with-lease origin main
```

**WARNING:** Only use on personal branches or with team coordination

---

## ROLLBACK IMPACT ASSESSMENT

| File | Rollback Impact | Risk Level |
|------|----------------|------------|
| package.json | Version mismatch warning returns | LOW |
| Cargo.toml | None (unchanged in fix) | NONE |
| lib.rs | E0432 returns | HIGH (blocker returns) |
| audio/mod.rs | E0432 returns | HIGH (blocker returns) |
| audio/capture.rs | E0432 returns | HIGH (blocker returns) |
| perf_metrics_capture.rs | Warnings return | LOW (cosmetic) |
| perf_bench.rs | Warning returns | LOW (cosmetic) |

**Overall rollback risk:** **LOW** (changes well-isolated)  
**Revert time:** **~2 minutes** (single git restore command)

---

## POST-ROLLBACK ACTIONS

After rollback:

1. Document revert reason in `docs/_evidence/final_production_lockdown/ROLLBACK_EXECUTED.md`
2. Create GitHub issue explaining why fix was reverted
3. Plan alternative approach to E0432 resolution
4. Update FINAL_VERDICT.md with rollback justification

---

## PREVENTION: Avoiding Need for Rollback

**Before committing:**
- ✅ Run `cargo test --lib` (validate library mode)
- ✅ Run `cargo check --bin` (validate binary mode)
- ✅ Check `grep "E0432.*audio::capture"` (confirm error gone)
- ✅ Review diff (`git diff --cached`)
- ✅ Test build in CI pipeline (if available)

**Current status:** All checks passed ✅ — rollback unlikely needed

---

## CONTACT

If rollback assistance needed:
- Check evidence pack: `docs/_evidence/final_production_lockdown/`
- Review FINAL_VERDICT.md for decision criteria
- Compare against A5_fix_diff.patch for exact changes

---

**Status:** Rollback procedure documented  
**Rollback necessity:** ❌ NOT NEEDED (fix successful)  
**Rollback complexity:** LOW (single command)  
**Rollback time:** ~2 minutes
