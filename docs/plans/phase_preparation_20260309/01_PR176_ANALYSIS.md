# PR176 Analysis — Diff / Commits / Files / Intent

**Date:** 2026-03-09  
**PR:** #176 — `fix(g6): harden binary hash normalization + INT-2/INT-3/P8 integration closure`  
**State:** MERGED into MAIN (2026-03-09T11:42:12Z)  
**Merged by:** KallokTherok1994

---

## 1. PR Intent

**Goal:** Complete the governed integration chain for TITANE∞:
- Apply 3 integration commits (R3/docs only, no ring/IPC/allowlist impact)
- Run INT-2 kernel certification
- Run INT-3 mainline revalidation
- Verify P8 install (TERM-1)
- **G6 fix:** harden binary hash normalization to remove ELF build-ID variance

**Outcome of PR176:** `BLOCKED_APPROVAL`  
P9 (G6 ×3 reproducible build, ~50min) was interrupted mid-run. P10 certification freeze remains gated on P9.

---

## 2. Key Technical Change — G6 Hash Normalization

### Problem

`normalize_binary_for_hash` in `scripts/gates/g6-build-reproducibility.sh` only stripped debug info, leaving ELF build-ID sections (`.note.gnu.build-id`, `.note.ABI-tag`) which vary per linker invocation regardless of `SOURCE_DATE_EPOCH`, causing hash divergence.

### Fix Applied

```bash
# Before
llvm-strip --strip-debug "$out_bin"

# After — removes variable ELF metadata sections
llvm-strip --strip-debug --strip-unneeded "$out_bin"
objcopy --remove-section=.note.gnu.build-id "$out_bin" || true
objcopy --remove-section=.note.ABI-tag "$out_bin" || true
# + llvm-objcopy fallback
```

**AutoHeal:** AH-2026-03-09-0109

---

## 3. Commits in PR176 (4 commits)

| # | Scope | Description |
|---|-------|-------------|
| 1 | INT-A | G6 hash normalization hardening |
| 2 | INT-B | Binary probe cleanup, state confirmed clean |
| 3 | INT-C | docs/_evidence/integration_closure/ artifacts created |
| 4 | INT-D | .gitignore + autoheal AH-2026-03-09-0109 |

---

## 4. Changed Files Summary

| Category | Files Changed | Key Files |
|----------|---------------|-----------|
| Gate scripts | 1 | `scripts/gates/g6-build-reproducibility.sh` |
| Gitignore | 1 | `.gitignore` (+target-p8, +target-p9 exclusions) |
| Evidence docs | 2 | `docs/_evidence/integration_closure/INT-0_INT-1_proof.md`, `INT-2_kernel_cert.md` |
| Proof pack | 2+ | `proof_packs/integration_closure_kernel_cert_20260309/` |
| P8 verification | 1 | `deployment/latest/builds/P8_INSTALL_VERIFICATION.md` |
| AutoHeal | 1 | `scripts/autoheal/autoheal_rules.jsonl` |
| **Total** | **~1876** | (majority: generated/evidence files) |

> Note: The large file count (1876) is primarily due to generated evidence and deployment docs — not source code changes.

---

## 5. Integration Chain Status Post-PR176

| Phase | Status | Artifact |
|-------|--------|----------|
| INT-0 Bootstrap | ✅ PASS | Evidence written |
| INT-1 Commit Inventory | ✅ PASS | 3 commits scope-qualified |
| INT-2 Kernel Certification | ✅ PASS | All gates PASS |
| INT-3 Mainline Revalidation | ✅ PASS (post-merge) | PR merged to MAIN |
| TERM-1 P8 Install | ⚠️ BLOCKED | Tauri build env required |
| TERM-2 P9 Reproducible Build | ⚠️ BLOCKED | G6 ×3 runs required |
| TERM-3 P10 Certification Freeze | 🔴 BLOCKED_APPROVAL | Pending P8+P9 |

---

## 6. What Remains After PR176

### Immediate Next Actions (H1 terminal)

1. **Resume P9**: Run G6 build #2 and #3 (two more `cargo build --release --locked` runs with `SOURCE_DATE_EPOCH=1000000000`)
2. **Complete P8**: Full install verification in Tauri build environment
3. **Trigger P10**: Once P8+P9 artifacts confirmed PASS

### Prerequisite Environment for H1 Terminal

```bash
# Required system packages
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  libasound2-dev

# Required toolchain
rustup target add x86_64-unknown-linux-gnu
```

---

## Rollback

```bash
# This file is read-only analysis — no rollback required
# To restore any accidentally modified PR176 artifacts:
git restore -- scripts/gates/g6-build-reproducibility.sh
git restore -- scripts/autoheal/autoheal_rules.jsonl
git restore -- docs/_evidence/integration_closure/
```
