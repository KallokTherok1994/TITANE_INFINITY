#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ — P3 CERTIFICATION RUNNER
# Exécute test E2E x3 + collecte preuves + génère rapport
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EVIDENCE_DIR="$ROOT_DIR/docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_$TIMESTAMP"
LOG_FILE="$EVIDENCE_DIR/EXECUTION.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════════
# Setup
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TITANE∞ — P3 CERTIFICATION — AUTO VALIDATION 100%${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Evidence directory: $EVIDENCE_DIR"
echo ""

# Créer dossier evidence
mkdir -p "$EVIDENCE_DIR"

# ═══════════════════════════════════════════════════════════════════════════════
# Phase 1: Vérifier prérequis
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${YELLOW}[P3.1]${NC} Vérification prérequis..."

cd "$ROOT_DIR"

# Vérifier que le test existe
if [[ ! -f "e2e/chat-provider-decision-certification.spec.ts" ]]; then
  echo -e "${RED}✗ BLOCKED${NC}: Test certification non trouvé"
  exit 2
fi

# Vérifier Playwright installé
if ! command -v pnpm &>/dev/null; then
  echo -e "${RED}✗ BLOCKED${NC}: pnpm non installé"
  exit 2
fi

# Vérifier playwright binaries
if [[ ! -d "node_modules/@playwright/test" ]]; then
  echo -e "${YELLOW}⚠ Playwright non installé. Installation...${NC}"
  pnpm install --frozen-lockfile || {
    echo -e "${RED}✗ BLOCKED${NC}: Installation dépendances échouée"
    exit 2
  }
fi

echo -e "${GREEN}✓ Prérequis OK${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Phase 2: Vérifier dev server
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${YELLOW}[P3.2]${NC} Vérification dev server..."

DEV_SERVER_RUNNING=false
if curl -s --max-time 2 http://127.0.0.1:5173 >/dev/null 2>&1; then
  DEV_SERVER_RUNNING=true
  echo -e "${GREEN}✓ Dev server déjà actif sur port 5173${NC}"
else
  echo -e "${YELLOW}⚠ Dev server non détecté${NC}"
  echo "NOTE: Test peut échouer si dev server non lancé"
  echo "      Pour lancer manuellement: pnpm run dev"
  echo ""
  echo "Continuer sans dev server? (y/N): "
  read -r CONTINUE
  if [[ "$CONTINUE" != "y" && "$CONTINUE" != "Y" ]]; then
    echo -e "${RED}✗ ABORT${NC}: Dev server requis"
    exit 2
  fi
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Phase 3: Exécuter test Playwright x3
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${YELLOW}[P3.3]${NC} Exécution test certification E2E x3..."
echo ""

# Créer fichier log
exec > >(tee -a "$LOG_FILE") 2>&1

echo "Test start: $(date --iso-8601=seconds)"
echo "Working directory: $ROOT_DIR"
echo "Test file: e2e/chat-provider-decision-certification.spec.ts"
echo ""

# Exécuter Playwright test
TEST_EXIT_CODE=0
pnpm exec playwright test e2e/chat-provider-decision-certification.spec.ts \
  --reporter=list \
  --timeout=60000 \
  --retries=0 || TEST_EXIT_CODE=$?

echo ""
echo "Test end: $(date --iso-8601=seconds)"
echo "Exit code: $TEST_EXIT_CODE"

# ═══════════════════════════════════════════════════════════════════════════════
# Phase 4: Analyser résultats
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}[P3.4]${NC} Analyse résultats..."

# Copier rapport HTML si disponible
if [[ -d "playwright-report" ]]; then
  cp -r playwright-report "$EVIDENCE_DIR/" 2>/dev/null || true
  echo "✓ Playwright report copié"
fi

# Copier test results si disponibles
if [[ -d "test-results" ]]; then
  cp -r test-results "$EVIDENCE_DIR/" 2>/dev/null || true
  echo "✓ Test results copiés"
fi

# Parser logs pour extraire assertions
grep -E "\[CONV_SEND\]|\[CONV_RECV\]|\[A[0-9]+\]|\[INVARIANT\]|✅|✗" "$LOG_FILE" > "$EVIDENCE_DIR/ASSERTIONS_SUMMARY.log" 2>/dev/null || true

# Compter passes/failures
PASS_COUNT=$(grep -c "✅" "$LOG_FILE" 2>/dev/null || echo "0")
FAIL_COUNT=$(grep -c "expected.*to" "$LOG_FILE" 2>/dev/null || echo "0")

echo ""
echo "Résultats:"
echo "  - Tests passés: $PASS_COUNT assertions"
echo "  - Tests échoués: $FAIL_COUNT assertions"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Phase 5: Verdict
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${YELLOW}[P3.5]${NC} Génération verdict..."
echo ""

VERDICT_FILE="$EVIDENCE_DIR/VERDICT_P3_EXEC.md"

cat > "$VERDICT_FILE" <<EOF
# P3 CERTIFICATION — VERDICT EXÉCUTION

**Date**: $(date --iso-8601=seconds)  
**Test**: e2e/chat-provider-decision-certification.spec.ts  
**Runs**: 3 (CERT-1, CERT-2, CERT-3)  
**Exit Code**: $TEST_EXIT_CODE

## Résultats

- **Assertions passed**: $PASS_COUNT
- **Assertions failed**: $FAIL_COUNT
- **Dev server**: $(if $DEV_SERVER_RUNNING; then echo "Running"; else echo "Not running"; fi)

## Verdict

EOF

if [[ $TEST_EXIT_CODE -eq 0 ]]; then
  echo "**PASS**: ✅ Tous les tests ont réussi" >> "$VERDICT_FILE"
  echo ""
  echo -e "${GREEN}════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✅ VERDICT: PASS${NC}"
  echo -e "${GREEN}════════════════════════════════════════════${NC}"
  echo ""
  echo "Evidence pack: $EVIDENCE_DIR"
  echo ""
  EXIT_CODE=0
else
  echo "**FAIL**: ✗ Un ou plusieurs tests ont échoué" >> "$VERDICT_FILE"
  echo ""
  echo "Voir logs détaillés dans: $LOG_FILE"
  echo ""
  echo -e "${RED}════════════════════════════════════════════${NC}"
  echo -e "${RED}  ✗ VERDICT: FAIL${NC}"
  echo -e "${RED}════════════════════════════════════════════${NC}"
  echo ""
  echo "Evidence pack: $EVIDENCE_DIR"
  echo "Logs: $LOG_FILE"
  echo ""
  EXIT_CODE=1
fi

cat >> "$VERDICT_FILE" <<EOF

## Evidence Pack

Location: \`$EVIDENCE_DIR\`

Contenu:
- EXECUTION.log (full test output)
- ASSERTIONS_SUMMARY.log (filtered assertions)
- playwright-report/ (HTML report)
- test-results/ (screenshots, traces)

## Next Steps

EOF

if [[ $TEST_EXIT_CODE -eq 0 ]]; then
  cat >> "$VERDICT_FILE" <<EOF
1. ✅ Tests E2E passés x3
2. Créer proof pack P3 complet (BASELINE, detailed analysis, VERDICT_P3)
3. Créer gate G4 (bloquer si proof pack absent)
4. Commit P3 qualification
5. Transformer PASS QUALIFIÉ → PASS CERTIFIÉ

**Status**: READY FOR P3.4 (Proof Pack Creation)
EOF
else
  cat >> "$VERDICT_FILE" <<EOF
1. ✗ Analyser logs:
   - $LOG_FILE
   - $EVIDENCE_DIR/ASSERTIONS_SUMMARY.log
2. Identifier cause racine (dev server down? UI changed? logs format?)
3. Corriger problème OU documenter BLOCKED
4. Re-exécuter certification runner

**Status**: BLOCKED — Analyse requise
EOF
fi

echo ""
echo "Verdict complet: $VERDICT_FILE"
echo ""

exit $EXIT_CODE
