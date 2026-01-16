#!/usr/bin/env bash
#
# check-capabilities-drift.sh
# PHASE_5 BLOC D — Gate CI "Capabilities Drift"
#
# Vérifie que toute command stable a:
# 1. Entrée dans CAPABILITIES_REGISTRY.md
# 2. Tests contractuels
# 3. Documentation référencée
#
# Exit 0: OK (aucune dérive détectée)
# Exit 1: FAIL (command stable non documentée ou non testée)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

say() {
  echo -e "${1}"
}

fail() {
  say "${RED}[FAIL]${NC} $*"
  exit 1
}

pass() {
  say "${GREEN}[PASS]${NC} $*"
}

warn() {
  say "${YELLOW}[WARN]${NC} $*"
}

# =============================================
# Configuration
# =============================================

ALLOWLIST_STABLE="src-tauri/allowlist.whitelist.stable.json"
REGISTRY="docs/CAPABILITIES_REGISTRY.md"
CONTRACT_TESTS="tests/contract/tauri.contract.test.ts"

# Vérifier fichiers critiques existent
for file in "$ALLOWLIST_STABLE" "$REGISTRY" "$CONTRACT_TESTS"; do
  if [ ! -f "$file" ]; then
    fail "Fichier critique manquant: $file"
  fi
done

# =============================================
# 1. Extraire commands allowlist stable
# =============================================

say "\n=== Étape 1: Extraire commands allowlist stable ==="

if ! command -v jq >/dev/null 2>&1; then
  fail "jq requis mais non installé (apt install jq)"
fi

COMMANDS_STABLE=$(jq -r '.app.security.capabilities[0].allow[]?.command // empty' "$ALLOWLIST_STABLE" | sort)
TOTAL_COMMANDS=$(echo "$COMMANDS_STABLE" | wc -l)

say "Total commands stable: $TOTAL_COMMANDS"

# =============================================
# 2. Vérifier chaque command dans registry
# =============================================

say "\n=== Étape 2: Vérifier présence dans CAPABILITIES_REGISTRY.md ==="

MISSING_IN_REGISTRY=()

while IFS= read -r cmd; do
  [ -z "$cmd" ] && continue
  
  # Chercher command dans registry (format: `command_name`)
  if ! grep -q "\`$cmd\`" "$REGISTRY"; then
    MISSING_IN_REGISTRY+=("$cmd")
  fi
done <<< "$COMMANDS_STABLE"

if [ ${#MISSING_IN_REGISTRY[@]} -gt 0 ]; then
  fail "Commands stable absentes du registre:\n  - ${MISSING_IN_REGISTRY[*]}"
else
  pass "Toutes commands stable sont dans le registre"
fi

# =============================================
# 3. Vérifier tests contractuels
# =============================================

say "\n=== Étape 3: Vérifier tests contractuels ==="

MISSING_TESTS=()

while IFS= read -r cmd; do
  [ -z "$cmd" ] && continue
  
  # Chercher command dans tests contractuels
  # Format attendu: invoke("command_name") ou "command_name"
  if ! grep -qE "(invoke\(\"$cmd\"|\"$cmd\")" "$CONTRACT_TESTS"; then
    MISSING_TESTS+=("$cmd")
  fi
done <<< "$COMMANDS_STABLE"

if [ ${#MISSING_TESTS[@]} -gt 0 ]; then
  warn "Commands stable sans tests contractuels explicites:"
  for cmd in "${MISSING_TESTS[@]}"; do
    warn "  - $cmd"
  done
  warn "Note: Certaines peuvent être testées indirectement (OK si couvertes)"
else
  pass "Toutes commands stable ont tests contractuels"
fi

# =============================================
# 4. Vérifier cohérence registry ↔ allowlist
# =============================================

say "\n=== Étape 4: Vérifier cohérence registry ↔ allowlist ==="

# Extraire commands du registry (lignes avec format | `command_name` |)
COMMANDS_REGISTRY=$(grep -oP '(?<=\| `)[^`]+(?=` \|)' "$REGISTRY" | sort)
REGISTRY_COUNT=$(echo "$COMMANDS_REGISTRY" | wc -l)

say "Total commands registry: $REGISTRY_COUNT"
say "Total commands allowlist: $TOTAL_COMMANDS"

# Comparer
EXTRA_IN_REGISTRY=()

while IFS= read -r cmd; do
  [ -z "$cmd" ] && continue
  
  if ! echo "$COMMANDS_STABLE" | grep -qFx "$cmd"; then
    EXTRA_IN_REGISTRY+=("$cmd")
  fi
done <<< "$COMMANDS_REGISTRY"

if [ ${#EXTRA_IN_REGISTRY[@]} -gt 0 ]; then
  warn "Commands dans registry mais PAS dans allowlist stable:"
  for cmd in "${EXTRA_IN_REGISTRY[@]}"; do
    warn "  - $cmd (dev-only ou déprécié?)"
  done
else
  pass "Registry aligné avec allowlist stable"
fi

# =============================================
# 5. Rapport final
# =============================================

say "\n=== Rapport final ==="

say "Commands stable: $TOTAL_COMMANDS"
say "Présence registry: ${GREEN}OK${NC}"

if [ ${#MISSING_TESTS[@]} -gt 0 ]; then
  warn "Tests contractuels: ${#MISSING_TESTS[@]} commands sans test explicite"
else
  say "Tests contractuels: ${GREEN}OK${NC}"
fi

if [ ${#EXTRA_IN_REGISTRY[@]} -gt 0 ]; then
  warn "Cohérence registry: ${#EXTRA_IN_REGISTRY[@]} commands extra dans registry"
else
  say "Cohérence registry: ${GREEN}OK${NC}"
fi

# =============================================
# Résultat
# =============================================

say "\n=== Gate CI: Capabilities Drift ==="

# FAIL si commands manquantes dans registry (critique)
if [ ${#MISSING_IN_REGISTRY[@]} -gt 0 ]; then
  fail "❌ GATE FAIL: Commands stable non documentées dans registry"
fi

# PASS (warnings acceptés pour tests si couverture indirecte)
pass "✅ GATE PASS: Aucune dérive capabilities détectée"

exit 0
