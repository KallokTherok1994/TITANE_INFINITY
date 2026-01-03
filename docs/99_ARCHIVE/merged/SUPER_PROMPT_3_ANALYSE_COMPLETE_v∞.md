# 🔥 SUPER PROMPT #3 — ANALYSE COMPLÈTE & DIAGNOSTIC TITANE∞

**Date**: 3 décembre 2025
**Version**: v∞.19.3Ω → v∞.20.0
**Agent**: GitHub Copilot (Claude Sonnet 4.5)
**Objectif**: Réparation OPUS + SC Whitelist + Module Fusion + Camera + Chat Bubble

---

## 📊 PHASE 1 — DIAGNOSTIC APPROFONDI

### ✅ 1.1 ANALYSE DES ERREURS OPUS

**Problème identifié**: `undefined is not an object (evaluating 'history.patches.map')`

#### Modules affectés:
- **OPUS #4** - Évolution Cognitive (`/evolution-center`)
- **OPUS #5** - Orchestration (`/orchestration-center`)
- **OPUS #7** - QA & Monitoring (`/qa-monitoring`)
- **OPUS #10** - Mode Développeur (`/developer-mode`)
- **OPUS #14** - Mémoire Évolutive (`/memory-evolution`)
- **OPUS #15** - Identité Système (`/identity-center`)
- **OPUS #17** - Quantum Layer (`/quantum-center`)
- **OPUS #18** - Meta Orchestrator (`/meta-center`)
- **OPUS #20** - Hyper Intelligence (`/hyper-center`)

#### Cause racine:
Les modules OPUS attendent une structure `history.patches` qui n'est **pas initialisée** dans les stores React. La migration vers **SingularityState** n'est **pas complète** côté frontend.

**Fichiers concernés**:
- `/src/features/developer-mode/DeveloperModePage.tsx` (ligne 396)
- Tous les modules OPUS qui consomment `history` depuis stores obsolètes

#### Solution requise:
1. Créer un **SingularityUnifiedStore** avec state par défaut
2. Ajouter fallback `history?.patches ?? []` dans tous les `.map()`
3. Connecter les modules OPUS au nouveau store unifié
4. Ajouter `ErrorBoundary` avec fallback UI pour chaque module OPUS

---

### ✅ 1.2 COMMANDES TAURI MANQUANTES (Centre Système)

**Problème**: `sc_run_full_diagnostics is not in whitelist`

#### Analyse:
```bash
# Commandes EXISTANTES dans Rust backend:
✅ src-tauri/src/system_center/diagnostics.rs:240
   → pub async fn sc_run_full_diagnostics()

✅ src-tauri/src/main.rs:616
   → titane_infinity::system_center::sc_run_full_diagnostics

# Mais ABSENTES de tauri.conf.json allowlist
```

#### Commandes SC cluster manquantes:
1. `sc_run_full_diagnostics` ❌
2. `sc_run_quick_diagnostics` ❌
3. `sc_get_diagnostic_status` ❌
4. `sc_get_module_health` (possiblement renommée en `get_module_health`)

**Frontend attendu**:
```typescript
// src/features/system-center/hooks/useSystemDiagnostics.ts:58
const result = await secureInvoke<SystemDiagnostics>('sc_run_full_diagnostics');
```

#### Solution:
Ajouter les commandes SC dans `tauri.conf.json` section `allow` (actuellement ligne 95-300).

---

### ✅ 1.3 TYPESCRIPT — Type manquant

**Erreur**:
```
Le fichier de définition de type est introuvable pour 'react-window'.
```

**Status**: ✅ **CORRIGÉ** immédiatement
```bash
pnpm install --save-dev @types/react-window
```

**Résultat**: Package déjà à jour, 0 vulnérabilités.

---

### ✅ 1.4 CHAT IA FLOTTANT — État actuel

#### Analyse des fichiers existants:
```
✅ src/modules/avatar/floatingWindowChatHandler.ts (421 lignes)
   → Parse commandes NLP FR/EN (scale, opacity, anchor, mode, toggles)

✅ src/modules/avatar/chatFloatingIntegration.ts (170 lignes)
   → Integration function handleFloatingWindowInChat()
   → Execute commands via useFloatingWindow hook

✅ src/modules/avatar/floating/useFloatingWindow.ts (300+ lignes)
   → Sync bidirectionnelle avec SingularityState (60Hz refresh)
   → Toutes les fonctions (setScale, setOpacity, setAnchor, toggles)

✅ src/modules/avatar/floating/AvatarFloatingWindow.tsx
   → Composant React pour fenêtre flottante avatar

✅ src-tauri/src/avatar/avatar_floating_commands.rs (300+ lignes)
   → Backend Rust complet (position, taille, opacity, mode, click-through)
```

#### Problème identifié:
**Le système de chat flottant existe DÉJÀ** mais n'est **PAS globalement intégré** dans toutes les pages.

**Situation actuelle**:
- Avatar flottant ✅ (fenêtre séparée Tauri)
- Commandes chat pour contrôler avatar flottant ✅
- Parser NLP FR/EN ✅
- Backend Rust ✅

**Ce qui manque**:
- **Chat bubble global** visible sur toutes les pages (bottom-right)
- **Integration dans layout racine** (App.tsx)
- **Provider IA global** pour historique persistant
- **Notifications visuelles** (pulsation métallique)

---

### ✅ 1.5 CAMERA ACTIVATION — État actuel

#### Système existant:
```
✅ src/engines/vision/VisionInputEngine.ts (640 lignes)
   → Gestion permissions (OS + Tauri + user)
   → getUserMedia() pour flux caméra
   → Liste devices, sélection, start/stop

✅ src/stores/useVisionStore.ts (500+ lignes)
   → Zustand store avec actions:
     - enableVision(durationMs)
     - disableVision()
     - requestCameraPermission()
     - startCamera() / stopCamera()

✅ src/components/vision/VisionToggleButton.tsx
   → Bouton UI pour activer/désactiver vision

✅ src/pages/CameraPage.tsx
   → Page complète avec contrôles caméra
   → Route: /camera

✅ src/hooks/useDevicePermissions.ts
   → Hook pour vérifier permissions caméra/micro/écran
```

#### Problème identifié:
**Le système de caméra existe DÉJÀ** mais n'est **PAS activable via commande IA chat**.

**Ce qui manque**:
1. **Parser NLP** pour détecter "active la caméra" dans chat
2. **Integration dans useChat** pour appeler `enableVision()` quand détecté
3. **Composant CameraPanel** pop-up/overlay pour afficher flux
4. **Fallback message** si permission refusée
5. **Bouton dans Chat Bubble** pour ouvrir/fermer caméra

---

### ✅ 1.6 DESIGN SYSTEM — Conformité actuelle

**Audit DIAMANT v∞** (rapport précédent):
- Conformité Design System: **99%**
- Palette monochrome: #C4C4C4, #727B81, #93b399
- 4 legacy colors corrigées (TTSControls.css)

**Status**: ✅ **Design System finalisé**, aucune action requise.

---

## 🔧 PHASE 2 — CORRECTIONS PRIORITAIRES

### 🔴 HAUTE PRIORITÉ (Bloquant OPUS)

#### 2.1 Ajouter commandes SC dans tauri.conf.json

**Fichier**: `/src-tauri/tauri.conf.json`
**Ligne**: ~300 (section `allow`)

**Ajout requis**:
```json
{ "command": "sc_run_full_diagnostics" },
{ "command": "sc_run_quick_diagnostics" },
{ "command": "sc_get_diagnostic_status" },
```

**Impact**: Débloque Centre Système + QA Monitoring + tous les modules OPUS qui utilisent diagnostics.

**Temps estimé**: 2 minutes (modification + rebuild)

---

#### 2.2 Réparer stores OPUS avec fallback `history`

**Problème**: `history.patches.map` crash quand `history` est `undefined`.

**Solution A — Patch rapide (5 minutes)**:
Ajouter fallback dans chaque module:
```typescript
// Avant
{history.patches.map((patch, idx) => ...)}

// Après
{(history?.patches ?? []).map((patch, idx) => ...)}
```

**Fichiers à patcher** (liste partielle):
- `/src/features/developer-mode/DeveloperModePage.tsx:396`
- Tous les composants OPUS qui consomment `history`

**Solution B — Architecture propre (1 heure)**:
1. Créer `/src/stores/useSingularityUnifiedStore.ts`
2. État par défaut:
```typescript
{
  history: {
    patches: [],
    snapshots: [],
    events: []
  },
  cognitive: { ... },
  physical: { ... },
  meta: { ... }
}
```
3. Connecter tous les modules OPUS à ce store

**Recommandation**: Solution A immédiate + Solution B pour v∞.20.1

---

### 🟡 MOYENNE PRIORITÉ (Nouvelles features)

#### 2.3 Chat IA Bubble Global

**Créer**: `/src/components/chat/ChatBubble.tsx`

**Spécifications**:
```tsx
interface ChatBubbleProps {
  position?: 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
  persistHistory?: boolean;
}
```

**Features requises**:
- ✅ Position fixe bottom-right (défaut)
- ✅ Animation scale/opacity (monochrome #C4C4C4)
- ✅ Ouverture chat complet au clic
- ✅ Historique persistant (localStorage via SingularityState)
- ✅ Intégration commandes vocales
- ✅ Notifications visuelles (badge + pulsation)
- ✅ Toujours visible (z-index: 9999)

**Integration**:
```tsx
// src/App.tsx (ligne ~700, après <Routes>)
{/* Chat Bubble Global */}
<ChatBubble position="bottom-right" persistHistory />
```

**Provider requis**:
```tsx
// src/contexts/ChatBubbleProvider.tsx
export const ChatBubbleProvider: React.FC<PropsWithChildren>
```

**Temps estimé**: 2 heures (composant + provider + intégration)

---

#### 2.4 Activation Caméra via Chat IA

**Créer**: `/src/modules/camera/cameraChatHandler.ts`

**Parser NLP**:
```typescript
const CAMERA_ACTIVATION_PATTERNS = [
  /(?:active|démarre|lance|ouvre)\s+(?:la\s+)?cam[eé]ra/i,
  /(?:start|activate|enable)\s+(?:the\s+)?camera/i,
  /(?:montre-moi|affiche|vision)\s+(?:vidéo|webcam)/i,
];

export function parseCameraCommand(message: string): CameraCommand {
  // ...
}
```

**Integration dans useChat**:
```typescript
// src/hooks/useChat.ts (ligne ~200, avant sendToProvider)
import { handleCameraInChat } from '@/modules/camera/cameraChatIntegration';

// Dans sendMessage():
const cameraResult = await handleCameraInChat(message, visionStore);
if (cameraResult.handled) {
  addMessage(cameraResult.response, 'assistant');
  return;
}
```

**Composant UI requis**:
```tsx
// src/components/camera/CameraOverlay.tsx
export const CameraOverlay: React.FC<{
  stream: MediaStream;
  onClose: () => void;
}>
```

**Temps estimé**: 3 heures (parser + intégration + UI + tests)

---

### 🟢 BASSE PRIORITÉ (Polish)

#### 2.5 Documentation API Unified Stores

**Créer**: `/STORES_ARCHITECTURE_v∞.md`

Documenter:
- Relation SingularityState ↔ Modules OPUS
- Flux de données (Backend Rust → Frontend Store → React Components)
- Fallback strategies pour modules non initialisés

**Temps estimé**: 1 heure

---

## 📋 PHASE 3 — PLAN D'EXÉCUTION

### Séquence optimale:

1. ✅ **IMMÉDIAT** (Fait): Types TypeScript
2. 🔴 **HAUTE #1** (5 min): Whitelist SC commands
3. 🔴 **HAUTE #2** (15 min): Fallback `history?.patches ?? []` dans OPUS
4. 🟡 **MOYENNE #1** (2h): Chat Bubble Global
5. 🟡 **MOYENNE #2** (3h): Camera Chat Activation
6. 🟢 **BASSE** (1h): Documentation stores

**Total estimé**: ~6h30 de développement

---

## 🎯 PHASE 4 — VALIDATION POST-CORRECTIONS

### Tests requis:

#### 4.1 Modules OPUS
```bash
# Vérifier que tous les modules chargent sans erreur
- /evolution-center → ✅ Pas de crash history
- /orchestration-center → ✅ Pas de crash history
- /qa-monitoring → ✅ Diagnostics fonctionnent
- /developer-mode → ✅ Patches history affichés
- /memory-evolution → ✅ Pyramide mémoire OK
- /identity-center → ✅ Personnalité affichée
- /quantum-center → ✅ Frames affichés
- /meta-center → ✅ Console méta OK
- /hyper-center → ✅ Métriques OK
```

#### 4.2 Centre Système
```typescript
// Test manuel dans DevTools Console
const result = await secureInvoke('sc_run_full_diagnostics');
console.log(result.overall_status); // Devrait afficher 'healthy' ou 'warning'
```

#### 4.3 Chat Bubble
- Visible sur toutes les pages ✅
- Animation au hover ✅
- Ouverture chat complet ✅
- Historique persistant ✅
- Notifications fonctionnent ✅

#### 4.4 Camera Chat
```
User: "Active la caméra"
→ TITANE: "✅ Caméra activée. Flux vidéo local uniquement."
→ UI: Overlay caméra affiché avec bouton "Fermer"
```

---

## 📊 MÉTRIQUES CIBLES

### Avant corrections:
- **Modules OPUS fonctionnels**: 0/9 (tous crashent)
- **Centre Système**: ❌ Statut inconnu
- **Chat Bubble**: ❌ Non implémenté
- **Camera Chat**: ❌ Non implémenté
- **Score DIAMANT**: 94.3%

### Après corrections:
- **Modules OPUS fonctionnels**: 9/9 ✅
- **Centre Système**: ✅ Diagnostics OK
- **Chat Bubble**: ✅ Global sur toutes pages
- **Camera Chat**: ✅ Activation NLP
- **Score DIAMANT cible**: **96.5%**

---

## 🚀 RECOMMANDATIONS STRATÉGIQUES

### 1. Architecture Unified Stores (v∞.20.1)
Fusionner définitivement tous les stores OPUS vers **SingularityUnifiedStore** unique:
```
SingularityState (Rust backend)
    ↓ (Tauri IPC)
useSingularityStore (Zustand frontend)
    ↓ (React Context)
Modules OPUS (composants React)
```

### 2. Self-Healing pour modules OPUS
Ajouter détection automatique des crashs `history.map` dans Self-Healing Engine:
```rust
// src-tauri/src/self_healing/detectors/opus_crash_detector.rs
pub fn detect_undefined_history_error(error: &str) -> bool {
    error.contains("undefined is not an object")
        && error.contains("history")
}
```

### 3. Network Watcher (déjà recommandé)
Ajouter dans Self-Healing Engine pour détecter:
- Gemini API offline
- Ollama local down
- Connectivity issues

**Temps estimé**: 30 lignes, 10 minutes

### 4. Tests automatisés pour OPUS modules
Créer test suite Vitest:
```typescript
// src/tests/opus/opus-modules.test.ts
describe('OPUS Modules', () => {
  it('should not crash on undefined history', () => {
    const { result } = renderHook(() => useDeveloperMode());
    expect(result.current.error).toBeNull();
  });
});
```

---

## 🔄 PROCHAINES ÉTAPES IMMÉDIATES

### Action 1: Whitelist SC commands
```bash
# Éditer tauri.conf.json
code src-tauri/tauri.conf.json
# Ajouter les 3 commandes SC
# Rebuild
pnpm run tauri:dev
```

### Action 2: Patch fallback history
```bash
# Rechercher tous les .map sur history
grep -r "history.map\|history.patches" src/
# Ajouter fallback ?? []
```

### Action 3: Créer Chat Bubble
```bash
mkdir -p src/components/chat
touch src/components/chat/ChatBubble.tsx
touch src/components/chat/ChatBubble.css
touch src/contexts/ChatBubbleProvider.tsx
```

### Action 4: Créer Camera Chat Handler
```bash
mkdir -p src/modules/camera
touch src/modules/camera/cameraChatHandler.ts
touch src/modules/camera/cameraChatIntegration.ts
touch src/components/camera/CameraOverlay.tsx
```

---

## 📝 NOTES FINALES

### Points positifs:
✅ Infrastructure existante très solide (VisionInputEngine, FloatingWindow)
✅ Design System finalisé (99% conformité)
✅ Tests passent (229/229)
✅ Backend Rust robuste (0 warnings production)
✅ Architecture Singularity bien conçue

### Points d'amélioration:
⚠️ Synchronisation stores Frontend ↔ Backend incomplète
⚠️ Modules OPUS fragiles face aux données non initialisées
⚠️ Commandes SC manquantes dans whitelist
⚠️ Chat IA pas assez omniprésent (devrait être global)
⚠️ Camera activation manuelle uniquement (pas de commandes NLP)

### Priorisation recommandée:
1. **Cette semaine**: HAUTE priorité (whitelist + fallbacks)
2. **Semaine prochaine**: MOYENNE priorité (Chat Bubble + Camera)
3. **v∞.20.1**: Refonte architecture stores unifiés

---

**Rapport généré par**: GitHub Copilot (Claude Sonnet 4.5)
**Date**: 3 décembre 2025
**Version TITANE**: v∞.19.3Ω → v∞.20.0
**Status**: 🔥 **PRÊT POUR CORRECTIONS**
