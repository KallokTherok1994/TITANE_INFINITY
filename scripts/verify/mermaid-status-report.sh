#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

BASELINE_LOCK="docs/diagrams/MERMAID_BASELINE_LOCK.json"
STATUS_PATH="docs/diagrams/MERMAID_STATUS.md"
ALLOWLIST="docs/diagrams/DRIFT_ALLOWLIST.txt"
REGISTRY_PATH="docs/diagrams/MERMAID_HASH_REGISTRY.json"

MODE="update"
if [[ "${1:-}" == "--check" ]]; then
  MODE="check"
fi

if [[ ! -f "$BASELINE_LOCK" ]]; then
  echo "FAIL: missing baseline lock file: $BASELINE_LOCK"
  exit 1
fi

read_baseline() {
  python3 - "$BASELINE_LOCK" <<'PY'
import json
import sys

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as handle:
    data = json.load(handle)

print(data.get("baseline_sha", ""))
print(data.get("version_mermaid_system", ""))
print(data.get("ci_workflow", ""))
print("true" if data.get("strict_drift") else "false")
print("true" if data.get("registry_append_only") else "false")
print("true" if data.get("proof_pack_standard") else "false")
canon = data.get("canonical_diagrams", [])
print("|".join(str(x) for x in canon))
PY
}

mapfile -t baseline_info < <(read_baseline)
BASELINE_SHA="${baseline_info[0]}"
MERMAID_VERSION="${baseline_info[1]}"
CI_WORKFLOW="${baseline_info[2]}"
STRICT_DRIFT="${baseline_info[3]}"
REGISTRY_APPEND_ONLY="${baseline_info[4]}"
PROOF_PACK_STANDARD="${baseline_info[5]}"
CANONICAL_LIST="${baseline_info[6]}"

if [[ -z "$BASELINE_SHA" ]]; then
  echo "FAIL: baseline sha missing in $BASELINE_LOCK"
  exit 1
fi

PROOF_PACK_DIR="docs/_evidence/v27/mermaid_v13"
latest_pack=""
if [[ -d "$PROOF_PACK_DIR" ]]; then
  latest_pack=$(ls -1d "$PROOF_PACK_DIR"/proof_pack_* 2>/dev/null | sort | tail -n 1 || true)
fi
if [[ -n "$latest_pack" ]]; then
  latest_pack=${latest_pack#$PROOF_PACK_DIR/}
else
  latest_pack="none"
fi

FAIL=0

LINEAGE_STATUS="FAIL"
if git merge-base --is-ancestor "$BASELINE_SHA" HEAD >/dev/null 2>&1; then
  LINEAGE_STATUS="PASS"
else
  FAIL=1
fi

DRIFT_STATUS="FAIL"
if bash scripts/verify/verify-mermaid-drift.sh --strict --allowlist "$ALLOWLIST" >/dev/null 2>&1; then
  DRIFT_STATUS="PASS"
else
  FAIL=1
fi

REGISTRY_STATUS="FAIL"
if bash scripts/verify/mermaid-hash-registry.sh --check >/dev/null 2>&1; then
  REGISTRY_STATUS="PASS"
else
  FAIL=1
fi

CHANGE_REQ_REQUIRED="true"

cat <<EOF > "$STATUS_PATH.tmp"
# Mermaid Status Report

- Baseline SHA: $BASELINE_SHA
- Drift Strict Status: $DRIFT_STATUS
- Registry Status: $REGISTRY_STATUS
- Change Request Required: $CHANGE_REQ_REQUIRED
- Last Proof Pack: $latest_pack
- System Mode: DORMANT (V12)
- Last Active Phase: V11
EOF

if [[ "$MODE" == "check" ]]; then
  if [[ ! -f "$STATUS_PATH" ]]; then
    echo "FAIL: status report missing: $STATUS_PATH"
    rm -f "$STATUS_PATH.tmp"
    exit 1
  fi
  if ! cmp -s "$STATUS_PATH.tmp" "$STATUS_PATH"; then
    echo "FAIL: status report out of date"
    rm -f "$STATUS_PATH.tmp"
    exit 1
  fi
  rm -f "$STATUS_PATH.tmp"
  if [[ "$FAIL" -ne 0 ]]; then
    echo "FAIL: MERMAID_STATUS_REPORT"
    exit 1
  fi
  echo "PASS: MERMAID_STATUS_REPORT"
  exit 0
fi

mv "$STATUS_PATH.tmp" "$STATUS_PATH"
if [[ "$FAIL" -ne 0 ]]; then
  echo "FAIL: MERMAID_STATUS_REPORT"
  exit 1
fi
echo "PASS: MERMAID_STATUS_REPORT"
