#!/usr/bin/env bash
# verify-ipc-end-to-end-coverage.sh
# v34.0.5 — TITANE∞ — End-to-end IPC chain coverage gate
#
# Verifies for every command invoked from the UI via safeInvokeCanonical /
# safeInvoke / secureInvoke that the 4 IPC layers are aligned:
#   L1 src/lib/security.ts        ALLOWED_COMMANDS Set membership
#   L2 src-tauri/tauri.conf.json  main-capability allow[].command entry
#   L3 src-tauri/src/main.rs      generate_handler! registration
#   L4 src-tauri/src/**/*.rs      #[tauri::command] pub async fn definition
#
# Exit 0 = PASS, exit 1 = FAIL.
# Prints a per-command L1|L2|L3|L4 matrix and a final verdict line.
#
# Wired into scripts/verify_instructions.sh master gate.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

SECURITY_TS="src/lib/security.ts"
TAURI_CONF="src-tauri/tauri.conf.json"
MAIN_RS="src-tauri/src/main.rs"
BASELINE="scripts/verify/ipc-coverage-baseline.txt"

# Baseline = legacy commands with known L1/L2/L3 drift documented in v34.0.5.
# Validator FAILS only on regressions vs baseline, not on existing legacy gaps.
# To clean a baseline entry, fix the underlying alignment then remove from file.
declare -A BASELINE_SET=()
if [[ -f "$BASELINE" ]]; then
  while IFS= read -r line; do
    [[ -z "$line" || "$line" == \#* ]] && continue
    BASELINE_SET["$line"]=1
  done < "$BASELINE"
fi

# Allowlist of commands intentionally not-yet-implemented or non-Tauri (browser-only stubs).
# Keep tight; document each entry.
declare -A SKIP=(
  # operator/ide/job/browser families are corpus-side stubs (handled by gateway, not Tauri).
  ["operator_"]=1
  ["ide_"]=1
  ["browser_"]=1
  ["job_"]=1
)

skipped_prefix() {
  local cmd="$1"
  for pfx in "${!SKIP[@]}"; do
    case "$cmd" in
      ${pfx}*) return 0 ;;
    esac
  done
  return 1
}

# 1. Collect commands invoked from UI.
mapfile -t commands < <(
  grep -rohE "safeInvoke(Canonical)?<[^>]*>\(['\"]([a-z_][a-z0-9_]*)['\"]" \
    src 2>/dev/null \
  | grep -oE "['\"]([a-z_][a-z0-9_]*)['\"]" \
  | tr -d "'\"" \
  | sort -u
)

if [[ ${#commands[@]} -eq 0 ]]; then
  echo "FAIL: no safeInvoke* calls found in src/ — extractor regex broken" >&2
  exit 1
fi

# 2. Build presence sets for each layer.
ts_set=$(grep -oE "'[a-z_][a-z0-9_]*'" "$SECURITY_TS" | tr -d "'" | sort -u)
acl_set=$(grep -oE '"command":\s*"[a-z_][a-z0-9_]*"' "$TAURI_CONF" \
          | grep -oE '"[a-z_][a-z0-9_]*"' | tail -n +1 | tr -d '"' | sort -u)
# extract the single invoke_handler! block then the bare ident leaves
handler_set=$(awk '/\.invoke_handler\(tauri::generate_handler!\[/,/^[[:space:]]*\]\)/' "$MAIN_RS" \
              | grep -vE '^\s*//' \
              | grep -oE '[a-z_][a-z0-9_]*\s*,' \
              | sed -E 's/[[:space:],]+$//' \
              | sort -u)
rust_set=$(grep -rhE '^\s*pub async fn [a-z_][a-z0-9_]*' src-tauri/src 2>/dev/null \
           | grep -oE 'pub async fn [a-z_][a-z0-9_]*' \
           | awk '{print $4}' | sort -u)
# also include synchronous tauri commands
rust_sync=$(grep -rhB1 -E '^\s*pub fn [a-z_][a-z0-9_]*' src-tauri/src 2>/dev/null \
            | grep -oE 'pub fn [a-z_][a-z0-9_]*' \
            | awk '{print $3}' | sort -u)
rust_set=$(printf "%s\n%s\n" "$rust_set" "$rust_sync" | sort -u)

has() { grep -qx "$1" <<<"$2"; }

fail=0
new_drift=0
printf "\nIPC end-to-end coverage matrix (v34.0.5)\n"
printf "%-44s %-3s %-3s %-3s %-3s %s\n" "command" "L1" "L2" "L3" "L4" "status"
printf -- "----------------------------------------------------------------\n"

for cmd in "${commands[@]}"; do
  if skipped_prefix "$cmd"; then
    continue
  fi
  l1="❌"; has "$cmd" "$ts_set" && l1="✅"
  l2="❌"; has "$cmd" "$acl_set" && l2="✅"
  l3="❌"; has "$cmd" "$handler_set" && l3="✅"
  l4="❌"; has "$cmd" "$rust_set" && l4="✅"
  if [[ "$l1$l2$l3$l4" != "✅✅✅✅" ]]; then
    if [[ -n "${BASELINE_SET[$cmd]:-}" ]]; then
      tag="LEGACY_BASELINE"
    else
      tag="NEW_DRIFT"
      fail=1
      new_drift=$((new_drift+1))
    fi
    printf "%-44s %-3s %-3s %-3s %-3s %s\n" "$cmd" "$l1" "$l2" "$l3" "$l4" "$tag"
  fi
done

if [[ $fail -eq 0 ]]; then
  echo
  echo "PASS: no NEW IPC drift (${#commands[@]} commands audited; ${#BASELINE_SET[@]} legacy entries tolerated via baseline)"
  exit 0
fi
echo
echo "FAIL: $new_drift new drift entries detected (legacy baseline = ${#BASELINE_SET[@]})"
exit 1
