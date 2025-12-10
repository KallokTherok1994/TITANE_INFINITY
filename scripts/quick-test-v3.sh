#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
#   TITANE∞ v∞ — QUICK TEST SCRIPT
#   Test rapide des nouvelles features
# ═══════════════════════════════════════════════════════════════════════════════

echo "🔍 TITANE∞ - Test Rapide des Features v∞.3"
echo "════════════════════════════════════════════"
echo ""

# Test 1: Fichiers créés
echo "📦 Fichiers créés:"
ls -1 src/features/dashboard/DashboardEditor.tsx 2>/dev/null && echo "  ✅ DashboardEditor.tsx" || echo "  ❌ DashboardEditor.tsx"
ls -1 src/hooks/useAudioChat.tsx 2>/dev/null && echo "  ✅ useAudioChat.tsx" || echo "  ❌ useAudioChat.tsx"
ls -1 src/components/chat/ChatBubble-ArcReactor.css 2>/dev/null && echo "  ✅ ChatBubble-ArcReactor.css" || echo "  ❌ ChatBubble-ArcReactor.css"
ls -1 src/types/web-speech-api.d.ts 2>/dev/null && echo "  ✅ web-speech-api.d.ts" || echo "  ❌ web-speech-api.d.ts"
ls -1 src/components/audio/ListeningIndicator.tsx 2>/dev/null && echo "  ✅ ListeningIndicator.tsx" || echo "  ❌ ListeningIndicator.tsx"

echo ""
echo "📝 Documentation:"
ls -1 *v∞.3.md 2>/dev/null | while read file; do
    echo "  ✅ $file ($(du -h "$file" | cut -f1))"
done

echo ""
echo "🔧 TypeScript (nouveaux fichiers):"
ERRORS=$(npx tsc --noEmit 2>&1 | grep -E "(useAudioChat|DashboardEditor|ChatProviderSelector|ListeningIndicator)" | wc -l)
if [ "$ERRORS" -eq 0 ]; then
    echo "  ✅ 0 erreur TypeScript"
else
    echo "  ⚠️  $ERRORS erreur(s) TypeScript"
fi

echo ""
echo "🎯 Intégrations:"
grep -q "ChatProviderSelector" src/features/chat/ChatInput.tsx 2>/dev/null && echo "  ✅ ChatProviderSelector → ChatInput" || echo "  ❌ ChatProviderSelector → ChatInput"
grep -q "ChatProviderSelector" src/components/chat/ChatBubble.tsx 2>/dev/null && echo "  ✅ ChatProviderSelector → ChatBubble" || echo "  ❌ ChatProviderSelector → ChatBubble"
grep -q "useAudioChat" src/components/chat/ChatBubble.tsx 2>/dev/null && echo "  ✅ useAudioChat → ChatBubble" || echo "  ❌ useAudioChat → ChatBubble"
grep -q "DashboardEditor" src/pages/DashboardPage.tsx 2>/dev/null && echo "  ✅ DashboardEditor → DashboardPage" || echo "  ❌ DashboardEditor → DashboardPage"

echo ""
echo "════════════════════════════════════════════"
echo "✅ Test rapide terminé !"
echo ""
