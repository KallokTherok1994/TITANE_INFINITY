#!/usr/bin/env bash
# ╔═══════════════════════════════════════════════════════════════════════╗
# ║  TITANE∞ v15.5.0 — Restore Environment                              ║
# ║  Script de restauration environnement après migration système        ║
# ╚═══════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CONFIGURATION GLOBALE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

readonly SCRIPT_VERSION="6.0.0"
readonly SCRIPT_NAME="restore-environment.sh"
readonly TITANE_DIR="/opt/titane"
readonly LOG_DIR="${TITANE_DIR}/logs/restore"
readonly BACKUP_DIR="${TITANE_DIR}/backup"
readonly TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
readonly LOG_FILE="${LOG_DIR}/restore_${TIMESTAMP}.log"

# Couleurs
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# Variables
BACKUP_ARCHIVE=""
RESTORE_USER="${SUDO_USER:-$USER}"
RESTORE_HOME=$(eval echo "~${RESTORE_USER}")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FONCTIONS UTILITAIRES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_info() {
    echo -e "${CYAN}ℹ${NC} $*" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}✓${NC} $*" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $*" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}✗${NC} $*" | tee -a "${LOG_FILE}"
}

log_section() {
    echo "" | tee -a "${LOG_FILE}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "${LOG_FILE}"
    echo -e "${BOLD}${BLUE}  $*${NC}" | tee -a "${LOG_FILE}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "${LOG_FILE}"
    echo "" | tee -a "${LOG_FILE}"
}

find_latest_backup() {
    log_section "🔍 Recherche Backup"
    
    # Création automatique BACKUP_DIR si inexistant
    if [[ ! -d "${BACKUP_DIR}" ]]; then
        log_warning "Dossier backup inexistant: ${BACKUP_DIR}"
        log_info "Tentative de création automatique..."
        
        mkdir -p "${BACKUP_DIR}" 2>/dev/null || sudo mkdir -p "${BACKUP_DIR}"
        chmod 755 "${BACKUP_DIR}" 2>/dev/null || sudo chmod 755 "${BACKUP_DIR}"
        
        if [[ ! -d "${BACKUP_DIR}" ]]; then
            log_error "❌ Impossible de créer ${BACKUP_DIR}"
            log_info "Essayez manuellement : sudo mkdir -p ${BACKUP_DIR}"
            return 1
        fi
        
        log_success "Dossier backup créé : ${BACKUP_DIR}"
    fi
    
    # Chercher archives .tar.gz
    local backups=$(find "${BACKUP_DIR}" -name "*.tar.gz" -type f | sort -r)
    
    if [[ -z "$backups" ]]; then
        log_error "Aucun backup trouvé dans ${BACKUP_DIR}"
        return 1
    fi
    
    # Lister backups disponibles
    log_info "Backups disponibles:"
    local count=1
    while IFS= read -r backup; do
        local size=$(du -h "$backup" | cut -f1)
        local date=$(basename "$backup" | grep -oP '\d{8}_\d{6}' || echo "unknown")
        echo "  ${count}) $(basename "$backup") (${size})" | tee -a "${LOG_FILE}"
        ((count++))
    done <<< "$backups"
    
    # Sélection automatique du plus récent
    BACKUP_ARCHIVE=$(echo "$backups" | head -n1)
    log_success "Backup sélectionné: $(basename "${BACKUP_ARCHIVE}")"
    
    # Vérifier checksum si disponible
    if [[ -f "${BACKUP_ARCHIVE}.sha256" ]]; then
        log_info "Vérification checksum..."
        if (cd "${BACKUP_DIR}" && sha256sum -c "$(basename "${BACKUP_ARCHIVE}").sha256" &>/dev/null); then
            log_success "Checksum validé"
        else
            log_warning "Checksum invalide"
        fi
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  RESTAURATION SSH
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

restore_ssh() {
    log_section "🔑 Restauration SSH"
    
    local ssh_backup="${BACKUP_DIR}/ssh_backup_*.tar.gz"
    if compgen -G "$ssh_backup" > /dev/null; then
        local latest_ssh=$(ls -t $ssh_backup | head -n1)
        log_info "Backup SSH trouvé: $(basename "$latest_ssh")"
        
        # Extraction
        local temp_dir=$(mktemp -d)
        tar -xzf "$latest_ssh" -C "$temp_dir" 2>&1 | tee -a "${LOG_FILE}"
        
        # Restauration .ssh
        if [[ -d "${temp_dir}/.ssh" ]]; then
            log_info "Restauration ${RESTORE_HOME}/.ssh..."
            
            # Backup .ssh existant si présent
            if [[ -d "${RESTORE_HOME}/.ssh" ]]; then
                mv "${RESTORE_HOME}/.ssh" "${RESTORE_HOME}/.ssh.old_${TIMESTAMP}"
                log_info "Ancien .ssh sauvegardé: .ssh.old_${TIMESTAMP}"
            fi
            
            # Copie
            cp -r "${temp_dir}/.ssh" "${RESTORE_HOME}/"
            chown -R "${RESTORE_USER}:${RESTORE_USER}" "${RESTORE_HOME}/.ssh"
            
            # Permissions correctes
            chmod 700 "${RESTORE_HOME}/.ssh"
            chmod 600 "${RESTORE_HOME}/.ssh/"* 2>/dev/null || true
            chmod 644 "${RESTORE_HOME}/.ssh/"*.pub 2>/dev/null || true
            
            log_success "SSH restauré avec permissions correctes (700/600)"
        else
            log_warning "Pas de .ssh dans le backup"
        fi
        
        rm -rf "$temp_dir"
    else
        log_warning "Pas de backup SSH trouvé"
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  RESTAURATION .CONFIG
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

restore_config() {
    log_section "⚙️  Restauration .config (Filtré)"
    
    local config_backup="${BACKUP_DIR}/config_backup_*.tar.gz"
    if compgen -G "$config_backup" > /dev/null; then
        local latest_config=$(ls -t $config_backup | head -n1)
        log_info "Backup .config trouvé: $(basename "$latest_config")"
        
        # Extraction
        local temp_dir=$(mktemp -d)
        tar -xzf "$latest_config" -C "$temp_dir" 2>&1 | tee -a "${LOG_FILE}"
        
        if [[ -d "${temp_dir}/.config" ]]; then
            log_info "Restauration sélective .config..."
            
            # Fichiers/dossiers sûrs à restaurer
            local safe_items=(
                "Code/User/settings.json"
                "Code/User/keybindings.json"
                "git"
                "gh"
                "systemd/user"
            )
            
            for item in "${safe_items[@]}"; do
                local source="${temp_dir}/.config/${item}"
                local dest="${RESTORE_HOME}/.config/${item}"
                
                if [[ -e "$source" ]]; then
                    mkdir -p "$(dirname "$dest")"
                    cp -r "$source" "$dest" 2>/dev/null || true
                    log_success "Restauré: .config/${item}"
                fi
            done
            
            chown -R "${RESTORE_USER}:${RESTORE_USER}" "${RESTORE_HOME}/.config"
        fi
        
        rm -rf "$temp_dir"
    else
        log_warning "Pas de backup .config trouvé"
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  RESTAURATION PROJETS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

restore_projects() {
    log_section "📁 Restauration Projets"
    
    if [[ -z "$BACKUP_ARCHIVE" ]] || [[ ! -f "$BACKUP_ARCHIVE" ]]; then
        log_error "Archive backup non trouvée"
        return 1
    fi
    
    log_info "Extraction backup: $(basename "$BACKUP_ARCHIVE")"
    
    # Extraction vers dossier temporaire
    local temp_dir=$(mktemp -d)
    tar -xzf "$BACKUP_ARCHIVE" -C "$temp_dir" 2>&1 | tee -a "${LOG_FILE}"
    
    # Trouver TITANE_INFINITY dans l'archive
    local titane_source=$(find "$temp_dir" -type d -name "TITANE_INFINITY" | head -n1)
    
    if [[ -n "$titane_source" ]]; then
        log_success "TITANE_INFINITY trouvé dans backup"
        
        # Destination
        local dest="${RESTORE_HOME}/Documents/TITANE_NEWGEN"
        mkdir -p "$dest"
        
        # Backup si déjà existant
        if [[ -d "${dest}/TITANE_INFINITY" ]]; then
            log_info "TITANE_INFINITY existe, création backup..."
            mv "${dest}/TITANE_INFINITY" "${dest}/TITANE_INFINITY.old_${TIMESTAMP}"
            log_success "Ancien projet sauvegardé: TITANE_INFINITY.old_${TIMESTAMP}"
        fi
        
        # Copie
        log_info "Copie projet vers ${dest}..."
        cp -r "$titane_source" "$dest/"
        chown -R "${RESTORE_USER}:${RESTORE_USER}" "${dest}/TITANE_INFINITY"
        
        log_success "TITANE_INFINITY restauré"
        
        # Vérifier structure
        if [[ -f "${dest}/TITANE_INFINITY/package.json" ]]; then
            log_success "package.json trouvé"
        fi
        if [[ -f "${dest}/TITANE_INFINITY/src-tauri/Cargo.toml" ]]; then
            log_success "Cargo.toml trouvé"
        fi
    else
        log_warning "TITANE_INFINITY non trouvé dans backup"
    fi
    
    rm -rf "$temp_dir"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  RESTAURATION GIT CONFIG
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

restore_git_config() {
    log_section "🔧 Restauration Git Config"
    
    local gitconfig_backup="${BACKUP_DIR}/gitconfig_backup_*.txt"
    if compgen -G "$gitconfig_backup" > /dev/null; then
        local latest_git=$(ls -t $gitconfig_backup | head -n1)
        log_info "Backup Git config trouvé: $(basename "$latest_git")"
        
        # Copie .gitconfig
        if [[ -f "$latest_git" ]]; then
            cp "$latest_git" "${RESTORE_HOME}/.gitconfig"
            chown "${RESTORE_USER}:${RESTORE_USER}" "${RESTORE_HOME}/.gitconfig"
            log_success ".gitconfig restauré"
            
            # Afficher config
            local git_user=$(grep "name" "${RESTORE_HOME}/.gitconfig" | head -n1 | cut -d= -f2 | xargs)
            local git_email=$(grep "email" "${RESTORE_HOME}/.gitconfig" | head -n1 | cut -d= -f2 | xargs)
            log_info "Git user: ${git_user}"
            log_info "Git email: ${git_email}"
        fi
    else
        log_warning "Pas de backup Git config"
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  VÉRIFICATIONS POST-RESTAURATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

verify_environment() {
    log_section "🔍 Vérification Environnement"
    
    local errors=0
    
    # SSH
    if [[ -d "${RESTORE_HOME}/.ssh" ]]; then
        log_success "SSH: OK"
        
        # Permissions
        local ssh_perms=$(stat -c %a "${RESTORE_HOME}/.ssh")
        if [[ "$ssh_perms" == "700" ]]; then
            log_success "Permissions SSH: 700 OK"
        else
            log_warning "Permissions SSH: ${ssh_perms} (attendu: 700)"
        fi
    else
        log_error "SSH: MANQUANT"
        ((errors++))
    fi
    
    # Git
    if [[ -f "${RESTORE_HOME}/.gitconfig" ]]; then
        log_success "Git config: OK"
    else
        log_warning "Git config: MANQUANT"
    fi
    
    # TITANE_INFINITY
    local titane_path="${RESTORE_HOME}/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    if [[ -d "$titane_path" ]]; then
        log_success "TITANE_INFINITY: OK"
        
        # Fichiers clés
        if [[ -f "${titane_path}/package.json" ]]; then
            log_success "package.json: OK"
        else
            log_error "package.json: MANQUANT"
            ((errors++))
        fi
        
        if [[ -f "${titane_path}/src-tauri/Cargo.toml" ]]; then
            log_success "Cargo.toml: OK"
        else
            log_error "Cargo.toml: MANQUANT"
            ((errors++))
        fi
    else
        log_error "TITANE_INFINITY: MANQUANT"
        ((errors++))
    fi
    
    # Rust
    if sudo -u "${RESTORE_USER}" bash -c 'source ~/.cargo/env && rustc --version' &>/dev/null; then
        log_success "Rust: OK"
    else
        log_warning "Rust: NON INSTALLÉ (exécuter install-popos-titane.sh)"
    fi
    
    # Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js: OK ($(node --version))"
    else
        log_warning "Node.js: NON INSTALLÉ (exécuter install-popos-titane.sh)"
    fi
    
    # Tauri CLI
    if sudo -u "${RESTORE_USER}" bash -c 'source ~/.cargo/env && cargo tauri --version' &>/dev/null; then
        log_success "Tauri CLI: OK"
    else
        log_warning "Tauri CLI: NON INSTALLÉ"
    fi
    
    return $errors
}

reinstall_dependencies() {
    log_section "📦 Réinstallation Dépendances TITANE∞"
    
    local titane_path="${RESTORE_HOME}/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    
    if [[ ! -d "$titane_path" ]]; then
        log_error "TITANE_INFINITY non trouvé, skip"
        return 1
    fi
    
    cd "$titane_path"
    
    # npm install
    log_info "Installation dépendances npm..."
    if sudo -u "${RESTORE_USER}" npm install 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "npm install terminé"
    else
        log_error "npm install échoué"
        return 1
    fi
    
    log_success "Dépendances installées"
}

generate_report() {
    log_section "📄 Génération Rapport"
    
    local report_file="${LOG_DIR}/report_${TIMESTAMP}.md"
    
    cat > "${report_file}" << EOF
# Rapport Restore Environment TITANE∞ v15.5.0

**Date** : $(date +"%Y-%m-%d %H:%M:%S")  
**Script** : ${SCRIPT_NAME} v${SCRIPT_VERSION}  
**User** : ${RESTORE_USER}

---

## 📊 Résumé Restauration

| Composant | Status |
|-----------|--------|
| **SSH** | $([ -d "${RESTORE_HOME}/.ssh" ] && echo "✅ Restauré" || echo "❌ Échec") |
| **.config** | $([ -d "${RESTORE_HOME}/.config" ] && echo "✅ Restauré" || echo "❌ Échec") |
| **Git config** | $([ -f "${RESTORE_HOME}/.gitconfig" ] && echo "✅ Restauré" || echo "❌ Échec") |
| **TITANE_INFINITY** | $([ -d "${RESTORE_HOME}/Documents/TITANE_NEWGEN/TITANE_INFINITY" ] && echo "✅ Restauré" || echo "❌ Échec") |
| **npm install** | $([ -d "${RESTORE_HOME}/Documents/TITANE_NEWGEN/TITANE_INFINITY/node_modules" ] && echo "✅ OK" || echo "⚠️ À faire") |

---

## 🎯 Prochaines Étapes

1. **Vérifier environnement** :
   \`\`\`bash
   source ~/.cargo/env
   rustc --version
   node --version
   cargo tauri --version
   \`\`\`

2. **Build TITANE∞** :
   \`\`\`bash
   cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY
   npm run build
   npm run tauri build
   \`\`\`

3. **Diagnostics complet** :
   \`\`\`bash
   sudo bash diagnostics-postinstall.sh
   \`\`\`

---

**Restauration terminée** ✅

Log complet : ${LOG_FILE}
EOF
    
    log_success "Rapport généré: ${report_file}"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FONCTION PRINCIPALE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

main() {
    # Création structure complète avec gestion erreurs
    log_info "Initialisation structure /opt/titane..."
    
    for dir in "${LOG_DIR}" "${BACKUP_DIR}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir" 2>/dev/null || sudo mkdir -p "$dir"
            chmod 755 "$dir" 2>/dev/null || sudo chmod 755 "$dir"
        fi
    done
    
    # Test écriture BACKUP_DIR
    if [[ -d "${BACKUP_DIR}" ]]; then
        if touch "${BACKUP_DIR}/.test" 2>/dev/null; then
            rm -f "${BACKUP_DIR}/.test"
        else
            log_warning "Permissions limitées sur ${BACKUP_DIR}"
        fi
    fi
    
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                       ║"
    echo "║           TITANE∞ v15.5.0 — Restore Environment                      ║"
    echo "║                                                                       ║"
    echo "║       Restauration environnement après migration système             ║"
    echo "║                                                                       ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    log_info "User: ${RESTORE_USER}"
    log_info "Home: ${RESTORE_HOME}"
    
    # Recherche backup
    if ! find_latest_backup; then
        log_error "Pas de backup disponible"
        exit 1
    fi
    
    # Restaurations
    restore_ssh
    restore_config
    restore_git_config
    restore_projects
    
    # Réinstallation dépendances
    if [[ -d "${RESTORE_HOME}/Documents/TITANE_NEWGEN/TITANE_INFINITY" ]]; then
        reinstall_dependencies || log_warning "Réinstallation dépendances échouée"
    fi
    
    # Vérifications
    if verify_environment; then
        generate_report
        
        echo ""
        echo "╔═══════════════════════════════════════════════════════════════════════╗"
        echo "║                                                                       ║"
        echo "║                ✅ RESTAURATION TERMINÉE AVEC SUCCÈS                  ║"
        echo "║                                                                       ║"
        echo "║  Environnement TITANE∞ restauré pour ${RESTORE_USER}"
        echo "║                                                                       ║"
        echo "║  🎯 Prochaines étapes :                                              ║"
        echo "║     1. source ~/.cargo/env                                           ║"
        echo "║     2. cd ~/Documents/TITANE_NEWGEN/TITANE_INFINITY                  ║"
        echo "║     3. npm run build                                                 ║"
        echo "║     4. sudo bash diagnostics-postinstall.sh                          ║"
        echo "║                                                                       ║"
        echo "║  📄 Rapport : ${LOG_DIR}/report_${TIMESTAMP}.md"
        echo "║                                                                       ║"
        echo "╚═══════════════════════════════════════════════════════════════════════╝"
        echo ""
        
        log_success "Restauration terminée avec succès"
        exit 0
    else
        log_error "Restauration terminée avec des erreurs"
        log_info "Consultez: ${LOG_FILE}"
        exit 1
    fi
}

# Exécution
main "$@"
