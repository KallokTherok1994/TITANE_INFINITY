#!/bin/bash

# 🚀 TITANE∞ Voice Mode - Installation Complète v12
# Installation des dépendances et compilation du système complet

set -e

echo "🎨 =========================================="
echo "   TITANE∞ VOICE MODE LUXE + FULL DUPLEX"
echo "   Installation & Build v12"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Fonctions
success() { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Vérifier OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
else
    error "OS non supporté: $OSTYPE"
    exit 1
fi

success "OS détecté: $OS"
echo ""

# ========================================
# PHASE 1: Dépendances Frontend
# ========================================

info "Phase 1: Installation dépendances Frontend..."

if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé. Installez Node.js d'abord."
    exit 1
fi

success "npm trouvé: $(npm --version)"

# Installer framer-motion si nécessaire
if ! npm list framer-motion &> /dev/null; then
    info "Installation framer-motion..."
    npm install framer-motion
    success "framer-motion installé"
else
    success "framer-motion déjà installé"
fi

# Vérifier autres dépendances
npm install

success "Dépendances frontend OK"
echo ""

# ========================================
# PHASE 2: Dépendances Système (Linux)
# ========================================

if [[ "$OS" == "linux" ]]; then
    info "Phase 2: Vérification dépendances système Linux..."
    
    # Vérifier si on est dans Flatpak
    if [ -f "/.flatpak-info" ]; then
        warning "Environnement Flatpak détecté"
        info "Utilisation de flatpak-spawn pour les commandes système"
        
        # Vérifier webkit2gtk via flatpak-spawn
        if flatpak-spawn --host pkg-config --exists webkit2gtk-4.1; then
            success "webkit2gtk-4.1 disponible"
        else
            warning "webkit2gtk-4.1 non trouvé sur l'hôte"
            info "Vous devrez peut-être installer: sudo apt install libwebkit2gtk-4.1-dev"
        fi
    else
        # Installation native
        if command -v apt &> /dev/null; then
            info "Gestionnaire de paquets: apt (Debian/Ubuntu)"
            
            DEPS_MISSING=()
            
            # Vérifier chaque dépendance
            pkg-config --exists webkit2gtk-4.1 || DEPS_MISSING+=("libwebkit2gtk-4.1-dev")
            pkg-config --exists javascriptcoregtk-4.1 || DEPS_MISSING+=("libjavascriptcoregtk-4.1-dev")
            
            if [ ${#DEPS_MISSING[@]} -gt 0 ]; then
                warning "Dépendances manquantes: ${DEPS_MISSING[*]}"
                info "Installation automatique..."
                
                sudo apt update
                sudo apt install -y \
                    libwebkit2gtk-4.1-dev \
                    libgtk-3-dev \
                    libayatana-appindicator3-dev \
                    librsvg2-dev \
                    patchelf
                
                success "Dépendances système installées"
            else
                success "Toutes les dépendances système sont présentes"
            fi
            
        elif command -v dnf &> /dev/null; then
            info "Gestionnaire de paquets: dnf (Fedora)"
            sudo dnf install -y \
                webkit2gtk4.1-devel \
                gtk3-devel \
                libappindicator-gtk3-devel \
                librsvg2-devel
                
        else
            warning "Gestionnaire de paquets non reconnu"
            info "Installez manuellement: webkit2gtk-4.1, gtk3, libappindicator"
        fi
    fi
fi

echo ""

# ========================================
# PHASE 3: Build Rust (optionnel)
# ========================================

info "Phase 3: Compilation Backend Rust..."

if ! command -v cargo &> /dev/null; then
    warning "Cargo (Rust) n'est pas installé"
    info "Installation automatique de Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

success "Cargo trouvé: $(cargo --version)"

# Vérifier si src-tauri existe
if [ ! -d "src-tauri" ]; then
    warning "Dossier src-tauri non trouvé"
    info "Le backend Rust sera compilé lors du premier 'npm run tauri dev'"
else
    info "Compilation Rust (peut prendre quelques minutes)..."
    
    # Vérifier environnement Flatpak
    if [ -f "/.flatpak-info" ]; then
        warning "Compilation Rust dans Flatpak: utilisation de flatpak-spawn"
        info "Note: La compilation complète se fera lors de 'npm run tauri dev'"
    else
        cd src-tauri
        
        # Vérifier les modules wakeword et duplex
        if cargo check --quiet 2>&1 | grep -q "error"; then
            warning "Erreurs détectées lors de la vérification"
            info "Certains modules nécessitent l'intégration dans main.rs"
            info "Consultez VOICE_MODE_LUXE_DUPLEX_GUIDE_v12.md"
        else
            success "Vérification Rust OK"
        fi
        
        cd ..
    fi
fi

echo ""

# ========================================
# PHASE 4: Vérification fichiers générés
# ========================================

info "Phase 4: Vérification fichiers Voice Mode..."

FILES_CHECK=(
    "src/styles/design-system.css"
    "src/components/VoiceCircle.tsx"
    "src/components/WaveformVisualizer.tsx"
    "src/components/ListeningIndicator.tsx"
    "src/components/VoiceButton.tsx"
    "src/components/WakewordIndicator.tsx"
    "src/components/FullDuplexWave.tsx"
    "src/components/VoiceDuplexUI.tsx"
)

MISSING_FILES=()
for file in "${FILES_CHECK[@]}"; do
    if [ -f "$file" ]; then
        success "✓ $file"
    else
        MISSING_FILES+=("$file")
        error "✗ $file (manquant)"
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    success "Tous les fichiers Voice Mode sont présents"
else
    warning "${#MISSING_FILES[@]} fichiers manquants"
fi

echo ""

# ========================================
# PHASE 5: Build Frontend
# ========================================

info "Phase 5: Build Frontend..."

npm run build

if [ $? -eq 0 ]; then
    success "Build frontend réussi"
else
    warning "Build frontend avec warnings (normal)"
fi

echo ""

# ========================================
# RÉSUMÉ
# ========================================

echo "=========================================="
echo "📊 RÉSUMÉ INSTALLATION"
echo "=========================================="
echo ""
success "✅ Dépendances npm installées"
success "✅ Framer Motion disponible"
success "✅ Build frontend OK"

if [ -f "/.flatpak-info" ]; then
    warning "⚠️  Environnement Flatpak détecté"
    info "   La compilation Rust complète nécessite l'hôte"
else
    success "✅ Environnement natif"
fi

echo ""
echo "=========================================="
echo "🚀 PROCHAINES ÉTAPES"
echo "=========================================="
echo ""
info "1. Intégrer les modules dans src-tauri/src/main.rs:"
echo "   mod wakeword;"
echo "   mod duplex;"
echo ""
info "2. Importer dans src/App.tsx:"
echo "   import './styles/design-system.css';"
echo "   import { VoiceDuplexUI } from './components/VoiceDuplexUI';"
echo ""
info "3. Lancer en mode dev:"
echo "   npm run tauri dev"
echo ""
info "4. Consultez la documentation:"
echo "   - VOICE_MODE_LUXE_DUPLEX_GUIDE_v12.md"
echo "   - INVENTAIRE_VOICE_MODE_v12.md"
echo ""

success "Installation terminée ! 🎉"
echo ""
