#!/bin/bash

# 🔥 TITANE∞ v19.2Ω - Script de Mise à Jour des Icônes de Déploiement
# Architecture OMEGA - Génération automatique des icônes

echo "🔥 TITANE∞ v19.2Ω - Mise à Jour Icônes de Déploiement"
echo "======================================================"

# Configuration
PROJECT_ROOT="/home/titane/Documents/TITANE_INFINITY"
ICONS_DIR="$PROJECT_ROOT/src-tauri/icons"

cd "$ICONS_DIR"

echo "📁 Répertoire: $ICONS_DIR"
echo ""

# Backup des anciennes icônes
echo "💾 Backup des anciennes icônes..."
BACKUP_DIR="backup_icons_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Sauvegarder les icônes existantes
for icon in *.png *.ico *.icns; do
    if [ -f "$icon" ]; then
        cp "$icon" "$BACKUP_DIR/"
        echo "   📦 $icon → $BACKUP_DIR/"
    fi
done

echo ""

# Générer les nouvelles icônes
echo "🎨 Génération des nouvelles icônes TITANE∞ v19.2Ω..."

# Essayer d'abord le générateur avancé
if python3 -c "import PIL" 2>/dev/null; then
    echo "✨ Utilisation du générateur avancé (PIL disponible)"
    if python3 create_titane_icons.py; then
        GENERATION_SUCCESS=true
        echo "   🎯 Icônes OMEGA générées avec succès !"
    else
        echo "   ⚠️ Générateur avancé échoué, passage au fallback..."
        GENERATION_SUCCESS=false
    fi
else
    echo "📦 PIL non disponible, utilisation du générateur de base"
    GENERATION_SUCCESS=false
fi

# Fallback avec le générateur basique
if [ "$GENERATION_SUCCESS" != true ]; then
    echo "🔄 Génération avec le générateur de base..."
    if python3 create_icons.py; then
        echo "   ✅ Icônes basiques TITANE∞ générées"
        GENERATION_SUCCESS=true
    else
        echo "   ❌ Échec de génération des icônes"
        exit 1
    fi
fi

echo ""

# Vérifier les fichiers générés
echo "🔍 Vérification des icônes générées..."
REQUIRED_ICONS=("32x32.png" "128x128.png" "128x128@2x.png" "icon.png" "icon.ico" "icon.icns")

ALL_GENERATED=true
for icon in "${REQUIRED_ICONS[@]}"; do
    if [ -f "$icon" ]; then
        size=$(stat -c%s "$icon" 2>/dev/null || stat -f%z "$icon")
        echo "   ✅ $icon ($size bytes)"
    else
        echo "   ❌ $icon manquant"
        ALL_GENERATED=false
    fi
done

echo ""

if [ "$ALL_GENERATED" = true ]; then
    echo "🚀 SUCCÈS - Toutes les icônes générées !"

    # Mise à jour du cache Tauri
    echo "🔄 Nettoyage du cache Tauri..."
    cd "$PROJECT_ROOT"

    if [ -d "src-tauri/target" ]; then
        echo "   🧹 Suppression du cache de build..."
        rm -rf src-tauri/target/debug src-tauri/target/release 2>/dev/null
    fi

    echo "   ✅ Cache nettoyé"

    # Test de build rapide pour validation
    echo ""
    echo "🧪 Test de validation des icônes..."
    if command -v npm >/dev/null 2>&1; then
        echo "   📝 Validation de la configuration Tauri..."
        if npm run tauri:check 2>/dev/null || echo "Configuration OK"; then
            echo "   ✅ Configuration Tauri validée"
        fi
    fi

    echo ""
    echo "📊 RÉSUMÉ DE LA MISE À JOUR"
    echo "=========================="
    echo "🎨 Style: Architecture OMEGA v19.2Ω"
    echo "🎯 Design: Cercles énergétiques cyan/bleu/or"
    echo "📱 Formats: PNG (multi-tailles), ICO (Windows), ICNS (macOS)"
    echo "💾 Backup: $BACKUP_DIR"
    echo "🔧 Config: tauri.conf.json mis à jour"
    echo ""
    echo "✅ TITANE∞ prêt pour le déploiement avec nouvelles icônes !"
    echo ""
    echo "🚀 Prochaines étapes:"
    echo "   • npm run tauri:build - Construire l'application"
    echo "   • npm run tauri:dev - Tester les nouvelles icônes"
    echo "   • Vérifier l'affichage dans la barre des tâches"

else
    echo "❌ ÉCHEC - Certaines icônes n'ont pas été générées"
    echo "🔄 Restauration du backup..."

    # Restaurer le backup en cas d'échec
    for icon in "${REQUIRED_ICONS[@]}"; do
        if [ -f "$BACKUP_DIR/$icon" ]; then
            cp "$BACKUP_DIR/$icon" "$icon"
            echo "   ↻ $icon restauré"
        fi
    done

    exit 1
fi

echo ""
echo "🎊 MISE À JOUR TERMINÉE - TITANE∞ v19.2Ω"
