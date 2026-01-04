#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🔍 TITANE∞ — VALIDATION ENVIRONNEMENT
# ═══════════════════════════════════════════════════════════════════════════════
# Script de validation rapide de l'environnement TITANE∞
# Peut être exécuté à tout moment pour vérifier la configuration
# 
# USAGE:
#   chmod +x validate_environment.sh
#   ./validate_environment.sh
# ═══════════════════════════════════════════════════════════════════════════════

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

clear
echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          TITANE∞ — VALIDATION ENVIRONNEMENT                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

VALIDATION_RESULTS=()

# Fonction de vérification
check_tool() {
    local name=$1
    local command=$2
    local version_cmd=$3
    
    if command -v "$command" &> /dev/null; then
        version=$($version_cmd 2>/dev/null || echo "version inconnue")
        echo -e "  ${GREEN}✅ ${name}${NC}: $version"
        return 0
    else
        echo -e "  ${RED}❌ ${name}${NC}: Non installé"
        return 1
    fi
}

# OS
echo -e "${CYAN}Système d'exploitation:${NC}"
OS_VERSION=$(lsb_release -d 2>/dev/null | cut -f2 || echo "Inconnu")
if [[ "$OS_VERSION" == *"Ubuntu 24.04"* ]]; then
    echo -e "  ${GREEN}✅ OS${NC}: $OS_VERSION"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${YELLOW}⚠️  OS${NC}: $OS_VERSION (recommandé: Ubuntu 24.04 LTS)"
    VALIDATION_RESULTS+=("WARN")
fi
echo ""

# Outils de développement
echo -e "${CYAN}Outils de développement:${NC}"

if check_tool "Rust" "rustc" "rustc --version | awk '{print \$2}'"; then
    VALIDATION_RESULTS+=("OK")
else
    VALIDATION_RESULTS+=("FAIL")
fi

if check_tool "Cargo" "cargo" "cargo --version | awk '{print \$2}'"; then
    VALIDATION_RESULTS+=("OK")
else
    VALIDATION_RESULTS+=("FAIL")
fi

if check_tool "Node.js" "node" "node --version"; then
    VALIDATION_RESULTS+=("OK")
else
    VALIDATION_RESULTS+=("FAIL")
fi

if check_tool "npm" "npm" "npm --version"; then
    VALIDATION_RESULTS+=("OK")
else
    VALIDATION_RESULTS+=("FAIL")
fi

if check_tool "Git" "git" "git --version | awk '{print \$3}'"; then
    VALIDATION_RESULTS+=("OK")
else
    VALIDATION_RESULTS+=("FAIL")
fi

if check_tool "VSCode" "code" "code --version | head -1"; then
    VALIDATION_RESULTS+=("OK")
else
    VALIDATION_RESULTS+=("WARN")
fi
echo ""

# Dépendances Tauri
echo -e "${CYAN}Dépendances Tauri v2:${NC}"
WEBKIT_VER=$(pkg-config --modversion webkit2gtk-4.1 2>/dev/null || echo "Non trouvé")
if [ "$WEBKIT_VER" != "Non trouvé" ]; then
    echo -e "  ${GREEN}✅ WebKit2GTK${NC}: $WEBKIT_VER"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${RED}❌ WebKit2GTK${NC}: Non installé"
    VALIDATION_RESULTS+=("FAIL")
fi

GTK_VER=$(pkg-config --modversion gtk+-3.0 2>/dev/null || echo "Non trouvé")
if [ "$GTK_VER" != "Non trouvé" ]; then
    echo -e "  ${GREEN}✅ GTK3${NC}: $GTK_VER"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${RED}❌ GTK3${NC}: Non installé"
    VALIDATION_RESULTS+=("FAIL")
fi
echo ""

# Configuration Git
echo -e "${CYAN}Configuration Git:${NC}"
if [ -f "$HOME/.gitconfig" ]; then
    GIT_NAME=$(git config --global user.name 2>/dev/null || echo "Non configuré")
    GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "Non configuré")
    
    if [ "$GIT_NAME" != "Non configuré" ] && [ "$GIT_EMAIL" != "Non configuré" ]; then
        echo -e "  ${GREEN}✅ Nom${NC}: $GIT_NAME"
        echo -e "  ${GREEN}✅ Email${NC}: $GIT_EMAIL"
        VALIDATION_RESULTS+=("OK")
    else
        echo -e "  ${YELLOW}⚠️  Configuration incomplète${NC}"
        VALIDATION_RESULTS+=("WARN")
    fi
else
    echo -e "  ${YELLOW}⚠️  Pas de .gitconfig${NC}"
    VALIDATION_RESULTS+=("WARN")
fi
echo ""

# SSH GitHub
echo -e "${CYAN}Connexion GitHub:${NC}"
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    GITHUB_USER=$(ssh -T git@github.com 2>&1 | grep -oP '(?<=Hi )[^!]+' || echo "Utilisateur")
    echo -e "  ${GREEN}✅ SSH GitHub${NC}: Authentifié ($GITHUB_USER)"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${YELLOW}⚠️  SSH GitHub${NC}: Non configuré"
    VALIDATION_RESULTS+=("WARN")
fi
echo ""

# Projet TITANE
echo -e "${CYAN}Projet TITANE∞:${NC}"
PROJECTS_DIR="$HOME/Projets"
if [ -d "$PROJECTS_DIR/TITANE_INFINITY" ]; then
    echo -e "  ${GREEN}✅ Repository${NC}: Présent"
    VALIDATION_RESULTS+=("OK")
    
    cd "$PROJECTS_DIR/TITANE_INFINITY"
    
    # Vérifier node_modules
    if [ -d "node_modules" ]; then
        echo -e "  ${GREEN}✅ Dependencies npm${NC}: Installées"
        VALIDATION_RESULTS+=("OK")
    else
        echo -e "  ${YELLOW}⚠️  Dependencies npm${NC}: Manquantes (pnpm install)"
        VALIDATION_RESULTS+=("WARN")
    fi
    
    # Vérifier Cargo.lock
    if [ -f "src-tauri/Cargo.lock" ]; then
        echo -e "  ${GREEN}✅ Dependencies Rust${NC}: Présentes"
        VALIDATION_RESULTS+=("OK")
    else
        echo -e "  ${YELLOW}⚠️  Dependencies Rust${NC}: Non buildées"
        VALIDATION_RESULTS+=("WARN")
    fi
    
    # Vérifier Tauri CLI
    if command -v corepack >/dev/null 2>&1 && corepack pnpm exec tauri --version &> /dev/null; then
        TAURI_VER=$(corepack pnpm exec tauri --version 2>/dev/null)
        echo -e "  ${GREEN}✅ Tauri CLI${NC}: $TAURI_VER"
        VALIDATION_RESULTS+=("OK")
    elif command -v pnpm >/dev/null 2>&1 && pnpm exec tauri --version &> /dev/null; then
        TAURI_VER=$(pnpm exec tauri --version 2>/dev/null)
        echo -e "  ${GREEN}✅ Tauri CLI${NC}: $TAURI_VER"
        VALIDATION_RESULTS+=("OK")
    else
        echo -e "  ${YELLOW}⚠️  Tauri CLI${NC}: Non trouvé"
        VALIDATION_RESULTS+=("WARN")
    fi
else
    echo -e "  ${RED}❌ Repository${NC}: Non cloné"
    VALIDATION_RESULTS+=("FAIL")
fi
echo ""

# Composants Rust
echo -e "${CYAN}Composants Rust:${NC}"
if rustup component list | grep -q "rustfmt.*installed"; then
    echo -e "  ${GREEN}✅ rustfmt${NC}: Installé"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${YELLOW}⚠️  rustfmt${NC}: Manquant"
    VALIDATION_RESULTS+=("WARN")
fi

if rustup component list | grep -q "clippy.*installed"; then
    echo -e "  ${GREEN}✅ clippy${NC}: Installé"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${YELLOW}⚠️  clippy${NC}: Manquant"
    VALIDATION_RESULTS+=("WARN")
fi

if rustup target list | grep -q "wasm32-unknown-unknown.*installed"; then
    echo -e "  ${GREEN}✅ wasm32${NC}: Installé"
    VALIDATION_RESULTS+=("OK")
else
    echo -e "  ${YELLOW}⚠️  wasm32${NC}: Manquant"
    VALIDATION_RESULTS+=("WARN")
fi
echo ""

# Résumé
OK_COUNT=$(printf '%s\n' "${VALIDATION_RESULTS[@]}" | grep -c "OK" || echo 0)
WARN_COUNT=$(printf '%s\n' "${VALIDATION_RESULTS[@]}" | grep -c "WARN" || echo 0)
FAIL_COUNT=$(printf '%s\n' "${VALIDATION_RESULTS[@]}" | grep -c "FAIL" || echo 0)
TOTAL=${#VALIDATION_RESULTS[@]}

echo "═══════════════════════════════════════════════════════════════"
if [ "$FAIL_COUNT" -eq 0 ] && [ "$WARN_COUNT" -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✅ ENVIRONNEMENT PARFAITEMENT CONFIGURÉ!${NC}"
elif [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}${BOLD}⚠️  ENVIRONNEMENT FONCTIONNEL (avec avertissements)${NC}"
else
    echo -e "${RED}${BOLD}❌ CONFIGURATION INCOMPLÈTE${NC}"
fi
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${CYAN}Résumé:${NC}"
echo -e "  ✅ Succès:   $OK_COUNT/$TOTAL"
echo -e "  ⚠️  Warnings: $WARN_COUNT/$TOTAL"
echo -e "  ❌ Échecs:   $FAIL_COUNT/$TOTAL"
echo ""

# Recommandations
if [ "$FAIL_COUNT" -gt 0 ] || [ "$WARN_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}ACTIONS RECOMMANDÉES:${NC}"
    echo ""
    
    if ! command -v rustc &> /dev/null; then
        echo "  • Installer Rust:"
        echo "    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        echo ""
    fi
    
    if ! command -v node &> /dev/null; then
        echo "  • Installer Node.js via NVM:"
        echo "    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
        echo "    nvm install --lts"
        echo ""
    fi
    
    if [ "$WEBKIT_VER" == "Non trouvé" ]; then
        echo "  • Installer les dépendances Tauri:"
        echo "    sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev"
        echo ""
    fi
    
    if ! ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        echo "  • Configurer SSH pour GitHub:"
        echo "    ssh-keygen -t ed25519 -C \"votre_email@example.com\""
        echo "    cat ~/.ssh/id_ed25519.pub"
        echo "    (Ajouter à https://github.com/settings/keys)"
        echo ""
    fi
    
    if ! [ -d "$PROJECTS_DIR/TITANE_INFINITY" ]; then
        echo "  • Cloner TITANE_INFINITY:"
        echo "    git clone git@github.com:KallokTherok1994/TITANE_INFINITY.git ~/Projets/TITANE_INFINITY"
        echo ""
    fi
    
    if [ -d "$PROJECTS_DIR/TITANE_INFINITY" ] && ! [ -d "$PROJECTS_DIR/TITANE_INFINITY/node_modules" ]; then
        echo "  • Installer les dépendances du projet:"
        echo "    cd ~/Projets/TITANE_INFINITY && pnpm install"
        echo ""
    fi
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}Pour démarrer TITANE∞:${NC}"
    echo "  cd ~/Projets/TITANE_INFINITY"
    echo "  pnpm run tauri dev"
    echo ""
fi

exit $FAIL_COUNT
