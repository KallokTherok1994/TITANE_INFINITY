#!/usr/bin/env bash
# scripts/proofpack_init.sh — Initialize a new proof pack for a session
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/proofpack_init.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATES_DIR="${ROOT}/templates/proof_pack"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
SESSION_ID="${SESSION_ID:-session_${TIMESTAMP}}"
PACK_DIR="${PROOF_PACKS_DIR:-${ROOT}/proof_packs}/${SESSION_ID}"

echo "======================================================================"
echo " proofpack_init.sh — Initializing proof pack: $SESSION_ID"
echo "======================================================================"

mkdir -p "${PACK_DIR}/PHASES"

# Copy templates
for tmpl in "${TEMPLATES_DIR}"/*.md; do
  [[ -f "$tmpl" ]] || continue
  name="$(basename "$tmpl")"
  if [[ ! -f "${PACK_DIR}/${name}" ]]; then
    cp "$tmpl" "${PACK_DIR}/${name}"
    echo "  + ${name}"
  fi
done

for tmpl in "${TEMPLATES_DIR}/PHASES"/*.md; do
  [[ -f "$tmpl" ]] || continue
  name="$(basename "$tmpl")"
  if [[ ! -f "${PACK_DIR}/PHASES/${name}" ]]; then
    cp "$tmpl" "${PACK_DIR}/PHASES/${name}"
    echo "  + PHASES/${name}"
  fi
done

# Write init marker
printf '{"ts":"%s","event":"proofpack_init","session_id":"%s","pack_dir":"%s"}\n' \
  "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$SESSION_ID" "$PACK_DIR" \
  >> "${PACK_DIR}/run.jsonl"

echo ""
echo "Proof pack initialized at: ${PACK_DIR}"
echo "SESSION_ID=${SESSION_ID}"
exit 0
