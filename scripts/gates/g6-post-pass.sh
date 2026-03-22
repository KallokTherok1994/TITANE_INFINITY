#!/usr/bin/env bash
# G6 Post-PASS: AutoHeal + verify + commit + push
# Invoke ONLY after GATE G6 PASS confirmed.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

BUILD_DIR="deployment/latest/builds"
BUILD_REPRODUCIBILITY_MD="deployment/latest/builds/BUILD_REPRODUCIBILITY.md"
AUTOHEAL_JSONL="scripts/autoheal/autoheal_rules.jsonl"

echo "=== G6 POST-PASS ==="
echo "HEAD=$(git rev-parse --short HEAD)"
echo "BRANCH=$(git branch --show-current)"

# 1. Verify G6 PASS in report
if ! grep -q 'Status.*PASS' "$BUILD_REPRODUCIBILITY_MD" 2>/dev/null; then
  echo "ERROR: BUILD_REPRODUCIBILITY.md does not contain PASS — aborting."
  exit 1
fi
echo "✅ G6 PASS confirmed in $BUILD_REPRODUCIBILITY_MD"

# 2. Extract run hashes for AutoHeal evidence
HASH_1=$(grep 'Run 1' "$BUILD_REPRODUCIBILITY_MD" | sed 's/.*`\([^`]*\)`.*/\1/')
HASH_2=$(grep 'Run 2' "$BUILD_REPRODUCIBILITY_MD" | sed 's/.*`\([^`]*\)`.*/\1/')
HASH_3=$(grep 'Run 3' "$BUILD_REPRODUCIBILITY_MD" | sed 's/.*`\([^`]*\)`.*/\1/')
echo "Run 1: $HASH_1"
echo "Run 2: $HASH_2"
echo "Run 3: $HASH_3"

if [[ "$HASH_1" != "$HASH_2" ]] || [[ "$HASH_2" != "$HASH_3" ]]; then
  echo "ERROR: Hashes diverge despite PASS status — aborting."
  exit 1
fi
echo "✅ All 3 hashes match: $HASH_1"

# 3. Append AutoHeal entry
AH_ID="AH-REPRO-RELEASE-PROFILE-NON-DETERMINISM-001"
if grep -q "$AH_ID" "$AUTOHEAL_JSONL" 2>/dev/null; then
  echo "ℹ️  AutoHeal entry $AH_ID already present — skipping append."
else
  cat >> "$AUTOHEAL_JSONL" <<'JSONEOF'
{"id":"AH-REPRO-RELEASE-PROFILE-NON-DETERMINISM-001","date":"2026-03-22","scope":["src-tauri/Cargo.toml"],"symptom":"G6 3x independent builds produced divergent normalized hashes (Run1 != Run2 != Run3) even with SOURCE_DATE_EPOCH=1000000000 and CARGO_BUILD_JOBS=1","root_cause":"[profile.release] had incremental=true and codegen-units=16 — incremental compilation embeds run-specific metadata in binary; multiple codegen units introduce parallelism-dependent linking order","fix":"Set incremental=false and codegen-units=1 in [profile.release] — forces single-unit deterministic compilation with no incremental metadata","prevention_test":"G6_SKIP_ENV_CHECK=1 bash scripts/gates/g6-build-reproducibility.sh","commands":["G6_SKIP_ENV_CHECK=1 bash scripts/gates/g6-build-reproducibility.sh","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":["src-tauri/Cargo.toml","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- src-tauri/Cargo.toml"}
JSONEOF
  echo "✅ AutoHeal entry appended."
fi

# 4. Run AutoHeal recurrence detector
echo "--- detect_recurrence.sh ---"
bash scripts/autoheal/detect_recurrence.sh
echo "✅ detect_recurrence.sh done"

# 5. Run instructions verifier
echo "--- verify_instructions.sh ---"
bash scripts/verify_instructions.sh | tail -3
echo "✅ verify_instructions.sh done"

# 6. Clean temporary G6 artifacts from tracked workspace paths
echo "--- cleanup G6 temp artifacts ---"
rm -rf "$BUILD_DIR"/target-run-* "$BUILD_DIR"/pnpm-cache-* "$BUILD_DIR"/titane-infinity.run*.normalized "$BUILD_DIR"/hash_run_*.txt
echo "✅ cleanup done"

# 7. Commit G6 PASS artifacts + AutoHeal
git add "$BUILD_REPRODUCIBILITY_MD" "$AUTOHEAL_JSONL"
git diff --cached --name-only

GIT_HASH="$HASH_1"
VERSION=$(grep '^version' src-tauri/Cargo.toml | head -1 | sed 's/.*= *"\(.*\)"/\1/')
git commit -m "feat(gate): G6 PASS v${VERSION} — build reproducibility ×3 verified

Normalized hash (×3 identical): ${GIT_HASH}
SOURCE_DATE_EPOCH=1000000000, CARGO_BUILD_JOBS=1
incremental=false, codegen-units=1 in [profile.release]
AutoHeal: AH-REPRO-RELEASE-PROFILE-NON-DETERMINISM-001

GATE G6: PASS"

echo "✅ Committed G6 PASS artifacts."

# 8. Push MAIN
git push origin MAIN
echo "✅ Pushed MAIN to origin."

echo ""
echo "=== G6 POST-PASS COMPLETE ==="
echo "VERDICT: PASS"
echo "Version: $VERSION"
echo "Hash: $GIT_HASH"
