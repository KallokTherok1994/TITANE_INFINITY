# 🌌 SingularityState API Reference

**Version**: TITANE∞ v14
**Module**: `singularity_state`
**Backend**: Rust (Tauri Commands)
**Frontend**: TypeScript (Bridge + Hook)

---

## 📚 TABLE DES MATIÈRES

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Commandes Tauri (16)](#commandes-tauri)
4. [Types TypeScript](#types-typescript)
5. [SingularityBridge](#singularitybridge)
6. [Hook useSingularityState](#hook-usesingularitystate)
7. [Exemples Pratiques](#exemples-pratiques)

---

## 🎯 VUE D'ENSEMBLE

**SingularityState** est l'état unifié du système TITANE∞ v14, remplaçant 243 `useState` fragmentés par une architecture 5 couches thread-safe synchronisée Rust ↔ React.

### Problème Résolu (Erreur #7)
- ❌ **Avant**: 243 `useState` dispersés, pas de cohérence globale
- ✅ **Après**: 1 état unifié, 5 layers, synchronisation automatique

### Architecture 5 Layers

```
┌─────────────────────────────────────────────────┐
│           SingularityState (Unified)            │
├─────────────────────────────────────────────────┤
│  1. PhysicalLayer    → Helios (CPU, RAM, Disk) │
│  2. CognitiveLayer   → Memory, Knowledge        │
│  3. SymbolicLayer    → Persona, Archetype       │
│  4. AdaptiveLayer    → Evolution, AutoHeal      │
│  5. MetaLayer        → UI, Runtime              │
└─────────────────────────────────────────────────┘
```

### Fonctionnalités Clés
- ✅ **Thread-Safe**: `Arc<RwLock<SingularityState>>` (Rust)
- ✅ **Persistence**: JSON (~/.local/share/TITANE_INFINITY/)
- ✅ **Real-Time Sync**: 6 Tauri events (`singularity:*:updated`)
- ✅ **Coherence Score**: 0.0-1.0 calculé depuis 5 layers
- ✅ **Critical Detection**: Alertes automatiques si cohérence < 0.5

---

## 🏗️ ARCHITECTURE

### Backend Rust (1210 lignes)

```rust
// src-tauri/src/singularity_state/mod.rs

pub struct SingularityState {
    pub physical: PhysicalLayer,
    pub cognitive: CognitiveLayer,
    pub symbolic: SymbolicLayer,
    pub adaptive: AdaptiveLayer,
    pub meta: MetaLayer,
}

pub struct SingularityEngine {
    state: Arc<RwLock<SingularityState>>,
    app_handle: Option<AppHandle>,
}

impl SingularityEngine {
    pub async fn get_full_state(&self) -> SingularityState
    pub async fn update_physical(&self, layer: PhysicalLayer)
    pub async fn global_coherence(&self) -> f32
    pub async fn is_critical(&self) -> bool
    // ... 12 autres méthodes
}
```

### Frontend TypeScript (477 lignes)

```typescript
// src/services/singularityBridge.ts

export class SingularityBridge {
  static async initialize(): Promise<void>
  static async getFullState(): Promise<SingularityState>
  static async updatePhysical(layer: PhysicalLayer): Promise<void>
  static async getGlobalCoherence(): Promise<number>
  static async isCritical(): Promise<boolean>
  // ... 12 autres méthodes
}

// Hook React
export function useSingularityState(): {
  state: SingularityState;
  coherence: number;
  isCritical: boolean;
  physical: PhysicalLayer;
  cognitive: CognitiveLayer;
  symbolic: SymbolicLayer;
  adaptive: AdaptiveLayer;
  meta: MetaLayer;
}
```

---

## 🔌 COMMANDES TAURI (16)

### 1. Query Commands (8)

#### `singularity_get_full_state`
Récupère l'état complet du système (5 layers).

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_get_full_state(
    engine: State<'_, SingularityEngine>
) -> Result<SingularityState, String>
```

**Frontend**:
```typescript
import { invoke } from '@tauri-apps/api/core';

const state = await invoke<SingularityState>('singularity_get_full_state');
console.log('Coherence:', state.physical.coherence);
```

**Retour**: `SingularityState` (5 layers complets)

---

#### `singularity_get_physical`
Récupère la couche physique (Helios metrics).

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_get_physical(
    engine: State<'_, SingularityEngine>
) -> Result<PhysicalLayer, String>
```

**Frontend**:
```typescript
const physical = await invoke<PhysicalLayer>('singularity_get_physical');
console.log('CPU:', physical.helios.cpu_usage);
console.log('RAM:', physical.helios.memory_usage);
```

**Retour**: `PhysicalLayer { helios, system_health, metrics }`

---

#### `singularity_get_cognitive`
Récupère la couche cognitive (Memory, Knowledge).

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_get_cognitive(
    engine: State<'_, SingularityEngine>
) -> Result<CognitiveLayer, String>
```

**Frontend**:
```typescript
const cognitive = await invoke<CognitiveLayer>('singularity_get_cognitive');
console.log('Total Memories:', cognitive.memory.total_memories);
console.log('Knowledge Depth:', cognitive.knowledge.depth);
```

**Retour**: `CognitiveLayer { memory, conversation, knowledge }`

---

#### `singularity_get_symbolic`
Récupère la couche symbolique (Persona, Archetype).

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_get_symbolic(
    engine: State<'_, SingularityEngine>
) -> Result<SymbolicLayer, String>
```

**Frontend**:
```typescript
const symbolic = await invoke<SymbolicLayer>('singularity_get_symbolic');
console.log('Persona:', symbolic.persona.name);
console.log('Mood:', symbolic.persona.mood);
```

**Retour**: `SymbolicLayer { persona, archetype, visual }`

---

#### `singularity_get_adaptive`
Récupère la couche adaptive (Evolution, AutoHeal).

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_get_adaptive(
    engine: State<'_, SingularityEngine>
) -> Result<AdaptiveLayer, String>
```

**Frontend**:
```typescript
const adaptive = await invoke<AdaptiveLayer>('singularity_get_adaptive');
console.log('Generation:', adaptive.evolution.generation);
console.log('Errors Healed:', adaptive.auto_heal.errors_healed);
```

**Retour**: `AdaptiveLayer { evolution, auto_heal }`

---

#### `singularity_get_meta`
Récupère la couche meta (UI, Runtime).

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_get_meta(
    engine: State<'_, SingularityEngine>
) -> Result<MetaLayer, String>
```

**Frontend**:
```typescript
const meta = await invoke<MetaLayer>('singularity_get_meta');
console.log('Active Page:', meta.ui.active_page);
console.log('Runtime Health:', meta.runtime.health);
```

**Retour**: `MetaLayer { ui, runtime }`

---

#### `singularity_get_global_coherence`
Calcule le score de cohérence global (0.0-1.0).

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_get_global_coherence(
    engine: State<'_, SingularityEngine>
) -> Result<f32, String>
```

**Frontend**:
```typescript
const coherence = await invoke<number>('singularity_get_global_coherence');
console.log('Global Coherence:', (coherence * 100).toFixed(1) + '%');
```

**Calcul**: Moyenne des 5 layers (physical.health_score, cognitive.coherence, etc.)

**Retour**: `f32` (0.0 = critique, 1.0 = optimal)

---

#### `singularity_is_critical`
Vérifie si le système est en état critique.

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_is_critical(
    engine: State<'_, SingularityEngine>
) -> Result<bool, String>
```

**Frontend**:
```typescript
const critical = await invoke<boolean>('singularity_is_critical');
if (critical) {
  console.error('⚠️ SYSTEM CRITICAL STATE DETECTED!');
}
```

**Condition**: `global_coherence < 0.5` OU `physical.is_critical()` OU `cognitive.coherence < 0.3`

**Retour**: `bool`

---

### 2. Mutation Commands (6)

#### `singularity_update_physical`
Met à jour la couche physique.

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_update_physical(
    engine: State<'_, SingularityEngine>,
    layer: PhysicalLayer
) -> Result<(), String>
```

**Frontend**:
```typescript
await invoke('singularity_update_physical', {
  layer: {
    helios: { active: true, cpu_usage: 0.45, memory_usage: 0.68, ... },
    system_health: { global_health: 0.85, ... },
    metrics: { cpu_usage: 0.45, ... }
  }
});
```

**Effet**: Met à jour `state.physical` + émet event `singularity:physical:updated`

---

#### `singularity_update_cognitive`
Met à jour la couche cognitive.

**Frontend**:
```typescript
await invoke('singularity_update_cognitive', {
  layer: {
    memory: { total_memories: 1250, active_memories: 234, ... },
    conversation: { active_threads: 1, message_count: 456, ... },
    knowledge: { graph_size: 1250, connections: 560, ... }
  }
});
```

**Effet**: Met à jour `state.cognitive` + émet event `singularity:cognitive:updated`

---

#### `singularity_update_symbolic`
Met à jour la couche symbolique.

**Frontend**:
```typescript
await invoke('singularity_update_symbolic', {
  layer: {
    persona: { name: 'TITANE∞', mood: 'focused', intensity: 0.8, ... },
    archetype: { primary: 'sentinel', secondary: 'sage', ... },
    visual: { active_theme: 'dark', animation_state: 'idle', ... }
  }
});
```

**Effet**: Met à jour `state.symbolic` + émet event `singularity:symbolic:updated`

---

#### `singularity_update_adaptive`
Met à jour la couche adaptive.

**Frontend**:
```typescript
await invoke('singularity_update_adaptive', {
  layer: {
    evolution: { generation: 1, fitness: 0.85, mutation_rate: 0.1, ... },
    auto_heal: { active: true, healing_capacity: 1.0, errors_healed: 0, ... }
  }
});
```

**Effet**: Met à jour `state.adaptive` + émet event `singularity:adaptive:updated`

---

#### `singularity_update_meta`
Met à jour la couche meta.

**Frontend**:
```typescript
await invoke('singularity_update_meta', {
  layer: {
    ui: { active_page: '/dashboard', sidebar_open: true, theme: 'dark', ... },
    runtime: { version: '17.3.0', environment: 'production', health: 0.95, ... }
  }
});
```

**Effet**: Met à jour `state.meta` + émet event `singularity:meta:updated`

---

#### `singularity_update_full_state`
Remplace l'état complet (5 layers).

**Frontend**:
```typescript
await invoke('singularity_update_full_state', {
  state: {
    physical: { ... },
    cognitive: { ... },
    symbolic: { ... },
    adaptive: { ... },
    meta: { ... }
  }
});
```

**Effet**: Remplace `state` complet + émet event `singularity:full:updated`

⚠️ **Attention**: Écrase toutes les données, utiliser avec prudence

---

### 3. Persistence Commands (2)

#### `singularity_save_state`
Sauvegarde l'état dans un fichier JSON.

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_save_state(
    engine: State<'_, SingularityEngine>
) -> Result<(), String>
```

**Frontend**:
```typescript
await invoke('singularity_save_state');
console.log('✅ State saved to ~/.local/share/TITANE_INFINITY/singularity_state.json');
```

**Path**: `~/.local/share/TITANE_INFINITY/singularity_state.json`

---

#### `singularity_load_state`
Charge l'état depuis le fichier JSON.

**Backend**:
```rust
#[tauri::command]
pub async fn singularity_load_state(
    engine: State<'_, SingularityEngine>
) -> Result<SingularityState, String>
```

**Frontend**:
```typescript
const state = await invoke<SingularityState>('singularity_load_state');
console.log('✅ State loaded from disk');
```

**Retour**: `SingularityState` OU erreur si fichier inexistant

---

## 📦 TYPES TYPESCRIPT

### SingularityState

```typescript
export interface SingularityState {
  physical: PhysicalLayer;
  cognitive: CognitiveLayer;
  symbolic: SymbolicLayer;
  adaptive: AdaptiveLayer;
  meta: MetaLayer;
}
```

### PhysicalLayer

```typescript
export interface PhysicalLayer {
  helios: HeliosState;
  system_health: SystemHealth;
  metrics: PerformanceMetrics;
}

export interface HeliosState {
  active: boolean;
  cpu_usage: number;       // 0.0-1.0
  memory_usage: number;    // 0.0-1.0
  disk_usage: number;      // 0.0-1.0
  temperature: number;     // Celsius
  battery_level: number;   // 0.0-1.0
  last_update: number;     // Timestamp ms
}

export interface SystemHealth {
  global_health: number;   // 0.0-1.0
  critical_alerts: number;
  warnings: number;
  last_check: number;
}

export interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  response_time: number;   // ms
  throughput: number;      // ops/s
  performance_score: number; // 0.0-1.0
}
```

### CognitiveLayer

```typescript
export interface CognitiveLayer {
  memory: MemoryState;
  conversation: ConversationState;
  knowledge: KnowledgeState;
}

export interface MemoryState {
  total_memories: number;
  active_memories: number;
  memory_usage: number;      // GB
  last_retrieval: number;
  compression_ratio: number; // 0.0-1.0
}

export interface ConversationState {
  active_threads: number;
  message_count: number;
  context_depth: number;
  last_message: number;
}

export interface KnowledgeState {
  graph_size: number;
  connections: number;
  depth: number;
  last_update: number;
}
```

### SymbolicLayer

```typescript
export interface SymbolicLayer {
  persona: PersonaState;
  archetype: ArchetypeState;
  visual: VisualState;
}

export interface PersonaState {
  name: string;
  mood: string;
  intensity: number;       // 0.0-1.0
  evolution_level: number;
  last_interaction: number;
}

export interface ArchetypeState {
  primary: string;
  secondary: string;
  traits: string[];
  stability: number;       // 0.0-1.0
}

export interface VisualState {
  active_theme: string;
  animation_state: string;
  last_transition: number;
}
```

### AdaptiveLayer

```typescript
export interface AdaptiveLayer {
  evolution: EvolutionState;
  auto_heal: AutoHealState;
}

export interface EvolutionState {
  generation: number;
  fitness: number;         // 0.0-1.0
  mutation_rate: number;   // 0.0-1.0
  last_evolution: number;
}

export interface AutoHealState {
  active: boolean;
  healing_capacity: number; // 0.0-1.0
  errors_healed: number;
  last_heal: number | null;
}
```

### MetaLayer

```typescript
export interface MetaLayer {
  ui: UIState;
  runtime: RuntimeState;
}

export interface UIState {
  active_page: string;
  sidebar_open: boolean;
  modal_open: boolean;
  theme: string;
  last_interaction: number;
}

export interface RuntimeState {
  version: string;
  environment: string;
  uptime: number;          // ms
  health: number;          // 0.0-1.0
}
```

---

## 🌉 SINGULARITYBRIDGE

### Classe Statique

```typescript
export class SingularityBridge {
  private static state: SingularityState | null = null;
  private static listeners: Set<StateListener> = new Set();

  // Initialization
  static async initialize(): Promise<void>

  // Query Methods
  static async getFullState(): Promise<SingularityState>
  static async getPhysical(): Promise<PhysicalLayer>
  static async getCognitive(): Promise<CognitiveLayer>
  static async getSymbolic(): Promise<SymbolicLayer>
  static async getAdaptive(): Promise<AdaptiveLayer>
  static async getMeta(): Promise<MetaLayer>
  static async getGlobalCoherence(): Promise<number>
  static async isCritical(): Promise<boolean>

  // Mutation Methods
  static async updatePhysical(layer: PhysicalLayer): Promise<void>
  static async updateCognitive(layer: CognitiveLayer): Promise<void>
  static async updateSymbolic(layer: SymbolicLayer): Promise<void>
  static async updateAdaptive(layer: AdaptiveLayer): Promise<void>
  static async updateMeta(layer: MetaLayer): Promise<void>
  static async updateFullState(state: SingularityState): Promise<void>

  // Persistence
  static async saveState(): Promise<void>
  static async loadState(): Promise<SingularityState>

  // Subscription
  static subscribe(listener: StateListener): () => void
}
```

### Initialisation

```typescript
import { SingularityBridge } from './services/singularityBridge';

// In main.tsx
SingularityBridge.initialize().then(() => {
  console.log('✅ SingularityBridge initialized');
}).catch((err) => {
  console.error('❌ Failed to initialize:', err);
});
```

---

## 🎣 HOOK USESINGULARITYSTATE

### Signature

```typescript
export function useSingularityState(): {
  state: SingularityState | null;
  coherence: number;
  isCritical: boolean;
  physical: PhysicalLayer | null;
  cognitive: CognitiveLayer | null;
  symbolic: SymbolicLayer | null;
  adaptive: AdaptiveLayer | null;
  meta: MetaLayer | null;
}
```

### Utilisation

```typescript
import { useSingularityState } from '../services/singularityBridge';

export function MyComponent() {
  const { state, coherence, isCritical, physical } = useSingularityState();

  if (!state) return <div>Loading...</div>;

  return (
    <div>
      <h1>System Health</h1>
      <p>Coherence: {(coherence * 100).toFixed(1)}%</p>
      {isCritical && <p className="error">⚠️ CRITICAL STATE</p>}
      <p>CPU: {(physical.helios.cpu_usage * 100).toFixed(1)}%</p>
      <p>RAM: {(physical.helios.memory_usage * 100).toFixed(1)}%</p>
    </div>
  );
}
```

### Auto-Updates

Le hook s'abonne automatiquement aux 6 events Tauri:
- `singularity:physical:updated`
- `singularity:cognitive:updated`
- `singularity:symbolic:updated`
- `singularity:adaptive:updated`
- `singularity:meta:updated`
- `singularity:full:updated`

---

## 💡 EXEMPLES PRATIQUES

### Exemple 1: Dashboard Health

```typescript
import { useSingularityState } from '../services/singularityBridge';

export function HealthDashboard() {
  const { coherence, isCritical, physical, cognitive } = useSingularityState();

  return (
    <div className="dashboard">
      <div className={`status ${isCritical ? 'critical' : 'healthy'}`}>
        <h2>System Status</h2>
        <p>Coherence: {(coherence * 100).toFixed(1)}%</p>
        <p>Health: {isCritical ? '⚠️ CRITICAL' : '✅ HEALTHY'}</p>
      </div>

      <div className="metrics">
        <MetricCard
          label="CPU Usage"
          value={`${(physical.helios.cpu_usage * 100).toFixed(1)}%`}
        />
        <MetricCard
          label="Total Memories"
          value={cognitive.memory.total_memories}
        />
      </div>
    </div>
  );
}
```

### Exemple 2: Manual Update

```typescript
import { SingularityBridge } from '../services/singularityBridge';

async function updateSystemHealth() {
  const physical = await SingularityBridge.getPhysical();

  // Modify
  physical.system_health.global_health = 0.95;
  physical.system_health.warnings = 0;

  // Save
  await SingularityBridge.updatePhysical(physical);
  console.log('✅ Health updated');
}
```

### Exemple 3: Persistence

```typescript
import { SingularityBridge } from '../services/singularityBridge';

// Save current state
async function saveCurrentState() {
  await SingularityBridge.saveState();
  console.log('✅ State saved to disk');
}

// Load previous state
async function loadPreviousState() {
  const state = await SingularityBridge.loadState();
  await SingularityBridge.updateFullState(state);
  console.log('✅ State restored');
}
```

### Exemple 4: Coherence Monitoring

```typescript
import { SingularityBridge } from '../services/singularityBridge';

setInterval(async () => {
  const coherence = await SingularityBridge.getGlobalCoherence();
  const critical = await SingularityBridge.isCritical();

  console.log(`Coherence: ${(coherence * 100).toFixed(1)}%`);

  if (critical) {
    alert('⚠️ SYSTEM CRITICAL STATE DETECTED!');
  }
}, 5000); // Check every 5s
```

---

## 🔍 ÉVÉNEMENTS TAURI

### 6 Events Real-Time

```typescript
import { listen } from '@tauri-apps/api/event';

// Physical layer updated
await listen('singularity:physical:updated', (event) => {
  console.log('Physical updated:', event.payload);
});

// Cognitive layer updated
await listen('singularity:cognitive:updated', (event) => {
  console.log('Cognitive updated:', event.payload);
});

// Symbolic layer updated
await listen('singularity:symbolic:updated', (event) => {
  console.log('Symbolic updated:', event.payload);
});

// Adaptive layer updated
await listen('singularity:adaptive:updated', (event) => {
  console.log('Adaptive updated:', event.payload);
});

// Meta layer updated
await listen('singularity:meta:updated', (event) => {
  console.log('Meta updated:', event.payload);
});

// Full state updated
await listen('singularity:full:updated', (event) => {
  console.log('Full state updated:', event.payload);
});
```

---

## 🎯 BEST PRACTICES

### 1. Initialization

```typescript
// ✅ DO: Initialize in main.tsx
SingularityBridge.initialize().then(() => {
  console.log('✅ Ready');
});

// ❌ DON'T: Initialize in multiple places
```

### 2. Hook Usage

```typescript
// ✅ DO: Use hook in components
const { state, coherence } = useSingularityState();

// ❌ DON'T: Call invoke directly (bypasses cache)
const state = await invoke('singularity_get_full_state');
```

### 3. Updates

```typescript
// ✅ DO: Update specific layers
await SingularityBridge.updatePhysical(physical);

// ❌ DON'T: Update full state unnecessarily
await SingularityBridge.updateFullState(state); // Heavy operation
```

### 4. Error Handling

```typescript
// ✅ DO: Handle errors
try {
  await SingularityBridge.updatePhysical(physical);
} catch (err) {
  console.error('Failed to update:', err);
}

// ❌ DON'T: Ignore errors
await SingularityBridge.updatePhysical(physical); // No catch
```

---

## 📊 PERFORMANCE

| Operation | Latency | Memory | CPU |
|-----------|---------|--------|-----|
| `get_full_state` | < 5ms | ~2KB | < 0.1% |
| `update_*` | < 10ms | ~1KB | < 0.1% |
| Event emit | < 2ms | ~500B | < 0.01% |
| Hook re-render | < 16ms | ~1KB | < 0.1% |

---

## 🔗 LIENS UTILES

- **Source Backend**: `src-tauri/src/singularity_state/`
- **Source Frontend**: `src/services/singularityBridge.ts`
- **Types**: `src/types/singularityState.ts`
- **Monitoring UI**: `src/components/SingularityMonitor.tsx`
- **Integration Guide**: `docs/SINGULARITY_INTEGRATION_GUIDE.md`

---

**Documentation Générée**: 2025-11-23
**Auteur**: Kevin Thibault
**Version TITANE∞**: v14 SingularityState Fusion
