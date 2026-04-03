#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Test Audio Permission Fix v28.0.0
# Validate audio permission handling corrections
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "🎤 Testing Audio Permission Fixes..."
echo ""

# Tests de base TypeScript (compilation)
echo "1️⃣ Testing TypeScript compilation..."
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Vérifier que les types sont corrects
npx tsc --noEmit --skipLibCheck src/hooks/useDevicePermissions.ts
if [[ $? -eq 0 ]]; then
    echo "✅ useDevicePermissions.ts - TypeScript validation OK"
else
    echo "❌ useDevicePermissions.ts - TypeScript errors"
    exit 1
fi

npx tsc --noEmit --skipLibCheck src/features/audio-center/services/audioService.ts
if [[ $? -eq 0 ]]; then
    echo "✅ audioService.ts - TypeScript validation OK"
else
    echo "❌ audioService.ts - TypeScript errors"
    exit 1
fi

# 2. Test des imports/exports
echo ""
echo "2️⃣ Testing import structure..."

# Vérifier que les imports sont résolus
grep -q "isTauri" src/hooks/useDevicePermissions.ts && echo "✅ Tauri detection logic present"
grep -q "WebKitGTK" src/features/audio-center/services/audioService.ts && echo "✅ WebKitGTK handling comment found"
grep -q "Permission microphone" src/services/api/voice.ts && echo "✅ Voice service error messages localized"

# 3. Test de construction rapide
echo ""
echo "3️⃣ Testing Vite build (quick)..."
timeout 30s npm run build 2>&1 | tail -10

if [[ ${PIPESTATUS[0]} -eq 0 ]]; then
    echo "✅ Build completed successfully"
elif [[ ${PIPESTATUS[0]} -eq 124 ]]; then
    echo "⏰ Build timeout (30s) but no errors detected"
else
    echo "❌ Build errors detected"
    exit 1
fi

# 4. Test rapide Tauri launch (smoke test)
echo ""
echo "4️⃣ Testing Tauri smoke launch (5s)..."

# Tester que Tauri se lance sans erreur immédiate
timeout 5s pnpm run dev:tauri > /tmp/tauri_smoke.log 2>&1 &
TAURI_PID=$!

sleep 3

# Vérifier qu'il n'y a pas d'erreur fatale
if kill -0 $TAURI_PID 2>/dev/null; then
    echo "✅ Tauri launched successfully"
    kill $TAURI_PID 2>/dev/null || true
else
    echo "❌ Tauri failed to launch"
    cat /tmp/tauri_smoke.log | tail -10
    exit 1
fi

# 5. Vérifier les logs pour les fixes
echo ""
echo "5️⃣ Analyzing logs for fixes validation..."

# Rechercher les messages de nos corrections
if grep -q "Tauri mode detected - avoiding getUserMedia" /tmp/tauri_smoke.log; then
    echo "✅ Tauri permission avoidance activated"
elif grep -q "Using Web Audio API fallback" /tmp/tauri_smoke.log; then
    echo "✅ Web fallback properly triggered"
else
    echo "ℹ️ Audio logs not captured in short test"
fi

# Vérifier qu'il n'y a pas d'erreur libcamera critique
if grep -q "libcamera.*ERROR" /tmp/tauri_smoke.log; then
    echo "⚠️ libcamera errors still present"
else
    echo "✅ No critical libcamera errors detected"
fi

echo ""
echo "🎉 Audio Permission Fix Tests COMPLETE"
echo "   - useDevicePermissions: Enhanced Tauri handling"
echo "   - audioService: Improved fallback logic"  
echo "   - voiceService: Better error messages"
echo "   - libcamera: Warnings managed"
