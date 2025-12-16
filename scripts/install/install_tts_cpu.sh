#!/bin/bash

###############################################################################
# TITANE∞ TTS Installation Script (CPU Mode)
# Installe Parler-TTS sans ROCm (CPU fallback)
# Pour GPU AMD: installer ROCm séparément puis réinstaller PyTorch
###############################################################################

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         TITANE∞ TTS Installation (CPU Mode)                 ║"
echo "║         Parler-TTS Mini Multilingual v1.1                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  Mode CPU (pour GPU AMD: installer ROCm puis réexécuter)"
echo ""

# Variables
PROJECT_DIR="/home/titane/Documents/TITANE_INFINITY"
TTS_SERVICE_DIR="${PROJECT_DIR}/tts-service"
VENV_NAME="venv-parler-tts"
VENV_PATH="${TTS_SERVICE_DIR}/${VENV_NAME}"

# Détecter Python
echo "🔍 Détection Python 3.10+..."
PYTHON_CMD=""
for cmd in python3.12 python3.11 python3.10 python3; do
    if command -v $cmd &> /dev/null; then
        VERSION=$($cmd --version 2>&1 | grep -oP '\d+\.\d+' | head -1)
        MAJOR=$(echo $VERSION | cut -d. -f1)
        MINOR=$(echo $VERSION | cut -d. -f2)
        if [ "$MAJOR" -ge 3 ] && [ "$MINOR" -ge 10 ]; then
            PYTHON_CMD=$cmd
            break
        fi
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    echo "❌ Python 3.10+ requis"
    exit 1
fi

PYTHON_VERSION=$($PYTHON_CMD --version | awk '{print $2}')
echo "✅ Python: $PYTHON_VERSION ($PYTHON_CMD)"

# Créer dossier
echo ""
echo "📁 Création dossier service..."
mkdir -p "$TTS_SERVICE_DIR"
cd "$TTS_SERVICE_DIR"

# Créer venv
echo ""
echo "🐍 Création environnement virtuel..."
if [ -d "$VENV_PATH" ]; then
    echo "⚠️  Environnement existant. Suppression..."
    rm -rf "$VENV_PATH"
fi

$PYTHON_CMD -m venv "$VENV_PATH"
source "${VENV_PATH}/bin/activate"
echo "✅ Environnement créé"

# Mettre à jour pip
echo ""
echo "📦 Mise à jour pip..."
pip install --upgrade pip setuptools wheel -q
echo "✅ pip mis à jour"

# Installer PyTorch CPU
echo ""
echo "🔥 Installation PyTorch (CPU)..."
echo "   (Prend 2-5 minutes...)"
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu -q
echo "✅ PyTorch CPU installé"

# Vérifier
echo ""
echo "🧪 Test PyTorch..."
python3 -c "import torch; print('✅ PyTorch:', torch.__version__); print('   Device: CPU')"

# Installer Parler-TTS
echo ""
echo "🎤 Installation Parler-TTS..."
pip install git+https://github.com/huggingface/parler-tts.git -q
pip install transformers>=4.43.0 accelerate>=0.26.0 datasets>=2.18.0 soundfile>=0.12.1 -q
echo "✅ Parler-TTS installé"

# Installer FastAPI
echo ""
echo "🚀 Installation FastAPI..."
pip install fastapi==0.109.0 uvicorn[standard]==0.27.0 pydantic==2.6.0 python-multipart==0.0.6 -q
echo "✅ FastAPI installé"

# Créer script démarrage
echo ""
echo "📝 Création scripts..."
cat > "${TTS_SERVICE_DIR}/start_tts_service.sh" << 'EOFSCRIPT'
#!/bin/bash
cd /home/titane/Documents/TITANE_INFINITY/tts-service
source venv-parler-tts/bin/activate
python3 tts_api_server.py
EOFSCRIPT

chmod +x "${TTS_SERVICE_DIR}/start_tts_service.sh"
echo "✅ Scripts créés"

# Test minimal
echo ""
echo "🧪 Test de l'installation..."
echo "   (Premier lancement: téléchargement modèle ~900MB)"
echo "   ⏱️  Patience, cela peut prendre 10-15 minutes..."
echo ""

python3 << 'EOFPYTHON'
import torch
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import soundfile as sf
from pathlib import Path

print("📦 Chargement modèle Parler-TTS...")
model_name = "parler-tts/parler-tts-mini-multilingual-v1.1"
device = "cpu"

model = ParlerTTSForConditionalGeneration.from_pretrained(model_name).to(device)
tokenizer = AutoTokenizer.from_pretrained(model_name)
print("✅ Modèle chargé")

print("\n🎤 Génération audio test...")
description = "Une voix féminine française, chaleureuse et claire"
prompt = "Bonjour, je suis TITANE"

input_ids = tokenizer(description, return_tensors="pt").input_ids.to(device)
prompt_input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to(device)

generation = model.generate(
    input_ids=input_ids,
    prompt_input_ids=prompt_input_ids,
    attention_mask=torch.ones_like(input_ids),
    prompt_attention_mask=torch.ones_like(prompt_input_ids),
)

audio_arr = generation.cpu().numpy().squeeze()

Path("/tmp/titane_tts_test").mkdir(exist_ok=True)
sf.write("/tmp/titane_tts_test/test_output.wav", audio_arr, samplerate=model.config.sampling_rate)
print("✅ Audio généré: /tmp/titane_tts_test/test_output.wav")
EOFPYTHON

# Jouer audio
echo ""
if command -v aplay &> /dev/null; then
    echo "🎧 Lecture audio..."
    aplay /tmp/titane_tts_test/test_output.wav 2>/dev/null
elif command -v ffplay &> /dev/null; then
    ffplay -nodisp -autoexit /tmp/titane_tts_test/test_output.wav 2>/dev/null
else
    echo "⚠️  Lecteur audio non trouvé (installer: sudo apt install alsa-utils)"
fi

# Résumé
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              ✅ INSTALLATION TERMINÉE (CPU)                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📂 Dossier: $TTS_SERVICE_DIR"
echo "🐍 Python: $PYTHON_VERSION"
echo "💻 Mode: CPU (latence 1-3s par génération)"
echo ""
echo "🚀 DÉMARRAGE:"
echo "   cd $TTS_SERVICE_DIR"
echo "   ./start_tts_service.sh"
echo ""
echo "🧪 TEST API:"
echo "   curl http://localhost:8765/api/v1/tts/health"
echo ""
echo "⚡ AMÉLIORER PERFORMANCE (GPU AMD):"
echo "   1. Installer ROCm: sudo apt install rocm-hip-runtime"
echo "   2. Redémarrer système"
echo "   3. Réinstaller PyTorch ROCm:"
echo "      source venv-parler-tts/bin/activate"
echo "      pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.0"
echo ""
echo "✅ Prêt pour TITANE∞ !"
