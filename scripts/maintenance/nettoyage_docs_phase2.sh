#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# TITANE∞ - NETTOYAGE DOCUMENTATION PHASE 2
# ═══════════════════════════════════════════════════════════════════

set -e

PROJECT_ROOT="/home/titane/Documents/TITANE_INFINITY"
cd "$PROJECT_ROOT"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 TITANE∞ - NETTOYAGE DOCUMENTATION PHASE 2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fichiers essentiels à garder à la racine
KEEP_FILES=(
    "README.md"
    "README.v24.md"
    "CHANGELOG.md"
    "ARCHITECTURE.md"
    "ARCHITECTURE_RULES_v17.md"
    "BACKEND_ARCHITECTURE.md"
    "BACKEND_REFACTOR_SUMMARY_v17.2.0.md"
    "COMPONENT_REFERENCE.md"
    "DESIGN_SYSTEM_GUIDE.md"
    "BUILD_PRODUCTION.txt"
    "LICENSE"
    ".copilot-rules-permanent.md"
    "REGLES_PERMANENTES_KEVIN_THIBAULT.md"
    "RAPPORT_NETTOYAGE_TOTAL_v∞.md"
    "NETTOYAGE_TOTAL_v∞.sh"
)

# Créer le dossier d'archive docs/legacy si nécessaire
mkdir -p docs/legacy

ARCHIVED=0
KEPT=0

# Parcourir tous les fichiers .md à la racine
for file in *.md; do
    if [ -f "$file" ]; then
        SHOULD_KEEP=false

        # Vérifier si le fichier est dans la liste à garder
        for keep_file in "${KEEP_FILES[@]}"; do
            if [ "$file" = "$keep_file" ]; then
                SHOULD_KEEP=true
                KEPT=$((KEPT + 1))
                break
            fi
        done

        # Si pas à garder, archiver
        if [ "$SHOULD_KEEP" = false ]; then
            mv "$file" docs/legacy/
            ARCHIVED=$((ARCHIVED + 1))
        fi
    fi
done

echo "✅ Documentation nettoyée:"
echo "   📦 $ARCHIVED fichiers archivés dans docs/legacy/"
echo "   📄 $KEPT fichiers essentiels conservés"
echo ""

# Nettoyer les fichiers restants non-MD obsolètes
echo "🧹 Nettoyage final..."

# Supprimer les fichiers spécifiques obsolètes
rm -f tsc 2>/dev/null || true
rm -f 💥 2>/dev/null || true
rm -f "*Phase" 2>/dev/null || true
rm -f "auto_fix_report_"*.txt 2>/dev/null || true

echo "✅ Nettoyage phase 2 terminé!"
echo ""
