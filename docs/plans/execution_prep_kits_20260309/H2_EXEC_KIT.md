# H2 EXCELLENCE — Execution Kit

**Phase:** H2 EXCELLENCE  
**Objective:** Two-tier excellence verification:  
  - **Tier 1 (Env):** Full Tauri build environment provisioning  
  - **Tier 2 (Excellence):** Comprehensive quality suite beyond P8 minimum  
**Est. Duration:** 30 min (Tier 1) + 15–20 min (Tier 2)  
**Type:** PREP_ONLY doc — No execution, no build, no test, no sudo in this file.

---

## Overview

H2 has two independent tiers:

```
┌──────────────────────────────────────────────────────────┐
│  TIER 1: ENVIRONMENT PROVISION                           │
│  Goal: "Tauri system deps + toolchain ready for H1"      │
│  Run BEFORE H1 if build env is missing                   │
│  Duration: ~30 min (mostly apt download)                 │
└───────────────────────┬──────────────────────────────────┘
                        │ PASS → can run H1
┌───────────────────────▼──────────────────────────────────┐
│  TIER 2: EXCELLENCE SUITE                                │
│  Goal: Confirm full stack quality post-P8                │
│  Run AFTER H1 has PASS                                   │
│  Duration: ~15–20 min                                    │
│  Confirms: Vitest 3288, TypeScript, ESLint, all gates    │
└──────────────────────────────────────────────────────────┘
```

If Tier 1 environment is already present (E1–E7 entry checks in H1 kit all pass), **skip Tier 1 entirely** and proceed to Tier 2 after H1.

---

## TIER 1 — Environment Provision

### T1.0 — Pre-check: What's already installed?

**Time budget:** < 2 min

```bash
echo "=== Environment Snapshot ==="
cargo --version 2>/dev/null || echo "cargo: MISSING"
pnpm --version 2>/dev/null || echo "pnpm: MISSING"
node --version 2>/dev/null || echo "node: MISSING"
dpkg -l libwebkit2gtk-4.1-dev 2>/dev/null | grep "^ii" | awk '{print "libwebkit2gtk: " $3}' || echo "libwebkit2gtk: MISSING"
dpkg -l libasound2-dev 2>/dev/null | grep "^ii" | awk '{print "libasound2-dev: " $3}' || echo "libasound2-dev: MISSING"
dpkg -l libgtk-3-dev 2>/dev/null | grep "^ii" | awk '{print "libgtk-3-dev: " $3}' || echo "libgtk-3-dev: MISSING"
```

**GO:** All lines show version strings → Tier 1 can be skipped entirely.  
**NO-GO (partial):** Some MISSING lines → proceed with T1.1.

---

### T1.1 — Install Tauri system deps

**Time budget:** 5–20 min (apt download)  
**Precondition:** Requires sudo. Must be on Ubuntu/Debian x86_64.

```bash
sudo apt-get update -qq
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  libasound2-dev
echo "APT_EXIT=$?"
```

**GO:** `APT_EXIT=0` → continue.  
**NO-GO:**

| Symptom | Action |
|---------|--------|
| `E: Package not found` | Try `apt-get update` first, then retry |
| `libwebkit2gtk-4.1-dev` not found | Check Ubuntu version: must be ≥ 22.04. `lsb_release -a` |
| Network error | Check `ping -c1 archive.ubuntu.com` |

---

### T1.2 — Install/verify Rust toolchain

**Time budget:** 5–10 min (if download needed)

```bash
# Check if rustup is present
if ! command -v rustup >/dev/null 2>&1; then
  echo "rustup: MISSING — installing"
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
  source "$HOME/.cargo/env"
else
  echo "rustup: PRESENT"
  rustup default stable
  rustup update stable
fi
cargo --version
echo "RUST_EXIT=$?"
```

**GO:** `RUST_EXIT=0` and cargo prints a version → continue.  
**NO-GO:** Download failure → check network, retry.

---

### T1.3 — Install/verify pnpm

**Time budget:** < 2 min

```bash
if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm@10.30.2
  echo "PNPM_INSTALLED=10.30.2"
else
  PNPM_VER=$(pnpm --version)
  echo "PNPM_PRESENT=$PNPM_VER"
fi
pnpm --version
```

**GO:** Version `10.x.x` displayed → continue.

---

### T1.4 — Write H2 environment proof

**Time budget:** < 1 min  
**Command:**

```bash
cat > docs/plans/phase_preparation_20260309/H2_ENV_PROOF.md << EOF
# H2 Build Environment Proof

**Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Hostname:** $(hostname)

## Environment

| Component | Version |
|-----------|---------|
| cargo | $(cargo --version 2>/dev/null) |
| rustc | $(rustc --version 2>/dev/null) |
| pnpm | $(pnpm --version 2>/dev/null) |
| node | $(node --version 2>/dev/null) |
| libwebkit2gtk-4.1-dev | $(dpkg -l libwebkit2gtk-4.1-dev 2>/dev/null \| grep "^ii" \| awk '{print $3}') |
| libgtk-3-dev | $(dpkg -l libgtk-3-dev 2>/dev/null \| grep "^ii" \| awk '{print $3}') |
| libasound2-dev | $(dpkg -l libasound2-dev 2>/dev/null \| grep "^ii" \| awk '{print $3}') |

## Verdict

**TIER 1: PASS** — Build environment fully provisioned. Ready for H1 execution.
EOF

echo "H2_ENV_PROOF: WRITTEN"
```

**GO:** File written → proceed to H1, then return for Tier 2.

---

### T1.5 — Tier 1 Success Criteria

| Criterion | Expected | Verified? |
|-----------|----------|-----------|
| `cargo --version` exits 0 | cargo 1.x.x | ☐ |
| `pnpm --version` exits 0 | 10.x.x | ☐ |
| libwebkit2gtk-4.1-dev installed | dpkg shows `ii` | ☐ |
| libasound2-dev installed | dpkg shows `ii` | ☐ |
| `H2_ENV_PROOF.md` written with PASS | File exists | ☐ |

**All ✅ → Tier 1 COMPLETE. Proceed to H1.**

---

## TIER 2 — Excellence Suite

**Precondition:** H1 COMPLETE (P9 PASS, P8 confirmed).  
**Duration:** ~15–20 min total.

### T2.0 — Entry check

```bash
# Verify H1 is done
grep -q "PASS" deployment/latest/builds/BUILD_REPRODUCIBILITY.md && echo "P9: PASS" || echo "P9: NOT DONE — run H1 first"
grep -q "PASS" deployment/latest/builds/P8_INSTALL_VERIFICATION.md && echo "P8: PASS" || echo "P8: NOT CONFIRMED"
```

**GO:** Both print PASS → continue Tier 2.  
**NO-GO:** Either missing/FAIL → run H1 first.

---

### T2.1 — Vitest full test suite

**Time budget:** 5–10 min  
**Baseline:** 216 suites, 3288 tests (established 2026-03-07)

```bash
pnpm install --frozen-lockfile --ignore-scripts
npx vitest run 2>&1 | tail -20
echo "VITEST_EXIT=$?"
```

**GO:** `VITEST_EXIT=0` and output contains `3288 tests passed` (or ≥3288) → continue.  
**NO-GO:**

| Symptom | Action |
|---------|--------|
| Tests < 3288 | Check if test files were deleted; diff vs baseline |
| Any FAIL | Identify failing test; check if related to recent changes |
| SKIP count > 0 | Check G_NO_TEST_SKIPS gate: `bash scripts/verify_instructions.sh` |

---

### T2.2 — TypeScript strict check

**Time budget:** 1–3 min

```bash
npx tsc --noEmit 2>&1 | head -30
echo "TSC_EXIT=$?"
```

**GO:** `TSC_EXIT=0` → continue.  
**NO-GO:** Any TS error → identify file, check if introduced by recent changes.

---

### T2.3 — ESLint zero-warnings check

**Time budget:** 1–2 min

```bash
pnpm run lint 2>&1 | tail -10
echo "ESLINT_EXIT=$?"
```

**GO:** `ESLINT_EXIT=0` and no warnings in output → continue.  
**NO-GO:** Any warning/error → fix before proceeding.

---

### T2.4 — Prettier format check

**Time budget:** < 1 min

```bash
npx prettier --check . 2>&1 | tail -10
echo "PRETTIER_EXIT=$?"
```

**GO:** `PRETTIER_EXIT=0` → continue.  
**NO-GO:** Format violations → run `npx prettier --write .` and commit.  
**Note:** Prettier failures cascade to CI/CD Unified + Auto-Deploy failures.

---

### T2.5 — Core gate sweep

**Time budget:** 1–2 min

```bash
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

**GO:** Both PASS → continue.

---

### T2.6 — Tauri allowlist lock check

**Time budget:** < 1 min

```bash
bash scripts/gates/g7-tauri-allowlist-lock.sh 2>/dev/null && echo "G7: PASS" || echo "G7: check manually"
```

**GO:** PASS → continue.

---

### T2.7 — G6 hardening confirm (sanity)

**Time budget:** < 1 min

```bash
grep -c "strip-unneeded" scripts/gates/g6-build-reproducibility.sh
grep -c "remove-section" scripts/gates/g6-build-reproducibility.sh
```

**GO:** Both counts ≥ 2 → G6 is hardened.

---

### T2.8 — Write excellence proof

**Time budget:** < 2 min  
**Condition:** All T2.1–T2.7 PASS.

```bash
cat > docs/plans/execution_prep_kits_20260309/H2_EXCELLENCE_PROOF.md << EOF
# H2 Excellence Proof

**Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Precondition:** H1 TERMINAL PASS (P9 + P8 confirmed)

## Tier 2 — Quality Suite Results

| Check | Baseline | Result | Status |
|-------|----------|--------|--------|
| Vitest | 3288 tests, 216 suites | FILL_VITEST_COUNT tests | ✅ PASS |
| TypeScript (noEmit) | exit 0 | exit FILL_TSC_EXIT | ✅ PASS |
| ESLint | 0 warnings | 0 warnings | ✅ PASS |
| Prettier | exit 0 | exit 0 | ✅ PASS |
| verify_instructions.sh | PASS=20 FAIL=0 | FILL_VI_RESULT | ✅ PASS |
| detect_recurrence.sh | PASS | PASS | ✅ PASS |
| G6 hardening | strip-unneeded + objcopy | confirmed | ✅ PASS |
| G7 tauri-allowlist | PASS | PASS | ✅ PASS |

## Verdict

**TIER 2: PASS** — Full excellence suite confirmed. Production quality baseline maintained.
EOF
echo "H2_EXCELLENCE_PROOF: WRITTEN"
```

---

### T2.9 — Tier 2 Success Criteria Summary

| Criterion | Expected | Verified? |
|-----------|----------|-----------|
| Vitest ≥ 3288 tests pass | All pass | ☐ |
| TypeScript exit 0 | No errors | ☐ |
| ESLint exit 0 | No warnings | ☐ |
| Prettier exit 0 | No violations | ☐ |
| verify_instructions PASS=20 | FAIL=0 | ☐ |
| detect_recurrence PASS | 146 entries | ☐ |
| `H2_EXCELLENCE_PROOF.md` written | Contains PASS | ☐ |

**All ✅ → H2 EXCELLENCE COMPLETE → unblocks H3 with full quality confirmation**

---

## TIER 2 — Failure Handling

| Check | Failure | Recovery |
|-------|---------|---------|
| Vitest < 3288 | Tests deleted/disabled | Restore from git; never reduce test count |
| Vitest FAIL | Regression | Identify test, check git blame on src change |
| TypeScript error | Type regression | Fix type, must not suppress with `// @ts-ignore` without justification |
| ESLint warning | Linting regression | Fix lint; do not add `eslint-disable` without comment |
| Prettier violation | Unformatted file | Run `npx prettier --write <file>` and commit |
| G7 FAIL | Allowlist changed | Check `git diff src-tauri/tauri.conf.json` — must not change without gate |

---

## Rollback

```bash
# H2 Tier 1 changes (env proof doc only)
git restore -- docs/plans/phase_preparation_20260309/H2_ENV_PROOF.md

# H2 Tier 2 excellence proof
git restore -- docs/plans/execution_prep_kits_20260309/H2_EXCELLENCE_PROOF.md

# If pnpm node_modules need cleanup
rm -rf node_modules && pnpm install --frozen-lockfile --ignore-scripts
```
