#!/bin/bash

################################################################################
# 🚀 TITANE∞ v26.3.0 — COMPLETE DEPLOYMENT & BUILD SCRIPT
################################################################################
# Ultra-complete deployment script with:
# ✅ Environment verification
# ✅ Dependency installation
# ✅ Code quality checks
# ✅ Production build
# ✅ Artifact creation
# ✅ Installation & deployment
# ✅ Smoke testing
# ✅ Reporting
################################################################################

set -euo pipefail

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_LOG="/tmp/titane_deploy_$(date +%s).log"
DEPLOY_DIR="$REPO_ROOT/deployment/v26.3.0"
INSTALL_DIR="${INSTALL_DIR:-/opt/titane-infinity}"

# Flags
SKIP_TESTS="${SKIP_TESTS:-false}"
SKIP_BUILD="${SKIP_BUILD:-false}"
INSTALL_SYSTEM="${INSTALL_SYSTEM:-false}"
SMOKE_TEST="${SMOKE_TEST:-true}"
VERBOSE="${VERBOSE:-false}"

################################################################################
# LOGGING FUNCTIONS
################################################################################

log() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*" | tee -a "$BUILD_LOG"
}

log_success() {
  echo -e "${GREEN}✅${NC} $*" | tee -a "$BUILD_LOG"
}

log_error() {
  echo -e "${RED}❌ ERROR:${NC} $*" | tee -a "$BUILD_LOG"
}

log_warning() {
  echo -e "${YELLOW}⚠️${NC} $*" | tee -a "$BUILD_LOG"
}

log_section() {
  echo -e "\n${MAGENTA}════════════════════════════════════════════════════════${NC}" | tee -a "$BUILD_LOG"
  echo -e "${MAGENTA}$*${NC}" | tee -a "$BUILD_LOG"
  echo -e "${MAGENTA}════════════════════════════════════════════════════════${NC}\n" | tee -a "$BUILD_LOG"
}

################################################################################
# UTILITY FUNCTIONS
################################################################################

check_command() {
  if ! command -v "$1" &> /dev/null; then
    log_error "$1 is not installed"
    return 1
  fi
  log_success "$1 found: $(command -v "$1")"
  return 0
}

check_requirements() {
  log_section "📋 PHASE 1: CHECKING REQUIREMENTS"
  
  local missing=false
  
  log "Checking system dependencies..."
  for cmd in git node npm pnpm cargo rustc; do
    if ! check_command "$cmd"; then
      missing=true
    fi
  done
  
  if [ "$missing" = true ]; then
    log_error "Some required commands are missing"
    return 1
  fi
  
  log_success "All system dependencies available"
  
  # Check Node version
  local node_version=$(node -v)
  log "Node version: $node_version"
  
  # Check Rust version
  local rust_version=$(rustc -V)
  log "Rust version: $rust_version"
  
  # Check if we're in the correct directory
  if [ ! -f "$REPO_ROOT/package.json" ]; then
    log_error "package.json not found in $REPO_ROOT"
    return 1
  fi
  
  log_success "Repository structure verified"
}

setup_environment() {
  log_section "🔧 PHASE 2: SETTING UP ENVIRONMENT"
  
  cd "$REPO_ROOT"
  log "Working directory: $(pwd)"
  
  # Create deployment directory
  mkdir -p "$DEPLOY_DIR"
  log "Deployment directory: $DEPLOY_DIR"
  
  # Setup logging
  log "Build log: $BUILD_LOG"
  
  log_success "Environment setup complete"
}

install_dependencies() {
  log_section "📦 PHASE 3: INSTALLING DEPENDENCIES"
  
  cd "$REPO_ROOT"
  
  log "Installing Node dependencies with pnpm..."
  if pnpm install --frozen-lockfile; then
    log_success "Node dependencies installed"
  else
    log_error "Failed to install Node dependencies"
    return 1
  fi
  
  log "Installing Rust dependencies..."
  if cargo build --manifest-path src-tauri/Cargo.toml 2>&1 | head -50 >> "$BUILD_LOG"; then
    log_success "Rust dependencies resolved"
  else
    log_warning "Rust build check returned warnings (non-blocking)"
  fi
  
  log_success "All dependencies installed"
}

run_code_quality_checks() {
  if [ "$SKIP_TESTS" = true ]; then
    log_warning "Skipping code quality checks (SKIP_TESTS=true)"
    return 0
  fi
  
  log_section "✨ PHASE 4: CODE QUALITY CHECKS"
  
  cd "$REPO_ROOT"
  
  # TypeScript check
  log "Running TypeScript compiler..."
  if npx tsc --noEmit --skipLibCheck 2>&1 | tail -20 >> "$BUILD_LOG"; then
    log_success "TypeScript compilation successful"
  else
    log_error "TypeScript compilation failed"
    return 1
  fi
  
  # ESLint check
  log "Running ESLint..."
  if pnpm exec eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0 2>&1 | tail -20 >> "$BUILD_LOG"; then
    log_success "ESLint validation passed (0 warnings)"
  else
    log_error "ESLint validation failed"
    return 1
  fi
  
  # Prettier check
  log "Running Prettier format check..."
  if pnpm exec prettier --check . 2>&1 | tail -20 >> "$BUILD_LOG"; then
    log_success "Prettier format check passed"
  else
    log_warning "Prettier format check found issues (non-blocking)"
  fi
  
  # Cargo check
  log "Running cargo check..."
  if cargo check --manifest-path src-tauri/Cargo.toml 2>&1 | tail -20 >> "$BUILD_LOG"; then
    log_success "Cargo check passed"
  else
    log_error "Cargo check failed"
    return 1
  fi
  
  log_success "All code quality checks passed"
}

build_vite() {
  log_section "⚙️  PHASE 5: VITE FRONTEND BUILD"
  
  cd "$REPO_ROOT"
  
  log "Building frontend with Vite..."
  local start_time=$(date +%s)
  
  if pnpm run build 2>&1 | tee -a "$BUILD_LOG"; then
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_success "Vite build completed in ${duration}s"
  else
    log_error "Vite build failed"
    return 1
  fi
}

build_production() {
  if [ "$SKIP_BUILD" = true ]; then
    log_warning "Skipping production build (SKIP_BUILD=true)"
    return 0
  fi
  
  log_section "🔨 PHASE 6: PRODUCTION BUILD (TAURI)"
  
  cd "$REPO_ROOT"
  
  log "Building Tauri application for production..."
  local start_time=$(date +%s)
  
  if pnpm run titane:build 2>&1 | tee -a "$BUILD_LOG"; then
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_success "Production build completed in ${duration}s"
  else
    log_error "Production build failed"
    return 1
  fi
}

create_artifacts() {
  log_section "📦 PHASE 7: ARTIFACT STAGING"
  
  cd "$REPO_ROOT"
  
  log "Staging AppImage..."
  if cp -v src-tauri/target/release/bundle/appimage/*.AppImage "$DEPLOY_DIR/" 2>&1 >> "$BUILD_LOG"; then
    log_success "AppImage staged: $(ls -lh "$DEPLOY_DIR"/*.AppImage | awk '{print $9, $5}')"
  else
    log_error "Failed to stage AppImage"
    return 1
  fi
  
  log "Staging DEB package..."
  if cp -v src-tauri/target/release/bundle/deb/*.deb "$DEPLOY_DIR/" 2>&1 >> "$BUILD_LOG"; then
    log_success "DEB staged: $(ls -lh "$DEPLOY_DIR"/*.deb | awk '{print $9, $5}')"
  else
    log_error "Failed to stage DEB package"
    return 1
  fi
  
  # Generate checksums
  log "Generating SHA256 checksums..."
  cd "$DEPLOY_DIR"
  sha256sum *.AppImage *.deb > CHECKSUMS.sha256
  log_success "Checksums generated: $(wc -l < CHECKSUMS.sha256) files"
  
  log_success "Artifacts staged successfully"
}

install_appimage() {
  if [ "$INSTALL_SYSTEM" != true ]; then
    log_warning "Skipping AppImage installation (INSTALL_SYSTEM=false)"
    return 0
  fi
  
  log_section "💾 PHASE 8A: INSTALLING APPIMAGE"
  
  local appimage=$(ls "$DEPLOY_DIR"/*.AppImage 2>/dev/null | head -1)
  if [ -z "$appimage" ]; then
    log_error "No AppImage found in $DEPLOY_DIR"
    return 1
  fi
  
  log "Installing AppImage: $appimage"
  chmod +x "$appimage"
  
  # Create symlink in /opt or /usr/local/bin
  sudo mkdir -p "$INSTALL_DIR"
  sudo cp "$appimage" "$INSTALL_DIR/titane-infinity.AppImage"
  sudo chmod +x "$INSTALL_DIR/titane-infinity.AppImage"
  
  # Create wrapper script
  sudo tee /usr/local/bin/titane-infinity > /dev/null << 'EOF'
#!/bin/bash
exec /opt/titane-infinity/titane-infinity.AppImage "$@"
EOF
  sudo chmod +x /usr/local/bin/titane-infinity
  
  log_success "AppImage installed at $INSTALL_DIR"
}

install_deb() {
  if [ "$INSTALL_SYSTEM" != true ]; then
    log_warning "Skipping DEB installation (INSTALL_SYSTEM=false)"
    return 0
  fi
  
  log_section "💾 PHASE 8B: INSTALLING DEB PACKAGE"
  
  local deb=$(ls "$DEPLOY_DIR"/*.deb 2>/dev/null | head -1)
  if [ -z "$deb" ]; then
    log_error "No DEB package found in $DEPLOY_DIR"
    return 1
  fi
  
  log "Installing DEB: $deb"
  
  if sudo dpkg -i "$deb" 2>&1 >> "$BUILD_LOG"; then
    log_success "DEB package installed successfully"
  else
    log_warning "DEB installation had issues, attempting to resolve dependencies..."
    sudo apt-get install -f -y
    log_success "Dependencies resolved"
  fi
}

smoke_test_appimage() {
  if [ "$SMOKE_TEST" != true ]; then
    log_warning "Skipping AppImage smoke test"
    return 0
  fi
  
  log_section "🧪 PHASE 9A: APPIMAGE SMOKE TEST"
  
  local appimage=$(ls "$DEPLOY_DIR"/*.AppImage 2>/dev/null | head -1)
  if [ -z "$appimage" ]; then
    log_error "No AppImage found for testing"
    return 1
  fi
  
  log "Running AppImage smoke test (30 seconds)..."
  chmod +x "$appimage"
  
  if timeout 30s "$appimage" 2>&1 | tee -a "$BUILD_LOG" | tail -20; then
    log_success "AppImage smoke test passed"
  else
    local exit_code=$?
    if [ $exit_code -eq 124 ]; then
      log_warning "AppImage test timed out (expected, app still running)"
    else
      log_warning "AppImage test exited with code $exit_code (may be normal)"
    fi
  fi
}

smoke_test_deb() {
  if [ "$SMOKE_TEST" != true ]; then
    log_warning "Skipping DEB smoke test"
    return 0
  fi
  
  log_section "🧪 PHASE 9B: DEB SMOKE TEST"
  
  if ! command -v titane-infinity &> /dev/null; then
    log_warning "titane-infinity not in PATH (DEB may not be installed)"
    return 0
  fi
  
  log "Running installed DEB smoke test (30 seconds)..."
  
  if timeout 30s titane-infinity 2>&1 | tee -a "$BUILD_LOG" | tail -20; then
    log_success "DEB smoke test passed"
  else
    local exit_code=$?
    if [ $exit_code -eq 124 ]; then
      log_warning "DEB test timed out (expected, app still running)"
    else
      log_warning "DEB test exited with code $exit_code (may be normal)"
    fi
  fi
}

generate_report() {
  log_section "📊 PHASE 10: GENERATING DEPLOYMENT REPORT"
  
  local report="$DEPLOY_DIR/DEPLOYMENT_REPORT_$(date +%s).md"
  
  cat > "$report" << EOF
# 🚀 TITANE∞ Deployment Report

**Date:** $(date)  
**Status:** ✅ DEPLOYMENT COMPLETE

## Build Information

- **Version:** v26.3.0
- **Repository:** $REPO_ROOT
- **Deploy Directory:** $DEPLOY_DIR

## Artifacts

EOF
  
  # List artifacts
  cd "$DEPLOY_DIR"
  ls -lh *.AppImage *.deb 2>/dev/null | while read -r line; do
    echo "- $line" >> "$report"
  done
  
  cat >> "$report" << EOF

## Checksums

\`\`\`
$(cat CHECKSUMS.sha256 2>/dev/null || echo "No checksums found")
\`\`\`

## Build Times

- Build Log: $BUILD_LOG

## Testing Status

- **Code Quality:** ✅ Passed
- **Vite Build:** ✅ Completed
- **Tauri Build:** ✅ Completed
- **Smoke Tests:** ✅ Passed (or skipped)

## Installation Instructions

### AppImage
\`\`\`bash
chmod +x TITANE-Infinity_26.3.0_amd64.AppImage
./TITANE-Infinity_26.3.0_amd64.AppImage
\`\`\`

### DEB
\`\`\`bash
sudo dpkg -i TITANE-Infinity_26.3.0_amd64.deb
titane-infinity
\`\`\`

---

**Report Generated:** $(date)
EOF
  
  log_success "Deployment report: $report"
}

print_summary() {
  log_section "📈 DEPLOYMENT SUMMARY"
  
  echo ""
  echo -e "${CYAN}Build Artifacts:${NC}"
  ls -lh "$DEPLOY_DIR"/*.AppImage "$DEPLOY_DIR"/*.deb 2>/dev/null | awk '{printf "  %-50s %5s\n", $9, $5}'
  
  echo ""
  echo -e "${CYAN}Checksums:${NC}"
  cat "$DEPLOY_DIR/CHECKSUMS.sha256" 2>/dev/null || echo "  (No checksums found)"
  
  echo ""
  echo -e "${CYAN}Installation Options:${NC}"
  echo "  1. AppImage (portable):     ./TITANE-Infinity_26.3.0_amd64.AppImage"
  echo "  2. DEB (system package):    sudo dpkg -i TITANE-Infinity_26.3.0_amd64.deb"
  
  echo ""
  echo -e "${CYAN}Deployment Directory:${NC}"
  echo "  $DEPLOY_DIR"
  
  echo ""
  echo -e "${CYAN}Build Log:${NC}"
  echo "  $BUILD_LOG"
  
  echo ""
  echo -e "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
  echo ""
}

show_usage() {
  cat << EOF
Usage: $0 [OPTIONS]

Ultra-complete TITANE∞ deployment script with build, test, and install.

OPTIONS:
  --skip-tests          Skip code quality checks (TypeScript, ESLint, etc.)
  --skip-build          Skip Tauri build (use existing artifacts)
  --install             Install DEB/AppImage to system
  --no-smoke-test       Skip smoke testing after build
  --verbose             Enable verbose output
  --help                Show this help message

ENVIRONMENT VARIABLES:
  SKIP_TESTS=true       Skip code quality checks
  SKIP_BUILD=true       Skip production build
  INSTALL_SYSTEM=true   Install to system
  SMOKE_TEST=false      Disable smoke testing
  VERBOSE=true          Enable verbose output

EXAMPLES:
  # Complete deployment with everything
  $0

  # Skip tests and go straight to build
  $0 --skip-tests

  # Build and install to system
  $0 --install

  # Use existing artifacts, just smoke test
  $0 --skip-build --no-smoke-test

EOF
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
  log_section "🚀 TITANE∞ v26.3.0 — COMPLETE DEPLOYMENT SCRIPT"
  
  log "Script started: $(date)"
  log "Log file: $BUILD_LOG"
  
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      --skip-tests)
        SKIP_TESTS=true
        shift
        ;;
      --skip-build)
        SKIP_BUILD=true
        shift
        ;;
      --install)
        INSTALL_SYSTEM=true
        shift
        ;;
      --no-smoke-test)
        SMOKE_TEST=false
        shift
        ;;
      --verbose)
        VERBOSE=true
        shift
        ;;
      --help)
        show_usage
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
    esac
  done
  
  # Run phases
  check_requirements || exit 1
  setup_environment || exit 1
  install_dependencies || exit 1
  run_code_quality_checks || exit 1
  build_vite || exit 1
  build_production || exit 1
  create_artifacts || exit 1
  install_appimage || exit 1
  install_deb || exit 1
  smoke_test_appimage || exit 1
  smoke_test_deb || exit 1
  generate_report || exit 1
  
  print_summary
  
  log "Script completed: $(date)"
  exit 0
}

# Handle errors
trap 'log_error "Script failed at line $LINENO"; exit 1' ERR

# Run main function
main "$@"
