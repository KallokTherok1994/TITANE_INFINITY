#!/usr/bin/env bash
# TITANE∞ - Script de vérification pré-tunnel
# Vérifie que tout est prêt pour configurer le tunnel
set -euo pipefail

echo "🔍 TITANE∞ - Vérification Prérequis Tunnel"
echo "═════════════════════════════════════════"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Check 1: VS Code CLI
echo -n "1️⃣  VS Code CLI... "
if command -v code &> /dev/null; then
    echo "✅"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "❌"
    echo "   Installation: https://code.visualstudio.com/download"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check 2: jq (pour parser JSON)
echo -n "2️⃣  jq (JSON parser)... "
if command -v jq &> /dev/null; then
    echo "✅"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "❌"
    echo "   Installation: sudo apt install jq"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check 3: Connexion internet
echo -n "3️⃣  Connexion internet... "
if ping -c 1 github.com &> /dev/null; then
    echo "✅"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "❌"
    echo "   Vérifiez votre connexion réseau"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check 4: Compte GitHub
echo -n "4️⃣  Compte GitHub... "
if git config --get user.name &> /dev/null; then
    GITHUB_USER=$(git config --get user.name)
    echo "✅ ($GITHUB_USER)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "⚠️  (non configuré)"
    echo "   Configurez avec: git config --global user.name 'Votre Nom'"
    # On compte quand même comme passé car pas bloquant
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

# Check 5: Permissions systemd
echo -n "5️⃣  Systemd user... "
if systemctl --user status &> /dev/null; then
    echo "✅"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "⚠️  (non disponible)"
    echo "   Le service système ne sera pas disponible"
    # Pas bloquant, on peut utiliser le mode interactif
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

# Check 6: Espace disque
echo -n "6️⃣  Espace disque... "
AVAILABLE=$(df -h "$HOME" | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "${AVAILABLE%%.*}" -gt 1 ] 2>/dev/null; then
    echo "✅ (${AVAILABLE}G libre)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "⚠️  (seulement ${AVAILABLE} libre)"
    echo "   Recommandé: >1GB d'espace libre"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

echo ""
echo "═════════════════════════════════════════"
TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))
echo "📊 Résultat: $CHECKS_PASSED/$TOTAL checks passés"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo "✅ Système prêt pour configurer le tunnel !"
    echo ""
    echo "🚀 Prochaines étapes :"
    echo "   Option A (test):      ./scripts/remote/setup-github-tunnel.sh"
    echo "   Option B (permanent): ./scripts/remote/install-tunnel-service.sh"
    echo ""
else
    echo "❌ Veuillez corriger les problèmes ci-dessus avant de continuer"
    exit 1
fi
