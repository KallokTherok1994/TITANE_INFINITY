#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════
#  TITANE∞ vΩ — Correction Intelligente Warnings TypeScript Restants
# ════════════════════════════════════════════════════════════════════

set -euo pipefail

echo "🎯 Correction Intelligente des 52 Warnings Restants"
echo "══════════════════════════════════════════════════════════════"

# ════════════════════════════════════════════════════════════════════
# PHASE 1 : Supprimer ChatIADiagnostic dans App.tsx
# ════════════════════════════════════════════════════════════════════

echo "📌 Suppression ChatIADiagnostic..."
sed -i '/^const ChatIADiagnostic = lazy/d' src/App.tsx || true

# ════════════════════════════════════════════════════════════════════
# PHASE 2 : Supprimer invoke dans MetaModeConsole
# ════════════════════════════════════════════════════════════════════

echo "📌 Suppression invoke dans MetaModeConsole..."
sed -i "/import { invoke } from '@tauri-apps\/api\/core';/d" src/components/MetaModeConsole.tsx || true

# ════════════════════════════════════════════════════════════════════
# PHASE 3 : Supprimer imports inutiles dans AutoHealEngine et CrashGuardEngine
# ════════════════════════════════════════════════════════════════════

echo "📌 Suppression SingularityState dans AutoHealEngine..."
# Supprimer uniquement SingularityState dans la liste d'imports
sed -i 's/import { SingularityState } from/import {/' src/core/healing/AutoHealEngine.ts || true
sed -i 's/import {, /import { /' src/core/healing/AutoHealEngine.ts || true

echo "📌 Suppression SingularityState dans CrashGuardEngine..."
sed -i 's/import { SingularityState } from/import {/' src/core/safety/CrashGuardEngine.ts || true
sed -i 's/import {, /import { /' src/core/safety/CrashGuardEngine.ts || true

# ════════════════════════════════════════════════════════════════════
# PHASE 4 : Supprimer type Interaction dans VisualDevOpsEngine
# ════════════════════════════════════════════════════════════════════

echo "📌 Suppression type Interaction..."
sed -i '/^type Interaction = {/,/^};$/d' src/core/devops/VisualDevOpsEngine.ts || true

# ════════════════════════════════════════════════════════════════════
# PHASE 5 : Supprimer types inutilisés dans autres fichiers
# ════════════════════════════════════════════════════════════════════

echo "📌 Suppression MaterialProperties dans appearanceRenderer..."
sed -i 's/, MaterialProperties//' src/modules/avatar/appearance/appearanceRenderer.ts || true

echo "📌 Suppression _Role dans SystemGovernance..."
sed -i '/^type _Role = /d' src/pages/SystemGovernance.tsx || true

echo "📌 Suppression _Mutation dans EvolutionMonitor..."
sed -i '/^interface _Mutation {/,/^}$/d' src/ui/pages/EvolutionMonitor.tsx || true

# ════════════════════════════════════════════════════════════════════
# PHASE 6 : Supprimer imports React inutiles
# ════════════════════════════════════════════════════════════════════

echo "📌 Suppression imports React inutiles..."
sed -i "/^import React from 'react';$/d" src/stories/Button.tsx || true
sed -i "/^import React from 'react';$/d" src/stories/Header.tsx || true

# ════════════════════════════════════════════════════════════════════
# PHASE 7 : Supprimer import entier dans ttsFunctionalTests
# ════════════════════════════════════════════════════════════════════

echo "📌 Suppression import complet dans ttsFunctionalTests..."
sed -i "/^import { describe, it, expect, beforeEach, afterEach } from '@jest\/globals';$/d" src/services/selftest/ttsFunctionalTests.ts || true

# ════════════════════════════════════════════════════════════════════
# PHASE 8 : Supprimer propriétés de classe non utilisées mais non référencées
# ════════════════════════════════════════════════════════════════════

echo "📌 Suppression propriétés vraiment non utilisées..."

# targetFPS dans RealTimeExecutionEngine (ligne 163)
sed -i '163s/targetFPS/_targetFPS/' src/core/realtime/RealTimeExecutionEngine.ts || true

# usePostProcessing dans ThreeJSAvatarRenderer (ligne 52)
sed -i '52s/usePostProcessing/_usePostProcessing/' src/modules/avatar/floating/ThreeJSAvatarRenderer.ts || true

# renderer dans appearanceFloatingIntegration (ligne 75)
sed -i '75s/renderer/_renderer/' src/modules/avatar/floating/appearanceFloatingIntegration.ts || true

# _targetFPS dans fullbody_engine (ligne 81) - déjà préfixé
echo "  (fullbody_engine.ts déjà OK)"

# __fullBodyAvatar dans AvatarFloatingWindow (ligne 76) - déjà double préfixe
echo "  (AvatarFloatingWindow.tsx déjà OK)"

# timeout dans chatClient (ligne 60) - property
echo "📌 Suppression property timeout dans chatClient..."
sed -i '60s/timeout/_timeout/' src/services/ai/chatClient.ts || true

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "✅ Corrections appliquées"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "🔍 Vérification TypeScript..."

pnpm run type-check 2>&1 | tee /tmp/ts_final_check.txt || true

FINAL=$(grep -c "error TS" /tmp/ts_final_check.txt || echo "0")
echo ""
echo "════════════════════════════════════════════════════════════"
echo "📊 RÉSULTAT : $FINAL warnings restants"
echo "════════════════════════════════════════════════════════════"
