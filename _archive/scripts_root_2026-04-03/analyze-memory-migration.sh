#!/bin/bash

################################################################################
# TITANE∞ - Memory Module Migration Analyzer
# Analyzes current memory module usage and generates migration report
# Phase 1: Memory Consolidation (unified_memory_v2)
################################################################################

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  TITANE∞ - Memory Module Migration Analyzer                  ║"
echo "║  Analyzing memory module usage for consolidation             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
total_imports=0
deprecated_count=0
target_count=0

echo "📊 Analyzing memory module imports..."
echo ""

# Function to count imports
count_imports() {
    local module=$1
    local pattern=$2
    local count=$(grep -r "$pattern" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "^Binary" | wc -l)
    echo "$count"
}

# Analyze each memory module
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TARGET MODULE (Keep)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

target_count=$(count_imports "unified_memory_v2" "use.*unified_memory_v2")
echo -e "${GREEN}✓ unified_memory_v2:${NC} $target_count imports"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DEPRECATED MODULES (To Migrate)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# memory_os
memory_os_count=$(count_imports "memory_os" "use.*memory_os")
echo -e "${YELLOW}⚠ memory_os:${NC} $memory_os_count imports"
deprecated_count=$((deprecated_count + memory_os_count))

# memory_compactor
memory_compactor_count=$(count_imports "memory_compactor" "use.*memory_compactor")
echo -e "${YELLOW}⚠ memory_compactor:${NC} $memory_compactor_count imports"
deprecated_count=$((deprecated_count + memory_compactor_count))

# memory_persistence
memory_persistence_count=$(count_imports "memory_persistence" "use.*memory_persistence")
echo -e "${YELLOW}⚠ memory_persistence:${NC} $memory_persistence_count imports"
deprecated_count=$((deprecated_count + memory_persistence_count))

# memory_evolution
memory_evolution_count=$(count_imports "memory_evolution" "use.*memory_evolution")
echo -e "${YELLOW}⚠ memory_evolution:${NC} $memory_evolution_count imports → neural_memory"
deprecated_count=$((deprecated_count + memory_evolution_count))

echo ""
total_imports=$((target_count + deprecated_count))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Total memory imports:        $total_imports"
echo -e "${GREEN}Target (unified_memory_v2):${NC}  $target_count (${GREEN}$(( target_count * 100 / (total_imports > 0 ? total_imports : 1) ))%${NC})"
echo -e "${YELLOW}Deprecated modules:${NC}          $deprecated_count (${YELLOW}$(( deprecated_count * 100 / (total_imports > 0 ? total_imports : 1) ))%${NC})"
echo ""

if [ $deprecated_count -eq 0 ]; then
    echo -e "${GREEN}✓ Migration Complete!${NC} All imports using unified_memory_v2"
else
    echo -e "${YELLOW}⚠ Migration Needed:${NC} $deprecated_count imports to migrate"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Review imports in deprecated modules"
    echo "   2. Map functionality to unified_memory_v2 APIs"
    echo "   3. Update imports one module at a time"
    echo "   4. Test after each migration"
    echo "   5. Archive deprecated modules when done"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DETAILED FILE LIST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Files using deprecated memory_os:"
grep -r "use.*memory_os" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "^Binary" | cut -d: -f1 | sort -u || echo "  (none)"

echo ""
echo "Files using deprecated memory_compactor:"
grep -r "use.*memory_compactor" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "^Binary" | cut -d: -f1 | sort -u || echo "  (none)"

echo ""
echo "Files using deprecated memory_persistence:"
grep -r "use.*memory_persistence" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "^Binary" | cut -d: -f1 | sort -u || echo "  (none)"

echo ""
echo "Files using deprecated memory_evolution:"
grep -r "use.*memory_evolution" src-tauri/src --include="*.rs" 2>/dev/null | grep -v "^Binary" | cut -d: -f1 | sort -u || echo "  (none)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ESTIMATED EFFORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $deprecated_count -gt 0 ]; then
    # Estimate 15-30 min per import to migrate
    min_hours=$(( (deprecated_count * 15) / 60 ))
    max_hours=$(( (deprecated_count * 30) / 60 ))

    echo "Estimated migration time: ${min_hours}-${max_hours} hours"
    echo "Based on $deprecated_count imports to migrate"
else
    echo "No migration needed! ✓"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Analysis complete! Report saved to: docs/memory-migration-report.txt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Save report to file
{
    echo "TITANE∞ Memory Module Migration Report"
    echo "Generated: $(date)"
    echo ""
    echo "Summary:"
    echo "  Total imports: $total_imports"
    echo "  Unified memory v2: $target_count"
    echo "  Deprecated: $deprecated_count"
    echo ""
    echo "Migration needed: $([ $deprecated_count -gt 0 ] && echo 'YES' || echo 'NO')"

    if [ $deprecated_count -gt 0 ]; then
        echo ""
        echo "Estimated effort: ${min_hours}-${max_hours} hours"
    fi
} > docs/memory-migration-report.txt

exit 0
