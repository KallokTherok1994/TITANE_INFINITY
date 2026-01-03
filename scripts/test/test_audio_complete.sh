#!/bin/bash

# TITANE∞ - Script de Test Audio Complet
# © 2024 Loïc Basque

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🎤 TITANE∞ - TEST SYSTÈME AUDIO COMPLET                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TTS_SERVICE="$SCRIPT_DIR/tts-service"
TEST_OUTPUT="/tmp/titane_audio_tests"

mkdir -p "$TEST_OUTPUT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

test_result() {
    local test_name="$1"
    local result="$2"
    local message="$3"

    if [ "$result" == "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASS${NC}"
        ((TESTS_PASSED++))
    elif [ "$result" == "FAIL" ]; then
        echo -e "${RED}❌ $test_name: FAIL - $message${NC}"
        ((TESTS_FAILED++))
    else
        echo -e "${YELLOW}⏸️  $test_name: SKIP - $message${NC}"
        ((TESTS_SKIPPED++))
    fi
}

echo "═══════════════════════════════════════════════════════════════"
echo "1️⃣  TEST SERVICE TTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 1.1: Service TTS actif
echo "Test 1.1: Vérifier service TTS..."
if curl -s http://localhost:8765/api/v1/tts/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:8765/api/v1/tts/health)
    if echo "$HEALTH" | grep -q '"status":"healthy"'; then
        test_result "Service TTS Health" "PASS"
    else
        test_result "Service TTS Health" "FAIL" "Status not healthy"
    fi
else
    test_result "Service TTS Health" "FAIL" "Service not reachable"
fi

# Test 1.2: Modèle chargé
echo "Test 1.2: Vérifier modèle chargé..."
if HEALTH=$(curl -s http://localhost:8765/api/v1/tts/health); then
    if echo "$HEALTH" | grep -q '"model_loaded":true'; then
        test_result "Modèle Parler-TTS" "PASS"
    else
        test_result "Modèle Parler-TTS" "FAIL" "Model not loaded"
    fi
else
    test_result "Modèle Parler-TTS" "SKIP" "Service non disponible"
fi

# Test 1.3: Synthèse simple
echo "Test 1.3: Synthèse vocale simple..."
TEST_TEXT="Test audio TITANE."
OUTPUT_FILE="$TEST_OUTPUT/test_tts_simple.wav"

HTTP_CODE=$(curl -s -o "$OUTPUT_FILE" -w "%{http_code}" \
  -X POST http://localhost:8765/api/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEST_TEXT\", \"return_audio\": true, \"use_cache\": false}")

if [ "$HTTP_CODE" == "200" ] && [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(stat -c%s "$OUTPUT_FILE")
    if [ "$FILE_SIZE" -gt 1000 ]; then
        test_result "Synthèse TTS Simple" "PASS"
        echo "   Fichier: $OUTPUT_FILE ($(numfmt --to=iec-i --suffix=B $FILE_SIZE))"
    else
        test_result "Synthèse TTS Simple" "FAIL" "File too small: ${FILE_SIZE}B"
    fi
else
    test_result "Synthèse TTS Simple" "FAIL" "HTTP $HTTP_CODE or file missing"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "2️⃣  TEST BACKEND AUDIO (TAURI)"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 2.1: Vérifier app Tauri en cours
echo "Test 2.1: Vérifier application Tauri..."
if pgrep -f "titane_infinity" > /dev/null; then
    test_result "Application Tauri" "PASS"
else
    test_result "Application Tauri" "SKIP" "App not running (lancer: pnpm run tauri:dev)"
fi

# Test 2.2: Test microphone (nécessite Tauri)
echo "Test 2.2: Test microphone backend..."
if pgrep -f "titane_infinity" > /dev/null; then
    echo "   ⚠️  Test manuel requis:"
    echo "   1. Ouvrir l'application Titan-Dev (fenêtre Tauri)"
    echo "   2. Activer mode vocal (🎤)"
    echo "   3. Vérifier visualisation audio"
    test_result "Microphone Backend" "SKIP" "Test manuel requis"
else
    test_result "Microphone Backend" "SKIP" "Tauri non démarré"
fi

# Test 2.3: Test STT (Speech-to-Text)
echo "Test 2.3: Test reconnaissance vocale STT..."
if pgrep -f "titane_infinity" > /dev/null; then
    echo "   ⚠️  Test manuel requis:"
    echo "   1. Mode vocal activé"
    echo "   2. Parler: 'Bonjour TITANE'"
    echo "   3. Vérifier transcription affichée"
    test_result "STT Backend" "SKIP" "Test manuel requis"
else
    test_result "STT Backend" "SKIP" "Tauri non démarré"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "3️⃣  TEST MÉMOIRE CONVERSATIONNELLE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 3.1: localStorage disponible
echo "Test 3.1: Vérifier localStorage (via navigateur)..."
echo "   ⚠️  Test manuel requis:"
echo "   1. Ouvrir DevTools (F12)"
echo "   2. Console: localStorage.getItem('titane_chat_history')"
echo "   3. Vérifier retour JSON ou null"
test_result "localStorage Access" "SKIP" "Test manuel requis"

# Test 3.2: Persistance messages
echo "Test 3.2: Test persistance messages..."
echo "   ⚠️  Test manuel requis:"
echo "   1. Envoyer 3 messages dans le chat"
echo "   2. Fermer l'application"
echo "   3. Rouvrir et vérifier messages présents"
test_result "Persistance Messages" "SKIP" "Test manuel requis"

# Test 3.3: Compaction auto
echo "Test 3.3: Compaction auto mémoire..."
echo "   ⚠️  Test manuel (optionnel):"
echo "   1. Remplir >5MB de messages"
echo "   2. Vérifier console pour 'SELFHEAL++: Memory cleaned'"
test_result "Compaction Auto" "SKIP" "Test optionnel"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "4️⃣  TEST INTÉGRATION CHAT IA"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 4.1: Chat interface
echo "Test 4.1: Interface chat accessible..."
if pgrep -f "titane_infinity" > /dev/null; then
    test_result "Chat Interface" "SKIP" "TAURI-ONLY (pas de check HTTP); valider dans la fenêtre"
else
    test_result "Chat Interface" "SKIP" "App not running"
fi

# Test 4.2: Envoi message
echo "Test 4.2: Envoi message IA..."
echo "   ⚠️  Test manuel requis:"
echo "   1. Accéder à /chat dans la fenêtre Tauri"
echo "   2. Envoyer: 'Bonjour TITANE'"
echo "   3. Vérifier réponse en <3s"
test_result "Envoi Message IA" "SKIP" "Test manuel requis"

# Test 4.3: Multi-providers
echo "Test 4.3: Support multi-providers..."
echo "   ⚠️  Test manuel requis:"
echo "   1. Changer provider (auto/local/ollama)"
echo "   2. Envoyer message avec chaque provider"
echo "   3. Vérifier réponses"
test_result "Multi-Providers" "SKIP" "Test manuel requis"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "5️⃣  TEST CONVERSATION AUDIO COMPLÈTE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 5.1: Mode vocal activable
echo "Test 5.1: Activation mode vocal..."
echo "   ⚠️  Test manuel requis:"
echo "   1. Cliquer bouton 🎤"
echo "   2. Vérifier changement d'état"
test_result "Activation Mode Vocal" "SKIP" "Test manuel requis"

# Test 5.2: Boucle conversation
echo "Test 5.2: Boucle conversationnelle..."
echo "   ⚠️  Test manuel requis:"
echo "   Scénario complet:"
echo "   1. Activer mode vocal"
echo "   2. Dire: 'Bonjour TITANE'"
echo "   3. Attendre réponse vocale"
echo "   4. Dire: 'Je m'appelle Kevin'"
echo "   5. Attendre réponse"
echo "   6. Dire: 'Comment je m'appelle ?'"
echo "   7. Vérifier: TITANE répond 'Kevin'"
test_result "Boucle Conversation" "SKIP" "Test manuel complet requis"

# Test 5.3: Auto-continue
echo "Test 5.3: Auto-continue conversation..."
echo "   ⚠️  Test manuel requis:"
echo "   1. Mode vocal avec autoContinue=true"
echo "   2. Parler → attendre réponse → silence"
echo "   3. Vérifier: mode écoute se réactive automatiquement"
test_result "Auto-Continue" "SKIP" "Test manuel requis"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "6️⃣  TEST PERFORMANCE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 6.1: Latence TTS
echo "Test 6.1: Mesure latence TTS..."
TEST_TEXT="Ceci est un test de latence pour la synthèse vocale TITANE."
OUTPUT_FILE="$TEST_OUTPUT/test_latency.wav"

START=$(date +%s)
curl -s -X POST http://localhost:8765/api/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEST_TEXT\", \"return_audio\": true, \"use_cache\": false}" \
  > "$OUTPUT_FILE" 2>/dev/null
END=$(date +%s)
DURATION=$((END - START))

if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    AUDIO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_FILE" 2>/dev/null)
    if [ -n "$AUDIO_DURATION" ]; then
        RATIO=$(echo "scale=1; $DURATION / $AUDIO_DURATION" | bc)
        echo "   Latence: ${DURATION}s pour ${AUDIO_DURATION}s audio (ratio: ${RATIO}x)"
        if (( $(echo "$RATIO < 3.0" | bc -l) )); then
            test_result "Latence TTS" "PASS"
        else
            test_result "Latence TTS" "FAIL" "Ratio ${RATIO}x trop élevé (>3x)"
        fi
    else
        test_result "Latence TTS" "SKIP" "Cannot measure audio duration"
    fi
else
    test_result "Latence TTS" "FAIL" "Generation failed"
fi

# Test 6.2: Qualité audio
echo "Test 6.2: Qualité audio..."
if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    SAMPLE_RATE=$(ffprobe -v error -show_entries stream=sample_rate -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_FILE" 2>/dev/null)
    BIT_DEPTH=$(ffprobe -v error -show_entries stream=bits_per_raw_sample -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_FILE" 2>/dev/null)

    if [ "$SAMPLE_RATE" == "44100" ]; then
        echo "   Sample rate: ${SAMPLE_RATE}Hz ✅"
        test_result "Qualité Audio" "PASS"
    else
        echo "   Sample rate: ${SAMPLE_RATE}Hz ⚠️"
        test_result "Qualité Audio" "FAIL" "Sample rate not 44.1kHz"
    fi
else
    test_result "Qualité Audio" "SKIP" "No audio file"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 RÉSULTATS FINAUX"
echo "═══════════════════════════════════════════════════════════════"
echo ""

TOTAL=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))

echo "Tests exécutés: $TOTAL"
echo -e "${GREEN}✅ Réussis: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Échoués: $TESTS_FAILED${NC}"
echo -e "${YELLOW}⏸️  Ignorés: $TESTS_SKIPPED${NC}"
echo ""

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}⚠️  ATTENTION: $TESTS_FAILED test(s) échoué(s)${NC}"
    echo ""
    echo "Actions recommandées:"
    if ! curl -s http://localhost:8765/api/v1/tts/health > /dev/null 2>&1; then
        echo "  1. Démarrer service TTS: ./tts-service/start_tts_background.sh"
    fi
    if ! pgrep -f "titane_infinity" > /dev/null; then
        echo "  2. Démarrer application: pnpm run tauri:dev"
    fi
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ Tous les tests automatiques ont réussi!${NC}"
    echo ""
    if [ $TESTS_SKIPPED -gt 0 ]; then
        echo -e "${YELLOW}ℹ️  $TESTS_SKIPPED test(s) nécessitent validation manuelle${NC}"
        echo ""
        echo "Tests manuels recommandés:"
        echo "  1. Mode vocal: Activer et tester conversation complète"
        echo "  2. STT: Vérifier transcription vocale"
        echo "  3. Mémoire: Vérifier persistance après redémarrage"
        echo "  4. Chat: Envoyer messages et vérifier réponses"
        echo ""
        echo "Voir: CHAT_MEMORY_AUDIO_AUDIT_v24.1.md pour détails"
    fi
    echo ""
    exit 0
fi
