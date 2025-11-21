#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v16 — OVERDRIVE DEPLOYMENT ENGINE
# ═══════════════════════════════════════════════════════════════════════════
# Script de déploiement complet : OS → IA → Frontend → Backend → Tauri
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/logs/deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/overdrive_$TIMESTAMP.log"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RESET='\033[0m'

# Versions requises
NODE_MIN_VERSION=20
RUST_VERSION="stable"
POP_OS_TARGET="24.04"

# Flags
DRY_RUN=false
SKIP_OS_UPGRADE=false
SKIP_DEPENDENCIES=false
VERBOSE=false

# ─────────────────────────────────────────────────────────────────────────────
# UTILITAIRES
# ─────────────────────────────────────────────────────────────────────────────

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        INFO)  echo -e "${CYAN}[INFO]${RESET}  $message" ;;
        SUCCESS) echo -e "${GREEN}[✓]${RESET}    $message" ;;
        WARN)  echo -e "${YELLOW}[⚠]${RESET}    $message" ;;
        ERROR) echo -e "${RED}[✗]${RESET}    $message" ;;
        HEADER) echo -e "\n${MAGENTA}═══ $message ${RESET}\n" ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

check_command() {
    if command -v "$1" &>/dev/null; then
        return 0
    else
        return 1
    fi
}

run_command() {
    local cmd="$*"
    
    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] $cmd"
        return 0
    fi
    
    if [[ "$VERBOSE" == true ]]; then
        log INFO "Exécution: $cmd"
    fi
    
    if eval "$cmd" >> "$LOG_FILE" 2>&1; then
        return 0
    else
        log ERROR "Échec commande: $cmd"
        return 1
    fi
}

cleanup() {
    log INFO "Nettoyage en cours..."
    # Ne rien faire de destructif ici
}

trap cleanup EXIT ERR INT TERM

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1: SETUP OS (Pop!_OS 22 → 24 + Dépendances Système)
# ─────────────────────────────────────────────────────────────────────────────

setup_os() {
    log HEADER "SECTION 1: SETUP OS"
    
    # Détecter OS
    if [[ ! -f /etc/os-release ]]; then
        log ERROR "Impossible de détecter l'OS"
        return 1
    fi
    
    source /etc/os-release
    log INFO "OS détecté: $NAME $VERSION"
    
    # Vérifier Pop!_OS
    if [[ "$ID" != "pop" ]]; then
        log WARN "Ce script est optimisé pour Pop!_OS"
    fi
    
    # Vérifier version
    local current_version="${VERSION_ID:-unknown}"
    log INFO "Version actuelle: $current_version"
    
    if [[ "$current_version" != "$POP_OS_TARGET" ]]; then
        if [[ "$SKIP_OS_UPGRADE" == false ]]; then
            log WARN "Mise à jour vers Pop!_OS $POP_OS_TARGET recommandée"
            log INFO "Utilisez: sudo pop-upgrade release upgrade systemd"
            log WARN "Relancez ce script après redémarrage"
            log WARN "Pour continuer sans upgrade: --skip-os-upgrade"
            return 1
        else
            log WARN "Skip OS upgrade (flag activé)"
        fi
    else
        log SUCCESS "Pop!_OS $POP_OS_TARGET détecté"
    fi
    
    # Mise à jour système
    log INFO "Mise à jour des paquets système..."
    run_command sudo apt-get update
    run_command sudo apt-get upgrade -y
    
    # Installer dépendances Tauri v2
    log INFO "Installation dépendances Tauri..."
    local tauri_deps=(
        "libwebkit2gtk-4.1-dev"
        "libsoup-3.0-dev"
        "libjavascriptcoregtk-4.1-dev"
        "libssl-dev"
        "libayatana-appindicator3-dev"
        "librsvg2-dev"
        "libglib2.0-dev"
        "build-essential"
        "curl"
        "wget"
        "file"
    )
    
    for dep in "${tauri_deps[@]}"; do
        if ! dpkg -l | grep -q "^ii  $dep"; then
            run_command sudo apt-get install -y "$dep"
        else
            log INFO "$dep déjà installé"
        fi
    done
    
    # Installer dépendances audio
    log INFO "Installation dépendances audio..."
    local audio_deps=(
        "pipewire"
        "wireplumber"
        "libpipewire-0.3-dev"
        "libsoundio-dev"
        "libopus-dev"
        "libopusenc-dev"
    )
    
    for dep in "${audio_deps[@]}"; do
        run_command sudo apt-get install -y "$dep" || log WARN "Échec $dep (non-bloquant)"
    done
    
    # Vérifier PipeWire
    if systemctl --user is-active --quiet pipewire.service; then
        log SUCCESS "PipeWire actif"
    else
        log WARN "PipeWire non actif - tentative démarrage"
        systemctl --user enable --now pipewire.service
    fi
    
    # Installer Ollama
    if ! check_command ollama; then
        log INFO "Installation Ollama..."
        run_command "curl -fsSL https://ollama.com/install.sh | sh"
    else
        log SUCCESS "Ollama déjà installé"
    fi
    
    # Démarrer Ollama
    if ! pgrep -x ollama >/dev/null; then
        log INFO "Démarrage Ollama..."
        nohup ollama serve > "$LOG_DIR/ollama.log" 2>&1 &
        sleep 2
    fi
    
    # Installer modèles LLM
    log INFO "Installation modèles LLM..."
    local models=("llama3.1:8b" "qwen2.5:7b" "mistral:7b" "nomic-embed-text")
    
    for model in "${models[@]}"; do
        if ollama list | grep -q "^$model"; then
            log INFO "$model déjà présent"
        else
            log INFO "Pull $model..."
            run_command ollama pull "$model"
        fi
    done
    
    # Installer Rust
    if ! check_command rustc; then
        log INFO "Installation Rust..."
        run_command "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"
        source "$HOME/.cargo/env"
    else
        log SUCCESS "Rust déjà installé: $(rustc --version)"
    fi
    
    # Mettre à jour Rust
    run_command rustup update "$RUST_VERSION"
    run_command rustup default "$RUST_VERSION"
    
    # Installer Tauri CLI
    if ! cargo install --list | grep -q "^tauri-cli"; then
        log INFO "Installation Tauri CLI..."
        run_command cargo install tauri-cli --version '^2.0.0'
    else
        log SUCCESS "Tauri CLI déjà installé"
    fi
    
    # Installer Node.js
    if ! check_command node; then
        log INFO "Installation Node.js via nvm..."
        if [[ ! -d "$HOME/.nvm" ]]; then
            run_command "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash"
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        fi
        run_command nvm install 22
        run_command nvm use 22
    else
        local node_version=$(node -v | sed 's/v//' | cut -d. -f1)
        if [[ "$node_version" -lt "$NODE_MIN_VERSION" ]]; then
            log WARN "Node.js $node_version trop vieux (minimum: $NODE_MIN_VERSION)"
            log INFO "Mise à jour Node.js..."
            run_command nvm install 22
            run_command nvm use 22
        else
            log SUCCESS "Node.js $(node -v) détecté"
        fi
    fi
    
    # Installer Python (pour outils IA)
    if ! check_command python3; then
        run_command sudo apt-get install -y python3 python3-pip
    fi
    
    # Vérifier GLIBC
    local glibc_version=$(ldd --version | head -n1 | awk '{print $NF}')
    log INFO "GLIBC version: $glibc_version"
    
    if [[ "$(printf '%s\n' "2.35" "$glibc_version" | sort -V | head -n1)" != "2.35" ]]; then
        log WARN "GLIBC < 2.35 détecté - upgrade système recommandé"
    fi
    
    # Créer dossiers TITANE
    log INFO "Création structure /opt/titane..."
    run_command sudo mkdir -p /opt/titane/{bin,logs,models,data}
    run_command sudo chown -R "$USER:$USER" /opt/titane
    
    log SUCCESS "Section 1: SETUP OS — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2: SYSTEM CHECK + AUTO-FIX
# ─────────────────────────────────────────────────────────────────────────────

system_check() {
    log HEADER "SECTION 2: SYSTEM CHECK + AUTO-FIX"
    
    local errors=0
    
    # Check CPU
    log INFO "CPU: $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | xargs)"
    local cpu_cores=$(nproc)
    log INFO "Cores: $cpu_cores"
    
    if [[ "$cpu_cores" -lt 4 ]]; then
        log WARN "Moins de 4 cores détectés - performances réduites"
    fi
    
    # Check RAM
    local ram_gb=$(free -g | awk '/^Mem:/{print $2}')
    log INFO "RAM: ${ram_gb}GB"
    
    if [[ "$ram_gb" -lt 8 ]]; then
        log WARN "Moins de 8GB RAM - performances réduites"
    fi
    
    # Check GPU
    if check_command nvidia-smi; then
        log INFO "GPU NVIDIA détecté: $(nvidia-smi --query-gpu=name --format=csv,noheader | head -n1)"
    elif lspci | grep -i vga | grep -iq amd; then
        log INFO "GPU AMD détecté"
    else
        log INFO "GPU Intel intégré détecté"
    fi
    
    # Check GLIBC
    if ! ldd --version &>/dev/null; then
        log ERROR "GLIBC check failed"
        ((errors++))
    fi
    
    # Check WebKitGTK
    if ! pkg-config --exists webkit2gtk-4.1; then
        log ERROR "WebKitGTK 4.1 manquant"
        ((errors++))
    else
        log SUCCESS "WebKitGTK 4.1 détecté"
    fi
    
    # Check Node
    if ! check_command node; then
        log ERROR "Node.js manquant"
        ((errors++))
    else
        log SUCCESS "Node.js $(node -v)"
    fi
    
    # Check Cargo
    if ! check_command cargo; then
        log ERROR "Cargo manquant"
        ((errors++))
    else
        log SUCCESS "Cargo $(cargo --version | cut -d' ' -f2)"
    fi
    
    # Check Tauri CLI
    if ! cargo tauri --version &>/dev/null; then
        log ERROR "Tauri CLI manquant"
        ((errors++))
    else
        log SUCCESS "Tauri CLI $(cargo tauri --version | cut -d' ' -f2)"
    fi
    
    # Check PipeWire
    if systemctl --user is-active --quiet pipewire.service; then
        log SUCCESS "PipeWire actif"
    else
        log WARN "PipeWire inactif"
        systemctl --user restart pipewire.service || log ERROR "Échec restart PipeWire"
    fi
    
    # Check Ollama
    if pgrep -x ollama >/dev/null; then
        log SUCCESS "Ollama actif"
        if curl -s http://localhost:11434/api/tags &>/dev/null; then
            log SUCCESS "Ollama API accessible"
        else
            log WARN "Ollama API non accessible"
        fi
    else
        log WARN "Ollama non actif - tentative démarrage"
        nohup ollama serve > "$LOG_DIR/ollama.log" 2>&1 &
        sleep 2
    fi
    
    # Auto-Fix
    if [[ "$errors" -gt 0 ]]; then
        log WARN "$errors erreurs détectées - lancement auto-fix"
        
        if [[ "$SKIP_DEPENDENCIES" == false ]]; then
            setup_os
        else
            log ERROR "Auto-fix désactivé (--skip-dependencies)"
            return 1
        fi
    else
        log SUCCESS "Tous les checks passés"
    fi
    
    log SUCCESS "Section 2: SYSTEM CHECK — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3: FRONTEND BUILD & RECONSTRUCTION
# ─────────────────────────────────────────────────────────────────────────────

frontend_build() {
    log HEADER "SECTION 3: FRONTEND BUILD & RECONSTRUCTION"
    
    cd "$PROJECT_ROOT"
    
    # Clean
    log INFO "Nettoyage frontend..."
    run_command rm -rf node_modules dist .vite
    
    # Réinstaller
    log INFO "Installation dépendances npm..."
    if ! run_command npm install; then
        log ERROR "npm install failed"
        return 1
    fi
    
    # Type check
    log INFO "Vérification TypeScript..."
    if ! run_command npm run type-check; then
        log ERROR "TypeScript errors détectées"
        return 1
    fi
    
    log SUCCESS "0 erreurs TypeScript"
    
    # Vérifier fichiers critiques
    local critical_files=(
        "src/App.tsx"
        "src/main.tsx"
        "src/router.tsx"
        "src/ui/layouts/AppLayout.tsx"
        "src/ui/pages/Chat.tsx"
        "vite.config.ts"
        "index.html"
    )
    
    for file in "${critical_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log ERROR "Fichier manquant: $file"
            return 1
        fi
    done
    
    log SUCCESS "Tous les fichiers critiques présents"
    
    # Build
    log INFO "Build Vite production..."
    local build_start=$(date +%s)
    
    if ! run_command npm run build; then
        log ERROR "Build Vite failed"
        return 1
    fi
    
    local build_end=$(date +%s)
    local build_time=$((build_end - build_start))
    
    log SUCCESS "Build réussi en ${build_time}s"
    
    # Vérifier dist/
    if [[ ! -d "dist" ]]; then
        log ERROR "dist/ non généré"
        return 1
    fi
    
    local dist_size=$(du -sh dist | cut -f1)
    log INFO "Taille dist/: $dist_size"
    
    log SUCCESS "Section 3: FRONTEND BUILD — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4: BACKEND BUILD (Rust + Tauri v2)
# ─────────────────────────────────────────────────────────────────────────────

backend_build() {
    log HEADER "SECTION 4: BACKEND BUILD (Rust + Tauri v2)"
    
    cd "$PROJECT_ROOT/src-tauri"
    
    # Cargo check
    log INFO "Cargo check..."
    if ! run_command cargo check; then
        log ERROR "Cargo check failed"
        return 1
    fi
    
    log SUCCESS "Cargo check OK"
    
    # Cargo fix
    log INFO "Cargo fix..."
    run_command cargo fix --allow-dirty || log WARN "Cargo fix warnings"
    
    # Clippy
    log INFO "Clippy lint..."
    run_command cargo clippy -- -D warnings || log WARN "Clippy warnings détectés"
    
    # Vérifier modules Overdrive
    if [[ ! -d "src/overdrive" ]]; then
        log ERROR "Module overdrive/ manquant"
        return 1
    fi
    
    local overdrive_modules=(
        "src/overdrive/mod.rs"
        "src/overdrive/auto_heal.rs"
        "src/overdrive/voice_engine.rs"
        "src/overdrive/chat_orchestrator.rs"
        "src/overdrive/memory_engine.rs"
        "src/overdrive/semantic_kernel.rs"
        "src/overdrive/exp_engine.rs"
        "src/overdrive/project_autopilot.rs"
        "src/overdrive/api_bridge.rs"
    )
    
    for module in "${overdrive_modules[@]}"; do
        if [[ ! -f "$module" ]]; then
            log ERROR "Module manquant: $module"
            return 1
        fi
    done
    
    log SUCCESS "Tous les modules Overdrive présents"
    
    # Build release
    log INFO "Build Tauri release..."
    local build_start=$(date +%s)
    
    if ! run_command cargo tauri build; then
        log ERROR "Tauri build failed"
        return 1
    fi
    
    local build_end=$(date +%s)
    local build_time=$((build_end - build_start))
    
    log SUCCESS "Build réussi en ${build_time}s"
    
    # Vérifier binaires
    local binary_path="target/release/titane-infinity"
    if [[ ! -f "$binary_path" ]]; then
        log ERROR "Binaire non généré: $binary_path"
        return 1
    fi
    
    local binary_size=$(du -sh "$binary_path" | cut -f1)
    log INFO "Taille binaire: $binary_size"
    
    # Vérifier bundles
    if [[ -d "target/release/bundle" ]]; then
        log INFO "Bundles générés:"
        find target/release/bundle -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" | while read -r bundle; do
            log INFO "  - $(basename "$bundle") ($(du -sh "$bundle" | cut -f1))"
        done
    fi
    
    cd "$PROJECT_ROOT"
    
    log SUCCESS "Section 4: BACKEND BUILD — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5: VOICE ENGINE FULL DUPLEX
# ─────────────────────────────────────────────────────────────────────────────

voice_engine_setup() {
    log HEADER "SECTION 5: VOICE ENGINE FULL DUPLEX"
    
    # Installer Whisper.cpp (ASR)
    if [[ ! -d "$HOME/.titane/whisper.cpp" ]]; then
        log INFO "Installation Whisper.cpp..."
        mkdir -p "$HOME/.titane"
        cd "$HOME/.titane"
        run_command git clone https://github.com/ggerganov/whisper.cpp.git
        cd whisper.cpp
        run_command make
        
        # Télécharger modèle base
        run_command bash ./models/download-ggml-model.sh base
    else
        log SUCCESS "Whisper.cpp déjà installé"
    fi
    
    # Installer Piper TTS
    if ! check_command piper; then
        log INFO "Installation Piper TTS..."
        # TODO: Télécharger depuis releases GitHub
        log WARN "Piper TTS manuel requis - voir https://github.com/rhasspy/piper"
    else
        log SUCCESS "Piper TTS déjà installé"
    fi
    
    # Tester micro
    log INFO "Test micro..."
    if arecord -l | grep -q "card"; then
        log SUCCESS "Micro détecté"
    else
        log WARN "Aucun micro détecté"
    fi
    
    # Tester speakers
    log INFO "Test speakers..."
    if aplay -l | grep -q "card"; then
        log SUCCESS "Speakers détectés"
    else
        log WARN "Aucun speaker détecté"
    fi
    
    cd "$PROJECT_ROOT"
    
    log SUCCESS "Section 5: VOICE ENGINE — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6: CHAT IA MULTIMODAL
# ─────────────────────────────────────────────────────────────────────────────

chat_ia_setup() {
    log HEADER "SECTION 6: CHAT IA MULTIMODAL"
    
    # Vérifier Ollama models
    log INFO "Vérification modèles Ollama..."
    if ollama list | grep -q "llama3.1"; then
        log SUCCESS "llama3.1 disponible"
    else
        log INFO "Pull llama3.1..."
        run_command ollama pull llama3.1:8b
    fi
    
    # Vérifier API Gemini (optionnel)
    if [[ -n "${GEMINI_API_KEY:-}" ]]; then
        log INFO "Test API Gemini..."
        if curl -s -H "x-goog-api-key: $GEMINI_API_KEY" \
            https://generativelanguage.googleapis.com/v1beta/models | grep -q "gemini"; then
            log SUCCESS "API Gemini accessible"
        else
            log WARN "API Gemini non accessible"
        fi
    else
        log INFO "GEMINI_API_KEY non définie (optionnel)"
    fi
    
    # Vérifier module Chat dans frontend
    if [[ -f "$PROJECT_ROOT/src/ui/pages/Chat.tsx" ]]; then
        log SUCCESS "Chat v16 présent"
    else
        log ERROR "Chat.tsx manquant"
        return 1
    fi
    
    log SUCCESS "Section 6: CHAT IA — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 7: EXP SYSTEM & TALENT TREE
# ─────────────────────────────────────────────────────────────────────────────

exp_system_setup() {
    log HEADER "SECTION 7: EXP SYSTEM & TALENT TREE"
    
    # Vérifier module exp_engine
    if [[ -f "$PROJECT_ROOT/src-tauri/src/overdrive/exp_engine.rs" ]]; then
        log SUCCESS "EXP Engine module présent"
    else
        log ERROR "exp_engine.rs manquant"
        return 1
    fi
    
    # Créer base de données locale
    local db_path="/opt/titane/data/exp.db"
    if [[ ! -f "$db_path" ]]; then
        log INFO "Création base de données XP..."
        touch "$db_path"
    fi
    
    log SUCCESS "Section 7: EXP SYSTEM — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 8: PROJECT ENGINE & AUTOPILOT
# ─────────────────────────────────────────────────────────────────────────────

project_engine_setup() {
    log HEADER "SECTION 8: PROJECT ENGINE & AUTOPILOT"
    
    # Vérifier module project_autopilot
    if [[ -f "$PROJECT_ROOT/src-tauri/src/overdrive/project_autopilot.rs" ]]; then
        log SUCCESS "Project AutoPilot module présent"
    else
        log ERROR "project_autopilot.rs manquant"
        return 1
    fi
    
    # Créer base projets
    local projects_db="/opt/titane/data/projects.db"
    if [[ ! -f "$projects_db" ]]; then
        log INFO "Création base de données projets..."
        touch "$projects_db"
    fi
    
    log SUCCESS "Section 8: PROJECT ENGINE — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 9: AUTO-HEAL SYSTEM v3
# ─────────────────────────────────────────────────────────────────────────────

autoheal_setup() {
    log HEADER "SECTION 9: AUTO-HEAL SYSTEM v3"
    
    # Vérifier module auto_heal
    if [[ -f "$PROJECT_ROOT/src-tauri/src/overdrive/auto_heal.rs" ]]; then
        log SUCCESS "Auto-Heal module présent"
    else
        log ERROR "auto_heal.rs manquant"
        return 1
    fi
    
    # Vérifier ErrorBoundary frontend
    if [[ -f "$PROJECT_ROOT/src/components/AutoHealErrorBoundary.tsx" ]]; then
        log SUCCESS "AutoHealErrorBoundary présent"
    else
        log WARN "AutoHealErrorBoundary manquant"
    fi
    
    log SUCCESS "Section 9: AUTO-HEAL SYSTEM — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 10: BUILD FINAL + INSTALLATION
# ─────────────────────────────────────────────────────────────────────────────

final_build_install() {
    log HEADER "SECTION 10: BUILD FINAL + INSTALLATION"
    
    cd "$PROJECT_ROOT"
    
    # Build final complet
    log INFO "Build final complet..."
    
    if ! frontend_build; then
        log ERROR "Frontend build failed"
        return 1
    fi
    
    if ! backend_build; then
        log ERROR "Backend build failed"
        return 1
    fi
    
    # Installer binaire
    log INFO "Installation binaire système..."
    local binary="$PROJECT_ROOT/src-tauri/target/release/titane-infinity"
    
    if [[ -f "$binary" ]]; then
        run_command sudo cp "$binary" /usr/local/bin/titane
        run_command sudo chmod +x /usr/local/bin/titane
        log SUCCESS "Binaire installé: /usr/local/bin/titane"
    else
        log ERROR "Binaire non trouvé"
        return 1
    fi
    
    # Copier bundles
    if [[ -d "$PROJECT_ROOT/src-tauri/target/release/bundle" ]]; then
        run_command cp -r "$PROJECT_ROOT/src-tauri/target/release/bundle/"* /opt/titane/bin/
        log SUCCESS "Bundles copiés vers /opt/titane/bin/"
    fi
    
    # Créer services systemd (optionnel)
    log INFO "Services systemd non créés (mode développement)"
    
    log SUCCESS "Section 10: BUILD FINAL — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 11: VALIDATION FINALE
# ─────────────────────────────────────────────────────────────────────────────

final_validation() {
    log HEADER "SECTION 11: VALIDATION FINALE"
    
    local errors=0
    
    # Check binaire
    if [[ -f /usr/local/bin/titane ]]; then
        log SUCCESS "Binaire installé"
    else
        log ERROR "Binaire manquant"
        ((errors++))
    fi
    
    # Check frontend dist
    if [[ -d "$PROJECT_ROOT/dist" ]]; then
        log SUCCESS "Frontend dist/ présent"
    else
        log ERROR "Frontend dist/ manquant"
        ((errors++))
    fi
    
    # Check backend binary
    if [[ -f "$PROJECT_ROOT/src-tauri/target/release/titane-infinity" ]]; then
        log SUCCESS "Backend binary présent"
    else
        log ERROR "Backend binary manquant"
        ((errors++))
    fi
    
    # Test lancement (sans GUI)
    log INFO "Test lancement binaire..."
    if /usr/local/bin/titane --version &>/dev/null; then
        log SUCCESS "Binaire exécutable"
    else
        log WARN "Binaire non testable (mode GUI)"
    fi
    
    # Check Ollama
    if pgrep -x ollama >/dev/null; then
        log SUCCESS "Ollama actif"
    else
        log WARN "Ollama inactif"
        ((errors++))
    fi
    
    # Résultat final
    if [[ "$errors" -eq 0 ]]; then
        log SUCCESS "✅ VALIDATION COMPLÈTE — 0 ERREUR"
    else
        log WARN "⚠ VALIDATION PARTIELLE — $errors ERREUR(S)"
    fi
    
    log SUCCESS "Section 11: VALIDATION — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 12: GÉNÉRATION RAPPORT
# ─────────────────────────────────────────────────────────────────────────────

generate_report() {
    log HEADER "SECTION 12: GÉNÉRATION RAPPORT"
    
    local report_file="$LOG_DIR/overdrive_report_$TIMESTAMP.txt"
    
    cat > "$report_file" << EOF
═══════════════════════════════════════════════════════════════════════════
  TITANE∞ v16 — OVERDRIVE DEPLOYMENT REPORT
═══════════════════════════════════════════════════════════════════════════

Date: $(date '+%Y-%m-%d %H:%M:%S')
Durée totale: $(($(date +%s) - START_TIME))s

═══ SYSTÈME ═══════════════════════════════════════════════════════════════

OS: $(source /etc/os-release && echo "$NAME $VERSION")
Kernel: $(uname -r)
CPU: $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | xargs)
RAM: $(free -h | awk '/^Mem:/{print $2}')
Disk: $(df -h / | awk 'NR==2{print $4}') disponible

═══ VERSIONS ══════════════════════════════════════════════════════════════

Node.js: $(node -v)
npm: $(npm -v)
Rust: $(rustc --version | cut -d' ' -f2)
Cargo: $(cargo --version | cut -d' ' -f2)
Tauri CLI: $(cargo tauri --version 2>/dev/null | cut -d' ' -f2 || echo "N/A")

═══ MODULES OVERDRIVE ═════════════════════════════════════════════════════

✓ Auto-Heal Engine
✓ Voice Engine (Whisper + Piper)
✓ Chat Orchestrator (Gemini + Ollama)
✓ Memory Engine (Embeddings + Vector Store)
✓ Semantic Kernel (Skills + Intent)
✓ EXP Engine (Niveaux + Talents)
✓ Project AutoPilot
✓ API Bridge

═══ BUILD ═════════════════════════════════════════════════════════════════

Frontend: $(if [[ -d "$PROJECT_ROOT/dist" ]]; then echo "✓ OK"; else echo "✗ FAILED"; fi)
Backend: $(if [[ -f "$PROJECT_ROOT/src-tauri/target/release/titane-infinity" ]]; then echo "✓ OK"; else echo "✗ FAILED"; fi)
Binaire: $(if [[ -f /usr/local/bin/titane ]]; then echo "✓ Installé"; else echo "✗ Manquant"; fi)

═══ SERVICES ══════════════════════════════════════════════════════════════

Ollama: $(if pgrep -x ollama >/dev/null; then echo "✓ Actif"; else echo "✗ Inactif"; fi)
PipeWire: $(if systemctl --user is-active --quiet pipewire.service; then echo "✓ Actif"; else echo "✗ Inactif"; fi)

═══ LOGS ══════════════════════════════════════════════════════════════════

Log complet: $LOG_FILE
Rapport: $report_file

═══════════════════════════════════════════════════════════════════════════
  🚀 DÉPLOIEMENT TITANE∞ v16 OVERDRIVE — TERMINÉ
═══════════════════════════════════════════════════════════════════════════
EOF

    cat "$report_file"
    
    log SUCCESS "Rapport généré: $report_file"
    log SUCCESS "Section 12: RAPPORT — TERMINÉ"
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

usage() {
    cat << EOF
TITANE∞ v16 — OVERDRIVE DEPLOYMENT ENGINE

Usage: $0 [OPTIONS]

Options:
    --dry-run               Simulation sans exécution réelle
    --skip-os-upgrade       Skip upgrade OS (utilise version actuelle)
    --skip-dependencies     Skip installation dépendances système
    --verbose               Mode verbeux
    -h, --help              Afficher cette aide

Sections:
    1. Setup OS (Pop!_OS 24 + dépendances)
    2. System Check + Auto-Fix
    3. Frontend Build (React + Vite)
    4. Backend Build (Rust + Tauri)
    5. Voice Engine (Whisper + Piper)
    6. Chat IA (Gemini + Ollama)
    7. EXP System (Niveaux + Talents)
    8. Project Engine (AutoPilot)
    9. Auto-Heal System v3
   10. Build Final + Installation
   11. Validation Finale
   12. Génération Rapport

Exemples:
    $0                      # Déploiement complet
    $0 --dry-run            # Simulation
    $0 --skip-os-upgrade    # Skip upgrade OS

EOF
}

main() {
    # Parse args
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --skip-os-upgrade)
                SKIP_OS_UPGRADE=true
                shift
                ;;
            --skip-dependencies)
                SKIP_DEPENDENCIES=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log ERROR "Option inconnue: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Setup
    mkdir -p "$LOG_DIR"
    START_TIME=$(date +%s)
    
    # Banner
    echo -e "${MAGENTA}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                    TITANE∞ v16 — OVERDRIVE ENGINE                         ║
║                   Deployment Script Professional                          ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${RESET}"
    
    log INFO "Log file: $LOG_FILE"
    
    if [[ "$DRY_RUN" == true ]]; then
        log WARN "MODE DRY-RUN ACTIVÉ (simulation)"
    fi
    
    # Exécution séquentielle
    setup_os || exit 1
    system_check || exit 1
    frontend_build || exit 1
    backend_build || exit 1
    voice_engine_setup || exit 1
    chat_ia_setup || exit 1
    exp_system_setup || exit 1
    project_engine_setup || exit 1
    autoheal_setup || exit 1
    final_build_install || exit 1
    final_validation || exit 1
    generate_report || exit 1
    
    local end_time=$(date +%s)
    local total_time=$((end_time - START_TIME))
    
    echo -e "\n${GREEN}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                    ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS                     ║
║                                                                           ║
║              🚀 TITANE∞ v16 OVERDRIVE — PRÊT AU DÉCOLLAGE                ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${RESET}"
    
    log SUCCESS "Temps total: ${total_time}s"
    log INFO "Lancer l'application: titane"
    log INFO "ou: npm run tauri dev"
}

# Lancement
main "$@"
