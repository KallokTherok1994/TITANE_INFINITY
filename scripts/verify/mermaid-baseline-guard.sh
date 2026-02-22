#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

BASELINE_LOCK="docs/diagrams/MERMAID_BASELINE_LOCK.json"
REGISTRY_PATH="docs/diagrams/MERMAID_HASH_REGISTRY.json"
PROOF_PACK_DIR="docs/_evidence/v27/mermaid_v5"

if [[ ! -f "$BASELINE_LOCK" ]]; then
  echo "FAIL: missing baseline lock file: $BASELINE_LOCK"
  exit 1
fi

BASE_REF="origin/MAIN"
if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  BASE_REF="HEAD~1"
fi
if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "WARN: no base ref available for baseline guard"
  echo "PASS: MERMAID_BASELINE_GUARD"
  exit 0
fi

mapfile -t diff_files < <(git diff --name-only "$BASE_REF"...HEAD | sort)

mmd_changed=0
baseline_changed=0
registry_changed=0
proof_pack_changed=0
baseline_proof_changed=0

for file in "${diff_files[@]}"; do
  if [[ "$file" == docs/diagrams/sources/*.mmd ]]; then
    mmd_changed=1
  fi
  if [[ "$file" == "$BASELINE_LOCK" ]]; then
    baseline_changed=1
  fi
  if [[ "$file" == "$REGISTRY_PATH" ]]; then
    registry_changed=1
  fi
  if [[ "$file" == docs/_evidence/v27/mermaid_v5/baseline/baseline_lock_hash.txt ]]; then
    baseline_proof_changed=1
  fi
  if [[ "$file" == $PROOF_PACK_DIR/proof_pack_*/* || "$file" == $PROOF_PACK_DIR/proof_pack_* ]]; then
    proof_pack_changed=1
  fi
done

read_baseline() {
  python3 - "$BASELINE_LOCK" <<'PY'
import json
import sys

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as handle:
    data = json.load(handle)

print(data.get("baseline_sha", ""))
canon = data.get("canonical_diagrams", [])
print("|".join(str(x) for x in canon))
PY
}

mapfile -t baseline_info < <(read_baseline)
BASELINE_SHA="${baseline_info[0]}"
CANON_LIST="${baseline_info[1]}"

if [[ -z "$BASELINE_SHA" ]]; then
  echo "FAIL: baseline sha missing in $BASELINE_LOCK"
  exit 1
fi

if ! git cat-file -e "$BASELINE_SHA"^{commit} 2>/dev/null; then
  echo "FAIL: baseline sha not found in git history: $BASELINE_SHA"
  exit 1
fi

if ! git merge-base --is-ancestor "$BASELINE_SHA" HEAD; then
  echo "WARN: baseline sha is not an ancestor of HEAD"
fi

if [[ -n "$CANON_LIST" ]]; then
  IFS='|' read -r -a canon_items <<< "$CANON_LIST"
  for canon in "${canon_items[@]}"; do
    canon_path="docs/diagrams/sources/$canon"
    if [[ ! -f "$canon_path" ]]; then
      echo "FAIL: canonical diagram missing: $canon_path"
      exit 1
    fi
  done
fi

if [[ "$baseline_changed" -eq 1 && "$baseline_proof_changed" -eq 0 ]]; then
  echo "FAIL: baseline lock updated without baseline hash evidence"
  exit 1
fi

if [[ "$mmd_changed" -eq 1 ]]; then
  if [[ "$baseline_changed" -eq 0 ]]; then
    echo "FAIL: Mermaid sources changed without baseline lock update"
    exit 1
  fi
  if [[ "$registry_changed" -eq 0 ]]; then
    echo "FAIL: Mermaid sources changed without registry update"
    exit 1
  fi
  if [[ "$proof_pack_changed" -eq 0 ]]; then
    echo "FAIL: Mermaid sources changed without proof pack updates"
    exit 1
  fi
fi

if ! bash scripts/verify/mermaid-hash-registry.sh --check >/dev/null 2>&1; then
  echo "FAIL: Mermaid registry check failed"
  exit 1
fi

echo "PASS: MERMAID_BASELINE_GUARD"
