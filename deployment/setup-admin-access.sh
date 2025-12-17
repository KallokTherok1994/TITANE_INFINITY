#!/bin/bash
# TITANE INFINITY v26.1 - Admin Access Setup
# Creates secure admin credentials for Nginx basic auth

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   TITANE∞ - Admin Access Setup                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Check if htpasswd available
if ! command -v htpasswd &> /dev/null; then
    echo -e "${YELLOW}⚠ htpasswd non trouvé. Installation...${NC}"
    sudo apt install apache2-utils -y
fi

HTPASSWD_FILE="/etc/nginx/.htpasswd-titane"

echo -e "${YELLOW}[1/4] Création fichier .htpasswd...${NC}"

# Demander username
read -p "Admin username (défaut: admin): " ADMIN_USER
ADMIN_USER=${ADMIN_USER:-admin}

# Demander password
echo ""
echo -e "${YELLOW}Entrez le mot de passe admin (caché):${NC}"
sudo htpasswd -c "$HTPASSWD_FILE" "$ADMIN_USER"

echo ""
echo -e "${GREEN}✓ Credentials créées: $HTPASSWD_FILE${NC}"

echo ""
echo -e "${YELLOW}[2/4] Permissions sécurisées...${NC}"
sudo chmod 640 "$HTPASSWD_FILE"
sudo chown root:www-data "$HTPASSWD_FILE"
echo -e "${GREEN}✓ Permissions: 640 (root:www-data)${NC}"

echo ""
echo -e "${YELLOW}[3/4] Test credentials...${NC}"
if sudo htpasswd -v "$HTPASSWD_FILE" "$ADMIN_USER" 2>&1 | grep -q "password verification"; then
    echo -e "${GREEN}✓ Credentials valides${NC}"
else
    echo -e "${RED}❌ Erreur validation credentials${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[4/4] Ajouter utilisateurs supplémentaires? (o/n)${NC}"
read -p "> " ADD_MORE

while [ "$ADD_MORE" = "o" ] || [ "$ADD_MORE" = "O" ]; do
    echo ""
    read -p "Nouveau username: " NEW_USER
    sudo htpasswd "$HTPASSWD_FILE" "$NEW_USER"
    echo ""
    read -p "Ajouter encore? (o/n): " ADD_MORE
done

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Admin Access Setup Complete                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  📝 Fichier: ${HTPASSWD_FILE}"
echo -e "  👤 Utilisateurs: $(sudo wc -l < $HTPASSWD_FILE)"
echo ""
echo -e "${YELLOW}Accès admin disponibles:${NC}"
echo -e "  • https://votre-domaine.com/admin (auth required)"
echo -e "  • https://votre-domaine.com/stats (auth required)"
echo -e "  • https://admin.votre-domaine.com (si subdomain configuré)"
echo ""
echo -e "${YELLOW}Test:${NC}"
echo -e "  curl -u $ADMIN_USER:PASSWORD https://votre-domaine.com/admin"
echo ""
echo -e "${GREEN}✅ Admin credentials prêtes!${NC}"
