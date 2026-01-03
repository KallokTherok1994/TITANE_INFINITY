#!/bin/bash
# TITANE∞ HTTP Server Full Deployment Script
# Déploiement complet avec configuration réseau, host, port et tunnel
# Version: 1.0.0 - 2026-01-02

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Obtenir l'IP locale
LOCAL_IP=$(hostname -I | awk '{print $1}')
DEV_PORT=5173
BUILD_DIR="$ROOT_DIR/dist"

# Configuration serveur
SERVER_HOST="0.0.0.0"  # Écoute sur toutes les interfaces
SERVER_PORT=${PORT:-5173}  # Port par défaut 5173, modifiable via env var

echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          TITANE∞ HTTP SERVER FULL DEPLOYMENT v1.0              ║"
echo "║                Configuration Réseau Complète                     ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 1: Vérifications pré-déploiement
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[1/5] Vérifications pré-déploiement...${NC}"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

# Vérifier pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm non installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ pnpm: $(pnpm --version)${NC}"

# Vérifier package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json manquant${NC}"
    exit 1
fi
echo -e "${GREEN}✓ package.json trouvé${NC}"

# Vérifier vite.config.ts
if [ ! -f "vite.config.ts" ]; then
    echo -e "${RED}❌ vite.config.ts manquant${NC}"
    exit 1
fi
echo -e "${GREEN}✓ vite.config.ts trouvé${NC}"

echo ""
echo -e "${GREEN}✅ Vérifications réussies${NC}"
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
echo "   └─ Mode:          Development Server"
echo ""

# Vérifier si le port est disponible
if lsof -Pi :$SERVER_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $SERVER_PORT déjà utilisé${NC}"
    echo -e "${YELLOW}💡 Arrêt du processus existant...${NC}"
    lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi
echo -e "${GREEN}✓ Port $SERVER_PORT disponible${NC}"

# Créer répertoire logs si nécessaire
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
# ÉTAPE 4: Démarrage du serveur de développement
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[4/5] Démarrage du serveur HTTP...${NC}"
echo ""

# Créer un fichier de configuration temporaire pour Vite
cat > "$ROOT_DIR/.env.deploy" << EOF
# TITANE∞ HTTP Server Deployment Configuration
VITE_DEV_SERVER_HOST=$SERVER_HOST
VITE_DEV_SERVER_PORT=$SERVER_PORT
VITE_DEV_SERVER_OPEN=false
EOF

echo -e "${BLUE}📦 Mode: Serveur de développement Vite${NC}"
echo ""
echo -e "${GREEN}🚀 Démarrage du serveur...${NC}"
echo ""

# Afficher les URLs d'accès
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

# Vérifier si cloudflared est disponible pour le tunneling
if command -v cloudflared &> /dev/null; then
    echo -e "   ${GREEN}Internet (Tunnel):${NC}"
    echo -e "   └─ Disponible (voir section Tunnel ci-dessous)"
    echo ""
fi

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Démarrer le serveur en arrière-plan
LOG_FILE="$ROOT_DIR/logs/network/http-server-$(date +%Y%m%d-%H%M%S).log"
echo -e "${BLUE}📋 Logs: $LOG_FILE${NC}"
echo ""

# Démarrer Vite avec configuration réseau
HOST=$SERVER_HOST PORT=$SERVER_PORT pnpm run dev:tauri > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# Attendre que le serveur démarre
echo -e "${YELLOW}⏳ Attente du démarrage du serveur...${NC}"
sleep 5

# Vérifier si le serveur est bien démarré
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:$SERVER_PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Serveur HTTP démarré avec succès (PID: $SERVER_PID)${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ Échec du démarrage du serveur${NC}"
        echo -e "${YELLOW}📋 Logs:${NC}"
        tail -n 20 "$LOG_FILE"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

echo ""

# ═══════════════════════════════════════════════════════════════════
# ÉTAPE 5: Configuration du tunnel (optionnel)
# ═══════════════════════════════════════════════════════════════════

echo -e "${CYAN}[5/5] Configuration du tunnel Internet (optionnel)...${NC}"
echo ""

if command -v cloudflared &> /dev/null; then
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
        
        echo -e "${YELLOW}⏳ Initialisation du tunnel...${NC}"
        sleep 5
        
        # Extraire l'URL du tunnel
        TUNNEL_URL=$(grep -oP 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | head -1)
        
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
            
            # Sauvegarder les PIDs
            echo "$SERVER_PID" > "$ROOT_DIR/.server.pid"
            echo "$TUNNEL_PID" > "$ROOT_DIR/.tunnel.pid"
        else
            echo -e "${RED}❌ Impossible d'extraire l'URL du tunnel${NC}"
            echo -e "${YELLOW}📋 Vérifiez les logs: $TUNNEL_LOG${NC}"
        fi
    else
        echo -e "${YELLOW}⊘ Tunnel Internet non activé${NC}"
        echo "$SERVER_PID" > "$ROOT_DIR/.server.pid"
    fi
else
    echo -e "${YELLOW}⚠️  cloudflared non installé${NC}"
    echo -e "${BLUE}💡 Installation:${NC}"
    echo "   Ubuntu/Debian: sudo apt install cloudflared"
    echo "   Arch Linux:    sudo pacman -S cloudflared"
    echo "   macOS:         brew install cloudflare/cloudflare/cloudflared"
    echo ""
    echo "$SERVER_PID" > "$ROOT_DIR/.server.pid"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║               DÉPLOIEMENT HTTP TERMINÉ AVEC SUCCÈS              ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${CYAN}📊 Résumé de la configuration:${NC}"
echo ""
echo -e "   ${GREEN}Serveur HTTP:${NC}"
echo "   ├─ Status:    ✅ Actif"
echo "   ├─ PID:       $SERVER_PID"
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

echo -e "${CYAN}🛠️  Commandes utiles:${NC}"
echo ""
echo -e "   ${YELLOW}Arrêter le serveur:${NC}"
echo "   $ kill $SERVER_PID"
if [ ! -z "$TUNNEL_PID" ]; then
    echo "   $ kill $TUNNEL_PID  # Tunnel"
fi
echo ""
echo -e "   ${YELLOW}Voir les logs en temps réel:${NC}"
echo "   $ tail -f $LOG_FILE"
if [ ! -z "$TUNNEL_LOG" ]; then
    echo "   $ tail -f $TUNNEL_LOG  # Tunnel"
fi
echo ""
echo -e "   ${YELLOW}Vérifier le statut:${NC}"
echo "   $ curl -I http://localhost:$SERVER_PORT"
echo ""
echo -e "   ${YELLOW}Script d'arrêt:${NC}"
echo "   $ bash ./stop-http-server.sh"
echo ""

echo -e "${GREEN}✅ Le serveur HTTP est maintenant accessible sur le réseau!${NC}"
echo ""
echo -e "${BLUE}💡 Appuyez sur Ctrl+C pour arrêter ce script (le serveur continuera en arrière-plan)${NC}"
echo ""

# Attendre que l'utilisateur arrête le script
trap "echo '' && echo -e '${YELLOW}Script arrêté. Le serveur continue en arrière-plan.${NC}' && echo -e '${BLUE}PID Serveur: $SERVER_PID${NC}' && exit 0" INT TERM

# Afficher les logs en temps réel
echo -e "${CYAN}📋 Logs en temps réel (Ctrl+C pour arrêter):${NC}"
echo ""
tail -f "$LOG_FILE"
