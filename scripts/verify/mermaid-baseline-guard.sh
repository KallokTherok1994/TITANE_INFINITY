#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

BASELINE_LOCK="docs/diagrams/MERMAID_BASELINE_LOCK.json"
REGISTRY_PATH="docs/diagrams/MERMAID_HASH_REGISTRY.json"
STATUS_PATH="docs/diagrams/MERMAID_STATUS.md"
PROOF_PACK_DIR="docs/_evidence/v27/mermaid_v9"
LINEAGE_DIR="docs/_evidence/v27/mermaid_v9/single_commit"
BASELINE_HASH_PATH="$LINEAGE_DIR/baseline_lock_hash.txt"

REANCHOR=0
BASE_REF=""
CI_MODE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --reanchor)
      REANCHOR=1
      shift
      ;;
    --base-ref)
      BASE_REF="${2:-}"
      shift 2
      ;;
    --ci)
      CI_MODE=1
      shift
      ;;
    *)
      echo "FAIL: unknown argument: $1"
      exit 2
      ;;
  esac
done

if [[ ! -f "$BASELINE_LOCK" ]]; then
  echo "FAIL: missing baseline lock file: $BASELINE_LOCK"
  exit 1
fi

if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
  CI_MODE=1
fi

if [[ -z "$BASE_REF" && -n "${GITHUB_BASE_REF:-}" ]]; then
  BASE_REF="origin/${GITHUB_BASE_REF}"
  if [[ "$CI_MODE" -eq 1 ]]; then
    git fetch origin "${GITHUB_BASE_REF}:refs/remotes/origin/${GITHUB_BASE_REF}" >/dev/null 2>&1 || true
  fi
fi

if [[ -z "$BASE_REF" ]]; then
  BASE_REF="origin/MAIN"
fi

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  if [[ "$CI_MODE" -eq 1 ]]; then
    echo "FAIL: base ref not found in CI: $BASE_REF"
    exit 1
  fi
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
  if [[ "$file" == "$BASELINE_HASH_PATH" ]]; then
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

if [[ "$REANCHOR" -eq 1 ]]; then
  if ! pnpm run op:mermaid >/dev/null 2>&1; then
    echo "FAIL: re-anchor blocked (op:mermaid failed)"
    exit 1
  fi
  if ! bash scripts/verify/mermaid-diff-intel.sh >/dev/null 2>&1; then
    echo "FAIL: re-anchor blocked (diff intel failed)"
    exit 1
  fi
  now_utc=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  head_sha=$(git rev-parse HEAD)
  python3 - "$BASELINE_LOCK" "$head_sha" "$now_utc" <<'PY'
import json
import sys

path = sys.argv[1]
head_sha = sys.argv[2]
now_utc = sys.argv[3]

with open(path, "r", encoding="utf-8") as handle:
    data = json.load(handle)

prev = data.get("baseline_sha", "")
data["previous_baseline_sha"] = prev
data["baseline_sha"] = head_sha
data["date_utc"] = now_utc
data["lineage_update_reason"] = "V6 baseline re-anchor after amend/rebase"
data["lineage_verified"] = True

with open(path, "w", encoding="utf-8") as handle:
    json.dump(data, handle, indent=2)
    handle.write("\n")
PY
  mkdir -p "$LINEAGE_DIR"
  git hash-object "$BASELINE_LOCK" > "$BASELINE_HASH_PATH"

  mapfile -t baseline_info < <(read_baseline)
  BASELINE_SHA="${baseline_info[0]}"
  CANON_LIST="${baseline_info[1]}"
fi

if ! git merge-base --is-ancestor "$BASELINE_SHA" HEAD; then
  echo "FAIL: baseline sha is not an ancestor of HEAD (re-anchor required via official baseline update)"
  exit 1
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

if [[ ! -f "$BASELINE_HASH_PATH" ]]; then
  echo "FAIL: baseline hash evidence missing: $BASELINE_HASH_PATH"
  exit 1
fi

baseline_hash=$(git hash-object "$BASELINE_LOCK")
baseline_hash_evidence=$(cat "$BASELINE_HASH_PATH" 2>/dev/null || true)
if [[ -z "$baseline_hash_evidence" || "$baseline_hash" != "$baseline_hash_evidence" ]]; then
  echo "FAIL: baseline lock hash evidence mismatch"
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

if [[ ! -f "$STATUS_PATH" ]]; then
  echo "FAIL: Mermaid status report missing: $STATUS_PATH"
  exit 1
fi

status_baseline=$(rg -n "^\- Baseline SHA:" "$STATUS_PATH" | head -n 1 | awk -F": " '{print $2}')
if [[ -z "$status_baseline" || "$status_baseline" != "$BASELINE_SHA" ]]; then
  echo "FAIL: Mermaid status report baseline mismatch"
  exit 1
fi

echo "PASS: MERMAID_BASELINE_GUARD"
