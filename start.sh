#!/bin/bash
# TITANE∞ v8.0 - Quick Start Script

clear

cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        ████████╗██╗████████╗ █████╗ ███╗   ██╗███████╗       ║
║        ╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║██╔════╝       ║
║           ██║   ██║   ██║   ███████║██╔██╗ ██║█████╗         ║
║           ██║   ██║   ██║   ██╔══██║██║╚██╗██║██╔══╝         ║
║           ██║   ██║   ██║   ██║  ██║██║ ╚████║███████╗       ║
║           ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝       ║
║                          ∞ v8.0                               ║
║                                                               ║
║           Cognitive Platform - Quick Start                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF

echo ""
echo "🌌 Bienvenue dans TITANE∞ v8.0"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Dépendances non installées"
    echo ""
    read -p "Voulez-vous installer les dépendances maintenant? (o/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[OoYy]$ ]]; then
        echo ""
        echo "🔄 Installation en cours..."
        ./system/scripts/install_deps.sh
        echo ""
    else
        echo ""
        echo "⚠️  Pour installer plus tard: ./system/scripts/install_deps.sh"
        exit 0
    fi
fi

echo ""
echo "🚀 Options disponibles:"
echo ""
echo "  1) Démarrer en mode développement"
echo "  2) Build production"
echo "  3) Nettoyer le projet"
echo "  4) Vérifier la structure"
echo "  5) Afficher la documentation"
echo "  6) Quitter"
echo ""
read -p "Choisissez une option (1-6): " choice

case $choice in
    1)
        echo ""
        echo "▶️  Démarrage en mode développement..."
        ./system/scripts/run.sh
        ;;
    2)
        echo ""
        echo "🏗️  Build production..."
        ./system/scripts/build.sh
        ;;
    3)
        echo ""
        echo "🧹 Nettoyage..."
        ./system/scripts/clean.sh
        ;;
    4)
        echo ""
        echo "🔍 Vérification..."
        ./verify_project.sh
        ;;
    5)
        echo ""
        echo "📚 Documentation disponible:"
        echo ""
        echo "  - README.md           : Introduction"
        echo "  - ARCHITECTURE.md     : Architecture détaillée"
        echo "  - MODULES.md          : Guide des modules"
        echo "  - SECURITY.md         : Sécurité"
        echo "  - DEVELOPER_GUIDE.md  : Guide développeur"
        echo "  - CHANGELOG.md        : Historique"
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
        ;;
    6)
        echo ""
        echo "👋 À bientôt!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Option invalide"
        exit 1
        ;;
esac
