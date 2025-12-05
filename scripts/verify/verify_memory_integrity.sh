#!/usr/bin/env bash
# TITANE∞ v14 — Memory Integrity Verification
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — MEMORY INTEGRITY VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"

ERRORS=0
MEMORY_DIR="./memory"

# Check if memory directory exists
if [ ! -d "$MEMORY_DIR" ]; then
    echo "⚠️  Memory directory not found, creating: $MEMORY_DIR"
    mkdir -p "$MEMORY_DIR"
fi

# Validate JSON files in memory directory
echo "→ Validating JSON files in memory/..."

JSON_FILES=$(find "$MEMORY_DIR" -name "*.json" 2>/dev/null || true)

if [ -z "$JSON_FILES" ]; then
    echo "⚠️  No JSON files found in memory/"
else
    for file in $JSON_FILES; do
        if jq empty "$file" 2>/dev/null; then
            SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
            SIZE_MB=$(echo "scale=2; $SIZE / 1048576" | bc)

            if (( $(echo "$SIZE_MB > 10" | bc -l) )); then
                echo "⚠️  $file: ${SIZE_MB}MB (> 10MB limit)"
                ((ERRORS++))
            else
                echo "✅ $file: ${SIZE_MB}MB (valid JSON)"
            fi
        else
            echo "❌ $file: Invalid JSON"
            ((ERRORS++))
        fi
    done
fi

# Check for duplicate entries (basic check using jq)
echo "→ Checking for duplicate entries..."

for file in $JSON_FILES; do
    if [ -f "$file" ]; then
        DUPLICATES=$(jq 'if type == "array" then group_by(.id) | map(select(length > 1)) | length else 0 end' "$file" 2>/dev/null || echo "0")

        if [ "$DUPLICATES" != "0" ]; then
            echo "⚠️  $file: $DUPLICATES duplicate ID(s) detected"
            ((ERRORS++))
        fi
    fi
done

# Check memory compactor module
if [ -f "src-tauri/src/memory_compactor.rs" ]; then
    echo "✅ MemoryCompactor module found"
else
    echo "⚠️  MemoryCompactor module not found"
fi

# Summary
echo "═══════════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo "✅ MEMORY INTEGRITY: ALL CHECKS PASSED"
    exit 0
else
    echo "❌ MEMORY INTEGRITY: $ERRORS ERROR(S) DETECTED"
    exit 1
fi
