#!/bin/bash

###############################################################################
# TITANE∞ TTS Installation Script
# Installe Parler-TTS Mini Multilingual v1.1 pour AMD Radeon RX 7600 XT
# OS: Pop!_OS 22.04 (Ubuntu-based)
###############################################################################

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         TITANE∞ TTS Installation Script v1.0                ║"
echo "║         Parler-TTS Mini Multilingual v1.1                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Variables
PROJECT_DIR="/home/titane/Documents/TITANE_INFINITY"
TTS_SERVICE_DIR="${PROJECT_DIR}/tts-service"
VENV_NAME="venv-parler-tts"
VENV_PATH="${TTS_SERVICE_DIR}/${VENV_NAME}"

# Détecter Python 3.10+
echo "🔍 Vérification Python 3.10+..."
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
    echo "❌ Python 3.10+ requis. Installation Python 3.11..."
    sudo apt update
    sudo apt install python3.11 python3.11-venv python3.11-dev -y
    PYTHON_CMD="python3.11"
fi

PYTHON_VERSION=$($PYTHON_CMD --version | awk '{print $2}')
echo "✅ Python détecté: $PYTHON_VERSION ($PYTHON_CMD)"

# Vérifier ROCm
echo ""
echo "🔍 Vérification ROCm..."
if command -v rocm-smi &> /dev/null; then
    echo "✅ ROCm installé:"
    rocm-smi | head -n 5
else
    echo "⚠️  ROCm non détecté. Installation recommandée pour GPU AMD."
    echo "   Lancer: sudo apt install rocm-hip-runtime rocm-opencl-runtime -y"
    read -p "   Continuer sans ROCm (CPU only)? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Créer dossier service
echo ""
echo "📁 Création dossier TTS service..."
mkdir -p "$TTS_SERVICE_DIR"
cd "$TTS_SERVICE_DIR"
echo "✅ Dossier: $TTS_SERVICE_DIR"

# Créer environnement virtuel
echo ""
echo "🐍 Création environnement virtuel Python..."
if [ -d "$VENV_PATH" ]; then
    echo "⚠️  Environnement existant détecté. Suppression..."
    rm -rf "$VENV_PATH"
fi

$PYTHON_CMD -m venv "$VENV_PATH"
source "${VENV_PATH}/bin/activate"
echo "✅ Environnement créé: $VENV_NAME"

# Mettre à jour pip
echo ""
echo "📦 Mise à jour pip..."
pip install --upgrade pip setuptools wheel --quiet
PIP_VERSION=$(pip --version | awk '{print $2}')
echo "✅ pip version: $PIP_VERSION"

# Installer PyTorch avec ROCm
echo ""
echo "🔥 Installation PyTorch avec ROCm 6.0..."
echo "   (Cela peut prendre 5-10 minutes...)"
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.0 --quiet
echo "✅ PyTorch installé"

# Vérifier GPU
echo ""
echo "🎮 Vérification détection GPU..."
GPU_CHECK=$(python3 -c "import torch; print('CUDA:', torch.cuda.is_available()); print('Device:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')")
echo "$GPU_CHECK"
if echo "$GPU_CHECK" | grep -q "CUDA: True"; then
    echo "✅ GPU AMD détecté avec succès!"
else
    echo "⚠️  GPU non détecté. Mode CPU sera utilisé."
fi

# Installer Parler-TTS
echo ""
echo "🎤 Installation Parler-TTS..."
pip install git+https://github.com/huggingface/parler-tts.git --quiet
pip install transformers>=4.43.0 accelerate>=0.26.0 datasets>=2.18.0 soundfile>=0.12.1 --quiet
echo "✅ Parler-TTS installé"

# Installer FastAPI
echo ""
echo "🚀 Installation FastAPI..."
pip install fastapi==0.109.0 uvicorn[standard]==0.27.0 pydantic==2.6.0 python-multipart==0.0.6 --quiet
echo "✅ FastAPI installé"

# Créer script de démarrage
echo ""
echo "📝 Création script de démarrage..."
cat > "${TTS_SERVICE_DIR}/start_tts_service.sh" << 'EOF'
#!/bin/bash
cd /home/titane/Documents/TITANE_INFINITY/tts-service
source venv-parler-tts/bin/activate
python3 tts_api_server.py
EOF

chmod +x "${TTS_SERVICE_DIR}/start_tts_service.sh"
echo "✅ Script créé: start_tts_service.sh"

# Test installation
echo ""
echo "🧪 Test de l'installation..."
echo "   (Premier lancement: téléchargement modèle ~900MB)"
read -p "   Lancer test maintenant? [Y/n] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    python3 "${TTS_SERVICE_DIR}/test_parler_tts.py"

    echo ""
    echo "🎧 Audio généré: /tmp/titane_tts_test/test_output.wav"
    read -p "   Jouer l'audio maintenant? [Y/n] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        if command -v aplay &> /dev/null; then
            aplay /tmp/titane_tts_test/test_output.wav
        elif command -v ffplay &> /dev/null; then
            ffplay -nodisp -autoexit /tmp/titane_tts_test/test_output.wav
        else
            echo "⚠️  Aucun lecteur audio trouvé (aplay/ffplay)"
        fi
    fi
fi

# Créer service systemd (optionnel)
echo ""
read -p "📦 Créer service systemd pour démarrage automatique? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo tee /etc/systemd/system/titane-tts.service > /dev/null << EOF
[Unit]
Description=TITANE TTS Service (Parler-TTS)
After=network.target

[Service]
Type=simple
User=titane
WorkingDirectory=${TTS_SERVICE_DIR}
ExecStart=${VENV_PATH}/bin/python3 tts_api_server.py
Restart=on-failure
RestartSec=10s
Environment="CUDA_VISIBLE_DEVICES=0"

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable titane-tts.service

    echo "✅ Service systemd créé"
    echo ""
    read -p "   Démarrer le service maintenant? [Y/n] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        sudo systemctl start titane-tts.service
        sleep 3
        sudo systemctl status titane-tts.service --no-pager
    fi
fi

# Résumé final
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              ✅ INSTALLATION TERMINÉE                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📂 Dossier service: $TTS_SERVICE_DIR"
echo "🐍 Environnement: $VENV_NAME"
echo ""
echo "🚀 DÉMARRAGE DU SERVICE:"
echo "   Manuel:"
echo "      cd $TTS_SERVICE_DIR"
echo "      ./start_tts_service.sh"
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
echo "   Systemd:"
echo "      sudo systemctl start titane-tts.service"
echo "      sudo systemctl status titane-tts.service"
echo ""
fi
echo "🧪 TESTS:"
echo "   Health check:"
echo "      curl http://localhost:8765/api/v1/tts/health | jq"
echo ""
echo "   Synthèse TTS:"
echo "      curl -X POST http://localhost:8765/api/v1/tts/synthesize \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"text\":\"Bonjour TITANE\"}' \\"
echo "        --output /tmp/test.wav && aplay /tmp/test.wav"
echo ""
echo "📚 DOCUMENTATION COMPLÈTE:"
echo "   $PROJECT_DIR/TTS_PARLER_INSTALLATION_GUIDE.md"
echo ""
echo "✅ Prêt à intégrer avec TITANE∞ frontend!"
