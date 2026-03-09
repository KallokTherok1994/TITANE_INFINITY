# Phase Preparation Pack — H1 Terminal + H2 / H3 / H4

**Date:** 2026-03-09  
**Session:** phase_preparation_20260309  
**Type:** PREP_ONLY — No execution, no builds, no tests  
**Current Verdict:** BLOCKED_APPROVAL

---

## Overview: Phase Sequence

```
H1 TERMINAL  →  H2 (Build Env + P8/P9)  →  H3 (P10 Cert Freeze)  →  H4 (Release + Deploy)
```

All phases after H1 terminal gate on the previous phase's PASS verdict.

---

## H1 TERMINAL — Resume P9 + Complete P8 → Unblock P10

**Goal:** Complete the interrupted P9 (G6 run 2/3 and 3/3) and finalize P8 install verification.  
**Estimated Duration:** ~60–90 minutes in a properly provisioned build environment.  
**Risk:** P2 (build environment availability)

### H1 Prerequisites

| Requirement | Check |
|-------------|-------|
| Full Tauri system deps installed | `dpkg -l libwebkit2gtk-4.1-dev` |
| Rust toolchain available | `rustup show` |
| MAIN checked out cleanly | `git checkout MAIN && git status` |
| Source clean (no uncommitted changes) | `git status --short` |
| G6 script hardened (AH-2026-03-09-0109) | `grep strip-unneeded scripts/gates/g6-build-reproducibility.sh` |

### H1 Steps

```
H1.1  git checkout MAIN + git pull
H1.2  Verify G6 script (grep strip-unneeded)
H1.3  Run P9 build #2: cargo build --release --locked (SOURCE_DATE_EPOCH=1000000000)
H1.4  Capture sha256 of binary → $HASH_2
H1.5  Run P9 build #3: cargo build --release --locked (fresh target/ wipe)
H1.6  Capture sha256 of binary → $HASH_3
H1.7  Compare HASH_1 (from PR176 session) = HASH_2 = HASH_3
H1.8  If match: write P9 PASS artifact → deployment/latest/builds/BUILD_REPRODUCIBILITY.md
H1.9  Run P8: pnpm install + vite build + cargo build --release --locked (full install)
H1.10 Capture P8 PASS artifact → deployment/latest/builds/P8_INSTALL_VERIFICATION.md (update)
H1.11 Append AutoHeal entry AH-2026-03-09-01xx (P9 resolution)
H1.12 Run verify_instructions.sh + detect_recurrence.sh
H1.13 Create proof_packs/P9_P8_RESOLUTION_20260309/VERDICT.md
```

### H1 Success Criteria

- [ ] HASH_1 == HASH_2 == HASH_3 (reproducible build confirmed)
- [ ] P8_INSTALL_VERIFICATION.md updated to PASS
- [ ] BUILD_REPRODUCIBILITY.md created with 3× hashes
- [ ] verify_instructions.sh PASS=20 FAIL=0
- [ ] detect_recurrence.sh PASS
- [ ] proof_packs/P9_P8_RESOLUTION_20260309/VERDICT.md → PASS

### H1 Failure Actions

- If hash mismatch: investigate remaining non-determinism in binary; check for `.cargo/registry` timestamps, `__DATE__` macros, or env variables leaking. Do NOT mark P9 PASS.
- If cargo build fails: check Tauri system deps, verify MAIN is clean.
- Escalation: document in AutoHeal + BLOCKED classification.

---

## H2 — Build Environment Provision + P8/P9 Full Execution

**Goal:** Provide a reproducible CI build environment that can run P8 and P9 deterministically.  
**Estimated Duration:** 30 minutes environment setup + 50 minutes G6 runs.  
**Risk:** P2 (environment provisioning)  
**Prerequisite:** None (this IS the environment phase)

### H2 Steps

```
H2.1  Select build environment:
        Option A: GitHub Actions (rust.yml / rust-docker.yml)
        Option B: Local Ubuntu 22.04 VM with Tauri deps
        Option C: Docker container from rust-docker.yml
H2.2  Install Tauri system deps:
        sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev \
          libayatana-appindicator3-dev librsvg2-dev libssl-dev libasound2-dev
H2.3  Install Rust + cargo-tauri toolchain:
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env"
H2.4  Install pnpm + node:
        npm install -g pnpm@10.30.2
H2.5  Clone MAIN at latest HEAD
H2.6  Create dist placeholder (per CI contract):
        mkdir -p dist && echo "CI placeholder" > dist/index.html
H2.7  Run P8 full install: pnpm install + pnpm run build
H2.8  Run P9 G6: bash scripts/gates/g6-build-reproducibility.sh (3× builds)
H2.9  Capture artifacts + proceed to H3
```

### H2 Success Criteria

- [ ] All Tauri system deps installed (apt exit 0)
- [ ] `cargo build --release --locked` exits 0
- [ ] G6 script exits 0 with PASS
- [ ] P8 + P9 artifacts written

---

## H3 — P10 Certification Freeze

**Goal:** Execute the certification freeze — final gate before production.  
**Estimated Duration:** 15–30 minutes  
**Risk:** P1 (PROD gate — requires explicit operator approval)  
**Prerequisite:** H1/H2 PASS → P8 PASS + P9 PASS with artifacts

### H3 Steps

```
H3.1  Verify P8 artifact exists: deployment/latest/builds/P8_INSTALL_VERIFICATION.md
H3.2  Verify P9 artifact exists: deployment/latest/builds/BUILD_REPRODUCIBILITY.md
H3.3  Confirm 3 hashes match in BUILD_REPRODUCIBILITY.md
H3.4  Run: bash scripts/gates/g9-release-seal.sh (if exists)
H3.5  Run: bash scripts/verify_instructions.sh (must be PASS=20 FAIL=0)
H3.6  Run: bash scripts/autoheal/detect_recurrence.sh (must PASS)
H3.7  Create proof_packs/P10_CERTIFICATION_FREEZE_20260309/
      ├── VERDICT.md (PASS)
      ├── ROLLBACK.md
      ├── gate_matrix.md
      └── evidence_index.md
H3.8  Tag MAIN: git tag CERT-FREEZE-v{version}-20260309
H3.9  Push tag: git push origin CERT-FREEZE-v{version}-20260309
```

### H3 Success Criteria

- [ ] g9-release-seal.sh PASS (or equivalent certification gate PASS)
- [ ] proof_packs/P10_CERTIFICATION_FREEZE_20260309/VERDICT.md written with PASS
- [ ] Tag pushed to MAIN
- [ ] VERDICT_UNIQUE: PASS (no false green)

### H3 PROD Token Requirement

```
# Operator must provide before H3 execution:
GO_FOR_PROD_BUILD__TITANE_INFINITY
```

---

## H4 — Release Gate + Production Deploy

**Goal:** Full production deployment of TITANE∞ after certification freeze.  
**Estimated Duration:** Variable (deploy pipeline dependent)  
**Risk:** P1 (PROD — double-token gate)  
**Prerequisite:** H3 PASS + P10 tag confirmed + both tokens provided

### H4 Steps

```
H4.1  Operator provides: GO_FOR_PROD_BUILD__TITANE_INFINITY
H4.2  Operator provides: GO_FOR_PROD_DEPLOY__TITANE_INFINITY
H4.3  Run full deploy pipeline:
        pnpm run build (Vite production build)
        cargo build --release --locked (Tauri binary)
        tauri build (full package)
H4.4  Verify build artifacts:
        dist/ (web assets)
        src-tauri/target/release/ (binary)
        *.AppImage / *.deb / *.msi (platform packages)
H4.5  Run E2E smoke suite (if provisioned)
H4.6  Deploy to production environment
H4.7  Create deployment proof:
        deployment/latest/DEPLOYMENT_COMPLETE_20260309.md
H4.8  Append final CHANGELOG entry
H4.9  Push release tag: git tag v{version}-production-20260309
```

### H4 Success Criteria

- [ ] Both PROD tokens provided and verified
- [ ] `tauri build` exits 0 with binary produced
- [ ] E2E smoke PASS (if available)
- [ ] Deployment artifact documented in deployment/latest/
- [ ] Release tag pushed

### H4 Rollback Plan

```bash
# If deploy fails, immediate rollback:
git checkout {previous-tag}
# Revert to last known-good production state
# Document in AutoHeal immediately
```

---

## Phase Gate Summary

| Phase | Prerequisite | PROD Token | Duration |
|-------|-------------|------------|----------|
| H1 Terminal | Build env + MAIN | None | 60–90 min |
| H2 Build Env | None | None | 80 min |
| H3 P10 Cert | P8+P9 PASS | `GO_FOR_PROD_BUILD` | 15–30 min |
| H4 Deploy | P10 PASS + tag | Both tokens | Variable |
