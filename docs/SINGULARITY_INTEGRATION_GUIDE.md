# 🚀 Guide d'Intégration SingularityState

**Version**: TITANE∞ v14
**Audience**: Développeurs React + TypeScript
**Niveau**: Intermédiaire
**Temps de lecture**: 15 minutes

---

## 📚 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Architecture Overview](#architecture-overview)
4. [Patterns d'Intégration](#patterns-dintégration)
5. [Connexion Subsystèmes](#connexion-subsystèmes)
6. [Composants Exemples](#composants-exemples)
7. [Performance Tips](#performance-tips)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 INTRODUCTION

**SingularityState** remplace l'ancienne architecture fragmentée (243 `useState`) par un état unifié synchronisé Rust ↔ React.

### Avant vs Après

```typescript
// ❌ AVANT (v13) - État fragmenté
const [cpuUsage, setCpuUsage] = useState(0);
const [memoryUsage, setMemoryUsage] = useState(0);
const [coherence, setCoherence] = useState(0);
// ... 240 autres useState dispersés

// ✅ APRÈS (v14) - État unifié
const { state, coherence, physical } = useSingularityState();
// Tout est dans 1 source de vérité
```

### Bénéfices

- ✅ **Cohérence**: 1 source de vérité (backend Rust thread-safe)
- ✅ **Performance**: Cache local + updates optimisés
- ✅ **Real-Time**: Synchronisation automatique via Tauri events
- ✅ **Type-Safe**: Types TypeScript strict depuis Rust
- ✅ **Persistence**: Sauvegarde JSON automatique

---

## ⚡ QUICK START

### 1. Initialisation (main.tsx)

```typescript
// src/main.tsx
import { SingularityBridge } from './services/singularityBridge';
import { SingularityConnections } from './services/singularityConnections';

// Initialize bridge at app startup
SingularityBridge.initialize().then(() => {
  console.log('✅ SingularityBridge initialized');

  // Start automatic subsystem connections (5s polling)
  SingularityConnections.start(5000);
  console.log('🔗 SingularityConnections started');
}).catch((err) => {
  console.error('❌ SingularityBridge failed:', err);
});
```

### 2. Hook Usage (Component)

```typescript
// src/components/MyComponent.tsx
import { useSingularityState } from '../services/singularityBridge';

export function MyComponent() {
  const { state, coherence, isCritical, physical } = useSingularityState();

  if (!state) return <div>Loading...</div>;

  return (
    <div>
      <h1>System Status</h1>
      <p>Coherence: {(coherence * 100).toFixed(1)}%</p>
      <p>CPU: {(physical.helios.cpu_usage * 100).toFixed(1)}%</p>
      {isCritical && <p className="error">⚠️ CRITICAL</p>}
    </div>
  );
}
```

### 3. Manual Updates (Service)

```typescript
// src/services/myService.ts
import { SingularityBridge } from './singularityBridge';

export async function updateCPUMetrics(cpuUsage: number) {
  const physical = await SingularityBridge.getPhysical();

  physical.helios.cpu_usage = cpuUsage / 100; // 0-100 → 0-1
  physical.helios.last_update = Date.now();

  await SingularityBridge.updatePhysical(physical);
  console.log('✅ CPU metrics updated');
}
```

---

## 🏗️ ARCHITECTURE OVERVIEW

### Flux de Données

```
┌────────────────────────────────────────────────────────────┐
│                    BACKEND (Rust)                          │
│  ┌──────────────────────────────────────────────────┐     │
│  │  SingularityEngine (Arc<RwLock<SingularityState>>)│    │
│  │                                                    │     │
│  │  • PhysicalLayer   → Helios (CPU, RAM, Disk)     │     │
│  │  • CognitiveLayer  → Memory, Knowledge           │     │
│  │  • SymbolicLayer   → Persona, Archetype          │     │
│  │  • AdaptiveLayer   → Evolution, AutoHeal         │     │
│  │  • MetaLayer       → UI, Runtime                 │     │
│  └──────────────────────────────────────────────────┘     │
│         ↕ Tauri IPC (16 commands + 6 events)              │
└────────────────────────────────────────────────────────────┘
                          ↕
┌────────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────┐     │
│  │  SingularityBridge (Static Class)               │     │
│  │  • Local cache (state: SingularityState | null) │     │
│  │  • Event listeners (6 Tauri events)             │     │
│  │  • Query methods (getFullState, getPhysical...) │     │
│  │  • Mutation methods (updatePhysical, ...)       │     │
│  └──────────────────────────────────────────────────┘     │
│         ↕ React Context + Subscriptions                    │
│  ┌──────────────────────────────────────────────────┐     │
│  │  useSingularityState() Hook                      │     │
│  │  • Auto-subscribes to updates                    │     │
│  │  • Returns state + computed values               │     │
│  │  • Triggers re-renders on changes                │     │
│  └──────────────────────────────────────────────────┘     │
│         ↓ Components                                       │
│  ┌──────────────────────────────────────────────────┐     │
│  │  <SingularityMonitor />                          │     │
│  │  <HealthDashboard />                             │     │
│  │  <SystemMetrics />                               │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### Synchronisation Automatique

```
┌─────────────────────────────────────────────────────┐
│  SingularityConnections Service (Polling 5s)       │
├─────────────────────────────────────────────────────┤
│  syncHelios()    → invoke('get_helios_metrics')    │
│                   → updatePhysical(physical)        │
│                                                     │
│  syncMemory()    → invoke('get_memory_state')      │
│                   → updateCognitive(cognitive)      │
│                                                     │
│  syncUIState()   → window.location.pathname        │
│                   → updateMeta(meta)                │
└─────────────────────────────────────────────────────┘
         ↓ Every 5 seconds
┌─────────────────────────────────────────────────────┐
│  Backend emits events:                              │
│  • singularity:physical:updated                     │
│  • singularity:cognitive:updated                    │
│  • singularity:meta:updated                         │
└─────────────────────────────────────────────────────┘
         ↓ Auto-received by
┌─────────────────────────────────────────────────────┐
│  SingularityBridge listeners                        │
│  → Updates local cache                              │
│  → Notifies subscribed components                   │
│  → Triggers re-renders                              │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 PATTERNS D'INTÉGRATION

### Pattern 1: Display-Only Component

**Usage**: Afficher des métriques en lecture seule

```typescript
import { useSingularityState } from '../services/singularityBridge';

export function SystemMetrics() {
  const { physical, cognitive } = useSingularityState();

  return (
    <div className="metrics-grid">
      <MetricCard
        label="CPU Usage"
        value={`${(physical.helios.cpu_usage * 100).toFixed(1)}%`}
      />
      <MetricCard
        label="RAM Usage"
        value={`${(physical.helios.memory_usage * 100).toFixed(1)}%`}
      />
      <MetricCard
        label="Total Memories"
        value={cognitive.memory.total_memories}
      />
    </div>
  );
}
```

**Avantages**:
- ✅ Simple (hook uniquement)
- ✅ Auto-updates (via Tauri events)
- ✅ No prop drilling

---

### Pattern 2: Interactive Component

**Usage**: Composant qui lit **et** modifie l'état

```typescript
import { useSingularityState } from '../services/singularityBridge';
import { SingularityBridge } from '../services/singularityBridge';
import { useState } from 'react';

export function PersonaEditor() {
  const { symbolic } = useSingularityState();
  const [mood, setMood] = useState(symbolic.persona.mood);

  const handleSave = async () => {
    const updated = {
      ...symbolic,
      persona: {
        ...symbolic.persona,
        mood,
        last_interaction: Date.now()
      }
    };

    await SingularityBridge.updateSymbolic(updated);
    console.log('✅ Persona updated');
  };

  return (
    <div>
      <input value={mood} onChange={(e) => setMood(e.target.value)} />
      <button onClick={handleSave}>Save Mood</button>
    </div>
  );
}
```

**Pattern**:
1. Lire état via hook `useSingularityState()`
2. Local state pour édition (`useState`)
3. Sauvegarder via `SingularityBridge.update*()`

---

### Pattern 3: Service Integration

**Usage**: Connecter un service externe au SingularityState

```typescript
// src/services/heliosService.ts
import { invoke } from '@tauri-apps/api/core';
import { SingularityBridge } from './singularityBridge';
import type { HeliosState } from '../types/singularityState';

export class HeliosService {
  static async collectMetrics(): Promise<void> {
    // 1. Fetch from backend
    const helios = await invoke<HeliosState>('get_helios_metrics');

    // 2. Get current physical layer
    const physical = await SingularityBridge.getPhysical();

    // 3. Update helios state
    physical.helios = {
      active: true,
      cpu_usage: helios.cpu_usage / 100,
      memory_usage: helios.ram_usage / 100,
      disk_usage: helios.disk_usage / 100,
      temperature: 0.0,
      battery_level: 1.0,
      last_update: Date.now()
    };

    // 4. Calculate health
    physical.system_health.global_health = this.calculateHealth(helios);
    physical.system_health.last_check = Date.now();

    // 5. Save to SingularityState
    await SingularityBridge.updatePhysical(physical);
  }

  private static calculateHealth(helios: HeliosState): number {
    const cpuHealth = helios.cpu_usage < 80 ? 1.0 : 0.5;
    const ramHealth = helios.ram_usage < 80 ? 1.0 : 0.5;
    const diskHealth = helios.disk_usage < 80 ? 1.0 : 0.5;
    return (cpuHealth + ramHealth + diskHealth) / 3;
  }
}

// Usage in main.tsx
setInterval(() => {
  HeliosService.collectMetrics();
}, 5000);
```

---

### Pattern 4: Conditional Rendering

**Usage**: Afficher UI basée sur état système

```typescript
import { useSingularityState } from '../services/singularityBridge';

export function AlertBanner() {
  const { coherence, isCritical, physical } = useSingularityState();

  if (coherence > 0.8) {
    return null; // System healthy, no alert
  }

  return (
    <div className={`alert ${isCritical ? 'critical' : 'warning'}`}>
      {isCritical && (
        <>
          <h3>⚠️ CRITICAL SYSTEM STATE</h3>
          <p>Coherence: {(coherence * 100).toFixed(1)}%</p>
        </>
      )}

      {physical.helios.cpu_usage > 0.9 && (
        <p>High CPU usage: {(physical.helios.cpu_usage * 100).toFixed(1)}%</p>
      )}

      {physical.helios.memory_usage > 0.9 && (
        <p>High RAM usage: {(physical.helios.memory_usage * 100).toFixed(1)}%</p>
      )}
    </div>
  );
}
```

---

### Pattern 5: Derived State

**Usage**: Calculer des valeurs dérivées de l'état

```typescript
import { useSingularityState } from '../services/singularityBridge';
import { useMemo } from 'react';

export function SystemSummary() {
  const { physical, cognitive } = useSingularityState();

  const avgResourceUsage = useMemo(() => {
    const { cpu_usage, memory_usage, disk_usage } = physical.helios;
    return (cpu_usage + memory_usage + disk_usage) / 3;
  }, [physical.helios]);

  const memoryEfficiency = useMemo(() => {
    const { total_memories, memory_usage } = cognitive.memory;
    return total_memories / (memory_usage * 1000); // memories per MB
  }, [cognitive.memory]);

  return (
    <div>
      <p>Avg Resource Usage: {(avgResourceUsage * 100).toFixed(1)}%</p>
      <p>Memory Efficiency: {memoryEfficiency.toFixed(0)} memories/MB</p>
    </div>
  );
}
```

---

## 🔗 CONNEXION SUBSYSTÈMES

### Helios → PhysicalLayer

```typescript
import { invoke } from '@tauri-apps/api/core';
import { SingularityBridge } from '../services/singularityBridge';

export async function syncHelios() {
  const helios = await invoke('get_helios_metrics');
  const physical = await SingularityBridge.getPhysical();

  physical.helios = {
    active: true,
    cpu_usage: helios.cpu_usage / 100,
    memory_usage: helios.ram_usage / 100,
    disk_usage: helios.disk_usage / 100,
    temperature: 0.0,
    battery_level: 1.0,
    last_update: Date.now()
  };

  await SingularityBridge.updatePhysical(physical);
}
```

### Memory → CognitiveLayer

```typescript
import { invoke } from '@tauri-apps/api/core';
import { SingularityBridge } from '../services/singularityBridge';

export async function syncMemory() {
  const memory = await invoke('get_memory_state');
  const cognitive = await SingularityBridge.getCognitive();

  cognitive.memory = {
    total_memories: memory.snapshots_count + memory.log_entries_count,
    active_memories: memory.snapshots_count,
    memory_usage: memory.storage_size_mb / 1024,
    last_retrieval: Date.now(),
    compression_ratio: 0.9
  };

  await SingularityBridge.updateCognitive(cognitive);
}
```

### UI Router → MetaLayer

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SingularityBridge } from '../services/singularityBridge';

export function useMetaTracking() {
  const location = useLocation();

  useEffect(() => {
    const updateMeta = async () => {
      const meta = await SingularityBridge.getMeta();

      meta.ui.active_page = location.pathname;
      meta.ui.last_interaction = Date.now();

      await SingularityBridge.updateMeta(meta);
    };

    updateMeta();
  }, [location.pathname]);
}

// Usage in App.tsx
export function App() {
  useMetaTracking(); // Track route changes

  return (
    <Router>
      {/* routes */}
    </Router>
  );
}
```

---

## 🧩 COMPOSANTS EXEMPLES

### Exemple 1: Health Badge

```typescript
import { useSingularityState } from '../services/singularityBridge';

export function HealthBadge() {
  const { coherence, isCritical } = useSingularityState();

  const getStatus = () => {
    if (isCritical) return { label: 'CRITICAL', color: 'red' };
    if (coherence < 0.6) return { label: 'WARNING', color: 'orange' };
    return { label: 'HEALTHY', color: 'green' };
  };

  const status = getStatus();

  return (
    <div className="health-badge" style={{ backgroundColor: status.color }}>
      <span>{status.label}</span>
      <span>{(coherence * 100).toFixed(1)}%</span>
    </div>
  );
}
```

### Exemple 2: Resource Chart

```typescript
import { useSingularityState } from '../services/singularityBridge';

export function ResourceChart() {
  const { physical } = useSingularityState();

  const { cpu_usage, memory_usage, disk_usage } = physical.helios;

  return (
    <div className="resource-chart">
      <ProgressBar label="CPU" value={cpu_usage * 100} />
      <ProgressBar label="RAM" value={memory_usage * 100} />
      <ProgressBar label="Disk" value={disk_usage * 100} />
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="progress-bar">
      <span>{label}</span>
      <div className="bar">
        <div className="fill" style={{ width: `${value}%` }} />
      </div>
      <span>{value.toFixed(1)}%</span>
    </div>
  );
}
```

### Exemple 3: Memory Timeline

```typescript
import { useSingularityState } from '../services/singularityBridge';

export function MemoryTimeline() {
  const { cognitive } = useSingularityState();

  return (
    <div className="memory-timeline">
      <h3>Memory State</h3>
      <p>Total: {cognitive.memory.total_memories}</p>
      <p>Active: {cognitive.memory.active_memories}</p>
      <p>Storage: {cognitive.memory.memory_usage.toFixed(2)} GB</p>
      <p>Compression: {(cognitive.memory.compression_ratio * 100).toFixed(1)}%</p>

      <h4>Knowledge Graph</h4>
      <p>Size: {cognitive.knowledge.graph_size} nodes</p>
      <p>Connections: {cognitive.knowledge.connections}</p>
      <p>Depth: {cognitive.knowledge.depth}</p>
    </div>
  );
}
```

---

## ⚡ PERFORMANCE TIPS

### 1. Éviter Re-Renders Inutiles

```typescript
// ❌ BAD: Re-render on every state change
const { state } = useSingularityState();

// ✅ GOOD: Extract only needed fields
const { physical, coherence } = useSingularityState();
```

### 2. Memoize Computed Values

```typescript
import { useMemo } from 'react';

const avgUsage = useMemo(() => {
  const { cpu_usage, memory_usage, disk_usage } = physical.helios;
  return (cpu_usage + memory_usage + disk_usage) / 3;
}, [physical.helios]); // Only recompute if helios changes
```

### 3. Debounce Updates

```typescript
import { debounce } from 'lodash';

const debouncedUpdate = debounce(async (value) => {
  await SingularityBridge.updateSymbolic(value);
}, 500); // Wait 500ms after last change
```

### 4. Batch Updates

```typescript
// ❌ BAD: Multiple updates
await SingularityBridge.updatePhysical(physical);
await SingularityBridge.updateCognitive(cognitive);
await SingularityBridge.updateMeta(meta);

// ✅ GOOD: Single full state update
await SingularityBridge.updateFullState({
  physical,
  cognitive,
  symbolic,
  adaptive,
  meta
});
```

### 5. Conditional Rendering

```typescript
// ✅ Skip expensive renders when not needed
if (!state || coherence > 0.9) {
  return null; // System healthy, no need to display
}
```

---

## 🐛 TROUBLESHOOTING

### Problème 1: Hook Returns Null

**Symptôme**:
```typescript
const { state } = useSingularityState();
console.log(state); // null
```

**Causes**:
1. `SingularityBridge.initialize()` pas appelé
2. Backend Rust pas démarré (Tauri dev mode)
3. Command Tauri échoue

**Solution**:
```typescript
// main.tsx
SingularityBridge.initialize().then(() => {
  console.log('✅ Bridge ready');
}).catch((err) => {
  console.error('❌ Failed:', err);
  // Check: Is Tauri running? Are commands registered?
});
```

---

### Problème 2: Updates Not Reflecting

**Symptôme**:
```typescript
await SingularityBridge.updatePhysical(physical);
// Component doesn't re-render
```

**Causes**:
1. Component pas abonné (`useSingularityState()` manquant)
2. Backend event pas émis

**Solution**:
```typescript
// ✅ Use hook to auto-subscribe
const { physical } = useSingularityState();

// Check backend emits events
// src-tauri/src/singularity_state/sync.rs
self.app_handle.emit_all("singularity:physical:updated", &state.physical)?;
```

---

### Problème 3: Type Errors

**Symptôme**:
```typescript
const physical = await SingularityBridge.getPhysical();
physical.helios.cpu_usage = 50; // Type error: number vs f32
```

**Solution**:
```typescript
// ✅ Normalize: 0-100 → 0-1
physical.helios.cpu_usage = 50 / 100; // 0.5
```

---

### Problème 4: Performance Lag

**Symptôme**: App laggy après plusieurs minutes

**Causes**:
1. Polling trop fréquent (< 1s)
2. State trop gros (> 10MB)
3. Re-renders excessifs

**Solution**:
```typescript
// ✅ Increase polling interval
SingularityConnections.start(10000); // 10s instead of 5s

// ✅ Extract only needed fields
const { coherence } = useSingularityState(); // Not full state

// ✅ Memoize
const value = useMemo(() => compute(state), [state]);
```

---

## 📚 RESSOURCES COMPLÉMENTAIRES

- **API Reference**: `docs/SINGULARITY_STATE_API.md`
- **Backend Source**: `src-tauri/src/singularity_state/`
- **Frontend Source**: `src/services/singularityBridge.ts`
- **Types**: `src/types/singularityState.ts`
- **Monitoring UI**: `src/components/SingularityMonitor.tsx`

---

## ✅ CHECKLIST INTÉGRATION

- [ ] `SingularityBridge.initialize()` dans `main.tsx`
- [ ] `SingularityConnections.start()` activé (optionnel)
- [ ] Hook `useSingularityState()` dans composants
- [ ] Events Tauri écoutés (auto via bridge)
- [ ] Types TypeScript importés depuis `types/singularityState.ts`
- [ ] Error handling (`try/catch` sur updates)
- [ ] Performance memoization (`useMemo` pour computed values)
- [ ] Persistence activée (`saveState()` avant unmount)

---

**Documentation Générée**: 2025-11-23
**Auteur**: Kevin Thibault
**Version TITANE∞**: v14 SingularityState Fusion
