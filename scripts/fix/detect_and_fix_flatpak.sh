#!/usr/bin/env bash
# TITANE_INFINITY v∞ — Détection et Résolution Automatique Environnement Flatpak
# © 2025 Humain Total / Kevin Thibault / TITANE Team

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  TITANE∞ — Détection Environnement Flatpak                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Détection de l'environnement
echo -e "${BLUE}[1/5]${NC} Analyse de l'environnement d'exécution..."

if grep -qi "freedesktop" /etc/os-release 2>/dev/null; then
    echo -e "${RED}❌ FLATPAK DÉTECTÉ${NC}"
    echo ""
    echo "Environnement actuel :"
    grep -E "^NAME=|^VERSION_ID=" /etc/os-release || true
    echo ""
    echo -e "${YELLOW}⚠️  PROBLÈME :${NC}"
    echo "   Vous êtes dans un environnement Flatpak isolé."
    echo "   Les bibliothèques système (WebKit) ne sont pas accessibles."
    echo ""
    echo -e "${BLUE}🔧 SOLUTIONS :${NC}"
    echo ""
    echo "Option A (RECOMMANDÉE) : Terminal Système Natif"
    echo "   1. Ouvrez le menu applications (Super / touche Windows)"
    echo "   2. Cherchez 'Terminal' ou 'Console'"
    echo "   3. Lancez l'application Terminal SYSTÈME (icône native)"
    echo "   4. Dans ce nouveau terminal, exécutez :"
    echo ""
    echo -e "      ${GREEN}cd ~/Documents/TITANE_INFINITY${NC}"
    echo -e "      ${GREEN}./detect_and_fix_flatpak.sh${NC}"
    echo ""
    echo "Option B : Flatpak-spawn (Si Option A échoue)"
    echo "   Sortir temporairement du sandbox Flatpak :"
    echo ""
    echo -e "      ${GREEN}flatpak-spawn --host bash${NC}"
    echo -e "      ${GREEN}cd ~/Documents/TITANE_INFINITY${NC}"
    echo -e "      ${GREEN}./build_with_deps.sh${NC}"
    echo ""
    echo "Option C : Installation Native de VS Code"
    echo "   Remplacer VS Code Flatpak par version .deb :"
    echo ""
    echo -e "      ${GREEN}wget https://code.visualstudio.com/sha/download?build=stable\\&os=linux-deb-x64 -O vscode.deb${NC}"
    echo -e "      ${GREEN}sudo dpkg -i vscode.deb${NC}"
    echo -e "      ${GREEN}sudo apt-get install -f${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Environnement natif détecté${NC}"
grep -E "^NAME=|^PRETTY_NAME=" /etc/os-release || true
echo ""

# 2. Vérification pkg-config
echo -e "${BLUE}[2/5]${NC} Vérification de pkg-config..."

if ! command -v pkg-config &> /dev/null; then
    echo -e "${RED}❌ pkg-config non trouvé${NC}"
    echo "Installation de pkg-config..."
    sudo apt-get update && sudo apt-get install -y pkg-config
fi

echo -e "${GREEN}✅ pkg-config disponible${NC}"
echo ""

# 3. Vérification WebKit
echo -e "${BLUE}[3/5]${NC} Vérification des bibliothèques WebKit..."

if ! pkg-config --exists webkit2gtk-4.1; then
    echo -e "${YELLOW}⚠️  WebKit 4.1 non trouvé, installation...${NC}"

    # Détection de la distribution
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        case "$ID" in
            ubuntu|pop|debian)
                echo "Installation pour Ubuntu/Pop!_OS/Debian..."
                sudo apt-get update
                sudo apt-get install -y \
                    libwebkit2gtk-4.1-dev \
                    libgtk-3-dev \
                    libayatana-appindicator3-dev \
                    librsvg2-dev
                ;;
            fedora)
                echo "Installation pour Fedora..."
                sudo dnf install -y \
                    webkit2gtk4.1-devel \
                    gtk3-devel \
                    libappindicator-gtk3-devel \
                    librsvg2-devel
                ;;
            arch|manjaro)
                echo "Installation pour Arch Linux..."
                sudo pacman -S --needed \
                    webkit2gtk-4.1 \
                    gtk3 \
                    libappindicator-gtk3 \
                    librsvg
                ;;
            opensuse*)
                echo "Installation pour openSUSE..."
                sudo zypper install -y \
                    webkit2gtk3-devel \
                    gtk3-devel \
                    libappindicator3-devel \
                    librsvg-devel
                ;;
            *)
                echo -e "${RED}❌ Distribution non reconnue : $ID${NC}"
                echo "Installez manuellement webkit2gtk-4.1-dev pour votre distribution."
                exit 1
                ;;
        esac
    else
        echo -e "${RED}❌ Impossible de détecter la distribution${NC}"
        exit 1
    fi
fi

# Vérification post-installation
if pkg-config --exists webkit2gtk-4.1; then
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1)
    echo -e "${GREEN}✅ WebKit 4.1 trouvé (version $WEBKIT_VERSION)${NC}"
else
    echo -e "${RED}❌ WebKit 4.1 toujours introuvable après installation${NC}"
    exit 1
fi
echo ""

# 4. Vérification des outils de build
echo -e "${BLUE}[4/5]${NC} Vérification des outils de compilation..."

MISSING_TOOLS=()

if ! command -v rustc &> /dev/null; then
    MISSING_TOOLS+=("rustc")
fi

if ! command -v cargo &> /dev/null; then
    MISSING_TOOLS+=("cargo")
fi

if ! command -v node &> /dev/null; then
    MISSING_TOOLS+=("node")
fi

if ! command -v corepack &> /dev/null && ! command -v pnpm &> /dev/null; then
    MISSING_TOOLS+=("pnpm")
fi

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Outils manquants : ${MISSING_TOOLS[*]}${NC}"
    echo ""
    echo "Installation recommandée :"

    if [[ " ${MISSING_TOOLS[*]} " =~ " rustc " ]] || [[ " ${MISSING_TOOLS[*]} " =~ " cargo " ]]; then
        echo "  Rust : curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    fi

    if [[ " ${MISSING_TOOLS[*]} " =~ " node " ]] || [[ " ${MISSING_TOOLS[*]} " =~ " pnpm " ]]; then
        echo "  Node.js (avec corepack) : utiliser l'outil repo (activate-node24.sh) ou installer Node.js récent"
        echo "  pnpm : corepack enable && corepack prepare pnpm@latest --activate"
    fi

    echo ""
    read -p "Voulez-vous installer les outils manquants maintenant ? (o/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        if [[ " ${MISSING_TOOLS[*]} " =~ " rustc " ]] || [[ " ${MISSING_TOOLS[*]} " =~ " cargo " ]]; then
            echo "Installation de Rust..."
            curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
            source "$HOME/.cargo/env"
        fi

        if [[ " ${MISSING_TOOLS[*]} " =~ " node " ]] || [[ " ${MISSING_TOOLS[*]} " =~ " pnpm " ]]; then
            echo "Installation de Node.js..."
            echo "Veuillez installer Node.js récent, puis activer pnpm via corepack."
        fi
    else
        echo -e "${RED}❌ Outils manquants, abandon.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Tous les outils de build sont présents${NC}"
    rustc --version
    cargo --version
    node --version
    if command -v corepack &> /dev/null; then
        corepack pnpm --version
    else
        pnpm --version
    fi
fi
echo ""

# 5. Compilation
echo -e "${BLUE}[5/5]${NC} Lancement de la compilation..."
echo ""

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json introuvable${NC}"
    echo "Assurez-vous d'être dans le dossier racine du projet TITANE_INFINITY"
    exit 1
fi

echo -e "${GREEN}▶ Installation des dépendances pnpm...${NC}"
pnpm install

echo ""
echo -e "${GREEN}▶ Compilation Tauri (cela peut prendre 5-10 minutes)...${NC}"
pnpm run tauri build

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ COMPILATION RÉUSSIE                                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Binaire créé : src-tauri/target/release/titane-infinity"
echo ""
echo "Pour lancer l'application :"
echo -e "  ${GREEN}./src-tauri/target/release/titane-infinity${NC}"
echo ""
echo "Pour tester en mode développement :"
echo -e "  ${GREEN}pnpm run tauri dev${NC}"
echo ""
