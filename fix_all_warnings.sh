#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# TITANE∞ vΩ — Script de Correction Automatique des Warnings TypeScript
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

echo "🔧 SINGULARITY-FUSION vΩ — Correction Automatique des Warnings"
echo "════════════════════════════════════════════════════════════════"

# Capturer tous les warnings
npm run type-check 2>&1 | tee /tmp/ts_warnings.txt || true

# Compter warnings initiaux
INITIAL_COUNT=$(grep -c "error TS" /tmp/ts_warnings.txt || echo "0")
echo "📊 Warnings détectés : $INITIAL_COUNT"
echo ""

# ═══════════════════════════════════════════════════════════════════
# PHASE 1 : Variables non utilisées (TS6133/TS6138)
# ═══════════════════════════════════════════════════════════════════

echo "📌 Phase 1/4 : Suppression imports inutiles..."

# Supprimer React inutile dans AppTestMinimal
if grep -q "^import React from" src/AppTestMinimal.tsx 2>/dev/null; then
  sed -i "/^import React from 'react';$/d" src/AppTestMinimal.tsx
  echo "  ✅ AppTestMinimal.tsx"
fi

# Supprimer secureInvoke inutile dans ExpPanel
if grep -q "import { secureInvoke }" src/components/experience/ExpPanel.tsx 2>/dev/null; then
  sed -i "/import { secureInvoke } from '@\/lib\/security';/d" src/components/experience/ExpPanel.tsx
  echo "  ✅ ExpPanel.tsx"
fi

# Supprimer invoke dans LocalAgentEngine ligne 26
if sed -n '26p' src/core/devops/LocalAgentEngine.ts 2>/dev/null | grep -q "import { invoke }"; then
  sed -i '26d' src/core/devops/LocalAgentEngine.ts
  echo "  ✅ LocalAgentEngine.ts"
fi

# Supprimer SingularityState inutile dans AutoHealEngine
if grep -q "import.*SingularityState" src/core/healing/AutoHealEngine.ts 2>/dev/null; then
  sed -i "/SingularityState,/d" src/core/healing/AutoHealEngine.ts || \
  sed -i "s/import { SingularityState } from.*;//" src/core/healing/AutoHealEngine.ts
  echo "  ✅ AutoHealEngine.ts"
fi

# Supprimer SingularityState dans CrashGuardEngine
if grep -q "import.*SingularityState" src/core/safety/CrashGuardEngine.ts 2>/dev/null; then
  sed -i "/SingularityState,/d" src/core/safety/CrashGuardEngine.ts || \
  sed -i "s/import { SingularityState } from.*;//" src/core/safety/CrashGuardEngine.ts
  echo "  ✅ CrashGuardEngine.ts"
fi

echo ""
echo "📌 Phase 2/4 : Préfixage variables non utilisées..."

# Fonction helper pour préfixer une variable
prefix_unused_var() {
  local file=$1
  local line=$2
  local varname=$3

  if [[ -f "$file" ]]; then
    # Si déjà préfixé, skip
    if sed -n "${line}p" "$file" | grep -q "_${varname}"; then
      return 0
    fi

    # Préfixer
    sed -i "${line}s/\b${varname}\b/_${varname}/" "$file"
    echo "  ✅ $(basename $file):${line} → _${varname}"
  fi
}

# Variables à préfixer (fichier:ligne:nom)
prefix_unused_var "src/core/devops/LocalAgentEngine.ts" 655 "target"
prefix_unused_var "src/core/devops/LocalAgentEngine.ts" 927 "path"
prefix_unused_var "src/core/devops/VisualDevOpsEngine.ts" 203 "contextHint"
prefix_unused_var "src/core/devops/VisualDevOpsEngine.ts" 594 "analysis"
prefix_unused_var "src/core/devops/VisualDevOpsEngine.ts" 664 "analysis"
prefix_unused_var "src/core/healing/AutoFixEngine.ts" 281 "issue"
prefix_unused_var "src/core/healing/AutoFixEngine.ts" 295 "issue"
prefix_unused_var "src/core/healing/AutoFixEngine.ts" 300 "issue"
prefix_unused_var "src/core/optimization/PerformanceOptimizer.ts" 101 "optimizationInterval"
prefix_unused_var "src/core/pipelines/UnifiedCognitivePipeline.ts" 511 "error"
prefix_unused_var "src/core/realtime/RealTimeExecutionEngine.ts" 163 "targetFPS"
prefix_unused_var "src/core/singularity/SingularityFusionEngine.ts" 430 "intention"
prefix_unused_var "src/modules/avatar/floating/AvatarFloatingWindow.tsx" 76 "_fullBodyAvatar"
prefix_unused_var "src/modules/avatar/floating/ThreeJSAvatarRenderer.ts" 52 "usePostProcessing"
prefix_unused_var "src/modules/avatar/floating/appearanceFloatingIntegration.ts" 75 "renderer"
prefix_unused_var "src/modules/avatar/fullbody/fullbody_engine.ts" 81 "targetFPS"
prefix_unused_var "src/modules/avatar/lipsync/LipSyncPrecisionEngine.ts" 268 "phonemeHistory"
prefix_unused_var "src/modules/avatar/lipsync/LipSyncPrecisionEngine.ts" 269 "lastUpdateTime"
prefix_unused_var "src/modules/avatar/performance/PerformanceMonitor.ts" 252 "targetFps"
prefix_unused_var "src/modules/avatar/rendering/PBRMaterialSystem.ts" 80 "textureLoader"
prefix_unused_var "src/services/api/voice.ts" 72 "config"
prefix_unused_var "src/services/autoAuditEngine.ts" 222 "_response"
prefix_unused_var "src/services/singularityBridge.ts" 391 "_newKnowledge"
prefix_unused_var "src/services/tts/hybridTTS.ts" 38 "currentUtterance"

# Préfixer constantes non utilisées
prefix_unused_var "src/core/ai/agents/watchdog_agent.ts" 50 "MAX_LOAD_SUSTAINED"
prefix_unused_var "src/core/devops/VisualDevOpsEngine.ts" 51 "MAX_SESSION_DURATION_MS"
prefix_unused_var "src/modules/avatar/appearance/styleLanguageParser.ts" 82 "MODULATOR_KEYWORDS"
prefix_unused_var "src/services/ai/providers/fallback.ts" 21 "_FALLBACK_RESPONSES"
prefix_unused_var "src/services/chatMemoryCompactor.ts" 21 "_MAX_MESSAGES_PER_MODE"

echo ""
echo "📌 Phase 3/4 : Correction des erreurs de types..."

# Corrections spécifiques aux types
echo "  (Nécessite éditions manuelles précises — skip pour l'instant)"

echo ""
echo "📌 Phase 4/4 : Vérification finale..."

# Recompiler
npm run type-check 2>&1 | tee /tmp/ts_warnings_after.txt || true

FINAL_COUNT=$(grep -c "error TS" /tmp/ts_warnings_after.txt || echo "0")
FIXED=$((INITIAL_COUNT - FINAL_COUNT))

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✨ RÉSULTAT FINAL :"
echo "   Warnings initiaux : $INITIAL_COUNT"
echo "   Warnings résolus  : $FIXED"
echo "   Warnings restants : $FINAL_COUNT"
echo "════════════════════════════════════════════════════════════════"

if [ "$FINAL_COUNT" -eq 0 ]; then
  echo "🎯 PERFECTION ! ZÉRO WARNING — SINGULARITY-FUSION vΩ COMPLETE"
else
  echo "⚠️  Warnings restants nécessitent corrections manuelles"
  echo ""
  echo "Détails : /tmp/ts_warnings_after.txt"
fi
