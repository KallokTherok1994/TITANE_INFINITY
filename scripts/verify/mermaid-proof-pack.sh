#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

STAMP=$(date -u +"%Y%m%dT%H%M%SZ")
PACK_DIR="docs/_evidence/v27/mermaid_v4/proof_pack_${STAMP}"
ALLOWLIST="docs/diagrams/DRIFT_ALLOWLIST.txt"

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

run_capture "git_status" "$PACK_DIR/git_status.txt" bash -c 'git status --porcelain=v1 -b'
run_capture "git_head" "$PACK_DIR/git_head.txt" bash -c 'git rev-parse HEAD'

run_capture "render" "$PACK_DIR/render.txt" bash -c 'pnpm run render:docs:mermaid'

for i in 1 2 3; do
  run_capture "verify_${i}" "$PACK_DIR/verify_${i}.txt" bash -c 'pnpm run verify:docs:mermaid'
done

run_capture "registry_check" "$PACK_DIR/registry_check.txt" bash -c 'bash scripts/verify/mermaid-hash-registry.sh --check'
run_capture "drift_strict" "$PACK_DIR/drift.txt" bash -c "bash scripts/verify/verify-mermaid-drift.sh --strict --allowlist ${ALLOWLIST} --report ${PACK_DIR}/drift_report.md"

run_capture "git_diff_names" "$PACK_DIR/diff_names.txt" bash -c 'git diff --name-only'
run_capture "git_diff_stat" "$PACK_DIR/diff_stat.txt" bash -c 'git diff --stat'

RESULT="PASS"
if [[ "$FAIL" -ne 0 ]]; then
  RESULT="FAIL"
fi

cat > "$PACK_DIR/VERDICT.md" <<EOF
# Mermaid Proof Pack Verdict

- Resultat: $RESULT
- Timestamp (UTC): $STAMP
- Pack: $PACK_DIR
EOF

cat > "$PACK_DIR/ROLLBACK.md" <<EOF
# Mermaid Proof Pack Rollback

- git revert HEAD
EOF

echo "PROOF_PACK_PATH: $PACK_DIR"
ls -1 "$PACK_DIR"

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
