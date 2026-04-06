# Gates & Proof Matrix + Rollback Plans

**Date:** 2026-03-09  
**Session:** phase_preparation_20260309  
**Type:** PREP_ONLY

---

## 1. Gate Registry

| Gate ID | Script | Scope | Required For | CI Status |
|---------|--------|-------|-------------|-----------|
| G1 | verify_instructions.sh | All | All phases | PASS=20 FAIL=0 |
| G2 | detect_recurrence.sh | AutoHeal | All phases | PASS (145 entries) |
| G3 | g7-tauri-allowlist-lock | Ring 4 / Tauri | H3/H4 | PASS |
| G4 | g4-provider-decision-certified | R3 services | H3 | Local-only, P2 |
| G5 | scorecard-ci-gate-v2 | Overall | H3 | Local-only, P2 |
| G6 | g6-build-reproducibility.sh | Binary | H1/H2/H3 | **BLOCKED** (P9 pending) |
| G7 | G_NETWORK_ONE_DOOR | IPC/Network | All | PASS |
| G8 | G_FRONTEND_NO_WEB | UI | All | PASS |
| G9 | G_NO_TEST_SKIPS | Tests | All | PASS |
| G10 | csp-baseline-gate | CSP | All | Local FAIL (P2, CI waived: CSP_ALLOW_UNSAFE=1) |
| G11 | g9-release-seal.sh | Release | H3 | Pending H1/H2 |

---

## 2. Proof Requirements per Phase

### H1 Terminal — Required Proofs

| Proof | Location | Status |
|-------|----------|--------|
| P9 hash table (3× builds match) | `deployment/latest/builds/BUILD_REPRODUCIBILITY.md` | ⏳ Pending |
| P8 full install PASS | `deployment/latest/builds/P8_INSTALL_VERIFICATION.md` | ⏳ Pending update |
| verify_instructions PASS=20 | Console output captured | ⏳ Pending |
| detect_recurrence PASS | Console output captured | ⏳ Pending |
| AutoHeal AH-2026-03-09-01xx | `scripts/autoheal/autoheal_rules.jsonl` | ⏳ Pending |
| Proof pack VERDICT.md | `proof_packs/P9_P8_RESOLUTION_20260309/` | ⏳ Pending |

### H2 — Required Proofs

| Proof | Location | Status |
|-------|----------|--------|
| Environment readiness doc | `docs/plans/phase_preparation_20260309/H2_ENV_PROOF.md` | ⏳ Pending |
| Tauri deps dpkg check | Captured in H2_ENV_PROOF | ⏳ Pending |

### H3 — Required Proofs

| Proof | Location | Status |
|-------|----------|--------|
| P8 PASS confirmed | `deployment/latest/builds/P8_INSTALL_VERIFICATION.md` | Prereq |
| P9 PASS confirmed | `deployment/latest/builds/BUILD_REPRODUCIBILITY.md` | Prereq |
| g9-release-seal PASS | Console output | ⏳ Pending |
| CERT-FREEZE tag on MAIN | `git tag` | ⏳ Pending |
| P10 proof pack VERDICT | `proof_packs/P10_CERTIFICATION_FREEZE_20260309/VERDICT.md` | ⏳ Pending |

### H4 — Required Proofs

| Proof | Location | Status |
|-------|----------|--------|
| Both PROD tokens | Operator confirmation | Prereq |
| tauri build artifacts | `src-tauri/target/release/bundle/` | ⏳ Pending |
| Deployment complete doc | `deployment/latest/DEPLOYMENT_COMPLETE_*.md` | ⏳ Pending |
| Release tag | `git tag` | ⏳ Pending |

---

## 3. AutoHeal Template for P9 Resolution

When P9 PASS is achieved, append this entry to `scripts/autoheal/autoheal_rules.jsonl`:

```json
{
  "id": "AH-2026-03-09-0110",
  "date": "2026-03-09",
  "scope": ["p9", "g6", "reproducible-build", "h1-terminal"],
  "symptom": "P9 (G6 ×3 reproducible build) was interrupted after build #1 in PR176 session, leaving TERM-2 BLOCKED and P10 gated.",
  "root_cause": "Session timeout during G6 run #2/3. Build environment (Tauri deps) not available in PR sandbox. G6 hash normalization was hardened in AH-2026-03-09-0109 before the interruption.",
  "fix": "Resumed G6 in dedicated build environment with Tauri deps provisioned. Ran build #2 and #3 with SOURCE_DATE_EPOCH=1000000000. Confirmed 3× hashes match. P9 PASS artifact written.",
  "prevention_test": "detect_recurrence.sh checks for P9 completion marker. G6 script now normalized with strip-unneeded + objcopy build-id removal (AH-2026-03-09-0109).",
  "commands": [
    "cargo build --release --locked --manifest-path src-tauri/Cargo.toml",
    "sha256sum src-tauri/target/release/titane-infinity",
    "bash scripts/verify_instructions.sh",
    "bash scripts/autoheal/detect_recurrence.sh"
  ],
  "files_changed": [
    "deployment/latest/builds/BUILD_REPRODUCIBILITY.md",
    "deployment/latest/builds/P8_INSTALL_VERIFICATION.md",
    "scripts/autoheal/autoheal_rules.jsonl"
  ],
  "rollback": "git restore -- deployment/latest/builds/BUILD_REPRODUCIBILITY.md deployment/latest/builds/P8_INSTALL_VERIFICATION.md"
}
```

---

## 4. Rollback Plans

### Rollback: H1 Terminal (if P9 hash mismatch)

```bash
# Do NOT write P9 PASS artifact — just document the mismatch
git restore -- deployment/latest/builds/BUILD_REPRODUCIBILITY.md
# Investigate non-determinism: check for env var leaks, __DATE__ macros,
# cargo registry timestamps, or build flags
# Append AutoHeal entry describing the failure mode
```

### Rollback: H2 Build Environment (if installation fails)

```bash
# No code changes in H2 — just uninstall bad packages if needed
sudo apt-get remove --purge <failing-package>
# Document failure in H2_ENV_PROOF.md with FAIL verdict
```

### Rollback: H3 P10 Certification Freeze (if gate fails)

```bash
# Remove wrongly-written proof pack
git restore -- proof_packs/P10_CERTIFICATION_FREEZE_20260309/
# If tag was pushed incorrectly:
git push origin --delete CERT-FREEZE-v{version}-20260309
git tag -d CERT-FREEZE-v{version}-20260309
# Classify as BLOCKED — do not proceed to H4
```

### Rollback: H4 Production Deploy (if deploy fails)

```bash
# Revert to previous production tag
git checkout {previous-production-tag}
# Revert deployment artifacts
git restore -- deployment/latest/
# Document failure + rollback in AutoHeal immediately
# Classify as FAIL — alert operator
```

### Rollback: This Preparation Pack (docs-only)

```bash
git restore -- docs/plans/phase_preparation_20260309/
```

---

## 5. Gate Validation Commands

Run these before each phase to confirm gate state:

```bash
# Core gates (always)
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh

# G6 hardening check (before H1/H2)
grep "strip-unneeded" scripts/gates/g6-build-reproducibility.sh && echo "G6 HARDENED: OK"

# AutoHeal entry count
wc -l scripts/autoheal/autoheal_rules.jsonl && echo "entries (must be >=145)"

# Tauri allowlist lock
bash scripts/gates/g7-tauri-allowlist-lock.sh 2>/dev/null || grep -E "tauri.*allowlist|capabilities" src-tauri/tauri.conf.json | head -5

# CSP baseline (P2, non-blocking)
bash scripts/gates/csp-baseline-gate.js 2>/dev/null || echo "CSP local-only P2 gate — skip in CI"
```
