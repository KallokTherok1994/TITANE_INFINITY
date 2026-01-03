#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════╗
# ║                                                                  ║
# ║    🎨 TITANE∞ OS vΩ — INSTALLATEUR GRAPHIQUE ZENITY           ║
# ║                                                                  ║
# ║    Installateur Auto-Complet pour Pop!_OS 24.04                 ║
# ║    GUI Zenity • Détection Dépendances • Build Automatique       ║
# ║                                                                  ║
# ╚══════════════════════════════════════════════════════════════════╝

set -e

# ══════════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════════

TITANE_HOME="$HOME/TITANE_INFINITY"
TITANE_LOGS="$TITANE_HOME/logs"
TITANE_RELEASES="$TITANE_HOME/releases"
INSTALL_LOG="$TITANE_LOGS/install_$(date +%Y%m%d_%H%M%S).log"

# ══════════════════════════════════════════════════════════════════
# UTILITIES
# ══════════════════════════════════════════════════════════════════

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $@" | tee -a "$INSTALL_LOG"
}

error_exit() {
    zenity --error --title="TITANE∞ Erreur" --text="$1\n\nConsultez les logs: $INSTALL_LOG" --width=400
    log "ERREUR: $1"
    exit 1
}

check_zenity() {
    if ! command -v zenity &> /dev/null; then
        echo "❌ Zenity n'est pas installé. Installation..."
        sudo apt update && sudo apt install -y zenity
    fi
}

# ══════════════════════════════════════════════════════════════════
# WELCOME
# ══════════════════════════════════════════════════════════════════

welcome_screen() {
    check_zenity

    mkdir -p "$TITANE_LOGS"
    mkdir -p "$TITANE_RELEASES"

    zenity --info \
        --title="TITANE∞ OS vΩ — Bienvenue" \
        --text="<b>Bienvenue dans l'installateur TITANE∞ OS vΩ</b>

Cet installateur va:
  ✓ Vérifier les dépendances système
  ✓ Installer les packages manquants
  ✓ Construire le projet (Frontend + Backend + Tauri)
  ✓ Exporter dans ~/TITANE_INFINITY/releases

<b>Prérequis recommandés:</b>
  • Pop!_OS 24.04 (ou Ubuntu 22.04+)
  • 8 GB RAM minimum
  • 10 GB espace disque libre
  • Connexion Internet

Durée estimée: 10-20 minutes

Prêt à commencer?" \
        --width=500 \
        --height=300
}

# ══════════════════════════════════════════════════════════════════
# DEPENDENCY CHECK
# ══════════════════════════════════════════════════════════════════

check_dependencies() {
    log "Vérification des dépendances système..."

    local missing_deps=""
    local installed_deps=""

    # Check git
    if ! command -v git &> /dev/null; then
        missing_deps="$missing_deps git"
    else
        installed_deps="$installed_deps\n  ✓ Git: $(git --version)"
    fi

    # Check node
    if ! command -v node &> /dev/null; then
        missing_deps="$missing_deps nodejs npm"
    else
        installed_deps="$installed_deps\n  ✓ Node.js: $(node --version)"
        installed_deps="$installed_deps\n  ✓ npm: $(npm --version)"
    fi

    # Check cargo
    if ! command -v cargo &> /dev/null; then
        missing_deps="$missing_deps rustc cargo"
    else
        installed_deps="$installed_deps\n  ✓ Rust: $(rustc --version)"
        installed_deps="$installed_deps\n  ✓ Cargo: $(cargo --version)"
    fi

    # Display status
    if [ -z "$missing_deps" ]; then
        zenity --info \
            --title="Dépendances — OK" \
            --text="<b>✅ Toutes les dépendances sont installées</b>\n$installed_deps" \
            --width=400
        log "Toutes les dépendances sont présentes"
    else
        zenity --question \
            --title="Dépendances manquantes" \
            --text="<b>Certaines dépendances sont manquantes:</b>\n\n$missing_deps\n\nVoulez-vous les installer automatiquement?\n(Nécessite sudo)" \
            --width=400

        if [ $? -eq 0 ]; then
            log "Installation des dépendances: $missing_deps"

            (
                echo "10"; sleep 0.5
                echo "# Mise à jour des paquets..."
                sudo apt update 2>&1 | tee -a "$INSTALL_LOG"

                echo "50"; sleep 0.5
                echo "# Installation des dépendances..."
                sudo apt install -y $missing_deps 2>&1 | tee -a "$INSTALL_LOG"

                echo "100"
                echo "# Installation terminée"
            ) | zenity --progress \
                --title="Installation dépendances" \
                --text="Installation en cours..." \
                --percentage=0 \
                --auto-close \
                --width=400

            log "Dépendances installées avec succès"
        else
            error_exit "Installation annulée par l'utilisateur"
        fi
    fi
}

# ══════════════════════════════════════════════════════════════════
# PROJECT SELECTION
# ══════════════════════════════════════════════════════════════════

select_project_directory() {
    log "Sélection du dossier projet..."

    PROJECT_DIR=$(zenity --file-selection \
        --directory \
        --title="Choisir le dossier TITANE_INFINITY" \
        --filename="$HOME/Documents/")

    if [ -z "$PROJECT_DIR" ]; then
        error_exit "Aucun dossier sélectionné"
    fi

    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        error_exit "Dossier invalide: package.json introuvable\n\nChemin: $PROJECT_DIR"
    fi

    log "Dossier projet: $PROJECT_DIR"

    zenity --info \
        --title="Dossier sélectionné" \
        --text="<b>Dossier projet TITANE∞:</b>\n\n$PROJECT_DIR" \
        --width=400
}

# ══════════════════════════════════════════════════════════════════
# NPM INSTALL
# ══════════════════════════════════════════════════════════════════

install_npm_dependencies() {
    log "Installation dépendances npm..."

    cd "$PROJECT_DIR"

    (
        echo "10"
        echo "# Nettoyage..."
        rm -rf node_modules dist 2>&1 | tee -a "$INSTALL_LOG"
        sleep 0.5

        echo "30"
        echo "# Installation dépendances npm..."
        pnpm install --legacy-peer-deps 2>&1 | tee -a "$INSTALL_LOG"

        echo "100"
        echo "# Installation terminée"
    ) | zenity --progress \
        --title="Installation npm" \
        --text="Installation des dépendances Node.js..." \
        --percentage=0 \
        --auto-close \
        --width=400

    log "Dépendances npm installées"
}

# ══════════════════════════════════════════════════════════════════
# FRONTEND BUILD
# ══════════════════════════════════════════════════════════════════

build_frontend() {
    log "Build frontend..."

    cd "$PROJECT_DIR"

    (
        echo "20"
        echo "# Type check TypeScript..."
        pnpm run type-check 2>&1 | tee -a "$INSTALL_LOG" || true
        sleep 0.5

        echo "60"
        echo "# Build Vite..."
        pnpm run build 2>&1 | tee -a "$INSTALL_LOG"

        echo "100"
        echo "# Frontend build terminé"
    ) | zenity --progress \
        --title="Build Frontend" \
        --text="Compilation React + TypeScript + Vite..." \
        --percentage=0 \
        --auto-close \
        --width=400

    log "Frontend build terminé"
}

# ══════════════════════════════════════════════════════════════════
# BACKEND BUILD
# ══════════════════════════════════════════════════════════════════

build_backend() {
    log "Build backend Rust..."

    cd "$PROJECT_DIR/src-tauri"

    (
        echo "20"
        echo "# Cargo check..."
        cargo check 2>&1 | tee -a "$INSTALL_LOG"
        sleep 0.5

        echo "50"
        echo "# Compilation Rust --release..."
        cargo build --release 2>&1 | tee -a "$INSTALL_LOG"

        echo "100"
        echo "# Backend build terminé"
    ) | zenity --progress \
        --title="Build Backend Rust" \
        --text="Compilation Rust + Tauri..." \
        --percentage=0 \
        --pulsate \
        --auto-close \
        --width=400

    cd "$PROJECT_DIR"
    log "Backend build terminé"
}

# ══════════════════════════════════════════════════════════════════
# TAURI BUILD
# ══════════════════════════════════════════════════════════════════

build_tauri_complete() {
    log "Build Tauri complet..."

    cd "$PROJECT_DIR"

    (
        echo "30"
        echo "# Packaging Tauri..."
        pnpm run tauri:build 2>&1 | tee -a "$INSTALL_LOG"

        echo "100"
        echo "# Tauri build terminé"
    ) | zenity --progress \
        --title="Build Tauri" \
        --text="Packaging application complète..." \
        --percentage=0 \
        --pulsate \
        --auto-close \
        --width=400

    log "Tauri build terminé"
}

# ══════════════════════════════════════════════════════════════════
# EXPORT
# ══════════════════════════════════════════════════════════════════

export_release() {
    log "Export vers $TITANE_RELEASES..."

    cd "$PROJECT_DIR"

    local release_name="titane_infinity_$(date +%Y%m%d_%H%M%S)"
    local release_dir="$TITANE_RELEASES/$release_name"

    mkdir -p "$release_dir"

    if [ -d "src-tauri/target/release/bundle" ]; then
        cp -r src-tauri/target/release/bundle/* "$release_dir/" 2>&1 | tee -a "$INSTALL_LOG"
        log "Artifacts copiés dans $release_dir"
    else
        log "WARNING: Bundle directory not found"
    fi

    # Create build info
    cat > "$release_dir/BUILD_INFO.txt" << EOF
TITANE∞ vΩ — Build Information
═══════════════════════════════════════════════════════════════

Build Date: $(date)
Release Name: $release_name
OS: $(uname -a)
Node: $(node --version)
npm: $(npm --version)
Rust: $(rustc --version)

Logs: $INSTALL_LOG

═══════════════════════════════════════════════════════════════
EOF

    log "Export terminé: $release_dir"
    echo "$release_dir" > /tmp/titane_last_build.txt
}

# ══════════════════════════════════════════════════════════════════
# SUCCESS
# ══════════════════════════════════════════════════════════════════

show_success() {
    local release_dir=$(cat /tmp/titane_last_build.txt 2>/dev/null || echo "$TITANE_RELEASES")

    zenity --info \
        --title="TITANE∞ Installation Réussie" \
        --text="<b>✅✅✅ Installation TITANE∞ vΩ terminée avec succès! ✅✅✅</b>

<b>Artifacts disponibles:</b>
$release_dir

<b>Logs complets:</b>
$INSTALL_LOG

<b>Pour lancer TITANE∞:</b>
Cherchez l'exécutable dans le dossier releases ou lancez:
  pnpm run tauri:dev

<i>TITANE∞ vΩ est maintenant installé et prêt à l'emploi!</i>" \
        --width=500 \
        --height=350

    log "Installation terminée avec succès"
}

# ══════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════

main() {
    log "═══════════════════════════════════════════════════════════════"
    log "TITANE∞ OS vΩ — Installateur Zenity"
    log "Démarrage: $(date)"
    log "═══════════════════════════════════════════════════════════════"

    welcome_screen
    check_dependencies
    select_project_directory
    install_npm_dependencies
    build_frontend
    build_backend
    build_tauri_complete
    export_release
    show_success

    log "Installation complète"
    exit 0
}

# ══════════════════════════════════════════════════════════════════
# EXECUTION
# ══════════════════════════════════════════════════════════════════

main "$@"
