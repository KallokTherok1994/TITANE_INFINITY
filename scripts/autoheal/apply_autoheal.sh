#!/usr/bin/env bash
set -euo pipefail

REGISTRY="scripts/autoheal/autoheal_rules.jsonl"

if [[ ! -f "$REGISTRY" ]]; then
  echo "FAIL: missing $REGISTRY" >&2
  exit 1
fi

if [[ "${1:-}" == "--template" ]]; then
  cat <<'JSON'
{"id":"AH-YYYY-MM-DD-XXXX","date":"YYYY-MM-DD","scope":["docs"],"symptom":"...","root_cause":"...","fix":"...","prevention_test":"...","commands":["..."],"files_changed":["..."],"rollback":"git restore -- ..."}
JSON
  exit 0
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: bash scripts/autoheal/apply_autoheal.sh '<jsonl-entry>'" >&2
  echo "Tip: use --template" >&2
  exit 2
fi

ENTRY="$1"

echo "$ENTRY" | node -e 'const fs=require("fs"); const s=fs.readFileSync(0,"utf8").trim(); const j=JSON.parse(s); const req=["id","date","scope","symptom","root_cause","fix","prevention_test","commands","files_changed","rollback"]; const miss=req.filter(k=>j[k]===undefined||j[k]===null||(typeof j[k]==="string"&&!j[k].trim())||(Array.isArray(j[k])&&j[k].length===0)); if(miss.length){console.error("FAIL: missing fields: "+miss.join(", ")); process.exit(1);} console.log("PASS: entry-valid");'

printf '%s\n' "$ENTRY" >> "$REGISTRY"
echo "PASS: appended to $REGISTRY"
