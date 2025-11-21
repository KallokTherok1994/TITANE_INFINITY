#!/bin/bash
################################################################################
# SCRIPT DE SAUVEGARDE GITHUB - TITANE∞
# Système : Pop!_OS (Ubuntu-based)
# Objectif : Sauvegarde complète et sécurisée sur GitHub
################################################################################

set -e  # Arrêt immédiat en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY"
GITHUB_URL=""  # À REMPLIR : votre URL GitHub

################################################################################
# Fonction d'affichage
################################################################################
print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

################################################################################
# 1. VÉRIFICATIONS PRÉLIMINAIRES
################################################################################
print_step "1. VÉRIFICATIONS PRÉLIMINAIRES"

# Vérifier que Git est installé
if ! command -v git &> /dev/null; then
    print_error "Git n'est pas installé. Installation requise : sudo apt install git"
    exit 1
fi
print_success "Git est installé : $(git --version)"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Le répertoire $PROJECT_DIR n'existe pas"
    exit 1
fi

cd "$PROJECT_DIR"
print_success "Répertoire de travail : $PROJECT_DIR"

# Vérifier la configuration Git globale
GIT_USER=$(git config --global user.name || echo "")
GIT_EMAIL=$(git config --global user.email || echo "")

if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
    print_warning "Configuration Git manquante. Configuration en cours..."
    
    if [ -z "$GIT_USER" ]; then
        git config --global user.name "KallokTherok1994"
        print_success "user.name configuré : KallokTherok1994"
    else
        print_success "user.name déjà configuré : $GIT_USER"
    fi
    
    if [ -z "$GIT_EMAIL" ]; then
        git config --global user.email "investissement.kevin@gmail.com"
        print_success "user.email configuré : investissement.kevin@gmail.com"
    else
        print_success "user.email déjà configuré : $GIT_EMAIL"
    fi
else
    print_success "Configuration Git : $GIT_USER <$GIT_EMAIL>"
fi

################################################################################
# 2. INITIALISATION GIT
################################################################################
print_step "2. INITIALISATION DU DÉPÔT GIT"

# Vérifier si un dépôt Git existe déjà
if [ -d ".git" ]; then
    print_warning "Un dépôt Git existe déjà dans ce répertoire"
    
    # Vérifier les remotes existantes
    EXISTING_REMOTE=$(git remote -v 2>/dev/null || echo "")
    if [ -n "$EXISTING_REMOTE" ]; then
        print_warning "Remotes existantes :"
        git remote -v
        echo ""
        read -p "Voulez-vous supprimer les remotes existantes ? (o/N) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Oo]$ ]]; then
            git remote remove origin 2>/dev/null || true
            print_success "Remote 'origin' supprimée"
        fi
    fi
else
    # Initialiser un nouveau dépôt Git
    git init
    print_success "Dépôt Git initialisé"
fi

# Vérifier que .gitignore est présent et optimisé
if [ ! -f ".gitignore" ]; then
    print_error ".gitignore manquant. Création requise."
    exit 1
fi
print_success ".gitignore présent et optimisé"

################################################################################
# 3. PRÉPARATION DU COMMIT INITIAL
################################################################################
print_step "3. PRÉPARATION DU COMMIT INITIAL"

# Vérifier s'il y a des fichiers à commiter
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Fichiers non suivis ou modifiés détectés"
    
    # Afficher un résumé
    echo "Résumé des changements :"
    git status --short | head -20
    TOTAL_FILES=$(git status --porcelain | wc -l)
    echo "... ($TOTAL_FILES fichiers au total)"
    echo ""
    
    # Ajouter tous les fichiers
    git add .
    print_success "Tous les fichiers ajoutés au staging"
    
    # Créer le commit initial
    git commit -m "Initial upload TITANE∞ (sauvegarde complète) - $(date '+%Y-%m-%d %H:%M:%S')"
    print_success "Commit initial créé"
else
    # Vérifier s'il existe déjà des commits
    if git rev-parse HEAD >/dev/null 2>&1; then
        print_success "Le dépôt est déjà à jour, aucun changement à commiter"
    else
        print_error "Aucun fichier à commiter et aucun commit existant"
        exit 1
    fi
fi

################################################################################
# 4. CONNEXION AU DÉPÔT GITHUB
################################################################################
print_step "4. CONNEXION AU DÉPÔT GITHUB"

# Demander l'URL GitHub si non définie
if [ -z "$GITHUB_URL" ]; then
    echo -e "${YELLOW}Veuillez entrer l'URL de votre dépôt GitHub :${NC}"
    echo -e "${YELLOW}Format HTTPS : https://github.com/VOTRE_USERNAME/VOTRE_REPO.git${NC}"
    echo -e "${YELLOW}Format SSH : git@github.com:VOTRE_USERNAME/VOTRE_REPO.git${NC}"
    read -r GITHUB_URL
    
    if [ -z "$GITHUB_URL" ]; then
        print_error "URL GitHub requise"
        exit 1
    fi
fi

print_success "URL GitHub : $GITHUB_URL"

# Ajouter le remote origin
if git remote get-url origin >/dev/null 2>&1; then
    print_warning "Remote 'origin' existe déjà"
    CURRENT_URL=$(git remote get-url origin)
    if [ "$CURRENT_URL" != "$GITHUB_URL" ]; then
        print_warning "URL différente détectée : $CURRENT_URL"
        git remote set-url origin "$GITHUB_URL"
        print_success "URL du remote 'origin' mise à jour"
    else
        print_success "Remote 'origin' déjà configuré correctement"
    fi
else
    git remote add origin "$GITHUB_URL"
    print_success "Remote 'origin' ajouté"
fi

# Définir la branche principale
git branch -M main
print_success "Branche principale définie : main"

################################################################################
# 5. PUSH INITIAL
################################################################################
print_step "5. PUSH VERS GITHUB"

echo -e "${YELLOW}Tentative de push vers GitHub...${NC}"
echo -e "${YELLOW}Si vous utilisez HTTPS, vous devrez peut-être entrer vos credentials.${NC}"
echo -e "${YELLOW}Pour un Personal Access Token (PAT), utilisez-le comme mot de passe.${NC}\n"

# Tenter le push
if git push -u origin main; then
    print_success "Push réussi !"
else
    print_error "Le push a échoué"
    echo ""
    echo -e "${YELLOW}Solutions possibles :${NC}"
    echo "1. Si le dépôt distant n'est pas vide, utilisez : git push -u origin main --force"
    echo "2. Vérifiez vos credentials GitHub (token d'accès personnel)"
    echo "3. Si vous utilisez SSH, vérifiez votre clé SSH : ssh -T git@github.com"
    echo "4. Pour HTTPS avec token : git remote set-url origin https://TOKEN@github.com/USER/REPO.git"
    exit 1
fi

################################################################################
# 6. VALIDATION FINALE
################################################################################
print_step "6. VALIDATION FINALE"

echo "État du dépôt :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git status
echo ""

echo "Remote configurée :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git remote -v
echo ""

echo "Derniers commits :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git log --oneline -5
echo ""

# Vérifier HEAD
CURRENT_BRANCH=$(git branch --show-current)
print_success "Branche actuelle : $CURRENT_BRANCH"

# Vérifier les fichiers non suivis
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)
if [ "$UNTRACKED" -gt 0 ]; then
    print_warning "$UNTRACKED fichier(s) non suivi(s) (ignoré(s) par .gitignore)"
else
    print_success "Aucun fichier non suivi"
fi

################################################################################
# RÉSUMÉ FINAL
################################################################################
print_step "✅ SAUVEGARDE GITHUB COMPLÈTE"

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           TITANE∞ - SAUVEGARDE GITHUB RÉUSSIE             ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║ ✓ Dépôt Git initialisé et configuré                       ║${NC}"
echo -e "${GREEN}║ ✓ .gitignore optimisé                                     ║${NC}"
echo -e "${GREEN}║ ✓ Commit initial créé                                     ║${NC}"
echo -e "${GREEN}║ ✓ Remote GitHub configuré                                 ║${NC}"
echo -e "${GREEN}║ ✓ Push réussi vers 'main'                                 ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║ Repository : $GITHUB_URL${NC}"
echo -e "${GREEN}║ Branche    : main                                         ║${NC}"
echo -e "${GREEN}║ Date       : $(date '+%Y-%m-%d %H:%M:%S')                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}Commandes utiles pour la suite :${NC}"
echo "  git status              # Vérifier l'état"
echo "  git add .               # Ajouter les modifications"
echo "  git commit -m 'msg'     # Créer un commit"
echo "  git push                # Pousser vers GitHub"
echo "  git pull                # Récupérer depuis GitHub"
echo "  git log --oneline       # Voir l'historique"

exit 0
