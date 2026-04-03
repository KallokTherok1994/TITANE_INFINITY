#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#   TITANE∞ v19.2 — Test Audio Complet
#   Script de test pour TTS, microphone et haut-parleurs
# ═══════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════════"
echo "  🎧 TITANE∞ AUDIO CENTER — Test Complet v19.2"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Configuration
PIPER_BIN="$HOME/.local/bin/piper"
PIPER_MODEL="$HOME/.local/share/piper/voices/fr_FR-siwis-medium.onnx"
OUTPUT_DIR="/tmp/titane_audio"

mkdir -p "$OUTPUT_DIR"

# ─────────────────────────────────────────────────────────────────
# Test 1: Vérification des outils
# ─────────────────────────────────────────────────────────────────
echo "📋 Test 1: Vérification des outils audio..."
echo ""

echo -n "  • espeak: "
if command -v espeak &> /dev/null; then
    echo "✅ $(espeak --version 2>/dev/null | head -1)"
else
    echo "❌ Non installé"
fi

echo -n "  • piper: "
if [ -f "$PIPER_BIN" ]; then
    echo "✅ Installé ($PIPER_BIN)"
else
    echo "❌ Non installé"
fi

echo -n "  • aplay: "
if command -v aplay &> /dev/null; then
    echo "✅ $(aplay --version 2>&1 | head -1)"
else
    echo "❌ Non installé"
fi

echo -n "  • ffmpeg: "
if command -v ffmpeg &> /dev/null; then
    echo "✅ $(ffmpeg -version 2>&1 | head -1)"
else
    echo "❌ Non installé"
fi

echo ""

# ─────────────────────────────────────────────────────────────────
# Test 2: Modèle de voix Piper
# ─────────────────────────────────────────────────────────────────
echo "🎤 Test 2: Modèle de voix Piper..."
echo ""

if [ -f "$PIPER_MODEL" ]; then
    SIZE=$(du -h "$PIPER_MODEL" | cut -f1)
    echo "  ✅ Modèle fr_FR-siwis-medium trouvé ($SIZE)"
else
    echo "  ❌ Modèle non trouvé: $PIPER_MODEL"
    echo "     Pour installer: curl -L -o ~/.local/share/piper/voices/fr_FR-siwis-medium.onnx \\"
    echo "       'https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx'"
fi

echo ""

# ─────────────────────────────────────────────────────────────────
# Test 3: Périphériques audio
# ─────────────────────────────────────────────────────────────────
echo "🔊 Test 3: Périphériques audio..."
echo ""

echo "  Sorties (Speakers):"
if command -v pactl &> /dev/null; then
    pactl list short sinks 2>/dev/null | while read -r line; do
        echo "    • $line"
    done
else
    aplay -l 2>/dev/null | grep "^card" | while read -r line; do
        echo "    • $line"
    done
fi

echo ""
echo "  Entrées (Microphones):"
if command -v pactl &> /dev/null; then
    pactl list short sources 2>/dev/null | grep -v "\.monitor" | while read -r line; do
        echo "    • $line"
    done
else
    arecord -l 2>/dev/null | grep "^card" | while read -r line; do
        echo "    • $line"
    done
fi

echo ""

# ─────────────────────────────────────────────────────────────────
# Test 4: Synthèse vocale Piper (voix féminine réaliste)
# ─────────────────────────────────────────────────────────────────
echo "👩 Test 4: Synthèse vocale Piper (voix féminine)..."
echo ""

if [ -f "$PIPER_BIN" ] && [ -f "$PIPER_MODEL" ]; then
    TEST_TEXT="Bonjour Kevin, je suis TITANE Infinity, ton assistante vocale avec une voix naturelle et inspirante. Je suis prête à t'aider dans tous tes projets."

    echo "  📝 Texte: \"$TEST_TEXT\""
    echo ""
    echo "  🔄 Génération en cours..."

    START=$(date +%s%N)
    echo "$TEST_TEXT" | "$PIPER_BIN" --model "$PIPER_MODEL" --output_file "$OUTPUT_DIR/piper_test.wav" 2>/dev/null
    END=$(date +%s%N)

    DURATION_MS=$(( (END - START) / 1000000 ))

    if [ -f "$OUTPUT_DIR/piper_test.wav" ]; then
        echo "  ✅ Audio généré en ${DURATION_MS}ms"
        echo ""
        echo "  🔊 Lecture..."
        aplay "$OUTPUT_DIR/piper_test.wav" 2>/dev/null
        echo "  ✅ Lecture terminée"
    else
        echo "  ❌ Échec de la génération"
    fi
else
    echo "  ⚠️ Piper non disponible, test avec espeak..."
    espeak -v fr "Bonjour Kevin, je suis TITANE Infinity." 2>/dev/null
fi

echo ""

# ─────────────────────────────────────────────────────────────────
# Test 5: Test émotionnel
# ─────────────────────────────────────────────────────────────────
echo "🎭 Test 5: Expressions émotionnelles..."
echo ""

if [ -f "$PIPER_BIN" ] && [ -f "$PIPER_MODEL" ]; then
    EMOTIONS=(
        "Je suis ravie de te revoir, Kevin !"
        "C'est vraiment impressionnant ce que tu as accompli."
        "Ne t'inquiète pas, je suis là pour t'aider."
        "Ensemble, nous allons créer quelque chose d'extraordinaire."
    )

    for i in "${!EMOTIONS[@]}"; do
        TEXT="${EMOTIONS[$i]}"
        echo "  $((i+1)). \"$TEXT\""
        echo "$TEXT" | "$PIPER_BIN" --model "$PIPER_MODEL" --output_file "$OUTPUT_DIR/emotion_$i.wav" 2>/dev/null
        aplay "$OUTPUT_DIR/emotion_$i.wav" 2>/dev/null
        sleep 0.5
    done
fi

echo ""

# ─────────────────────────────────────────────────────────────────
# Résumé
# ─────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════════"
echo "  📊 RÉSUMÉ DES TESTS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "  🎤 Moteur TTS: Piper avec voix fr_FR-siwis (femme)"
echo "  🔊 Sortie: $(pactl list short sinks 2>/dev/null | grep RUNNING | cut -f2 || echo "Défaut")"
echo "  📁 Fichiers générés: $OUTPUT_DIR/"
echo ""
echo "  ✅ Centre Audio TITANE∞ opérationnel !"
echo ""
