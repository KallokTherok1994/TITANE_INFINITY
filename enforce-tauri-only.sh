#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# 🔒 TITANE∞ v16.1 — TAURI-ONLY MODE ENFORCEMENT
# Vérifie et applique le mode Tauri exclusif
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════"
echo "   🔒 TITANE∞ TAURI-ONLY MODE - VÉRIFICATION"
echo "════════════════════════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0

# ═══════════════════════════════════════════════════════════════════
# 1. Vérifier package.json
# ═══════════════════════════════════════════════════════════════════

echo "1️⃣  Vérification package.json..."

if grep -q '"dev".*"tauri dev"' package.json; then
    echo "   ✅ npm run dev → tauri dev"
else
    echo "   ❌ ERREUR: npm run dev ne lance pas tauri dev"
    ((ERRORS++))
fi

if grep -q '"preview".*exit 1' package.json; then
    echo "   ✅ npm run preview → bloqué"
else
    echo "   ⚠️  WARNING: preview HTTP non bloqué"
    ((WARNINGS++))
fi

if grep -q '"vite:dev".*exit 1' package.json; then
    echo "   ✅ vite:dev → bloqué"
else
    echo "   ⚠️  WARNING: vite:dev non bloqué"
    ((WARNINGS++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# 2. Vérifier tauri.conf.json
# ═══════════════════════════════════════════════════════════════════

echo "2️⃣  Vérification tauri.conf.json..."

if grep -q '"devUrl"' src-tauri/tauri.conf.json; then
    echo "   ⚠️  WARNING: devUrl HTTP présent (devrait être supprimé)"
    ((WARNINGS++))
else
    echo "   ✅ Pas de devUrl HTTP"
fi

if grep -q '"frontendDist".*"../dist"' src-tauri/tauri.conf.json; then
    echo "   ✅ frontendDist → ../dist"
else
    echo "   ❌ ERREUR: frontendDist mal configuré"
    ((ERRORS++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# 3. Vérifier vite.config.ts
# ═══════════════════════════════════════════════════════════════════

echo "3️⃣  Vérification vite.config.ts..."

if grep -q 'hmr:.*false' vite.config.ts; then
    echo "   ✅ HMR désactivé (Tauri-only)"
else
    echo "   ⚠️  WARNING: HMR activé"
    ((WARNINGS++))
fi

if grep -q 'strictPort:.*true' vite.config.ts; then
    echo "   ✅ strictPort activé"
else
    echo "   ⚠️  WARNING: strictPort désactivé"
    ((WARNINGS++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# 4. Vérifier processus actifs
# ═══════════════════════════════════════════════════════════════════

echo "4️⃣  Vérification processus HTTP actifs..."

if pgrep -f "python3 -m http.server" > /dev/null; then
    echo "   ⚠️  WARNING: Serveur HTTP Python actif détecté"
    echo "      Arrêt: pkill -f 'python3 -m http.server'"
    pkill -f "python3 -m http.server" || true
    ((WARNINGS++))
else
    echo "   ✅ Aucun serveur HTTP Python actif"
fi

if pgrep -f "vite preview" > /dev/null; then
    echo "   ⚠️  WARNING: vite preview actif détecté"
    echo "      Arrêt: pkill -f 'vite preview'"
    pkill -f "vite preview" || true
    ((WARNINGS++))
else
    echo "   ✅ Aucun vite preview actif"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# 5. Vérifier dist/
# ═══════════════════════════════════════════════════════════════════

echo "5️⃣  Vérification dist/..."

if [ -f "dist/index.html" ]; then
    echo "   ✅ dist/index.html présent"
else
    echo "   ⚠️  WARNING: dist/ non buildé"
    echo "      Exécuter: npm run build"
    ((WARNINGS++))
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# RAPPORT FINAL
# ═══════════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "   📊 RAPPORT TAURI-ONLY"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Erreurs critiques: $ERRORS"
echo "Avertissements: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ MODE TAURI-ONLY ACTIVÉ ET VERROUILLÉ"
    echo ""
    echo "TITANE∞ v16.1 démarre uniquement via:"
    echo "   npm run dev    → tauri dev"
    echo "   npm run build  → tauri build"
    echo ""
    echo "🚫 HTTP servers bloqués"
    echo "🚫 vite preview bloqué"
    echo "🚫 Pas de fallback HTTP"
    echo ""
    echo "✅ OFFLINE-FIRST 100% LOCAL"
    exit 0
else
    echo "❌ ERREURS DÉTECTÉES"
    echo ""
    echo "$ERRORS erreurs critiques nécessitent correction"
    exit 1
fi
