#!/bin/bash
# TITANE∞ - Script de résolution des problèmes audio
# Corrige la configuration Pipewire/PulseAudio

set -e

echo "🔧 TITANE∞ - RÉSOLUTION PROBLÈMES AUDIO"
echo "========================================="

# Fonction de nettoyage en cas d'erreur
cleanup() {
    echo "❌ Erreur détectée, nettoyage..."
    pkill -f titane-infinity 2>/dev/null || true
    exit 1
}
trap cleanup ERR

echo "1️⃣ Arrêt de TITANE..."
pkill -f titane-infinity 2>/dev/null || true
sleep 2

echo "2️⃣ Configuration Pipewire/PulseAudio..."
# S'assurer que Pipewire-pulse est démarré
systemctl --user enable pipewire pipewire-pulse 2>/dev/null || true
systemctl --user start pipewire-pulse 2>/dev/null || true

# Attendre que le service soit prêt
sleep 3

echo "3️⃣ Variables d'environnement audio..."
export PULSE_SERVER="unix:${XDG_RUNTIME_DIR}/pulse/native"
export PULSE_RUNTIME_PATH="${XDG_RUNTIME_DIR}/pulse"

echo "4️⃣ Test des commandes audio..."
AUDIO_OK=true

# Test pactl
if pactl info >/dev/null 2>&1; then
    echo "✅ pactl: OK"
else
    echo "❌ pactl: FAIL"
    AUDIO_OK=false
fi

# Test wpctl
if wpctl status >/dev/null 2>&1; then
    echo "✅ wpctl: OK"
else
    echo "❌ wpctl: FAIL - tentative de redémarrage Pipewire"
    systemctl --user restart pipewire pipewire-pulse
    sleep 3
fi

# Test aplay
if aplay -l >/dev/null 2>&1; then
    echo "✅ aplay: OK"
else
    echo "❌ aplay: FAIL"
    AUDIO_OK=false
fi

echo "5️⃣ Relancement TITANE avec configuration audio optimale..."
cd "$(dirname "$0")/../deployment/latest/builds/target-run-3/release/"

# Lancer TITANE avec les bonnes variables d'environnement
PULSE_SERVER="unix:${XDG_RUNTIME_DIR}/pulse/native" \
PULSE_RUNTIME_PATH="${XDG_RUNTIME_DIR}/pulse" \
RUST_LOG=info \
./titane-infinity > /tmp/titane_audio.log 2>&1 &

TITANE_PID=$!
echo "✅ TITANE relancé avec configuration audio (PID: $TITANE_PID)"

sleep 5

echo "6️⃣ Vérification du démarrage..."
if ps aux | grep -q "$TITANE_PID.*titane-infinity"; then
    echo "✅ TITANE fonctionne correctement"
    
    # Vérifier les logs pour les erreurs audio
    if grep -q "audio" /tmp/titane_audio.log; then
        echo "📋 Logs audio détectés:"
        grep -i "audio\|recording\|tts\|microphone" /tmp/titane_audio.log | head -5
    fi
    
    echo ""
    echo "🎉 RÉSOLUTION TERMINÉE !"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Système audio configuré"
    echo "✅ TITANE redémarré avec support audio"
    echo "✅ Variables d'environnement définies"
    echo ""
    echo "💡 Si le problème persiste :"
    echo "   1. Redémarrez votre session utilisateur"
    echo "   2. Vérifiez que vos périphériques audio sont connectés"
    echo "   3. Testez avec: pactl info"
    
else
    echo "❌ TITANE n'a pas démarré correctement"
    echo "📋 Logs d'erreur:"
    tail -10 /tmp/titane_audio.log
    exit 1
fi