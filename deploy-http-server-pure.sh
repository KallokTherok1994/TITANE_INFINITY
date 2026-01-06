#!/bin/bash
# TITANE∞ HTTP Server Pure - Sans Tauri (Serveur Web uniquement)
# Déploiement HTTP complet avec configuration réseau, host, port et tunnel
# Version: 2.0.0 - 2026-01-02

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Obtenir l'IP locale
LOCAL_IP=$(hostname -I | awk '{print $1}')
SERVER_PORT=${PORT:-5173}
SERVER_HOST="0.0.0.0"

echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║        TITANE∞ HTTP SERVER PURE (Web Only) v2.0                ║"
echo "║              Configuration Réseau Complète                       ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 1: Vérifications
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[1/5] Vérifications pré-déploiement...${NC}"
echo ""

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm non installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ pnpm: $(pnpm --version)${NC}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json manquant${NC}"
    exit 1
fi
echo -e "${GREEN}✓ package.json trouvé${NC}"

echo ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 2: Configuration réseau
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[2/5] Configuration réseau...${NC}"
echo ""

echo -e "${BLUE}📍 Configuration détectée:${NC}"
echo "   ├─ IP Locale:     $LOCAL_IP"
echo "   ├─ Host:          $SERVER_HOST"
echo "   ├─ Port:          $SERVER_PORT"
echo "   └─ Mode:          Pure HTTP Server (Vite standalone)"
echo ""

# Vérifier si le port est disponible
if lsof -Pi :$SERVER_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $SERVER_PORT déjà utilisé${NC}"
    read -p "Arrêter le processus existant? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
        echo -e "${GREEN}✓ Port libéré${NC}"
    else
        echo -e "${RED}❌ Déploiement annulé${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Port $SERVER_PORT disponible${NC}"

mkdir -p "$ROOT_DIR/logs/network"
echo -e "${GREEN}✓ Répertoire logs créé${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 3: Installation des dépendances
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[3/5] Installation des dépendances...${NC}"
echo ""

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances npm...${NC}"
    pnpm install
    echo -e "${GREEN}✓ Dépendances installées${NC}"
else
    echo -e "${GREEN}✓ node_modules déjà présent${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 4: Démarrage du serveur HTTP (Vite pur, sans Tauri)
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[4/5] Démarrage du serveur HTTP...${NC}"
echo ""

LOG_FILE="$ROOT_DIR/logs/network/http-server-$(date +%Y%m%d-%H%M%S).log"

echo -e "${BLUE}📦 Mode: Serveur HTTP Vite standalone (sans Tauri)${NC}"
echo -e "${BLUE}📋 Logs: $LOG_FILE${NC}"
echo ""

# Démarrer Vite en mode standalone (pas de Tauri)
echo -e "${GREEN}🚀 Démarrage du serveur...${NC}"
echo ""

# Lancer Vite via pnpm (pnpm-only)
if command -v corepack >/dev/null 2>&1; then
HOST=$SERVER_HOST PORT=$SERVER_PORT corepack pnpm exec vite --port $SERVER_PORT --host $SERVER_HOST > "$LOG_FILE" 2>&1 &
else
HOST=$SERVER_HOST PORT=$SERVER_PORT pnpm exec vite --port $SERVER_PORT --host $SERVER_HOST > "$LOG_FILE" 2>&1 &
fi
SERVER_PID=$!

echo -e "${YELLOW}⏳ Attente du démarrage du serveur (PID: $SERVER_PID)...${NC}"
sleep 3

# Vérifier si le serveur démarre correctement
MAX_RETRIES=20
RETRY_COUNT=0
SERVER_STARTED=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$SERVER_PORT 2>/dev/null | grep -q "200"; then
        SERVER_STARTED=true
        break
    fi
    
    # Vérifier si le processus est toujours en cours
    if ! ps -p $SERVER_PID > /dev/null 2>&1; then
        echo -e "${RED}❌ Le serveur s'est arrêté de manière inattendue${NC}"
        echo -e "${YELLOW}📋 Dernières lignes des logs:${NC}"
        tail -20 "$LOG_FILE"
        exit 1
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 1
done

if [ "$SERVER_STARTED" = false ]; then
    echo -e "${YELLOW}⚠️  Le serveur démarre toujours...${NC}"
    echo -e "${YELLOW}📋 Vérifiez les logs: tail -f $LOG_FILE${NC}"
    echo ""
fi

# Sauvegarder le PID
echo "$SERVER_PID" > "$ROOT_DIR/.server.pid"

echo ""
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SERVEUR HTTP DÉMARRÉ${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📡 URLs d'accès:${NC}"
echo ""
echo -e "   ${GREEN}Local:${NC}"
echo -e "   ├─ http://localhost:$SERVER_PORT"
echo -e "   └─ http://127.0.0.1:$SERVER_PORT"
echo ""
echo -e "   ${GREEN}Réseau (LAN):${NC}"
echo -e "   └─ http://$LOCAL_IP:$SERVER_PORT"
echo ""

# Vérifier si cloudflared est disponible
TUNNEL_AVAILABLE=false
if command -v cloudflared &> /dev/null; then
    echo -e "   ${GREEN}Internet (Tunnel):${NC}"
    echo -e "   └─ Disponible via Cloudflare"
    TUNNEL_AVAILABLE=true
fi

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 5: Configuration du tunnel (optionnel)
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[5/5] Configuration du tunnel Internet (optionnel)...${NC}"
echo ""

TUNNEL_PID=""
TUNNEL_URL=""

if [ "$TUNNEL_AVAILABLE" = true ]; then
    echo -e "${GREEN}✓ cloudflared détecté${NC}"
    echo ""
    read -p "Activer le tunnel Internet Cloudflare? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}🌐 Démarrage du tunnel Cloudflare...${NC}"
        
        TUNNEL_LOG="$ROOT_DIR/logs/network/tunnel-$(date +%Y%m%d-%H%M%S).log"
        cloudflared tunnel --url http://localhost:$SERVER_PORT > "$TUNNEL_LOG" 2>&1 &
        TUNNEL_PID=$!
        
        echo -e "${YELLOW}⏳ Initialisation du tunnel (PID: $TUNNEL_PID)...${NC}"
        sleep 8
        
        # Extraire l'URL du tunnel
        TUNNEL_URL=$(grep -oP 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | head -1)
        
        if [ ! -z "$TUNNEL_URL" ]; then
            echo ""
            echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${GREEN}✅ TUNNEL INTERNET ACTIVÉ${NC}"
            echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo -e "${CYAN}🌐 URL Internet:${NC}"
            echo -e "   └─ $TUNNEL_URL"
            echo ""
            echo -e "${YELLOW}💡 Tunnel PID: $TUNNEL_PID${NC}"
            echo -e "${YELLOW}📋 Tunnel Logs: $TUNNEL_LOG${NC}"
            echo ""
            echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            
            echo "$TUNNEL_PID" > "$ROOT_DIR/.tunnel.pid"
        else
            echo -e "${RED}❌ Impossible d'extraire l'URL du tunnel${NC}"
            echo -e "${YELLOW}📋 Vérifiez les logs: $TUNNEL_LOG${NC}"
            echo ""
        fi
    else
        echo -e "${YELLOW}⊘ Tunnel Internet non activé${NC}"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  cloudflared non installé${NC}"
    echo -e "${BLUE}💡 Installation:${NC}"
    echo "   Ubuntu/Debian: sudo apt install cloudflared"
    echo "   Arch Linux:    sudo pacman -S cloudflared"
    echo "   macOS:         brew install cloudflare/cloudflare/cloudflared"
    echo ""
fi

# ═══════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║             DÉPLOIEMENT HTTP TERMINÉ AVEC SUCCÈS                ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${CYAN}📊 Résumé de la configuration:${NC}"
echo ""
echo -e "   ${GREEN}Serveur HTTP:${NC}"
echo "   ├─ Status:    ✅ Actif"
echo "   ├─ PID:       $SERVER_PID"
echo "   ├─ Type:      Vite (Pure HTTP)"
echo "   ├─ Host:      $SERVER_HOST"
echo "   ├─ Port:      $SERVER_PORT"
echo "   └─ Logs:      $LOG_FILE"
echo ""

echo -e "   ${GREEN}Accès:${NC}"
echo "   ├─ Local:     http://localhost:$SERVER_PORT"
echo "   ├─ LAN:       http://$LOCAL_IP:$SERVER_PORT"
if [ ! -z "$TUNNEL_URL" ]; then
    echo "   └─ Internet:  $TUNNEL_URL"
else
    echo "   └─ Internet:  Non configuré"
fi
echo ""

echo -e "${CYAN}🧪 Test de connectivité:${NC}"
echo ""

# Tester la connectivité locale
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$SERVER_PORT 2>/dev/null | grep -q "200"; then
    echo -e "   ${GREEN}✓ Local:  Accessible${NC}"
else
    echo -e "   ${YELLOW}⚠ Local:  En cours de démarrage...${NC}"
fi

# Tester la connectivité LAN
if timeout 2 curl -s -o /dev/null -w "%{http_code}" http://$LOCAL_IP:$SERVER_PORT 2>/dev/null | grep -q "200"; then
    echo -e "   ${GREEN}✓ LAN:    Accessible${NC}"
else
    echo -e "   ${YELLOW}⚠ LAN:    En cours de démarrage...${NC}"
fi

echo ""

echo -e "${CYAN}🛠️  Commandes utiles:${NC}"
echo ""
echo -e "   ${YELLOW}Arrêter le serveur:${NC}"
echo "   $ bash ./stop-http-server.sh"
echo ""
echo -e "   ${YELLOW}Voir les logs en temps réel:${NC}"
echo "   $ tail -f $LOG_FILE"
if [ ! -z "$TUNNEL_LOG" ]; then
    echo "   $ tail -f $TUNNEL_LOG  # Tunnel"
fi
echo ""
echo -e "   ${YELLOW}Vérifier le statut:${NC}"
echo "   $ curl -I http://localhost:$SERVER_PORT"
echo "   $ curl -I http://$LOCAL_IP:$SERVER_PORT"
echo ""
echo -e "   ${YELLOW}Relancer le serveur:${NC}"
echo "   $ bash ./deploy-http-server-pure.sh"
echo ""

echo -e "${GREEN}✅ Le serveur HTTP est maintenant accessible sur le réseau!${NC}"
echo ""
echo -e "${BLUE}💡 Le serveur fonctionne en arrière-plan${NC}"
echo -e "${BLUE}   PID Serveur: $SERVER_PID${NC}"
if [ ! -z "$TUNNEL_PID" ]; then
    echo -e "${BLUE}   PID Tunnel:  $TUNNEL_PID${NC}"
fi
echo ""
