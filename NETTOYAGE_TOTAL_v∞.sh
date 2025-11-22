#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# TITANE∞ - NETTOYAGE TOTAL ET DÉFINITIF v∞
# ═══════════════════════════════════════════════════════════════════

set -e

PROJECT_ROOT="/home/titane/Documents/TITANE_INFINITY"
cd "$PROJECT_ROOT"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 TITANE∞ v∞ - NETTOYAGE TOTAL ET DÉFINITIF"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REPORT_FILE="RAPPORT_NETTOYAGE_TOTAL_v∞.md"
echo "# RAPPORT DE NETTOYAGE TOTAL v∞" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# ═══════════════════════════════════════════════════════════════════
# PHASE 1: SUPPRESSION DES ARTEFACTS DE BUILD
# ═══════════════════════════════════════════════════════════════════
echo "📦 PHASE 1: Suppression des artefacts de build..."
echo "" >> "$REPORT_FILE"
echo "## PHASE 1: Artefacts de build supprimés" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Sauvegarder la taille avant
TARGET_SIZE=$(du -sh src-tauri/target 2>/dev/null | cut -f1 || echo "0")
DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "0")

if [ -d "src-tauri/target" ]; then
    echo "  🗑️  Suppression de src-tauri/target/ ($TARGET_SIZE)..."
    rm -rf src-tauri/target/
    echo "- src-tauri/target/ ($TARGET_SIZE)" >> "$REPORT_FILE"
fi

if [ -d "dist" ]; then
    echo "  🗑️  Suppression de dist/ ($DIST_SIZE)..."
    rm -rf dist/
    echo "- dist/ ($DIST_SIZE)" >> "$REPORT_FILE"
fi

# Supprimer les caches
for cache_dir in .vite .cache .parcel-cache node_modules/.cache node_modules/.vite; do
    if [ -d "$cache_dir" ]; then
        echo "  🗑️  Suppression de $cache_dir..."
        rm -rf "$cache_dir"
        echo "- $cache_dir" >> "$REPORT_FILE"
    fi
done

# ═══════════════════════════════════════════════════════════════════
# PHASE 2: SUPPRESSION DES FICHIERS BACKUP
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "📂 PHASE 2: Suppression des fichiers backup..."
echo "" >> "$REPORT_FILE"
echo "## PHASE 2: Fichiers backup supprimés" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Fichiers backup frontend
BACKUP_FILES=(
    "src/App.backup.v15.5.tsx"
    "src/App.new.tsx"
    "src/pages/DevTools.v20.css"
    "src/components/ModuleCard.v2.tsx"
    "src/components/ModuleCard.v2.css"
)

for file in "${BACKUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  🗑️  $file"
        rm -f "$file"
        echo "- $file" >> "$REPORT_FILE"
    fi
done

# Fichiers backup backend
BACKEND_BACKUP_FILES=(
    "src-tauri/Cargo.toml.backup"
    "src-tauri/Cargo.toml.original"
    "src-tauri/build.rs.backup"
    "src-tauri/src/main.rs.backup_110945"
    "src-tauri/src/main.rs.old_v10.4.0"
    "src-tauri/src/main.rs.backup_v17.1"
    "src-tauri/src/main.rs.before_autofix"
    "src-tauri/src/main_original.rs"
)

for file in "${BACKEND_BACKUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  🗑️  $file"
        rm -f "$file"
        echo "- $file" >> "$REPORT_FILE"
    fi
done

# ═══════════════════════════════════════════════════════════════════
# PHASE 3: SUPPRESSION DES DOSSIERS TEMPORAIRES
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "🗂️  PHASE 3: Suppression des dossiers temporaires..."
echo "" >> "$REPORT_FILE"
echo "## PHASE 3: Dossiers temporaires supprimés" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

TEMP_DIRS=(
    "deploy_v16.1_prod"
    "archived_logs"
    "backups"
    "test_persona_v24"
    "titane-infinity@9.0.0"
)

for dir in "${TEMP_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "  🗑️  $dir ($SIZE)"
        rm -rf "$dir"
        echo "- $dir ($SIZE)" >> "$REPORT_FILE"
    fi
done

# ═══════════════════════════════════════════════════════════════════
# PHASE 4: ARCHIVAGE DE LA DOCUMENTATION LEGACY
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "📚 PHASE 4: Archivage de la documentation legacy..."
echo "" >> "$REPORT_FILE"
echo "## PHASE 4: Documentation archivée" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Créer le dossier d'archive si nécessaire
mkdir -p docs/archive

# Lister les patterns de docs à archiver
DOC_PATTERNS=(
    "*v8.*"
    "*v9.*"
    "*v10.*"
    "*v11.*"
    "*v12.*"
    "*v13.*"
    "*v14.*"
    "*v15.*"
    "*v16.*"
    "*v17.0*"
    "*v17.1*"
    "BADGE_*.txt"
    "MODULE_*_COMPLETE.md"
    "MODULES_*_LAYER.md"
    "RAPPORT_*.md"
    "RAPPORT_*.txt"
    "MESSAGE_*.md"
    "VALIDATION_*.md"
    "VERIFICATION_*.md"
    "STATUT_*.md"
    "STATUS_*.md"
    "STATUS_*.txt"
    "SYNTHESE_*.md"
    "RESUME_*.md"
    "SESSION_*.md"
    "DEPLOYMENT_*.md"
    "QUICK_*.md"
    "GUIDE_*.md"
    "FIX_*.md"
    "FIX_*.txt"
    "AUDIT_*.md"
    "CHANGELOG_v*.md"
    "COMPLETION_*.md"
    "CORRECTION_*.md"
)

ARCHIVED_COUNT=0
for pattern in "${DOC_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] && [ "$file" != "$REPORT_FILE" ]; then
            mv "$file" docs/archive/
            ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
        fi
    done
done

echo "  📦 $ARCHIVED_COUNT fichiers archivés dans docs/archive/"
echo "- $ARCHIVED_COUNT fichiers de documentation legacy archivés" >> "$REPORT_FILE"

# ═══════════════════════════════════════════════════════════════════
# PHASE 5: SUPPRESSION DES SCRIPTS OBSOLÈTES
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "🔧 PHASE 5: Suppression des scripts obsolètes..."
echo "" >> "$REPORT_FILE"
echo "## PHASE 5: Scripts obsolètes supprimés" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Scripts à garder (essentiels)
KEEP_SCRIPTS=(
    "NETTOYAGE_TOTAL_v∞.sh"
    "start.sh"
    "build_production.sh"
)

# Créer dossier scripts/archive
mkdir -p scripts/archive

SCRIPT_COUNT=0
for script in *.sh; do
    if [ -f "$script" ]; then
        KEEP=false
        for keep_script in "${KEEP_SCRIPTS[@]}"; do
            if [ "$script" = "$keep_script" ]; then
                KEEP=true
                break
            fi
        done

        if [ "$KEEP" = false ]; then
            mv "$script" scripts/archive/
            SCRIPT_COUNT=$((SCRIPT_COUNT + 1))
        fi
    fi
done

# Archiver les scripts Python de fix
for pyfile in fix_*.py; do
    if [ -f "$pyfile" ]; then
        mv "$pyfile" scripts/archive/
        SCRIPT_COUNT=$((SCRIPT_COUNT + 1))
    fi
done

echo "  📦 $SCRIPT_COUNT scripts archivés dans scripts/archive/"
echo "- $SCRIPT_COUNT scripts obsolètes archivés" >> "$REPORT_FILE"

# ═══════════════════════════════════════════════════════════════════
# PHASE 6: NETTOYAGE DES FICHIERS TXT
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "📝 PHASE 6: Nettoyage des fichiers .txt..."
echo "" >> "$REPORT_FILE"
echo "## PHASE 6: Fichiers .txt supprimés" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

TXT_PATTERNS=(
    "*REPORT*.txt"
    "*STATUS*.txt"
    "*FINAL*.txt"
    "*COMPLETE*.txt"
    "*BADGE*.txt"
    "*.txt"
)

TXT_COUNT=0
for pattern in "${TXT_PATTERNS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] && [[ ! "$file" =~ ^BUILD_PRODUCTION\.txt$ ]]; then
            rm -f "$file"
            TXT_COUNT=$((TXT_COUNT + 1))
        fi
    done
done

echo "  🗑️  $TXT_COUNT fichiers .txt supprimés"
echo "- $TXT_COUNT fichiers .txt obsolètes" >> "$REPORT_FILE"

# ═══════════════════════════════════════════════════════════════════
# PHASE 7: NETTOYAGE FICHIERS SYSTÈME
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "🖥️  PHASE 7: Nettoyage fichiers système..."

# .DS_Store et Thumbs.db
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true

# Fichiers lock temporaires
rm -f .watchmanconfig 2>/dev/null || true

echo "  ✅ Fichiers système nettoyés"

# ═══════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ NETTOYAGE TERMINÉ AVEC SUCCÈS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Rapport généré: $REPORT_FILE"
echo ""

# Statistiques finales
echo "" >> "$REPORT_FILE"
echo "## Statistiques finales" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- Dossiers racine restants: $(find . -maxdepth 1 -type d | wc -l)" >> "$REPORT_FILE"
echo "- Fichiers .md racine restants: $(find . -maxdepth 1 -type f -name "*.md" | wc -l)" >> "$REPORT_FILE"
echo "- Scripts .sh racine restants: $(find . -maxdepth 1 -type f -name "*.sh" | wc -l)" >> "$REPORT_FILE"
echo "- Fichiers .txt racine restants: $(find . -maxdepth 1 -type f -name "*.txt" | wc -l)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "✅ Nettoyage terminé avec succès!" >> "$REPORT_FILE"

echo "✨ Le projet TITANE∞ est maintenant propre et optimisé!"
