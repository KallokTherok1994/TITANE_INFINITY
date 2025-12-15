#!/bin/bash
# Quick network validation (no tunnel, just local/LAN)

echo "🧪 QUICK NETWORK TEST"
echo "===================="
echo ""

echo "TAURI-ONLY: pas de serveur HTTP frontend à tester (skip)"
echo "Ouvrez Titan-Dev (fenêtre Tauri) pour valider l'UI."
exit 0

LOCAL_IP=$(hostname -I | awk '{print $1}')
PASS=0
FAIL=0


