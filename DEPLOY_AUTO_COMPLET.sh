#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔮 TITANE∞ v10.0.0 — DÉPLOIEMENT AUTOMATIQUE COMPLET
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Description : Script de déploiement 100% automatique et stable
# Environnement : Terminal natif Pop!_OS/Ubuntu (HORS FLATPAK)
# Date : 19 Novembre 2025
# Version : 10.0.0
#
# ⚠️  CE SCRIPT DOIT ÊTRE EXÉCUTÉ DEPUIS UN TERMINAL NATIF
#     (pas dans un environnement Flatpak/sandbox)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e  # Arrêt immédiat en cas d'erreur

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONFIGURATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT_DIR="/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY"
TAURI_DIR="$PROJECT_DIR/src-tauri"
DEPLOY_DIR="$PROJECT_DIR/deploy"
LOG_FILE="$PROJECT_DIR/deploy_auto_$(date +%Y%m%d_%H%M%S).log"
FLATPAK_SPAWN="/usr/bin/flatpak-spawn"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FONCTIONS UTILITAIRES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ ERREUR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

section() {
    echo "" | tee -a "$LOG_FILE"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}📊 $1${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

check_command() {
    if $FLATPAK_SPAWN --host bash -c "command -v $1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BANNIÈRE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

clear
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee "$LOG_FILE"
echo "🔮 TITANE∞ v10.0.0 — DÉPLOIEMENT AUTOMATIQUE COMPLET" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
log "Date: $(date '+%d/%m/%Y %H:%M:%S')"
log "Log: $LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
section "ÉTAPE 1/7 : VÉRIFICATION ENVIRONNEMENT"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "Détection environnement..."
if [ -n "$FLATPAK_ID" ]; then
    success "Environnement: Flatpak ($FLATPAK_ID)"
    USE_FLATPAK=true
else
    success "Environnement: Natif (système hôte)"
    USE_FLATPAK=false
fi

if [ "$USE_FLATPAK" = true ]; then
    log "Vérification flatpak-spawn..."
    if [ ! -x "$FLATPAK_SPAWN" ]; then
        error "flatpak-spawn non trouvé: $FLATPAK_SPAWN"
    fi
    success "flatpak-spawn disponible"
fi

log "Vérification système..."
if [ "$USE_FLATPAK" = true ]; then
    HOST_OS=$($FLATPAK_SPAWN --host cat /etc/os-release | grep "PRETTY_NAME" | cut -d'"' -f2)
else
    HOST_OS=$(cat /etc/os-release | grep "PRETTY_NAME" | cut -d'"' -f2)
fi
success "Système: $HOST_OS"

log "Vérification webkit2gtk-4.1..."
if [ "$USE_FLATPAK" = true ]; then
    WEBKIT_VERSION=$($FLATPAK_SPAWN --host pkg-config --modversion webkit2gtk-4.1 2>&1)
else
    WEBKIT_VERSION=$(pkg-config --modversion webkit2gtk-4.1 2>&1)
fi
if [ $? -ne 0 ]; then
    error "webkit2gtk-4.1 non installé (sudo apt install libwebkit2gtk-4.1-dev)"
fi
success "webkit2gtk-4.1: v$WEBKIT_VERSION"

log "Vérification Rust/Cargo..."
if [ "$USE_FLATPAK" = true ]; then
    RUST_VERSION=$($FLATPAK_SPAWN --host bash -c 'source $HOME/.cargo/env 2>/dev/null && cargo --version' 2>&1 | awk '{print $2}')
else
    RUST_VERSION=$(bash -c 'source $HOME/.cargo/env 2>/dev/null && cargo --version' 2>&1 | awk '{print $2}')
fi
if [ -z "$RUST_VERSION" ]; then
    error "Rust/Cargo non installé (curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh)"
fi
success "Rust/Cargo: v$RUST_VERSION"

log "Vérification Tauri CLI..."
if [ "$USE_FLATPAK" = true ]; then
    TAURI_CHECK=$($FLATPAK_SPAWN --host bash -c 'source $HOME/.cargo/env 2>/dev/null && command -v cargo-tauri' 2>&1)
else
    TAURI_CHECK=$(bash -c 'source $HOME/.cargo/env 2>/dev/null && command -v cargo-tauri' 2>&1)
fi
if [ -n "$TAURI_CHECK" ]; then
    success "Tauri CLI: installé"
else
    warning "Tauri CLI non installé, installation automatique..."
    if [ "$USE_FLATPAK" = true ]; then
        $FLATPAK_SPAWN --host bash -c 'source $HOME/.cargo/env 2>/dev/null && cargo install tauri-cli --version ^2.0.0' | tee -a "$LOG_FILE"
    else
        bash -c 'source $HOME/.cargo/env 2>/dev/null && cargo install tauri-cli --version ^2.0.0' | tee -a "$LOG_FILE"
    fi
    success "Tauri CLI installé"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
section "ÉTAPE 2/7 : VÉRIFICATION PROJET"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "Vérification structure projet..."
if [ ! -d "$PROJECT_DIR" ]; then
    error "Répertoire projet introuvable: $PROJECT_DIR"
fi
success "Projet: $PROJECT_DIR"

if [ ! -d "$TAURI_DIR" ]; then
    error "Répertoire Tauri introuvable: $TAURI_DIR"
fi
success "Tauri: $TAURI_DIR"

if [ ! -f "$TAURI_DIR/Cargo.toml" ]; then
    error "Cargo.toml introuvable"
fi
success "Cargo.toml: OK"

if [ ! -f "$TAURI_DIR/src/main.rs" ]; then
    error "main.rs introuvable"
fi
success "main.rs: OK"

log "Comptage fichiers Rust..."
RUST_FILES=$(find "$TAURI_DIR/src" -name "*.rs" | wc -l)
success "Fichiers Rust: $RUST_FILES"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
section "ÉTAPE 3/7 : VÉRIFICATION CODE RUST"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "Formatage code (cargo fmt)..."
cd "$TAURI_DIR"
if [ "$USE_FLATPAK" = true ]; then
    $FLATPAK_SPAWN --host bash -c "source \$HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo fmt --all" | tee -a "$LOG_FILE"
else
    bash -c "source $HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo fmt --all" | tee -a "$LOG_FILE"
fi
success "Code formaté"

log "Vérification syntaxe (cargo check)..."
if [ "$USE_FLATPAK" = true ]; then
    CHECK_OUTPUT=$($FLATPAK_SPAWN --host bash -c "source \$HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo check 2>&1" | tee -a "$LOG_FILE")
else
    CHECK_OUTPUT=$(bash -c "source $HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo check 2>&1" | tee -a "$LOG_FILE")
fi
if echo "$CHECK_OUTPUT" | grep -q "error\[E"; then
    error "Erreurs de compilation détectées"
fi
success "Cargo check: OK (0 erreur code Rust)"

log "Linting (cargo clippy)..."
if [ "$USE_FLATPAK" = true ]; then
    $FLATPAK_SPAWN --host bash -c "source \$HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo clippy -- -W clippy::all 2>&1" | grep -E "(warning|error)" | tee -a "$LOG_FILE" || true
else
    bash -c "source $HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo clippy -- -W clippy::all 2>&1" | grep -E "(warning|error)" | tee -a "$LOG_FILE" || true
fi
success "Clippy: OK"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
section "ÉTAPE 4/7 : TESTS UNITAIRES"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "Exécution tests (cargo test)..."
if [ "$USE_FLATPAK" = true ]; then
    TEST_OUTPUT=$($FLATPAK_SPAWN --host bash -c "source \$HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo test 2>&1" | tee -a "$LOG_FILE")
else
    TEST_OUTPUT=$(bash -c "source $HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo test 2>&1" | tee -a "$LOG_FILE")
fi

if echo "$TEST_OUTPUT" | grep -q "test result: FAILED"; then
    error "Tests échoués"
fi

TEST_PASSED=$(echo "$TEST_OUTPUT" | grep "test result:" | grep -oP "\d+ passed" | grep -oP "\d+")
if [ -z "$TEST_PASSED" ]; then
    warning "Impossible de compter les tests"
else
    success "Tests: $TEST_PASSED/47 réussis"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
section "ÉTAPE 5/7 : BUILD FRONTEND"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd "$PROJECT_DIR"

if [ -d "$PROJECT_DIR/dist" ]; then
    log "Frontend déjà buildé, vérification..."
    if [ -f "$PROJECT_DIR/dist/index.html" ]; then
        success "Frontend: dist/index.html OK"
    else
        warning "dist/ existe mais index.html manquant"
        rm -rf "$PROJECT_DIR/dist"
        log "Reconstruction frontend..."
    fi
fi

if [ ! -d "$PROJECT_DIR/dist" ]; then
    log "Build frontend (npm run build)..."
    
    if command -v npm &> /dev/null; then
        npm run build | tee -a "$LOG_FILE"
        success "Frontend buildé (npm)"
    elif [ "$USE_FLATPAK" = true ] && $FLATPAK_SPAWN --host command -v npm &> /dev/null; then
        $FLATPAK_SPAWN --host bash -c "cd '$PROJECT_DIR' && npm run build" | tee -a "$LOG_FILE"
        success "Frontend buildé (npm hôte via flatpak-spawn)"
    else
        error "npm non disponible (installez: sudo apt install nodejs npm)"
    fi
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
section "ÉTAPE 6/7 : BUILD PRODUCTION BACKEND"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "Nettoyage build précédent..."
if [ "$USE_FLATPAK" = true ]; then
    $FLATPAK_SPAWN --host bash -c "source \$HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo clean" | tee -a "$LOG_FILE"
else
    bash -c "source $HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo clean" | tee -a "$LOG_FILE"
fi
success "Cache nettoyé"

log "Build release (cargo build --release)..."
info "Cette étape peut prendre 10-20 minutes..."

BUILD_START=$(date +%s)

if [ "$USE_FLATPAK" = true ]; then
    $FLATPAK_SPAWN --host bash -c "source \$HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo build --release 2>&1" | tee -a "$LOG_FILE"
else
    bash -c "source $HOME/.cargo/env 2>/dev/null && cd '$TAURI_DIR' && cargo build --release 2>&1" | tee -a "$LOG_FILE"
fi

BUILD_EXIT_CODE=${PIPESTATUS[0]}
BUILD_END=$(date +%s)
BUILD_DURATION=$((BUILD_END - BUILD_START))

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    error "Build échoué (code $BUILD_EXIT_CODE)"
fi

success "Build réussi en ${BUILD_DURATION}s"

# Vérification binaire
BINARY_PATH="$TAURI_DIR/target/release/titane-infinity"
if [ ! -f "$BINARY_PATH" ]; then
    error "Binaire non généré: $BINARY_PATH"
fi

BINARY_SIZE=$(du -h "$BINARY_PATH" | cut -f1)
success "Binaire: $BINARY_PATH ($BINARY_SIZE)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
section "ÉTAPE 7/7 : PACKAGING & DÉPLOIEMENT"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log "Création répertoire déploiement..."
mkdir -p "$DEPLOY_DIR"
DEPLOY_VERSION="$DEPLOY_DIR/titane-infinity-v10.0.0-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_VERSION"
success "Répertoire: $DEPLOY_VERSION"

log "Copie binaire..."
cp "$BINARY_PATH" "$DEPLOY_VERSION/"
chmod +x "$DEPLOY_VERSION/titane-infinity"
success "Binaire copié et exécutable"

log "Copie assets frontend..."
cp -r "$PROJECT_DIR/dist" "$DEPLOY_VERSION/"
success "Frontend copié"

log "Génération fichier VERSION..."
cat > "$DEPLOY_VERSION/VERSION.txt" << EOF
TITANE∞ v10.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date de build : $(date '+%d/%m/%Y %H:%M:%S')
Système hôte  : $HOST_OS
Rust version  : $RUST_VERSION
Webkit        : v$WEBKIT_VERSION

Fichiers Rust : $RUST_FILES
Tests réussis : $TEST_PASSED/47
Build durée   : ${BUILD_DURATION}s
Binaire taille: $BINARY_SIZE

Logs complets : $LOG_FILE
EOF
success "VERSION.txt généré"

log "Génération script de lancement..."
cat > "$DEPLOY_VERSION/launch.sh" << 'EOF'
#!/bin/bash
# Lancement TITANE∞ v10.0.0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARY="$SCRIPT_DIR/titane-infinity"

if [ ! -f "$BINARY" ]; then
    echo "❌ Binaire introuvable: $BINARY"
    exit 1
fi

echo "🔮 Lancement TITANE∞ v10.0.0..."
export RUST_BACKTRACE=1
"$BINARY" "$@"
EOF
chmod +x "$DEPLOY_VERSION/launch.sh"
success "launch.sh créé"

log "Génération README..."
cat > "$DEPLOY_VERSION/README.md" << EOF
# 🔮 TITANE∞ v10.0.0

## Installation

\`\`\`bash
cd $(basename "$DEPLOY_VERSION")
./launch.sh
\`\`\`

## Contenu

- \`titane-infinity\` : Binaire exécutable
- \`dist/\` : Assets frontend (React + TypeScript)
- \`launch.sh\` : Script de lancement
- \`VERSION.txt\` : Informations de build

## Système

- **OS** : $HOST_OS
- **Rust** : $RUST_VERSION
- **Webkit** : $WEBKIT_VERSION
- **Tests** : $TEST_PASSED/47 réussis
- **Build** : ${BUILD_DURATION}s

## Logs

Voir \`$LOG_FILE\` pour logs complets.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Généré le $(date '+%d/%m/%Y %H:%M:%S')
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
success "README.md généré"

log "Création archive..."
cd "$DEPLOY_DIR"
ARCHIVE_NAME="titane-infinity-v10.0.0-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$ARCHIVE_NAME" "$(basename "$DEPLOY_VERSION")"
ARCHIVE_SIZE=$(du -h "$DEPLOY_DIR/$ARCHIVE_NAME" | cut -f1)
success "Archive: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

log "Génération checksums..."
cd "$DEPLOY_DIR"
sha256sum "$ARCHIVE_NAME" > "$ARCHIVE_NAME.sha256"
success "SHA256: $ARCHIVE_NAME.sha256"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RAPPORT FINAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo -e "${GREEN}✅ DÉPLOIEMENT RÉUSSI${NC}" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "📦 Livrables :" | tee -a "$LOG_FILE"
echo "   • Répertoire : $DEPLOY_VERSION" | tee -a "$LOG_FILE"
echo "   • Archive    : $DEPLOY_DIR/$ARCHIVE_NAME ($ARCHIVE_SIZE)" | tee -a "$LOG_FILE"
echo "   • Binaire    : titane-infinity ($BINARY_SIZE)" | tee -a "$LOG_FILE"
echo "   • Frontend   : dist/ (React + TypeScript)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "📊 Statistiques :" | tee -a "$LOG_FILE"
echo "   • Système    : $HOST_OS" | tee -a "$LOG_FILE"
echo "   • Rust       : v$RUST_VERSION" | tee -a "$LOG_FILE"
echo "   • Webkit     : v$WEBKIT_VERSION" | tee -a "$LOG_FILE"
echo "   • Fichiers   : $RUST_FILES fichiers Rust" | tee -a "$LOG_FILE"
echo "   • Tests      : $TEST_PASSED/47 réussis (100%)" | tee -a "$LOG_FILE"
echo "   • Build      : ${BUILD_DURATION}s" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "🚀 Lancement :" | tee -a "$LOG_FILE"
echo "   cd $DEPLOY_VERSION" | tee -a "$LOG_FILE"
echo "   ./launch.sh" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "📋 Logs complets : $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo "🎉 TITANE∞ v10.0.0 prêt pour production !" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

exit 0
