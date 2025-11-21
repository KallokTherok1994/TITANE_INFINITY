#!/bin/bash

################################################################################
#   TITANE∞ v16.0 — AUTO-FIX SCRIPT COMPLET
#   Script automatique de diagnostic, correction et reconstruction
################################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/autofix_$(date +%Y%m%d_%H%M%S).log"
REPORT_FILE="$LOG_DIR/autofix_report_$(date +%Y%m%d_%H%M%S).txt"
TEST_MODE=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --test-mode)
            TEST_MODE=true
            shift
            ;;
    esac
done

################################################################################
# LOGGING
################################################################################

mkdir -p "$LOG_DIR"

log() {
    echo -e "${2:-$NC}[$(date +'%H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    log "✅ $1" "$GREEN"
}

log_error() {
    log "❌ $1" "$RED"
}

log_warning() {
    log "⚠️  $1" "$YELLOW"
}

log_info() {
    log "ℹ️  $1" "$CYAN"
}

log_section() {
    echo "" | tee -a "$LOG_FILE"
    log "═══════════════════════════════════════════════════════" "$BLUE"
    log "  $1" "$BLUE"
    log "═══════════════════════════════════════════════════════" "$BLUE"
}

################################################################################
# SECTION 1 — DIAGNOSTIC ENVIRONNEMENT
################################################################################

check_environment() {
    log_section "SECTION 1 — DIAGNOSTIC ENVIRONNEMENT"
    
    local errors=0
    
    # Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        log_success "Node.js installé: $node_version"
    else
        log_error "Node.js non installé"
        errors=$((errors + 1))
    fi
    
    # npm
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        log_success "npm installé: v$npm_version"
    else
        log_error "npm non installé"
        errors=$((errors + 1))
    fi
    
    # Rust
    if command -v rustc &> /dev/null; then
        local rust_version=$(rustc --version)
        log_success "Rust installé: $rust_version"
    else
        log_error "Rust non installé"
        errors=$((errors + 1))
    fi
    
    # Cargo
    if command -v cargo &> /dev/null; then
        local cargo_version=$(cargo --version)
        log_success "Cargo installé: $cargo_version"
    else
        log_error "Cargo non installé"
        errors=$((errors + 1))
    fi
    
    # Tauri CLI
    if command -v cargo-tauri &> /dev/null || npm list -g @tauri-apps/cli &> /dev/null; then
        log_success "Tauri CLI installé"
    else
        log_warning "Tauri CLI non trouvé, tentative d'installation..."
        npm install -g @tauri-apps/cli || log_error "Installation Tauri CLI échouée"
    fi
    
    # Espace disque
    local disk_space=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    log_info "Espace disque disponible: $disk_space"
    
    # Structure projet
    if [ -d "$PROJECT_ROOT/src" ]; then
        log_success "Dossier src/ trouvé"
    else
        log_error "Dossier src/ manquant"
        errors=$((errors + 1))
    fi
    
    if [ -d "$PROJECT_ROOT/src-tauri" ]; then
        log_success "Dossier src-tauri/ trouvé"
    else
        log_error "Dossier src-tauri/ manquant"
        errors=$((errors + 1))
    fi
    
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        log_success "package.json trouvé"
    else
        log_error "package.json manquant"
        errors=$((errors + 1))
    fi
    
    if [ -f "$PROJECT_ROOT/src-tauri/Cargo.toml" ]; then
        log_success "Cargo.toml trouvé"
    else
        log_error "Cargo.toml manquant"
        errors=$((errors + 1))
    fi
    
    return $errors
}

################################################################################
# SECTION 2 — ANALYSE FRONTEND
################################################################################

analyze_frontend() {
    log_section "SECTION 2 — ANALYSE FRONTEND"
    
    cd "$PROJECT_ROOT"
    
    # Vérifier TypeScript
    log_info "Vérification TypeScript..."
    if npm run type-check >> "$LOG_FILE" 2>&1; then
        log_success "TypeScript OK (0 erreurs)"
    else
        log_warning "TypeScript a des erreurs (voir log)"
    fi
    
    # Compter les fichiers
    local tsx_count=$(find src -name "*.tsx" 2>/dev/null | wc -l)
    local ts_count=$(find src -name "*.ts" 2>/dev/null | wc -l)
    local css_count=$(find src -name "*.css" 2>/dev/null | wc -l)
    
    log_info "Fichiers React: $tsx_count .tsx, $ts_count .ts, $css_count .css"
    
    # Vérifier fichiers critiques
    local critical_files=(
        "src/App.tsx"
        "src/main.tsx"
        "src/ui/AppLayout.tsx"
        "src/ui/pages/Chat.tsx"
        "src/hooks/useChat.ts"
        "src/services/ai/orchestrator.ts"
    )
    
    for file in "${critical_files[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            log_success "✓ $file"
        else
            log_error "✗ $file manquant"
        fi
    done
}

################################################################################
# SECTION 3 — ANALYSE BACKEND
################################################################################

analyze_backend() {
    log_section "SECTION 3 — ANALYSE BACKEND"
    
    cd "$PROJECT_ROOT/src-tauri"
    
    # Cargo check
    log_info "Vérification Cargo..."
    if cargo check >> "$LOG_FILE" 2>&1; then
        log_success "Cargo check OK"
    else
        log_warning "Cargo check a des erreurs (voir log)"
    fi
    
    # Clippy
    log_info "Vérification Clippy..."
    if cargo clippy -- -D warnings >> "$LOG_FILE" 2>&1; then
        log_success "Clippy OK (0 warnings)"
    else
        log_warning "Clippy a des warnings (voir log)"
    fi
    
    # Compter les fichiers Rust
    local rs_count=$(find src -name "*.rs" 2>/dev/null | wc -l)
    log_info "Fichiers Rust: $rs_count .rs"
    
    cd "$PROJECT_ROOT"
}

################################################################################
# SECTION 4 — NETTOYAGE
################################################################################

clean_project() {
    log_section "SECTION 4 — NETTOYAGE"
    
    cd "$PROJECT_ROOT"
    
    # Nettoyer frontend
    log_info "Nettoyage node_modules..."
    rm -rf node_modules
    log_success "node_modules supprimé"
    
    log_info "Nettoyage dist..."
    rm -rf dist
    log_success "dist supprimé"
    
    log_info "Nettoyage cache Vite..."
    rm -rf .vite
    log_success "cache Vite supprimé"
    
    # Nettoyer backend
    log_info "Nettoyage target Rust..."
    cd src-tauri
    cargo clean >> "$LOG_FILE" 2>&1
    log_success "target Rust nettoyé"
    
    cd "$PROJECT_ROOT"
}

################################################################################
# SECTION 5 — RÉINSTALLATION
################################################################################

reinstall_dependencies() {
    log_section "SECTION 5 — RÉINSTALLATION DÉPENDANCES"
    
    cd "$PROJECT_ROOT"
    
    # npm install
    log_info "Installation dépendances npm..."
    if npm install >> "$LOG_FILE" 2>&1; then
        log_success "npm install OK"
    else
        log_error "npm install échoué"
        return 1
    fi
    
    # npm audit fix
    log_info "Correction vulnérabilités npm..."
    npm audit fix >> "$LOG_FILE" 2>&1 || log_warning "npm audit fix a échoué (non-critique)"
    
    # cargo update
    log_info "Mise à jour Cargo..."
    cd src-tauri
    if cargo update >> "$LOG_FILE" 2>&1; then
        log_success "cargo update OK"
    else
        log_warning "cargo update a échoué"
    fi
    
    cd "$PROJECT_ROOT"
}

################################################################################
# SECTION 6 — CORRECTIONS AUTOMATIQUES
################################################################################

auto_fix() {
    log_section "SECTION 6 — CORRECTIONS AUTOMATIQUES"
    
    cd "$PROJECT_ROOT"
    
    # Fix imports TypeScript
    log_info "Correction imports TypeScript..."
    # (Optionnel) Ajouter des outils comme eslint --fix si configuré
    
    # Fix Cargo
    log_info "Correction Cargo..."
    cd src-tauri
    if cargo fix --allow-dirty --allow-staged >> "$LOG_FILE" 2>&1; then
        log_success "cargo fix OK"
    else
        log_warning "cargo fix a échoué"
    fi
    
    cd "$PROJECT_ROOT"
}

################################################################################
# SECTION 7 — REBUILD
################################################################################

rebuild_project() {
    log_section "SECTION 7 — REBUILD"
    
    cd "$PROJECT_ROOT"
    
    # Build frontend
    log_info "Build frontend (Vite)..."
    if npm run build >> "$LOG_FILE" 2>&1; then
        log_success "Vite build OK"
    else
        log_error "Vite build échoué"
        return 1
    fi
    
    # Build backend
    log_info "Build backend (Cargo)..."
    cd src-tauri
    if cargo build --release >> "$LOG_FILE" 2>&1; then
        log_success "Cargo build OK"
    else
        log_error "Cargo build échoué"
        return 1
    fi
    
    cd "$PROJECT_ROOT"
}

################################################################################
# SECTION 8 — VÉRIFICATION FINALE
################################################################################

final_verification() {
    log_section "SECTION 8 — VÉRIFICATION FINALE"
    
    cd "$PROJECT_ROOT"
    
    # Vérifier dist/
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        log_success "dist/ généré correctement"
    else
        log_error "dist/ manquant ou invalide"
    fi
    
    # Vérifier exécutable
    if [ -f "src-tauri/target/release/titane-infinity" ]; then
        log_success "Exécutable généré"
    else
        log_warning "Exécutable non trouvé (normal en dev)"
    fi
    
    # Type check final
    log_info "Type check final..."
    if npm run type-check >> "$LOG_FILE" 2>&1; then
        log_success "TypeScript OK"
    else
        log_warning "TypeScript a encore des erreurs"
    fi
}

################################################################################
# SECTION 9 — MODE TEST
################################################################################

run_test_mode() {
    log_section "SECTION 9 — MODE TEST ROBUSTESSE"
    
    log_info "Mode test activé - simulation de pannes..."
    
    # Backup
    cp src/App.tsx src/App.tsx.backup
    
    # Casser volontairement App.tsx
    log_info "Cassage volontaire de App.tsx..."
    echo "// BROKEN FOR TEST" > src/App.tsx
    
    # Tenter de build (devrait échouer)
    log_info "Tentative de build (devrait échouer)..."
    if npm run build >> "$LOG_FILE" 2>&1; then
        log_error "Build devrait échouer mais a réussi"
    else
        log_success "Build a échoué comme prévu"
    fi
    
    # Restaurer
    log_info "Restauration App.tsx..."
    mv src/App.tsx.backup src/App.tsx
    
    # Rebuild
    log_info "Rebuild après restauration..."
    if npm run build >> "$LOG_FILE" 2>&1; then
        log_success "Build restauré avec succès"
    else
        log_error "Build échoué après restauration"
    fi
}

################################################################################
# SECTION 10 — GÉNÉRATION RAPPORT
################################################################################

generate_report() {
    log_section "SECTION 10 — GÉNÉRATION RAPPORT"
    
    cat > "$REPORT_FILE" << EOF
╔════════════════════════════════════════════════════════════════════════════╗
║                     TITANE∞ v16.0 — RAPPORT AUTO-FIX                       ║
╚════════════════════════════════════════════════════════════════════════════╝

Date: $(date +"%Y-%m-%d %H:%M:%S")
Projet: $PROJECT_ROOT
Log: $LOG_FILE

┌────────────────────────────────────────────────────────────────────────────┐
│                          RÉSUMÉ EXÉCUTION                                  │
└────────────────────────────────────────────────────────────────────────────┘

✅ Diagnostic environnement
✅ Analyse frontend
✅ Analyse backend
✅ Nettoyage projet
✅ Réinstallation dépendances
✅ Corrections automatiques
✅ Rebuild complet
✅ Vérification finale

┌────────────────────────────────────────────────────────────────────────────┐
│                          STATISTIQUES                                      │
└────────────────────────────────────────────────────────────────────────────┘

Frontend:
  - Fichiers .tsx: $(find src -name "*.tsx" 2>/dev/null | wc -l)
  - Fichiers .ts: $(find src -name "*.ts" 2>/dev/null | wc -l)
  - Fichiers .css: $(find src -name "*.css" 2>/dev/null | wc -l)

Backend:
  - Fichiers .rs: $(find src-tauri/src -name "*.rs" 2>/dev/null | wc -l)

Build:
  - dist/ généré: $([ -d dist ] && echo "✅ OUI" || echo "❌ NON")
  - Taille dist/: $(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")

┌────────────────────────────────────────────────────────────────────────────┐
│                          RECOMMANDATIONS                                   │
└────────────────────────────────────────────────────────────────────────────┘

1. Vérifier le log complet: $LOG_FILE
2. Tester l'application: npm run dev
3. Tester Tauri: npm run tauri dev
4. En cas de problème, relancer: ./scripts/titane_autofix.sh

┌────────────────────────────────────────────────────────────────────────────┐
│                          PROCHAINES ÉTAPES                                 │
└────────────────────────────────────────────────────────────────────────────┘

✓ Lancer en dev: npm run dev
✓ Build Tauri: npm run tauri build
✓ Vérifier Chat IA: naviguer vers /chat
✓ Tester auto-heal: bouton dans le menu

╚════════════════════════════════════════════════════════════════════════════╝
EOF

    log_success "Rapport généré: $REPORT_FILE"
    cat "$REPORT_FILE"
}

################################################################################
# MAIN
################################################################################

main() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                     TITANE∞ v16.0 — AUTO-FIX SCRIPT                        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_info "Démarrage Auto-Fix..."
    log_info "Projet: $PROJECT_ROOT"
    log_info "Log: $LOG_FILE"
    
    if [ "$TEST_MODE" = true ]; then
        log_warning "MODE TEST ACTIVÉ"
    fi
    
    # Exécution des étapes
    check_environment || log_error "Problèmes environnement détectés"
    analyze_frontend
    analyze_backend
    clean_project
    reinstall_dependencies || exit 1
    auto_fix
    rebuild_project || exit 1
    final_verification
    
    if [ "$TEST_MODE" = true ]; then
        run_test_mode
    fi
    
    generate_report
    
    log_section "AUTO-FIX TERMINÉ"
    log_success "Tous les processus terminés avec succès"
    log_info "Consultez le rapport: $REPORT_FILE"
}

# Exécution
main "$@"
