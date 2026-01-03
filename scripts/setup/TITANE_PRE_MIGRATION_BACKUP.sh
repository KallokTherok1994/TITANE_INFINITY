#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🔄 TITANE∞ — SUPER-PROMPT PRÉ-MIGRATION
# ═══════════════════════════════════════════════════════════════════════════════
# Script de sauvegarde COMPLÈTE avant migration Pop!_OS → Ubuntu 24.04 LTS
#
# Auteur: Kevin Thibault / Claude AI
# Date: 2025-12-09
# Version: 1.0.0
#
# USAGE:
#   chmod +x TITANE_PRE_MIGRATION_BACKUP.sh
#   ./TITANE_PRE_MIGRATION_BACKUP.sh
#
# Ce script effectue :
#   1. Sauvegarde complète de TITANE_INFINITY
#   2. Sauvegarde des configurations dev (Rust, Node, VSCode)
#   3. Sauvegarde des clés SSH (critique pour GitHub)
#   4. Export des packages installés
#   5. Compression et vérification d'intégrité
#   6. Instructions pour copie externe
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Arrêt en cas d'erreur

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/BACKUP_TITANE_MIGRATION_$TIMESTAMP"
TITANE_PATH="/home/titane/Documents/TITANE_INFINITY"
LOG_FILE="$BACKUP_DIR/backup_log.txt"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════════
# FONCTIONS UTILITAIRES
# ═══════════════════════════════════════════════════════════════════════════════

log_header() {
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}\n"
    [ -f "$LOG_FILE" ] && echo "[$TIMESTAMP] === $1 ===" >> "$LOG_FILE"
}

log_step() {
    echo -e "${CYAN}→ $1${NC}"
    [ -f "$LOG_FILE" ] && echo "[$TIMESTAMP] STEP: $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    [ -f "$LOG_FILE" ] && echo "[$TIMESTAMP] SUCCESS: $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    [ -f "$LOG_FILE" ] && echo "[$TIMESTAMP] WARNING: $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    [ -f "$LOG_FILE" ] && echo "[$TIMESTAMP] ERROR: $1" >> "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    [ -f "$LOG_FILE" ] && echo "[$TIMESTAMP] INFO: $1" >> "$LOG_FILE"
}

check_dir_exists() {
    if [ -d "$1" ]; then
        return 0
    else
        return 1
    fi
}

check_file_exists() {
    if [ -f "$1" ]; then
        return 0
    else
        return 1
    fi
}

get_dir_size() {
    du -sh "$1" 2>/dev/null | cut -f1
}

# ═══════════════════════════════════════════════════════════════════════════════
# BANNIÈRE DE DÉMARRAGE
# ═══════════════════════════════════════════════════════════════════════════════

clear
echo -e "${PURPLE}"
cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ████████╗██╗████████╗ █████╗ ███╗   ██╗███████╗    ∞                       ║
║   ╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║██╔════╝                            ║
║      ██║   ██║   ██║   ███████║██╔██╗ ██║█████╗                              ║
║      ██║   ██║   ██║   ██╔══██║██║╚██╗██║██╔══╝                              ║
║      ██║   ██║   ██║   ██║  ██║██║ ╚████║███████╗                            ║
║      ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝                            ║
║                                                                               ║
║              🔄 SUPER-PROMPT PRÉ-MIGRATION — SAUVEGARDE COMPLÈTE              ║
║                     Pop!_OS 24.04 → Ubuntu 24.04 LTS                         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}Date: $(date '+%A %d %B %Y - %H:%M:%S')${NC}"
echo -e "${YELLOW}Utilisateur: $USER${NC}"
echo -e "${YELLOW}Répertoire backup: $BACKUP_DIR${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 0 : VÉRIFICATIONS PRÉLIMINAIRES
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 0 : VÉRIFICATIONS PRÉLIMINAIRES"

# Créer le répertoire de backup
log_step "Création du répertoire de sauvegarde..."
mkdir -p "$BACKUP_DIR"
touch "$LOG_FILE"
log_success "Répertoire créé: $BACKUP_DIR"

# Vérifier l'espace disque disponible
log_step "Vérification de l'espace disque..."
AVAILABLE_SPACE=$(df -BG "$HOME" | tail -1 | awk '{print $4}' | tr -d 'G')
log_info "Espace disponible: ${AVAILABLE_SPACE}G"

if [ "$AVAILABLE_SPACE" -lt 10 ]; then
    log_error "Espace insuffisant! Minimum 10G requis."
    exit 1
fi
log_success "Espace disque suffisant"

# Vérifier si TITANE existe
log_step "Vérification du projet TITANE_INFINITY..."
if check_dir_exists "$TITANE_PATH"; then
    TITANE_SIZE=$(get_dir_size "$TITANE_PATH")
    log_success "TITANE_INFINITY trouvé ($TITANE_SIZE)"
else
    log_error "TITANE_INFINITY non trouvé à $TITANE_PATH"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 1 : SAUVEGARDE TITANE_INFINITY
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 1 : SAUVEGARDE TITANE_INFINITY"

mkdir -p "$BACKUP_DIR/TITANE"

# 1.1 Sauvegarde du code source (sans node_modules et target)
log_step "Sauvegarde du code source TITANE (exclusion node_modules, target)..."
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude 'target' \
    --exclude 'dist' \
    --exclude '.git/objects' \
    --exclude '*.log' \
    "$TITANE_PATH/" "$BACKUP_DIR/TITANE/source/"
log_success "Code source sauvegardé"

# 1.2 Sauvegarde du .git complet (pour l'historique)
log_step "Sauvegarde de l'historique Git..."
if check_dir_exists "$TITANE_PATH/.git"; then
    cp -r "$TITANE_PATH/.git" "$BACKUP_DIR/TITANE/git_history"
    log_success "Historique Git sauvegardé"
else
    log_warning "Pas de répertoire .git trouvé"
fi

# 1.3 Export des informations du repo
log_step "Export des informations du repository..."
cd "$TITANE_PATH"
{
    echo "=== TITANE_INFINITY Git Info ==="
    echo "Date: $(date)"
    echo ""
    echo "=== Remote URLs ==="
    git remote -v 2>/dev/null || echo "Non disponible"
    echo ""
    echo "=== Current Branch ==="
    git branch --show-current 2>/dev/null || echo "Non disponible"
    echo ""
    echo "=== Last 10 Commits ==="
    git log --oneline -10 2>/dev/null || echo "Non disponible"
    echo ""
    echo "=== Status ==="
    git status --short 2>/dev/null || echo "Non disponible"
    echo ""
    echo "=== Stash List ==="
    git stash list 2>/dev/null || echo "Aucun stash"
} > "$BACKUP_DIR/TITANE/git_info.txt"
log_success "Informations Git exportées"

# 1.4 Sauvegarde des fichiers de configuration spécifiques
log_step "Sauvegarde des fichiers de configuration..."
mkdir -p "$BACKUP_DIR/TITANE/configs"

CONFIG_FILES=(
    "package.json"
    "package-lock.json"
    "pnpm-lock.yaml"
    "tsconfig.json"
    "vite.config.ts"
    "tailwind.config.js"
    "eslint.config.js"
    ".prettierrc"
    "src-tauri/Cargo.toml"
    "src-tauri/Cargo.lock"
    "src-tauri/tauri.conf.json"
)

for file in "${CONFIG_FILES[@]}"; do
    if check_file_exists "$TITANE_PATH/$file"; then
        cp "$TITANE_PATH/$file" "$BACKUP_DIR/TITANE/configs/"
        log_info "  → $file"
    fi
done
log_success "Fichiers de configuration sauvegardés"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2 : SAUVEGARDE ENVIRONNEMENT DE DÉVELOPPEMENT
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 2 : SAUVEGARDE ENVIRONNEMENT DE DÉVELOPPEMENT"

mkdir -p "$BACKUP_DIR/dev_env"

# 2.1 Configuration Rust
log_step "Sauvegarde configuration Rust..."
if check_dir_exists "$HOME/.cargo"; then
    # Sauvegarder uniquement les configs, pas les binaires
    mkdir -p "$BACKUP_DIR/dev_env/cargo"
    cp "$HOME/.cargo/config.toml" "$BACKUP_DIR/dev_env/cargo/" 2>/dev/null || true
    cp "$HOME/.cargo/env" "$BACKUP_DIR/dev_env/cargo/" 2>/dev/null || true

    # Lister les composants installés
    {
        echo "=== Rust Toolchain Info ==="
        rustup show 2>/dev/null || echo "rustup non disponible"
        echo ""
        echo "=== Installed Targets ==="
        rustup target list --installed 2>/dev/null || echo "Non disponible"
        echo ""
        echo "=== Installed Components ==="
        rustup component list --installed 2>/dev/null || echo "Non disponible"
    } > "$BACKUP_DIR/dev_env/rust_info.txt"
    log_success "Configuration Rust sauvegardée"
else
    log_warning "Configuration Rust non trouvée"
fi

# 2.2 Configuration Node.js / NVM
log_step "Sauvegarde configuration Node.js/NVM..."
{
    echo "=== Node.js Info ==="
    node --version 2>/dev/null || echo "Node non installé"
    echo ""
    echo "=== NPM Info ==="
    npm --version 2>/dev/null || echo "PNPM non installé"
    echo ""
    echo "=== PNPM Info ==="
    pnpm --version 2>/dev/null || echo "PPNPM non installé"
    echo ""
    echo "=== NVM Info ==="
    if check_dir_exists "$HOME/.nvm"; then
        echo "NVM installé"
        nvm list 2>/dev/null || echo "Impossible de lister les versions"
    else
        echo "NVM non installé"
    fi
    echo ""
    echo "=== NPM Global Packages ==="
    npm list -g --depth=0 2>/dev/null || echo "Non disponible"
} > "$BACKUP_DIR/dev_env/node_info.txt"

# Sauvegarder .npmrc si présent
if check_file_exists "$HOME/.npmrc"; then
    cp "$HOME/.npmrc" "$BACKUP_DIR/dev_env/"
fi
log_success "Configuration Node.js sauvegardée"

# 2.3 Configuration VSCode
log_step "Sauvegarde configuration VSCode..."
mkdir -p "$BACKUP_DIR/dev_env/vscode"

if check_dir_exists "$HOME/.config/Code"; then
    # Settings
    if check_file_exists "$HOME/.config/Code/User/settings.json"; then
        cp "$HOME/.config/Code/User/settings.json" "$BACKUP_DIR/dev_env/vscode/"
    fi
    # Keybindings
    if check_file_exists "$HOME/.config/Code/User/keybindings.json"; then
        cp "$HOME/.config/Code/User/keybindings.json" "$BACKUP_DIR/dev_env/vscode/"
    fi
    # Snippets
    if check_dir_exists "$HOME/.config/Code/User/snippets"; then
        cp -r "$HOME/.config/Code/User/snippets" "$BACKUP_DIR/dev_env/vscode/"
    fi
    log_success "Paramètres VSCode sauvegardés"
else
    log_warning "Configuration VSCode non trouvée"
fi

# Liste des extensions
log_step "Export de la liste des extensions VSCode..."
{
    echo "=== VSCode Extensions ==="
    code --list-extensions 2>/dev/null || echo "Impossible de lister les extensions"
} > "$BACKUP_DIR/dev_env/vscode/extensions_list.txt"
log_success "Liste des extensions exportée"

# Script de réinstallation des extensions
log_step "Génération du script de réinstallation des extensions..."
{
    echo '#!/usr/bin/env bash'
    echo '# Script de réinstallation des extensions VSCode'
    echo ''
    code --list-extensions 2>/dev/null | while read ext; do
        echo "code --install-extension $ext"
    done
} > "$BACKUP_DIR/dev_env/vscode/reinstall_extensions.sh"
chmod +x "$BACKUP_DIR/dev_env/vscode/reinstall_extensions.sh"
log_success "Script de réinstallation généré"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 3 : SAUVEGARDE CLÉS SSH (CRITIQUE)
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 3 : SAUVEGARDE CLÉS SSH (CRITIQUE)"

if check_dir_exists "$HOME/.ssh"; then
    log_step "Sauvegarde du répertoire .ssh..."
    mkdir -p "$BACKUP_DIR/ssh_keys"
    cp -r "$HOME/.ssh/." "$BACKUP_DIR/ssh_keys/"

    # Lister les clés présentes
    log_info "Clés SSH trouvées:"
    ls -la "$BACKUP_DIR/ssh_keys/" | grep -E "^-" | awk '{print "  → " $NF}'

    # Vérifier la connexion GitHub
    log_step "Test de connexion GitHub..."
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        log_success "Connexion GitHub fonctionnelle"
    else
        log_warning "Vérifiez la connexion GitHub après restauration"
    fi

    log_success "Clés SSH sauvegardées"
else
    log_error "ATTENTION: Aucune clé SSH trouvée!"
    log_error "Vous devrez générer de nouvelles clés après la migration."
fi

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 4 : SAUVEGARDE CONFIGURATIONS SYSTÈME
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 4 : SAUVEGARDE CONFIGURATIONS SYSTÈME"

mkdir -p "$BACKUP_DIR/system_configs"

# 4.1 Fichiers de configuration shell
log_step "Sauvegarde des configurations shell..."
SHELL_FILES=(".bashrc" ".bash_profile" ".profile" ".zshrc" ".bash_aliases")
for file in "${SHELL_FILES[@]}"; do
    if check_file_exists "$HOME/$file"; then
        cp "$HOME/$file" "$BACKUP_DIR/system_configs/"
        log_info "  → $file"
    fi
done
log_success "Configurations shell sauvegardées"

# 4.2 Configuration Git
log_step "Sauvegarde configuration Git..."
if check_file_exists "$HOME/.gitconfig"; then
    cp "$HOME/.gitconfig" "$BACKUP_DIR/system_configs/"
    log_success "Configuration Git sauvegardée"
fi

# 4.3 Variables d'environnement personnalisées
log_step "Export des variables d'environnement..."
{
    echo "=== Variables d'environnement ==="
    echo "PATH=$PATH"
    echo ""
    echo "=== Variables Rust ==="
    echo "CARGO_HOME=${CARGO_HOME:-Non défini}"
    echo "RUSTUP_HOME=${RUSTUP_HOME:-Non défini}"
    echo ""
    echo "=== Variables Node ==="
    echo "NVM_DIR=${NVM_DIR:-Non défini}"
    echo "NODE_PATH=${NODE_PATH:-Non défini}"
} > "$BACKUP_DIR/system_configs/env_vars.txt"
log_success "Variables d'environnement exportées"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 5 : EXPORT DES PACKAGES SYSTÈME
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 5 : EXPORT DES PACKAGES SYSTÈME"

mkdir -p "$BACKUP_DIR/packages"

# 5.1 Packages APT installés manuellement
log_step "Export des packages APT installés..."
{
    echo "=== Packages APT installés manuellement ==="
    apt-mark showmanual 2>/dev/null || echo "Non disponible"
} > "$BACKUP_DIR/packages/apt_packages.txt"
log_success "Liste APT exportée"

# 5.2 Packages Flatpak
log_step "Export des packages Flatpak..."
{
    echo "=== Packages Flatpak ==="
    flatpak list 2>/dev/null || echo "Flatpak non installé"
} > "$BACKUP_DIR/packages/flatpak_packages.txt"
log_success "Liste Flatpak exportée"

# 5.3 Packages Snap
log_step "Export des packages Snap..."
{
    echo "=== Packages Snap ==="
    snap list 2>/dev/null || echo "Snap non installé"
} > "$BACKUP_DIR/packages/snap_packages.txt"
log_success "Liste Snap exportée"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 6 : COMPRESSION ET VÉRIFICATION
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 6 : COMPRESSION ET VÉRIFICATION"

# 6.1 Génération du manifest
log_step "Génération du manifest de sauvegarde..."
{
    echo "═══════════════════════════════════════════════════════════════"
    echo "  TITANE∞ BACKUP MANIFEST"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "Date de création: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Système source: $(lsb_release -d 2>/dev/null | cut -f2 || echo 'Pop!_OS')"
    echo "Utilisateur: $USER"
    echo "Hostname: $(hostname)"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  CONTENU DU BACKUP"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "📁 Structure:"
    find "$BACKUP_DIR" -type d | head -30
    echo ""
    echo "📊 Tailles:"
    du -sh "$BACKUP_DIR"/*
    echo ""
    echo "📄 Nombre de fichiers: $(find "$BACKUP_DIR" -type f | wc -l)"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  CHECKSUMS"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
} > "$BACKUP_DIR/MANIFEST.txt"
log_success "Manifest généré"

# 6.2 Compression du backup
log_step "Compression du backup (peut prendre quelques minutes)..."
ARCHIVE_NAME="TITANE_BACKUP_$TIMESTAMP.tar.gz"
cd "$HOME"
tar -czvf "$ARCHIVE_NAME" "BACKUP_TITANE_MIGRATION_$TIMESTAMP" 2>/dev/null
ARCHIVE_SIZE=$(get_dir_size "$HOME/$ARCHIVE_NAME")
log_success "Archive créée: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

# 6.3 Génération du checksum
log_step "Génération du checksum SHA256..."
sha256sum "$HOME/$ARCHIVE_NAME" > "$HOME/$ARCHIVE_NAME.sha256"
log_success "Checksum généré: $ARCHIVE_NAME.sha256"

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 7 : RAPPORT FINAL ET INSTRUCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

log_header "PHASE 7 : RAPPORT FINAL"

BACKUP_SIZE=$(get_dir_size "$BACKUP_DIR")
ARCHIVE_PATH="$HOME/$ARCHIVE_NAME"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ SAUVEGARDE TERMINÉE AVEC SUCCÈS${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📁 Répertoire de backup:${NC}"
echo "   $BACKUP_DIR"
echo ""
echo -e "${CYAN}📦 Archive compressée:${NC}"
echo "   $ARCHIVE_PATH"
echo "   Taille: $ARCHIVE_SIZE"
echo ""
echo -e "${CYAN}🔐 Checksum:${NC}"
echo "   $ARCHIVE_PATH.sha256"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  ⚠️  ACTIONS REQUISES AVANT REDÉMARRAGE${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}1. COPIER L'ARCHIVE SUR UN SUPPORT EXTERNE:${NC}"
echo ""
echo "   Option A - Clé USB:"
echo "   $ sudo mount /dev/sdX1 /mnt/usb"
echo "   $ cp $ARCHIVE_PATH /mnt/usb/"
echo "   $ cp $ARCHIVE_PATH.sha256 /mnt/usb/"
echo "   $ sudo umount /mnt/usb"
echo ""
echo "   Option B - Cloud (Google Drive, Dropbox, etc.):"
echo "   Téléverser manuellement l'archive"
echo ""
echo -e "${YELLOW}2. VÉRIFIER QUE LA CLÉ USB UBUNTU EST PRÊTE${NC}"
echo ""
echo -e "${YELLOW}3. NOTER CES INFORMATIONS IMPORTANTES:${NC}"
echo "   - Chemin de l'archive: $ARCHIVE_PATH"
echo "   - Checksum SHA256: $(cat "$HOME/$ARCHIVE_NAME.sha256" | cut -d' ' -f1)"
echo ""
echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${RED}  🚨 NE PAS REDÉMARRER AVANT D'AVOIR COPIÉ L'ARCHIVE${NC}"
echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${PURPLE}Log complet disponible: $LOG_FILE${NC}"
echo ""

# Écrire le résumé dans le log
{
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  BACKUP COMPLETED SUCCESSFULLY"
    echo "═══════════════════════════════════════════════════════════════"
    echo "Archive: $ARCHIVE_PATH"
    echo "Size: $ARCHIVE_SIZE"
    echo "Checksum: $(cat "$HOME/$ARCHIVE_NAME.sha256")"
    echo "Timestamp: $(date)"
} >> "$LOG_FILE"

echo -e "${GREEN}🎉 Prêt pour la migration vers Ubuntu 24.04 LTS !${NC}"
echo ""
