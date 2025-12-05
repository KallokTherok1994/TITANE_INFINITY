#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ v14 — Phase 4 Cleanup Script (SAFE)
# Supprime UNIQUEMENT les fichiers legacy confirmés non utilisés
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "🧹 TITANE∞ Phase 4 - Legacy Cleanup (SAFE MODE)"
echo "================================================"
echo ""

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 1: VÉRIFIER QUE NOUS SOMMES DANS LE BON RÉPERTOIRE
# ═══════════════════════════════════════════════════════════════

if [ ! -f "package.json" ] || [ ! -d "src-tauri" ]; then
    echo "❌ ERREUR: Ce script doit être exécuté depuis la racine du projet TITANE_INFINITY"
    exit 1
fi

echo "✅ Répertoire validé: $(pwd)"
echo ""

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 2: BACKUP AVANT SUPPRESSION
# ═══════════════════════════════════════════════════════════════

BACKUP_DIR="./backup_legacy_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Création backup dans: $BACKUP_DIR"
echo ""

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 3: IDENTIFIER FICHIERS À SUPPRIMER (SAFE)
# ═══════════════════════════════════════════════════════════════

declare -a FILES_TO_DELETE=(
    # Frontend legacy CSS (si non utilisé - À VÉRIFIER)
    # "src/design-system/titane-v12.css"  # ⚠️ UTILISÉ dans main.tsx - NE PAS SUPPRIMER

    # Backend legacy commands (doublons confirmés)
    # "src-tauri/src/api/legacy_commands.rs"  # ⚠️ Encore importé dans main.rs - NE PAS SUPPRIMER MAINTENANT

    # Documentation legacy (SAFE - juste de la doc)
    "docs/legacy/AUTO_EVOLUTION_v15_ACTIVATED.md"
    "docs/legacy/TITANE_DEPLOY_AI_v12_DOCUMENTATION.md"
    "docs/legacy/ANALYSE_FINALE_v12_TESTS.md"
)

# Dossiers legacy (DANGEREUX - ne pas supprimer sans migration)
declare -a DIRS_TO_SKIP=(
    "src-tauri/src/auto_evolution_v15"  # ⚠️ Utilisé par commands/evolution.rs + meta_mode.rs
    "src-tauri/src/exp_fusion_v15"      # ⚠️ Utilisé par commands/exp_fusion.rs
)

echo "📋 Fichiers à supprimer (SAFE):"
for file in "${FILES_TO_DELETE[@]}"; do
    if [ -e "$file" ]; then
        echo "   - $file"
    fi
done
echo ""

echo "⚠️  Dossiers SKIPPÉS (migration requise):"
for dir in "${DIRS_TO_SKIP[@]}"; do
    if [ -d "$dir" ]; then
        echo "   - $dir (utilisé par frontend/commands)"
    fi
done
echo ""

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 4: CONFIRMER AVANT SUPPRESSION
# ═══════════════════════════════════════════════════════════════

read -p "⚠️  Continuer la suppression? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Opération annulée"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 5: BACKUP + SUPPRESSION
# ═══════════════════════════════════════════════════════════════

DELETED_COUNT=0
SKIPPED_COUNT=0

for file in "${FILES_TO_DELETE[@]}"; do
    if [ -e "$file" ]; then
        # Backup
        backup_path="$BACKUP_DIR/$(dirname "$file")"
        mkdir -p "$backup_path"
        cp "$file" "$backup_path/" 2>/dev/null || echo "   ⚠️  Backup failed: $file"

        # Supprimer
        rm "$file"
        echo "✅ Supprimé: $file"
        ((DELETED_COUNT++))
    else
        echo "⏭️  Ignoré (inexistant): $file"
        ((SKIPPED_COUNT++))
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ CLEANUP"
echo "═══════════════════════════════════════════════════════════"
echo "✅ Fichiers supprimés: $DELETED_COUNT"
echo "⏭️  Fichiers skippés: $SKIPPED_COUNT"
echo "📦 Backup créé: $BACKUP_DIR"
echo ""

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 6: VÉRIFIER COMPILATION
# ═══════════════════════════════════════════════════════════════

echo "🔍 Vérification compilation Rust..."
echo ""

cd src-tauri
if cargo check --lib 2>&1 | tee ../cleanup_check.log; then
    echo ""
    echo "✅ Compilation Rust OK"
else
    echo ""
    echo "❌ ERREUR: Compilation Rust échouée!"
    echo "   Logs: cleanup_check.log"
    echo "   Restaurer backup: cp -r $BACKUP_DIR/* ./"
    exit 1
fi
cd ..

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 CLEANUP SAFE TERMINÉ"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 PROCHAINES ÉTAPES:"
echo "   1. Migrer commands/evolution.rs → engine/auto_evolution.rs"
echo "   2. Vérifier si exp_fusion_v15 utilisé frontend (grep exp_ src)"
echo "   3. Supprimer auto_evolution_v15/ après migration"
echo "   4. Supprimer exp_fusion_v15/ si non utilisé"
echo ""
echo "💾 Backup disponible: $BACKUP_DIR"
echo "   Pour restaurer: cp -r $BACKUP_DIR/* ./"
echo ""
