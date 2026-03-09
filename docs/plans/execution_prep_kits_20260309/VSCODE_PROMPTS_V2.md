# VSCode Copilot Prompts v2 — Per-Substep, Strict STOP Conditions

**Date:** 2026-03-09  
**Type:** PREP_ONLY — Ready-to-use prompts for VS Code Copilot.  
**Version:** v2 (upgraded from `03_VSCODE_PROMPTS.md`)  
**Change vs v1:** Prompts are now per-substep, not per-phase. Each includes explicit STOP conditions and expected output strings.

---

## How to Use v2 Prompts

1. Copy ONE prompt block at a time into VS Code Copilot chat.
2. Execute the commands shown. Paste actual output back into chat.
3. Wait for the per-step verdict before moving to the next prompt.
4. Never skip a STOP condition.

---

## PROMPT v2-H2T1-A — Check Environment

```
## TITANE∞ — H2 TIER 1 STEP A: Environment Snapshot

Run the following command and paste the full output here:

```bash
echo "=== ENV SNAPSHOT ===" && \
cargo --version 2>/dev/null || echo "cargo: MISSING" && \
pnpm --version 2>/dev/null || echo "pnpm: MISSING" && \
dpkg -l libwebkit2gtk-4.1-dev 2>/dev/null | grep "^ii" | awk '{print "WEBKIT: " $3}' || echo "WEBKIT: MISSING" && \
dpkg -l libasound2-dev 2>/dev/null | grep "^ii" | awk '{print "ALSA: " $3}' || echo "ALSA: MISSING"
```

EXPECTED: Each line shows a version string (not MISSING).

STOP IF: Any line shows MISSING → proceed to H2T1-B (install deps) before continuing.
GO IF: All lines show versions → skip H2T1-B and go directly to H1-A.
```

---

## PROMPT v2-H2T1-B — Install Tauri Deps

```
## TITANE∞ — H2 TIER 1 STEP B: Install Tauri System Dependencies

PRECONDITION: At least one dep shows MISSING from H2T1-A.
STOP IF: You are not on Ubuntu/Debian x86_64. Check with: lsb_release -a

Run:

```bash
sudo apt-get update -qq && \
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  libasound2-dev && \
echo "APT_EXIT=$?"
```

EXPECTED: Final line is `APT_EXIT=0`

STOP IF: Any `E: Package not found` error → try `sudo apt-get update` and retry. Check Ubuntu version (must be ≥ 22.04).
GO IF: `APT_EXIT=0` → proceed to H1-A.
```

---

## PROMPT v2-H1-A — Pre-Flight Check

```
## TITANE∞ — H1 TERMINAL STEP A: Pre-Flight

Run the following and paste the full output:

```bash
echo "BRANCH: $(git branch --show-current)" && \
echo "SHA: $(git rev-parse --short HEAD)" && \
echo "CLEAN: $(git status --short | wc -l) changes" && \
grep -q "strip-unneeded" scripts/gates/g6-build-reproducibility.sh && echo "G6_STRIP: OK" || echo "G6_STRIP: MISSING" && \
grep -q "remove-section" scripts/gates/g6-build-reproducibility.sh && echo "G6_OBJCOPY: OK" || echo "G6_OBJCOPY: MISSING" && \
bash scripts/verify_instructions.sh | tail -1
```

EXPECTED:
- BRANCH: MAIN
- CLEAN: 0 changes
- G6_STRIP: OK
- G6_OBJCOPY: OK
- SUMMARY: PASS=20 FAIL=0

STOP IF: BRANCH is not MAIN → git checkout MAIN && git pull
STOP IF: CLEAN > 0 → investigate uncommitted changes
STOP IF: G6_STRIP or G6_OBJCOPY not found → G6 hardening missing — check git state
STOP IF: FAIL>0 in verify_instructions → fix gate before continuing
GO IF: All expected values match → proceed to H1-B.
```

---

## PROMPT v2-H1-B — Dist Placeholder

```
## TITANE∞ — H1 TERMINAL STEP B: Dist Placeholder

Run:

```bash
mkdir -p dist && echo "CI placeholder" > dist/index.html && echo "DIST: $(cat dist/index.html)"
```

EXPECTED: `DIST: CI placeholder`

STOP IF: Any error → check disk permissions.
GO IF: Output matches → proceed to H1-C (Build #2).
```

---

## PROMPT v2-H1-C — P9 Build #2

```
## TITANE∞ — H1 TERMINAL STEP C: P9 Build #2

IMPORTANT: This build takes 15–25 min. Do not interrupt.

Run (paste into terminal and wait for completion):

```bash
export SOURCE_DATE_EPOCH=1000000000
export CARGO_BUILD_JOBS=1
rm -f src-tauri/target/release/titane-infinity src-tauri/target/release/titane-infinity.d
echo "BUILD2_START: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
cargo build --release --locked --manifest-path src-tauri/Cargo.toml
echo "CARGO_BUILD2_EXIT=$?"
echo "BUILD2_END: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

EXPECTED: `CARGO_BUILD2_EXIT=0`

STOP IF: Exit 101 with "alsa-sys" → sudo apt-get install -y libasound2-dev
STOP IF: Exit != 0 for any other reason → paste full error here for diagnosis
GO IF: CARGO_BUILD2_EXIT=0 → paste output here, then proceed to H1-D.
```

---

## PROMPT v2-H1-D — Capture + Compare Hash #2

```
## TITANE∞ — H1 TERMINAL STEP D: Hash Capture #2 + Comparison

PRECONDITION: H1-C completed with exit 0.
KNOWN HASH_1_NORM: 11e30ec1666c9636906c81f6a3564e053188758f8cf47647e6d6b6b5df303d9a

Run:

```bash
BINARY="src-tauri/target/release/titane-infinity"
HASH_2_RAW=$(sha256sum "$BINARY" | awk '{print $1}')
echo "HASH_2_RAW: $HASH_2_RAW"
NORM="/tmp/titane-infinity.run2.normalized"
cp "$BINARY" "$NORM"
llvm-strip --strip-debug --strip-unneeded "$NORM" 2>/dev/null || strip --strip-debug --strip-unneeded "$NORM" 2>/dev/null || true
objcopy --remove-section=.note.gnu.build-id "$NORM" 2>/dev/null || true
objcopy --remove-section=.note.ABI-tag "$NORM" 2>/dev/null || true
HASH_2_NORM=$(sha256sum "$NORM" | awk '{print $1}')
echo "HASH_2_NORM: $HASH_2_NORM"
echo "$HASH_2_NORM" > /tmp/h1_hash2_norm.txt
HASH_1_NORM="11e30ec1666c9636906c81f6a3564e053188758f8cf47647e6d6b6b5df303d9a"
[ "$HASH_2_NORM" = "$HASH_1_NORM" ] && echo "P9_BUILD2_MATCH: PASS" || echo "P9_BUILD2_MATCH: FAIL"
```

EXPECTED: Final line is `P9_BUILD2_MATCH: PASS`

STOP IF: P9_BUILD2_MATCH: FAIL → DO NOT proceed to Build #3. Paste HASH_2_NORM and HASH_1_NORM here for investigation. Classify FAIL.
GO IF: PASS → proceed to H1-E (Build #3).
```

---

## PROMPT v2-H1-E — P9 Build #3

```
## TITANE∞ — H1 TERMINAL STEP E: P9 Build #3

PRECONDITION: H1-D confirmed P9_BUILD2_MATCH: PASS.

Run:

```bash
export SOURCE_DATE_EPOCH=1000000000
export CARGO_BUILD_JOBS=1
rm -f src-tauri/target/release/titane-infinity src-tauri/target/release/titane-infinity.d
echo "BUILD3_START: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
cargo build --release --locked --manifest-path src-tauri/Cargo.toml
echo "CARGO_BUILD3_EXIT=$?"
echo "BUILD3_END: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

EXPECTED: `CARGO_BUILD3_EXIT=0`

STOP IF: Exit != 0 → same table as H1-C.
GO IF: CARGO_BUILD3_EXIT=0 → proceed to H1-F.
```

---

## PROMPT v2-H1-F — Capture Hash #3 + Final P9 Verdict

```
## TITANE∞ — H1 TERMINAL STEP F: Hash Capture #3 + P9 Final Verdict

PRECONDITION: H1-E completed with exit 0.

Run:

```bash
BINARY="src-tauri/target/release/titane-infinity"
HASH_3_RAW=$(sha256sum "$BINARY" | awk '{print $1}')
echo "HASH_3_RAW: $HASH_3_RAW"
NORM="/tmp/titane-infinity.run3.normalized"
cp "$BINARY" "$NORM"
llvm-strip --strip-debug --strip-unneeded "$NORM" 2>/dev/null || strip --strip-debug --strip-unneeded "$NORM" 2>/dev/null || true
objcopy --remove-section=.note.gnu.build-id "$NORM" 2>/dev/null || true
objcopy --remove-section=.note.ABI-tag "$NORM" 2>/dev/null || true
HASH_3_NORM=$(sha256sum "$NORM" | awk '{print $1}')
echo "HASH_3_NORM: $HASH_3_NORM"
echo "$HASH_3_NORM" > /tmp/h1_hash3_norm.txt
HASH_2_NORM=$(cat /tmp/h1_hash2_norm.txt)
HASH_1_NORM="11e30ec1666c9636906c81f6a3564e053188758f8cf47647e6d6b6b5df303d9a"
echo "HASH_1: $HASH_1_NORM"
echo "HASH_2: $HASH_2_NORM"
echo "HASH_3: $HASH_3_NORM"
[ "$HASH_2_NORM" = "$HASH_1_NORM" ] && [ "$HASH_3_NORM" = "$HASH_1_NORM" ] && echo "P9_FINAL: PASS" || echo "P9_FINAL: FAIL"
```

EXPECTED: `P9_FINAL: PASS` with all 3 hashes identical.

STOP IF: P9_FINAL: FAIL → DO NOT write artifact. Paste all 3 hashes here. Classify FAIL. Append AutoHeal entry for investigation.
GO IF: P9_FINAL: PASS → proceed to H1-G (write artifact).
```

---

## PROMPT v2-H1-G — Write P9 Artifact + AutoHeal + Proof Pack

```
## TITANE∞ — H1 TERMINAL STEP G: Write P9 Artifact + AutoHeal + Proof Pack

PRECONDITION: H1-F confirmed P9_FINAL: PASS.

Run the command pack CP-9 from COMMAND_PACKS.md, then CP-10, then CP-11:

After each, paste the output here. Expected:
- CP-9: "P9_ARTIFACT: WRITTEN"
- CP-10: "AH_APPENDED: 146 entries" + "JSON: OK" + "PASS=20 FAIL=0" + "PASS"
- CP-11: "PROOF_PACK: WRITTEN" + lists VERDICT.md and ROLLBACK.md

STOP IF: CP-10 detect_recurrence shows FAIL → check AutoHeal JSON syntax.
STOP IF: JSON validation fails → git restore -- scripts/autoheal/autoheal_rules.jsonl and re-append.
GO IF: All 3 command packs complete with expected output → H1 TERMINAL COMPLETE.

FINAL STATUS: H1 TERMINAL PASS. Unblocks H3 after PROD token provided.
```

---

## PROMPT v2-H2T2 — Excellence Suite

```
## TITANE∞ — H2 TIER 2: EXCELLENCE SUITE

PRECONDITION: H1 TERMINAL COMPLETE (P9 PASS + P8 confirmed).

Run command pack CP-12 from COMMAND_PACKS.md.
Paste the full output here.

EXPECTED:
- Vitest: ≥ 3288 tests passed, 0 failed
- TSC_EXIT=0
- ESLINT_EXIT=0
- PRETTIER_EXIT=0
- verify_instructions: PASS=20 FAIL=0
- detect_recurrence: PASS

STOP IF: Vitest FAIL → identify failing test, do NOT skip.
STOP IF: TSC_EXIT != 0 → fix TypeScript errors.
STOP IF: PRETTIER_EXIT != 0 → run `npx prettier --write .` and commit.
GO IF: All checks pass → write H2_EXCELLENCE_PROOF.md using CP-3 variant.

VERDICT IF ALL PASS: H2 EXCELLENCE COMPLETE. Full stack quality confirmed.
```

---

## PROMPT v2-H3-PRE — P10 Pre-Check

```
## TITANE∞ — H3 PRE-CHECK: P10 Certification Freeze Prerequisites

Run:

```bash
echo "P9: $(grep -o "PASS\|FAIL" deployment/latest/builds/BUILD_REPRODUCIBILITY.md | head -1 || echo MISSING)"
echo "P8: $(grep -o "PASS\|FAIL" deployment/latest/builds/P8_INSTALL_VERIFICATION.md | head -1 || echo MISSING)"
bash scripts/verify_instructions.sh | tail -1
bash scripts/autoheal/detect_recurrence.sh | tail -1
git tag | grep "CERT-FREEZE" || echo "NO_CERT_FREEZE_TAG"
```

EXPECTED:
- P9: PASS
- P8: PASS
- SUMMARY: PASS=20 FAIL=0
- PASS
- NO_CERT_FREEZE_TAG (no existing tag yet)

STOP IF: P9 or P8 not PASS → run H1 first.
STOP IF: verify_instructions FAIL → fix gate.
STOP IF: CERT-FREEZE tag already exists → check if H3 was already run.
AWAITING: Operator must provide token GO_FOR_PROD_BUILD__TITANE_INFINITY before proceeding.
```
