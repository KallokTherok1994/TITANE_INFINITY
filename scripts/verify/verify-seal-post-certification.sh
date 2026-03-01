#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

echo "🔐 VERIFY: seal proof packs require post-certification sections"

shopt -s nullglob
packs=(proof_packs/RC_SEAL_*)
shopt -u nullglob

if [[ ${#packs[@]} -eq 0 ]]; then
  echo "ℹ️ N/A: no RC_SEAL proof pack found"
  exit 0
fi

fail=0

for pack in "${packs[@]}"; do
  [[ -d "$pack" ]] || continue

  seal_summary="$pack/13_SEAL_SUMMARY.md"
  verdict_file="$pack/14_VERDICT_RC.md"

  if [[ ! -f "$seal_summary" ]]; then
    echo "❌ FAIL: missing $seal_summary"
    fail=1
    continue
  fi

  if [[ ! -f "$verdict_file" ]]; then
    echo "❌ FAIL: missing $verdict_file"
    fail=1
    continue
  fi

  if ! rg -q '^## Post-certification \(append-only\)' "$seal_summary"; then
    echo "❌ FAIL: missing 'Post-certification (append-only)' in $seal_summary"
    fail=1
  fi

  if ! rg -q '^## Confirmation post-seal \(append-only\)' "$verdict_file"; then
    echo "❌ FAIL: missing 'Confirmation post-seal (append-only)' in $verdict_file"
    fail=1
  fi
done

if [[ $fail -ne 0 ]]; then
  echo "❌ VERIFY FAIL: post-certification sections are mandatory for RC seal proof packs"
  exit 1
fi

echo "✅ VERIFY PASS: post-certification sections present in RC seal proof packs"
