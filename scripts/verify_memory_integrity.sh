#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ — Memory Integrity Verification
# ═══════════════════════════════════════════════════════════════════════════
# Validates memory files: JSON structure, size limits, coherence

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0

echo "🧠 Verifying Memory Integrity..."

# Check 1: Memory directories exist
if [ -d "memory" ] || [ -d ".titane" ]; then
    echo -e "${GREEN}✅${NC} Memory directories present"
else
    echo -e "${YELLOW}⚠️${NC}  Memory directories not initialized"
    exit 0  # Not an error, just not initialized
fi

# Check 2: JSON validation
if command -v jq &> /dev/null; then
    shopt -s nullglob
    for json_file in memory/*.json .titane/*.json; do
        if [ -f "$json_file" ]; then
            if jq empty "$json_file" 2>/dev/null; then
                echo -e "${GREEN}✅${NC} Valid JSON: $(basename $json_file)"
            else
                echo -e "${RED}❌${NC} Invalid JSON: $(basename $json_file)"
                ((ISSUES++))
            fi

            # Check size (< 10MB)
            SIZE=$(du -k "$json_file" | cut -f1)
            if [ "$SIZE" -lt 10240 ]; then
                echo -e "${GREEN}✅${NC} Size OK: $(basename $json_file) (${SIZE}KB)"
            else
                echo -e "${YELLOW}⚠️${NC}  Large file: $(basename $json_file) (${SIZE}KB > 10MB)"
            fi
        fi
    done
    shopt -u nullglob
else
    echo -e "${YELLOW}⚠️${NC}  jq not installed (JSON validation skipped)"
fi

# Check 3: Check for duplicate entries (basic)
if [ -d "memory" ]; then
    DUPLICATES=$(find memory/ -name "*.json" -exec basename {} \; | sort | uniq -d | wc -l)
    if [ "$DUPLICATES" -eq 0 ]; then
        echo -e "${GREEN}✅${NC} No duplicate memory files"
    else
        echo -e "${YELLOW}⚠️${NC}  $DUPLICATES duplicate memory files"
    fi
fi

# Summary
if [ $ISSUES -eq 0 ]; then
    echo -e "\n${GREEN}✅ MEMORY INTEGRITY: CLEAN${NC}"
    exit 0
else
    echo -e "\n${RED}❌ MEMORY INTEGRITY: $ISSUES ISSUES${NC}"
    exit 1
fi
