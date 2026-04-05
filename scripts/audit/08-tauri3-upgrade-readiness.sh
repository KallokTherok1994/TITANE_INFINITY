#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ Tauri 3 Upgrade Readiness
# Version: 29.0.0
# Description: Snapshot the current Tauri/GTK blocker lane before a future upgrade
#═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
IGNORE_FILE="${PROJECT_ROOT}/.github/copilot-xs/cargo-audit-ignores.txt"

BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() {
  echo -e "${CYAN}$1${NC}"
}

section() {
  echo
  echo -e "${BLUE}== $1 ==${NC}"
}

cd "$PROJECT_ROOT"

PKG_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
TAURI_API=$(node -p "require('./package.json').dependencies['@tauri-apps/api']" 2>/dev/null || echo "unknown")
TAURI_CLI=$(node -p "(require('./package.json').devDependencies || {})['@tauri-apps/cli'] || (require('./package.json').dependencies || {})['@tauri-apps/cli'] || 'unknown'" 2>/dev/null || echo "unknown")
CARGO_TAURI=$(grep -oP '^tauri\s*=\s*\{[^}]*version\s*=\s*"\K[^"]+' src-tauri/Cargo.toml | head -1 || echo "unknown")
CARGO_TAURI_BUILD=$(grep -oP '^tauri-build\s*=\s*\{[^}]*version\s*=\s*"\K[^"]+' src-tauri/Cargo.toml | head -1 || echo "unknown")
IGNORE_COUNT=$(grep -vcE '^\s*(#|$)' "$IGNORE_FILE" 2>/dev/null || echo "0")

info "TITANE∞ — Tauri 3 upgrade readiness snapshot"
section "Current versions"
echo "package.json version        : $PKG_VERSION"
echo "@tauri-apps/api            : $TAURI_API"
echo "@tauri-apps/cli            : $TAURI_CLI"
echo "src-tauri tauri            : $CARGO_TAURI"
echo "src-tauri tauri-build      : $CARGO_TAURI_BUILD"

section "Known audit baseline"
echo "Ignored advisory IDs       : $IGNORE_COUNT"
echo "Ignore file                : .github/copilot-xs/cargo-audit-ignores.txt"

section "Live cargo audit summary"
AUDIT_OUTPUT=$(cd src-tauri && cargo audit 2>/dev/null || true)
printf '%s\n' "$AUDIT_OUTPUT" | grep -E 'allowed warnings found|warning:' | tail -n 3 || true

section "Key Linux GTK/WebKit chain"
(cd src-tauri && cargo tree -i gtk --depth 4 2>/dev/null | head -n 12) || true
echo
(cd src-tauri && cargo tree -i webkit2gtk --depth 3 2>/dev/null | head -n 12) || true

section "Recommended gates after any future upgrade"
echo "pnpm run check"
echo "pnpm run lint"
echo "pnpm run format:check"
echo "pnpm run test:100"
echo "pnpm run test:rust"
echo "cd src-tauri && cargo audit"
echo

echo -e "${GREEN}DONE${NC}: readiness snapshot generated"
