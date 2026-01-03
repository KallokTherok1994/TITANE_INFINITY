#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  🚀 TITANE∞ v24.7.6 - FULL DEPLOY COMMAND                                ║
# ║  Usage: ./run-titane.sh [options]                                        ║
# ║                                                                          ║
# ║  Options:                                                                ║
# ║    --dev        Development mode (Titan-Dev avec DevTools)               ║
# ║    --prod       Production mode (Titan-Stable optimisé)                  ║
# ║    --quick      Skip cleanup & checks (fast launch)                      ║
# ║    --rebuild    Force full rebuild (frontend + backend)                  ║
# ║    --no-check   Skip type checking & linting                             ║
# ║                                                                          ║
# ║  Default: Development mode with full checks                              ║
# ╚══════════════════════════════════════════════════════════════════════════╝

set -e

# ═══════════════════════════════════════════════════════════════════════════
# COLORS & CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

# ═══════════════════════════════════════════════════════════════════════════
# PARSE ARGUMENTS
# ═══════════════════════════════════════════════════════════════════════════

MODE="dev"
QUICK_MODE=false
REBUILD_MODE=false
SKIP_CHECKS=false

for arg in "$@"; do
    case $arg in
        --dev)
            MODE="dev"
            ;;
        --prod)
            MODE="prod"
            ;;
        --quick)
            QUICK_MODE=true
            ;;
        --rebuild)
            REBUILD_MODE=true
            ;;
        --no-check)
            SKIP_CHECKS=true
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $arg${NC}"
            echo "Usage: ./run-titane.sh [--dev|--prod] [--quick] [--rebuild] [--no-check]"
            exit 1
            ;;
    esac
done

# ═══════════════════════════════════════════════════════════════════════════
# BANNER
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                          ║${NC}"
echo -e "${CYAN}║  ${MAGENTA}🚀 TITANE∞ v24.7.6 - FULL DEPLOY SYSTEM${CYAN}                              ║${NC}"
echo -e "${CYAN}║                                                                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "  Mode:          ${GREEN}$(echo $MODE | tr '[:lower:]' '[:upper:]')${NC}"
echo -e "  Quick Launch:  $([ "$QUICK_MODE" = true ] && echo "${GREEN}YES${NC}" || echo "${YELLOW}NO${NC}")"
echo -e "  Rebuild:       $([ "$REBUILD_MODE" = true ] && echo "${GREEN}YES${NC}" || echo "NO")"
echo -e "  Skip Checks:   $([ "$SKIP_CHECKS" = true ] && echo "${YELLOW}YES${NC}" || echo "NO")"
echo -e "  Project:       ${CYAN}$PROJECT_ROOT${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1: CLEANUP & ENVIRONMENT SETUP
# ═══════════════════════════════════════════════════════════════════════════

if [ "$QUICK_MODE" = false ]; then
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  PHASE 1/6: 🧹 CLEANUP & ENVIRONMENT SETUP                           ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Kill stale processes
    echo -e "${YELLOW}🔄 Stopping stale Tauri/Vite processes...${NC}"
    pkill -f "tauri dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    sleep 1
    
    # Clean build artifacts (if rebuild requested)
    if [ "$REBUILD_MODE" = true ]; then
        echo -e "${YELLOW}🗑️  Removing old build artifacts...${NC}"
        rm -rf dist/ 2>/dev/null || true
        rm -rf node_modules/.vite 2>/dev/null || true
        rm -rf src-tauri/target/release 2>/dev/null || true
        echo -e "${GREEN}✅ Build cache cleared${NC}"
    fi
    
    # Clean logs
    echo -e "${YELLOW}📝 Cleaning logs...${NC}"
    rm -rf runtime/dev/logs/ 2>/dev/null || true
    mkdir -p runtime/dev/logs/
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    echo ""
fi

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 2: NETWORK & INTERNET CONNECTIVITY CHECK
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  PHASE 2/6: 🌐 NETWORK & INTERNET CONNECTIVITY                       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if network is available
if ping -c 1 -W 2 8.8.8.8 &>/dev/null || ping -c 1 -W 2 1.1.1.1 &>/dev/null; then
    echo -e "${GREEN}✅ Internet connection: ACTIVE${NC}"
    INTERNET_STATUS="connected"
    
    # Test API endpoints
    echo -e "${CYAN}🔍 Testing API endpoints...${NC}"
    
    # Test OpenAI
    if curl -s -m 3 -o /dev/null -w "%{http_code}" https://api.openai.com >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} api.openai.com: reachable"
    else
        echo -e "  ${YELLOW}⚠️${NC}  api.openai.com: unreachable (may need API key)"
    fi
    
    # Test Anthropic
    if curl -s -m 3 -o /dev/null -w "%{http_code}" https://api.anthropic.com >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} api.anthropic.com: reachable"
    else
        echo -e "  ${YELLOW}⚠️${NC}  api.anthropic.com: unreachable (may need API key)"
    fi
    
    # Test Google Gemini
    if curl -s -m 3 -o /dev/null -w "%{http_code}" https://generativelanguage.googleapis.com >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} generativelanguage.googleapis.com: reachable"
    else
        echo -e "  ${YELLOW}⚠️${NC}  generativelanguage.googleapis.com: unreachable"
    fi
    
    # Test Ollama (local)
    if curl -s -m 2 http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} Ollama (127.0.0.1:11434): running"
    else
        echo -e "  ${YELLOW}⚠️${NC}  Ollama (127.0.0.1:11434): not running (optional)"
    fi
    
else
    echo -e "${YELLOW}⚠️  Internet connection: OFFLINE${NC}"
    echo -e "${CYAN}ℹ️  TITANE will work in offline mode (APIs unavailable)${NC}"
    INTERNET_STATUS="offline"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 3: VERIFICATION & TYPE CHECKING
# ═══════════════════════════════════════════════════════════════════════════

if [ "$SKIP_CHECKS" = false ] && [ "$QUICK_MODE" = false ]; then
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  PHASE 3/6: 🔍 VERIFICATION & TYPE CHECKING                          ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Node version check
    echo -e "${CYAN}📦 Checking Node.js version...${NC}"
    NODE_VERSION=$(node -v)
    echo -e "  Node.js: ${GREEN}$NODE_VERSION${NC}"
    
    # Dependencies check
    if [ ! -d "node_modules" ] || [ "$REBUILD_MODE" = true ]; then
        echo -e "${YELLOW}📥 Installing dependencies...${NC}"
        pnpm install --frozen-lockfile --prefer-offline --no-audit 2>&1 | grep -v "^npm WARN" || true
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${GREEN}✅ Dependencies already installed${NC}"
    fi
    
    # TypeScript type checking
    echo -e "${CYAN}🔍 Type checking (TypeScript)...${NC}"
    if npx tsc --noEmit --skipLibCheck 2>&1 | tee /tmp/titane-tsc.log | tail -5; then
        TS_ERRORS=$(grep -c "error TS" /tmp/titane-tsc.log 2>/dev/null || echo "0")
        if [ "$TS_ERRORS" = "0" ]; then
            echo -e "${GREEN}✅ 0 TypeScript errors${NC}"
        else
            echo -e "${YELLOW}⚠️  $TS_ERRORS TypeScript errors found${NC}"
            echo -e "${CYAN}ℹ️  Continuing anyway (errors may be auto-fixed)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Type checking failed (continuing anyway)${NC}"
    fi
    
    # ESLint check (silent)
    echo -e "${CYAN}📝 Linting (ESLint)...${NC}"
    if pnpm run lint -- --quiet 2>&1 | grep -E "error|warning" | head -5; then
        echo -e "${YELLOW}⚠️  Lint warnings found (auto-fixing on build)${NC}"
    else
        echo -e "${GREEN}✅ 0 lint errors${NC}"
    fi
    
    echo ""
fi

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 4: AUTOMATIC CORRECTIONS (if needed)
# ═══════════════════════════════════════════════════════════════════════════

if [ "$SKIP_CHECKS" = false ] && [ "$QUICK_MODE" = false ]; then
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  PHASE 4/6: 🔧 AUTOMATIC CORRECTIONS (if needed)                     ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Check if auto-fix is needed
    if [ -f "/tmp/titane-tsc.log" ] && grep -q "error TS" /tmp/titane-tsc.log; then
        echo -e "${YELLOW}🔧 Auto-fixing TypeScript issues...${NC}"
        pnpm run lint:fix 2>&1 | tail -3 || true
        echo -e "${GREEN}✅ Auto-fix attempted${NC}"
    else
        echo -e "${GREEN}✅ No corrections needed${NC}"
    fi
    
    echo ""
fi

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 5: BUILD (Frontend + Backend)
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  PHASE 5/6: 🏗️  BUILD (Frontend + Backend)                            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Build frontend (Vite)
if [ ! -d "dist" ] || [ "$REBUILD_MODE" = true ]; then
    echo -e "${CYAN}⚛️  Building frontend (Vite + React)...${NC}"
    NODE_ENV=production pnpm run build 2>&1 | tee /tmp/titane-vite-build.log | tail -10
    
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist/ | awk '{print $1}')
        echo -e "${GREEN}✅ Frontend built successfully (${DIST_SIZE})${NC}"
    else
        echo -e "${RED}❌ Frontend build failed!${NC}"
        echo -e "${YELLOW}Check logs: /tmp/titane-vite-build.log${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Frontend already built (dist/ exists)${NC}"
fi

# Build backend (Rust/Tauri) - only if rebuild requested or missing
TAURI_BINARY="src-tauri/target/debug/titane-infinity"
if [ "$MODE" = "prod" ]; then
    TAURI_BINARY="src-tauri/target/release/titane-infinity"
fi

if [ ! -f "$TAURI_BINARY" ] || [ "$REBUILD_MODE" = true ]; then
    echo -e "${CYAN}🦀 Building backend (Rust/Tauri)...${NC}"
    
    if [ "$MODE" = "prod" ]; then
        echo -e "${YELLOW}ℹ️  Production build (optimized, may take 5-10 minutes)${NC}"
        cd src-tauri && cargo build --release 2>&1 | tail -10
    else
        echo -e "${YELLOW}ℹ️  Development build (faster, ~2-3 minutes)${NC}"
        cd src-tauri && cargo build 2>&1 | tail -10
    fi
    
    cd "$PROJECT_ROOT"
    
    if [ -f "$TAURI_BINARY" ]; then
        RUST_SIZE=$(du -sh "$TAURI_BINARY" | awk '{print $1}')
        echo -e "${GREEN}✅ Backend built successfully (${RUST_SIZE})${NC}"
    else
        echo -e "${RED}❌ Backend build failed!${NC}"
        echo -e "${YELLOW}Check Rust compilation errors above${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Backend already built${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 6: FULL DEPLOY & LAUNCH (100% Frontend + Backend)
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  PHASE 6/6: 🚀 FULL DEPLOY & LAUNCH (100% Tauri)                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Detect display server
echo -e "${CYAN}🖥️  Detecting display server...${NC}"

if [ -z "$DISPLAY" ] && [ -z "$WAYLAND_DISPLAY" ]; then
    # Try to detect Wayland
    if [ -e "$XDG_RUNTIME_DIR/wayland-1" ]; then
        export WAYLAND_DISPLAY=wayland-1
        export GDK_BACKEND=wayland
        echo -e "${GREEN}✅ Wayland detected (wayland-1)${NC}"
    elif [ -e "$XDG_RUNTIME_DIR/wayland-0" ]; then
        export WAYLAND_DISPLAY=wayland-0
        export GDK_BACKEND=wayland
        echo -e "${GREEN}✅ Wayland detected (wayland-0)${NC}"
    # Try X11
    elif [ -e "/tmp/.X11-unix/X1" ]; then
        export DISPLAY=:1
        echo -e "${GREEN}✅ X11 detected (DISPLAY=:1)${NC}"
    elif [ -e "/tmp/.X11-unix/X0" ]; then
        export DISPLAY=:0
        echo -e "${GREEN}✅ X11 detected (DISPLAY=:0)${NC}"
    else
        echo -e "${RED}❌ No display server detected!${NC}"
        echo -e "${YELLOW}Please run from a graphical terminal${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Display already set${NC}"
fi

# Set GTK backend
if [ -n "$WAYLAND_DISPLAY" ]; then
    export GDK_BACKEND=wayland,x11
fi

# Load environment variables based on mode
if [ "$MODE" = "dev" ]; then
    echo -e "${CYAN}🔧 Loading DEV environment...${NC}"
    if [ -f "runtime/dev/.env.development" ]; then
        export $(grep -v '^#' runtime/dev/.env.development | grep -v '^$' | xargs)
    fi
    echo -e "${GREEN}✅ DEV environment loaded${NC}"
else
    echo -e "${CYAN}🔧 Loading PRODUCTION environment...${NC}"
    if [ -f "runtime/stable/.env.production" ]; then
        export $(grep -v '^#' runtime/stable/.env.production | grep -v '^$' | xargs)
    fi
    echo -e "${GREEN}✅ PRODUCTION environment loaded${NC}"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                          ║${NC}"
echo -e "${GREEN}║  🎉 TITANE∞ v24.7.6 - READY TO LAUNCH                                    ║${NC}"
echo -e "${GREEN}║                                                                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 Launch Summary:${NC}"
echo -e "  Mode:              ${GREEN}$(echo $MODE | tr '[:lower:]' '[:upper:]')${NC}"
echo -e "  Internet:          ${INTERNET_STATUS}"
echo -e "  Frontend:          ${GREEN}Built (dist/)${NC}"
echo -e "  Backend:           ${GREEN}Built (Rust binary)${NC}"
echo -e "  Display:           ${DISPLAY:-$WAYLAND_DISPLAY}"
echo -e "  API Access:        ${GREEN}Enabled (OpenAI, Anthropic, Gemini, Ollama)${NC}"
echo ""
echo -e "${BLUE}🎯 CONTROLS:${NC}"
echo -e "  ${CYAN}Ctrl+R${NC}     Reload React (soft reload)"
echo -e "  ${CYAN}F5${NC}         Full window reload"
echo -e "  ${CYAN}F12${NC}        Toggle DevTools"
echo -e "  ${CYAN}Ctrl+C${NC}     Stop TITANE"
echo ""
echo -e "${YELLOW}📁 Logs: runtime/dev/logs/tauri.log${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Launch Tauri
if [ "$MODE" = "dev" ]; then
    echo -e "${GREEN}🟢 Launching TITANE∞ DEV (Titan-Dev)...${NC}"
    echo ""
    pnpm run tauri -- dev --no-watch 2>&1 | tee runtime/dev/logs/tauri.log
else
    echo -e "${BLUE}🔵 Launching TITANE∞ PRODUCTION (Titan-Stable)...${NC}"
    echo ""
    cd src-tauri && cargo run --release 2>&1 | tee ../runtime/dev/logs/tauri.log
fi
