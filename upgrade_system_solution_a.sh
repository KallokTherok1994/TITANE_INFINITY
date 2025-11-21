#!/bin/bash

################################################################################
# TITANE∞ v10 - UPGRADE SYSTÈME VERS POP!_OS 24.04
# Solution A: Mise à jour complète pour webkit2gtk-4.1
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}  TITANE∞ v10 - PRÉPARATION UPGRADE SYSTÈME${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Vérifier version actuelle
echo -e "${CYAN}[1/7]${NC} Vérification version système actuelle..."
echo ""

if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo -e "${YELLOW}Système actuel:${NC}"
    echo "  Nom: $NAME"
    echo "  Version: $VERSION"
    echo "  ID: $ID"
    echo "  Version ID: $VERSION_ID"
    echo ""
    
    if [[ "$VERSION_ID" == "22.04" ]]; then
        echo -e "${GREEN}[OK]${NC} Pop!_OS 22.04 détecté → Upgrade vers 24.04 recommandé"
    elif [[ "$VERSION_ID" == "24.04" ]]; then
        echo -e "${GREEN}[OK]${NC} Pop!_OS 24.04 déjà installé!"
        echo -e "${YELLOW}[INFO]${NC} Vérification webkit2gtk-4.1..."
        
        if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
            echo -e "${GREEN}[✓ SUCCESS]${NC} webkit2gtk-4.1 disponible"
            echo ""
            echo -e "${CYAN}Lancer directement:${NC} ./launch_dev.sh"
            exit 0
        else
            echo -e "${YELLOW}[INFO]${NC} webkit2gtk-4.1 manquant, installation requise"
        fi
    else
        echo -e "${YELLOW}[INFO]${NC} Version: $VERSION_ID"
    fi
else
    echo -e "${RED}[ERREUR]${NC} /etc/os-release introuvable"
    exit 1
fi

echo ""
echo -e "${CYAN}[2/7]${NC} Sauvegarde projet TITANE∞..."
echo ""

cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"

# Créer backup complet
BACKUP_DIR="$HOME/titane_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "  → Backup vers: $BACKUP_DIR"

# Copier fichiers essentiels
cp -r src-tauri "$BACKUP_DIR/" 2>/dev/null || true
cp -r reconciliation_logs "$BACKUP_DIR/" 2>/dev/null || true
cp *.md "$BACKUP_DIR/" 2>/dev/null || true
cp *.sh "$BACKUP_DIR/" 2>/dev/null || true
cp package.json "$BACKUP_DIR/" 2>/dev/null || true

echo -e "${GREEN}[OK]${NC} Backup créé: $BACKUP_DIR"

echo ""
echo -e "${CYAN}[3/7]${NC} Vérification espace disque..."
echo ""

AVAILABLE_SPACE=$(df -h / | awk 'NR==2 {print $4}')
echo "  Espace disponible: $AVAILABLE_SPACE"

AVAILABLE_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')

if [ "$AVAILABLE_GB" -lt 20 ]; then
    echo -e "${RED}[ATTENTION]${NC} Moins de 20 GB disponible"
    echo -e "${YELLOW}[INFO]${NC} Upgrade système nécessite ~15-20 GB"
    echo ""
    read -p "Continuer quand même? [y/N] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}[ANNULÉ]${NC} Libérer de l'espace puis relancer"
        exit 1
    fi
else
    echo -e "${GREEN}[OK]${NC} Espace suffisant ($AVAILABLE_SPACE)"
fi

echo ""
echo -e "${CYAN}[4/7]${NC} Mise à jour liste des paquets..."
echo ""

echo -e "${YELLOW}[INFO]${NC} Cette étape nécessite les droits sudo"
echo ""

# Vérifier sudo disponible
if command -v sudo &> /dev/null; then
    sudo apt update
    echo -e "${GREEN}[OK]${NC} Liste des paquets mise à jour"
else
    echo -e "${RED}[ERREUR]${NC} sudo non disponible"
    echo -e "${YELLOW}[INFO]${NC} Commandes manuelles requises:"
    echo "  1. Ouvrir terminal root"
    echo "  2. apt update"
    echo "  3. do-release-upgrade"
    exit 1
fi

echo ""
echo -e "${CYAN}[5/7]${NC} Vérification compatibilité upgrade..."
echo ""

if command -v do-release-upgrade &> /dev/null; then
    echo -e "${GREEN}[OK]${NC} do-release-upgrade disponible"
    
    # Vérifier si upgrade disponible
    sudo do-release-upgrade --check-dist-upgrade-only 2>&1 | tee /tmp/upgrade_check.log
    
    if grep -q "No new release found" /tmp/upgrade_check.log; then
        echo ""
        echo -e "${YELLOW}[INFO]${NC} Aucune nouvelle version détectée"
        echo -e "${YELLOW}[INFO]${NC} Possible si déjà sur version récente ou sources non configurés"
    fi
else
    echo -e "${YELLOW}[INFO]${NC} do-release-upgrade non disponible"
    echo ""
    echo -e "${CYAN}Installation update-manager-core:${NC}"
    sudo apt install -y update-manager-core
fi

echo ""
echo -e "${CYAN}[6/7]${NC} Instructions upgrade système..."
echo ""

cat << 'INSTRUCTIONS'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   INSTRUCTIONS UPGRADE POP!_OS 22.04 → 24.04                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

MÉTHODE 1: Via Terminal (RECOMMANDÉ)
────────────────────────────────────
1. Fermer toutes applications (sauf terminal)
2. Exécuter:
   sudo do-release-upgrade

3. Suivre les instructions (appuyer Entrée pour continuer)
4. Accepter les changements
5. Redémarrer après upgrade (~ 30-60 minutes)

MÉTHODE 2: Via System76 (Pop!_OS)
──────────────────────────────────
1. Ouvrir "Pop!_Shop" ou "System Settings"
2. Chercher "System Upgrade" ou "Distribution Upgrade"
3. Cliquer "Upgrade to 24.04"
4. Suivre assistant graphique

APRÈS REDÉMARRAGE
─────────────────
1. Vérifier version:
   cat /etc/os-release

2. Installer webkit2gtk-4.1:
   sudo apt install -y libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev

3. Relancer TITANE∞:
   cd $PROJECT_DIR
   ./launch_dev.sh

INSTRUCTIONS
echo ""

echo -e "${CYAN}[7/7]${NC} Prêt pour upgrade..."
echo ""

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  PRÉPARATION TERMINÉE${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}[FICHIERS SAUVEGARDÉS]${NC}"
echo "  📁 $BACKUP_DIR"
echo ""

echo -e "${YELLOW}[PROCHAINE ÉTAPE]${NC}"
echo "  Exécuter dans un nouveau terminal:"
echo ""
echo -e "${CYAN}  sudo do-release-upgrade${NC}"
echo ""

echo -e "${YELLOW}[APRÈS UPGRADE]${NC}"
echo "  1. Redémarrer système"
echo "  2. Installer webkit2gtk-4.1:"
echo -e "     ${CYAN}sudo apt install -y libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev${NC}"
echo "  3. Relancer TITANE∞:"
echo -e "     ${CYAN}cd $PROJECT_DIR && ./launch_dev.sh${NC}"
echo ""

echo -e "${GREEN}[✓ READY]${NC} Système prêt pour upgrade vers 24.04"
echo ""

read -p "Lancer do-release-upgrade maintenant? [y/N] " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}[LANCEMENT]${NC} Upgrade système..."
    echo ""
    sudo do-release-upgrade
else
    echo ""
    echo -e "${YELLOW}[MANUEL]${NC} Lancer manuellement: sudo do-release-upgrade"
    echo ""
fi

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""
