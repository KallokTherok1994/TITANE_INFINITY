#!/usr/bin/env bash
# TITANE_INFINITY v27.0.1 — Proprietary License
# © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
#
# GATE B: Smoke Boot Prod (Headless Log-Driven)
# But: Vérifier que l'UI se monte correctement en production (AppImage)
# Critère: stdout doit contenir "[BOOT] after render" en < 12s
# Status: BLOQUANT (exit 1 si timeout ou marker absent)

set -euo pipefail

TIMEOUT=12
LOG_FILE="/tmp/titane_gate_prod_boot.log"
APPIMAGE_PATH="src-tauri/target/release/bundle/appimage"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  GATE B: Smoke Boot Prod (AppImage)                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 1. Vérifier présence AppImage
if [ ! -d "$APPIMAGE_PATH" ]; then
  echo "❌ FAIL: Répertoire AppImage introuvable"
  echo "   Path: $APPIMAGE_PATH"
  echo "   Exécutez 'pnpm run tauri build' avant ce gate."
  echo ""
  exit 1
fi

APPIMAGE=$(find "$APPIMAGE_PATH" -name "*.AppImage" -type f | head -1)

if [ -z "$APPIMAGE" ]; then
  echo "❌ FAIL: Aucune AppImage trouvée dans $APPIMAGE_PATH"
  echo "   Exécutez 'pnpm run tauri build' avant ce gate."
  echo ""
  exit 1
fi

echo "📦 AppImage trouvée: $APPIMAGE"

# 2. Rendre exécutable
chmod +x "$APPIMAGE"

# 3. Lancer AppImage en background avec timeout
echo "🚀 Démarrage AppImage (timeout ${TIMEOUT}s)..."
rm -f "$LOG_FILE"

RUST_BACKTRACE=1 RUST_LOG=info timeout "$TIMEOUT" "$APPIMAGE" > "$LOG_FILE" 2>&1 &
PID=$!

echo "   PID: $PID"
echo "   Log: $LOG_FILE"

# 4. Attendre timeout ou succès
sleep "$TIMEOUT" || true

# 5. Tuer proprement le processus
kill -TERM "$PID" 2>/dev/null || true
sleep 1
kill -KILL "$PID" 2>/dev/null || true

# 6. Vérifier présence du marker de boot
if grep -q "\[BOOT\] after render" "$LOG_FILE"; then
  echo ""
  echo "✅ PASS: UI montée avec succès (marker détecté)"
  echo "         Log complet: $LOG_FILE"
  echo ""
  exit 0
else
  echo ""
  echo "❌ FAIL: UI non montée après ${TIMEOUT}s"
  echo ""
  echo "🔍 DIAGNOSTIC:"
  echo "   - Marker attendu: [BOOT] after render"
  echo "   - Log complet: $LOG_FILE"
  echo ""
  echo "📋 Dernières lignes du log:"
  tail -30 "$LOG_FILE" || echo "(log vide ou inaccessible)"
  echo ""
  echo "🔧 PROCHAINES ÉTAPES:"
  echo "   1. Vérifiez dist/index.html (assets relatifs)"
  echo "   2. Vérifiez erreurs JS dans le log"
  echo "   3. Testez manuellement: $APPIMAGE"
  echo ""
  exit 1
fi
