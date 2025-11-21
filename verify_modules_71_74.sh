#!/bin/bash
# Script de vérification des modules #71-74
# Date: 18 novembre 2025

echo "═════════════════════════════════════════════════════════"
echo "  VERIFICATION MODULES #71-74 — Directional & Identity"
echo "═════════════════════════════════════════════════════════"
echo ""

BASE_PATH="/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/core/backend/system"

# Compteurs
total_files=0
total_lines=0
missing_files=0

# Fonction de vérification
verify_module() {
    local module_name=$1
    local module_path="$BASE_PATH/$module_name"
    
    echo "📦 Module: $module_name"
    echo "   Path: $module_path"
    
    if [ ! -d "$module_path" ]; then
        echo "   ❌ Dossier manquant!"
        ((missing_files++))
        return
    fi
    
    # Compte les fichiers
    local file_count=$(find "$module_path" -name "*.rs" | wc -l)
    total_files=$((total_files + file_count))
    
    echo "   ✅ $file_count fichiers .rs trouvés"
    
    # Liste les fichiers avec leur taille
    find "$module_path" -name "*.rs" -type f | while read -r file; do
        local lines=$(wc -l < "$file")
        total_lines=$((total_lines + lines))
        local basename=$(basename "$file")
        printf "      • %-35s %5d lignes\n" "$basename" "$lines"
    done
    
    echo ""
}

# Vérification des 4 modules
echo "🔍 VERIFICATION STRUCTURE..."
echo ""

verify_module "ifdwe"
verify_module "iaee"
verify_module "seile"
verify_module "iscie"

echo "═════════════════════════════════════════════════════════"
echo "  STATISTIQUES"
echo "═════════════════════════════════════════════════════════"

# Recompte précis pour stats finales
total_files=$(find "$BASE_PATH"/{ifdwe,iaee,seile,iscie} -name "*.rs" 2>/dev/null | wc -l)
total_lines=$(find "$BASE_PATH"/{ifdwe,iaee,seile,iscie} -name "*.rs" -type f -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')

echo "📊 Fichiers totaux:    $total_files"
echo "📊 Lignes totales:     $total_lines"
echo "📊 Fichiers manquants: $missing_files"
echo ""

if [ $missing_files -eq 0 ] && [ $total_files -eq 24 ]; then
    echo "✅ VERIFICATION REUSSIE — Tous les fichiers présents"
    echo ""
    echo "🎯 PROCHAINES ETAPES:"
    echo "   1. Installer Rust/Cargo: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo "   2. Compiler: cargo check --all"
    echo "   3. Tester: cargo test"
    echo ""
    exit 0
else
    echo "⚠️  VERIFICATION INCOMPLETE"
    echo "   Attendu: 24 fichiers"
    echo "   Trouvé:  $total_files fichiers"
    echo ""
    exit 1
fi
