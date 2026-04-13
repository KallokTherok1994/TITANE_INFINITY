#!/usr/bin/env bash
# verify-capabilities-coverage.sh
# Governed anti-recurrence validator — AH-2026-03-21-CAPS
#
# Purpose: Cross-check commands in src-tauri/capabilities/*.json allow lists
#          against identifiers present in src-tauri/src/main.rs.
#
# Rule: NEW dead entries (allowed but absent from main.rs) = FAIL.
#       Known pre-existing dead entries (16) = documented baseline, not blocking.
#
# Exit codes: 0 = PASS, 1 = FAIL (new dead entries beyond known baseline)

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

CAP_DIR="src-tauri/capabilities"
MAIN_RS="src-tauri/src/main.rs"

# Known pre-existing dead capability entries (16 total, documented in
# proof_packs/PREPROD_TO_PROD_SEAL_*/09_ANTI_RECURRENCE_MAP.md)
KNOWN_DEAD=(
  "test_ollama"
  "autonomy_analyse_logs"
  "autonomy_evolve_ia"
  "autonomy_fix_states"
  "autonomy_heal_modules"
  "autonomy_optimize_performance"
  "autonomy_scan_backend"
  "autonomy_scan_ia"
  "autonomy_scan_memory"
  "autonomy_scan_singularity_state"
  "autonomy_scan_tts"
  "autonomy_shield_state"
  "autonomy_test_ia_coherence"
  "singularity_selftest_full"
  "titan_validate_invariants"
)

echo "[G_CAP_COVERAGE] start $(date -Iseconds)"

if [ ! -d "$CAP_DIR" ] || [ ! -f "$MAIN_RS" ]; then
  echo "[G_CAP_COVERAGE] FAIL: capabilities dir or main.rs not found"
  exit 1
fi

# Detect dead entries using python3
NEW_DEAD=$(python3 - << 'PYEOF'
import json, glob, re, sys

# Load all allowed commands
allowed = set()
for f in glob.glob("src-tauri/capabilities/*.json"):
    try:
        d = json.load(open(f))
        for c in d.get("commands", {}).get("allow", []):
            allowed.add(c)
    except Exception as e:
        print(f"WARN: {f}: {e}", file=sys.stderr)

# Load all identifiers from main.rs
with open("src-tauri/src/main.rs") as f:
    content = f.read()
all_fns = set(re.findall(r'\b([a-z][a-z0-9_]{3,})\b', content))

# Known pre-existing dead entries (not counted as failures)
import os
known_dead_str = os.environ.get("KNOWN_DEAD_LIST", "")
known_dead = set(known_dead_str.split(",")) if known_dead_str else set()

for cmd in sorted(allowed):
    if cmd not in all_fns and cmd not in known_dead:
        print(cmd)
PYEOF
)

# Pass known dead list to python subprocess
export KNOWN_DEAD_LIST
KNOWN_DEAD_LIST=$(IFS=','; echo "${KNOWN_DEAD[*]}")

NEW_DEAD=$(python3 - << 'PYEOF'
import json, glob, re, sys, os

allowed = set()
for f in glob.glob("src-tauri/capabilities/*.json"):
    try:
        d = json.load(open(f))
        for c in d.get("commands", {}).get("allow", []):
            allowed.add(c)
    except Exception as e:
        print(f"WARN: {f}: {e}", file=sys.stderr)

with open("src-tauri/src/main.rs") as f:
    content = f.read()
all_fns = set(re.findall(r'\b([a-z][a-z0-9_]{3,})\b', content))

known_dead = set(os.environ.get("KNOWN_DEAD_LIST","").split(","))

for cmd in sorted(allowed):
    if cmd not in all_fns and cmd not in known_dead:
        print(cmd)
PYEOF
)

NEW_DEAD_COUNT=$(echo "$NEW_DEAD" | grep -c . 2>/dev/null || echo 0)
echo "[G_CAP_COVERAGE] known-dead baseline: ${#KNOWN_DEAD[@]}"
echo "[G_CAP_COVERAGE] NEW dead entries found: $NEW_DEAD_COUNT"

if [ -n "$NEW_DEAD" ]; then
  echo "NEW_DEAD_ENTRIES:"
  echo "$NEW_DEAD" | while read -r cmd; do echo "  NEW_DEAD: $cmd"; done
  echo "G_CAP_COVERAGE=FAIL — new dead capability entries found"
  exit 1
else
  echo "G_CAP_COVERAGE=PASS — no new dead capability entries"
  exit 0
fi
