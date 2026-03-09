# Verdict Matrix — Go/No-Go per Phase and Step

**Date:** 2026-03-09  
**Type:** PREP_ONLY — Binary pass/fail decision table.  
**Usage:** For each step, check the expected exit code and output. If FAIL → follow the "Action" column exactly. Never skip a FAIL and proceed.

---

## 1. H2 Tier 1 — Environment Provision

| Step | Command | Expected Exit | Expected Output (key string) | PASS? | FAIL Action |
|------|---------|--------------|------------------------------|-------|-------------|
| T1.0 check | `cargo --version` | 0 | `cargo 1.x.x` | ☐ | Run T1.2 |
| T1.0 check | `pnpm --version` | 0 | `10.x.x` | ☐ | Run T1.3 |
| T1.0 check | `dpkg -l libwebkit2gtk-4.1-dev` | 0 | `ii` in first column | ☐ | Run T1.1 |
| T1.0 check | `dpkg -l libasound2-dev` | 0 | `ii` in first column | ☐ | Run T1.1 |
| T1.1 apt-get | `sudo apt-get install -y libwebkit2gtk-4.1-dev ...` | 0 | no `E:` errors | ☐ | `apt-get update` then retry; check Ubuntu version |
| T1.2 rustup | `cargo --version` | 0 | `cargo 1.x.x` | ☐ | Re-run rustup install; `source ~/.cargo/env` |
| T1.3 pnpm | `pnpm --version` | 0 | `10.x.x` | ☐ | `npm install -g pnpm@10.30.2` |
| T1.4 proof | `head -1 docs/plans/phase_preparation_20260309/H2_ENV_PROOF.md` | 0 | `# H2 Build Environment Proof` | ☐ | Re-run T1.4 write command |

**H2 TIER 1 GO CONDITION:** All rows ✅ → Environment provisioned, proceed to H1.  
**H2 TIER 1 NO-GO CONDITION:** Any ❌ → Fix that step before proceeding.

---

## 2. H1 Terminal — P9 + P8

| Step | Command | Expected Exit | Expected Output (key string) | PASS? | FAIL Action |
|------|---------|--------------|------------------------------|-------|-------------|
| Pre-flight E1 | `cargo --version` | 0 | `cargo 1.x.x` | ☐ | Run H2 Tier 1 first |
| Pre-flight E3 | `dpkg -l libwebkit2gtk-4.1-dev \| grep -c "^ii"` | 0 | `1` | ☐ | Run H2 Tier 1 first |
| Pre-flight R1 | `git branch --show-current` | 0 | `MAIN` | ☐ | `git checkout MAIN && git pull` |
| Pre-flight R2 | `git status --short` | 0 | (empty) | ☐ | `git stash` or investigate uncommitted changes |
| Pre-flight R4 | `grep -c "strip-unneeded" scripts/gates/g6-build-reproducibility.sh` | 0 | `2` or more | ☐ | G6 not hardened — investigate git state |
| Pre-flight R8 | `bash scripts/verify_instructions.sh \| tail -1` | 0 | `SUMMARY: PASS=20 FAIL=0` | ☐ | Fix failing gate before proceeding |
| Step 0 | `git rev-parse --short HEAD` | 0 | 7-char hex | ☐ | Check git installation |
| Step 1 dist | `cat dist/index.html` | 0 | `CI placeholder` | ☐ | Re-run `mkdir -p dist && echo CI placeholder > dist/index.html` |
| Step 2 build2 | `cargo build --release --locked --manifest-path src-tauri/Cargo.toml` | 0 | Compiling/Finished | ☐ | See H1 kit failure table |
| Step 3 hash2 | `echo "$HASH_2_NORM"` | 0 | 64-char hex string | ☐ | Binary not produced — check Step 2 exit |
| Step 3 match | `[ "$HASH_2_NORM" = "11e30ec1..." ]` | 0 | `P9_BUILD2_MATCH: PASS` | ☐ | **STOP** — do not run Step 4; investigate hash divergence |
| Step 4 build3 | `cargo build --release --locked --manifest-path src-tauri/Cargo.toml` | 0 | Finished | ☐ | Same as Step 2 |
| Step 5 hash3 | `echo "$HASH_3_NORM"` | 0 | 64-char hex string | ☐ | Binary not produced |
| Step 5 match | `[ "$HASH_3_NORM" = "$HASH_2_NORM" ]` | 0 | `P9_FINAL: PASS` | ☐ | **STOP** — do not write artifact; investigate |
| Step 6 artifact | `grep "PASS" deployment/latest/builds/BUILD_REPRODUCIBILITY.md` | 0 | `P9: PASS` | ☐ | Artifact write failed; check disk space |
| Step 7 P8 | `grep "PASS" deployment/latest/builds/P8_INSTALL_VERIFICATION.md` | 0 | `PASS` | ☐ | P8 artifact missing — see P8 command pack |
| Step 8 autoheal | `wc -l < scripts/autoheal/autoheal_rules.jsonl` | 0 | `146` | ☐ | Append failed — check JSON syntax |
| Step 9a vi | `bash scripts/verify_instructions.sh \| tail -1` | 0 | `PASS=20 FAIL=0` | ☐ | Fix gate before proceeding |
| Step 9b dr | `bash scripts/autoheal/detect_recurrence.sh \| tail -1` | 0 | `PASS` | ☐ | Check autoheal entry format |
| Step 10 pack | `ls proof_packs/P9_P8_RESOLUTION_20260309/VERDICT.md` | 0 | (file exists) | ☐ | Create directory and write from skeleton |

**H1 GO CONDITION:** All rows ✅ and `P9_FINAL: PASS` → H1 COMPLETE.  
**H1 CRITICAL STOP CONDITIONS:**
- `P9_BUILD2_MATCH: FAIL` → **STOP HERE**. Do not run build #3. Classify FAIL. Append AutoHeal FAIL entry.
- `P9_FINAL: FAIL` → **STOP HERE**. Do not write PASS artifact. Classify FAIL.
- Any pre-flight check fails → **STOP**. Fix environment first.

---

## 3. H2 Tier 2 — Excellence Suite

| Step | Command | Expected Exit | Expected Output | PASS? | FAIL Action |
|------|---------|--------------|-----------------|-------|-------------|
| T2.0 P9 check | `grep -q "PASS" deployment/latest/builds/BUILD_REPRODUCIBILITY.md` | 0 | (exit 0) | ☐ | Run H1 first |
| T2.0 P8 check | `grep -q "PASS" deployment/latest/builds/P8_INSTALL_VERIFICATION.md` | 0 | (exit 0) | ☐ | Run H1 first |
| T2.1 vitest | `npx vitest run \| tail -5` | 0 | ≥ 3288 tests passed | ☐ | Identify failing tests; do not skip |
| T2.2 tsc | `npx tsc --noEmit` | 0 | (no output = OK) | ☐ | Fix TypeScript errors |
| T2.3 eslint | `pnpm run lint` | 0 | (no warnings) | ☐ | Fix lint warnings |
| T2.4 prettier | `npx prettier --check .` | 0 | (no violations) | ☐ | `npx prettier --write .` then commit |
| T2.5 vi | `bash scripts/verify_instructions.sh \| tail -1` | 0 | `PASS=20 FAIL=0` | ☐ | Fix gate |
| T2.5 dr | `bash scripts/autoheal/detect_recurrence.sh \| tail -1` | 0 | `PASS` | ☐ | Fix autoheal entry |
| T2.6 G7 | `bash scripts/gates/g7-tauri-allowlist-lock.sh` | 0 | PASS or no output | ☐ | Check if tauri.conf.json changed |
| T2.8 proof | `head -1 docs/plans/execution_prep_kits_20260309/H2_EXCELLENCE_PROOF.md` | 0 | `# H2 Excellence Proof` | ☐ | Re-run T2.8 write command |

**H2 TIER 2 GO CONDITION:** All rows ✅ → Full excellence confirmed.  
**H2 TIER 2 NO-GO CONDITION:** Vitest FAIL, TypeScript error, or ESLint warning → **STOP**, fix, re-run entire tier.

---

## 4. H3 — P10 Certification Freeze

| Step | Gate/Check | Expected | PASS? | FAIL Action |
|------|-----------|----------|-------|-------------|
| Pre | P9 artifact exists | `deployment/latest/builds/BUILD_REPRODUCIBILITY.md` has PASS | ☐ | Run H1 first |
| Pre | P8 artifact exists | `deployment/latest/builds/P8_INSTALL_VERIFICATION.md` has PASS | ☐ | Run H1 first |
| Pre | PROD token provided | `GO_FOR_PROD_BUILD__TITANE_INFINITY` confirmed | ☐ | Wait for operator |
| Pre | vi PASS | PASS=20 FAIL=0 | ☐ | Fix gate |
| Pre | detect_recurrence PASS | PASS | ☐ | Fix autoheal |
| Exec | g9-release-seal.sh | exit 0 or manual seal | ☐ | Manual seal procedure; document SKIPPED |
| Exec | CERT-FREEZE tag push | exit 0 from `git push` | ☐ | Check git permissions |
| Exec | AutoHeal AH-0111 | 147 entries | ☐ | Check JSON syntax |
| Post | VERDICT.md written | proof_packs/P10_.../VERDICT.md exists | ☐ | Write from skeleton |

**H3 HARD STOP CONDITIONS:**
- Missing P9 or P8 artifact → BLOCKED
- No PROD token → BLOCKED_APPROVAL
- g9-release-seal.sh FAIL → Investigate; do not tag MAIN until resolved

---

## 5. H4 — Release + Deploy

| Step | Gate/Check | Expected | PASS? | FAIL Action |
|------|-----------|----------|-------|-------------|
| Pre | CERT-FREEZE tag on MAIN | `git tag \| grep CERT-FREEZE` → 1 result | ☐ | Run H3 first |
| Pre | Both PROD tokens | Both confirmed by operator | ☐ | Wait for operator |
| Exec | pnpm build | exit 0 | ☐ | Check frontend errors |
| Exec | cargo build --release | exit 0 | ☐ | Check Rust errors |
| Exec | pnpm tauri build | exit 0 | ☐ | Check Tauri bundle errors |
| Exec | Artifacts exist | `.AppImage` / `.deb` / `.msi` in bundle/ | ☐ | Build may have partially failed |
| Post | CHANGELOG updated | Latest entry matches version | ☐ | Update CHANGELOG |
| Post | Release tag pushed | `git tag \| grep v27` → result | ☐ | Retry `git push origin <tag>` |
| Post | DEPLOYMENT_COMPLETE written | File exists in deployment/latest/ | ☐ | Write from template |

**H4 HARD STOP CONDITIONS:**
- Either PROD token absent → BLOCKED_APPROVAL (kernel Rule 11)
- No CERT-FREEZE tag → must run H3 first

---

## Quick Reference — Critical Stop Triggers

| Trigger | Phase | Stop Code |
|---------|-------|-----------|
| Hash mismatch (HASH_2 ≠ HASH_1) | H1 Step 3 | **STOP_P9_HASH_MISMATCH** |
| Hash mismatch (HASH_3 ≠ HASH_2) | H1 Step 5 | **STOP_P9_HASH_MISMATCH** |
| verify_instructions FAIL | Any pre-flight | **STOP_GATE_FAIL** |
| Tauri system dep missing | H1 pre-flight | **STOP_RUN_H2_FIRST** |
| Branch ≠ MAIN | H1 pre-flight | **STOP_WRONG_BRANCH** |
| No PROD token | H3/H4 pre | **STOP_BLOCKED_APPROVAL** |
| Vitest < 3288 tests | H2 T2.1 | **STOP_TEST_REGRESSION** |
| Any Vitest FAIL | H2 T2.1 | **STOP_TEST_REGRESSION** |
