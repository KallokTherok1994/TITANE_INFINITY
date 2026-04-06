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

# Restrict scans to release/build surfaces only.
SCAN_ROOTS=(
    "runtime"
    "src"
    "dist"
    "build"
    "src-tauri/target/release/bundle"
    "deployment/latest"
)

# Explicit non-release paths to ignore.
IGNORED_PATH_GLOBS=(
    "*/.venv/*"
    "*/.tools/*"
    "*/proof_packs/*"
    "*/node_modules/*"
    "*/.git/*"
    "*/.cache/*"
    "*/cache/*"
    "*/caches/*"
    "*/tmp/*"
    "*/.tmp/*"
    "runtime/dev/*"
    "*/runtime/dev/*"
    "src-tauri/target/release/bundle/appimage/*.AppDir/usr/lib/**/*.cache"
    "src-tauri/target/release/bundle/appimage/*.AppDir/usr/lib/*.cache"
    "*/logs/*"
    "*/scripts/logs/*"
    "*/scripts/diagnostic/logs/*"
)

EXISTING_SCAN_ROOTS=()

build_ignore_args() {
    local args=()
    local p
    for p in "${IGNORED_PATH_GLOBS[@]}"; do
        args+=( ! -path "$p" )
    done
    printf '%s\n' "${args[@]}"
}

scan_find_files() {
    local pattern="$1"
    if [ ${#EXISTING_SCAN_ROOTS[@]} -eq 0 ]; then
        return 0
    fi
    mapfile -t _ignore_args < <(build_ignore_args)
    find "${EXISTING_SCAN_ROOTS[@]}" -type f -name "$pattern" "${_ignore_args[@]}" 2>/dev/null | head -20 || true
}

scan_find_dirs() {
    local name="$1"
    if [ ${#EXISTING_SCAN_ROOTS[@]} -eq 0 ]; then
        return 0
    fi
    mapfile -t _ignore_args < <(build_ignore_args)
    find "${EXISTING_SCAN_ROOTS[@]}" -type d -name "$name" "${_ignore_args[@]}" 2>/dev/null | head -20 || true
}

echo "🔍 [P3_FORBIDDEN_SCAN] TITANE∞ Stable Build Forbidden Files Scanner"
echo "====================================================================="

cd "$PROJECT_ROOT"

for root in "${SCAN_ROOTS[@]}"; do
    if [ -e "$root" ]; then
        EXISTING_SCAN_ROOTS+=("$root")
    fi
done

if [ ${#EXISTING_SCAN_ROOTS[@]} -eq 0 ]; then
    echo "❌ FAIL: no release scan roots found"
    exit 1
fi

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
echo "Release scan roots:"
printf '  - %s\n' "${EXISTING_SCAN_ROOTS[@]}"
echo "Ignored path globs:"
printf '  - %s\n' "${IGNORED_PATH_GLOBS[@]}"
echo "Forbidden patterns:"
echo "$FORBIDDEN_PATTERNS" | sed 's/^/  - /'
echo ""

# Scan for each forbidden pattern
for pattern in $FORBIDDEN_PATTERNS; do
    echo "🔍 Scanning pattern: $pattern"
    
    # Use find with different approaches based on pattern type
    case "$pattern" in
        *"/"*)
            # Directory patterns within release scan roots only.
            FOUND_DIRS=$(scan_find_dirs "${pattern%/}")
            if [ -n "$FOUND_DIRS" ]; then
                echo "❌ FORBIDDEN DIRECTORIES found:"
                echo "$FOUND_DIRS" | sed 's/^/    /'
                VIOLATIONS=$((VIOLATIONS + 1))
            fi
            ;;
        *secret*)
            # Secret patterns within release scan roots only.
            FOUND_FILES=$(scan_find_files "$pattern")
            if [ -n "$FOUND_FILES" ]; then
                echo "❌ FORBIDDEN FILES found matching '$pattern':"
                echo "$FOUND_FILES" | sed 's/^/    /'
                VIOLATIONS=$((VIOLATIONS + 1))
            fi
            ;;
        *"*"*)
            # Wildcard patterns within release scan roots only.
            FOUND_FILES=$(scan_find_files "$pattern")
            if [ -n "$FOUND_FILES" ]; then
                echo "❌ FORBIDDEN FILES found matching '$pattern':"
                echo "$FOUND_FILES" | sed 's/^/    /'
                VIOLATIONS=$((VIOLATIONS + 1))
            fi
            ;;
        *)
            # Exact file names
            FOUND_EXACT=$(scan_find_files "$pattern")
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

# Check for any .env files (critical) in release roots.
if [ ${#EXISTING_SCAN_ROOTS[@]} -gt 0 ]; then
    mapfile -t _ignore_args < <(build_ignore_args)
fi
ENV_FILES=$(find "${EXISTING_SCAN_ROOTS[@]}" -name ".env*" -not -name "*.example" -type f \
    "${_ignore_args[@]}" 2>/dev/null || true)
if [ -n "$ENV_FILES" ]; then
    echo "❌ CRITICAL: .env files found in build context:"
    echo "$ENV_FILES" | sed 's/^/    /'
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for private keys in release roots.
PRIVATE_KEYS=$(find "${EXISTING_SCAN_ROOTS[@]}" \( -name "*.key" -o -name "*.pem" -o -name "*.p12" -o -name "*.pfx" \) \
  -type f "${_ignore_args[@]}" \
  ! -name "cacert.pem" \
  2>/dev/null | head -5 || true)
if [ -n "$PRIVATE_KEYS" ]; then
    echo "❌ CRITICAL: Private keys found:"
    echo "$PRIVATE_KEYS" | sed 's/^/    /'
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for backup/temp files in critical areas
TEMP_FILES=$(find runtime src -type f \( -name "*.backup" -o -name "*.tmp" -o -name "*~" \) 2>/dev/null | head -10 || true)
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
        jq '.last_validation = now
            | .certification_status = "FORBIDDEN_SCAN_PASSED"
            | .p3_3_forbidden_scan.status = "PASS"
            | .p3_3_forbidden_scan.last_run = now
            | .p3_3_forbidden_scan.violations = 0' \
            "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    fi
    
    exit 0
else
    echo "❌ P3_FORBIDDEN_SCAN: FAIL - $VIOLATIONS violations detected"
    echo "🔧 SOLUTION: Remove or ignore forbidden files before stable build"
    
    # Update manifest status
    if command -v jq >/dev/null 2>&1; then
        jq '.last_validation = now
            | .certification_status = "FORBIDDEN_SCAN_FAILED"
            | .p3_3_forbidden_scan.status = "FAIL"
            | .p3_3_forbidden_scan.last_run = now
            | .p3_3_forbidden_scan.violations = $violations' \
            --argjson violations "$VIOLATIONS" \
            "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    fi
    
    exit 1
fi