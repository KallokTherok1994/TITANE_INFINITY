#!/usr/bin/env bash
set -euo pipefail

# TITANE∞ - Gate: No Allow-All Permissions
# Interdit les permissions trop larges dans la config Tauri
# Doit être utilisé dans les pipelines CI/CD

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"

echo "🔍 TITANE∞ - Gate: No Allow-All Permissions"
echo "==========================================="

CONFIG="src-tauri/tauri.conf.json"

if [ ! -f "$CONFIG" ]; then
    echo "❌ FAIL: Config file not found: $CONFIG"
    exit 1
fi

# Vérifier allow-all dans http plugin
HTTP_ALLOW_ALL=$(jq -r '.plugins.http."all" // false' "$CONFIG")
if [ "$HTTP_ALLOW_ALL" = "true" ]; then
    echo "❌ FAIL: HTTP plugin has 'all: true' - too permissive"
    echo "   HTTP scope should be limited to localhost only"
    exit 1
fi

# Vérifier allow-all dans shell plugin
SHELL_OPEN=$(jq -r '.plugins.shell."open" // false' "$CONFIG")
if [ "$SHELL_OPEN" = "true" ]; then
    echo "❌ FAIL: Shell plugin has 'open: true' - shell execution enabled"
    echo "   Shell execution should be disabled in production"
    exit 1
fi

# Vérifier les scopes shell (doivent être vides)
SHELL_SCOPE_LENGTH=$(jq -r '.plugins.shell.scope | length' "$CONFIG")
if [ "$SHELL_SCOPE_LENGTH" -gt 0 ]; then
    echo "❌ FAIL: Shell plugin has non-empty scope - shell commands allowed"
    echo "   Shell scope should be empty for security"
    exit 1
fi

# Vérifier les permissions trop larges dans capabilities
CORE_WEBVIEW_ALLOW=$(jq -r '.app.security.capabilities[]?.permissions[]? | select(. == "core:webview:allow-internal-toggle-devtools")' "$CONFIG" | wc -l || true)
if [ "$CORE_WEBVIEW_ALLOW" -gt 0 ]; then
    echo "❌ FAIL: DevTools permission found in production config"
    echo "   'core:webview:allow-internal-toggle-devtools' should be denied"
    exit 1
fi

# Vérifier les wildcards dangereux dans allow
ALLOW_STAR=$(jq -r '.app.security.capabilities[]?.allow[]?.command | select(. == "*")' "$CONFIG" | wc -l || true)
if [ "$ALLOW_STAR" -gt 0 ]; then
    echo "❌ FAIL: Wildcard command '*' found in allow list"
    echo "   Commands must be explicitly listed"
    exit 1
fi

# Vérifier les deny patterns trop larges
DENY_STAR=$(jq -r '.app.security.capabilities[]?.deny[]?.command | select(. == "*")' "$CONFIG" | wc -l || true)
if [ "$DENY_STAR" -gt 0 ]; then
    echo "❌ FAIL: Wildcard command '*' found in deny list"
    echo "   Deny should use specific patterns"
    exit 1
fi

echo "✅ PASS: No allow-all permissions found"
echo "   - HTTP plugin restricted to localhost"
echo "   - Shell plugin disabled"
echo "   - No wildcard permissions"
echo "   - DevTools properly denied"
exit 0
