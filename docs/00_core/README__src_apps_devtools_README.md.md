# TITANE∞ DevTools — Guide d'Usage

## 📦 Installation

Les DevTools sont déjà intégrés dans TITANE∞. Aucune installation supplémentaire requise.

## 🚀 Utilisation Basique

### Importer et Afficher DevTools

```tsx
import { DevToolsApp } from '@/apps/devtools';

function App() {
  return <DevToolsApp defaultSection="dashboard" />;
}
```

### Navigation entre Sections

7 sections disponibles:

- **Dashboard**: Vue d'ensemble système (health, metrics, engines, logs)
- **Metrics**: Monitoring performance avec time ranges (30s→1h)
- **Logs**: Streaming temps réel avec filtres (level/engine/search)
- **Engines**: 9 moteurs cognitifs (restart/inspect/logs)
- **Memory**: STM/MTM/LTM tree explorer
- **Pipeline**: Visualisation Omega (8 étapes)
- **Errors**: Gestion erreurs (retry/resolve)

## 🔗 Intégration Backend Rust

### Envoyer des Events depuis Rust

```rust
use tauri::Manager;

// Statut engine
app.emit_all("engine-status-update", json!({
    "id": "helios",
    "status": "running",
    "cpuUsage": 45.2,
    "memoryUsage": 128.5
}));

// Métrique
app.emit_all("metrics-update", json!({
    "id": "cpu-usage",
    "value": 42.5
}));

// Log
app.emit_all("log-line", json!({
    "id": "log-123",
    "level": "info",
    "message": "Task completed successfully",
    "source": "orchestrator",
    "timestamp": "2025-12-09T16:30:00Z"
}));

// Erreur
app.emit_all("error-raised", json!({
    "id": "error-456",
    "engine": "sentinel",
    "message": "Connection timeout",
    "impact": "high",
    "timestamp": "2025-12-09T16:30:00Z",
    "resolved": false,
    "stack": "Error at sentinel.rs:42"
}));
```

### Events Supportés

| Event                   | Payload Type                    | Description               |
| ----------------------- | ------------------------------- | ------------------------- |
| `engine-status-update`  | `Partial<Engine>`               | Mise à jour statut engine |
| `metrics-update`        | `{ id: string, value: number }` | Nouvelle valeur métrique  |
| `log-line`              | `LogEntry`                      | Nouvelle ligne log        |
| `error-raised`          | `ErrorEntry`                    | Nouvelle erreur système   |
| `memory-update`         | `MemoryNode[]`                  | Arbre mémoire mis à jour  |
| `omega-pipeline-update` | `OmegaStep[]`                   | Étapes pipeline Omega     |

## 🎪 Mode Démo (sans Backend)

### Activer Simulation Mock

```tsx
import { DevToolsApp, useMockActivity } from '@/apps/devtools';

function App() {
  // Activer simulation en dev uniquement
  useMockActivity(import.meta.env.DEV, 2000); // Événement toutes les 2s

  return <DevToolsApp />;
}
```

### Contrôle Manuel

```tsx
import { startMockActivity, sendLogLine } from '@/apps/devtools';

// Démarrer simulation
const stopSimulation = startMockActivity(1000); // 1s interval

// Envoyer event manuel
await sendLogLine('info', 'Custom log message', 'test-engine');

// Arrêter simulation
stopSimulation();
```

## 🎨 Personnalisation

### Accéder au Store Directement

```tsx
import { useDevToolsStore } from '@/apps/devtools';

function CustomComponent() {
  const engines = useDevToolsStore(state => state.engines);
  const logs = useDevToolsStore(state => state.logs);
  const addLog = useDevToolsStore(state => state.addLog);

  return (
    <div>
      <p>Active Engines: {engines.filter(e => e.status === 'running').length}</p>
      <button
        onClick={() =>
          addLog({
            id: 'custom-log',
            level: 'info',
            message: 'Custom log',
            source: 'ui',
            timestamp: new Date().toISOString(),
          })
        }
      >
        Add Log
      </button>
    </div>
  );
}
```

### Utiliser Composants Individuels

```tsx
import { EngineCard, LogLine, MetricCard } from '@/apps/devtools';

function CustomDashboard() {
  return (
    <div>
      <MetricCard
        label="CPU Usage"
        value={42.5}
        unit="%"
        trend="up"
        history={[30, 35, 40, 42.5]}
      />

      <EngineCard
        engine={{
          id: 'helios',
          name: 'Helios',
          status: 'running',
          cpuUsage: 45,
          memoryUsage: 128,
        }}
      />
    </div>
  );
}
```

### Écouter Events Spécifiques

```tsx
import { useLogStream, useErrorTracking } from '@/apps/devtools';

function LogMonitor() {
  // Écouter uniquement les logs
  useLogStream();

  const logs = useDevToolsStore(state => state.logs);

  return (
    <div>
      {logs.map(log => (
        <LogLine key={log.id} log={log} />
      ))}
    </div>
  );
}

function ErrorMonitor() {
  // Écouter uniquement les erreurs
  useErrorTracking();

  const errors = useDevToolsStore(state => state.errors);

  return (
    <div>
      <h2>Errors: {errors.filter(e => !e.resolved).length}</h2>
    </div>
  );
}
```

## 📊 Architecture

```
DevToolsApp (shell + tabs)
  ├── useAllDevToolsEvents()  → Active tous les listeners
  ├── Dashboard               → Vue overview
  ├── Metrics                 → Performance monitoring
  ├── Logs                    → Streaming + filtres
  ├── Engines                 → 9 moteurs + actions
  ├── Memory                  → STM/MTM/LTM explorer
  ├── OmegaPipeline           → Visualisation étapes
  └── Errors                  → Gestion + retry

Zustand Store (state management)
  ├── engines: Engine[]
  ├── metrics: Metric[]
  ├── logs: LogEntry[]
  ├── errors: ErrorEntry[]
  ├── memoryTree: MemoryNode[]
  └── currentPipeline: OmegaStep[]

Tauri Events (real-time)
  ├── engine-status-update
  ├── metrics-update
  ├── log-line
  ├── error-raised
  ├── memory-update
  └── omega-pipeline-update
```

## 🔧 Troubleshooting

### DevTools ne reçoit pas d'events

1. Vérifier que `useAllDevToolsEvents()` est appelé dans DevToolsApp
2. Vérifier console browser pour erreurs Tauri
3. En dev, activer mock: `useMockActivity(true, 2000)`

### Store ne se met pas à jour

1. Vérifier que le payload event correspond au type attendu
2. Vérifier console pour erreurs TypeScript
3. Utiliser React DevTools pour inspecter Zustand store

### Performance (trop de logs/events)

1. Ajuster `maxLogs` dans store (défaut: 500)
2. Utiliser filtres dans section Logs
3. Augmenter intervalle mock: `useMockActivity(true, 5000)`

## 📚 Types TypeScript

```typescript
import type {
  Engine,
  EngineStatus,
  LogEntry,
  LogLevel,
  ErrorEntry,
  Metric,
  MemoryNode,
  OmegaStep,
  SystemHealth,
} from '@/apps/devtools';

// Tous les types exportés et documentés
```

## 🎯 Exemples Complets

Voir:

- `src/apps/devtools/DevToolsApp.tsx` → Shell complet
- `src/apps/devtools/sections/` → 7 sections implémentées
- `src/apps/devtools/utils/mockEvents.ts` → Simulation complète

---

**TITANE∞ v20.0** — DevTools UI Advanced Suite  
Session: Super Prompt #3 — Phase 4 Complete 🔥
