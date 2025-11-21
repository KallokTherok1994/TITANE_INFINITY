#!/usr/bin/env bash
set -e

# ═══════════════════════════════════════════════════════════
#   TITANE∞ v15.5 — Port Killer Script
# ═══════════════════════════════════════════════════════════

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🔧 TITANE∞ — Port Cleanup Script${NC}"
echo ""

PORTS=(5173 5174 1420 3000)

for PORT in "${PORTS[@]}"; do
    echo -e "${BLUE}[Port $PORT]${NC}"
    
    # Méthode 1 : pkill
    if pkill -9 -f ".*:$PORT" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} Processus tué via pkill"
    fi
    
    # Méthode 2 : Node process grep
    NODE_PIDS=$(ps aux | grep -E "node.*$PORT|vite.*$PORT" | grep -v grep | awk '{print $2}')
    if [ -n "$NODE_PIDS" ]; then
        echo "  → PID détectés: $NODE_PIDS"
        kill -9 $NODE_PIDS 2>/dev/null && echo -e "  ${GREEN}✓${NC} Tués"
    fi
    
    # Méthode 3 : Via système hôte (Flatpak)
    if command -v flatpak-spawn >/dev/null 2>&1; then
        flatpak-spawn --host bash -c "fuser -k ${PORT}/tcp 2>/dev/null" && \
            echo -e "  ${GREEN}✓${NC} Tué via système hôte"
    fi
    
    echo ""
done

echo -e "${GREEN}✅ Nettoyage terminé${NC}"
echo ""
echo "Relancez : npm run dev"
echo ""
