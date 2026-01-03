#!/bin/bash
# TITANE∞ HTTP Server Stop Script
# Arrêt propre du serveur HTTP et du tunnel
# Version: 1.0.0 - 2026-01-02

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║              TITANE∞ HTTP SERVER - ARRÊT                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Lire les PIDs
SERVER_PID=""
TUNNEL_PID=""

if [ -f ".server.pid" ]; then
    SERVER_PID=$(cat .server.pid)
fi

if [ -f ".tunnel.pid" ]; then
    TUNNEL_PID=$(cat .tunnel.pid)
fi

# Arrêter le serveur HTTP
if [ ! -z "$SERVER_PID" ]; then
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}🛑 Arrêt du serveur HTTP (PID: $SERVER_PID)...${NC}"
        kill $SERVER_PID 2>/dev/null || true
        sleep 2
        
        # Vérifier si le processus est bien arrêté
        if ps -p $SERVER_PID > /dev/null 2>&1; then
            echo -e "${RED}⚠️  Forçage de l'arrêt...${NC}"
            kill -9 $SERVER_PID 2>/dev/null || true
        fi
        
        echo -e "${GREEN}✓ Serveur HTTP arrêté${NC}"
        rm -f .server.pid
    else
        echo -e "${YELLOW}⚠️  Serveur HTTP déjà arrêté${NC}"
        rm -f .server.pid
    fi
else
    echo -e "${YELLOW}⚠️  Aucun PID de serveur trouvé${NC}"
fi

echo ""

# Arrêter le tunnel
if [ ! -z "$TUNNEL_PID" ]; then
    if ps -p $TUNNEL_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}🛑 Arrêt du tunnel Cloudflare (PID: $TUNNEL_PID)...${NC}"
        kill $TUNNEL_PID 2>/dev/null || true
        sleep 2
        
        # Vérifier si le processus est bien arrêté
        if ps -p $TUNNEL_PID > /dev/null 2>&1; then
            echo -e "${RED}⚠️  Forçage de l'arrêt...${NC}"
            kill -9 $TUNNEL_PID 2>/dev/null || true
        fi
        
        echo -e "${GREEN}✓ Tunnel arrêté${NC}"
        rm -f .tunnel.pid
    else
        echo -e "${YELLOW}⚠️  Tunnel déjà arrêté${NC}"
        rm -f .tunnel.pid
    fi
fi

echo ""

# Nettoyer les processus résiduels sur le port 5173
echo -e "${BLUE}🔍 Vérification des processus résiduels...${NC}"
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Processus résiduels détectés sur le port 5173${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✓ Processus résiduels nettoyés${NC}"
else
    echo -e "${GREEN}✓ Aucun processus résiduel${NC}"
fi

echo ""
echo -e "${GREEN}✅ Arrêt terminé${NC}"
echo ""
