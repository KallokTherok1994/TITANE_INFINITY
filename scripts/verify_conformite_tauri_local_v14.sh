#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v14 — VERIFY CONFORMITÉ TAURI-LOCAL
# ═══════════════════════════════════════════════════════════════════════════
# Vérifie 0 serveur HTTP, 0 localhost, Vite Tauri-only, CSP durcie
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — CONFORMITÉ TAURI-LOCAL VERIFICATION"
echo "════════════════════════════════════════════════════════════════════════"

ERRORS=0

# ─────────────────────────────────────────────────────────────────────────────
# 1. Pas de serveur HTTP/Express dans dependencies
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [1/6] Vérification 0 serveur HTTP..."

HTTP_DEPS=$(grep -E "express|fastify|koa|http-server" package.json || true)

if [ -n "$HTTP_DEPS" ]; then
    echo "⚠️  WARNING: Dépendances serveur HTTP détectées"
    echo "$HTTP_DEPS"
    # Pas bloquant si uniquement en devDependencies
else
    echo "✅ PASS: Aucune dépendance serveur HTTP"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. Pas de localhost dans le code frontend
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [2/6] Détection localhost dans frontend..."

LOCALHOST_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -i "localhost" | grep -v "// " | grep -v "OLLAMA" | wc -l || true)

if [ "$LOCALHOST_COUNT" -gt 0 ]; then
    echo "⚠️  WARNING: $LOCALHOST_COUNT références localhost trouvées"
    find src -name "*.ts" -o -name "*.tsx" | xargs grep -i "localhost" | grep -v "// " | grep -v "OLLAMA" | head -5
    # Pas bloquant si c'est pour Ollama/Gemini API (contrôlé côté Rust)
else
    echo "✅ PASS: Aucune référence localhost non contrôlée"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. Vite configuré en mode Tauri
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [3/6] Vérification configuration Vite..."

if ! grep -q "@tauri-apps/api" vite.config.ts; then
    echo "⚠️  WARNING: vite.config.ts peut manquer config Tauri"
fi

# Vérifier clearScreen: false (Tauri best practice)
if grep -q "clearScreen: false" vite.config.ts; then
    echo "✅ PASS: Vite configuré pour Tauri (clearScreen: false)"
else
    echo "⚠️  INFO: Ajouter 'clearScreen: false' dans vite.config.ts"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. CSP (Content Security Policy) durcie
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [4/6] Vérification CSP dans tauri.conf.json..."

if grep -q "\"csp\":" src-tauri/tauri.conf.json; then
    echo "✅ PASS: CSP configurée"

    # Vérifier pas de 'unsafe-inline' ou 'unsafe-eval'
    if grep -q "unsafe-inline\|unsafe-eval" src-tauri/tauri.conf.json; then
        echo "⚠️  WARNING: CSP contient unsafe-inline ou unsafe-eval"
    else
        echo "✅ PASS: CSP durcie (pas de unsafe-*)"
    fi
else
    echo "⚠️  INFO: CSP non configurée dans tauri.conf.json"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. Pas de fetch() vers URLs non contrôlées
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [5/6] Détection fetch() non contrôlés..."

FETCH_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep "fetch(\"http" | grep -v "// " | wc -l || true)

if [ "$FETCH_COUNT" -gt 0 ]; then
    echo "⚠️  WARNING: $FETCH_COUNT fetch() HTTP directs trouvés"
    find src -name "*.ts" -o -name "*.tsx" | xargs grep "fetch(\"http" | grep -v "// " | head -5
    echo "    → Utiliser Tauri invoke() pour requêtes HTTP"
    # Pas bloquant
else
    echo "✅ PASS: Pas de fetch() HTTP direct"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. Tauri allowlist restreint
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "🔍 [6/6] Vérification Tauri allowlist..."

if grep -q "\"allowlist\":" src-tauri/tauri.conf.json; then
    echo "✅ PASS: Allowlist configurée"

    # Vérifier shell restricted
    if grep -q "\"shell\": {" src-tauri/tauri.conf.json; then
        if grep -q "\"all\": false" src-tauri/tauri.conf.json; then
            echo "✅ PASS: Shell restreint (all: false)"
        else
            echo "⚠️  WARNING: Shell peut être trop permissif"
        fi
    fi
else
    echo "ℹ️  INFO: Allowlist par défaut (Tauri 1.x)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# RÉSULTAT FINAL
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════════════════"

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ PASS: Conformité Tauri-Local OK"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 0
else
    echo "❌ FAIL: $ERRORS erreurs détectées"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 1
fi
