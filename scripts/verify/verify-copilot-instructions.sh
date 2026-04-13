#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
source "$(dirname "${BASH_SOURCE[0]}")/_rg_compat.sh"

FAIL=0

# Portable search: prefer rg (ripgrep) if available, fall back to grep
_search_qi() {
  local pattern="$1"; shift
  if command -v rg >/dev/null 2>&1; then
    rg -qi "$pattern" "$@"
  else
    grep -RiqE "$pattern" "$@"
  fi
}

_search_ni() {
  local pattern="$1"; shift
  if command -v rg >/dev/null 2>&1; then
    rg -n -i "$pattern" "$@"
  else
    grep -RInE "$pattern" "$@"
  fi
}

REQUIRED_FILES=(
  .github/copilot-instructions.md
  .github/instructions/tauri.instructions.md
  .github/instructions/frontend.instructions.md
  .github/instructions/tests-e2e.instructions.md
  .github/instructions/docs-registry.instructions.md
)

INSTRUCTION_FILES=(
  .github/copilot-instructions.md
  .github/instructions/tauri.instructions.md
  .github/instructions/frontend.instructions.md
  .github/instructions/tests-e2e.instructions.md
  .github/instructions/docs-registry.instructions.md
)

REQUIRED_PATTERNS=(
  "Local-first"
  "Tauri-only"
  "4-Ring"
  "allowlist|capabilities"
  "Stop-the-line"
  "diagnose -> plan -> apply -> verify -> report"
  "BUILD ALL"
  "on demand|on-demand"
)

FORBIDDEN_PATTERNS=(
  "start a server"
  "deploy automatically"
  "I will do it later"
  "je le ferai plus tard"
  "always perfect"
  "100% guaranteed"
)

SECTION_PATTERNS=(
  "Invariants"
  "DO"
  "DONT"
  "Preuves"
  "Gates"
  "Rollback"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "FAIL: missing required file: $file"
    FAIL=1
  fi
done

if [[ -d .github/instructions ]]; then
  for file in "${REQUIRED_FILES[@]:1}"; do
    if [[ ! -f "$file" ]]; then
      echo "FAIL: missing scoped instruction: $file"
      FAIL=1
    fi
  done
fi

for pattern in "${REQUIRED_PATTERNS[@]}"; do
  if ! _search_qi "$pattern" .github/copilot-instructions.md; then
    echo "FAIL: missing pattern in copilot-instructions: $pattern"
    FAIL=1
  fi
done

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  if _search_ni "$pattern" "${INSTRUCTION_FILES[@]}"; then
    echo "FAIL: forbidden pattern detected: $pattern"
    FAIL=1
  fi
done

for file in "${INSTRUCTION_FILES[@]:1}"; do
  for pattern in "${SECTION_PATTERNS[@]}"; do
    if ! _search_qi "$pattern" "$file"; then
      echo "FAIL: missing section '$pattern' in $file"
      FAIL=1
    fi
  done
done

if [[ "$FAIL" -ne 0 ]]; then
  echo "FAIL: verify-copilot-instructions"
  exit 1
fi

echo "PASS: verify-copilot-instructions"
