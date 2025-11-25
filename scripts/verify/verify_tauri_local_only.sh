#!/usr/bin/env bash
# TITANE∞ v14 — Tauri Local-Only Shield
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — TAURI LOCAL-ONLY VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"

ERRORS=0

# Check for HTTP/HTTPS usage in source files (excluding localhost/127.0.0.1)
echo "→ Scanning for external HTTP requests..."

HTTP_MATCHES=$(grep -r "https\?://" src src-tauri \
    --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.js" \
    2>/dev/null | grep -v "localhost" | grep -v "127.0.0.1" | grep -v "///" || true)

if [ -n "$HTTP_MATCHES" ]; then
    echo "❌ External HTTP usage detected:"
    echo "$HTTP_MATCHES"
    ((ERRORS++))
else
    echo "✅ No external HTTP requests found"
fi

# Check tauri.conf.json for allowlist configuration
if [ -f "src-tauri/tauri.conf.json" ]; then
    echo "→ Checking tauri.conf.json security..."

    # Check for CSP (Content Security Policy)
    if grep -q "contentSecurityPolicy" src-tauri/tauri.conf.json; then
        echo "✅ CSP configured"
    else
        echo "⚠️  CSP not configured (recommended)"
    fi

    # Check for localhost-only fetch
    if grep -q "localhost" src-tauri/tauri.conf.json || grep -q "127.0.0.1" src-tauri/tauri.conf.json; then
        echo "✅ Localhost fetch detected (Ollama allowed)"
    fi
else
    echo "❌ tauri.conf.json not found"
    ((ERRORS++))
fi

# Summary
echo "═══════════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo "✅ TAURI LOCAL-ONLY: ALL CHECKS PASSED"
    exit 0
else
    echo "❌ TAURI LOCAL-ONLY: $ERRORS ERROR(S) DETECTED"
    exit 1
fi
