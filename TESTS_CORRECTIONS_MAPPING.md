# Mapping Corrections Tests v26.4.0

## Phase 3 - Corrections Import (Systématique)

### ✅ DÉJÀ CORRIGÉ (Phase 1+2)
- `src/__tests__/components/ui/*.test.tsx` (9 fichiers) → Import depuis `@/components/ui` ✅
- `src/__tests__/hooks/useThrottle.test.tsx` → `beforeEach, afterEach` ajoutés ✅
- `src/__tests__/hooks/useResponsive.test.tsx` → `beforeEach` ajouté ✅
- `src/__tests__/components/ui/Toast.test.tsx` → `beforeEach` ajouté ✅
- `src/__tests__/hooks/useKeyboardShortcuts.test.tsx` → Typing corrigé ✅

### 🔧 À CORRIGER - Hooks (tous via barrel `@/hooks`)

**Tests utilisant déjà barrel** (OK si hooks sont exportés):
- ✅ `useChat.test.tsx` → `@/hooks/useChat` devient `@/hooks` (export vérifié)
- ✅ `useMemory.test.tsx` → `@/hooks/useMemory` devient `@/hooks`
- ✅ `useDebounce.test.tsx` → `@/hooks/useDebounce` devient `@/hooks`
- ✅ `useSingularity.test.tsx` → `@/hooks/useSingularity` devient `@/hooks`
- ✅ `useSystemHealth.test.tsx` → `@/hooks/useSystemHealth` devient `@/hooks`
- ✅ `usePerformanceMonitor.test.tsx` → `@/hooks/usePerformanceMonitor` devient `@/hooks`
- ✅ `useWindowControls.test.tsx` → `@/hooks/useWindowControls` devient `@/hooks`
- ✅ `useKeyboardShortcuts.test.tsx` → `@/hooks/useKeyboardShortcuts` devient `@/hooks`
- ✅ `useResponsive.test.tsx` → `@/hooks/useResponsive` devient `@/hooks`
- ✅ `useThrottle.test.tsx` → `@/hooks/useThrottle` devient `@/hooks`
- ✅ `useLocalStorage.test.tsx` → `@/hooks/useLocalStorage` devient `@/hooks`
- ✅ `useMediaQuery.test.tsx` → `@/hooks/useMediaQuery` devient `@/hooks`
- ✅ `useFusionEngine.test.tsx` → `@/hooks/useFusionEngine` devient `@/hooks`
- ✅ `useOmegaPipeline.test.tsx` → `@/hooks/useOmegaPipeline` devient `@/hooks`
- ✅ `usePresenceOS.test.tsx` → `@/hooks/usePresenceOS` devient `@/hooks`
- ✅ `useIdentity.test.tsx` → `@/hooks/useIdentity` devient `@/hooks`
- ✅ `useVAD.test.ts` → `@/hooks/useVAD` devient `@/hooks`
- ✅ `useTTSWithMicControl.test.ts` → `@/hooks/useTTSWithMicControl` devient `@/hooks`

**Hooks manquants dans barrel** (à vérifier/ajouter):
- ⚠️ `useVoice` → Commenté dans index.ts (ligne 209)
- ⚠️ `useMemory` → Seul `useMemoryCore`/`useMemoryEngine` existent
- ⚠️ `useWindowControls` → À vérifier export
- ⚠️ `useKeyboardShortcuts` → À vérifier export

### 🔧 À CORRIGER - Apps (via barrels)

**Tests devtools** (utiliser `@/apps/devtools` ou `@/apps/devtools/sections`):
- ✅ `DevToolsApp.test.tsx` → `@/apps/devtools/DevToolsApp` devient `@/apps/devtools`
- ✅ `Dashboard.test.tsx` → `@/apps/devtools/sections/Dashboard` devient `@/apps/devtools/sections`
- ✅ `Metrics.test.tsx` → `@/apps/devtools/sections/Metrics` devient `@/apps/devtools/sections`
- ✅ `Logs.test.tsx` → `@/apps/devtools/sections/Logs` devient `@/apps/devtools/sections`
- ✅ `Engines.test.tsx` → `@/apps/devtools/sections/Engines` devient `@/apps/devtools/sections`
- ✅ `Memory.test.tsx` → `@/apps/devtools/sections/Memory` devient `@/apps/devtools/sections`
- ✅ `Errors.test.tsx` → `@/apps/devtools/sections/Errors` devient `@/apps/devtools/sections`
- ✅ `OmegaPipeline.test.tsx` → `@/apps/devtools/sections/OmegaPipeline` devient `@/apps/devtools/sections`

**Settings** (path direct OK):
- ✅ `Settings.test.tsx` → `@/apps/Settings/Settings` (OK si fichier existe)

### 🔧 À CORRIGER - Features (chemins mixtes)

**Chat** (via barrel `@/features/chat`):
- ✅ `ChatMessage.test.tsx` → `@/features/chat/ChatMessage` devient `@/features/chat`
- ⚠️ `TypingIndicator.test.tsx` → Vérifier si dans barrel
- ⚠️ `ChatToolbar.test.tsx` → Vérifier si dans barrel
- ⚠️ `VirtualMessageList.test.tsx` → Vérifier si dans barrel

**Memory** (via barrel `@/features/memory`):
- ⚠️ `MemoryVisualization.test.tsx` → N'est PAS dans barrel (voir contenu)
- ⚠️ `MemoryCard.test.tsx` → N'est PAS dans barrel
- ⚠️ `MemorySearch.test.tsx` → N'est PAS dans barrel
- Barrel actuel: `MemorySearchPanel`, `MemoryTreeViewer`

**Voice** (DOSSIER N'EXISTE PAS):
- ❌ `VoiceControl.test.tsx` → `@/features/voice/VoiceControl` **N'EXISTE PAS**
  - **Solution**: Chercher dans `@/components/` ou créer mock

**Monitoring** (MAUVAIS PATH):
- ❌ `SingularityDashboard.test.tsx` → `@/features/monitoring/SingularityDashboard`
  - **Solution**: Devrait être `@/components/monitoring/SingularityDashboard`
- ❌ `SystemHealthMonitor.test.tsx` → `@/features/monitoring/SystemHealthMonitor`
  - **Solution**: Devrait être `@/components/monitoring/SystemHealthMonitor`

### 🔧 À CORRIGER - Panels

**Panels** (path direct OK):
- ✅ `ChatPanel.test.tsx` → `@/panels/ChatPanel` (OK si existe)
- ✅ `CommandPalette.test.tsx` → `@/panels/CommandPalette` (OK si existe)

### 🔧 À CORRIGER - Audio Service

**Audio** (path spécifique):
- ⚠️ `useVAD.test.ts` → `@/features/audio-center/services/audioService` (vérifier export)

---

## STRATÉGIE SYSTÉMATIQUE

### 1. **Hooks** → Tous via `@/hooks` (barrel complet)
### 2. **UI** → Tous via `@/components/ui` ✅ FAIT
### 3. **Apps/DevTools** → Via `@/apps/devtools` ou `@/apps/devtools/sections`
### 4. **Features** → Vérifier barrel case par case
### 5. **Monitoring** → Corriger path `@/components/monitoring/`
### 6. **Voice** → Composant manquant, nécessite investigation

---

## PROCHAINES ACTIONS

1. ✅ Corriger imports hooks (17 fichiers)
2. ✅ Corriger imports apps/devtools (8 fichiers)
3. ⚠️ Vérifier features/chat barrels (3 fichiers)
4. ⚠️ Corriger features/memory paths (3 fichiers)
5. ❌ **CRITIQUE**: Résoudre VoiceControl (manquant)
6. ❌ **CRITIQUE**: Corriger monitoring paths (2 fichiers)
7. ✅ Vérifier panels existence (2 fichiers)
8. 🔄 Validation TypeScript finale (0 erreurs)
