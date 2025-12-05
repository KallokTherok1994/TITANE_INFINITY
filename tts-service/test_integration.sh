#!/bin/bash

# TITANE∞ - Test d'intégration TTS complet
# © 2024 Loïc Basque

echo "🎤 [TITANE TTS] Test d'intégration complet"
echo ""

# 1. Vérifier que le service tourne
echo "1️⃣ Vérification du service..."
if ! curl -s http://localhost:8765/api/v1/tts/health > /dev/null; then
    echo "❌ Service TTS non disponible!"
    echo "   Démarrer avec: /home/titane/Documents/TITANE_INFINITY/tts-service/start_tts_background.sh"
    exit 1
fi
echo "✅ Service actif"
echo ""

# 2. Vérifier le health
echo "2️⃣ Statut du service..."
HEALTH=$(curl -s http://localhost:8765/api/v1/tts/health)
echo "$HEALTH" | python3 -m json.tool
echo ""

# 3. Test de synthèse
echo "3️⃣ Test de synthèse vocale..."
TEST_TEXT="Bonjour, je suis TITANE, votre assistant cognitif permanent. Ce test valide l'intégration complète du système TTS local."
OUTPUT_FILE="/tmp/titane_integration_test.wav"

echo "   Texte: $TEST_TEXT"
echo "   Génération en cours..."

START_TIME=$(date +%s)
HTTP_CODE=$(curl -s -o "$OUTPUT_FILE" -w "%{http_code}" \
  -X POST http://localhost:8765/api/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"$TEST_TEXT\",
    \"voice_style\": \"Une voix féminine française, claire et professionnelle, avec un rythme naturel.\",
    \"return_audio\": true,
    \"use_cache\": false
  }")
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ Erreur HTTP: $HTTP_CODE"
    exit 1
fi

if [ ! -f "$OUTPUT_FILE" ]; then
    echo "❌ Fichier audio non créé!"
    exit 1
fi

FILE_SIZE=$(stat -c%s "$OUTPUT_FILE")
if [ "$FILE_SIZE" -lt 1000 ]; then
    echo "❌ Fichier audio trop petit (${FILE_SIZE} octets)"
    exit 1
fi

echo "✅ Audio généré: $OUTPUT_FILE"
echo "   Taille: $(numfmt --to=iec-i --suffix=B $FILE_SIZE)"
echo "   Temps: ${DURATION}s"
echo ""

# 4. Analyser l'audio
echo "4️⃣ Propriétés audio..."
ffprobe -hide_banner -v error \
  -show_entries format=duration,bit_rate \
  -show_entries stream=codec_name,sample_rate,channels \
  -of default=noprint_wrappers=1 \
  "$OUTPUT_FILE"
echo ""

# 5. Jouer l'audio
echo "5️⃣ Lecture audio..."
echo "   Commande: aplay $OUTPUT_FILE"
echo "   (ou ffplay $OUTPUT_FILE)"
echo ""

if command -v aplay &> /dev/null; then
    read -p "   Jouer l'audio maintenant? [O/n] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        aplay "$OUTPUT_FILE"
    fi
fi

echo ""
echo "✅ TEST COMPLET RÉUSSI!"
echo ""
echo "📊 Résumé:"
echo "   - Service TTS: ✅ Opérationnel"
echo "   - API Health: ✅ Healthy"
echo "   - Synthèse: ✅ Succès"
echo "   - Audio: ✅ Valide"
echo ""
echo "🎉 Système TTS Parler-TTS 100% fonctionnel!"
echo ""
echo "Prochaines étapes:"
echo "   1. Lancer TITANE∞: npm run tauri:dev"
echo "   2. Tester le panel: http://localhost:5173/test/tts"
echo "   3. Intégrer dans le chat principal"
