#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║         TITANE∞ CORE — ANALYSEUR SIMPLE DE SCRIPTS v1.0                     ║
# ║         Version simplifiée sans expressions complexes                      ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
ANALYSIS_DIR="$SCRIPT_DIR/analysis"
REPORT_FILE="$ANALYSIS_DIR/simple_analysis_$(date +%Y%m%d_%H%M%S).txt"

# Métriques d'analyse
TOTAL_SCRIPTS=0
OBSOLETE_SCRIPTS=0
LARGE_SCRIPTS=0

echo "🔍 TITANE∞ Simple Script Analyzer"
echo "=================================="

# Créer répertoire d'analyse
mkdir -p "$ANALYSIS_DIR"

# Trouver tous les scripts
echo "📂 Finding scripts..."
SCRIPTS=$(find "$REPO_ROOT/scripts" -name "*.sh" -type f -not -path "*/_archive/*" -not -path "*/node_modules/*" 2>/dev/null | head -20)

echo "📊 Analyzing scripts..."
echo "" > "$REPORT_FILE"

for script in $SCRIPTS; do
    TOTAL_SCRIPTS=$((TOTAL_SCRIPTS + 1))
    SCRIPT_NAME=$(basename "$script")

    echo "🔍 $SCRIPT_NAME"

    # Analyse basique
    LINES=$(wc -l < "$script")
    SIZE=$(du -h "$script" | cut -f1)
    MODIFIED=$(stat -c '%Y' "$script" 2>/dev/null || echo "0")
    DAYS_OLD=$(( ($(date +%s) - MODIFIED) / 86400 ))

    # Vérifier si exécutable
    EXECUTABLE="No"
    if [[ -x "$script" ]]; then
        EXECUTABLE="Yes"
    fi

    # Vérifier version
    HAS_VERSION="No"
    if grep -q "v[0-9]\+\.[0-9]\+\.[0-9]\+" "$script" 2>/dev/null; then
        HAS_VERSION="Yes"
    fi

    # Vérifier si gros fichier
    IS_LARGE="No"
    if [[ $LINES -gt 1000 ]]; then
        IS_LARGE="Yes"
        LARGE_SCRIPTS=$((LARGE_SCRIPTS + 1))
    fi

    # Vérifier si vieux
    IS_OLD="No"
    if [[ $DAYS_OLD -gt 180 ]]; then
        IS_OLD="Yes"
        OBSOLETE_SCRIPTS=$((OBSOLETE_SCRIPTS + 1))
    fi

    # Écrire dans le rapport
    {
        echo "=== $SCRIPT_NAME ==="
        echo "Path: $script"
        echo "Lines: $LINES"
        echo "Size: $SIZE"
        echo "Executable: $EXECUTABLE"
        echo "Has version: $HAS_VERSION"
        echo "Days old: $DAYS_OLD"
        echo "Is large (>1000 lines): $IS_LARGE"
        echo "Is old (>180 days): $IS_OLD"
        echo ""
    } >> "$REPORT_FILE"

done

# Rapport final
{
    echo "=================================="
    echo "SUMMARY REPORT"
    echo "=================================="
    echo "Total scripts analyzed: $TOTAL_SCRIPTS"
    echo "Large scripts (>1000 lines): $LARGE_SCRIPTS"
    echo "Old scripts (>180 days): $OBSOLETE_SCRIPTS"
    echo ""
    echo "Recommendations:"
    if [[ $OBSOLETE_SCRIPTS -gt 0 ]]; then
        echo "- Review $OBSOLETE_SCRIPTS old scripts for archiving"
    fi
    if [[ $LARGE_SCRIPTS -gt 0 ]]; then
        echo "- Consider splitting $LARGE_SCRIPTS large scripts"
    fi
    echo ""
    echo "Full report: $REPORT_FILE"
} >> "$REPORT_FILE"

echo ""
echo "✅ Simple analysis completed!"
echo "📄 Report: $REPORT_FILE"
echo ""
echo "📊 Summary:"
echo "   Total scripts: $TOTAL_SCRIPTS"
echo "   Large scripts: $LARGE_SCRIPTS"
echo "   Old scripts: $OBSOLETE_SCRIPTS"
