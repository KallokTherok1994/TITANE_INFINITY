#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

FAIL=0

REQUIRED_FILES=(
  "docs/standards/MERMAID_STANDARDS.md"
  "docs/diagrams/CANON_INDEX.md"
  "docs/diagrams/sources/architecture_4_ring.mmd"
  "docs/diagrams/sources/data_flow_chat.mmd"
  "docs/diagrams/sources/omega_pipeline_v2.mmd"
  "docs/diagrams/sources/certification_gates.mmd"
  "docs/diagrams/sources/network_surface_online_first.mmd"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "FAIL: missing required file: $file"
    FAIL=1
  fi
done

RENDER_REQUIRED=(
  "docs/diagrams/rendered/architecture_4_ring.md"
  "docs/diagrams/rendered/data_flow_chat.md"
  "docs/diagrams/rendered/omega_pipeline_v2.md"
  "docs/diagrams/rendered/certification_gates.md"
  "docs/diagrams/rendered/network_surface_online_first.md"
)

NEED_SYNC=0
for file in "${RENDER_REQUIRED[@]}"; do
  if [[ ! -f "$file" ]]; then
    NEED_SYNC=1
    break
  fi
done

if [[ "$NEED_SYNC" -eq 1 ]]; then
  if ! bash scripts/verify/mermaid-render-sync.sh; then
    echo "FAIL: unable to generate rendered Mermaid files"
    FAIL=1
  fi
fi

for file in "${RENDER_REQUIRED[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "FAIL: missing rendered file after sync: $file"
    FAIL=1
  fi
done

for rendered in docs/diagrams/rendered/*.md; do
  if [[ ! -f "$rendered" ]]; then
    continue
  fi

  if ! awk '
    BEGIN { in_block=0; open_count=0; close_count=0; nested=0 }
    /^```mermaid[[:space:]]*$/ {
      if (in_block == 1) nested=1
      in_block=1
      open_count++
      next
    }
    /^```[[:space:]]*$/ {
      if (in_block == 1) {
        in_block=0
        close_count++
      }
      next
    }
    END {
      if (nested == 1 || in_block == 1 || open_count != close_count || open_count < 1) {
        exit 1
      }
    }
  ' "$rendered"; then
    echo "FAIL: invalid mermaid fences in $rendered"
    FAIL=1
  fi

  if ! awk '
    BEGIN { in_block=0; bad=0 }
    /^```mermaid[[:space:]]*$/ { in_block=1; next }
    /^```[[:space:]]*$/ { if (in_block==1) in_block=0; next }
    {
      if (in_block==1 && $0 ~ /http:\/\//) bad=1
      if (in_block==1 && $0 ~ /https:\/\//) bad=1
    }
    END { if (bad==1) exit 1 }
  ' "$rendered"; then
    echo "FAIL: forbidden URL (http/https) in Mermaid block: $rendered"
    FAIL=1
  fi
done

NETWORK_FILE="docs/diagrams/sources/network_surface_online_first.mmd"
if [[ -f "$NETWORK_FILE" ]]; then
  if ! rg -q '/api/|/api/\*' "$NETWORK_FILE"; then
    echo "FAIL: missing /api/ mention in $NETWORK_FILE"
    FAIL=1
  fi
  if ! rg -q 'INTERNAL|EXTERNAL' "$NETWORK_FILE"; then
    echo "FAIL: missing INTERNAL/EXTERNAL tags in $NETWORK_FILE"
    FAIL=1
  fi
fi

for source in docs/diagrams/sources/*.mmd; do
  if [[ ! -f "$source" ]]; then
    continue
  fi
  edge_count=$(grep -oE -- '-->|==>|---|\.\.>|=>' "$source" | wc -l | tr -d ' ')
  if [[ "$edge_count" -gt 30 ]]; then
    echo "FAIL: complexity > 30 links in $source (count=$edge_count)"
    FAIL=1
  fi
done

if rg -n 'http://|https://' docs/diagrams/sources/*.mmd >/dev/null 2>&1; then
  echo "FAIL: forbidden URL (http/https) in Mermaid source"
  rg -n 'http://|https://' docs/diagrams/sources/*.mmd || true
  FAIL=1
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "FAIL: verify-mermaid-diagrams"
  exit 1
fi

echo "PASS: verify-mermaid-diagrams"
