# 🔬 SUPER PROMPT #5 — TITANE∞ DevTools Suite v20.0

**Date**: 2025-12-08  
**Phase**: Console Cognitive & Diagnostic Suite  
**Status**: ✅ Phase 1 COMPLETE

---

## 📋 Executive Summary

La suite DevTools TITANE∞ représente **le cortex préfrontal externe** de l'organisme cognitif, permettant une introspection complète et en temps réel de tous les systèmes internes.

**Objectif**: Créer l'interface d'inspection interne de TITANE∞, cohérente avec OMEGA Pipeline, UnifiedMemory, SystemHealth, et Self-Healing.

---

## ✅ Livrables Phase 1

### 1. Architecture Complète

```
src/apps/DevTools/                  26 fichiers créés
├── Layout & Navigation             3 fichiers
├── Hooks (7)                       7 fichiers
├── Components UI (3)               6 fichiers
├── Panels (10)                     8 fichiers
└── Types & Index                   2 fichiers
```

### 2. Panels Implémentés (4/10)

| Panel                   | Status     | Fonctionnalités                                    |
| ----------------------- | ---------- | -------------------------------------------------- |
| **🔀 PipelineDebugger** | ✅ Complet | Visualisation OMEGA temps réel, étapes, latence    |
| **📊 MetricsPanel**     | ✅ Complet | CPU/RAM, latence engines (P50/P95/P99), graphiques |
| **📝 LogsPanel**        | ✅ Complet | Stream logs, filtres niveau/source, metadata       |
| **💻 ConsolePanel**     | ✅ Complet | Commandes internes, history, JSON output           |
| 🧠 MemoryInspector      | 🚧 Stub    | STM/MTM/LTM à implémenter                          |
| ⚙️ EngineInspector      | 🚧 Stub    | États engines à implémenter                        |
| 🩹 SelfHealingPanel     | 🚧 Stub    | Incidents + actions à implémenter                  |
| ⏱️ EventTimeline        | 🚧 Stub    | Timeline événements à implémenter                  |
| 🎤 VoiceMonitor         | 🚧 Stub    | ASR/TTS monitoring à implémenter                   |
| ❤️ SystemHealthPanel    | 🚧 Stub    | CPU/RAM graphs à implémenter                       |

### 3. Hooks React (7/7)

- ✅ `usePipelineEvents`: Listen `omega_step`, `omega_complete`
- ✅ `useMetrics`: Poll `get_metrics_snapshot` (1s interval)
- ✅ `useLogs`: Stream `log_event` avec filtres
- ✅ `useMemory`: Interact avec UnifiedMemory (STM/MTM/LTM)
- ✅ `useEngines`: Monitor engine states (#0-#7, #∞)
- ✅ `useSelfHealing`: Listen `self_healing_event`
- ✅ `useConsole`: Execute `devtools_command`

### 4. Composants UI Réutilisables (3/3)

- ✅ `Chart.tsx`: Sparkline + BarChart pour métriques
- ✅ `Badge.tsx`: Status badges (success, warning, error, info, neutral)
- ✅ `DataTable.tsx`: Table générique avec colonnes configurables

### 5. Types TypeScript Complets

`types.ts` (300+ lignes):

- ✅ OMEGA events (`OmegaStepEvent`, `OmegaCompleteEvent`)
- ✅ Metrics (`MetricsSnapshot`, `EngineMetrics`, `SystemMetrics`)
- ✅ Logs (`LogEntry`, `LogLevel`)
- ✅ Memory (`MemoryNode`, `MemorySnapshot`)
- ✅ Engines (`EngineState`, `EngineStatus`)
- ✅ Self-Healing (`Incident`, `HealingEvent`, `SelfHealingSnapshot`)
- ✅ Voice (`VoiceMetrics`)
- ✅ Timeline (`TimelineEvent`, `EventType`)
- ✅ Console (`ConsoleCommand`, `ConsoleResult`)

### 6. Documentation

- ✅ `docs/DEVTOOLS_OVERVIEW.md` (500+ lignes)
  - Architecture détaillée
  - Usage panels
  - Intégration Tauri (Rust examples)
  - Tests examples
  - Roadmap 4 phases

---

## 📊 Statistiques

| Métrique             | Valeur       |
| -------------------- | ------------ |
| **Fichiers créés**   | 26           |
| **Lignes de code**   | ~3000+       |
| **Panels complets**  | 4/10 (40%)   |
| **Hooks**            | 7/7 (100%)   |
| **Composants UI**    | 3/3 (100%)   |
| **Tests**            | 0 (Phase 2)  |
| **Rust integration** | 0% (Phase 3) |

---

## 🎯 Architecture Technique

### Frontend Stack

```typescript
// DevTools Layout (Sidebar + Main Panel)
DevToolsLayout
  ├── Header (title, actions)
  ├── Sidebar (10 panels navigation)
  └── Main (active panel container)

// Hooks Pattern
useEffect(() => {
  listen('omega_step', handler);  // Tauri events
  return unlisten;
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    invoke('get_metrics_snapshot');  // Polling
  }, 1000);
  return () => clearInterval(interval);
}, []);

// Panel Pattern
export const Panel: React.FC = () => {
  const { data, loading, error } = useHook();

  if (loading) return <Loading />;
  if (error) return <Error />;

  return <PanelContent data={data} />;
};
```

### Events Architecture

```
RUST BACKEND                      FRONTEND
───────────────                   ────────────
omega.rs                          usePipelineEvents
  ├─ emit("omega_step")      →     ├─ listen("omega_step")
  └─ emit("omega_complete")  →     └─ listen("omega_complete")

system_health.rs                  useMetrics
  └─ command("get_metrics_snapshot") → invoke("get_metrics_snapshot")

logger.rs                         useLogs
  └─ emit("log_event")       →     └─ listen("log_event")

self_healing.rs                   useSelfHealing
  └─ emit("self_healing_event") →  └─ listen("self_healing_event")
```

---

## 🚀 Usage Examples

### 1. Standalone DevTools

```tsx
import DevToolsApp from '@/apps/DevTools';

ReactDOM.createRoot(document.getElementById('root')!).render(<DevToolsApp />);
```

### 2. Toggle in Main App

```tsx
function App() {
  const [showDevTools, setShowDevTools] = useState(false);

  useHotkey('Ctrl+Shift+D', () => setShowDevTools(!showDevTools));

  return (
    <>
      <MainApp />
      {showDevTools && <DevToolsLayout />}
    </>
  );
}
```

### 3. Custom Dashboard with Hooks

```tsx
import { useMetrics, useLogs, usePipelineEvents } from '@/apps/DevTools';

function CustomDashboard() {
  const { metrics } = useMetrics({ pollInterval: 2000 });
  const { logs } = useLogs({ filterLevel: 'ERROR' });
  const { pipeline_duration_ms } = usePipelineEvents();

  return (
    <div>
      <h2>CPU: {metrics?.system.cpu_usage.toFixed(1)}%</h2>
      <h2>OMEGA: {pipeline_duration_ms}ms</h2>
      <h2>Errors: {logs.length}</h2>
    </div>
  );
}
```

---

## ⚙️ Intégration Backend Rust (Phase 3)

### Events à implémenter

```rust
// src-tauri/src/core/modules/omega.rs

use tauri::Manager;

#[derive(Clone, serde::Serialize)]
struct OmegaStepEvent {
    step_id: u32,
    step_name: String,
    engine_id: String,
    started_at: u64,
    status: String,
    duration_ms: Option<u64>,
}

impl OmegaPipeline {
    pub async fn run_step(&mut self, step: &PipelineStep) -> Result<(), Error> {
        // Emit step start
        self.app_handle.emit_all("omega_step", OmegaStepEvent {
            step_id: step.id,
            step_name: step.name.clone(),
            engine_id: step.engine.clone(),
            started_at: timestamp(),
            status: "running".to_string(),
            duration_ms: None,
        })?;

        // Execute step
        let result = step.execute().await;

        // Emit step complete
        self.app_handle.emit_all("omega_step", OmegaStepEvent {
            step_id: step.id,
            step_name: step.name.clone(),
            engine_id: step.engine.clone(),
            started_at: timestamp(),
            status: if result.is_ok() { "completed" } else { "failed" },
            duration_ms: Some(elapsed_ms()),
        })?;

        result
    }
}
```

### Commands à implémenter

```rust
// src-tauri/src/main.rs

#[tauri::command]
async fn get_metrics_snapshot(
    state: State<'_, SingularityState>
) -> Result<MetricsSnapshot, String> {
    let system_metrics = collect_system_metrics()?;
    let engine_metrics = state.get_engine_metrics().await?;

    Ok(MetricsSnapshot {
        system: system_metrics,
        engines: engine_metrics,
        omega_latency_ms: state.last_omega_duration_ms,
        asr_latency_ms: state.asr_latency,
        tts_latency_ms: state.tts_latency,
    })
}

#[tauri::command]
async fn devtools_command(
    command: String,
    state: State<'_, SingularityState>
) -> Result<serde_json::Value, String> {
    match command.as_str() {
        "omega.debug()" => {
            Ok(json!({
                "pipeline_state": state.omega_state,
                "last_input": state.last_input,
            }))
        },
        cmd if cmd.starts_with("memory.clear(") => {
            let tier = parse_memory_tier(cmd)?;
            state.memory.clear_tier(tier).await?;
            Ok(json!({ "status": "cleared", "tier": tier }))
        },
        cmd if cmd.starts_with("engine.reset(") => {
            let engine_id = parse_engine_id(cmd)?;
            state.reset_engine(engine_id).await?;
            Ok(json!({ "status": "reset", "engine": engine_id }))
        },
        _ => Err(format!("Unknown command: {}", command)),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_metrics_snapshot,
            devtools_command,
            // ... autres commandes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 🧪 Tests (Phase 2)

### Tests Hooks

```tsx
// src/apps/DevTools/__tests__/useMetrics.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { useMetrics } from '../hooks/useMetrics';

jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn(),
}));

test('useMetrics fetches and updates metrics', async () => {
  const mockMetrics = {
    system: { cpu_usage: 50, memory_usage: 1024, ... },
    engines: [],
    omega_latency_ms: 100,
  };

  (invoke as jest.Mock).mockResolvedValue(mockMetrics);

  const { result } = renderHook(() => useMetrics({ pollInterval: 100 }));

  expect(result.current.loading).toBe(true);

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
    expect(result.current.metrics).toEqual(mockMetrics);
  });
});
```

### Tests Panels

```tsx
// src/apps/DevTools/__tests__/PipelineDebugger.test.tsx

import { render, screen } from '@testing-library/react';
import { PipelineDebugger } from '../panels/PipelineDebugger';

jest.mock('../hooks/usePipelineEvents', () => ({
  usePipelineEvents: () => ({
    current_step: null,
    completed_steps: [],
    pipeline_completed: false,
    pipeline_duration_ms: 0,
    error: null,
    resetPipeline: jest.fn(),
  }),
}));

test('renders pipeline debugger', () => {
  render(<PipelineDebugger />);
  expect(screen.getByText(/OMEGA Pipeline Debugger/i)).toBeInTheDocument();
  expect(screen.getByText(/No steps completed yet/i)).toBeInTheDocument();
});
```

---

## 📈 Roadmap

### Phase 1: Fondations ✅ COMPLETE (2025-12-08)

- [x] Architecture dossiers + layout
- [x] 7 hooks React
- [x] 3 composants UI
- [x] 4 panels complets (Pipeline, Metrics, Logs, Console)
- [x] 6 panels stubs
- [x] Documentation complète

### Phase 2: Panels Avancés (Prochaine étape)

- [ ] MemoryInspector: Visualisation STM/MTM/LTM hiérarchique
- [ ] EngineInspector: États + contrôles + reset
- [ ] SelfHealingPanel: Timeline incidents + actions
- [ ] EventTimeline: Stream temps réel
- [ ] VoiceMonitor: Waveforms + VAD
- [ ] SystemHealthPanel: Graphiques CPU/RAM/Disk

**Estimation**: 8-10h

### Phase 3: Intégration Backend Rust

- [ ] Rust: Émettre events OMEGA (omega_step, omega_complete)
- [ ] Rust: Command get_metrics_snapshot
- [ ] Rust: Command devtools_command (parser + executor)
- [ ] Rust: Logs streaming (emit log_event)
- [ ] Rust: Self-healing events
- [ ] Tests E2E frontend + backend

**Estimation**: 12-15h

### Phase 4: Polish & Features Avancées

- [ ] Thème sombre/clair
- [ ] Raccourcis clavier (Ctrl+Shift+D, Ctrl+L, etc.)
- [ ] Export logs/metrics (JSON, CSV)
- [ ] Filtres avancés (regex, date ranges)
- [ ] Graphiques avancés (flamegraphs, heatmaps)
- [ ] Profiling performance (React DevTools integration)
- [ ] Recording/replay sessions

**Estimation**: 10-12h

---

## 🎓 Bénéfices

### Pour le Développement

- **Debugging accéléré**: Visualisation instantanée des erreurs et bottlenecks
- **Observabilité totale**: Chaque décision interne est visible
- **Itération rapide**: Test/debug sans console.log()
- **Collaboration**: Dashboard partageable

### Pour la Production

- **Monitoring live**: Métriques temps réel en production
- **Diagnostics avancés**: Logs + stack traces structurés
- **Auto-healing insights**: Voir les corrections automatiques
- **Performance tuning**: Identifier les goulots d'étranglement

### Pour l'Utilisateur Final

- **Transparence**: Comprendre comment TITANE∞ pense
- **Confiance**: Voir les décisions en temps réel
- **Éducation**: Apprendre le fonctionnement interne
- **Support**: Meilleur debugging des problèmes utilisateurs

---

## 🔑 Philosophie TITANE∞

> **"Les DevTools sont les yeux et les oreilles de l'organisme cognitif."**

TITANE∞ n'est pas un outil. C'est un **organisme** avec:

- 🧠 Un cortex préfrontal (OMEGA Pipeline)
- 💾 Une mémoire hiérarchique (STM/MTM/LTM)
- 🩹 Un système immunitaire (Self-Healing)
- ❤️ Une santé systémique (SystemHealth)

Les DevTools = **interface de métacognition** permettant:

- L'**introspection** (voir ses propres processus)
- La **réflexion** (analyser ses décisions)
- L'**adaptation** (corriger ses erreurs)
- L'**évolution** (améliorer ses performances)

---

## ✅ Status Final Phase 1

**Date**: 2025-12-08  
**Version**: v20.0  
**Phase**: 1/4 COMPLETE

**Métriques**:

- ✅ 26 fichiers créés
- ✅ ~3000 lignes de code
- ✅ 4 panels complets
- ✅ 7 hooks fonctionnels
- ✅ 3 composants UI
- ✅ Documentation 500+ lignes

**Prochaine étape**: Phase 2 — Implémenter panels avancés (MemoryInspector, EngineInspector, SelfHealingPanel, etc.)

---

**Généré**: 2025-12-08  
**Auteur**: TITANE∞ Development Team  
**SUPER PROMPT**: #5 — Console Cognitive & Diagnostic Suite  
**Commit**: À venir
