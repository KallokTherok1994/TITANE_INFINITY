#!/bin/bash
# TITANE INFINITY v26.1 - Full Server Deployment Script
# Déploie application + configure Nginx + setup admin access

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   TITANE∞ v26.1 - Full Server Deployment              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ========================================
# CONFIGURATION (MODIFIER ICI)
# ========================================

# Serveur SSH
SERVER_USER="root"  # ou votre user SSH
SERVER_HOST="votre-serveur.com"  # IP ou domaine
SERVER_PORT="22"

# Domaine production
DOMAIN="titane-infinity.com"  # MODIFIER

# Paths serveur
DEPLOY_PATH="/var/www/html/titane-infinity"
NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# ========================================
# VÉRIFICATIONS PRE-DEPLOY
# ========================================

echo -e "${YELLOW}[1/8] Vérifications locales...${NC}"

# Check dist/ existe
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist/ manquant. Exécutez: npm run build${NC}"
    exit 1
fi

# Check Service Worker
if [ ! -f "dist/sw.js" ]; then
    echo -e "${RED}❌ dist/sw.js manquant (Service Worker)${NC}"
    exit 1
fi

# Check manifest PWA
if [ ! -f "dist/manifest.json" ]; then
    echo -e "${RED}❌ dist/manifest.json manquant (PWA)${NC}"
    exit 1
fi

# Count .br files (Brotli)
BR_COUNT=$(find dist -name "*.br" | wc -l)
if [ "$BR_COUNT" -lt 50 ]; then
    echo -e "${YELLOW}⚠ Seulement $BR_COUNT fichiers Brotli (attendu: 52+)${NC}"
fi

echo -e "${GREEN}✓ Build local valide${NC}"
echo -e "  • dist/ size: $(du -sh dist | awk '{print $1}')"
echo -e "  • Service Worker: ✓"
echo -e "  • PWA Manifest: ✓"
echo -e "  • Brotli files: $BR_COUNT"

echo ""
echo -e "${YELLOW}[2/8] Test connexion serveur...${NC}"

# Test SSH
if ! ssh -p "$SERVER_PORT" -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "exit" 2>/dev/null; then
    echo -e "${RED}❌ Connexion SSH échouée${NC}"
    echo "Vérifiez: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST"
    exit 1
fi

echo -e "${GREEN}✓ Connexion SSH: OK${NC}"

# ========================================
# BACKUP EXISTANT (si applicable)
# ========================================

echo ""
echo -e "${YELLOW}[3/8] Backup version existante...${NC}"

ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
if [ -d /var/www/html/titane-infinity ]; then
    BACKUP_DIR="/var/www/backups/titane-$(date +%Y%m%d_%H%M%S)"
    mkdir -p /var/www/backups
    cp -r /var/www/html/titane-infinity "$BACKUP_DIR"
    echo "✓ Backup créé: $BACKUP_DIR"
else
    echo "ℹ Première installation (pas de backup)"
fi
ENDSSH

# ========================================
# UPLOAD APPLICATION
# ========================================

echo ""
echo -e "${YELLOW}[4/8] Upload application vers serveur...${NC}"

# Create deployment directory
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "mkdir -p $DEPLOY_PATH"

# Rsync dist/ avec compression
rsync -avz --delete \
    -e "ssh -p $SERVER_PORT" \
    --progress \
    dist/ \
    "$SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/"

echo -e "${GREEN}✓ Upload terminé${NC}"

# ========================================
# CONFIGURATION NGINX
# ========================================

echo ""
echo -e "${YELLOW}[5/8] Installation configuration Nginx...${NC}"

# Upload nginx config
scp -P "$SERVER_PORT" \
    deployment/nginx/titane-infinity.conf \
    "$SERVER_USER@$SERVER_HOST:/tmp/titane-infinity.conf"

# Install config
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" << ENDSSH
# Modifier domain dans config
sed -i "s/titane-infinity.local/$DOMAIN/g" /tmp/titane-infinity.conf

# Move to sites-available
mv /tmp/titane-infinity.conf $NGINX_SITES/titane-infinity

# Enable site
ln -sf $NGINX_SITES/titane-infinity $NGINX_ENABLED/titane-infinity

# Test config
if nginx -t 2>&1 | grep -q "successful"; then
    echo "✓ Nginx config valide"
else
    echo "❌ Erreur config Nginx"
    exit 1
fi
ENDSSH

echo -e "${GREEN}✓ Nginx configuré${NC}"

# ========================================
# ADMIN ACCESS SETUP
# ========================================

echo ""
echo -e "${YELLOW}[6/8] Setup admin access...${NC}"

# Upload admin setup script
scp -P "$SERVER_PORT" \
    deployment/setup-admin-access.sh \
    "$SERVER_USER@$SERVER_HOST:/tmp/setup-admin-access.sh"

# Run admin setup
ssh -p "$SERVER_PORT" -t "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
chmod +x /tmp/setup-admin-access.sh
/tmp/setup-admin-access.sh
rm /tmp/setup-admin-access.sh
ENDSSH

# ========================================
# SSL SETUP (Let's Encrypt)
# ========================================

echo ""
echo -e "${YELLOW}[7/8] SSL Setup (Let's Encrypt)...${NC}"

ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" << ENDSSH
# Check certbot installed
if ! command -v certbot &> /dev/null; then
    echo "Installation Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Generate SSL cert
echo "Génération certificat SSL pour $DOMAIN..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || {
    echo "⚠ Certbot échoué (normal si domaine pas encore configuré)"
    echo "Exécutez manuellement après DNS: sudo certbot --nginx -d $DOMAIN"
}
ENDSSH

# ========================================
# RESTART NGINX
# ========================================

echo ""
echo -e "${YELLOW}[8/8] Restart Nginx...${NC}"

ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
systemctl restart nginx
systemctl status nginx --no-pager | head -10
ENDSSH

echo -e "${GREEN}✓ Nginx redémarré${NC}"

# ========================================
# POST-DEPLOY VALIDATION
# ========================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Deployment Complete - Post-Deploy Validation        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✅ TITANE∞ v26.1 déployé avec succès!${NC}"
echo ""
echo -e "${YELLOW}URLs:${NC}"
echo -e "  • Application: https://$DOMAIN"
echo -e "  • Admin:       https://$DOMAIN/admin (auth required)"
echo -e "  • Stats:       https://$DOMAIN/stats (auth required)"
echo -e "  • Health:      https://$DOMAIN/health"
echo ""

echo -e "${YELLOW}Tests recommandés:${NC}"
echo ""

echo -e "1. ${BLUE}Test Brotli compression:${NC}"
echo "   curl -I -H \"Accept-Encoding: br,gzip\" https://$DOMAIN/assets/ui-common-*.js"
echo "   Attendu: content-encoding: br"
echo ""

echo -e "2. ${BLUE}Test Service Worker:${NC}"
echo "   curl -I https://$DOMAIN/sw.js"
echo "   Attendu: cache-control: no-cache"
echo ""

echo -e "3. ${BLUE}Test PWA Manifest:${NC}"
echo "   curl https://$DOMAIN/manifest.json | jq ."
echo ""

echo -e "4. ${BLUE}Test Admin Access:${NC}"
echo "   curl -u admin:PASSWORD https://$DOMAIN/admin"
echo ""

echo -e "5. ${BLUE}Lighthouse Audit:${NC}"
echo "   corepack pnpm dlx lighthouse https://$DOMAIN --view"
echo "   Targets: Performance 95+, PWA 100, A11y 100"
echo ""

echo -e "${YELLOW}Monitoring 48h:${NC}"
echo "  • Logs: ssh $SERVER_USER@$SERVER_HOST 'tail -f /var/log/nginx/titane-*.log'"
echo "  • Erreurs: 0 attendu"
echo "  • TTI: < 1.5s"
echo "  • Cache hit rate: > 80%"
echo ""

echo -e "${GREEN}🎉 Déploiement terminé avec succès!${NC}"
