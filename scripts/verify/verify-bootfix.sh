#!/usr/bin/env bash
# TITANE∞ — Script de vérification des fixes boot P0
# © 2026 TITANE Team. All rights reserved.

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Compteurs
CHECKS_TOTAL=0
CHECKS_PASSED=0
ISSUES_FOUND=0

# Fonctions utilitaires
log_check() {
    ((CHECKS_TOTAL++))
    echo -ne "🔍 $1 ... "
}

log_pass() {
    ((CHECKS_PASSED++))
    echo -e "${GREEN}✅ PASS${NC}"
    [ -n "${2:-}" ] && echo "   └─ $2"
}

log_fail() {
    ((ISSUES_FOUND++))
    echo -e "${RED}❌ FAIL${NC}"
    [ -n "${2:-}" ] && echo "   └─ $2"
}

log_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC} $1"
}

# Vérifier l'environnement
check_environment() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}🔧 VÉRIFICATION FIXES BOOT P0${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo ""

    log_check "Node.js disponible"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_pass "Node.js $NODE_VERSION"
    else
        log_fail "Node.js non trouvé"
        return 1
    fi

    log_check "npm disponible"
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_pass "npm $NPM_VERSION"
    else
        log_fail "npm non trouvé"
        return 1
    fi

    log_check "Dossier src existe"
    if [ -d "src" ]; then
        log_pass "Structure projet valide"
    else
        log_fail "Dossier src manquant"
        return 1
    fi

    return 0
}

# Vérifier les fixes IPC
check_ipc_fixes() {
    echo ""
    echo -e "${BLUE}📡 VÉRIFICATION FIXES IPC${NC}"
    echo ""

    log_check "Wrapper ipcInvoke.ts existe"
    if [ -f "src/lib/ipc.ts" ]; then
        log_pass "Fichier ipc.ts présent"

        # Vérifier contenu
        if grep -q "ipcInvoke" src/lib/ipc.ts; then
            log_pass "Fonction ipcInvoke définie"
        else
            log_fail "ipcInvoke non trouvé dans ipc.ts"
        fi

        if grep -q "SECURITY_VIOLATION.*ipc://" src/lib/ipc.ts; then
            log_pass "Protection anti-ipc:// présente"
        else
            log_fail "Protection anti-ipc:// manquante"
        fi
    else
        log_fail "Fichier ipc.ts manquant"
    fi

    log_check "Pas de fetch(\"ipc://\") dans le code"
    if grep -r "fetch.*ipc://" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v "node_modules" | grep -v ".git"; then
        log_fail "Usage de fetch(\"ipc://\") détecté"
    else
        log_pass "Aucun fetch(\"ipc://\") trouvé"
    fi
}

# Vérifier les fixes lazy import
check_lazy_import_fixes() {
    echo ""
    echo -e "${BLUE}📦 VÉRIFICATION FIXES LAZY IMPORT${NC}"
    echo ""

    log_check "Helper safeLazyImport.ts existe"
    if [ -f "src/utils/safeLazyImport.ts" ]; then
        log_pass "Fichier safeLazyImport.ts présent"

        if grep -q "safeLazyImport" src/utils/safeLazyImport.ts; then
            log_pass "Fonction safeLazyImport définie"
        else
            log_fail "safeLazyImport non trouvée"
        fi

        if grep -q "LazyImportErrorFallback" src/utils/safeLazyImport.ts; then
            log_pass "Fallback UI défini"
        else
            log_fail "Fallback UI manquant"
        fi
    else
        log_fail "Fichier safeLazyImport.ts manquant"
    fi

    log_check "Caches Vite purgés"
    if [ ! -d "node_modules/.vite" ] && [ ! -d ".vite" ]; then
        log_pass "Caches Vite absents (purgés)"
    else
        log_warn "Caches Vite présents (peuvent être régénérés)"
    fi
}

# Vérifier les fixes React loop
check_react_loop_fixes() {
    echo ""
    echo -e "${BLUE}🔄 VÉRIFICATION FIXES REACT LOOP${NC}"
    echo ""

    log_check "SystemIntegrationHub.tsx modifié"
    if [ -f "src/components/SystemIntegrationHub.tsx" ]; then
        if grep -q "useRef" src/components/SystemIntegrationHub.tsx; then
            log_pass "useRef (anti-réentrance) présent"
        else
            log_fail "useRef manquant"
        fi

        if grep -q "useCallback" src/components/SystemIntegrationHub.tsx; then
            log_pass "useCallback présent"
        else
            log_fail "useCallback manquant"
        fi

        if grep -q "inFlight\.current" src/components/SystemIntegrationHub.tsx; then
            log_pass "Guard anti-réentrance implémenté"
        else
            log_fail "Guard anti-réentrance manquant"
        fi

        if grep -q "setHubState.*prevState" src/components/SystemIntegrationHub.tsx; then
            log_pass "Comparaison état avant setState"
        else
            log_fail "Comparaison état manquante"
        fi
    else
        log_fail "SystemIntegrationHub.tsx manquant"
    fi
}

# Vérifier les fixes orchestrator
check_orchestrator_fixes() {
    echo ""
    echo -e "${BLUE}🎼 VÉRIFICATION FIXES ORCHESTRATOR${NC}"
    echo ""

    log_check "quantumOrchestrator.ts modifié"
    if [ -f "src/utils/quantumOrchestrator.ts" ]; then
        if grep -q "active_thought_processes.*length.*\?\?" src/utils/quantumOrchestrator.ts; then
            log_pass "Accès safe active_thought_processes"
        else
            log_fail "Accès unsafe active_thought_processes"
        fi

        if grep -q "executeHealingPlan.*function" src/utils/quantumOrchestrator.ts; then
            log_pass "Capability check executeHealingPlan"
        else
            log_fail "Capability check manquant"
        fi
    else
        log_fail "quantumOrchestrator.ts manquant"
    fi
}

# Test de démarrage rapide
test_boot_smoke() {
    echo ""
    echo -e "${BLUE}🚀 TEST BOOT SMOKE${NC}"
    echo ""

    log_check "Build Vite possible"
    if timeout 30s pnpm run build 2>/dev/null; then
        log_pass "Build réussi"
    else
        log_fail "Build échoué"
    fi

    log_check "Dépendances installées"
    if [ -d "node_modules" ] && [ "$(ls -A node_modules)" ]; then
        log_pass "node_modules présent et non vide"
    else
        log_fail "node_modules manquant ou vide"
    fi
}

# Rapport final
generate_report() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📊 RAPPORT FINAL${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo ""

    SUCCESS_RATE=$((CHECKS_PASSED * 100 / CHECKS_TOTAL))

    echo "Vérifications totales: $CHECKS_TOTAL"
    echo -e "Réussies: ${GREEN}$CHECKS_PASSED ✅${NC}"
    if [ "$ISSUES_FOUND" -gt 0 ]; then
        echo -e "Échouées: ${RED}$ISSUES_FOUND ❌${NC}"
    else
        echo -e "Échouées: ${GREEN}0 ✅${NC}"
    fi

    echo ""
    echo -e "Taux de succès: ${GREEN}${SUCCESS_RATE}%${NC}"
    echo ""

    if [ "$ISSUES_FOUND" -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║          ✨ FIXES BOOT P0 VALIDÉS AVEC SUCCÈS ✨         ║${NC}"
        echo -e "${GREEN}║  Prêt pour démarrage stable sans erreurs bloquantes     ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
        return 0
    elif [ "$SUCCESS_RATE" -ge 80 ]; then
        echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║     ⚠️  FIXES PARTIELLEMENT VALIDÉS                    ║${NC}"
        echo -e "${YELLOW}║  Quelques vérifications échouées, vérifiez les logs     ║${NC}"
        echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
        return 1
    else
        echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║          ❌ FIXES CRITIQUES MANQUANTS                   ║${NC}"
        echo -e "${RED}║  Corrections nécessaires avant utilisation production    ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
        return 1
    fi
}

# Fonction principale
main() {
    if ! check_environment; then
        echo -e "${RED}❌ Environnement invalide, arrêt.${NC}"
        exit 1
    fi

    check_ipc_fixes
    check_lazy_import_fixes
    check_react_loop_fixes
    check_orchestrator_fixes
    test_boot_smoke

    generate_report
}

# Exécuter si appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
