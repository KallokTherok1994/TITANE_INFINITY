# TITANE∞ Living UI System — Index & Quick Reference

## 📚 Documentation

- **[LIVING_UI_SYSTEM_PHASE_1-4_COMPLETE.md](./LIVING_UI_SYSTEM_PHASE_1-4_COMPLETE.md)** — Architecture complète détaillée
- **[LIVING_UI_SYSTEM_SUMMARY.md](./LIVING_UI_SYSTEM_SUMMARY.md)** — Résumé exécutif
- **[Ce fichier]** — Quick reference & exemples

---

## 🗂️ Structure des Fichiers

```
src/visual-engine/
│
├── LivingUISystem.ts                    # Export centralisé (point d'entrée)
│
├── semantic/
│   └── VisualSemanticGrammar.ts         # Langage sémiotique
│
├── orchestrators/
│   └── VisualConductor.ts               # Orchestrateur événementiel
│
├── modes/
│   └── UIModeManager.ts                 # Système de modes UI
│
├── hierarchy/
│   └── UILayerManager.ts                # Hiérarchie des couches
│
├── TitaneVisualEngineV21.ts             # Moteur principal (existant)
├── OSIntegrationBridge.ts               # Bridge OS (existant)
├── StateManager.ts                      # Gestion états (existant)
└── EffectsOrchestrator.ts               # Orchestrateur effets (existant)
```

---

## 🚀 Quick Start — Import & Initialisation

```typescript
// Import tout le système
import {
  // Grammar
  VisualSemanticGrammar,
  EngineState,
  OmegaPipelineStage,
  MemoryState,
  PhenomenonType,

  // Conductor
  VisualConductor,

  // Modes
  UIModeManager,
  UIMode,

  // Hierarchy
  UILayerManager,
  PanelType,
  UILayer,

  // Engine
  TitaneVisualEngineV21,
} from '@/visual-engine/LivingUISystem';

// Ou imports individuels
import { VisualConductor } from '@/visual-engine/orchestrators/VisualConductor';
```

---

## 💡 Exemples d'Utilisation

### 1. Initialisation Complète

```typescript
// 1. Créer le Visual Engine
const visualEngine = new TitaneVisualEngineV21(
  {
    cognitive: 'idle',
    emotional: 'calm',
    systemLoad: 20,
    conversationContext: { activeTopics: [], recentIntents: [] },
  },
  {
    enableParticles: true,
    enableEffects: true,
    targetFPS: 60,
    performanceMode: 'high',
  }
);

// 2. Créer le Conductor
const conductor = new VisualConductor({
  enabled: true,
  maxActivePhenomena: 10,
  conflictResolution: 'priority',
  debug: true,
});

// 3. Connecter Engine au Conductor
conductor.connectVisualEngine(visualEngine);

// 4. Créer le Mode Manager
const modeManager = new UIModeManager(UIMode.AUTO);

// 5. Créer le Layer Manager
const layerManager = new UILayerManager();

// 6. Setup callbacks
modeManager.onModeChange((mode, config) => {
  console.log(`Mode changed to ${mode}`);
  visualEngine.updateConfig({
    enableParticles: config.enableParticles,
    targetFPS: config.targetFPS,
  });
});

conductor.on('phenomenon_activated', phenomenon => {
  console.log(`Phenomenon: ${phenomenon.type} (priority: ${phenomenon.priority})`);
});

// 7. Démarrer
visualEngine.start();
conductor.start();

// 8. Afficher panels primaires
layerManager.showPanel(PanelType.CHAT);
layerManager.showPanel(PanelType.MEMORY);
layerManager.showPanel(PanelType.DEVTOOLS);
```

---

### 2. Envoyer des Événements OS

```typescript
// Événement moteur
conductor.handleOSEvent({
  type: 'engine_state_change',
  engine: EngineState.SELF_HEALING,
  intensity: 0.85,
  metadata: { reason: 'alignment_correction' },
  timestamp: Date.now(),
});

// Événement pipeline OMEGA
conductor.handleOSEvent({
  type: 'pipeline_stage_change',
  stage: OmegaPipelineStage.STAGE_3,
  progress: 0.6,
  timestamp: Date.now(),
});

// Événement mémoire
conductor.handleOSEvent({
  type: 'memory_state_change',
  memoryState: MemoryState.LTM_RETRIEVING,
  intensity: 0.7,
  timestamp: Date.now(),
});

// Événement système
conductor.handleOSEvent({
  type: 'system_event',
  event: 'error_resolved',
  metadata: { errorType: 'api_timeout', duration: 2500 },
  timestamp: Date.now(),
});
```

---

### 3. Changer le Mode UI

```typescript
// Mode immersif (effets max)
modeManager.setMode(UIMode.IMMERSIVE);

// Mode performance (60fps garanti)
modeManager.setMode(UIMode.PERFORMANCE);

// Mode minimal (économie ressources)
modeManager.setMode(UIMode.MINIMAL);

// Mode debug (visualisation états)
modeManager.setMode(UIMode.DEBUG);

// Retour au mode auto
modeManager.setMode(UIMode.AUTO);

// Override config manuel
modeManager.overrideConfig({
  particleDensity: 0.5,
  glowIntensity: 0.8,
});
```

---

### 4. Gérer les Panels

```typescript
// Afficher/cacher
layerManager.showPanel(PanelType.GOVERNANCE);
layerManager.hidePanel(PanelType.VOICE_MONITOR);
layerManager.togglePanel(PanelType.SELF_HEALING);

// Collapse/expand
layerManager.toggleCollapse(PanelType.MEMORY);

// Positionner (si draggable)
layerManager.setPanelPosition(PanelType.GOVERNANCE, 100, 200);

// Redimensionner (si resizable)
layerManager.setPanelSize(PanelType.CHAT, 800, 600);

// Amener au premier plan
layerManager.bringToFront(PanelType.DEVTOOLS);

// Query état
const chatState = layerManager.getPanelState(PanelType.CHAT);
console.log('Chat visible:', chatState?.visible);

// Get tous les panels visibles
const visiblePanels = layerManager.getVisiblePanels();

// Get panels d'une couche
const secondaryPanels = layerManager.getPanelsByLayer(UILayer.SECONDARY_PANELS);
```

---

### 5. Utiliser la Grammar Directement

```typescript
// Traduire un état moteur
const phenomena = VisualSemanticGrammar.translateEngineState(EngineState.EVOLUTION, 0.9, {
  phase: 'transformation',
});

console.log('Phenomena:', phenomena);
// → [
//   { type: 'phase_transition', intensity: 0.9, ... },
//   { type: 'particle_spiral', intensity: 0.9, ... }
// ]

// Traduire étape OMEGA
const omegaPhenomena = VisualSemanticGrammar.translateOmegaStage(
  OmegaPipelineStage.STAGE_8,
  1.0
);

// Signature permanente TITANE∞
const signature = VisualSemanticGrammar.getSignaturePhenomenon();
console.log('Signature:', signature.config);
// → { pulseFrequency: 1.0, glowColor: '#4FB5FF', ... }
```

---

### 6. Monitoring & Métriques

```typescript
// Conductor metrics
const conductorMetrics = conductor.getMetrics();
console.log('Conductor:', {
  eventsProcessed: conductorMetrics.eventsProcessed,
  phenomenaActive: conductorMetrics.phenomenaActive,
  averageLatency: conductorMetrics.averageLatency.toFixed(2) + 'ms',
});

// Active phenomena
const activePhenomena = conductor.getActivePhenomena();
console.log(
  'Active:',
  activePhenomena.map(p => p.type)
);

// Mode manager state (AUTO mode)
const autoState = modeManager.getAutoModeState();
if (autoState) {
  console.log('AUTO mode:', {
    fps: autoState.metrics.fps,
    cpuUsage: (autoState.metrics.cpuUsage * 100).toFixed(1) + '%',
    lastAdjustment: new Date(autoState.lastAdjustment),
  });
}

// Update metrics (appelé par Visual Engine)
modeManager.updatePerformanceMetrics({
  fps: 58,
  frameTime: 17.2,
  cpuUsage: 0.65,
  particleCount: 850,
});
```

---

### 7. Cleanup

```typescript
// Arrêt propre
visualEngine.stop();
conductor.stop();
modeManager.destroy();
layerManager.destroy(); // (si méthode existe)
```

---

## 📖 Référence API Rapide

### VisualConductor

```typescript
conductor.handleOSEvent(event: OSEvent): Promise<void>
conductor.connectVisualEngine(engine: TitaneVisualEngineV21): void
conductor.updateConfig(config: Partial<VisualConductorConfig>): void
conductor.getMetrics(): ConductorMetrics
conductor.getActivePhenomena(): VisualPhenomenon[]
conductor.start(): void
conductor.stop(): void
conductor.destroy(): void

// Events
conductor.on('event_processed', (data) => { ... })
conductor.on('phenomenon_activated', (phenomenon) => { ... })
conductor.on('phenomenon_deactivated', (phenomenon) => { ... })
conductor.on('error', (error) => { ... })
```

### UIModeManager

```typescript
modeManager.setMode(mode: UIMode): void
modeManager.getCurrentMode(): UIMode
modeManager.getCurrentConfig(): UIModeConfig
modeManager.overrideConfig(overrides: Partial<UIModeConfig>): void
modeManager.updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void
modeManager.getAutoModeState(): AutoModeState | null
modeManager.onModeChange(callback: (mode, config) => void): void
modeManager.offModeChange(callback): void
modeManager.destroy(): void
```

### UILayerManager

```typescript
layerManager.showPanel(type: PanelType): void
layerManager.hidePanel(type: PanelType): void
layerManager.togglePanel(type: PanelType): void
layerManager.toggleCollapse(type: PanelType): void
layerManager.setPanelPosition(type: PanelType, x: number, y: number): void
layerManager.setPanelSize(type: PanelType, width: number, height: number): void
layerManager.bringToFront(type: PanelType): void
layerManager.getPanelState(type: PanelType): PanelState | undefined
layerManager.getVisiblePanels(): PanelType[]
layerManager.getPanelsByLayer(layer: UILayer): PanelType[]
layerManager.isPanelCore(type: PanelType): boolean
layerManager.getPanelHierarchy(type: PanelType): PanelHierarchy
layerManager.getLayerConfig(layer: UILayer): LayerConfig
```

### VisualSemanticGrammar (static)

```typescript
VisualSemanticGrammar.translateEngineState(
  engine: EngineState,
  intensity: number,
  metadata?: Record<string, unknown>
): VisualPhenomenon[]

VisualSemanticGrammar.translateOmegaStage(
  stage: OmegaPipelineStage,
  progress: number
): VisualPhenomenon[]

VisualSemanticGrammar.translateMemoryState(
  memoryState: MemoryState,
  intensity: number
): VisualPhenomenon[]

VisualSemanticGrammar.translateSystemEvent(
  event: string,
  metadata?: Record<string, unknown>
): VisualPhenomenon[]

VisualSemanticGrammar.getSignaturePhenomenon(): VisualPhenomenon
```

---

## 🎨 Enums & Constants Clés

### EngineState

```typescript
enum EngineState {
  IDENTITY = 'identity',
  ALIGNMENT = 'alignment',
  CORRECTION = 'correction',
  META_REVIEW = 'meta_review',
  SELF_HEALING = 'self_healing',
  PERFORMANCE = 'performance',
  EVOLUTION = 'evolution',
  BEHAVIOR = 'behavior',
  AUDIT = 'audit',
}
```

### OmegaPipelineStage

```typescript
enum OmegaPipelineStage {
  STAGE_0 = 'omega_0_idle',
  STAGE_1 = 'omega_1_reception',
  STAGE_2 = 'omega_2_analysis',
  STAGE_3 = 'omega_3_context',
  STAGE_4 = 'omega_4_reasoning',
  STAGE_5 = 'omega_5_synthesis',
  STAGE_6 = 'omega_6_validation',
  STAGE_7 = 'omega_7_formatting',
  STAGE_8 = 'omega_8_delivery',
  STAGE_9 = 'omega_9_learning',
  STAGE_10 = 'omega_10_integration',
}
```

### UIMode

```typescript
enum UIMode {
  AUTO = 'auto',
  MINIMAL = 'minimal',
  PERFORMANCE = 'performance',
  IMMERSIVE = 'immersive',
  DEBUG = 'debug',
}
```

### UILayer

```typescript
enum UILayer {
  BACKGROUND = 0,
  VISUAL_CORE = 1,
  PRIMARY_PANELS = 2,
  SECONDARY_PANELS = 3,
  OVERLAYS = 4,
  DEBUG = 5,
}
```

### PanelType (15 types)

```typescript
enum PanelType {
  // Primary
  CHAT = 'chat',
  MEMORY = 'memory',
  DEVTOOLS = 'devtools',

  // Secondary
  GOVERNANCE = 'governance',
  SELF_HEALING = 'self_healing',
  SYSTEM_HEALTH = 'system_health',
  VOICE_MONITOR = 'voice_monitor',
  PHYSIOLOGICAL = 'physiological',
  PRESENCE = 'presence',

  // Overlays
  NOTIFICATION = 'notification',
  MODAL = 'modal',
  TOOLTIP = 'tooltip',
  CONTEXT_MENU = 'context_menu',

  // Debug
  FPS_MONITOR = 'fps_monitor',
  STATE_INSPECTOR = 'state_inspector',
  PHENOMENA_DEBUG = 'phenomena_debug',
}
```

---

## 🔗 Liens Utiles

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Architecture globale TITANE∞
- **[SUPER_PROMPT_4_PHASE_1-2_COMPLETE.md](./SUPER_PROMPT_4_PHASE_1-2_COMPLETE.md)** — Précédent travail UI
- **[src/visual-engine/](./src/visual-engine/)** — Code source

---

## 💬 Questions Fréquentes

**Q: Quelle est la différence entre Visual Engine et Visual Conductor ?**
R: Le **Visual Engine** (V21) gère le rendu (particules, effets, canvas). Le **Visual Conductor** orchestre _quels_ phénomènes activer _quand_, selon les événements OS.

**Q: Dois-je toujours utiliser le Conductor ?**
R: Non. Pour des animations simples, vous pouvez appeler directement le Visual Engine. Le Conductor est pour l'orchestration complexe multi-événements.

**Q: Comment débugger les phénomènes actifs ?**
R: Passez en `UIMode.DEBUG` et consultez `conductor.getActivePhenomena()`. Ou activez `debug: true` dans la config du Conductor.

**Q: Le mode AUTO ralentit-il le système ?**
R: Non. Le monitoring toutes les 2s a un coût négligeable (<0.1ms). Les ajustements sont bénéfiques pour maintenir 60fps.

**Q: Puis-je créer des phénomènes custom ?**
R: Oui ! Créez un `VisualPhenomenon` avec votre `PhenomenonType` custom et appelez `conductor.processPhenomena([customPhenomenon])`.

---

_TITANE∞ v21 — Living UI System — Quick Reference_
_© 2025 Humain Total / Kevin Thibault / TITANE Team_
