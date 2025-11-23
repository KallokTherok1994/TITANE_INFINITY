# 🔗 TITANE∞ v14 — COMMAND MAPPING AUDIT

**Date**: 2025-01-XX
**Objectif**: Synchronisation complète Rust ↔ TypeScript
**Erreur #2**: Désynchronisation Tauri handlers

---

## 📊 STATISTIQUE GLOBALE

- **Commandes Rust**: 219 (avec doublons)
- **Commandes Rust uniques**: ~170 (estimation après déduplication)
- **Commandes TS invoke()**: ~50 wrappers identifiés
- **Doublons détectés**: 14 commandes définies 2-3x

---

## ⚠️ DOUBLONS RUST CRITIQUES

Ces commandes existent en **2+ versions** dans le backend (legacy vs nouveau):

```rust
// 3x duplicates
memory_clear              → api/legacy_commands.rs, commands/ai_chat.rs, ???

// 2x duplicates
start_recording           → api/legacy_commands.rs, commands/ai_chat.rs
stop_recording            → api/legacy_commands.rs, commands/ai_chat.rs
speak                     → api/legacy_commands.rs, commands/ai_chat.rs
delete_conversation       → api/legacy_commands.rs, commands/ai_chat.rs
clear_all_memory          → api/legacy_commands.rs, commands/ai_chat.rs
memory_save_entry         → api/legacy_commands.rs, ???
memory_get_state          → api/legacy_commands.rs, api/memory_api.rs
get_system_status         → api/legacy_commands.rs, ???
helios_get_metrics        → api/legacy_commands.rs, ???
harmonia_get_flows        → api/legacy_commands.rs, ???
nexus_get_graph           → api/legacy_commands.rs, ???
meta_mode_reset           → api/legacy_commands.rs, ???
auto_heal_scan            → auto_heal.rs, ???
auto_heal_repair          → auto_heal.rs, ???
auto_heal_get_logs        → auto_heal.rs, ???
exp_get_talents           → ??? (2 fichiers)
```

**Action requise**:
1. Garder **UNE SEULE** version de chaque commande
2. Supprimer les doublons legacy
3. Mettre à jour `main.rs invoke_handler![]`

---

## ✅ COMMANDES CORE v17.3.0 (ACTIVES)

Commandes enregistrées dans `main.rs` ligne 74-146:

### Helios API (Monitoring)
- ✅ `get_helios_state` → **helios.getState()**
- ✅ `get_system_health` → **helios.getHealth()**

### Memory API (Storage)
- ✅ `get_memory_state` → **memory.getState()**
- ✅ `write_snapshot` → **memory.writeSnapshot()**
- ✅ `read_snapshot` → **memory.readSnapshot()**
- ✅ `write_log` → **memory.writeLog()**
- ✅ `read_logs` → **memory.readLogs()**
- ✅ `add_timeline_event` → **memory.addTimelineEvent()**

### Memory ↔ Chat IA (v17.3.0)
- ✅ `memory_get_active_projects` → **Utilisé (services/api/index.ts)**
- ✅ `memory_get_recent_decisions`
- ✅ `memory_get_knowledge`
- ✅ `memory_get_active_rituals`
- ✅ `memory_get_timeline`
- ✅ `memory_save_chat_interaction`

### Evolution & Diagnostics
- ✅ `run_evolution` → **engine.runEvolution()**
- ✅ `get_evolution_state` → **engine.getState()**
- ✅ `quick_health_check` → **system.quickHealthCheck()**
- ✅ `get_full_system_state` → **composite.getFullSystemState()**
- ✅ `get_nexus_state` → **systemV17.getNexusState()**
- ✅ `get_harmonia_state` → **systemV17.getHarmoniaState()**
- ✅ `get_sentinel_state` → **systemV17.getSentinelState()**
- ✅ `get_detailed_health_report` → **system.getDetailedHealthReport()**

### Persona Engine v24 (6 commandes)
- ✅ `persona_initialize` → **PersonaTauriBridge.initialize()**
- ✅ `persona_get_state` → **PersonaTauriBridge.getState()**
- ✅ `persona_update` → **PersonaTauriBridge.update()**
- ✅ `persona_react` → **PersonaTauriBridge.react()**
- ✅ `persona_reset` → **PersonaTauriBridge.reset()**
- ✅ `persona_get_multipliers` → **Utilisé (services/api/index.ts)**

### DevTools API (13 commandes)
- ✅ `get_logs`
- ✅ `get_correlated_logs`
- ✅ `search_logs`
- ✅ `export_logs`
- ✅ `get_metric`
- ✅ `list_all_metrics`
- ✅ `get_core_metrics`
- ✅ `get_dashboard_metrics`
- ✅ `discover_cores`
- ✅ `get_core_info`
- ✅ `get_cognitive_state`
- ✅ `update_cognitive_mode`
- ✅ `get_three_centers_coherence`
- ✅ `get_system_recommendations`
- ✅ `check_needs_intervention`
- ✅ `update_mental_charge`
- ✅ `update_heart_alignment`
- ✅ `update_body_energy`

### Legacy Compatibility (18 commandes - À SUPPRIMER)
- ⚠️ `memory_save_entry` → **Doublon de memory_save_chat_interaction?**
- ⚠️ `memory_clear` → **Utilisé (hooks/useMemoryCore.ts) - GARDER**
- ⚠️ `delete_conversation` → **Utilisé (hooks/useMemory.ts) - GARDER**
- ⚠️ `clear_all_memory` → **Utilisé (hooks/useMemory.ts) - GARDER**
- ⚠️ `meta_mode_reset` → **Utilisé (components/MetaModeConsole.tsx) - GARDER**
- ⚠️ `speak` → **Utilisé (services/api/index.ts) - GARDER**
- ❌ `start_recording` → **Non utilisé? Vérifier**
- ❌ `stop_recording` → **Non utilisé? Vérifier**
- ❌ `get_system_status` → **Remplacé par get_system_health?**
- ❌ `harmonia_get_flows` → **Remplacé par get_harmonia_state?**
- ❌ `nexus_get_graph` → **Remplacé par get_nexus_state?**
- ❌ `helios_get_metrics` → **Remplacé par get_helios_state?**
- ❌ `memory_get_state` → **Doublon! Existe déjà dans Memory API**

---

## 🔍 COMMANDES NON ENREGISTRÉES (RUST DÉFINI MAIS ABSENT MAIN.RS)

Ces commandes existent dans le code Rust mais ne sont **PAS** dans `main.rs invoke_handler![]`:

### Auto-Heal (3 commandes)
- ❌ `auto_heal_scan` → **src/auto_heal.rs:37**
- ❌ `auto_heal_repair` → **src/auto_heal.rs:58**
- ❌ `auto_heal_get_logs` → **src/auto_heal.rs:73**

**Action**: Ajouter à `main.rs` si fonctionnel, sinon supprimer

### AI Chat Commands (nombreuses commandes)
Fichier: `src/commands/ai_chat.rs`
- ❌ `ai_query`
- ❌ `check_connection`
- ❌ `create_conversation`
- ❌ `list_conversations`
- ❌ `load_conversation`
- ❌ `health_check`
- ❌ `get_module_status`
- ❌ `get_vad_state`
- ... (et 10+ autres)

**Statut**: Module AI non enregistré, fonctionnalité dormante?

### Voice Engine (10+ commandes)
Fichier: `src/commands/voice.rs` (probablement)
- ❌ `voice_get_status`
- ❌ `voice_start_listening`
- ❌ `voice_stop_listening`
- ❌ `voice_play_audio`
- ... etc

**Statut**: Voice engine non enregistré, fonctionnalité dormante?

### Autres commandes orphelines
- ❌ `watchdog_get_data`
- ❌ `watchdog_get_logs`
- ❌ Exp engine commands (partiellement enregistrés)
- ❌ Meta-mode commands (legacy)

---

## 📋 COMMANDES TYPESCRIPT SANS BACKEND CONFIRMÉ

Invokes TypeScript trouvés qui nécessitent vérification:

### Services/API wrappers
Fichier: `src/services/api/index.ts`
- ⚠️ `chat_send_message` → **Vérifié: NON ENREGISTRÉ main.rs**

### Hooks
Fichier: `src/hooks/useMemory.ts`, `useMemoryCore.ts`
- ✅ `memory_clear` → **CONFIRMÉ main.rs**
- ✅ `delete_conversation` → **CONFIRMÉ main.rs**
- ✅ `clear_all_memory` → **CONFIRMÉ main.rs**

---

## 🎯 PLAN D'ACTION CORRECTION ERREUR #2

### Phase 1: Déduplication Rust (1 jour)

1. **Supprimer doublons legacy**:
   ```rust
   // SUPPRIMER src/api/legacy_commands.rs entièrement
   // Garder uniquement les nouvelles implémentations dans:
   // - api/memory_api.rs
   // - api/helios_api.rs
   // - api/engine_api.rs
   // - api/system_api.rs
   ```

2. **Nettoyer main.rs**:
   ```rust
   // AVANT (146 lignes):
   .invoke_handler(tauri::generate_handler![
       api::get_helios_state,
       api::memory_clear,        // Doublon!
       // ... 60+ commands
   ])

   // APRÈS (60 lignes):
   .invoke_handler(tauri::generate_handler![
       api::get_helios_state,
       api::get_system_health,
       api::get_memory_state,
       // ... uniquement commandes core
   ])
   ```

### Phase 2: Enregistrer commandes manquantes (1 jour)

1. **Auto-Heal**:
   ```rust
   // Ajouter à main.rs si fonctionnel:
   auto_heal::auto_heal_scan,
   auto_heal::auto_heal_repair,
   auto_heal::auto_heal_get_logs,
   ```

2. **AI Chat** (si requis):
   ```rust
   // Décider: garder ou supprimer?
   // Si garder, ajouter:
   commands::ai_chat::ai_query,
   commands::ai_chat::check_connection,
   // ... etc
   ```

### Phase 3: Vérifier TypeScript (2 heures)

1. **Auditer tous les invoke()**:
   ```bash
   grep -r "invoke(" src --include="*.ts" --include="*.tsx" \
     | grep -v node_modules \
     | grep -v "\.test\."
   ```

2. **Vérifier matching avec main.rs**:
   - Chaque `invoke('command_name')` doit avoir un `#[tauri::command] pub async fn command_name`
   - Chaque commande dans `main.rs` doit avoir un wrapper TypeScript

3. **Supprimer invokes obsolètes**:
   ```typescript
   // AVANT:
   await invoke('get_system_status'); // Legacy

   // APRÈS:
   await invoke('get_system_health'); // v17.3.0
   ```

### Phase 4: Documentation (1 heure)

Créer `COMMAND_REFERENCE_v14.md`:
```markdown
# Command Reference

## Helios API
- `get_helios_state` → HeliosState
- `get_system_health` → HealthStatus

## Memory API
- `get_memory_state` → MemoryState
...
```

---

## 🔧 CRITÈRES DE SUCCÈS

- ✅ 0 doublons dans backend Rust
- ✅ 100% commandes main.rs ont un wrapper TS
- ✅ 100% invokes TS ont un backend Rust
- ✅ `cargo check` compile sans erreur
- ✅ `pnpm type-check` passe sans erreur
- ✅ Tests unitaires passent (80+ tests Rust)

---

## 📌 PROCHAINES ÉTAPES

1. **Supprimer `src/api/legacy_commands.rs`** (après migration des commandes encore utilisées)
2. **Nettoyer `main.rs invoke_handler![]`** (60 commandes max au lieu de 65+)
3. **Créer wrappers TypeScript manquants** (pour auto_heal, devtools, etc.)
4. **Supprimer invokes obsolètes** dans frontend
5. **Documenter API finale** dans COMMAND_REFERENCE_v14.md

---

**Status**: ⏳ EN COURS - Erreur #2 Audit Complete
**Prochaine action**: Phase 1 - Déduplication Rust
