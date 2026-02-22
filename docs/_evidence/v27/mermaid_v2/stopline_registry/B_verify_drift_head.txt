#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0
WARN=0

SOURCE_DIR="docs/diagrams/sources"
NETWORK_MMD="$SOURCE_DIR/network_surface_online_first.mmd"
RINGS_MMD="$SOURCE_DIR/architecture_4_ring.mmd"
REGISTRY_PATH="docs/diagrams/MERMAID_HASH_REGISTRY.json"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "FAIL: missing Mermaid sources directory: $SOURCE_DIR"
  exit 1
fi

shopt -s nullglob
sources=("$SOURCE_DIR"/*.mmd)
shopt -u nullglob

if [[ ${#sources[@]} -eq 0 ]]; then
  echo "FAIL: no Mermaid sources found"
  exit 1
fi

if [[ ! -f "$NETWORK_MMD" ]]; then
  echo "FAIL: missing network surface diagram: $NETWORK_MMD"
  FAIL=1
fi

if [[ ! -f "$RINGS_MMD" ]]; then
  echo "FAIL: missing rings diagram: $RINGS_MMD"
  FAIL=1
fi

# Drift 1 - 4-Ring directories
has_types=0
has_engines=0
has_services=0
has_modules=0
has_ui=0

[[ -d "src/types" ]] && has_types=1
[[ -d "src/engines" ]] && has_engines=1
[[ -d "src/services" ]] && has_services=1
[[ -d "src/modules" ]] && has_modules=1
[[ -d "src/ui" ]] && has_ui=1

[[ "$has_types" -eq 0 ]] && echo "WARN: missing ring directory src/types" && WARN=1
[[ "$has_engines" -eq 0 ]] && echo "WARN: missing ring directory src/engines" && WARN=1
[[ "$has_services" -eq 0 ]] && echo "WARN: missing ring directory src/services" && WARN=1
if [[ "$has_modules" -eq 0 && "$has_ui" -eq 0 ]]; then
  echo "WARN: missing ring directory src/modules or src/ui"
  WARN=1
fi

if [[ -f "$RINGS_MMD" ]]; then
  if rg -q "Ring 1: Types" "$RINGS_MMD" && [[ "$has_types" -eq 0 ]]; then
    echo "FAIL: diagram mentions Ring 1 Types but src/types missing"
    FAIL=1
  fi
  if rg -q "Ring 2: Engines" "$RINGS_MMD" && [[ "$has_engines" -eq 0 ]]; then
    echo "FAIL: diagram mentions Ring 2 Engines but src/engines missing"
    FAIL=1
  fi
  if rg -q "Ring 3: Services" "$RINGS_MMD" && [[ "$has_services" -eq 0 ]]; then
    echo "FAIL: diagram mentions Ring 3 Services but src/services missing"
    FAIL=1
  fi
  if rg -q "Ring 4: Modules / UI" "$RINGS_MMD"; then
    if [[ "$has_modules" -eq 0 && "$has_ui" -eq 0 ]]; then
      echo "FAIL: diagram mentions Ring 4 Modules/UI but src/modules and src/ui missing"
      FAIL=1
    fi
  fi
fi

# Drift 2 - Network surface sync
api_matches=$(rg -n "/api/" src || true)
fetch_matches=$(rg -n "fetch\\(" src || true)
axios_matches=$(rg -n "axios" src || true)

if [[ -n "$api_matches" ]]; then
  if ! rg -q "/api/\\*" "$NETWORK_MMD" && ! rg -q "/api/" "$NETWORK_MMD"; then
    echo "FAIL: /api/ endpoints detected in src but not referenced in network surface diagram"
    FAIL=1
  else
    if ! rg -q "/api/\\*" "$NETWORK_MMD"; then
      api_paths=$(rg -o "/api/[^\"'[:space:]]+" src | sort -u || true)
      for path in $api_paths; do
        if ! rg -q "$path" "$NETWORK_MMD"; then
          echo "FAIL: endpoint not represented in network surface diagram: $path"
          FAIL=1
        fi
      done
    fi
  fi
fi

if [[ -n "$fetch_matches" || -n "$axios_matches" ]]; then
  if ! rg -q "EXTERNAL" "$NETWORK_MMD"; then
    echo "FAIL: network calls detected but EXTERNAL not documented in network surface diagram"
    FAIL=1
  fi
fi

echo "CHECK: Network surface sync complete"

# Drift 3 - Mermaid hash registry (append-only)
mkdir -p "$(dirname "$REGISTRY_PATH")"

hash_tmp=$(mktemp)
for source in "${sources[@]}"; do
  sha256sum "$source" >> "$hash_tmp"
done

if ! python3 - "$REGISTRY_PATH" "$hash_tmp" <<'PY'
import json
import os
import sys
import time

registry_path = sys.argv[1]
hash_path = sys.argv[2]

current = {}
with open(hash_path, "r", encoding="utf-8") as handle:
    for line in handle:
        if not line.strip():
            continue
        digest, file_path = line.strip().split(maxsplit=1)
        current[file_path] = digest

if os.path.exists(registry_path):
    with open(registry_path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
else:
    data = {"entries": []}

entries = data.get("entries", [])
known_files = {e.get("file") for e in entries if isinstance(e, dict)}
missing = sorted(f for f in known_files if f not in current)
if missing:
    print("FAIL: hash registry references missing files: " + ", ".join(missing))
    sys.exit(2)

latest = {}
for entry in entries:
    file_name = entry.get("file")
    digest = entry.get("sha256")
    if file_name and digest:
        latest[file_name] = digest

now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
for file_name, digest in current.items():
    if latest.get(file_name) != digest:
        entries.append({"timestamp": now, "file": file_name, "sha256": digest})

with open(registry_path, "w", encoding="utf-8") as handle:
    json.dump({"entries": entries}, handle, indent=2)

print("HASH_REGISTRY_UPDATED")
PY
then
  echo "FAIL: unable to update Mermaid hash registry"
  FAIL=1
fi

rm -f "$hash_tmp"

if [[ "$FAIL" -ne 0 ]]; then
  echo "FAIL: MERMAID_DRIFT_DETECTION"
  exit 1
fi

echo "PASS: MERMAID_DRIFT_DETECTION"
