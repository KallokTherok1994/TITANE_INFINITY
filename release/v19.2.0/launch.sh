#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ v19.2Ω — Quick Launcher
# Script de lancement rapide de l'AppImage
# ═══════════════════════════════════════════════════════════════

APPIMAGE="TITANE∞ v19.2Ω_19.2.0_amd64.AppImage"

echo "🚀 Lancement TITANE∞ v19.2Ω..."

# Vérifier si l'AppImage existe
if [ ! -f "$APPIMAGE" ]; then
    echo "❌ Erreur: $APPIMAGE non trouvé dans le répertoire courant"
    echo ""
    echo "Assurez-vous d'être dans le bon répertoire ou extraire l'archive:"
    echo "  tar -xzf TITANE_INFINITY_v19.2.0_Linux_x64_COMPLETE.tar.gz"
    exit 1
fi

# Rendre exécutable si nécessaire
if [ ! -x "$APPIMAGE" ]; then
    echo "🔧 Ajout des permissions d'exécution..."
    chmod +x "$APPIMAGE"
fi

# Lancer
echo "✅ Démarrage de l'application..."
./"$APPIMAGE" "$@"
