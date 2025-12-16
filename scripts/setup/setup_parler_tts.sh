#!/bin/bash
# Setup Parler-TTS Backend for TITANE∞
# Automated installation script

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         TITANE∞ PARLER-TTS BACKEND SETUP                   ║${NC}"
echo -e "${BLUE}║         Automated Installation Script                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Variables
TTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/tts-service"
VENV_DIR="$TTS_DIR/venv-parler-tts"
PYTHON_MIN_VERSION="3.10"

# ════════════════════════════════════════════════════════════════
# 1. Vérifier Python version
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 1]${NC} Vérification Python..."

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 non trouvé. Installer Python $PYTHON_MIN_VERSION+${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo -e "${GREEN}✅ Python version: $PYTHON_VERSION${NC}"

# Vérifier version >= 3.10
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 10 ]); then
    echo -e "${RED}❌ Python $PYTHON_MIN_VERSION+ requis (actuel: $PYTHON_VERSION)${NC}"
    exit 1
fi

# ════════════════════════════════════════════════════════════════
# 2. Créer virtualenv
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 2]${NC} Création virtualenv..."

if [ -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}⚠️  Virtualenv existe déjà: $VENV_DIR${NC}"
    read -p "   Recréer ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$VENV_DIR"
        echo -e "${BLUE}   Ancien venv supprimé${NC}"
    else
        echo -e "${GREEN}✅ Utilisation venv existant${NC}"
        SKIP_VENV_CREATE=true
    fi
fi

if [ -z "$SKIP_VENV_CREATE" ]; then
    python3 -m venv "$VENV_DIR"
    echo -e "${GREEN}✅ Virtualenv créé: $VENV_DIR${NC}"
fi

# ════════════════════════════════════════════════════════════════
# 3. Activer virtualenv + upgrade pip
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 3]${NC} Activation virtualenv..."

source "$VENV_DIR/bin/activate"
echo -e "${GREEN}✅ Virtualenv activé${NC}"

echo -e "${BLUE}   Upgrade pip, setuptools, wheel...${NC}"
pip install --upgrade pip setuptools wheel

# ════════════════════════════════════════════════════════════════
# 4. Installer dépendances
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 4]${NC} Installation dépendances..."

if [ ! -f "$TTS_DIR/requirements.txt" ]; then
    echo -e "${RED}❌ requirements.txt manquant: $TTS_DIR/requirements.txt${NC}"
    exit 1
fi

echo -e "${BLUE}   Installation packages (peut prendre 5-10min)...${NC}"
pip install -r "$TTS_DIR/requirements.txt"

echo -e "${GREEN}✅ Dépendances installées${NC}"

# ════════════════════════════════════════════════════════════════
# 5. Vérifier GPU support (optionnel)
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 5]${NC} Vérification GPU support..."

if command -v rocm-smi &> /dev/null; then
    echo -e "${GREEN}✅ AMD ROCm détecté${NC}"
    echo -e "${BLUE}   GPU:${NC}"
    rocm-smi --showproductname || true
    
    echo -e "${YELLOW}   Installer PyTorch ROCm ? (recommandé pour GPU AMD)${NC}"
    read -p "   (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pip install torch --index-url https://download.pytorch.org/whl/rocm5.7
        echo -e "${GREEN}✅ PyTorch ROCm installé${NC}"
    fi
elif command -v nvidia-smi &> /dev/null; then
    echo -e "${GREEN}✅ NVIDIA GPU détecté${NC}"
    nvidia-smi --query-gpu=name --format=csv,noheader || true
    echo -e "${BLUE}   PyTorch CUDA déjà installé via requirements.txt${NC}"
else
    echo -e "${YELLOW}⚠️  Aucun GPU détecté. CPU mode activé (plus lent)${NC}"
fi

# ════════════════════════════════════════════════════════════════
# 6. Télécharger modèle (optionnel pré-téléchargement)
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 6]${NC} Pré-téléchargement modèle Parler-TTS..."

echo -e "${BLUE}   Le modèle (~1GB) sera téléchargé automatiquement au 1er lancement${NC}"
read -p "   Télécharger maintenant ? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}   Téléchargement modèle parler-tts/parler-tts-mini-multilingual-v1.1...${NC}"
    python3 -c "
from transformers import AutoTokenizer
from parler_tts import ParlerTTSForConditionalGeneration
print('Downloading model...')
model = ParlerTTSForConditionalGeneration.from_pretrained('parler-tts/parler-tts-mini-multilingual-v1.1')
tokenizer = AutoTokenizer.from_pretrained('parler-tts/parler-tts-mini-multilingual-v1.1')
print('✅ Model downloaded successfully')
"
    echo -e "${GREEN}✅ Modèle téléchargé${NC}"
else
    echo -e "${YELLOW}⚠️  Modèle sera téléchargé au 1er lancement (prévoir 5min)${NC}"
fi

# ════════════════════════════════════════════════════════════════
# 7. Créer script de lancement
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 7]${NC} Création script lancement..."

START_SCRIPT="$TTS_DIR/start_tts_service.sh"

cat > "$START_SCRIPT" << 'EOF'
#!/bin/bash
# Start TITANE∞ TTS Service
TTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$TTS_DIR/venv-parler-tts"

if [ ! -d "$VENV_DIR" ]; then
    echo "❌ Virtualenv manquant. Lancer setup_parler_tts.sh d'abord"
    exit 1
fi

source "$VENV_DIR/bin/activate"
cd "$TTS_DIR"

echo "🚀 Lancement TITANE∞ TTS API Server..."
python3 tts_api_server.py
EOF

chmod +x "$START_SCRIPT"
echo -e "${GREEN}✅ Script créé: $START_SCRIPT${NC}"

# ════════════════════════════════════════════════════════════════
# SUCCESS
# ════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║             INSTALLATION COMPLETE ✅                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Pour lancer le serveur TTS:${NC}"
echo -e "  cd tts-service"
echo -e "  ./start_tts_service.sh"
echo ""
echo -e "${BLUE}Ou directement:${NC}"
echo -e "  source $VENV_DIR/bin/activate"
echo -e "  python3 $TTS_DIR/tts_api_server.py"
echo ""
echo -e "${BLUE}Test du serveur:${NC}"
echo -e "  ./test_parler_tts_backend.sh"
echo ""
echo -e "${YELLOW}Ports:${NC}"
echo -e "  HTTP: http://localhost:8765"
echo -e "  Health: http://localhost:8765/api/v1/tts/health"
echo ""
