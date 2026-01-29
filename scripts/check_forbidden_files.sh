#!/bin/bash
# TITANE∞ P3_STABLE_BUILD - Forbidden Files Scanner
# Vérifie qu'aucun fichier interdit n'est inclus dans le build stable

set -euo pipefail

if [[ -n "${GITHUB_WORKSPACE:-}" ]]; then
    PROJECT_ROOT="$GITHUB_WORKSPACE"
else
    PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

MANIFEST_FILE="$PROJECT_ROOT/runtime/stable/manifest.json"
VIOLATIONS=0

echo "🔍 [P3_FORBIDDEN_SCAN] TITANE∞ Stable Build Forbidden Files Scanner"
echo "====================================================================="

cd "$PROJECT_ROOT"

if [ ! -f "$MANIFEST_FILE" ]; then
    echo "❌ FAIL: runtime/stable/manifest.json not found"
    exit 1
fi

# Extract forbidden patterns from manifest
if command -v jq >/dev/null 2>&1; then
    FORBIDDEN_PATTERNS=$(jq -r '.forbidden_files[]' "$MANIFEST_FILE")
else
    echo "⚠️ WARNING: jq not available, using default patterns"
    FORBIDDEN_PATTERNS="*.env *.key *.pem *secret* *.backup node_modules/ .git/ target/debug/ logs/ *.tmp *.cache"
fi

echo "📋 Scanning for forbidden files in build context..."
echo "Forbidden patterns:"
echo "$FORBIDDEN_PATTERNS" | sed 's/^/  - /'
echo ""

# Scan for each forbidden pattern
for pattern in $FORBIDDEN_PATTERNS; do
    echo "🔍 Scanning pattern: $pattern"
    
    # Use find with different approaches based on pattern type
    case "$pattern" in
        *"/"*)
            # Directory patterns - exclude node_modules and build artifacts
            FOUND_DIRS=$(find . -type d -name "${pattern%/}" \
              ! -path "./node_modules/*" \
              ! -path "./actions-runner/*" \
              ! -path "./src-tauri/target/release/bundle/appimage/*/usr/lib/*" \
              2>/dev/null | grep -v "^\\./\\." || true)
            if [ -n "$FOUND_DIRS" ]; then
                echo "❌ FORBIDDEN DIRECTORIES found:"
                echo "$FOUND_DIRS" | sed 's/^/    /'
                VIOLATIONS=$((VIOLATIONS + 1))
            fi
            ;;
        *secret*)
            # Secret patterns - exclude documentation and evidence files
            FOUND_FILES=$(find . -type f -name "$pattern" \
              ! -path "./docs/*" \
              ! -path "./node_modules/*" \
              ! -path "./actions-runner/*" \
              ! -path "./.github/workflows/*" \
              ! -path "./scripts/security/*" \
              ! -path "./src/__tests__/*" \
              ! -path "./src-tauri/src/security/*" \
              ! -path "./src-tauri/capabilities/*" \
              2>/dev/null | head -20 || true)
            if [ -n "$FOUND_FILES" ]; then
                echo "❌ FORBIDDEN FILES found matching '$pattern':"
                echo "$FOUND_FILES" | sed 's/^/    /'
                VIOLATIONS=$((VIOLATIONS + 1))
            fi
            ;;
        *"*"*)
            # Wildcard patterns - exclude build artifacts and system caches
            FOUND_FILES=$(find . -type f -name "$pattern" \
              ! -path "./node_modules/*" \
              ! -path "./actions-runner/*" \
              ! -path "./src-tauri/target/release/bundle/appimage/*/usr/lib/*" \
              2>/dev/null | head -20 || true)
            if [ -n "$FOUND_FILES" ]; then
                echo "❌ FORBIDDEN FILES found matching '$pattern':"
                echo "$FOUND_FILES" | sed 's/^/    /'
                VIOLATIONS=$((VIOLATIONS + 1))
            fi
            ;;
        *)
            # Exact file names
            FOUND_EXACT=$(find . -name "$pattern" 2>/dev/null | head -10 || true)
            if [ -n "$FOUND_EXACT" ]; then
                echo "❌ FORBIDDEN FILES found: '$pattern'"
                echo "$FOUND_EXACT" | sed 's/^/    /'
                VIOLATIONS=$((VIOLATIONS + 1))
            fi
            ;;
    esac
done

# Additional critical scans
echo ""
echo "📋 Additional security scans..."

# Check for any .env files (critical) - exclude allowlisted paths
ENV_FILES=$(find . -name ".env*" -not -name "*.example" -type f \
  ! -path "./node_modules/*" \
  ! -path "./actions-runner/*" \
  2>/dev/null || true)
if [ -n "$ENV_FILES" ]; then
    echo "❌ CRITICAL: .env files found in build context:"
    echo "$ENV_FILES" | sed 's/^/    /'
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for private keys - exclude system certificates  
PRIVATE_KEYS=$(find . -name "*.key" -o -name "*.pem" -o -name "*.p12" -o -name "*.pfx" \
  -type f ! -path "./node_modules/*" \
  ! -path "./actions-runner/*" \
  ! -path "./.venv/*" \
  ! -name "cacert.pem" \
  2>/dev/null | head -5 || true)
if [ -n "$PRIVATE_KEYS" ]; then
    echo "❌ CRITICAL: Private keys found:"
    echo "$PRIVATE_KEYS" | sed 's/^/    /'
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for backup/temp files in critical areas
TEMP_FILES=$(find src/ runtime/ -name "*.backup" -o -name "*.tmp" -o -name "*~" -type f 2>/dev/null | head -10 || true)
if [ -n "$TEMP_FILES" ]; then
    echo "⚠️ WARNING: Temporary/backup files in source:"
    echo "$TEMP_FILES" | sed 's/^/    /'
fi

# Results
echo ""
if [ $VIOLATIONS -eq 0 ]; then
    echo "✅ P3_FORBIDDEN_SCAN: PASS - No forbidden files detected"
    echo "📊 Build context is clean for stable production"
    
    # Update manifest status
    if command -v jq >/dev/null 2>&1; then
        jq '.last_validation = now | .certification_status = "FORBIDDEN_SCAN_PASSED"' \
            "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    fi
    
    exit 0
else
    echo "❌ P3_FORBIDDEN_SCAN: FAIL - $VIOLATIONS violations detected"
    echo "🔧 SOLUTION: Remove or ignore forbidden files before stable build"
    
    # Update manifest status
    if command -v jq >/dev/null 2>&1; then
        jq '.last_validation = now | .certification_status = "FORBIDDEN_SCAN_FAILED"' \
            "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    fi
    
    exit 1
fi