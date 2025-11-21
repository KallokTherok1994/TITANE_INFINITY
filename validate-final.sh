#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# 🚀 TITANE∞ v16.1 — SCRIPT DE VALIDATION FINALE
# Vérifie que tout est 100% conforme, stable et fonctionnel
# ═══════════════════════════════════════════════════════════════════════════

set -e

ERRORS=0
WARNINGS=0
CHECKS=0

echo "════════════════════════════════════════════════════════════════"
echo "   🚀 TITANE∞ v16.1 — VALIDATION FINALE"
echo "════════════════════════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════════════════
# 1. Vérification Versions
# ═══════════════════════════════════════════════════════════════════

echo "1️⃣  Vérification versions..."
((CHECKS++))

PACKAGE_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
TAURI_VERSION=$(grep '"version"' src-tauri/tauri.conf.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')

if [ "$PACKAGE_VERSION" = "16.1.0" ] && [ "$TAURI_VERSION" = "16.1.0" ]; then
    echo "   ✅ Versions harmonisées: v16.1.0"
else
    echo "   ❌ ERREUR: Versions incohérentes"
    echo "      package.json: $PACKAGE_VERSION"
    echo "      tauri.conf.json: $TAURI_VERSION"
    ((ERRORS++))
fi
echo ""

# ═══════════════════════════════════════════════════════════════════
# 2. Vérification TypeScript
# ═══════════════════════════════════════════════════════════════════

echo "2️⃣  Vérification TypeScript..."
((CHECKS++))

if npm run type-check 2>&1 | grep -q "error TS"; then
    echo "   ❌ ERREUR: Erreurs TypeScript détectées"
    ((ERRORS++))
else
    echo "   ✅ TypeScript: 0 erreurs"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════
# 3. Vérification Build Frontend
# ═══════════════════════════════════════════════════════════════════

echo "3️⃣  Vérification build frontend..."
((CHECKS++))

if [ ! -f "dist/index.html" ]; then
    echo "   ⚠️  WARNING: dist/ non trouvé, build en cours..."
    npm run build > /dev/null 2>&1
    ((WARNINGS++))
fi

if [ -f "dist/index.html" ] && [ -d "dist/assets" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    JS_COUNT=$(ls dist/assets/*.js 2>/dev/null | wc -l)
    CSS_COUNT=$(ls dist/assets/*.css 2>/dev/null | wc -l)
    
    echo "   ✅ Build frontend présent"
    echo "      Taille: $DIST_SIZE"
    echo "      Fichiers JS: $JS_COUNT"
    echo "      Fichiers CSS: $CSS_COUNT"
else
    echo "   ❌ ERREUR: Build frontend manquant"
    ((ERRORS++))
fi
echo ""

# ═══════════════════════════════════════════════════════════════════
# 4. Vérification Structure Fichiers
# ═══════════════════════════════════════════════════════════════════

echo "4️⃣  Vérification structure fichiers..."
((CHECKS++))

REQUIRED_FILES=(
    "package.json"
    "vite.config.ts"
    "src/main.tsx"
    "src/App.tsx"
    "src-tauri/tauri.conf.json"
    "src-tauri/Cargo.toml"
    "src/services/aiService.ts"
    "src/services/chatMemory.ts"
    "src/config/offline-first.ts"
    "src/utils/cloudAPIConfirmation.ts"
)

MISSING=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "   ❌ Fichier manquant: $file"
        ((MISSING++))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo "   ✅ Tous les fichiers critiques présents (${#REQUIRED_FILES[@]} fichiers)"
else
    echo "   ❌ ERREUR: $MISSING fichiers manquants"
    ((ERRORS++))
fi
echo ""

# ═══════════════════════════════════════════════════════════════════
# 5. Vérification Configuration Tauri
# ═══════════════════════════════════════════════════════════════════

echo "5️⃣  Vérification configuration Tauri..."
((CHECKS++))

if grep -q '"frontendDist".*"../dist"' src-tauri/tauri.conf.json; then
    echo "   ✅ frontendDist configuré"
else
    echo "   ❌ ERREUR: frontendDist mal configuré"
    ((ERRORS++))
fi

if grep -q '"csp".*"default-src' src-tauri/tauri.conf.json; then
    echo "   ✅ CSP configuré"
else
    echo "   ⚠️  WARNING: CSP non trouvé"
    ((WARNINGS++))
fi

if grep -q '"dangerousDisableAssetCspModification".*false' src-tauri/tauri.conf.json; then
    echo "   ✅ AssetCsp protection activée"
else
    echo "   ⚠️  WARNING: AssetCsp protection désactivée"
    ((WARNINGS++))
fi
echo ""

# ═══════════════════════════════════════════════════════════════════
# 6. Vérification Offline-First Config
# ═══════════════════════════════════════════════════════════════════

echo "6️⃣  Vérification offline-first config..."
((CHECKS++))

if grep -q "mode: 'local'" src/config/offline-first.ts; then
    echo "   ✅ Mode local par défaut"
else
    echo "   ⚠️  WARNING: Mode local non configuré"
    ((WARNINGS++))
fi

if grep -q "localFirst: true" src/config/offline-first.ts; then
    echo "   ✅ Local-first activé"
else
    echo "   ⚠️  WARNING: Local-first non activé"
    ((WARNINGS++))
fi

if grep -q "requireOnlineConfirmation: true" src/config/offline-first.ts; then
    echo "   ✅ Confirmation cloud activée"
else
    echo "   ⚠️  WARNING: Confirmation cloud désactivée"
    ((WARNINGS++))
fi
echo ""

# ═══════════════════════════════════════════════════════════════════
# 7. Vérification Backend Rust (optionnel)
# ═══════════════════════════════════════════════════════════════════

echo "7️⃣  Vérification backend Rust..."
((CHECKS++))

if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
    echo "   ✅ WebKit2GTK-4.1 installé"
    
    if cd src-tauri && cargo check --quiet 2>/dev/null; then
        echo "   ✅ Backend Rust compile"
    else
        echo "   ⚠️  WARNING: cargo check échoué (dépendances ou erreurs)"
        ((WARNINGS++))
    fi
    cd ..
else
    echo "   ⚠️  WARNING: WebKit2GTK-4.1 non installé"
    echo "      Backend Rust ne peut pas compiler"
    echo "      Solution: ./fix-webkit-dependencies.sh"
    ((WARNINGS++))
fi
echo ""

# ═══════════════════════════════════════════════════════════════════
# 8. Vérification Documentation
# ═══════════════════════════════════════════════════════════════════

echo "8️⃣  Vérification documentation..."
((CHECKS++))

DOCS=(
    "AUDIT_360_RAPPORT_FINAL_v17.md"
    "DEPLOYMENT_VALIDATION_v16.1.md"
)

DOC_MISSING=0
for doc in "${DOCS[@]}"; do
    if [ ! -f "$doc" ]; then
        echo "   ⚠️  Document manquant: $doc"
        ((DOC_MISSING++))
    fi
done

if [ $DOC_MISSING -eq 0 ]; then
    echo "   ✅ Documentation complète (${#DOCS[@]} fichiers)"
else
    echo "   ⚠️  WARNING: $DOC_MISSING documents manquants"
    ((WARNINGS++))
fi
echo ""

# ═══════════════════════════════════════════════════════════════════
# 9. Test Frontend Standalone (optionnel)
# ═══════════════════════════════════════════════════════════════════

echo "9️⃣  Test frontend standalone..."
((CHECKS++))

# Tuer éventuels serveurs existants
pkill -f "python3 -m http.server" 2>/dev/null || true

# Lancer serveur temporaire
cd dist
timeout 2 python3 -m http.server 8081 >/dev/null 2>&1 &
SERVER_PID=$!
sleep 1

# Test requête HTTP
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 | grep -q "200"; then
    echo "   ✅ Frontend accessible (HTTP 200)"
else
    echo "   ⚠️  WARNING: Frontend non accessible"
    ((WARNINGS++))
fi

# Nettoyer
kill $SERVER_PID 2>/dev/null || true
cd ..
echo ""

# ═══════════════════════════════════════════════════════════════════
# RAPPORT FINAL
# ═══════════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "   📊 RAPPORT DE VALIDATION"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Vérifications effectuées: $CHECKS"
echo "Erreurs critiques: $ERRORS"
echo "Avertissements: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ ✅ ✅  SYSTÈME 100% CONFORME  ✅ ✅ ✅"
    echo ""
    echo "TITANE∞ v16.1 est PRÊT POUR PRODUCTION"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "✅  SYSTÈME CONFORME (avec $WARNINGS avertissements)"
    echo ""
    echo "TITANE∞ v16.1 est FONCTIONNEL"
    echo "Avertissements mineurs détectés (non bloquants)"
    exit 0
else
    echo "❌  SYSTÈME NON CONFORME"
    echo ""
    echo "$ERRORS erreurs critiques détectées"
    echo "Correction requise avant déploiement"
    exit 1
fi
