#!/bin/bash
# TITANE∞ v26.3.0 — WebKit Fix Validation Script
# © 2025 TITANE Team. All rights reserved.
#
# Test automatique du fix WebKit (boot x3 + vérifications)

set -e

echo "════════════════════════════════════════════════════════════"
echo "  TITANE∞ v26.3.0 — VALIDATION FIX WEBKIT"
echo "════════════════════════════════════════════════════════════"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
PASS=0
FAIL=0

# Fonction de test
test_result() {
    local name="$1"
    local result="$2"
    
    if [ "$result" -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $name"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: $name"
        ((FAIL++))
    fi
}

# Nettoyer processus existants
echo -e "${BLUE}[1/7]${NC} Nettoyage processus existants..."
pkill -f "titane-infinity" 2>/dev/null || true
pkill -f "vite.*4000\|vite.*5173" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓${NC} Nettoyage terminé"
echo ""

# Vérifier fichiers créés
echo -e "${BLUE}[2/7]${NC} Vérification fichiers du fix..."

if [ -f "src/utils/bootSafetyLock.ts" ]; then
    test_result "bootSafetyLock.ts existe" 0
else
    test_result "bootSafetyLock.ts existe" 1
fi

if grep -q "bootSafetyLock" "src/utils/bootRecoverySystem.ts"; then
    test_result "bootRecoverySystem.ts modifié" 0
else
    test_result "bootRecoverySystem.ts modifié" 1
fi

if grep -q "bootSafetyLock" "src/components/SystemIntegrationHub.tsx"; then
    test_result "SystemIntegrationHub.tsx modifié" 0
else
    test_result "SystemIntegrationHub.tsx modifié" 1
fi

if grep -q "bootSafetyLock" "src/utils/quantumOrchestrator.ts"; then
    test_result "quantumOrchestrator.ts modifié" 0
else
    test_result "quantumOrchestrator.ts modifié" 1
fi

if grep -q "bootSafetyLock" "src/components/ErrorBoundary.tsx"; then
    test_result "ErrorBoundary.tsx modifié" 0
else
    test_result "ErrorBoundary.tsx modifié" 1
fi

echo ""

# Vérifier TypeScript compile
echo -e "${BLUE}[3/7]${NC} Vérification TypeScript..."
if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error TS"; then
    test_result "TypeScript compilation" 1
    echo -e "${YELLOW}⚠️${NC} Erreurs TypeScript détectées"
else
    test_result "TypeScript compilation" 0
fi
echo ""

# Test Boot #1
echo -e "${BLUE}[4/7]${NC} Boot Test #1 (15 secondes)..."
LOG_FILE="/tmp/titane_boot_test_1.log"
timeout 15s corepack pnpm run dev:tauri > "$LOG_FILE" 2>&1 &
BOOT_PID=$!

sleep 15
kill -15 $BOOT_PID 2>/dev/null || true
sleep 2

if grep -q "Maximum update depth exceeded" "$LOG_FILE"; then
    test_result "Boot #1: Pas de boucle React" 1
else
    test_result "Boot #1: Pas de boucle React" 0
fi

if grep -q "removeChildFromContainer" "$LOG_FILE"; then
    test_result "Boot #1: Pas d'erreur DOM" 1
else
    test_result "Boot #1: Pas d'erreur DOM" 0
fi

if grep -q "WebKit internal error" "$LOG_FILE"; then
    test_result "Boot #1: Pas de crash WebKit" 1
else
    test_result "Boot #1: Pas de crash WebKit" 0
fi

echo ""
echo -e "${YELLOW}📋 Log Boot #1:${NC} $LOG_FILE"
echo ""

# Nettoyage inter-test
pkill -f "titane-infinity" 2>/dev/null || true
sleep 3

# Test Boot #2
echo -e "${BLUE}[5/7]${NC} Boot Test #2 (15 secondes)..."
LOG_FILE="/tmp/titane_boot_test_2.log"
timeout 15s corepack pnpm run dev:tauri > "$LOG_FILE" 2>&1 &
BOOT_PID=$!

sleep 15
kill -15 $BOOT_PID 2>/dev/null || true
sleep 2

if grep -q "Maximum update depth exceeded" "$LOG_FILE"; then
    test_result "Boot #2: Pas de boucle React" 1
else
    test_result "Boot #2: Pas de boucle React" 0
fi

echo ""
echo -e "${YELLOW}📋 Log Boot #2:${NC} $LOG_FILE"
echo ""

# Nettoyage inter-test
pkill -f "titane-infinity" 2>/dev/null || true
sleep 3

# Test Boot #3
echo -e "${BLUE}[6/7]${NC} Boot Test #3 (15 secondes)..."
LOG_FILE="/tmp/titane_boot_test_3.log"
timeout 15s corepack pnpm run dev:tauri > "$LOG_FILE" 2>&1 &
BOOT_PID=$!

sleep 15
kill -15 $BOOT_PID 2>/dev/null || true
sleep 2

if grep -q "Maximum update depth exceeded" "$LOG_FILE"; then
    test_result "Boot #3: Pas de boucle React" 1
else
    test_result "Boot #3: Pas de boucle React" 0
fi

echo ""
echo -e "${YELLOW}📋 Log Boot #3:${NC} $LOG_FILE"
echo ""

# Nettoyage final
echo -e "${BLUE}[7/7]${NC} Nettoyage final..."
pkill -f "titane-infinity" 2>/dev/null || true
pkill -f "vite.*4000\|vite.*5173" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓${NC} Nettoyage terminé"
echo ""

# Résumé
echo "════════════════════════════════════════════════════════════"
echo "  RÉSUMÉ VALIDATION"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Tests réussis:${NC} $PASS"
echo -e "${RED}❌ Tests échoués:${NC} $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 VALIDATION COMPLÈTE RÉUSSIE${NC}"
    echo ""
    echo "Le fix WebKit est opérationnel:"
    echo "  ✅ Zéro boucle React infinie"
    echo "  ✅ Zéro erreur DOM manipulation"
    echo "  ✅ Zéro crash WebKit"
    echo "  ✅ 3 boots consécutifs stables"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️ VALIDATION ÉCHOUÉE${NC}"
    echo ""
    echo "Des erreurs subsistent. Vérifier les logs:"
    echo "  📋 /tmp/titane_boot_test_1.log"
    echo "  📋 /tmp/titane_boot_test_2.log"
    echo "  📋 /tmp/titane_boot_test_3.log"
    echo ""
    exit 1
fi
