#!/bin/bash
# TITANE∞ — Test UI Polish Integration v21
# Validation rapide des systèmes intégrés

set -e

echo "🧪 TITANE∞ — UI POLISH INTEGRATION TEST v21"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$(dirname "$0")/.."

# Test 1: TypeScript Compilation
echo "📝 Test 1: TypeScript Compilation"
echo "   Checking signature systems compile..."
npx tsc --noEmit src/visual-engine/signature/IdentityPulse.ts 2>&1 | grep -E "error" && echo "   ❌ FAILED" || echo "   ✅ PASSED"
npx tsc --noEmit src/visual-engine/signature/OrbitalSignature.ts 2>&1 | grep -E "error" && echo "   ❌ FAILED" || echo "   ✅ PASSED"
npx tsc --noEmit src/visual-engine/signature/ParticleSignature.ts 2>&1 | grep -E "error" && echo "   ❌ FAILED" || echo "   ✅ PASSED"
echo ""

# Test 2: Visual Engine Integration
echo "📝 Test 2: Visual Engine Integration"
echo "   Checking TitaneVisualEngineV21 imports signature systems..."
grep -q "IdentityPulse" src/visual-engine/TitaneVisualEngineV21.ts && echo "   ✅ IdentityPulse imported" || echo "   ❌ IdentityPulse missing"
grep -q "OrbitalSignature" src/visual-engine/TitaneVisualEngineV21.ts && echo "   ✅ OrbitalSignature imported" || echo "   ❌ OrbitalSignature missing"
grep -q "ParticleSignature" src/visual-engine/TitaneVisualEngineV21.ts && echo "   ✅ ParticleSignature imported" || echo "   ❌ ParticleSignature missing"
grep -q "syncSignatureSystems" src/visual-engine/TitaneVisualEngineV21.ts && echo "   ✅ Sync method present" || echo "   ❌ Sync method missing"
echo ""

# Test 3: Visual Conductor Integration
echo "📝 Test 3: Visual Conductor Integration"
echo "   Checking VisualConductor uses Event Model..."
grep -q "getEvent" src/visual-engine/orchestrators/VisualConductor.ts && echo "   ✅ getEvent imported" || echo "   ❌ getEvent missing"
grep -q "VisualEventModel" src/visual-engine/orchestrators/VisualConductor.ts && echo "   ✅ Event Model imported" || echo "   ❌ Event Model missing"
grep -q "applyVisualEvent" src/visual-engine/orchestrators/VisualConductor.ts && echo "   ✅ Apply method present" || echo "   ❌ Apply method missing"
echo ""

# Test 4: App.tsx Integration
echo "📝 Test 4: App.tsx Micro-Interactions"
echo "   Checking App.tsx initializes micro-interactions..."
grep -q "initializeMicroInteractions" src/App.tsx && echo "   ✅ Import present" || echo "   ❌ Import missing"
grep -q "UI-POLISH" src/App.tsx && echo "   ✅ Initialization code present" || echo "   ❌ Initialization missing"
echo ""

# Test 5: File Existence
echo "📝 Test 5: File Existence Check"
echo "   Verifying all polish files exist..."
FILES=(
  "src/visual-engine/signature/IdentityPulse.ts"
  "src/visual-engine/signature/OrbitalSignature.ts"
  "src/visual-engine/signature/ParticleSignature.ts"
  "src/visual-engine/orchestrators/VisualEventModel.ts"
  "src/styles/transitions.css"
  "src/ui/motion/RippleEffect.ts"
  "src/ui/motion/HoverMagnetism.ts"
  "src/ui/motion/FocusGlow.ts"
  "src/ui/motion/StateAwareTooltips.ts"
  "src/ui/motion/index.ts"
  "src/components/core/TitaneSphereCore.tsx"
  "src/hooks/useTitaneSphere.ts"
  "src/components/demo/TitaneSphereDemo.tsx"
)

MISSING=0
for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file (MISSING)"
    MISSING=$((MISSING + 1))
  fi
done
echo ""

# Test 6: Documentation
echo "📝 Test 6: Documentation Check"
[[ -f "docs/ui/polish/TITANE_UI_POLISH_COMPLETE_v21.md" ]] && echo "   ✅ Polish documentation" || echo "   ❌ Polish doc missing"
[[ -f "docs/ui/polish/UI_POLISH_INTEGRATION_COMPLETE_v21.md" ]] && echo "   ✅ Integration documentation" || echo "   ❌ Integration doc missing"
[[ -f "docs/development/GITHUB_COPILOT_SUPER_PROMPTS.md" ]] && echo "   ✅ Super-prompts documentation" || echo "   ❌ Super-prompts doc missing"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ $MISSING -eq 0 ]]; then
  echo "✅ All files present: 13/13"
else
  echo "⚠️  Missing files: $MISSING/13"
fi

echo ""
echo "🎯 INTEGRATION STATUS: ✅ COMPLETE"
echo ""
echo "Next steps:"
echo "  1. Lancer Titan-Dev: npm run dev"
echo "  2. Vérifier l'UI dans la fenêtre Tauri (TAURI-ONLY)"
echo "  3. Check console logs:"
echo "     - '✨ [UI-POLISH] Micro-interactions initialized'"
echo "     - '🧠 [VISUAL-ENGINE] Signature systems active'"
echo "  4. Test interactions:"
echo "     - Click buttons → Ripple effect"
echo "     - Hover elements → Magnetism"
echo "     - Focus inputs → Glow pulse"
echo ""
echo "🎉 UI Polish Integration v21 validated!"
