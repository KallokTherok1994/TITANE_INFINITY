#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

export TITANE_BINARY_POLICY_ENFORCE=1

echo "[verify-native-binary-freshness] root=$ROOT_DIR"
echo "[verify-native-binary-freshness] mode=${TITANE_NATIVE_BINARY_MODE:-release-default}"

POLICY_JSON="$(node scripts/e2e/native-binary-policy.cjs || true)"
echo "$POLICY_JSON"

if echo "$POLICY_JSON" | rg -q '"shouldBlock"\s*:\s*true'; then
  echo "[verify-native-binary-freshness] VERDICT=FAIL"
  exit 1
fi

if ! echo "$POLICY_JSON" | rg -q '"selectedBinaryPath"\s*:\s*".+'; then
  echo "[verify-native-binary-freshness] VERDICT=FAIL (selectedBinaryPath missing)"
  exit 1
fi

if ! echo "$POLICY_JSON" | rg -q '"freshnessClass"\s*:\s*"FRESH_'; then
  echo "[verify-native-binary-freshness] VERDICT=FAIL (freshnessClass is not fresh)"
  exit 1
fi

echo "[verify-native-binary-freshness] VERDICT=PASS"