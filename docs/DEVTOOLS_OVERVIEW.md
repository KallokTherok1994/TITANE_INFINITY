# 🔬 TITANE∞ DevTools Suite v20.0

**SUPER PROMPT #5 — Console Cognitive & Diagnostic Suite**

## 📋 Overview

La suite DevTools TITANE∞ est l'interface d'introspection complète de l'organisme cognitif. Elle permet de visualiser, debugger et optimiser tous les aspects du système en temps réel.

---

## 🎯 Architecture

```
src/apps/DevTools/
├── index.tsx                   # Entry point
├── DevToolsLayout.tsx          # Main layout avec sidebar navigation
├── DevToolsLayout.css          # Styles layout
├── types.ts                    # TypeScript types
│
├── hooks/                      # React hooks
│   ├── usePipelineEvents.ts    # Listen OMEGA pipeline events
│   ├── useMetrics.ts           # Poll system/engine metrics
│   ├── useLogs.ts              # Stream logs from Rust
│   ├── useMemory.ts            # UnifiedMemory interactions
│   ├── useEngines.ts           # Engine states monitoring
│   ├── useSelfHealing.ts       # Self-healing events
│   └── useConsole.ts           # Execute internal commands
│
├── components/                 # Reusable UI components
│   ├── Chart.tsx               # Sparkline + BarChart
│   ├── Badge.tsx               # Status badges
│   └── DataTable.tsx           # Generic data table
│
└── panels/                     # DevTools panels
    ├── PipelineDebugger.tsx    # ✅ OMEGA pipeline visualization
    ├── MetricsPanel.tsx        # ✅ Performance metrics
    ├── LogsPanel.tsx           # ✅ Log streaming + filters
    ├── ConsolePanel.tsx        # ✅ Interactive command console
    ├── MemoryInspector.tsx     # 🚧 STM/MTM/LTM inspector
    ├── EngineInspector.tsx     # 🚧 Engine states (#0-#7, #∞)
    ├── SelfHealingPanel.tsx    # 🚧 Incidents + healing actions
    ├── EventTimeline.tsx       # 🚧 Real-time event stream
    ├── VoiceMonitor.tsx        # 🚧 ASR/TTS latency
    └── SystemHealthPanel.tsx   # 🚧 CPU/RAM/Disk monitoring
```

**Légende**: ✅ Implémenté | 🚧 Stub (à implémenter)

---

## 🚀 Panels Implémentés

### 1. **🔀 Pipeline Debugger**

Visualise l'exécution du pipeline OMEGA en temps réel.

**Features**:
- Status pipeline (running/completed)
- Étape courante avec engine actif
- Historique des étapes complétées
- Latence par étape
- Erreurs détaillées

**Events écoutés**:
```typescript
listen('omega_step', (event: OmegaStepEvent) => {...})
listen('omega_complete', (event: OmegaCompleteEvent) => {...})
```

### 2. **📊 Metrics Panel**

Affiche les métriques de performance système et engines.

**Features**:
- CPU/RAM usage temps réel
- Latence OMEGA totale
- Latence ASR/TTS
- Latence par engine (P50/P95/P99)
- Graphiques sparkline + bar charts

**Commandes Tauri**:
```typescript
invoke('get_metrics_snapshot') → MetricsSnapshot
```

### 3. **📝 Logs Panel**

Stream logs structurés depuis le backend Rust.

**Features**:
- Filtres par niveau (DEBUG, INFO, WARN, ERROR, FATAL)
- Filtres par source (engine name, module)
- Recherche full-text
- Métadonnées + stack traces
- Auto-scroll

**Events écoutés**:
```typescript
listen('log_event', (event: LogEntry) => {...})
```

### 4. **💻 Console Panel**

Console interactive pour exécuter des commandes internes.

**Commands disponibles**:
```typescript
omega.debug()                      // Debug pipeline OMEGA
memory.clear("STM")                // Clear short-term memory
engine.reset("coherence")          // Reset engine
self_healing.trigger("ClearSTM")   // Trigger healing action
system.health()                    // Get system health snapshot
```

**Commandes Tauri**:
```typescript
invoke('devtools_command', { command: string }) → any
```

---

## 🔌 Intégration Tauri (Rust Backend)

### Événements à émettre

Ajouter dans `src-tauri/src/core/modules/omega.rs` (ou fichier équivalent):

```rust
use tauri::Manager;

// Event: OMEGA step started/completed
#[derive(Clone, serde::Serialize)]
struct OmegaStepEvent {
    step_id: u32,
    step_name: String,
    engine_id: String,
    started_at: u64,
    completed_at: Option<u64>,
    duration_ms: Option<u64>,
    status: String, // "running" | "completed" | "failed"
    error: Option<String>,
    metadata: Option<serde_json::Value>,
}

// Emit event
app_handle.emit_all("omega_step", OmegaStepEvent {
    step_id: 1,
    step_name: "Input Analysis".to_string(),
    engine_id: "engine_0".to_string(),
    started_at: timestamp(),
    completed_at: None,
    duration_ms: None,
    status: "running".to_string(),
    error: None,
    metadata: None,
}).unwrap();
```

### Commandes à implémenter

Ajouter dans `src-tauri/src/main.rs`:

```rust
#[tauri::command]
async fn get_metrics_snapshot() -> Result<MetricsSnapshot, String> {
    // Collect system metrics (CPU, RAM)
    // Collect engine latencies
    // Return snapshot
    Ok(MetricsSnapshot { /* ... */ })
}

#[tauri::command]
async fn devtools_command(command: String) -> Result<serde_json::Value, String> {
    // Parse command string
    // Execute internal action
    // Return result as JSON
    match command.as_str() {
        "omega.debug()" => Ok(json!({ "pipeline": "debug info" })),
        "memory.clear(\"STM\")" => {
            // Clear STM
            Ok(json!({ "status": "cleared" }))
        },
        _ => Err(format!("Unknown command: {}", command)),
    }
}

// Register commands
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_metrics_snapshot,
            devtools_command,
            // ... other commands
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 📦 Usage

### 1. Lancer DevTools standalone

```tsx
import DevToolsApp from '@/apps/DevTools';

function App() {
  return <DevToolsApp />;
}
```

### 2. Intégrer dans l'app principale

```tsx
import { DevToolsLayout } from '@/apps/DevTools';

function App() {
  const [showDevTools, setShowDevTools] = useState(false);

  // Toggle avec Ctrl+Shift+D
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDevTools((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <MainApp />
      {showDevTools && <DevToolsLayout />}
    </>
  );
}
```

### 3. Utiliser les hooks individuellement

```tsx
import { useMetrics, useLogs } from '@/apps/DevTools';

function CustomMonitor() {
  const { metrics } = useMetrics({ pollInterval: 2000 });
  const { logs } = useLogs({ filterLevel: 'ERROR' });

  return (
    <div>
      <p>CPU: {metrics?.system.cpu_usage}%</p>
      <p>Errors: {logs.filter(l => l.level === 'ERROR').length}</p>
    </div>
  );
}
```

---

## 🧪 Tests

### Tests hooks

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useMetrics } from '../hooks/useMetrics';

// Mock invoke
jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn(),
}));

test('useMetrics fetches data', async () => {
  const mockMetrics = { /* ... */ };
  invoke.mockResolvedValue(mockMetrics);

  const { result } = renderHook(() => useMetrics());

  await waitFor(() => {
    expect(result.current.metrics).toEqual(mockMetrics);
    expect(result.current.loading).toBe(false);
  });
});
```

### Tests panels

```tsx
import { render, screen } from '@testing-library/react';
import { PipelineDebugger } from '../panels/PipelineDebugger';

test('renders pipeline debugger', () => {
  render(<PipelineDebugger />);
  expect(screen.getByText(/OMEGA Pipeline Debugger/i)).toBeInTheDocument();
});
```

---

## 🎯 Roadmap

### Phase 1 (Complétée) ✅
- [x] Architecture DevTools (dossiers, layout, types)
- [x] Hooks: usePipelineEvents, useMetrics, useLogs, useMemory, useEngines, useSelfHealing, useConsole
- [x] Composants UI: Chart, Badge, DataTable
- [x] Panels: PipelineDebugger, MetricsPanel, LogsPanel, ConsolePanel

### Phase 2 (Prochaine étape)
- [ ] Implémenter MemoryInspector (STM/MTM/LTM visualization)
- [ ] Implémenter EngineInspector (states + controls)
- [ ] Implémenter SelfHealingPanel (incidents timeline)
- [ ] Implémenter EventTimeline (real-time stream)
- [ ] Implémenter VoiceMonitor (waveforms + VAD)
- [ ] Implémenter SystemHealthPanel (CPU/RAM graphs)

### Phase 3 (Intégration backend)
- [ ] Rust: Émettre événements OMEGA (omega_step, omega_complete)
- [ ] Rust: Implémenter commandes Tauri (get_metrics_snapshot, devtools_command, etc.)
- [ ] Rust: Intégrer SystemHealth avec DevTools events
- [ ] Tests E2E frontend + backend

### Phase 4 (Polish)
- [ ] Thème sombre/clair
- [ ] Raccourcis clavier
- [ ] Export logs/metrics (JSON, CSV)
- [ ] Filtres avancés (regex, date ranges)
- [ ] Graphiques avancés (flamegraphs, heatmaps)

---

## 🔑 Raccourcis Clavier (Prévus)

- `Ctrl+Shift+D`: Toggle DevTools
- `Ctrl+L`: Focus console input
- `Ctrl+K`: Clear logs
- `Ctrl+R`: Refresh metrics
- `Ctrl+1-9`: Switch panels

---

## 📚 Références

- **Architecture TITANE∞**: `docs/TITANE_OS/ARCHITECTURE.md`
- **OMEGA Pipeline**: `docs/TITANE_OS/TITANE_OMEGA_PIPELINE.md`
- **SystemHealth**: `src-tauri/src/core/modules/system_health.rs`
- **Self-Healing**: `src/services/selfHealing/`
- **UnifiedMemory**: `src/engines/memory/UnifiedMemoryEngine.ts`

---

**Généré**: 2025-12-08  
**Version**: v20.0  
**SUPER PROMPT**: #5 — Console Cognitive & Diagnostic Suite
