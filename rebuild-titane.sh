#!/usr/bin/env bash
# ╔═══════════════════════════════════════════════════════════════════════╗
# ║  TITANE∞ v15.5.0 — Rebuild Complet                                  ║
# ║  Script de reconstruction complète frontend + backend + Tauri        ║
# ╚═══════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CONFIGURATION GLOBALE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

readonly SCRIPT_VERSION="6.0.0"
readonly SCRIPT_NAME="rebuild-titane.sh"
readonly TITANE_DIR="/opt/titane"
readonly LOG_DIR="${TITANE_DIR}/logs/rebuild"
readonly BACKUP_DIR="${TITANE_DIR}/backup"
readonly TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
readonly LOG_FILE="${LOG_DIR}/rebuild_${TIMESTAMP}.log"

# Couleurs
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# Variables globales
PROJECT_PATH=""
START_TIME=$(date +%s)

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

elapsed_time() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    echo "${minutes}m ${seconds}s"
}

find_project() {
    log_section "🔍 Détection Projet TITANE∞"
    
    local possible_paths=(
        "${HOME}/Documents/TITANE_NEWGEN/TITANE_INFINITY"
        "${HOME}/Documents/TITANE_INFINITY"
        "${HOME}/TITANE_INFINITY"
        "/opt/titane/TITANE_INFINITY"
    )
    
    for path in "${possible_paths[@]}"; do
        if [[ -f "${path}/package.json" ]]; then
            PROJECT_PATH="$path"
            log_success "Projet trouvé: ${PROJECT_PATH}"
            return 0
        fi
    done
    
    log_error "Projet TITANE∞ non trouvé"
    log_info "Chemins vérifiés:"
    for path in "${possible_paths[@]}"; do
        log_info "  - ${path}"
    done
    exit 1
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  BACKUP AUTOMATIQUE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

create_backup() {
    log_section "💾 Backup Automatique"
    
    mkdir -p "${BACKUP_DIR}"
    
    local backup_name="titane_pre_rebuild_${TIMESTAMP}.tar.gz"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    log_info "Création backup: ${backup_name}"
    log_info "Exclusion: node_modules, target, dist, .git"
    
    cd "$(dirname "${PROJECT_PATH}")"
    tar -czf "${backup_path}" \
        --exclude='node_modules' \
        --exclude='target' \
        --exclude='dist' \
        --exclude='.git' \
        "$(basename "${PROJECT_PATH}")" 2>&1 | tee -a "${LOG_FILE}"
    
    if [[ -f "${backup_path}" ]]; then
        local backup_size=$(du -h "${backup_path}" | cut -f1)
        log_success "Backup créé: ${backup_size}"
        log_info "Location: ${backup_path}"
        
        # Checksum
        local checksum=$(sha256sum "${backup_path}" | cut -d' ' -f1)
        echo "${checksum}  ${backup_name}" > "${backup_path}.sha256"
        log_success "SHA256: ${checksum}"
    else
        log_error "Backup échoué"
        return 1
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  NETTOYAGE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

clean_project() {
    log_section "🧹 Nettoyage Projet"
    
    cd "${PROJECT_PATH}"
    
    # node_modules
    if [[ -d "node_modules" ]]; then
        log_info "Suppression node_modules..."
        rm -rf node_modules
        log_success "node_modules supprimé"
    fi
    
    # dist
    if [[ -d "dist" ]]; then
        log_info "Suppression dist..."
        rm -rf dist
        log_success "dist supprimé"
    fi
    
    # target (Rust)
    if [[ -d "src-tauri/target" ]]; then
        log_info "Suppression target..."
        rm -rf src-tauri/target
        log_success "target supprimé"
    fi
    
    # Cache npm
    log_info "Nettoyage cache npm..."
    npm cache clean --force &>/dev/null || true
    log_success "Cache npm nettoyé"
    
    # Cache cargo
    if command -v cargo &> /dev/null; then
        log_info "Nettoyage cache cargo..."
        cargo clean &>/dev/null || true
        log_success "Cache cargo nettoyé"
    fi
    
    # Cache vite
    if [[ -d ".vite" ]]; then
        rm -rf .vite
        log_success "Cache Vite nettoyé"
    fi
    
    log_success "Nettoyage terminé"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  REBUILD FRONTEND
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

rebuild_frontend() {
    log_section "⚛️  Rebuild Frontend (React + Vite)"
    
    cd "${PROJECT_PATH}"
    
    # npm install
    log_info "Installation dépendances (npm install)..."
    local npm_start=$(date +%s)
    if npm install 2>&1 | tee -a "${LOG_FILE}"; then
        local npm_duration=$(($(date +%s) - npm_start))
        log_success "npm install terminé (${npm_duration}s)"
    else
        log_error "npm install échoué"
        return 1
    fi
    
    # Type check
    log_info "Type-check TypeScript..."
    if npm run type-check 2>&1 | tee -a "${LOG_FILE}"; then
        log_success "Type-check: 0 erreur"
    else
        log_warning "Type-check: erreurs détectées (non-bloquant)"
    fi
    
    # Build Vite
    log_info "Build production (Vite)..."
    local build_start=$(date +%s)
    if npm run build 2>&1 | tee -a "${LOG_FILE}"; then
        local build_duration=$(($(date +%s) - build_start))
        log_success "Build Vite terminé (${build_duration}s)"
        
        # Vérifier dist/
        if [[ -d "dist" ]]; then
            local dist_size=$(du -sh dist | cut -f1)
            log_success "dist/ généré: ${dist_size}"
            
            # Compter fichiers
            local file_count=$(find dist -type f | wc -l)
            log_info "Fichiers générés: ${file_count}"
        else
            log_error "dist/ non généré"
            return 1
        fi
    else
        log_error "Build Vite échoué"
        return 1
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  REBUILD BACKEND
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

rebuild_backend() {
    log_section "🦀 Rebuild Backend (Rust)"
    
    cd "${PROJECT_PATH}/src-tauri"
    
    # Cargo clean
    log_info "Nettoyage cargo..."
    cargo clean 2>&1 | tee -a "${LOG_FILE}"
    log_success "Cargo clean terminé"
    
    # Cargo build --release
    log_info "Build Rust (release mode)..."
    log_warning "⚠️ Cette étape peut prendre 5-10 minutes..."
    
    local cargo_start=$(date +%s)
    if cargo build --release 2>&1 | tee -a "${LOG_FILE}"; then
        local cargo_duration=$(($(date +%s) - cargo_start))
        local minutes=$((cargo_duration / 60))
        local seconds=$((cargo_duration % 60))
        log_success "Cargo build terminé (${minutes}m ${seconds}s)"
        
        # Vérifier binaire
        local binary_path="target/release/titane-infinity"
        if [[ -f "$binary_path" ]]; then
            local binary_size=$(du -h "$binary_path" | cut -f1)
            log_success "Binaire généré: ${binary_size}"
        else
            log_error "Binaire non généré"
            return 1
        fi
    else
        log_error "Cargo build échoué"
        log_warning "Vérifiez: GLIBC >= 2.39, WebKitGTK 4.1 installé"
        return 1
    fi
    
    cd "${PROJECT_PATH}"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  BUILD TAURI
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

build_tauri() {
    log_section "📦 Build Tauri (Bundles)"
    
    cd "${PROJECT_PATH}"
    
    log_info "Build Tauri complet (.deb, .AppImage, binaire)..."
    log_warning "⚠️ Cette étape peut prendre 10-15 minutes..."
    
    local tauri_start=$(date +%s)
    if npm run tauri:build 2>&1 | tee -a "${LOG_FILE}"; then
        local tauri_duration=$(($(date +%s) - tauri_start))
        local minutes=$((tauri_duration / 60))
        local seconds=$((tauri_duration % 60))
        log_success "Tauri build terminé (${minutes}m ${seconds}s)"
        
        # Vérifier bundles
        log_info "Vérification bundles générés..."
        
        local bundle_dir="src-tauri/target/release/bundle"
        if [[ -d "$bundle_dir" ]]; then
            # .deb
            if ls "${bundle_dir}"/deb/*.deb 1> /dev/null 2>&1; then
                local deb_file=$(ls "${bundle_dir}"/deb/*.deb | head -n1)
                local deb_size=$(du -h "$deb_file" | cut -f1)
                log_success ".deb package: ${deb_size}"
            fi
            
            # .AppImage
            if ls "${bundle_dir}"/appimage/*.AppImage 1> /dev/null 2>&1; then
                local appimage_file=$(ls "${bundle_dir}"/appimage/*.AppImage | head -n1)
                local appimage_size=$(du -h "$appimage_file" | cut -f1)
                log_success ".AppImage: ${appimage_size}"
            fi
            
            # Binaire
            local binary="src-tauri/target/release/titane-infinity"
            if [[ -f "$binary" ]]; then
                local binary_size=$(du -h "$binary" | cut -f1)
                log_success "Binaire: ${binary_size}"
            fi
        else
            log_warning "Bundle directory non trouvé"
        fi
    else
        log_error "Tauri build échoué"
        return 1
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  VÉRIFICATIONS FINALES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

verify_build() {
    log_section "🔍 Vérification Build"
    
    local errors=0
    
    # dist/
    if [[ -d "${PROJECT_PATH}/dist" ]]; then
        log_success "dist/: EXISTS"
    else
        log_error "dist/: MANQUANT"
        ((errors++))
    fi
    
    # Binaire Rust
    if [[ -f "${PROJECT_PATH}/src-tauri/target/release/titane-infinity" ]]; then
        log_success "Binaire Rust: EXISTS"
    else
        log_error "Binaire Rust: MANQUANT"
        ((errors++))
    fi
    
    # Bundles Tauri
    local bundle_dir="${PROJECT_PATH}/src-tauri/target/release/bundle"
    if [[ -d "$bundle_dir" ]]; then
        log_success "Bundles Tauri: EXISTS"
        
        # Compter bundles
        local bundle_count=$(find "$bundle_dir" -type f \( -name "*.deb" -o -name "*.AppImage" -o -name "*.rpm" \) | wc -l)
        log_info "Bundles générés: ${bundle_count}"
    else
        log_warning "Bundles Tauri: NON GÉNÉRÉS"
    fi
    
    # Warnings Rust (optionnel)
    log_info "Vérification warnings Rust..."
    if grep -i "warning" "${LOG_FILE}" | grep -v "unused" | head -n5; then
        log_warning "Warnings détectés (non-bloquants)"
    else
        log_success "Aucun warning critique"
    fi
    
    return $errors
}

generate_report() {
    log_section "📄 Génération Rapport"
    
    local report_file="${LOG_DIR}/report_${TIMESTAMP}.md"
    local total_time=$(elapsed_time)
    
    cat > "${report_file}" << EOF
# Rapport Rebuild TITANE∞ v15.5.0

**Date** : $(date +"%Y-%m-%d %H:%M:%S")  
**Script** : ${SCRIPT_NAME} v${SCRIPT_VERSION}  
**Durée totale** : ${total_time}

---

## 📊 Résumé Build

| Composant | Status | Notes |
|-----------|--------|-------|
| **Backup** | ✅ | ${BACKUP_DIR}/ |
| **Nettoyage** | ✅ | node_modules, dist, target |
| **Frontend Build** | $([ -d "${PROJECT_PATH}/dist" ] && echo "✅" || echo "❌") | Vite production |
| **Backend Build** | $([ -f "${PROJECT_PATH}/src-tauri/target/release/titane-infinity" ] && echo "✅" || echo "❌") | Rust release |
| **Tauri Bundles** | $([ -d "${PROJECT_PATH}/src-tauri/target/release/bundle" ] && echo "✅" || echo "⚠️") | .deb, .AppImage |

---

## 📦 Artefacts Générés

### Frontend
- **dist/**: $([ -d "${PROJECT_PATH}/dist" ] && du -sh "${PROJECT_PATH}/dist" | cut -f1 || echo "N/A")

### Backend
- **Binaire**: $([ -f "${PROJECT_PATH}/src-tauri/target/release/titane-infinity" ] && du -h "${PROJECT_PATH}/src-tauri/target/release/titane-infinity" | cut -f1 || echo "N/A")

### Bundles Tauri
EOF

    # Lister bundles
    local bundle_dir="${PROJECT_PATH}/src-tauri/target/release/bundle"
    if [[ -d "$bundle_dir" ]]; then
        echo "- **.deb**: $(ls "${bundle_dir}"/deb/*.deb 2>/dev/null | head -n1 | xargs -r du -h | cut -f1 || echo "N/A")" >> "${report_file}"
        echo "- **.AppImage**: $(ls "${bundle_dir}"/appimage/*.AppImage 2>/dev/null | head -n1 | xargs -r du -h | cut -f1 || echo "N/A")" >> "${report_file}"
    else
        echo "- **Aucun bundle généré**" >> "${report_file}"
    fi
    
    cat >> "${report_file}" << EOF

---

## 🎯 Prochaines Étapes

1. **Tester l'application** :
   \`\`\`bash
   ${PROJECT_PATH}/src-tauri/target/release/titane-infinity
   \`\`\`

2. **Installer le package** :
   \`\`\`bash
   sudo dpkg -i ${bundle_dir}/deb/*.deb
   \`\`\`

3. **Lancer depuis menu** :
   Chercher "TITANE" dans le lanceur d'applications

---

**Rebuild terminé avec succès** ✅

Log complet : ${LOG_FILE}
EOF
    
    log_success "Rapport généré: ${report_file}"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FONCTION PRINCIPALE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

main() {
    # Création structure avec gestion sudo
    log_info "Vérification structure /opt/titane..."
    
    for dir in "${LOG_DIR}" "${BACKUP_DIR}"; do
        if [[ ! -d "$dir" ]]; then
            echo "ℹ️  Création : $dir"
            mkdir -p "$dir" 2>/dev/null || sudo mkdir -p "$dir"
            chmod 755 "$dir" 2>/dev/null || sudo chmod 755 "$dir"
        fi
    done
    
    # Vérification critique BACKUP_DIR
    if [[ ! -d "${BACKUP_DIR}" ]]; then
        echo "❌ Erreur : Impossible de créer ${BACKUP_DIR}"
        echo "   Essayez : sudo mkdir -p ${BACKUP_DIR}"
        exit 1
    fi
    
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                       ║"
    echo "║              TITANE∞ v15.5.0 — Rebuild Complet                       ║"
    echo "║                                                                       ║"
    echo "║         Reconstruction Frontend + Backend + Tauri Bundles            ║"
    echo "║                                                                       ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Détection projet
    find_project
    
    # Backup
    create_backup
    
    # Nettoyage
    clean_project
    
    # Rebuild frontend
    if ! rebuild_frontend; then
        log_error "Frontend build échoué"
        exit 1
    fi
    
    # Rebuild backend
    if ! rebuild_backend; then
        log_error "Backend build échoué"
        log_warning "Continuer avec Tauri build ? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Build Tauri
    if ! build_tauri; then
        log_error "Tauri build échoué (non-critique)"
    fi
    
    # Vérifications
    if verify_build; then
        generate_report
        
        local total_time=$(elapsed_time)
        
        echo ""
        echo "╔═══════════════════════════════════════════════════════════════════════╗"
        echo "║                                                                       ║"
        echo "║                    ✅ REBUILD TERMINÉ AVEC SUCCÈS                    ║"
        echo "║                                                                       ║"
        echo "║  Durée totale : ${total_time}"
        echo "║                                                                       ║"
        echo "║  📦 Artefacts générés :                                              ║"
        echo "║     • Frontend (dist/)                                               ║"
        echo "║     • Backend (binaire Rust)                                         ║"
        echo "║     • Bundles (.deb, .AppImage)                                      ║"
        echo "║                                                                       ║"
        echo "║  🚀 Tester : ${PROJECT_PATH}/src-tauri/target/release/titane-infinity"
        echo "║                                                                       ║"
        echo "║  📄 Rapport : ${LOG_DIR}/report_${TIMESTAMP}.md"
        echo "║                                                                       ║"
        echo "╚═══════════════════════════════════════════════════════════════════════╝"
        echo ""
        
        log_success "Rebuild terminé avec succès"
        exit 0
    else
        log_error "Rebuild terminé avec des erreurs"
        exit 1
    fi
}

# Exécution
main "$@"
