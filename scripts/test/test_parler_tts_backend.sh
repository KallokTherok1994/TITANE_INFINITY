#!/bin/bash
# P0-4: Test Backend Parler-TTS Python
# TITANE∞ v20.0 — SUPER PROMPT #1 Phase 2

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         P0-4: TEST BACKEND PARLER-TTS PYTHON               ║${NC}"
echo -e "${BLUE}║         TITANE∞ v20.0 — SUPER PROMPT #1 Phase 2            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Variables
TTS_DIR="/home/titane/Documents/TITANE_INFINITY/tts-service"
TTS_SERVER="$TTS_DIR/tts_api_server.py"
TTS_HOST="localhost"
TTS_PORT="8765"
TTS_URL="http://$TTS_HOST:$TTS_PORT"
TTS_HEALTH_URL="$TTS_URL/api/v1/tts/health"
TTS_SYNTHESIZE_URL="$TTS_URL/api/v1/tts/synthesize"

# Fichiers output
REPORT_FILE="P0_4_PARLER_TTS_BACKEND_TEST_REPORT.md"
AUDIO_OUTPUT="/tmp/titane_tts_test_$(date +%s).wav"

# ════════════════════════════════════════════════════════════════
# TEST 1: Vérifier fichier serveur existe
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[TEST 1]${NC} Vérification fichier serveur..."
if [ -f "$TTS_SERVER" ]; then
    echo -e "${GREEN}✅ Fichier trouvé: $TTS_SERVER${NC}"
else
    echo -e "${RED}❌ Fichier manquant: $TTS_SERVER${NC}"
    exit 1
fi

# ════════════════════════════════════════════════════════════════
# TEST 2: Vérifier dépendances Python
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[TEST 2]${NC} Vérification dépendances Python..."

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 non installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python 3: $(python3 --version)${NC}"

# Check pip packages (approximatif, ne vérifie pas venv)
echo -e "${BLUE}   Vérification packages requis...${NC}"
REQUIRED_PACKAGES=("fastapi" "uvicorn" "torch" "transformers" "parler-tts" "soundfile")
MISSING_PACKAGES=()

for pkg in "${REQUIRED_PACKAGES[@]}"; do
    if python3 -c "import $pkg" 2>/dev/null; then
        echo -e "${GREEN}   ✅ $pkg${NC}"
    else
        echo -e "${YELLOW}   ⚠️  $pkg (possiblement dans venv)${NC}"
        MISSING_PACKAGES+=("$pkg")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Packages potentiellement manquants: ${MISSING_PACKAGES[*]}${NC}"
    echo -e "${BLUE}   Note: Si serveur utilise venv, ceci est normal${NC}"
fi

# ════════════════════════════════════════════════════════════════
# TEST 3: Démarrer serveur TTS (background)
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[TEST 3]${NC} Démarrage serveur TTS..."

# Vérifier si déjà en cours
if lsof -ti:$TTS_PORT &> /dev/null; then
    echo -e "${GREEN}✅ Serveur TTS déjà en cours sur port $TTS_PORT${NC}"
    SERVER_ALREADY_RUNNING=true
else
    echo -e "${BLUE}   Lancement serveur en background...${NC}"
    cd "$TTS_DIR"
    
    # Lancer serveur (supposant venv si existe, sinon system Python)
    if [ -d "venv-parler-tts" ]; then
        source venv-parler-tts/bin/activate
        python3 tts_api_server.py > /tmp/titane_tts_server.log 2>&1 &
    else
        python3 tts_api_server.py > /tmp/titane_tts_server.log 2>&1 &
    fi
    
    TTS_PID=$!
    echo -e "${BLUE}   PID: $TTS_PID${NC}"
    SERVER_ALREADY_RUNNING=false
    
    # Attendre démarrage (max 30s)
    echo -e "${BLUE}   Attente démarrage (max 30s)...${NC}"
    for i in {1..30}; do
        if lsof -ti:$TTS_PORT &> /dev/null; then
            echo -e "${GREEN}✅ Serveur TTS démarré sur http://$TTS_HOST:$TTS_PORT${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Timeout: Serveur pas démarré après 30s${NC}"
            echo -e "${YELLOW}   Voir logs: tail /tmp/titane_tts_server.log${NC}"
            exit 1
        fi
        sleep 1
    done
fi

# ════════════════════════════════════════════════════════════════
# TEST 4: Health Check
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[TEST 4]${NC} Test endpoint /health..."

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$TTS_HEALTH_URL" || echo "CURL_ERROR")

if [[ "$HEALTH_RESPONSE" == *"CURL_ERROR"* ]]; then
    echo -e "${RED}❌ Erreur curl: Impossible de contacter $TTS_HEALTH_URL${NC}"
    exit 1
fi

HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Health check OK (HTTP 200)${NC}"
    echo -e "${BLUE}   Response:${NC}"
    echo "$HEALTH_BODY" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_BODY"
    
    # Extraire métriques
    MODEL_LOADED=$(echo "$HEALTH_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('model_loaded', False))" 2>/dev/null || echo "unknown")
    DEVICE=$(echo "$HEALTH_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('device', 'unknown'))" 2>/dev/null || echo "unknown")
    
    echo -e "${BLUE}   Model loaded: $MODEL_LOADED${NC}"
    echo -e "${BLUE}   Device: $DEVICE${NC}"
else
    echo -e "${RED}❌ Health check FAILED (HTTP $HTTP_CODE)${NC}"
    echo -e "${RED}   Response: $HEALTH_BODY${NC}"
    exit 1
fi

# ════════════════════════════════════════════════════════════════
# TEST 5: Synthèse TTS simple
# ════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[TEST 5]${NC} Test synthèse TTS..."

TEST_TEXT="Bonjour, je suis TITANE. Ceci est un test de synthèse vocale."
echo -e "${BLUE}   Texte: \"$TEST_TEXT\"${NC}"

# Requête TTS
START_TIME=$(date +%s%3N)

TTS_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$TTS_SYNTHESIZE_URL" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$TEST_TEXT\", \"format\": \"wav\"}" \
    --output "$AUDIO_OUTPUT" || echo "CURL_ERROR")

END_TIME=$(date +%s%3N)
LATENCY=$((END_TIME - START_TIME))

HTTP_CODE=$(echo "$TTS_RESPONSE" | tail -1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Synthèse TTS OK (HTTP 200)${NC}"
    echo -e "${BLUE}   Latency: ${LATENCY}ms${NC}"
    
    # Vérifier fichier audio
    if [ -f "$AUDIO_OUTPUT" ] && [ -s "$AUDIO_OUTPUT" ]; then
        AUDIO_SIZE=$(stat -f%z "$AUDIO_OUTPUT" 2>/dev/null || stat -c%s "$AUDIO_OUTPUT")
        echo -e "${GREEN}✅ Fichier audio créé: $AUDIO_OUTPUT ($AUDIO_SIZE bytes)${NC}"
        
        # Validation latence
        if [ $LATENCY -lt 3000 ]; then
            echo -e "${GREEN}✅ Latency < 3s (target P0-4)${NC}"
        else
            echo -e "${YELLOW}⚠️  Latency > 3s (slow but acceptable)${NC}"
        fi
    else
        echo -e "${RED}❌ Fichier audio vide ou manquant${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Synthèse TTS FAILED (HTTP $HTTP_CODE)${NC}"
    exit 1
fi

# ════════════════════════════════════════════════════════════════
# TEST 6: Nettoyage (si serveur lancé par ce script)
# ════════════════════════════════════════════════════════════════
if [ "$SERVER_ALREADY_RUNNING" = false ]; then
    echo -e "${YELLOW}[TEST 6]${NC} Arrêt serveur TTS (lancé par script)..."
    kill $TTS_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Serveur arrêté (PID $TTS_PID)${NC}"
else
    echo -e "${YELLOW}[TEST 6]${NC} Serveur TTS laissé en cours (était déjà démarré)${NC}"
fi

# ════════════════════════════════════════════════════════════════
# RAPPORT FINAL
# ════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║               P0-4 TEST SUCCESS ✅                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Résumé:${NC}"
echo -e "  ✅ Fichier serveur: $TTS_SERVER"
echo -e "  ✅ Health check: OK"
echo -e "  ✅ Synthèse TTS: OK (${LATENCY}ms)"
echo -e "  ✅ Audio généré: $AUDIO_OUTPUT"
echo ""
echo -e "${YELLOW}Prochaines étapes:${NC}"
echo -e "  1. Créer requirements.txt (voir rapport)"
echo -e "  2. Créer setup_parler_tts.sh (installation automatisée)"
echo -e "  3. Documenter rapport P0-4 ($REPORT_FILE)"
echo ""
echo -e "${BLUE}Pour écouter audio test:${NC}"
echo -e "  aplay $AUDIO_OUTPUT"
echo ""
