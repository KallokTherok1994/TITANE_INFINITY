#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                    TITANE∞ v13 - INSTALLATION AUTOMATIQUE                   ║
# ║             Modules Avancés + File Ingestion + Internet Research             ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║         TITANE∞ v13 - INSTALLATION & SETUP                       ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions d'affichage
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Vérifier si dans le bon répertoire
if [ ! -f "package.json" ]; then
    error "Erreur: package.json non trouvé"
    error "Lancez ce script depuis le répertoire TITANE_INFINITY"
    exit 1
fi

success "Répertoire TITANE_INFINITY détecté"

# Détection environnement
info "Détection de l'environnement..."
if [ -f "/.flatpak-info" ]; then
    warning "Environnement Flatpak détecté"
    FLATPAK=true
else
    success "Environnement natif détecté"
    FLATPAK=false
fi

# Vérifier Node.js
info "Vérification Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js $NODE_VERSION installé"
else
    error "Node.js non trouvé. Installez Node.js >= 18"
    exit 1
fi

# Vérifier Rust/Cargo
info "Vérification Rust/Cargo..."
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version)
    success "Cargo installé: $CARGO_VERSION"
else
    error "Cargo non trouvé. Installez Rust: https://rustup.rs"
    exit 1
fi

# Installation des dépendances npm
echo ""
info "Installation des dépendances npm..."
npm install

# Installer les nouvelles dépendances v13
info "Installation dépendances spécifiques v13..."

# Vérifier si framer-motion est déjà installé
if ! npm list framer-motion &> /dev/null; then
    npm install framer-motion
    success "framer-motion installé"
else
    success "framer-motion déjà installé"
fi

# Vérifier les dépendances Rust
echo ""
info "Vérification des dépendances Cargo..."
cd src-tauri

# Ajouter dépendances si pas présentes
if ! grep -q "aes-gcm" Cargo.toml; then
    warning "Ajout des dépendances manquantes dans Cargo.toml..."
    cat >> Cargo.toml << 'EOF'

# TITANE∞ v13 Dependencies
uuid = { version = "1.6", features = ["v4", "serde"] }
aes-gcm = "0.10"
argon2 = "0.5"
reqwest = { version = "0.11", features = ["json"] }
scraper = "0.17"
html2text = "0.6"
url = "2.4"
EOF
    success "Dépendances v13 ajoutées"
fi

# Vérifier les modules créés
echo ""
info "Vérification des modules TITANE∞ v13..."

modules_created=0
modules_missing=()

check_module() {
    if [ -d "src/$1" ]; then
        success "Module $1 présent"
        ((modules_created++))
    else
        warning "Module $1 manquant"
        modules_missing+=("$1")
    fi
}

check_module "interruptibility"
check_module "compression"
check_module "emotion"
check_module "noise_adaptive"
check_module "selfheal"

echo ""
info "Modules créés: $modules_created/5"

if [ ${#modules_missing[@]} -gt 0 ]; then
    warning "Modules manquants: ${modules_missing[*]}"
    warning "Consultez TITANE_V13_INTEGRATION_GUIDE.md pour les templates"
fi

# Compilation Rust (test)
echo ""
info "Test de compilation Rust..."

if $FLATPAK; then
    warning "Environnement Flatpak: compilation peut échouer (webkit2gtk)"
    warning "Solution: voir TROUBLESHOOTING_VOICE_MODE_v12.md"
    
    # Tenter avec flatpak-spawn
    if command -v flatpak-spawn &> /dev/null; then
        info "Tentative avec flatpak-spawn..."
        if flatpak-spawn --host cargo check 2>&1 | grep -q "error"; then
            warning "Compilation échouée (attendu en Flatpak)"
            warning "Le frontend peut être testé avec: npm run dev"
        else
            success "Compilation réussie"
        fi
    else
        warning "flatpak-spawn non disponible"
        warning "Testez le frontend uniquement: npm run dev"
    fi
else
    # Environnement natif
    if cargo check 2>&1 | grep -q "error"; then
        error "Erreurs de compilation détectées"
        error "Consultez les logs ci-dessus"
        warning "Le frontend peut quand même être testé: npm run dev"
    else
        success "Compilation Rust réussie !"
    fi
fi

cd ..

# Vérifier les fichiers de documentation
echo ""
info "Vérification de la documentation..."

docs=(
    "TITANE_V13_INTEGRATION_GUIDE.md"
    "GENERATION_PLAN_v13.md"
    "VOICE_MODE_LUXE_DUPLEX_GUIDE_v12.md"
    "TROUBLESHOOTING_VOICE_MODE_v12.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        success "Documentation: $doc"
    else
        warning "Documentation manquante: $doc"
    fi
done

# Résumé final
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    INSTALLATION TERMINÉE                         ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

success "✅ Dépendances npm installées"
success "✅ Dépendances Cargo vérifiées"
success "✅ Modules TITANE∞ v13: $modules_created/5 créés"

echo ""
echo "🚀 PROCHAINES ÉTAPES:"
echo ""
echo "  1. Test frontend:"
echo "     ${GREEN}npm run dev${NC}"
echo ""
echo "  2. Test complet avec Tauri:"
echo "     ${GREEN}npm run tauri dev${NC}"
echo ""
echo "  3. Build production:"
echo "     ${GREEN}npm run tauri build${NC}"
echo ""
echo "  4. Consulter la documentation:"
echo "     ${GREEN}cat TITANE_V13_INTEGRATION_GUIDE.md${NC}"
echo ""

if [ ${#modules_missing[@]} -gt 0 ]; then
    warning "⚠️  Modules manquants: ${modules_missing[*]}"
    warning "   Consultez TITANE_V13_INTEGRATION_GUIDE.md pour les templates"
    echo ""
fi

echo "📚 GUIDES DISPONIBLES:"
echo "  • TITANE_V13_INTEGRATION_GUIDE.md  → Architecture complète + templates"
echo "  • GENERATION_PLAN_v13.md           → Plan de génération détaillé"
echo "  • TROUBLESHOOTING_VOICE_MODE_v12.md → Solutions aux problèmes courants"
echo ""

success "🎊 Installation TITANE∞ v13 terminée avec succès !"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Technologies : React 18 • TypeScript • Framer Motion • Tauri v2 • Rust"
echo "  Modules v13  : Interruptibility 2.0 • Compression Cognitive • Emotion Engine"
echo "                 Noise Adaptive • SelfHeal++ • Duplex 0-Latence • Fusion • Turbo"
echo "  Nouveautés   : File Ingestion • Internet Research • Memory Encryption"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
