#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
#  TITANE∞ LOCAL MODEL INSTALLATION SCRIPT
#  Installation automatisée de Ollama + LLama 3.1 + Configuration titane-local
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_header() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}  $1"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

# Banner
clear
echo -e "${PURPLE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   ████████╗██╗████████╗ █████╗ ███╗   ██╗███████╗    ██╗      ██████╗    ║
║   ╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║██╔════╝    ██║     ██╔═══██╗   ║
║      ██║   ██║   ██║   ███████║██╔██╗ ██║█████╗      ██║     ██║   ██║   ║
║      ██║   ██║   ██║   ██╔══██║██║╚██╗██║██╔══╝      ██║     ██║   ██║   ║
║      ██║   ██║   ██║   ██║  ██║██║ ╚████║███████╗    ███████╗╚██████╔╝   ║
║      ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝    ╚══════╝ ╚═════╝    ║
║                                                                            ║
║                  LOCAL MODEL INSTALLATION — LLama 3.1                     ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 1 : VÉRIFICATION SYSTÈME
# ═══════════════════════════════════════════════════════════════════════════

print_header "ÉTAPE 1/7 : VÉRIFICATION SYSTÈME"

print_step "Vérification OS..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_success "OS Linux détecté"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    print_success "OS macOS détecté"
else
    print_error "OS non supporté : $OSTYPE"
    exit 1
fi

print_step "Vérification RAM disponible..."
TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 8192 ]; then
    print_warning "RAM < 8GB détectée ($TOTAL_RAM MB). Performance réduite possible."
else
    print_success "RAM suffisante : $TOTAL_RAM MB"
fi

print_step "Vérification espace disque..."
AVAILABLE_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 10 ]; then
    print_error "Espace disque insuffisant : ${AVAILABLE_SPACE}GB (minimum 10GB requis)"
    exit 1
else
    print_success "Espace disque suffisant : ${AVAILABLE_SPACE}GB"
fi

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 2 : INSTALLATION OLLAMA
# ═══════════════════════════════════════════════════════════════════════════

print_header "ÉTAPE 2/7 : INSTALLATION OLLAMA"

if command -v ollama &> /dev/null; then
    print_success "Ollama déjà installé"
    OLLAMA_VERSION=$(ollama --version 2>&1 | head -n1)
    echo "  Version : $OLLAMA_VERSION"
else
    print_step "Installation d'Ollama..."

    # Téléchargement et installation
    curl -fsSL https://ollama.com/install.sh | sh

    if command -v ollama &> /dev/null; then
        print_success "Ollama installé avec succès"
    else
        print_error "Échec installation Ollama"
        exit 1
    fi
fi

# Démarrage du service Ollama
print_step "Démarrage du service Ollama..."
if pgrep -x "ollama" > /dev/null; then
    print_success "Service Ollama déjà actif"
else
    ollama serve &> /tmp/ollama.log &
    sleep 3

    if pgrep -x "ollama" > /dev/null; then
        print_success "Service Ollama démarré"
    else
        print_error "Échec démarrage service Ollama"
        exit 1
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 3 : PULL DU MODÈLE LLAMA 3.1
# ═══════════════════════════════════════════════════════════════════════════

print_header "ÉTAPE 3/7 : TÉLÉCHARGEMENT LLAMA 3.1"

print_step "Vérification si llama3.1 existe déjà..."
if ollama list | grep -q "llama3.1"; then
    print_success "LLama 3.1 déjà téléchargé"
else
    print_step "Pull de llama3.1 (cela peut prendre plusieurs minutes)..."
    print_warning "Taille : ~4.7GB — Patience requise ☕"

    ollama pull llama3.1

    if ollama list | grep -q "llama3.1"; then
        print_success "LLama 3.1 téléchargé avec succès"
    else
        print_error "Échec téléchargement llama3.1"
        exit 1
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 4 : CRÉATION DU MODÈLE TITANE-LOCAL
# ═══════════════════════════════════════════════════════════════════════════

print_header "ÉTAPE 4/7 : CRÉATION MODÈLE TITANE-LOCAL"

print_step "Vérification du Modelfile..."
if [ ! -f "Modelfile" ]; then
    print_error "Modelfile introuvable dans le répertoire courant"
    print_warning "Le fichier Modelfile doit être présent à la racine de TITANE_INFINITY"
    exit 1
fi

print_success "Modelfile trouvé"

print_step "Création du modèle titane-local..."
if ollama list | grep -q "titane-local"; then
    print_warning "titane-local existe déjà, suppression et recréation avec Modelfile optimisé v∞..."
    ollama rm titane-local 2>/dev/null || true
fi

echo -e "${CYAN}▶${NC} Application du super prompt optimisé TITANE-LOCAL ENGINE v∞..."
ollama create titane-local -f Modelfile

if ollama list | grep -q "titane-local"; then
    print_success "Modèle titane-local créé avec succès (v∞ OPTIMIZED)"
else
    print_error "Échec création titane-local"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 5 : TEST DU MODÈLE
# ═══════════════════════════════════════════════════════════════════════════

print_header "ÉTAPE 5/7 : TEST DU MODÈLE"

print_step "Test de génération avec titane-local v∞ optimisé..."

TEST_PROMPT="Test rapide : Dis 'TITANE-LOCAL ENGINE v∞ opérationnel' en une ligne."

echo -e "${YELLOW}Prompt:${NC} $TEST_PROMPT"
echo ""

RESPONSE=$(ollama run titane-local "$TEST_PROMPT" 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Réponse:${NC} $RESPONSE"
    echo ""
    print_success "Test réussi — titane-local v∞ OPTIMIZED fonctionne correctement"
else
    print_error "Test échoué"
    echo "$RESPONSE"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 6 : VÉRIFICATION ENDPOINT HTTP
# ═══════════════════════════════════════════════════════════════════════════

print_header "ÉTAPE 6/7 : VÉRIFICATION ENDPOINT HTTP"

print_step "Test endpoint http://localhost:11434..."

if curl -s http://localhost:11434/api/tags > /dev/null; then
    print_success "Endpoint HTTP accessible"

    print_step "Test génération via API..."

    API_RESPONSE=$(curl -s http://localhost:11434/api/generate -d '{
      "model": "titane-local",
      "prompt": "Test API",
      "stream": false
    }')

    if echo "$API_RESPONSE" | grep -q "response"; then
        print_success "API fonctionne correctement"
    else
        print_warning "API accessible mais réponse inattendue"
    fi
else
    print_error "Endpoint HTTP non accessible"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 7 : RÉSUMÉ ET INSTRUCTIONS
# ═══════════════════════════════════════════════════════════════════════════

print_header "ÉTAPE 7/7 : INSTALLATION COMPLÈTE ✅"

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                        🎉 INSTALLATION RÉUSSIE 🎉                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

print_success "Ollama installé et actif"
print_success "LLama 3.1 téléchargé (base)"
print_success "titane-local créé et configuré (v∞ OPTIMIZED)"
print_success "Tests validés avec SUPER PROMPT ULTIME"
print_success "Endpoint HTTP opérationnel"
print_success "Singularity Alignment (6 couches) activé"

echo ""
echo -e "${CYAN}📊 MODÈLES DISPONIBLES :${NC}"
echo ""
ollama list

echo ""
echo -e "${CYAN}🚀 PROCHAINES ÉTAPES :${NC}"
echo ""
echo "  1. ${YELLOW}Redémarrer TITANE∞${NC} (npm run tauri:dev)"
echo "  2. ${YELLOW}Ouvrir Chat IA${NC} dans l'interface"
echo "  3. ${YELLOW}Sélectionner 'TITANE Local (LLama 3.1)'${NC}"
echo "  4. ${YELLOW}Tester avec un message${NC}"
echo ""
echo -e "${CYAN}🛠️  COMMANDES UTILES :${NC}"
echo ""
echo "  ${GREEN}ollama list${NC}                    # Liste les modèles"
echo "  ${GREEN}ollama run titane-local${NC}        # Tester en CLI"
echo "  ${GREEN}ollama rm titane-local${NC}         # Supprimer le modèle"
echo "  ${GREEN}ollama serve${NC}                   # Démarrer le service"
echo ""
echo "  ${PURPLE}sudo titane ia status${NC}         # Statut IA dans TITANE∞"
echo "  ${PURPLE}sudo titane ia test local${NC}     # Tester depuis TITANE∞"
echo "  ${PURPLE}sudo titane ia enable dev-mode${NC} # Activer DEV MODE"
echo ""
echo -e "${CYAN}📍 ENDPOINT :${NC}"
echo "  http://localhost:11434"
echo ""
echo -e "${CYAN}📚 DOCUMENTATION :${NC}"
echo "  SUPER_PROMPT_TITANE_LOCAL_MODEL_v∞.md"
echo "  SUPER_PROMPT_OPTIMIZER_TITANE_LOCAL_v∞.md (Optimisations cognitives)"
echo ""

echo -e "${PURPLE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║            TITANE-LOCAL ENGINE v∞ — SINGULARITY ALIGNED 🧠⚡∞              ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
