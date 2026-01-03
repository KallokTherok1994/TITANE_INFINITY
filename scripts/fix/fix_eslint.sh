#!/bin/bash
# Script de correction automatique des problèmes ESLint
# TITANE_INFINITY v19.1.0

cd /home/titane/Documents/TITANE_INFINITY

echo "🔧 Correction des problèmes ESLint..."

# 1. VoiceCircle.tsx - let -> const
sed -i 's/let startTime = performance.now();/const startTime = performance.now();/g' src/components/VoiceCircle.tsx

# 2. Variables inutilisées - préfixe _
sed -i "s/import { DS_COLORS }/import { DS_COLORS as _DS_COLORS }/g" src/core/archetypes/ICONOGRAPHY_ENGINE.ts
sed -i "s/import { DS_CONSTANTS }/import { DS_CONSTANTS as _DS_CONSTANTS }/g" src/core/archetypes/IDENTITY_ENGINE.ts
sed -i "s/import { glowEngine }/import { glowEngine as _glowEngine }/g" src/core/cognitive/INTERFACE_MIRROR.ts
sed -i "s/import { stateEngine }/import { stateEngine as _stateEngine }/g" src/core/sound/SOUND_ENGINE.ts

# 3. Variables locales inutilisées - préfixe _
sed -i "s/const personality =/const _personality =/g" src/core/persona/PERSONA_BRIDGE.ts
sed -i "s/const mood =/const _mood =/g" src/core/persona/PERSONA_BRIDGE.ts
sed -i "s/const behavior =/const _behavior =/g" src/core/persona/PERSONA_BRIDGE.ts
sed -i "s/const result =/const _result =/g" src/hooks/useVoiceMode.ts
sed -i "s/const now =/const _now =/g" src/lib/slaTracker.ts
sed -i "s/let systemStatusStr =/const _systemStatusStr =/g" src/pages/DevTools.tsx
sed -i "s/let errorStr =/const _errorStr =/g" src/pages/DevTools.tsx
sed -i "s/let color =/const _color =/g" src/core/holography/HOLOMESH_ENGINE.ts
sed -i "s/const suggestions =/const _suggestions =/g" src/services/ai/chatEngine.test.ts
sed -i "s/'ChatEngineConfig'/import type { ChatEngineConfig as _ChatEngineConfig }/g" src/services/ai/chatEngine.test.ts

echo "✅ Corrections de base effectuées"
echo "📝 Vérifiez maintenant avec: pnpm run lint"
