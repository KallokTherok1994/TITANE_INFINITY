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
    # Environnement files
    "^\\.env$"
    "^\\.env\\."
    "^\\.envrc$"
    "^\\.current-server-info$"
    # Secrets/keys
    "secret.*\\.json$"
    ".*\\.key$"
    ".*\\.pem$"
    "id_rsa$"
    "id_ed25519$"
    # Tunnel configs
    "tunnel.*\\.json$"
    "cloudflare.*\\.json$"
    # Temporary/generated
    "^temp.*"
    "^tmp.*"
    ".*\\.tmp$"
    # Logs avec potentiels secrets
    ".*\\.log$"
    "logs/.*"
)

# Extensions/patterns autorisés (.example, .template, etc.)
ALLOWED_EXCEPTIONS=(
    ".*\\.example$"
    ".*\\.template$"
    ".*\\.sample$"
    "README\\.md$"
    "SECRETS\\.md$"
)

EXIT_CODE=0

echo "📋 Phase 1: Scan fichiers trackés git..."
TRACKED_FILES=$(git ls-files)

while IFS= read -r file; do
    for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
        if echo "$file" | grep -qE "$pattern"; then
            # Vérifier exceptions
            EXCEPTION_FOUND=false
            for exception in "${ALLOWED_EXCEPTIONS[@]}"; do
                if echo "$file" | grep -qE "$exception"; then
                    EXCEPTION_FOUND=true
                    break
                fi
            done
            
            if [ "$EXCEPTION_FOUND" = false ]; then
                echo "❌ BLOQUANT: fichier sensible tracké '$file'"
                EXIT_CODE=1
            fi
        fi
    done
done <<< "$TRACKED_FILES"

echo ""
echo "📋 Phase 2: Scan contenu pour patterns secrets..."

# Scan content pour API keys, tokens, etc.
if command -v git >/dev/null 2>&1; then
    # Patterns de contenu secrets
    SECRET_CONTENT_PATTERNS=(
        "api[_-]?key.*[=:].*[A-Za-z0-9+/]{20,}"
        "secret[_-]?key.*[=:].*[A-Za-z0-9+/]{20,}"
        "access[_-]?token.*[=:].*[A-Za-z0-9+/]{20,}"
        "password.*[=:].*[A-Za-z0-9+/!@#$%^&*]{8,}"
        "bearer.*[A-Za-z0-9+/]{20,}"
        "BEGIN.*PRIVATE.*KEY"
    )
    
    for pattern in "${SECRET_CONTENT_PATTERNS[@]}"; do
        MATCHES=$(git ls-files -z | xargs -0 grep -lE "$pattern" 2>/dev/null | grep -v ".example" | grep -v "test" | grep -v ".md" | head -5 || true)
        if [ -n "$MATCHES" ]; then
            echo "⚠️ PATTERN SECRET détecté dans:"
            echo "$MATCHES"
            # Note: warn seulement, pas bloquant car peut être false positive
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
    if ! grep -qx "$ignore_pattern" .gitignore 2>/dev/null; then
        echo "⚠️ MANQUE dans .gitignore: '$ignore_pattern'"
        # Note: warn seulement, pas bloquant si pas de fichier correspondant
    fi
done

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ SECRET-SCAN: PASS - Aucun secret critique tracké"
else
    echo "❌ SECRET-SCAN: FAIL - Secrets bloquants détectés"
fi

exit $EXIT_CODE