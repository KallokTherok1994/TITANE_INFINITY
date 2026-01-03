#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ v26.2.1 - Configuration Sécurisée Gemini API
#   AES-256-GCM + Argon2id - Stockage Chiffré
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   TITANE∞ - Configuration Sécurisée API Gemini${NC}"
echo -e "${CYAN}   Chiffrement AES-256-GCM + Argon2id${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Vérifier si .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé. Création depuis .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
fi

# Vérifier TITANE_SECRETS_PASSPHRASE
if ! grep -q "^TITANE_SECRETS_PASSPHRASE=" .env || grep -q "^TITANE_SECRETS_PASSPHRASE=$" .env || grep -q "^TITANE_SECRETS_PASSPHRASE=change" .env; then
    echo -e "${YELLOW}⚠️  TITANE_SECRETS_PASSPHRASE non configuré${NC}"
    echo ""
    echo -e "${CYAN}La passphrase sert à chiffrer toutes les clés API avec AES-256-GCM + Argon2id${NC}"
    echo -e "${CYAN}Recommandations:${NC}"
    echo -e "  • Longueur minimale: 16 caractères"
    echo -e "  • Utiliser lettres, chiffres et symboles"
    echo -e "  • Ne jamais commiter cette valeur dans Git"
    echo ""
    
    read -sp "Entrer une passphrase sécurisée (min 16 chars): " PASSPHRASE
    echo ""
    
    if [ ${#PASSPHRASE} -lt 16 ]; then
        echo -e "${RED}❌ Erreur: La passphrase doit contenir au moins 16 caractères${NC}"
        exit 1
    fi
    
    # Remplacer dans .env
    if grep -q "^TITANE_SECRETS_PASSPHRASE=" .env; then
        sed -i "s|^TITANE_SECRETS_PASSPHRASE=.*|TITANE_SECRETS_PASSPHRASE=${PASSPHRASE}|" .env
    else
        echo "TITANE_SECRETS_PASSPHRASE=${PASSPHRASE}" >> .env
    fi
    
    echo -e "${GREEN}✅ Passphrase configurée${NC}"
else
    echo -e "${GREEN}✅ TITANE_SECRETS_PASSPHRASE déjà configuré${NC}"
fi

echo ""
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo -e "${CYAN}Configuration Gemini API Key${NC}"
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo ""
echo "La clé Gemini sera:"
echo "  1. Chiffrée avec AES-256-GCM (dérivation Argon2id)"
echo "  2. Stockée dans: ~/.local/share/titane-infinity/secrets.enc"
echo "  3. Jamais exposée en clair dans les logs ou le frontend"
echo ""
echo "Comment configurer:"
echo ""
echo "  A. Via Interface Governance Center:"
echo "     1. Lancer Titan-Dev: pnpm run dev"
echo "     2. Aller dans Governance Center → Onglet Secrets"
echo "     3. Entrer la clé Gemini dans le formulaire"
echo "     4. Cliquer 'Sauvegarder'"
echo ""
echo "  B. Via Console Dev (F12):"
echo "     1. Ouvrir console (F12)"
echo "     2. Exécuter:"
echo "        await invoke('chat_set_gemini_key', { apiKey: 'VOTRE_CLE' })"
echo ""
echo "  C. Via .env (migration automatique au démarrage):"
if grep -q "^GEMINI_API_KEY=" .env && ! grep -q "^GEMINI_API_KEY=$" .env; then
    echo -e "     ${GREEN}✅ GEMINI_API_KEY détecté dans .env${NC}"
    echo "     → Sera automatiquement migré vers le coffre chiffré au démarrage"
else
    echo "     1. Éditer .env:"
    echo "        nano .env"
    echo "     2. Ajouter:"
    echo "        GEMINI_API_KEY=votre_cle_ici"
    echo "     3. Au démarrage, la clé sera migrée vers le coffre chiffré"
fi

echo ""
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo -e "${CYAN}Vérification Configuration${NC}"
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo ""

# Vérifier .env
if grep -q "^TITANE_SECRETS_PASSPHRASE=.\+" .env; then
    PASS_LEN=$(grep "^TITANE_SECRETS_PASSPHRASE=" .env | cut -d= -f2 | wc -c)
    if [ "$PASS_LEN" -gt 16 ]; then
        echo -e "${GREEN}✅ TITANE_SECRETS_PASSPHRASE: Configuré (${PASS_LEN} caractères)${NC}"
    else
        echo -e "${YELLOW}⚠️  TITANE_SECRETS_PASSPHRASE: Trop court (${PASS_LEN} caractères)${NC}"
    fi
else
    echo -e "${RED}❌ TITANE_SECRETS_PASSPHRASE: Non configuré${NC}"
fi

if grep -q "^GEMINI_API_KEY=.\+" .env; then
    KEY_LEN=$(grep "^GEMINI_API_KEY=" .env | cut -d= -f2 | wc -c)
    if [ "$KEY_LEN" -gt 16 ]; then
        echo -e "${GREEN}✅ GEMINI_API_KEY: Présent (${KEY_LEN} caractères) - Sera migré${NC}"
    else
        echo -e "${YELLOW}⚠️  GEMINI_API_KEY: Semble invalide (${KEY_LEN} caractères)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GEMINI_API_KEY: Non configuré dans .env${NC}"
    echo "   (Peut être configuré via Governance Center après démarrage)"
fi

# Vérifier le fichier secrets chiffré
SECRETS_FILE="$HOME/.local/share/titane-infinity/secrets.enc"
if [ -f "$SECRETS_FILE" ]; then
    FILE_SIZE=$(stat -f%z "$SECRETS_FILE" 2>/dev/null || stat -c%s "$SECRETS_FILE" 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ Coffre chiffré: Présent (${FILE_SIZE} bytes)${NC}"
    echo "   → $SECRETS_FILE"
else
    echo -e "${YELLOW}⚠️  Coffre chiffré: Sera créé au premier démarrage${NC}"
    echo "   → $SECRETS_FILE"
fi

echo ""
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo -e "${CYAN}Sécurité${NC}"
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
echo ""
echo "Protection des secrets:"
echo "  ✓ Chiffrement: AES-256-GCM (AEAD)"
echo "  ✓ Dérivation clé: Argon2id (résistant rainbow tables)"
echo "  ✓ Salt unique: 16 bytes aléatoires par secret"
echo "  ✓ Nonce unique: 12 bytes aléatoires par opération"
echo "  ✓ Permissions fichier: 600 (lecture/écriture propriétaire uniquement)"
echo ""
echo "Bonnes pratiques:"
echo "  ✓ Ne jamais commiter .env dans Git"
echo "  ✓ Utiliser .env.example comme template"
echo "  ✓ Changer TITANE_SECRETS_PASSPHRASE en production"
echo "  ✓ Backup régulier de secrets.enc (avec la passphrase)"
echo ""

echo -e "${CYAN}══════════════════════════════════════════════════════════════=${NC}"
echo -e "${GREEN}Configuration terminée ✅${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════════=${NC}"
echo ""
echo "Prochaines étapes:"
echo "  1. Lancer Titan-Dev: pnpm run dev"
echo "  2. Aller dans Governance Center → Secrets"
echo "  3. Entrer la clé Gemini"
echo "  4. Vérifier le status: 'Gemini opérationnel' ✅"
echo ""
