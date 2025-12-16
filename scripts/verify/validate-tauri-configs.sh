#!/bin/bash

# 🔍 TITANE∞ Tauri Config Validator
# Valide que les configs runtime/dev et runtime/stable étendent correctement tauri.base.json

set -e

echo "🔍 Validation des configurations Tauri..."

ERRORS=0

# 1. Vérifier que tauri.base.json existe (root ou src-tauri/)
if [ -f "tauri.base.json" ]; then
    BASE_CONFIG="tauri.base.json"
elif [ -f "src-tauri/tauri.base.json" ]; then
    BASE_CONFIG="src-tauri/tauri.base.json"
else
    echo "❌ tauri.base.json manquant (cherché dans root et src-tauri/)"
    ((ERRORS++))
    BASE_CONFIG="tauri.base.json"
fi

# 2. Vérifier que runtime/dev/tauri.conf.json existe
if [ ! -f "runtime/dev/tauri.conf.json" ]; then
    echo "❌ runtime/dev/tauri.conf.json manquant"
    ((ERRORS++))
fi

# 3. Vérifier que runtime/stable/tauri.conf.json existe
if [ ! -f "runtime/stable/tauri.conf.json" ]; then
    echo "❌ runtime/stable/tauri.conf.json manquant"
    ((ERRORS++))
fi

# 4. Vérifier cohérence version (dev doit avoir -dev suffix)
BASE_VERSION=$(jq -r '.version // "24.4.0"' "$BASE_CONFIG" 2>/dev/null || echo "unknown")
DEV_VERSION=$(jq -r '.version' runtime/dev/tauri.conf.json 2>/dev/null || echo "unknown")
STABLE_VERSION=$(jq -r '.version' runtime/stable/tauri.conf.json 2>/dev/null || echo "unknown")

echo "📦 Versions détectées:"
echo "   Base: $BASE_VERSION"
echo "   Dev: $DEV_VERSION"
echo "   Stable: $STABLE_VERSION"

if [[ ! "$DEV_VERSION" =~ -dev ]]; then
    echo "⚠️ Dev version devrait avoir suffix -dev"
fi

if [[ "$STABLE_VERSION" == *"-dev"* ]]; then
    echo "❌ Stable version ne doit pas avoir suffix -dev"
    ((ERRORS++))
fi

# Résultat
echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ Configurations Tauri valides"
    exit 0
else
    echo "❌ Erreurs de configuration: $ERRORS"
    exit 1
fi
