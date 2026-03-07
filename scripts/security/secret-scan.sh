#!/usr/bin/env bash
# TITANE∞ — Secret Scanner CI (BLOQUANT)
# Détecte secrets versionnés pour certification PROD
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "🔒 [SECRET-SCAN] TITANE∞ Production Secret Scanner"
echo "===================================================="

# Patterns de secrets critiques
FORBIDDEN_PATTERNS=(
    "^\\.env$"
    "^\\.env\\."
    "^\\.envrc$"
    "^\\.current-server-info$"
    "secret.*\\.json$"
    ".*\\.key$"
    ".*\\.pem$"
    "id_rsa$"
    "id_ed25519$"
    "tunnel.*\\.json$"
    "cloudflare.*\\.json$"
    "^temp.*"
    "^tmp.*"
    ".*\\.tmp$"
    ".*\\.log$"
    "logs/.*"
)

ALLOWED_EXCEPTIONS=(
    ".*\\.example$"
    ".*\\.template$"
    ".*\\.sample$"
    "README\\.md$"
    "SECRETS\\.md$"
    "^docs/_evidence/.*/RUNLOGS/.*\\.log$"
    "^reports/.*\\.log$"
    "^docs/reports/.*\\.log$"
    "^proof_packs/.*/.*\\.log$"
    "^runs/current/triage_secrets/classification\\.json$"
)

EXIT_CODE=0

echo "📋 Phase 1: Scan fichiers trackés git..."
ALLOWED_REGEX="$(IFS='|'; echo "${ALLOWED_EXCEPTIONS[*]}")"

CANDIDATES="$(
    git -c core.quotepath=off ls-files \
        '.env' '.env.*' '.envrc' '.current-server-info' \
        '*secret*.json' '*.key' '*.pem' 'id_rsa' 'id_ed25519' \
        '*tunnel*.json' '*cloudflare*.json' \
        'temp*' 'tmp*' '*.tmp' '*.log' 'logs/*' 2>/dev/null \
        | sed '/^$/d' \
        | sed -e 's/^"//' -e 's/"$//' \
        | grep -Ev '^(reports/|docs/reports/)' || true
)"

BLOCKED_FILES="$(echo "$CANDIDATES" | grep -Ev "$ALLOWED_REGEX" || true)"

if [ -n "$BLOCKED_FILES" ]; then
    BLOCKED_COUNT=$(echo "$BLOCKED_FILES" | sed '/^$/d' | wc -l | tr -d ' ')
    echo "❌ BLOQUANT: $BLOCKED_COUNT fichier(s) sensible(s) tracké(s)"
    INDEX=0
    while IFS= read -r file; do
        [ -n "$file" ] || continue
        INDEX=$((INDEX + 1))
        if [ "$INDEX" -le 20 ]; then
            echo "   - $file"
        fi
    done <<< "$BLOCKED_FILES"
    if [ "$BLOCKED_COUNT" -gt 20 ]; then
        echo "   ... (+$((BLOCKED_COUNT - 20)) autres)"
    fi
    EXIT_CODE=1
fi

echo ""
echo "📋 Phase 2: Scan contenu pour patterns secrets..."

if command -v git >/dev/null 2>&1; then
    SECRET_CONTENT_PATTERNS=(
        "api[_-]?key.*[=:].*[A-Za-z0-9+/]{20,}"
        "secret[_-]?key.*[=:].*[A-Za-z0-9+/]{20,}"
        "access[_-]?token.*[=:].*[A-Za-z0-9+/]{20,}"
        "password.*[=:].*[A-Za-z0-9+/!@#$%^&*]{8,}"
        "bearer.*[A-Za-z0-9+/]{20,}"
        "BEGIN.*PRIVATE.*KEY"
    )

    for pattern in "${SECRET_CONTENT_PATTERNS[@]}"; do
        MATCHES=$(timeout 15 git grep -IlE "$pattern" -- \
            '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' '*.toml' '*.yml' '*.yaml' '*.env*' '*.sh' 2>/dev/null \
            | grep -v ".example" | grep -v "test" | grep -v ".md" | awk 'NR<=5' || true)
        if [ -n "$MATCHES" ]; then
            echo "⚠️ PATTERN SECRET détecté dans:"
            echo "$MATCHES"
        fi
    done
fi

echo ""
echo "📋 Phase 3: Vérification .gitignore protection..."

REQUIRED_IGNORES=(
    ".env"
    ".current-server-info"
    "*.key"
    "*.pem"
    "tunnel*.json"
    "secret*.json"
    "temp/*"
    "tmp/*"
    "*.log"
)

for ignore_pattern in "${REQUIRED_IGNORES[@]}"; do
    if ! grep -Fqx "$ignore_pattern" .gitignore 2>/dev/null; then
        echo "⚠️ MANQUE dans .gitignore: '$ignore_pattern'"
    fi
done

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ SECRET-SCAN: PASS - Aucun secret critique tracké"
else
    echo "❌ SECRET-SCAN: FAIL - Secrets bloquants détectés"
fi

exit $EXIT_CODE
