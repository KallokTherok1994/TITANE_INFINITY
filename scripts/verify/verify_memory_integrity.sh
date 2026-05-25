#!/usr/bin/env bash
# TITANE∞ v14 — Memory Integrity Verification
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — MEMORY INTEGRITY VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"

ERRORS=0
MEMORY_DIR="./memory"
HAS_JQ=0
HAS_NODE=0

if command -v jq >/dev/null 2>&1; then
    HAS_JQ=1
fi

if command -v node >/dev/null 2>&1; then
    HAS_NODE=1
fi

validate_json_file() {
    local file="$1"

    if [ "$HAS_JQ" -eq 1 ]; then
        jq empty "$file" >/dev/null 2>&1
        return $?
    fi

    if [ "$HAS_NODE" -eq 1 ]; then
        node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'))" "$file" >/dev/null 2>&1
        return $?
    fi

    return 2
}

json_duplicate_count() {
    local file="$1"

    if [ "$HAS_JQ" -eq 1 ]; then
        jq 'if type == "array" then group_by(.id) | map(select(length > 1)) | length else 0 end' "$file" 2>/dev/null || echo "0"
        return
    fi

    if [ "$HAS_NODE" -eq 1 ]; then
        node -e "const data=JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8')); if (!Array.isArray(data)) { console.log(0); process.exit(0); } const seen=new Set(); const dup=new Set(); for (const item of data) { if (!item || item.id == null) continue; if (seen.has(item.id)) dup.add(item.id); seen.add(item.id); } console.log(dup.size);" "$file" 2>/dev/null || echo "0"
        return
    fi

    echo "0"
}

size_mb_label() {
    local size="$1"

    if [ "$HAS_NODE" -eq 1 ]; then
        node -e "console.log((Number(process.argv[1]) / 1048576).toFixed(2))" "$size"
        return
    fi

    echo "$size bytes"
}

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
        if validate_json_file "$file"; then
            SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
            SIZE_MB=$(size_mb_label "$SIZE")

            if [ "$SIZE" -gt 10485760 ]; then
                echo "⚠️  $file: ${SIZE_MB}MB (> 10MB limit)"
                ((ERRORS++))
            else
                echo "✅ $file: ${SIZE_MB}MB (valid JSON)"
            fi
        elif [ "$HAS_JQ" -eq 0 ] && [ "$HAS_NODE" -eq 0 ]; then
            echo "❌ $file: Cannot validate JSON (jq/node unavailable)"
            ((ERRORS++))
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
        DUPLICATES=$(json_duplicate_count "$file")

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
