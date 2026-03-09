# H1 TERMINAL — Execution Kit

**Phase:** H1 TERMINAL  
**Objective:** Complete P9 (G6 ×3 reproducible build — runs #2 and #3) + Confirm P8 artifact is current.  
**Est. Duration:** 60–90 min (in a fully provisioned build environment)  
**Type:** PREP_ONLY doc — No execution, no build, no test, no sudo in this file.  
**Source truth:** `docs/plans/phase_preparation_20260309/`

---

## PART A — ENTRY CHECKLIST (Pre-flight)

Run ALL checks before touching any build command. Any ❌ = **STOP and fix first**.

### A.1 Environment Checks

| # | Check | Command | Expected Output | Status |
|---|-------|---------|----------------|--------|
| E1 | cargo available | `cargo --version` | `cargo 1.x.x` | ☐ |
| E2 | rustup stable | `rustup show \| head -3` | contains `stable` | ☐ |
| E3 | libwebkit2gtk installed | `dpkg -l libwebkit2gtk-4.1-dev \| grep -c "^ii"` | `1` | ☐ |
| E4 | libasound2-dev installed | `dpkg -l libasound2-dev \| grep -c "^ii"` | `1` | ☐ |
| E5 | pnpm available | `pnpm --version` | `10.x.x` | ☐ |
| E6 | objcopy available | `which objcopy && echo OK` | `OK` | ☐ |
| E7 | disk space ≥ 4 GB free | `df -h . \| awk 'NR==2{print $4}'` | ≥ 4G | ☐ |

**STOP if any of E1–E7 fails.** → Run H2 first to provision environment.

### A.2 Repository Checks

| # | Check | Command | Expected Output | Status |
|---|-------|---------|----------------|--------|
| R1 | Branch is MAIN | `git branch --show-current` | `MAIN` | ☐ |
| R2 | Working tree clean | `git status --short` | (empty — no output) | ☐ |
| R3 | HEAD is latest MAIN | `git fetch origin MAIN && git diff --stat HEAD origin/MAIN` | (no diff) | ☐ |
| R4 | G6 hardening present | `grep -c "strip-unneeded" scripts/gates/g6-build-reproducibility.sh` | `2` (or more) | ☐ |
| R5 | G6 objcopy present | `grep -c "remove-section" scripts/gates/g6-build-reproducibility.sh` | `2` (or more) | ☐ |
| R6 | Cargo.lock unchanged | `git diff HEAD -- src-tauri/Cargo.lock` | (empty — no diff) | ☐ |
| R7 | AutoHeal count ≥ 145 | `wc -l < scripts/autoheal/autoheal_rules.jsonl` | ≥ 145 | ☐ |
| R8 | verify_instructions PASS | `bash scripts/verify_instructions.sh \| tail -1` | `SUMMARY: PASS=20 FAIL=0` | ☐ |

**STOP if R1, R2, R4, R5, or R8 fails.** → Do not proceed to P9 until all pass.

### A.3 Known Hash Reference

| Build | Hash Type | Value |
|-------|-----------|-------|
| #1 (PR176 session) | Raw SHA256 | `b79b3cddcb6a7c0f8f1d8859b4da68464ae7a164f809fc492654bbbc08dcb830` |
| #1 (PR176 session) | G6 Normalized SHA256 | `11e30ec1666c9636906c81f6a3564e053188758f8cf47647e6d6b6b5df303d9a` |

The **normalized** hash is what G6 produces. Builds #2 and #3 MUST produce a normalized hash equal to Build #1 normalized.

---

## PART B — RUNBOOK (Step-by-step with go/no-go)

### Step 0 — Capture pre-session state

**Time budget:** < 1 min  
**Command:**

```bash
H1_START=$(date -u +%Y%m%dT%H%M%SZ)
H1_PRE_SHA=$(git rev-parse --short HEAD)
H1_BRANCH=$(git branch --show-current)
echo "H1 START: $H1_START | SHA: $H1_PRE_SHA | BRANCH: $H1_BRANCH"
echo "$H1_PRE_SHA" > /tmp/h1_pre_sha.txt
```

**Expected output:** A line with timestamp, 7-char SHA, and "MAIN".  
**GO:** Any output produced → continue.  
**NO-GO:** If branch is not MAIN → run `git checkout MAIN && git pull` first.

---

### Step 1 — Create dist placeholder

**Time budget:** < 1 min  
**Command:**

```bash
mkdir -p dist && echo "CI placeholder" > dist/index.html
echo "DIST_PLACEHOLDER: $(cat dist/index.html)"
```

**Expected output:** `DIST_PLACEHOLDER: CI placeholder`  
**GO:** Output matches → continue to Step 2.  
**NO-GO:** Any error → check disk permissions.  
**Why:** `tauri_build::build()` validates `frontendDist: ../dist` at compile time.

---

### Step 2 — P9 Build #2 (wipe binary, rebuild)

**Time budget:** 15–25 min (cached) or 30–50 min (cold)  
**Commands:**

```bash
# 1) Set reproducibility epoch
export SOURCE_DATE_EPOCH=1000000000
export CARGO_BUILD_JOBS=1
echo "SOURCE_DATE_EPOCH=$SOURCE_DATE_EPOCH"

# 2) Remove previous binary only (do NOT wipe full target/)
rm -f src-tauri/target/release/titane-infinity
rm -f src-tauri/target/release/titane-infinity.d

# 3) Build
cargo build --release --locked --manifest-path src-tauri/Cargo.toml
echo "CARGO_EXIT=$?"
```

**Expected output:** `CARGO_EXIT=0` at end.  
**GO:** Exit 0 → proceed to Step 3.  
**NO-GO / FAIL conditions:**

| Symptom | Cause | Action |
|---------|-------|--------|
| `error: package ... not found` | Missing Tauri system lib | Run H2 env provisioning first |
| `error[E0433]` / compile error | Code regression | Check `git diff HEAD` — should be empty |
| Build hangs > 50 min | Disk/IO issue | Kill, check `df -h`, retry once |
| Exit 101 (alsa-sys) | Missing `libasound2-dev` | `sudo apt-get install -y libasound2-dev` |

---

### Step 3 — Capture and normalize hash #2

**Time budget:** 1–2 min  
**Commands:**

```bash
BINARY_PATH="src-tauri/target/release/titane-infinity"

# Raw hash — captured from original binary BEFORE normalization
HASH_2_RAW=$(sha256sum "$BINARY_PATH" | awk '{print $1}')
echo "HASH_2_RAW: $HASH_2_RAW"
echo "$HASH_2_RAW" > /tmp/h1_hash2_raw.txt

# Normalized hash using G6 normalization steps
G6_SCRIPT="scripts/gates/g6-build-reproducibility.sh"
NORM_BIN="/tmp/titane-infinity.run2.normalized"
cp "$BINARY_PATH" "$NORM_BIN"
# Apply same normalization as G6:
llvm-strip --strip-debug --strip-unneeded "$NORM_BIN" 2>/dev/null || strip --strip-debug --strip-unneeded "$NORM_BIN" 2>/dev/null || true
objcopy --remove-section=.note.gnu.build-id "$NORM_BIN" 2>/dev/null || true
objcopy --remove-section=.note.ABI-tag "$NORM_BIN" 2>/dev/null || true
HASH_2_NORM=$(sha256sum "$NORM_BIN" | awk '{print $1}')
echo "HASH_2_NORM: $HASH_2_NORM"
echo "$HASH_2_NORM" > /tmp/h1_hash2_norm.txt

# Compare with Build #1
HASH_1_NORM="11e30ec1666c9636906c81f6a3564e053188758f8cf47647e6d6b6b5df303d9a"
if [ "$HASH_2_NORM" = "$HASH_1_NORM" ]; then
  echo "P9_BUILD2_MATCH: PASS"
else
  echo "P9_BUILD2_MATCH: FAIL — hashes diverge"
fi
```

**GO:** `P9_BUILD2_MATCH: PASS` → proceed to Step 4.  
**NO-GO:** `FAIL` → do NOT proceed to Step 4. Classify FAIL, append AutoHeal entry, investigate. See Failure Modes section.

---

### Step 4 — P9 Build #3 (second clean rebuild)

**Time budget:** 15–25 min  
**Commands:**

```bash
# Remove binary (keep incremental artifacts to speed build)
rm -f src-tauri/target/release/titane-infinity
rm -f src-tauri/target/release/titane-infinity.d

export SOURCE_DATE_EPOCH=1000000000
export CARGO_BUILD_JOBS=1

cargo build --release --locked --manifest-path src-tauri/Cargo.toml
echo "CARGO_EXIT=$?"
```

**Expected output:** `CARGO_EXIT=0`  
**GO/NO-GO:** Same table as Step 2.

---

### Step 5 — Capture and normalize hash #3

**Time budget:** 1–2 min  
**Commands:**

```bash
BINARY_PATH="src-tauri/target/release/titane-infinity"
# Raw hash — captured from original binary BEFORE normalization
HASH_3_RAW=$(sha256sum "$BINARY_PATH" | awk '{print $1}')
echo "HASH_3_RAW: $HASH_3_RAW"
echo "$HASH_3_RAW" > /tmp/h1_hash3_raw.txt

NORM_BIN="/tmp/titane-infinity.run3.normalized"
cp "$BINARY_PATH" "$NORM_BIN"
llvm-strip --strip-debug --strip-unneeded "$NORM_BIN" 2>/dev/null || strip --strip-debug --strip-unneeded "$NORM_BIN" 2>/dev/null || true
objcopy --remove-section=.note.gnu.build-id "$NORM_BIN" 2>/dev/null || true
objcopy --remove-section=.note.ABI-tag "$NORM_BIN" 2>/dev/null || true
HASH_3_NORM=$(sha256sum "$NORM_BIN" | awk '{print $1}')
echo "HASH_3_NORM: $HASH_3_NORM"
echo "$HASH_3_NORM" > /tmp/h1_hash3_norm.txt

# Final 3-way comparison (read HASH_2 from file — safe across shell sessions)
HASH_2_NORM=$(cat /tmp/h1_hash2_norm.txt)
HASH_1_NORM="11e30ec1666c9636906c81f6a3564e053188758f8cf47647e6d6b6b5df303d9a"
if [ "$HASH_2_NORM" = "$HASH_1_NORM" ] && [ "$HASH_3_NORM" = "$HASH_1_NORM" ]; then
  echo "P9_FINAL: PASS — all 3 hashes match"
else
  echo "P9_FINAL: FAIL — hash divergence detected"
  echo "  HASH_1: $HASH_1_NORM"
  echo "  HASH_2: $HASH_2_NORM"
  echo "  HASH_3: $HASH_3_NORM"
fi
```

**GO:** `P9_FINAL: PASS` → proceed to Step 6.  
**NO-GO:** `FAIL` → classify FAIL, AutoHeal, do NOT write P9 PASS artifact.

---

### Step 6 — Write P9 artifact

**Time budget:** < 1 min  
**Condition:** ONLY run this if Step 5 produced `P9_FINAL: PASS`.

```bash
H1_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
H1_HEAD=$(git rev-parse --short HEAD)

cat > deployment/latest/builds/BUILD_REPRODUCIBILITY.md << 'EOF'
# P9 — G6 Reproducible Build Report

**Date:** FILL_DATE
**Session:** H1_terminal_execution
**MAIN HEAD:** FILL_HEAD
**SOURCE_DATE_EPOCH:** 1000000000
**CARGO_BUILD_JOBS:** 1

## Hash Comparison

| Build | Type | SHA256 |
|-------|------|--------|
| #1 (PR176 session) | Raw | b79b3cddcb6a7c0f8f1d8859b4da68464ae7a164f809fc492654bbbc08dcb830 |
| #1 (PR176 session) | Normalized (G6) | 11e30ec1666c9636906c81f6a3564e053188758f8cf47647e6d6b6b5df303d9a |
| #2 (H1 terminal) | Raw | FILL_HASH_2_RAW |
| #2 (H1 terminal) | Normalized (G6) | FILL_HASH_2_NORM |
| #3 (H1 terminal) | Raw | FILL_HASH_3_RAW |
| #3 (H1 terminal) | Normalized (G6) | FILL_HASH_3_NORM |

## Verdict

**P9: PASS** — All 3 normalized hashes match.

## Normalization Method (G6 — AH-2026-03-09-0109)

- `llvm-strip --strip-debug --strip-unneeded`
- `objcopy --remove-section=.note.gnu.build-id`
- `objcopy --remove-section=.note.ABI-tag`
EOF

# Fill in the real values (replace FILL_* tokens)
sed -i "s/FILL_DATE/$H1_DATE/" deployment/latest/builds/BUILD_REPRODUCIBILITY.md
sed -i "s/FILL_HEAD/$H1_HEAD/" deployment/latest/builds/BUILD_REPRODUCIBILITY.md
sed -i "s/FILL_HASH_2_RAW/$HASH_2_RAW/" deployment/latest/builds/BUILD_REPRODUCIBILITY.md
sed -i "s/FILL_HASH_2_NORM/$HASH_2_NORM/" deployment/latest/builds/BUILD_REPRODUCIBILITY.md
sed -i "s/FILL_HASH_3_RAW/$HASH_3_RAW/" deployment/latest/builds/BUILD_REPRODUCIBILITY.md
sed -i "s/FILL_HASH_3_NORM/$HASH_3_NORM/" deployment/latest/builds/BUILD_REPRODUCIBILITY.md

echo "P9_ARTIFACT_WRITTEN: $(head -1 deployment/latest/builds/BUILD_REPRODUCIBILITY.md)"
```

**GO:** Line 1 of artifact is `# P9 — G6 Reproducible Build Report` → proceed.  
**NO-GO:** Write error or sed failures → check disk space, retry.

---

### Step 7 — Confirm P8 artifact is current

**Time budget:** < 1 min  
**Command:**

```bash
grep -q "PASS" deployment/latest/builds/P8_INSTALL_VERIFICATION.md && echo "P8_ARTIFACT: PASS" || echo "P8_ARTIFACT: MISSING or FAIL"
cat deployment/latest/builds/P8_INSTALL_VERIFICATION.md | grep "Status:"
```

**GO:** `P8_ARTIFACT: PASS` → proceed.  
**NO-GO:** If FAIL or missing → must re-run P8 (see H2 kit, P8 command pack).

---

### Step 8 — Append AutoHeal entry AH-2026-03-09-0110

**Time budget:** < 2 min  
**Condition:** After P9 PASS is confirmed.  
**Command:** (use template from `PROOF_PACK_SKELETONS.md`, section AH-0110)

```bash
# Verify current entry count before append
wc -l scripts/autoheal/autoheal_rules.jsonl
# Expected: 145
# After append: 146
```

**GO:** Entry appended, `wc -l` = 146 → proceed.  
**NO-GO:** If `detect_recurrence.sh` fails after append → check JSON syntax with `python3 -c "import json; [json.loads(l) for l in open('scripts/autoheal/autoheal_rules.jsonl')]"`

---

### Step 9 — Run governance gates

**Time budget:** 1–2 min  
**Commands:**

```bash
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

**GO:** Both print PASS (verify_instructions: `SUMMARY: PASS=20 FAIL=0`, detect_recurrence: `PASS`) → proceed.  
**NO-GO:** Any FAIL → STOP, classify BLOCKED, fix before proceeding to proof pack.

---

### Step 10 — Write H1 proof pack

**Time budget:** < 5 min  
**Condition:** All previous steps PASS.  
**Command:** (use skeleton from `PROOF_PACK_SKELETONS.md`, section P9_P8_RESOLUTION)

```bash
mkdir -p proof_packs/P9_P8_RESOLUTION_20260309
# Write VERDICT.md and ROLLBACK.md using the skeleton
```

**GO:** Proof pack directory created with VERDICT.md → H1 COMPLETE.

---

## PART C — P9 Failure Modes + Diagnosis

If hash mismatch is detected in Step 3 or Step 5, use this table:

| Symptom | Root Cause | Diagnosis Command | Action |
|---------|-----------|-------------------|--------|
| Hash differs after same epoch | `__DATE__` or `__TIME__` macro in source | `grep -r "__DATE__\|__TIME__" src-tauri/src/` | Must eliminate build-time timestamps |
| Hash differs across machines | Absolute path in DWARF | `readelf -p .debug_str src-tauri/target/release/titane-infinity \| grep /home` | Use `CARGO_BUILD_TARGETS` path remapping |
| Hash differs, build-id still present | objcopy not applied (llvm-strip path issue) | `readelf -n /tmp/titane-infinity.run2.normalized` | Verify objcopy binary: `which objcopy` |
| Hash matches run2 but not run1 | Cargo registry metadata changed | `git diff HEAD -- src-tauri/Cargo.lock` | Must be empty; check `cargo update` was not run |
| Hash differs despite normalization | New variable ELF section added | `readelf -S /tmp/titane-infinity.run2.normalized \| grep -i note` | Add `objcopy --remove-section=.note.<new>` to G6 |

---

## PART D — H1 Success Criteria Summary

| Criterion | Expected | Verified? |
|-----------|----------|-----------|
| P9 HASH_2_NORM == HASH_1_NORM | True | ☐ |
| P9 HASH_3_NORM == HASH_1_NORM | True | ☐ |
| `BUILD_REPRODUCIBILITY.md` created | Contains "PASS" | ☐ |
| `P8_INSTALL_VERIFICATION.md` shows PASS | Already confirmed | ☐ |
| AutoHeal entry AH-2026-03-09-0110 appended | 146 entries | ☐ |
| `verify_instructions.sh` | PASS=20 FAIL=0 | ☐ |
| `detect_recurrence.sh` | PASS | ☐ |
| Proof pack `P9_P8_RESOLUTION_20260309/VERDICT.md` | Exists, VERDICT_UNIQUE: PASS | ☐ |

All ✅ = **H1 COMPLETE → unblocks H3 (P10 Certification Freeze)**

---

## PART E — Rollback

```bash
# If P9 writes failed artifacts, restore:
git restore -- deployment/latest/builds/BUILD_REPRODUCIBILITY.md

# If AutoHeal entry was wrong:
git restore -- scripts/autoheal/autoheal_rules.jsonl

# If proof pack was incorrectly written:
git restore -- proof_packs/P9_P8_RESOLUTION_20260309/

# Full H1 rollback (if nothing should be kept):
git restore -- deployment/latest/builds/ proof_packs/P9_P8_RESOLUTION_20260309/ scripts/autoheal/autoheal_rules.jsonl
```
