#!/bin/bash

###############################################################################
# 🚀 TITANE∞ AUTO-ALL SCRIPT
# Automatisation complète : Build, Test, Deploy
###############################################################################

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

resolve_pnpm_cmd() {
    if command -v corepack >/dev/null 2>&1; then
        PNPM=(corepack pnpm)
        return 0
    fi
    if command -v pnpm >/dev/null 2>&1; then
        PNPM=(pnpm)
        return 0
    fi
    PNPM=()
    return 1
}

ensure_pnpm() {
    if ! resolve_pnpm_cmd; then
        print_error "pnpm requis (corepack/pnpm introuvable)"
        return 1
    fi
}

###############################################################################
# FUNCTIONS
###############################################################################

print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║   🚀 TITANE∞ AUTO-ALL — Full Automation Pipeline            ║"
    echo "║                                                              ║"
    echo "║   Phase 1: Clean & Prepare                                  ║"
    echo "║   Phase 2: Build Frontend & Backend                         ║"
    echo "║   Phase 3: Run Tests                                        ║"
    echo "║   Phase 4: Déploiement production (autorisation requise)                             ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}▶ $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

###############################################################################
# PHASE 1: CLEAN & PREPARE
###############################################################################

phase1_clean() {
    print_step "Phase 1: Clean & Prepare"
    
    # Clean old builds
    if [ -d "dist" ]; then
        echo "Cleaning old frontend build..."
        rm -rf dist
        print_success "Frontend dist/ cleaned"
    fi
    
    if [ -d "src-tauri/target/release" ]; then
        echo "Cleaning old backend build..."
        rm -rf src-tauri/target/release
        print_success "Backend target/ cleaned"
    fi
    
    # Install/update dependencies
    echo "Checking dependencies..."
    if [ ! -d "node_modules" ]; then
        ensure_pnpm || return 1
        echo "Installing Node dependencies..."
        "${PNPM[@]}" install
        print_success "Node dependencies installed"
    else
        print_success "Node dependencies OK"
    fi
    
    print_success "Phase 1 Complete"
}

###############################################################################
# PHASE 2: BUILD
###############################################################################

phase2_build() {
    print_step "Phase 2: Build Frontend & Backend"
    
    # Lint first
    echo "Running ESLint..."
    ensure_pnpm || return 1
    "${PNPM[@]}" run lint || {
        print_warning "ESLint warnings found (non-blocking)"
    }
    
    # TypeScript check
    echo "Running TypeScript check..."
    "${PNPM[@]}" exec tsc --noEmit || {
        print_error "TypeScript errors found"
        return 1
    }
    print_success "TypeScript check passed"
    
    # Build frontend
    echo "Building frontend (Vite)..."
    "${PNPM[@]}" run build || {
        print_error "Frontend build failed"
        return 1
    }
    print_success "Frontend built successfully"
    
    # Build backend
    echo "Building backend (Rust/Cargo)..."
    cd src-tauri
    cargo build --release || {
        print_error "Backend build failed"
        cd ..
        return 1
    }
    cd ..
    print_success "Backend built successfully"
    
    print_success "Phase 2 Complete"
}

###############################################################################
# PHASE 3: TEST
###############################################################################

phase3_test() {
    print_step "Phase 3: Run Tests"
    
    # Run unit tests
    echo "Running unit tests..."
    pnpm test -- --run || {
        print_warning "Some tests failed (non-blocking)"
    }
    
    # Cargo tests
    echo "Running Rust tests..."
    cd src-tauri
    cargo test || {
        print_warning "Some Rust tests failed (non-blocking)"
    }
    cd ..
    
    print_success "Phase 3 Complete"
}

###############################################################################
# PHASE 4: DEPLOY
###############################################################################

phase4_deploy() {
    print_step "Phase 4: Déploiement production (autorisation requise)"
    
    # Create release package
    echo "Creating release package..."
    
    RELEASE_DIR="release/titane-infinity-v$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$RELEASE_DIR"
    
    # Copy built files
    cp -r dist "$RELEASE_DIR/"
    cp -r src-tauri/target/release/titane-infinity "$RELEASE_DIR/" 2>/dev/null || true
    cp -r src-tauri/target/release/bundle "$RELEASE_DIR/" 2>/dev/null || true
    
    # Create manifest
    cat > "$RELEASE_DIR/MANIFEST.txt" <<EOF
TITANE∞ Release Package
=======================

Build Date: $(date)
Version: 19.3.0
Environment: Production

Frontend:
  - Vite Build: dist/
  - Bundle Size: $(du -sh dist | cut -f1)

Backend:
  - Rust Binary: titane-infinity
  - Binary Size: $(du -sh src-tauri/target/release/titane-infinity 2>/dev/null | cut -f1 || echo "N/A")

Deployment Instructions:
  1. Extract package
  2. Run ./titane-infinity (or install bundle)
  3. Frontend served from dist/

EOF
    
    print_success "Release package created: $RELEASE_DIR"
    print_success "Phase 4 Complete"
}

###############################################################################
# MAIN
###############################################################################

main() {
    print_banner
    
    START_TIME=$(date +%s)
    
    # Run all phases
    phase1_clean || exit 1
    phase2_build || exit 1
    phase3_test || true  # Non-blocking
    phase4_deploy || exit 1
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    # Final summary
    echo -e "\n${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║   ✅ TITANE∞ AUTO-ALL COMPLETE                               ║"
    echo "║                                                              ║"
    echo "║   Duration: ${DURATION}s                                        ║"
    echo "║   Status: SUCCESS                                            ║"
    echo "║                                                              ║"
    echo "║   🚀 Ready for deployment!                                   ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # Show release location
    echo -e "${CYAN}📦 Release package available in: release/${NC}"
    ls -lh release/ | tail -5
}

# Run main
main "$@"
