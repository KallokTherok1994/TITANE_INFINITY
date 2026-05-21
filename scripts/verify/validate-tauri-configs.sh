#!/bin/bash

# TITANE Tauri Config Validator
# Valide que les configs runtime/dev et runtime/stable restent coherentes.

set -e

echo "🔍 Validation des configurations Tauri..."

ERRORS=0

json_get() {
    local expression="$1"
    local file="$2"

    if command -v jq >/dev/null 2>&1; then
        jq -r "$expression" "$file"
        return
    fi

    node -e '
const fs = require("fs");
const [file, expression] = process.argv.slice(1);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
if (expression === ".version") {
  process.stdout.write(String(data.version ?? ""));
} else if (expression === ".version // \"26.2.0\"") {
  process.stdout.write(String(data.version ?? "26.2.0"));
} else {
  console.error(`[tauri-configs] unsupported JSON expression without jq: ${expression}`);
  process.exit(2);
}
' "$file" "$expression"
}

# 1. Vérifier que tauri.base.json existe (root ou src-tauri/)
if [ -f "tauri.base.json" ]; then
    BASE_CONFIG="tauri.base.json"
elif [ -f "src-tauri/tauri.base.json" ]; then
    BASE_CONFIG="src-tauri/tauri.base.json"
else
    echo "❌ tauri.base.json manquant (cherché dans root et src-tauri/)"
    ERRORS=$((ERRORS + 1))
    BASE_CONFIG="tauri.base.json"
fi

# 2. Vérifier que runtime/dev/tauri.conf.json existe
if [ ! -f "runtime/dev/tauri.conf.json" ]; then
    echo "❌ runtime/dev/tauri.conf.json manquant"
    ERRORS=$((ERRORS + 1))
fi

# 3. Vérifier que runtime/stable/tauri.conf.json existe
if [ ! -f "runtime/stable/tauri.conf.json" ]; then
    echo "❌ runtime/stable/tauri.conf.json manquant"
    ERRORS=$((ERRORS + 1))
fi

# 4. Vérifier cohérence version (dev doit avoir -dev suffix)
BASE_VERSION=$(json_get '.version // "26.2.0"' "$BASE_CONFIG" 2>/dev/null || echo "unknown")
DEV_VERSION=$(json_get '.version' runtime/dev/tauri.conf.json 2>/dev/null || echo "unknown")
STABLE_VERSION=$(json_get '.version' runtime/stable/tauri.conf.json 2>/dev/null || echo "unknown")

echo "📦 Versions détectées:"
echo "   Base: $BASE_VERSION"
echo "   Dev: $DEV_VERSION"
echo "   Stable: $STABLE_VERSION"

if [[ ! "$DEV_VERSION" =~ -dev ]]; then
    echo "⚠️ Dev version devrait avoir suffix -dev"
fi

if [[ "$STABLE_VERSION" == *"-dev"* ]]; then
    echo "❌ Stable version ne doit pas avoir suffix -dev"
    ERRORS=$((ERRORS + 1))
fi

echo ""
if [ "$ERRORS" -eq 0 ]; then
    echo "✅ Configurations Tauri valides"
    exit 0
fi

echo "❌ Erreurs de configuration: $ERRORS"
exit 1
