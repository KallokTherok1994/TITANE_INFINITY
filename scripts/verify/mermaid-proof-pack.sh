#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

STAMP=$(date -u +"%Y%m%dT%H%M%SZ")
ISO_STAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PACK_VERSION="mermaid_v11"
PACK_DIR="docs/_evidence/v27/${PACK_VERSION}/proof_pack_${STAMP}"
ALLOWLIST="docs/diagrams/DRIFT_ALLOWLIST.txt"
BASELINE_LOCK="docs/diagrams/MERMAID_BASELINE_LOCK.json"
REGISTRY_PATH="docs/diagrams/MERMAID_HASH_REGISTRY.json"
PACK_ID="${PACK_VERSION}_${STAMP}_$(git rev-parse --short HEAD)"

mkdir -p "$PACK_DIR"

FAIL=0

run_capture() {
  local label="$1"
  local outfile="$2"
  shift 2
  if ! "$@" > "$outfile" 2>&1; then
    echo "FAIL: $label" >> "$PACK_DIR/FAILURES.txt"
    FAIL=1
  fi
}

read_baseline_sha() {
  python3 - "$BASELINE_LOCK" <<'PY'
import json
import sys

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as handle:
    data = json.load(handle)

print(data.get("baseline_sha", ""))
PY
}

if [[ ! -f "$BASELINE_LOCK" ]]; then
  echo "FAIL: missing baseline lock: $BASELINE_LOCK" >> "$PACK_DIR/FAILURES.txt"
  FAIL=1
fi

BASELINE_SHA=""
if [[ -f "$BASELINE_LOCK" ]]; then
  BASELINE_SHA=$(read_baseline_sha)
fi

if [[ -z "$BASELINE_SHA" ]]; then
  echo "FAIL: baseline sha missing" >> "$PACK_DIR/FAILURES.txt"
  FAIL=1
fi

HEAD_SHA_AT_TIME=$(git rev-parse HEAD)
REGISTRY_HASH_BEFORE=""
if [[ -f "$REGISTRY_PATH" ]]; then
  REGISTRY_HASH_BEFORE=$(sha256sum "$REGISTRY_PATH" | awk '{print $1}')
fi

run_capture "baseline_lock" "$PACK_DIR/baseline_lock.json" bash -c "cat $BASELINE_LOCK"

for i in 1 2 3; do
  run_capture "verify_${i}" "$PACK_DIR/verify_${i}.txt" bash -c 'pnpm run verify:docs:mermaid'
done

run_capture "registry_check" "$PACK_DIR/registry_check.txt" bash -c 'bash scripts/verify/mermaid-hash-registry.sh --check'
run_capture "drift_strict" "$PACK_DIR/drift.txt" bash -c "bash scripts/verify/verify-mermaid-drift.sh --strict --allowlist ${ALLOWLIST} --report ${PACK_DIR}/drift_report.md"
run_capture "change_guard" "$PACK_DIR/change_guard.txt" bash -c 'bash scripts/verify/mermaid-change-request-guard.sh'
run_capture "baseline_guard" "$PACK_DIR/baseline_guard.txt" bash -c 'bash scripts/verify/mermaid-baseline-guard.sh'

run_capture "status_report" "$PACK_DIR/status.txt" bash -c 'bash scripts/verify/mermaid-status-report.sh'
run_capture "status_report" "$PACK_DIR/status_report.txt" bash -c 'bash scripts/verify/mermaid-status-report.sh --check'

mapfile -t mmd_changed < <(git diff --name-only -- 'docs/diagrams/sources/*.mmd' | sort)
if [[ ${#mmd_changed[@]} -gt 0 ]]; then
  run_capture "git_diff_names" "$PACK_DIR/diff_names.txt" bash -c 'git diff --name-only'
  run_capture "git_diff_stat" "$PACK_DIR/diff_stat.txt" bash -c 'git diff --stat'
  run_capture "baseline_delta" "$PACK_DIR/baseline_delta.txt" bash -c "git diff --stat ${BASELINE_SHA}...HEAD -- docs/diagrams/sources/*.mmd"
fi

count_nodes_links() {
  local ref="$1"
  python3 - "$ref" <<'PY'
import glob
import re
import subprocess
import sys

ref = sys.argv[1]
edge_re = re.compile(r"(-->|==>|---|\.\.>|=>)")
node_decl = re.compile(r"^\s*([A-Za-z0-9_]+)\s*[\[\(\{]")
edge_nodes = re.compile(r"([A-Za-z0-9_]+)\s*(-->|==>|---|\.\.>|=>)\s*([A-Za-z0-9_]+)")

files = sorted(glob.glob("docs/diagrams/sources/*.mmd"))

def read_text(ref_value, path):
    if ref_value == "WORKTREE":
        try:
            with open(path, "r", encoding="utf-8") as handle:
                return handle.read()
        except FileNotFoundError:
            return ""
    proc = subprocess.run(["git", "show", f"{ref_value}:{path}"], capture_output=True, text=True)
    if proc.returncode != 0:
        return ""
    return proc.stdout

total_nodes = 0
total_edges = 0
for path in files:
    text = read_text(ref, path)
    if not text:
        continue
    nodes = set()
    for line in text.splitlines():
        if not line.strip() or line.strip().startswith("%%"):
            continue
        total_edges += len(edge_re.findall(line))
        match = node_decl.search(line)
        if match:
            nodes.add(match.group(1))
        for edge in edge_nodes.finditer(line):
            nodes.add(edge.group(1))
            nodes.add(edge.group(3))
    total_nodes += len(nodes)

print(f"{total_nodes} {total_edges}")
PY
}

BASELINE_COUNTS="0 0"
CURRENT_COUNTS="0 0"
if [[ -n "$BASELINE_SHA" ]]; then
  BASELINE_COUNTS=$(count_nodes_links "$BASELINE_SHA")
fi
CURRENT_COUNTS=$(count_nodes_links "WORKTREE")

baseline_nodes=$(echo "$BASELINE_COUNTS" | awk '{print $1}')
baseline_links=$(echo "$BASELINE_COUNTS" | awk '{print $2}')
current_nodes=$(echo "$CURRENT_COUNTS" | awk '{print $1}')
current_links=$(echo "$CURRENT_COUNTS" | awk '{print $2}')

REGISTRY_HASH_AFTER=""
if [[ -f "$REGISTRY_PATH" ]]; then
  REGISTRY_HASH_AFTER=$(sha256sum "$REGISTRY_PATH" | awk '{print $1}')
fi

CHANGE_REQUEST_SRC="docs/diagrams/CHANGE_REQUEST.md"
CHANGE_REQUEST_PACK=""
if [[ -f "$CHANGE_REQUEST_SRC" ]]; then
  CHANGE_REQUEST_PACK="$PACK_DIR/change_request.md"
  cp "$CHANGE_REQUEST_SRC" "$CHANGE_REQUEST_PACK"
fi

if [[ ${#mmd_changed[@]} -gt 0 ]]; then
  cat > "$PACK_DIR/comparison.md" <<EOF
# Mermaid Baseline Comparison

| Metric | Baseline | Current | Delta |
|---|---:|---:|---:|
| Nodes | $baseline_nodes | $current_nodes | $((current_nodes - baseline_nodes)) |
| Links | $baseline_links | $current_links | $((current_links - baseline_links)) |
| Registry Hash | $REGISTRY_HASH_BEFORE | $REGISTRY_HASH_AFTER | $(if [[ "$REGISTRY_HASH_BEFORE" == "$REGISTRY_HASH_AFTER" ]]; then echo "no change"; else echo "changed"; fi) |
EOF
fi

cat > "$PACK_DIR/pack_meta.json" <<EOF
{
  "pack_id": "${PACK_ID}",
  "pack_version": "${PACK_VERSION}",
  "timestamp_utc": "${ISO_STAMP}",
  "head_sha_at_time": "${HEAD_SHA_AT_TIME}",
  "baseline_sha": "${BASELINE_SHA}",
  "registry_hash_before": "${REGISTRY_HASH_BEFORE}",
  "registry_hash_after": "${REGISTRY_HASH_AFTER}",
  "change_request": "${CHANGE_REQUEST_PACK}",
  "baseline_nodes": ${baseline_nodes},
  "baseline_links": ${baseline_links},
  "current_nodes": ${current_nodes},
  "current_links": ${current_links}
}
EOF

RESULT="PASS"
if [[ "$FAIL" -ne 0 ]]; then
  RESULT="FAIL"
fi

cat > "$PACK_DIR/VERDICT.md" <<EOF
# Mermaid Proof Pack Verdict

- Resultat: $RESULT
- Timestamp (UTC): $ISO_STAMP
- Pack: $PACK_DIR
- Pack ID: $PACK_ID
- Head SHA at time: $HEAD_SHA_AT_TIME
- Baseline SHA: $BASELINE_SHA
- Final SHA is the commit that contains this proof pack; do not record it inside the same commit.
EOF

cat > "$PACK_DIR/ROLLBACK.md" <<EOF
# Mermaid Proof Pack Rollback

- git revert HEAD
EOF

echo "PROOF_PACK_PATH: $PACK_DIR"
ls -1 "$PACK_DIR" | LC_ALL=C sort

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
