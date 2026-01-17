#!/usr/bin/env bash
# TITANE∞ Before Dev Command Wrapper
# Handles port conflicts and provides clear logging for Tauri dev boot
# v26.3.0 - Robust dev server management

set -euo pipefail

# Configuration
PORT=5173
LOG_FILE="reports/tauri/before-dev.log"
MAX_WAIT=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    mkdir -p "$(dirname "$LOG_FILE")"
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $*" | tee -a "$LOG_FILE"
}

# Header
log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
log "${BLUE}🚀 TITANE∞ Before Dev Command Wrapper v26.3.0${NC}"
log "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Environment info
log "Node: $(node --version 2>/dev/null || echo 'N/A')"
log "NPM: $(npm --version 2>/dev/null || echo 'N/A')"
log "CWD: $(pwd)"
log "Port to check: $PORT"
log ""

# Function to check if port is in use
is_port_in_use() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -i :"$PORT" >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tulpn 2>/dev/null | grep ":$PORT " >/dev/null
    elif command -v ss >/dev/null 2>&1; then
        ss -tulpn 2>/dev/null | grep ":$PORT " >/dev/null
    else
        log "${RED}ERROR: No tool available to check port usage${NC}"
        return 1
    fi
}

# Function to kill processes on port
kill_port_processes() {
    local pids=""

    if command -v lsof >/dev/null 2>&1; then
        pids=$(lsof -ti :"$PORT" 2>/dev/null || true)
    elif command -v fuser >/dev/null 2>&1; then
        pids=$(fuser "$PORT/tcp" 2>/dev/null || true)
    fi

    if [ -n "$pids" ]; then
        log "${YELLOW}Found processes using port $PORT: $pids${NC}"
        for pid in $pids; do
            if ps -p "$pid" >/dev/null 2>&1; then
                local cmdline
                cmdline=$(ps -p "$pid" -o cmd= 2>/dev/null | head -1 || echo "unknown")
                log "Killing process $pid ($cmdline)"
                kill "$pid" 2>/dev/null || true
            fi
        done

        # Wait for processes to die
        local count=0
        while [ $count -lt $MAX_WAIT ] && is_port_in_use; do
            sleep 1
            ((count++))
        done

        if is_port_in_use; then
            log "${RED}ERROR: Port $PORT still in use after $MAX_WAIT seconds${NC}"
            return 1
        else
            log "${GREEN}✅ Port $PORT freed successfully${NC}"
        fi
    else
        log "${GREEN}✅ Port $PORT is already free${NC}"
    fi

    return 0
}

# Main logic
log "Checking port $PORT..."
if is_port_in_use; then
    log "${YELLOW}⚠️  Port $PORT is in use, attempting to free it...${NC}"
    if ! kill_port_processes; then
        log "${RED}❌ Failed to free port $PORT${NC}"
        exit 1
    fi
else
    log "${GREEN}✅ Port $PORT is free${NC}"
fi

log ""
log "${BLUE}Starting Vite dev server...${NC}"

# Execute the actual Vite command with proper environment
export PATH="/home/titane-os/.local/share/pnpm:/usr/local/bin:/usr/bin:$PATH"

# The original command from Tauri config - CORRECTED: PNPM-only
exec /home/titane-os/.local/share/pnpm/pnpm exec vite dev --host 127.0.0.1 --port "$PORT" --strictPort 2>&1 | tee -a "$LOG_FILE"
