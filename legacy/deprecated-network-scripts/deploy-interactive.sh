#!/bin/bash

################################################################################
# 🚀 TITANE∞ v26.3.0 — INTERACTIVE DEPLOYMENT MENU
################################################################################

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="$REPO_ROOT/scripts"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear_screen() {
  clear
}

print_header() {
  clear_screen
  cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🚀 TITANE∞ v26.3.0 — INTERACTIVE DEPLOYMENT SYSTEM       ║
║                                                              ║
║    Complete Build • Test • Deploy • Install                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
}

print_menu() {
  cat << EOF

${CYAN}DEPLOYMENT OPTIONS:${NC}

  ${GREEN}1)${NC} Complete Deployment (Full Pipeline)
     • Install dependencies
     • Run quality checks
     • Build production
     • Create artifacts
     • Generate reports

  ${GREEN}2)${NC} Build Only (Fast)
     • Skip tests
     • Build Tauri
     • Stage artifacts

  ${GREEN}3)${NC} Build + Install (System)
     • Build production
     • Install DEB package
     • Create desktop entry

  ${GREEN}4)${NC} Test & Validate
     • Run TypeScript check
     • Run ESLint
     • Run Cargo check
     • No build

  ${GREEN}5)${NC} Smoke Test Only
     • Test AppImage (30s)
     • Test DEB binary (30s)
     • No rebuild

  ${GREEN}6)${NC} View Deployment Report
     • Show build metrics
     • List artifacts
     • Display checksums

  ${GREEN}7)${NC} Clean Build
     • Remove build artifacts
     • Clean node_modules
     • Start fresh

  ${GREEN}8)${NC} Advanced Options
     • Custom configuration
     • Manual commands
     • Debugging

  ${RED}0)${NC} Exit

${CYAN}Enter your choice (0-8):${NC} 
EOF
}

show_status() {
  echo -e "\n${CYAN}═══════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}Current Status:${NC}"
  echo -e "  Repository: $REPO_ROOT"
  echo -e "  Node: $(node -v)"
  echo -e "  Rust: $(rustc -V)"
  echo -e "  pnpm: $(pnpm -v)"
  
  if [ -d "$REPO_ROOT/deployment/v26.3.0" ]; then
    local artifact_count=$(ls -1 "$REPO_ROOT/deployment/v26.3.0"/*.{AppImage,deb} 2>/dev/null | wc -l)
    echo -e "  Artifacts: ${GREEN}$artifact_count${NC} ready"
  fi
  
  echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}\n"
}

option_complete_deployment() {
  print_header
  show_status
  
  echo -e "${YELLOW}Running Complete Deployment...${NC}\n"
  
  if [ -f "$SCRIPT_DIR/deploy-complete.sh" ]; then
    "$SCRIPT_DIR/deploy-complete.sh"
  else
    echo -e "${RED}Error: deploy-complete.sh not found${NC}"
  fi
  
  read -p "Press Enter to continue..."
}

option_build_only() {
  print_header
  show_status
  
  echo -e "${YELLOW}Running Build Only (Fast Mode)...${NC}\n"
  
  if [ -f "$SCRIPT_DIR/deploy-complete.sh" ]; then
    SKIP_TESTS=true "$SCRIPT_DIR/deploy-complete.sh"
  else
    echo -e "${RED}Error: deploy-complete.sh not found${NC}"
  fi
  
  read -p "Press Enter to continue..."
}

option_build_install() {
  print_header
  show_status
  
  echo -e "${YELLOW}Running Build + Install...${NC}\n"
  echo -e "${RED}⚠️  This will install DEB package system-wide.${NC}"
  read -p "Continue? (y/N): " -n 1 -r
  echo
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "$SCRIPT_DIR/deploy-complete.sh" ]; then
      INSTALL_SYSTEM=true "$SCRIPT_DIR/deploy-complete.sh"
    fi
  fi
  
  read -p "Press Enter to continue..."
}

option_test_validate() {
  print_header
  show_status
  
  echo -e "${YELLOW}Running Tests & Validation...${NC}\n"
  
  cd "$REPO_ROOT"
  
  echo -e "${CYAN}▶️  TypeScript Check...${NC}"
  npx tsc --noEmit --skipLibCheck 2>&1 | tail -5
  
  echo -e "\n${CYAN}▶️  ESLint Check...${NC}"
  pnpm exec eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0 2>&1 | tail -5
  
  echo -e "\n${CYAN}▶️  Cargo Check...${NC}"
  cargo check --manifest-path src-tauri/Cargo.toml 2>&1 | tail -5
  
  echo -e "\n${GREEN}✅ All tests completed${NC}"
  
  read -p "Press Enter to continue..."
}

option_smoke_test() {
  print_header
  show_status
  
  echo -e "${YELLOW}Running Smoke Tests...${NC}\n"
  
  cd "$REPO_ROOT/deployment/v26.3.0"
  
  local appimage=$(ls *.AppImage 2>/dev/null | head -1)
  if [ -n "$appimage" ]; then
    echo -e "${CYAN}▶️  Testing AppImage (30 seconds)...${NC}"
    chmod +x "$appimage"
    timeout 30s "./$appimage" 2>&1 | tail -10 || true
    echo -e "${GREEN}✅ AppImage test completed${NC}"
  fi
  
  echo ""
  
  if command -v titane-infinity &> /dev/null; then
    echo -e "${CYAN}▶️  Testing installed binary (30 seconds)...${NC}"
    timeout 30s titane-infinity 2>&1 | tail -10 || true
    echo -e "${GREEN}✅ Binary test completed${NC}"
  fi
  
  read -p "Press Enter to continue..."
}

option_view_report() {
  print_header
  
  local report=$(ls -t "$REPO_ROOT/deployment/v26.3.0"/DEPLOYMENT_REPORT_*.md 2>/dev/null | head -1)
  
  if [ -z "$report" ]; then
    echo -e "${YELLOW}No deployment report found. Run a deployment first.${NC}"
  else
    echo -e "${CYAN}Latest Deployment Report:${NC}\n"
    cat "$report"
  fi
  
  read -p "Press Enter to continue..."
}

option_clean_build() {
  print_header
  show_status
  
  echo -e "${RED}WARNING: This will remove all build artifacts and node_modules.${NC}"
  read -p "Continue? (y/N): " -n 1 -r
  echo
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$REPO_ROOT"
    
    echo -e "${YELLOW}Cleaning...${NC}"
    
    echo "  • Removing node_modules..."
    rm -rf node_modules
    
    echo "  • Removing build cache..."
    rm -rf src-tauri/target
    
    echo "  • Removing dist..."
    rm -rf dist
    
    echo -e "${GREEN}✅ Clean complete${NC}"
  fi
  
  read -p "Press Enter to continue..."
}

option_advanced() {
  clear_screen
  cat << EOF

${CYAN}ADVANCED OPTIONS:${NC}

  ${GREEN}1)${NC} Run Python Orchestrator
  ${GREEN}2)${NC} View Build Log
  ${GREEN}3)${NC} Check Artifacts
  ${GREEN}4)${NC} Verify Checksums
  ${GREEN}5)${NC} Back to Main Menu

Choose option: 
EOF
  
  read choice
  
  case $choice in
    1)
      if [ -f "$SCRIPT_DIR/deploy-orchestrator.py" ]; then
        python3 "$SCRIPT_DIR/deploy-orchestrator.py" --verbose
      fi
      ;;
    2)
      if [ -f "/tmp/titane_deploy.log" ]; then
        less /tmp/titane_deploy.log
      else
        echo "No log file found"
      fi
      ;;
    3)
      echo "Artifacts:"
      ls -lh "$REPO_ROOT/deployment/v26.3.0"/*.{AppImage,deb} 2>/dev/null || echo "No artifacts found"
      ;;
    4)
      if [ -f "$REPO_ROOT/deployment/v26.3.0/CHECKSUMS.sha256" ]; then
        cd "$REPO_ROOT/deployment/v26.3.0"
        sha256sum -c CHECKSUMS.sha256
      else
        echo "No checksums file found"
      fi
      ;;
    5)
      return
      ;;
  esac
  
  read -p "Press Enter to continue..."
}

main_loop() {
  while true; do
    print_header
    show_status
    print_menu
    
    read -r choice
    
    case $choice in
      1)
        option_complete_deployment
        ;;
      2)
        option_build_only
        ;;
      3)
        option_build_install
        ;;
      4)
        option_test_validate
        ;;
      5)
        option_smoke_test
        ;;
      6)
        option_view_report
        ;;
      7)
        option_clean_build
        ;;
      8)
        option_advanced
        ;;
      0)
        echo -e "\n${GREEN}Goodbye! 👋${NC}\n"
        exit 0
        ;;
      *)
        echo -e "${RED}Invalid option. Please try again.${NC}"
        sleep 2
        ;;
    esac
  done
}

# Main execution
main_loop
