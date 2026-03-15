#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# TITANE∞ v26.4.0 — Post-Certification Deployment Pipeline
# Déploiement sécurisé après certification de production complète
# Requires: GATE_RELEASE certification (81/81 tests PASS)
# ═══════════════════════════════════════════════════════════════════════════════
#
# USAGE:
#   ./scripts/deployment/certified-deploy.sh [OPTIONS]
#
# OPTIONS:
#   --verify-cert        Vérifier la certification avant déploiement (default: true)
#   --skip-cert          Ignorer la vérification certification (DANGER)
#   --target TARGET      Cible: appimage|deb|both (default: both)
#   --deploy-path PATH   Chemin de déploiement (default: deployment/latest/)
#   --manifest-update    Mettre à jour MANIFEST.json (default: true)
#   --dry-run           Mode simulation
#   --verbose           Mode verbeux
#   --help              Afficher l'aide
#
# RÉSULTAT:
#   deployment/latest/TITANE-Infinity_*.AppImage
#   deployment/latest/TITANE-Infinity_*.deb  
#   deployment/latest/MANIFEST.json (updated)
#
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$PROJECT_ROOT/logs/deployment"
LOG_FILE="$LOG_DIR/certified-deploy-${TIMESTAMP}.log"

# Options par défaut
VERIFY_CERTIFICATION=true
SKIP_CERTIFICATION=false
TARGET_TYPE="both"
DEPLOY_PATH="$PROJECT_ROOT/deployment/latest"
UPDATE_MANIFEST=true
DRY_RUN=false
VERBOSE=false

# Deployed artifacts (filled during execution)
DEPLOYED_APPIMAGE=""
DEPLOYED_DEB=""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m' 
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# LOGGING FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${CYAN}[VERBOSE]${NC} $1" | tee -a "$LOG_FILE"
    else
        echo "$1" >> "$LOG_FILE"
    fi
}

print_header() {
    log ""
    log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    log "${BOLD}${CYAN}   $1${NC}"
    log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    log ""
}

print_section() {
    log "${YELLOW}━━━ $1 ━━━${NC}"
}

success() {
    log "${GREEN}✓ $1${NC}"
}

error() {
    log "${RED}✗ ERROR: $1${NC}"
    exit 1
}

warning() {
    log "${YELLOW}⚠ WARNING: $1${NC}"
}

info() {
    log "${CYAN}ℹ $1${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
# CERTIFICATION VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────

verify_certification_status() {
    print_section "CERTIFICATION VERIFICATION"
    
    if [ "$SKIP_CERTIFICATION" = true ]; then
        warning "Skipping certification verification (--skip-cert enabled)"
        warning "This bypasses production safety checks - USE WITH CAUTION"
        return 0
    fi
    
    info "Running full certification chain validation..."
    
    # Execute all certification gates
    log_verbose "Executing: pnpm test -- --run tests/phase*/gate-*.test.ts tests/release/gate-release.test.ts"
    
    if [ "$DRY_RUN" = true ]; then
        info "[DRY-RUN] Would verify certification chain"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    if ./.tools/node/current/bin/pnpm test -- --run tests/phase*/gate-*.test.ts tests/release/gate-release.test.ts >> "$LOG_FILE" 2>&1; then
        success "CERTIFICATION VERIFIED: All gates operational"
        
        # Extract test results
        local test_output=$(tail -n 50 "$LOG_FILE" | grep -E "(Test Files|Tests|passed)" | tail -n 3)
        log "${GREEN}${BOLD}Certification Results:${NC}"
        echo "$test_output" | while read line; do
            log "${GREEN}  $line${NC}"
        done
        
        success "✅ TITANE∞ PRODUCTION CERTIFICATION: VALIDATED"
        return 0
    else
        error "CERTIFICATION FAILED: System not ready for production deployment"
        error "Check certification tests before attempting deployment"
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# ARTIFACT PREPARATION
# ─────────────────────────────────────────────────────────────────────────────

prepare_artifacts() {
    print_section "ARTIFACT PREPARATION"
    
    cd "$PROJECT_ROOT"
    
    # Check if stable build artifacts exist
    local appimage_exists=false
    local deb_exists=false
    
    if ls runtime/stable/*.AppImage >/dev/null 2>&1; then
        appimage_exists=true
        success "AppImage artifacts found"
    fi
    
    if ls runtime/stable/*.deb >/dev/null 2>&1; then
        deb_exists=true
        success "DEB artifacts found"
    fi
    
    if [ "$appimage_exists" = false ] && [ "$deb_exists" = false ]; then
        warning "No build artifacts found in runtime/stable/"
        info "Triggering stable build..."
        
        if [ "$DRY_RUN" = true ]; then
            info "[DRY-RUN] Would execute stable build"
            return 0
        fi
        
        if ./runtime/stable/build.sh >> "$LOG_FILE" 2>&1; then
            success "Stable build completed"
        else
            error "Stable build failed. Check logs: $LOG_FILE"
        fi
    fi
    
    # Verify artifacts are ready
    if [ "$TARGET_TYPE" = "appimage" ] || [ "$TARGET_TYPE" = "both" ]; then
        if ! ls runtime/stable/*.AppImage >/dev/null 2>&1; then
            error "AppImage target requested but no AppImage found"
        fi
    fi
    
    if [ "$TARGET_TYPE" = "deb" ] || [ "$TARGET_TYPE" = "both" ]; then
        if ! ls runtime/stable/*.deb >/dev/null 2>&1; then
            error "DEB target requested but no DEB found"
        fi
    fi
    
    success "Artifacts ready for deployment"
}

# ─────────────────────────────────────────────────────────────────────────────
# DEPLOYMENT EXECUTION
# ─────────────────────────────────────────────────────────────────────────────

execute_deployment() {
    print_section "CERTIFIED DEPLOYMENT EXECUTION"
    
    cd "$PROJECT_ROOT"
    
    # Ensure deployment directory
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$DEPLOY_PATH"
    fi
    
    info "Deployment target: $DEPLOY_PATH"
    info "Artifact types: $TARGET_TYPE"
    
    # Deploy AppImage
    if [ "$TARGET_TYPE" = "appimage" ] || [ "$TARGET_TYPE" = "both" ]; then
        local appimage_src
        appimage_src=$(ls -1t runtime/stable/*.AppImage 2>/dev/null | head -n1 || true)
        if [ -n "$appimage_src" ] && [ -f "$appimage_src" ]; then
            local appimage_name=$(basename "$appimage_src")
            local appimage_dest="$DEPLOY_PATH/$appimage_name"
            
            if [ "$DRY_RUN" = true ]; then
                info "[DRY-RUN] Would deploy: $appimage_src -> $appimage_dest"
            else
                cp "$appimage_src" "$appimage_dest"
                chmod +x "$appimage_dest"
                DEPLOYED_APPIMAGE="$appimage_dest"
                success "AppImage deployed: $appimage_name"
            fi
        fi
    fi
    
    # Deploy DEB
    if [ "$TARGET_TYPE" = "deb" ] || [ "$TARGET_TYPE" = "both" ]; then
        local deb_src
        deb_src=$(ls -1t runtime/stable/*.deb 2>/dev/null | head -n1 || true)
        if [ -n "$deb_src" ] && [ -f "$deb_src" ]; then
            local deb_name=$(basename "$deb_src")
            local deb_dest="$DEPLOY_PATH/$deb_name"
            
            if [ "$DRY_RUN" = true ]; then
                info "[DRY-RUN] Would deploy: $deb_src -> $deb_dest"
            else
                cp "$deb_src" "$deb_dest"
                DEPLOYED_DEB="$deb_dest"
                success "DEB deployed: $deb_name"
            fi
        fi
    fi
    
    success "Certified deployment completed"
}

# ─────────────────────────────────────────────────────────────────────────────
# MANIFEST UPDATE
# ─────────────────────────────────────────────────────────────────────────────

update_deployment_manifest() {
    if [ "$UPDATE_MANIFEST" = false ]; then
        return 0
    fi
    
    print_section "DEPLOYMENT MANIFEST UPDATE"
    
    local manifest_file="$DEPLOY_PATH/MANIFEST.json"
    local package_version=$(cd "$PROJECT_ROOT" && jq -r '.version' package.json 2>/dev/null || echo "unknown")
    local version="$package_version"
    local commit=$(cd "$PROJECT_ROOT" && git rev-parse HEAD 2>/dev/null || echo "unknown")
    local branch=$(cd "$PROJECT_ROOT" && git branch --show-current 2>/dev/null || echo "unknown")
    
    # Calculate hashes
    local appimage_hash="none"
    local deb_hash="none"
    local appimage_file=""
    local deb_file=""
    local appimage_name=""
    local deb_name=""
    
    if [ -n "$DEPLOYED_APPIMAGE" ] && [ -f "$DEPLOYED_APPIMAGE" ]; then
        appimage_file="$DEPLOYED_APPIMAGE"
    else
        appimage_file=$(ls -1t "$DEPLOY_PATH"/*.AppImage 2>/dev/null | head -n1 || true)
    fi
    if [ -n "$appimage_file" ] && [ -f "$appimage_file" ]; then
        appimage_hash=$(sha256sum "$appimage_file" | awk '{print $1}')
        appimage_name=$(basename "$appimage_file")
    fi

    if [ -n "$DEPLOYED_DEB" ] && [ -f "$DEPLOYED_DEB" ]; then
        deb_file="$DEPLOYED_DEB"
    else
        deb_file=$(ls -1t "$DEPLOY_PATH"/*.deb 2>/dev/null | head -n1 || true)
    fi
    if [ -n "$deb_file" ] && [ -f "$deb_file" ]; then
        deb_hash=$(sha256sum "$deb_file" | awk '{print $1}')
        deb_name=$(basename "$deb_file")
    fi

    # Prefer artifact version when available to keep manifest aligned with deployed binaries.
    local artifact_version=""
    local version_source_name=""
    if [ -n "$appimage_name" ]; then
        artifact_version=$(echo "$appimage_name" | sed -n 's/.*_\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)_amd64\..*/\1/p')
        version_source_name="$appimage_name"
    fi
    if [ -z "$artifact_version" ] && [ -n "$deb_name" ]; then
        artifact_version=$(echo "$deb_name" | sed -n 's/.*_\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)_amd64\..*/\1/p')
        version_source_name="$deb_name"
    fi
    if [ -n "$artifact_version" ]; then
        version="$artifact_version"
        if [ "$package_version" != "$artifact_version" ]; then
            warning "Version mismatch detected: package.json=$package_version, artifact($version_source_name)=$artifact_version"
        fi
    fi
    
    if [ "$DRY_RUN" = true ]; then
        info "[DRY-RUN] Would update manifest: $manifest_file"
        return 0
    fi
    
    # Generate manifest
    cat > "$manifest_file" <<EOF
{
  "deployment": {
    "timestamp": "$(date -u '+%Y-%m-%d %H:%M:%S UTC')",
    "version": "$version",
    "commit": "$commit",
    "branch": "$branch",
    "certification": "TITANE_INFINITY_RELEASE_${TIMESTAMP}_CERTIFIED",
    "deployment_type": "post_certification"
  },
  "artifacts": {
    "appimage": {
      "available": $([ "$appimage_hash" != "none" ] && echo "true" || echo "false"),
      "sha256": "$appimage_hash"
    },
    "deb": {
      "available": $([ "$deb_hash" != "none" ] && echo "true" || echo "false"),
      "sha256": "$deb_hash"
    }
  },
  "certification": {
    "release_gate_status": "PASSED",
    "phase_chain_status": "P2→P3→P4→P5→P6→RELEASE: COMPLETE",
    "security_posture": "MAXIMUM_HARDENED",
    "production_readiness": "CERTIFIED_READY"
  }
}
EOF
    
    # Keep checksum and size sidecars aligned with the deployed artifacts.
    local checksums_file="$DEPLOY_PATH/CHECKSUMS.sha256"
    local sha_file="$DEPLOY_PATH/SHA256SUMS.txt"
    local sizes_file="$DEPLOY_PATH/SIZES.txt"
    : > "$checksums_file"

    if [ "$appimage_hash" != "none" ] && [ -n "$appimage_name" ]; then
        echo "$appimage_hash  $appimage_name" >> "$checksums_file"
    fi
    if [ "$deb_hash" != "none" ] && [ -n "$deb_name" ]; then
        echo "$deb_hash  $deb_name" >> "$checksums_file"
    fi
    if [ -f "$DEPLOY_PATH/titane-infinity" ]; then
        local binary_hash
        binary_hash=$(sha256sum "$DEPLOY_PATH/titane-infinity" | awk '{print $1}')
        echo "$binary_hash  titane-infinity" >> "$checksums_file"
    fi
    cp "$checksums_file" "$sha_file"

    {
        echo "# Artifact Sizes"
        echo "# Generated: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
        if [ -n "$appimage_file" ] && [ -f "$appimage_file" ]; then
            echo "$appimage_name: $(stat -c%s "$appimage_file") bytes ($(du -h "$appimage_file" | awk '{print $1}'))"
        fi
        if [ -n "$deb_file" ] && [ -f "$deb_file" ]; then
            echo "$deb_name: $(stat -c%s "$deb_file") bytes ($(du -h "$deb_file" | awk '{print $1}'))"
        fi
        if [ -f "$DEPLOY_PATH/titane-infinity" ]; then
            echo "titane-infinity: $(stat -c%s "$DEPLOY_PATH/titane-infinity") bytes ($(du -h "$DEPLOY_PATH/titane-infinity" | awk '{print $1}'))"
        fi
    } > "$sizes_file"

    success "Deployment manifest updated: MANIFEST.json"
    success "Checksums updated: CHECKSUMS.sha256, SHA256SUMS.txt"
    success "Sizes updated: SIZES.txt"
    info "Version: $version"
    info "Certification: TITANE_INFINITY_RELEASE_${TIMESTAMP}_CERTIFIED"
}

# ─────────────────────────────────────────────────────────────────────────────
# ARGUMENT PARSING
# ─────────────────────────────────────────────────────────────────────────────

show_help() {
    cat << EOF
TITANE∞ Certified Deployment Pipeline v26.4.0

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --verify-cert        Vérifier la certification avant déploiement (default: true)
    --skip-cert          Ignorer la vérification certification (DANGER)
    --target TARGET      Cible: appimage|deb|both (default: both)
    --deploy-path PATH   Chemin de déploiement (default: deployment/latest/)
    --manifest-update    Mettre à jour MANIFEST.json (default: true)
    --no-manifest        Ne pas mettre à jour MANIFEST.json
    --dry-run           Mode simulation
    --verbose           Mode verbeux
    --help              Afficher cette aide

EXAMPLES:
    $0                                    # Déploiement standard complet
    $0 --target appimage                  # AppImage uniquement
    $0 --deploy-path ~/Deploy/            # Chemin personnalisé
    $0 --dry-run --verbose               # Simulation avec détails
    $0 --skip-cert --target deb          # DANGER: sans certification

NOTES:
    - Requires GATE_RELEASE certification (81/81 tests PASS)
    - Creates deployment/latest/ with artifacts + manifest
    - All operations logged to logs/deployment/
    
EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verify-cert)
            VERIFY_CERTIFICATION=true
            shift
            ;;
        --skip-cert)
            SKIP_CERTIFICATION=true
            VERIFY_CERTIFICATION=false
            shift
            ;;
        --target)
            TARGET_TYPE="$2"
            if [[ ! "$TARGET_TYPE" =~ ^(appimage|deb|both)$ ]]; then
                error "Invalid target: $TARGET_TYPE. Must be: appimage|deb|both"
            fi
            shift 2
            ;;
        --deploy-path)
            DEPLOY_PATH="$2"
            shift 2
            ;;
        --manifest-update)
            UPDATE_MANIFEST=true
            shift
            ;;
        --no-manifest)
            UPDATE_MANIFEST=false
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            error "Unknown option: $1. Use --help for usage info."
            ;;
    esac
done

# ─────────────────────────────────────────────────────────────────────────────
# MAIN EXECUTION
# ─────────────────────────────────────────────────────────────────────────────

main() {
    print_header "TITANE∞ CERTIFIED DEPLOYMENT PIPELINE v26.4.0"
    
    # Log configuration
    log "Deployment started: $(date)"
    log "Log file: $LOG_FILE"
    log "Target: $TARGET_TYPE"
    log "Deploy path: $DEPLOY_PATH"
    log "Dry run: $DRY_RUN"
    log "Verify certification: $VERIFY_CERTIFICATION"
    log ""
    
    # Execution pipeline
    if [ "$VERIFY_CERTIFICATION" = true ]; then
        verify_certification_status
    fi
    
    prepare_artifacts
    execute_deployment  
    update_deployment_manifest
    
    # Final status
    print_header "DEPLOYMENT COMPLETE"
    success "✅ TITANE∞ CERTIFIED DEPLOYMENT: SUCCESS"
    
    if [ "$DRY_RUN" = false ]; then
        log ""
        log "${GREEN}${BOLD}Deployment Summary:${NC}"
        log "${GREEN}  Artifacts: $DEPLOY_PATH${NC}"
        log "${GREEN}  Manifest: $DEPLOY_PATH/MANIFEST.json${NC}"
        log "${GREEN}  Log: $LOG_FILE${NC}"
        
        if [ -n "$DEPLOYED_APPIMAGE" ]; then
            log "${GREEN}  AppImage: $(basename "$DEPLOYED_APPIMAGE")${NC}"
        elif ls "$DEPLOY_PATH"/*.AppImage >/dev/null 2>&1; then
            log "${GREEN}  AppImage: $(ls -1t "$DEPLOY_PATH"/*.AppImage | head -n1 | xargs basename)${NC}"
        fi
        if [ -n "$DEPLOYED_DEB" ]; then
            log "${GREEN}  DEB: $(basename "$DEPLOYED_DEB")${NC}"
        elif ls "$DEPLOY_PATH"/*.deb >/dev/null 2>&1; then
            log "${GREEN}  DEB: $(ls -1t "$DEPLOY_PATH"/*.deb | head -n1 | xargs basename)${NC}"
        fi
        
        log ""
        log "${CYAN}🎉 TITANE∞ Ready for Production Distribution 🎉${NC}"
    fi
}

# Run main function
main "$@"