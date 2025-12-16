# TITANE∞ v21 — Living UI System

## Architecture UI Organique — Phase 1-4 Complete

Ce document présente l'architecture fondamentale du **système UI vivant** de TITANE∞,
conçu pour être auto-adaptatif, auto-cohérent, et auto-corrigé.

---

## 🎯 Vision

Le système UI de TITANE∞ n'est pas un assemblage de composants visuels passifs.
C'est un **organisme vivant** qui :

- **Respire** selon l'état cognitif
- **Réagit** aux événements internes (moteurs, pipeline, mémoire)
- **S'adapte** dynamiquement à la performance
- **Communique** son état par un langage visuel sémantique
- **S'auto-répare** en cas de surcharge
- **Évolue** avec l'utilisateur

---

## 🏗️ Architecture en 4 Piliers

### 1. **Visual Semantic Grammar** (`semantic/VisualSemanticGrammar.ts`)

Le **langage sémiotique** de TITANE∞.

**Responsabilité** : Traduire les états internes en phénomènes visuels signifiants.

#### Traductions principales :

**Moteurs OS → Phénomènes**

- `EngineState.IDENTITY` → Signature lumineuse unique (pulsation 1Hz)
- `EngineState.ALIGNMENT` → Cohérence orbitale (anneaux stables)
- `EngineState.CORRECTION` → Arcs énergétiques (réparation active)
- `EngineState.SELF_HEALING` → Vagues de guérison (ondes vertes)
- `EngineState.PERFORMANCE` → Densité particules adaptative
- `EngineState.EVOLUTION` → Transition de phase (spirale + shift couleur)
- `EngineState.BEHAVIOR` → Modulation émotionnelle couleurs
- `EngineState.AUDIT` → Pulsation de validation

**Pipeline OMEGA → Phénomènes**

- `STAGE_0` (Idle) → Respiration lente (0.5 Hz)
- `STAGE_1` (Réception) → Burst particules initial
- `STAGE_2-4` (Processing) → Arcs énergétiques soutenus + vitesse orbitale ↑
- `STAGE_8` (Livraison) → Micro arcs électriques dorés
- `STAGE_9-10` (Apprentissage) → Vagues consolidation violettes

**Mémoire → Phénomènes**

- `STM_ACTIVE` → Particules rapides
- `MTM_CONSOLIDATING` → Vagues lentes bleues
- `LTM_RETRIEVING` → Pulsation profonde violette
- `LTM_SATURATED` → Respiration lente rouge (alerte)

**Événements Système → Phénomènes**

- `processing_start` → Burst particules
- `error_detected` → Glitch effect
- `error_resolved` → Healing waves vertes
- `voice_started` → Audio waveform expansion
- `alignment_loss` → Perturbation orbitale
- `alignment_restored` → Stabilisation anneaux

**Signature TITANE∞**

- Pulsation permanente 1.0 Hz (rythme cardiaque)
- Couleur #4FB5FF (bleu signature)
- Intensité glow 0.7
- Vitesse orbitale 1.0
- Densité particules 0.8

---

### 2. **Visual Conductor** (`orchestrators/VisualConductor.ts`)

Le **cerveau orchestrateur** du système visuel.

**Responsabilité** : Recevoir événements OS, traduire via Grammar, orchestrer phénomènes.

#### Architecture :

```
OS Events → Visual Conductor → Visual Phenomena → Visual Engine → Render
```

#### Fonctionnalités :

**Traduction événementielle**

- Écoute événements OS (moteurs, pipeline, mémoire, système)
- Traduit via `VisualSemanticGrammar`
- Génère `VisualPhenomenon[]`

**Gestion des phénomènes**

- Queue de traitement asynchrone
- Limite configurable de phénomènes simultanés (default: 10)
- Activation/désactivation automatique selon durée

**Résolution de conflits**

- **Priority** : Remplace phénomène moins prioritaire
- **Merge** : Fusionne phénomènes similaires (moyenne pondérée)
- **Queue** : Garde en attente

**Métriques & Monitoring**

- Événements traités
- Phénomènes générés/actifs
- Latence moyenne (rolling 100 samples)
- Événements/sec

**Lifecycle**

- `.start()` / `.stop()` / `.destroy()`
- Callbacks `.on('event_processed')`, `.on('error')`

---

### 3. **UI Mode System** (`modes/UIModeManager.ts`)

Le **système adaptatif de modes visuels**.

**Responsabilité** : Gérer 5 modes UI avec adaptation dynamique automatique.

#### Les 5 Modes :

**AUTO** — Mode adaptatif intelligent

- Quality dynamique selon performance
- Target 60 FPS
- Ajustement automatique densité/qualité
- Monitoring continu toutes les 2s

**MINIMAL** — Mode économie ressources

- ❌ Pas de particules
- ❌ Pas d'effets
- ✅ Glow minimal (0.3)
- ✅ Anneaux simples
- Target 30 FPS

**PERFORMANCE** — 60 FPS garanti

- Densité réduite (0.6)
- Quality medium
- Ajustement auto pour maintenir 60fps
- ✅ Affichage FPS/métriques

**IMMERSIVE** — Effets maximaux

- ✨ Densité max (1.0)
- ✨ Quality high partout
- ✨ Glow max (1.0)
- Transitions longues (800ms)
- Best effort FPS (no limit)

**DEBUG** — Visualisation interne

- ✅ FPS visible
- ✅ Métriques complètes
- ✅ États OS overlay
- ✅ Phénomènes actifs
- ✅ Console logging

#### Configuration par mode :

Chaque mode contrôle :

- Particules (enable, density, quality)
- Effets (enable, quality, types spécifiques)
- Glow & Aura (enable, intensity, quality)
- Orbital (enable, quality)
- Animations (enable, speed, transitions)
- Performance (target FPS, limits, dynamic quality)
- Debug (FPS, metrics, overlays, logging)
- Panels (opacity, blur, animations)

#### Mode AUTO — Intelligence adaptative :

**Conditions de réduction qualité** :

- FPS < 80% target
- CPU usage élevé

**Actions** :

- Réduire densité particules (-0.1)
- Downgrade quality effects (high→medium→low)
- Réduire glow (-0.1)

**Conditions d'augmentation qualité** :

- FPS > 95% target
- CPU usage < 60%

**Actions** :

- Augmenter densité (+0.1 jusqu'à 1.0)
- Upgrade quality effects
- Augmenter glow (+0.1 jusqu'à 0.9)

**API** :

```typescript
const modeManager = new UIModeManager(UIMode.AUTO);

// Change mode
modeManager.setMode(UIMode.IMMERSIVE);

// Override config
modeManager.overrideConfig({ particleDensity: 0.5 });

// Listen changes
modeManager.onModeChange((mode, config) => {
  console.log('Mode changed:', mode);
});

// Update metrics (from Visual Engine)
modeManager.updatePerformanceMetrics({ fps: 58, cpuUsage: 0.7 });
```

---

### 4. **UI Layer Hierarchy** (`hierarchy/UILayerManager.ts`)

Le **système hiérarchique de couches UI**.

**Responsabilité** : Organiser l'UI en couches logiques avec z-index, priorités, comportements.

#### Les 6 Layers :

**Layer 0 — BACKGROUND** (z-index: 0)

- Fond, gradient, ambiance
- Pas d'interaction
- Opacity 1.0

**Layer 1 — VISUAL_CORE** (z-index: 10)

- Noyau visuel (sphere, rings, particles, aura)
- Pas d'interaction directe
- Opacity 1.0

**Layer 2 — PRIMARY_PANELS** (z-index: 100)

- Panneaux principaux (Chat, Memory, DevTools)
- Interaction priorité 8
- Opacity 0.95, blur backdrop
- **Ne se rétractent jamais**

**Layer 3 — SECONDARY_PANELS** (z-index: 200)

- Panneaux secondaires (Governance, SelfHealing, etc.)
- Interaction priorité 6
- Opacity 0.92, blur backdrop
- **Peuvent se rétracter si overlap**

**Layer 4 — OVERLAYS** (z-index: 1000)

- Overlays, modals, notifications, tooltips
- Interaction priorité 10 (max)
- Opacity 0.98, blur backdrop
- **Ne se superposent pas entre eux**

**Layer 5 — DEBUG** (z-index: 9999)

- Debug & performance overlays
- Interaction priorité 5
- Opacity 0.85, pas de blur (transparence)

#### Panels définis (15 types) :

**Primaires (Layer 2)** :

- `CHAT` : Cœur conversationnel (center, 60%×70%, non-collapsible)
- `MEMORY` : Cortex mémoire (right, 300×500px, collapsible)
- `DEVTOOLS` : Cortex analytique (bottom, 100%×300px, collapsible)

**Secondaires (Layer 3)** :

- `GOVERNANCE` : Surcouche OS (right, 320×400px)
- `SELF_HEALING` : Système immunitaire (left, 280×350px)
- `SYSTEM_HEALTH` : Monitoring santé (top, 400×200px)
- `VOICE_MONITOR` : Monitoring voix (floating, 250×300px)
- `PHYSIOLOGICAL` : État physiologique (right, 300×400px)
- `PRESENCE` : Présence émotionnelle (left, 280×380px)

**Overlays (Layer 4)** :

- `NOTIFICATION` : Notifications système (top, 400×auto)
- `MODAL` : Dialogues modaux (center, 600×auto)
- `TOOLTIP` : Info-bulles (floating, auto×auto)
- `CONTEXT_MENU` : Menus contextuels (floating, auto×auto)

**Debug (Layer 5)** :

- `FPS_MONITOR` : Monitoring FPS (top, 200×80px)
- `STATE_INSPECTOR` : Inspection états OS (right, 350×500px)
- `PHENOMENA_DEBUG` : Debug phénomènes (left, 300×400px)

#### API :

```typescript
const layerManager = new UILayerManager();

// Show/hide panels
layerManager.showPanel(PanelType.GOVERNANCE);
layerManager.hidePanel(PanelType.VOICE_MONITOR);
layerManager.togglePanel(PanelType.MEMORY);

// Collapse/expand
layerManager.toggleCollapse(PanelType.DEVTOOLS);

// Position & size (si draggable/resizable)
layerManager.setPanelPosition(PanelType.MODAL, 100, 200);
layerManager.setPanelSize(PanelType.CHAT, 800, 600);

// Bring to front
layerManager.bringToFront(PanelType.GOVERNANCE);

// Queries
const state = layerManager.getPanelState(PanelType.CHAT);
const visible = layerManager.getVisiblePanels();
const primaries = layerManager.getPanelsByLayer(UILayer.PRIMARY_PANELS);
const isCore = layerManager.isPanelCore(PanelType.CHAT); // true
```

---

## 🔗 Intégration complète

### Flux de données :

```
TITANE∞ OS (9 moteurs + OMEGA pipeline)
         ↓
    OS Events
         ↓
  Visual Conductor
         ↓
 Visual Semantic Grammar
         ↓
  Visual Phenomena
         ↓
 Visual Engine V21 ← UI Mode Manager
         ↓
  Render (Canvas/WebGL)
```

### Exemple d'utilisation complète :

```typescript
import {
  TitaneVisualEngineV21,
  VisualConductor,
  UIModeManager,
  UILayerManager,
  VisualSemanticGrammar,
  EngineState,
  OmegaPipelineStage,
  UIMode,
  PanelType,
} from '@/visual-engine/LivingUISystem';

// 1. Initialiser le système
const visualEngine = new TitaneVisualEngineV21(initialState, {
  enableParticles: true,
  targetFPS: 60,
});

const conductor = new VisualConductor({ debug: true });
conductor.connectVisualEngine(visualEngine);

const modeManager = new UIModeManager(UIMode.AUTO);
const layerManager = new UILayerManager();

// 2. Configurer callbacks
modeManager.onModeChange((mode, config) => {
  visualEngine.updateConfig(config);
});

conductor.on('phenomenon_activated', phenomenon => {
  console.log('Phenomenon activated:', phenomenon.type);
});

// 3. Démarrer
visualEngine.start();
conductor.start();

// 4. Envoyer événements OS
conductor.handleOSEvent({
  type: 'engine_state_change',
  engine: EngineState.SELF_HEALING,
  intensity: 0.8,
  timestamp: Date.now(),
});

conductor.handleOSEvent({
  type: 'pipeline_stage_change',
  stage: OmegaPipelineStage.STAGE_3,
  progress: 0.6,
  timestamp: Date.now(),
});

// 5. Changer mode UI
modeManager.setMode(UIMode.IMMERSIVE);

// 6. Gérer panels
layerManager.showPanel(PanelType.GOVERNANCE);
layerManager.toggleCollapse(PanelType.MEMORY);

// 7. Cleanup
visualEngine.stop();
conductor.destroy();
modeManager.destroy();
```

---

## 📊 Métriques & Monitoring

### Visual Conductor :

- Événements traités
- Phénomènes générés/actifs
- Latence moyenne (ms)
- Événements/sec

### UI Mode Manager (AUTO) :

- FPS actuel
- Frame time (ms)
- CPU/GPU usage
- Mémoire (MB)
- Particle count
- Active effects count
- Ajustements historique (20 derniers)

### Visual Engine :

- FPS
- Frame time
- Particle count
- Effects active
- Memory usage
- State transitions

---

## ✅ Phase 1-4 Complete — Ce qui reste

### ✅ Complété (Phase 1-4) :

1. ✅ **Visual Semantic Grammar** — Langage sémiotique complet
2. ✅ **Visual Conductor** — Orchestrateur événementiel
3. ✅ **UI Mode System** — 5 modes adaptatifs
4. ✅ **UI Layer Hierarchy** — Architecture en couches

### 🔄 À venir (Phase 5-10) :

5. ⏳ **Signature visuelle TITANE∞** — Identité unique persistante
6. ⏳ **Bridge OS → UI** — Connexion complète 9 moteurs + OMEGA
7. ⏳ **Adaptation dynamique via mémoire** — UI apprend de l'utilisateur
8. ⏳ **Architecture predictive-ready** — Quantum Engine bridge
9. ⏳ **Micro-interactions globales** — Polish final
10. ⏳ **Documentation architecture complète** — Guide développeur

---

## 🎯 Next Steps — SUPER PROMPT #3

Le **SUPER PROMPT #3** (Polish/Optimisation UI absolue) pourra maintenant s'appuyer sur :

- Un langage visuel formalisé ✅
- Un orchestrateur événementiel ✅
- Un système de modes adaptatifs ✅
- Une hiérarchie structurée ✅

Le polish final consistera à :

- Créer micro-interactions fluides
- Uniformiser typographie
- Stabiliser animations/transitions
- Optimiser performances
- Créer signature visuelle unique
- Bridge complet avec TITANE∞ OS v21

---

## 🏆 Impact

Ce système transforme TITANE∞ UI de :

**Avant** :

- Composants visuels passifs
- Réactions statiques
- Configuration manuelle

**Après** :

- **Organisme vivant**
- **Langage sémantique**
- **Auto-adaptation**
- **Auto-cohérence**
- **Auto-réparation**

C'est la **fondation** d'un système UI qui **pense**, **respire**, et **évolue**.

---

_TITANE∞ v21 — Living UI System_
_© 2025 Humain Total / Kevin Thibault / TITANE Team_
