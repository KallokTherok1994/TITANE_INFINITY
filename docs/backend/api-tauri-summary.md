# 📡 TITANE∞ API Tauri — Reference Rapide

**30+ commandes exposées au frontend.**

## 🎯 Usage TypeScript

\`\`\`typescript
import { invoke } from '@tauri-apps/api/core';

// GET
const state = await invoke<HeliosState>('get_helios_state');

// POST
await invoke('write_snapshot', { data, metadata });
\`\`\`

---

## 📦 Commandes par Module

### Helios API (2 commands)

**get_helios_state()**
- Input: Aucun
- Output: `HeliosState { cpu, ram, disk, timestamp }`
- Durée: ~10ms
- Usage: Dashboard metrics

**get_system_health()**
- Input: Aucun
- Output: `HealthStatus { status: "healthy"|"warning"|"critical" }`
- Durée: ~20ms
- Usage: Status indicator

---

### Memory API (5 commands)

**write_snapshot(data, metadata)**
- Input: `{ data: any, metadata: object }`
- Output: `{ snapshot_id: string }`
- Durée: ~50-200ms
- Errors: `SnapshotTooLarge`, `WriteFailed`

**read_snapshot()**
- Input: Aucun
- Output: `Option<Snapshot>`
- Durée: ~30ms

**write_log(domain, level, message)**
- Input: `{ domain, level, message }`
- Output: `void`
- Durée: ~10ms

**read_logs(count, filter)**
- Input: `{ count?: number, filter?: string }`
- Output: `LogEntry[]`
- Durée: ~20-100ms

**add_timeline_event(event)**
- Input: `TimelineEvent`
- Output: `void`
- Durée: ~15ms

---

### Engine API (3 commands)

**run_evolution()**
- Input: Aucun
- Output: `EvolutionState { status, actions, duration }`
- Durée: ~2-10 seconds
- Async: Background task (tokio::spawn)
- Errors: `DiagnosticsFailed`, `RepairFailed`, `Timeout`

**get_evolution_state()**
- Input: Aucun
- Output: `EvolutionState`
- Durée: ~5ms

**quick_health_check()**
- Input: Aucun
- Output: `HealthCheckResult { passed, issues, recommendations }`
- Durée: ~100ms-1s

---

### System API (4 commands)

**get_full_system_state()**
- Output: Tous les états (Helios + Nexus + Harmonia + Sentinel + Memory)
- Durée: ~50-150ms

**get_nexus_state()**
**get_harmonia_state()**
**get_sentinel_state()**
- Similaires à get_helios_state

---

### Legacy Bridge (13 commands - DEPRECATED v17.2.1)

Ces commandes retournent des erreurs explicites pour guider vers nouvelles API.

**memory_save_entry**, **memory_clear**, **delete_conversation**, etc.
- Status: DEPRECATED
- Output: Error with migration path

---

## 🔐 Sécurité (v17.3.0)

Toutes les commandes :
- Valident inputs (types, ranges)
- Utilisent ShellGuard/StorageGuard si nécessaire
- Retournent AppResult<T> (erreurs typées)
- Sont async (non-bloquantes)

---

## 📚 Documentation Complète

Voir `docs/backend/api-tauri-full.md` (à créer) pour :
- Signatures exactes
- Exemples complets
- Cas d'erreur détaillés
- Tests d'intégration

---

**TITANE∞** — *"Une API claire est une API utilisée."*
