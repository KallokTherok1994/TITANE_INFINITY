#!/bin/bash

# 🔒 TITANE∞ Tauri-Only Enforcement
# Vérifie que le projet respecte la philosophie Tauri-only

set -e

echo "🔍 Vérification Tauri-Only..."

ERRORS=0

# 1. Interdire serveurs HTTP
echo "📡 Check: Pas de serveurs HTTP..."
if grep -rE "import.*['\"]express['\"]|from ['\"]express['\"]|require\(['\"]express['\"]\)" src/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
    echo "❌ Serveur HTTP Express détecté (violation Tauri-only)"
    ((ERRORS++))
fi
if grep -rE "import.*['\"]koa['\"]|from ['\"]koa['\"]" src/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
    echo "❌ Serveur HTTP Koa détecté (violation Tauri-only)"
    ((ERRORS++))
fi
if grep -rE "import.*['\"]fastify['\"]|from ['\"]fastify['\"]" src/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
    echo "❌ Serveur HTTP Fastify détecté (violation Tauri-only)"
    ((ERRORS++))
fi

# 2. Interdire vite preview
echo "🚫 Check: Pas de vite preview..."
if grep -q "vite preview" package.json 2>/dev/null && ! grep -q "exit 1" package.json; then
    echo "❌ vite preview autorisé (violation Tauri-only)"
    ((ERRORS++))
fi

# 3. Vérifier scripts de lancement web interdits
echo "📜 Check: Scripts de lancement conformes..."
FORBIDDEN_SCRIPTS=("start" "serve" "preview" "docs:serve")
for script in "${FORBIDDEN_SCRIPTS[@]}"; do
    SCRIPT_VALUE=$(jq -r ".scripts[\"$script\"] // empty" package.json)
    if [[ -n "$SCRIPT_VALUE" ]] && [[ ! "$SCRIPT_VALUE" =~ "exit 1" ]]; then
        echo "❌ Script '$script' autorisé sans blocage (violation Tauri-only)"
        ((ERRORS++))
    fi
done

# 4. Vérifier absence create-react-app / next.js / standalone SPA
echo "🌐 Check: Pas de framework standalone web..."
if grep -q "\"react-scripts\"\|\"next\"\|\"@remix-run\"" package.json; then
    echo "❌ Framework standalone web détecté (violation Tauri-only)"
    ((ERRORS++))
fi

# 5. Vérifier que dev utilise tauri dev
echo "⚙️ Check: dev script utilise tauri dev..."
DEV_SCRIPT=$(jq -r '.scripts.dev' package.json)
if [[ ! "$DEV_SCRIPT" =~ "tauri dev" ]]; then
    echo "❌ dev script ne lance pas tauri dev (violation Tauri-only)"
    ((ERRORS++))
fi

# Résultat
if [ $ERRORS -eq 0 ]; then
    echo "✅ Tauri-only enforced: 0 erreurs"
    exit 0
else
    echo "❌ Tauri-only violations: $ERRORS erreurs trouvées"
    exit 1
fi
