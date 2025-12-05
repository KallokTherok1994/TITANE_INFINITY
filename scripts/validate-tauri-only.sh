#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   🔒 TITANE∞ TAURI-ONLY VALIDATION v2.0
#   Vérifie que TITANE∞ est 100% Tauri, jamais HTTP
# ═══════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════"
echo "   🔒 VALIDATION TAURI-ONLY MODE"
echo "════════════════════════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0

# ═══════════════════════════════════════════════════════════════
# 1. Vérification package.json
# ═══════════════════════════════════════════════════════════════

echo "1️⃣  Vérification package.json..."

if grep -q '"dev".*"vite"' package.json && ! grep -q '"dev".*"tauri dev"' package.json; then
    echo "   ❌ ERREUR: npm run dev pointe vers vite au lieu de tauri dev"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ npm run dev configure correctement"
fi

if grep -q '"preview".*"vite preview"' package.json; then
    echo "   ⚠️  WARNING: vite preview est actif (devrait être bloqué)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ vite preview désactivé"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 2. Vérification tauri.conf.json
# ═══════════════════════════════════════════════════════════════

echo "2️⃣  Vérification tauri.conf.json..."

if grep -q '"devUrl".*"http://localhost:5173"' src-tauri/tauri.conf.json; then
    echo "   ⚠️  WARNING: devUrl pointe vers HTTP (devrait utiliser dist/)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ devUrl configuré correctement"
fi

if grep -q '"frontendDist".*"../dist"' src-tauri/tauri.conf.json; then
    echo "   ✅ frontendDist pointe vers ../dist"
else
    echo "   ❌ ERREUR: frontendDist mal configuré"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 3. Vérification vite.config.ts
# ═══════════════════════════════════════════════════════════════

echo "3️⃣  Vérification vite.config.ts..."

if grep -q 'hmr:.*false' vite.config.ts; then
    echo "   ✅ HMR désactivé (mode Tauri)"
else
    echo "   ⚠️  WARNING: HMR actif (peut causer des conflits)"
    WARNINGS=$((WARNINGS + 1))
fi

if grep -q 'strictPort:.*true' vite.config.ts; then
    echo "   ✅ strictPort activé"
else
    echo "   ⚠️  WARNING: strictPort désactivé"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 4. Vérification des ports utilisés
# ═══════════════════════════════════════════════════════════════

echo "4️⃣  Vérification des ports..."

if lsof -i :5173 &>/dev/null; then
    echo "   ⚠️  WARNING: Port 5173 (Vite) est utilisé"
    echo "      Processus actif sur le port HTTP"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ Port 5173 libre (aucun serveur HTTP)"
fi

if lsof -i :8080 &>/dev/null; then
    echo "   ⚠️  WARNING: Port 8080 est utilisé"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ Port 8080 libre"
fi

if lsof -i :4173 &>/dev/null; then
    echo "   ❌ ERREUR: Port 4173 (vite preview) est utilisé"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ Port 4173 libre (vite preview inactif)"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 5. Vérification du build dist/
# ═══════════════════════════════════════════════════════════════

echo "5️⃣  Vérification du build..."

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "   ✅ Build dist/ présent"
    DIST_SIZE=$(du -sh dist/ | cut -f1)
    echo "      Taille: $DIST_SIZE"
else
    echo "   ⚠️  WARNING: Build dist/ manquant (exécutez npm run build)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 6. Vérification des scripts Bash
# ═══════════════════════════════════════════════════════════════

echo "6️⃣  Scan des scripts pour serveurs HTTP..."

HTTP_SCRIPTS=$(grep -l "http.server\|vite preview\|vite dev\|npm run dev" *.sh 2>/dev/null | wc -l)

if [ "$HTTP_SCRIPTS" -gt 0 ]; then
    echo "   ⚠️  WARNING: $HTTP_SCRIPTS script(s) utilisent des serveurs HTTP"
    grep -l "http.server\|vite preview\|vite dev" *.sh 2>/dev/null | head -5 | while read file; do
        echo "      - $file"
    done
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ Aucun script HTTP détecté"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# RAPPORT FINAL
# ═══════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "   📊 RAPPORT TAURI-ONLY VALIDATION"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "   ✅ MODE TAURI-ONLY: PARFAIT"
    echo ""
    echo "   • Aucun serveur HTTP détecté"
    echo "   • Configuration Tauri correcte"
    echo "   • Scripts conformes"
    echo "   • Prêt pour déploiement natif"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "   🎉 VALIDATION RÉUSSIE - 100% TAURI"
    echo "════════════════════════════════════════════════════════════════"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "   ⚠️  MODE TAURI-ONLY: WARNINGS DÉTECTÉS"
    echo ""
    echo "   • Erreurs critiques: $ERRORS"
    echo "   • Avertissements: $WARNINGS"
    echo ""
    echo "   Les warnings peuvent être ignorés si vous êtes en dev."
    echo "   Pour la production, corrigez-les."
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "   ⚠️  VALIDATION PARTIELLE - WARNINGS À CORRIGER"
    echo "════════════════════════════════════════════════════════════════"
    exit 0
else
    echo "   ❌ MODE TAURI-ONLY: ÉCHEC"
    echo ""
    echo "   • Erreurs critiques: $ERRORS"
    echo "   • Avertissements: $WARNINGS"
    echo ""
    echo "   💡 Actions requises:"
    echo ""
    if grep -q '"dev".*"vite"' package.json; then
        echo "      1. Corriger package.json:"
        echo "         \"dev\": \"tauri dev\""
    fi
    if grep -q '"devUrl".*"http://localhost:5173"' src-tauri/tauri.conf.json; then
        echo "      2. Corriger tauri.conf.json:"
        echo "         \"devUrl\": \"http://localhost:1420\""
    fi
    if lsof -i :4173 &>/dev/null; then
        echo "      3. Arrêter vite preview:"
        echo "         pkill -f 'vite preview'"
    fi
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "   ❌ VALIDATION ÉCHOUÉE - CORRECTIONS REQUISES"
    echo "════════════════════════════════════════════════════════════════"
    exit 1
fi
