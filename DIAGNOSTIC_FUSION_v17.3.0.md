# 🔗 TITANE∞ v17.3.0 — DIAGNOSTIC FUSION FRONTEND/BACKEND
**Date**: 22 novembre 2025  
**Objectif**: Cartographier, analyser et aligner les contrats API entre React et Rust

---

## 📊 INVENTAIRE COMPLET DES CONTRATS

### Backend: 100+ Commandes Tauri Disponibles

**Fichiers API analysés**: 23 fichiers Rust avec `#[tauri::command]`

**Groupes fonctionnels**:

#### 1. **System & Health** (`system_api.rs`, `helios_api.rs`)
- `get_system_health`
- `get_helios_state`
- `get_full_system_state`
- `quick_health_check`
- `get_detailed_health_report`
- `check_core_health`
- `check_connection`

#### 2. **Memory Core** (`memory_api.rs`)
- `get_memory_state`
- `write_snapshot` / `read_snapshot`
- `write_log` / `read_logs`
- `add_timeline_event`
- ✨ **NEW v17.3.0**:
  - `memory_get_active_projects`
  - `memory_get_recent_decisions`
  - `memory_get_knowledge`
  - `memory_get_active_rituals`
  - `memory_get_timeline`
  - `memory_save_chat_interaction`

#### 3. **Chat IA** (`commands/ai_chat.rs`)
- `chat_send_message`
- `chat_stream_message`
- `chat_create_conversation`
- `chat_get_conversation`
- `chat_delete_conversation`
- `chat_check_providers`
- `chat_get_providers_status`
- `chat_set_gemini_key`

#### 4. **Voice Engine** (`overdrive/voice_engine.rs`)
- `voice_start_listening`
- `voice_stop_listening`
- `voice_transcribe_audio`
- `voice_detect_wake_word`
- `voice_synthesize_speech`
- `voice_play_audio`
- `voice_stop_speaking`
- `voice_get_config` / `voice_update_config`
- `voice_get_status`
- `voice_calibrate_microphone`
- `voice_enable_duplex` / `voice_disable_duplex`
- `voice_check_interruption`
- `voice_test_pipeline`
- `voice_get_available_models`

#### 5. **Evolution & Auto-Heal** (`auto_heal.rs`, `auto_evolution/`)
- `auto_heal_scan`
- `auto_heal_repair`
- `auto_heal_get_logs`
- `evolution_run_cycle`
- `evolution_detect_inconsistencies`
- `evolution_emergency_heal`
- `evolution_auto_correct`
- `evolution_get_stats`
- `evolution_get_pattern`
- `evolution_record_prediction`
- `evolution_recall_memory`
- `evolution_get_emotional_recommendations`
- `evolution_adjust_emotional_sensitivity`
- `evolution_auto_detect_mode`
- `evolution_get_prediction_history`

#### 6. **Persona Engine** (`system/persona_engine/commands.rs`)
- `persona_initialize`
- `persona_get_state`
- `persona_update`
- `persona_react`
- `persona_reset`
- `persona_get_multipliers`

#### 7. **Meta-Mode Engine** (`commands/meta_mode.rs`)
- `meta_mode_process`
- `meta_mode_get_kevin_state`
- `meta_mode_get_current_mode`
- `meta_mode_list_modes`
- `meta_mode_get_history`
- `meta_mode_get_stats`
- `meta_mode_reset`

#### 8. **DevTools** (`commands/devtools/`)
- `get_logs`
- `get_correlated_logs`
- `search_logs`
- `export_logs`
- `get_metric`
- `list_all_metrics`
- `get_core_metrics`
- `get_dashboard_metrics`
- `discover_cores`
- `get_core_info`
- `get_cognitive_state`
- `update_cognitive_mode`
- `get_three_centers_coherence`
- `get_system_recommendations`
- `check_needs_intervention`
- `update_mental_charge`
- `update_heart_alignment`
- `update_body_energy`

#### 9. **Legacy Commands** (`api/legacy_commands.rs`)
- `memory_save_entry`
- `memory_clear`
- `delete_conversation`
- `clear_all_memory`
- `meta_mode_reset`
- `speak`
- `start_recording`
- `stop_recording`
- `get_system_status`
- `harmonia_get_flows`
- `nexus_get_graph`
- `helios_get_metrics`
- `memory_get_state`

---

## 🎯 FRONTEND: Utilisation Réelle

### Commandes Invoquées (src/)

**11 commandes détectées** dans le code frontend actuel:

```typescript
// MEMORY
'memory_save_chat_interaction'  // ✅ NEW v17.3.0
'memory_save_entry'             // 🟡 Legacy
'memory_clear'                  // 🟡 Legacy
'clear_all_memory'              // 🟡 Legacy
'delete_conversation'           // 🟡 Legacy

// VOICE
'speak'                         // ✅ Used
'start_recording'               // ✅ Used
'stop_recording'                // ✅ Used

// PERSONA
'persona_initialize'            // ✅ Used
'persona_get_multipliers'       // ✅ Used

// META-MODE
'meta_mode_reset'               // 🟡 Legacy
```

### Wrappers TypeScript (`services/tauri/commands.ts`)

**Structure actuelle**:
```typescript
export const tauri = {
  metaMode: {
    process, getKevinState, getCurrentMode, 
    listModes, getHistory, getStats, reset
  },
  exp: {
    add, getProfile, listTalents, 
    unlockTalent, getLevelUpHistory
  },
  memory: {
    store, storeConversation, search, 
    getRelated, getStats, clear
  },
  voice: {
    startRecording, stopRecording, speak
  },
  system: {
    getStatus, isAvailable
  }
};
```

**❌ PROBLÈME**: Wrappers couvrent **<20% des commandes backend disponibles**

---

## 🔴 PROBLÈMES IDENTIFIÉS

### P0 — CRITIQUE (Blocage fonctionnel)

#### 1. **Fragmentation services frontend**
**État**: 3 façons différentes d'appeler Tauri
- ❌ `invoke()` direct dans composants (ChatWindow, VoiceUI)
- ❌ `tauri.memory.store()` via wrapper (ancien)
- ✅ `memoryIntegration.loadContext()` via service (nouveau)

**Impact**: Code incohérent, duplication logique, tests impossibles

**Solution**:
```typescript
// BAD - Direct invoke
await invoke('memory_save_entry', { content });

// GOOD - Service layer
await memoryIntegration.saveEntry(content);
```

#### 2. **Types non synchronisés Frontend ↔ Backend**

**Exemples identifiés**:

##### A. ProjectStatus
```rust
// Backend (memory_chat.rs)
#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ProjectStatus {
    Active,
    Paused,
    Completed,
}
```

```typescript
// Frontend (memoryIntegration.ts)
export interface ProjectSummary {
  status: 'active' | 'paused' | 'completed';  // ✅ OK
}
```
**Status**: ✅ Aligné

##### B. EmotionState
```rust
// Backend (memory_chat.rs)
pub struct EmotionState {
    pub valence: f32,
    pub intensity: f32,
    pub energy: f32,
}
```

```typescript
// Frontend (chatEngine.ts)
emotionState?: { valence: number; intensity: number; energy: number }
```
**Status**: ✅ Aligné

##### C. SystemStatus (⚠️ MISMATCH)
```rust
// Backend (types/system.rs)
pub struct SystemState {
    pub helios: HeliosState,
    pub nexus: NexusState,
    pub harmonia: HarmoniaState,
    pub sentinel: SentinelState,
    pub memory: MemoryState,
}
```

```typescript
// Frontend (tauri/types.ts)
export interface SystemStatus {
  status: 'online' | 'offline' | 'degraded';
  provider: string;
  // ❌ MANQUE: cores (helios, nexus, etc.)
}
```
**Status**: ❌ Incomplet

#### 3. **Commandes obsolètes non supprimées**

**Legacy commands encore présentes** mais inutilisées:
- `memory_save_entry` → Remplacé par `memory_save_chat_interaction`
- `delete_conversation` → Géré par ChatEngine
- `clear_all_memory` → Dangereux, devrait être protégé

**Impact**: Surface d'attaque accrue, confusion développeurs

### P1 — HAUTE PRIORITÉ (Qualité)

#### 4. **Pas de validation Zod côté backend**

```typescript
// Frontend valide avec Zod
const validated = InteractionRequestSchema.parse(request);
await invoke('meta_mode_process', { request: validated });
```

```rust
// Backend accepte n'importe quoi
#[tauri::command]
pub async fn meta_mode_process(request: InteractionRequest) -> Result<...> {
    // ❌ Pas de validation des champs
}
```

**Solution**: Ajouter `#[serde(deny_unknown_fields)]` + validation métier

#### 5. **Gestion erreurs incohérente**

**Frontend**:
```typescript
try {
  await invoke('command');
} catch (error) {
  // Parfois Error, parfois string, parfois {message}
}
```

**Backend**:
```rust
// Méthode 1: Result<T, String>
pub fn command1() -> Result<Data, String> { ... }

// Méthode 2: Result<T, CoreError>
pub fn command2() -> Result<Data, CoreError> { ... }

// Méthode 3: AppResult<T>
pub fn command3() -> AppResult<Data> { ... }
```

**Impact**: Impossible centraliser gestion erreurs frontend

**Solution**: Type d'erreur unifié
```rust
#[derive(Serialize)]
pub struct TauriError {
    pub code: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

pub type TauriResult<T> = Result<T, TauriError>;
```

#### 6. **Pas de documentation OpenAPI/Swagger**

**État**: Aucune doc génénérée automatiquement
- ❌ Pas de spec TypeScript auto-générée depuis Rust
- ❌ Devs doivent lire manuellement code Rust
- ❌ Risque drift types (frontend ≠ backend)

**Solution**: Utiliser `ts-rs` ou `specta`
```rust
#[derive(Serialize, TS)]  // Generate TypeScript types
#[ts(export)]
pub struct ProjectSummary {
    pub id: String,
    pub name: String,
}
```

### P2 — AMÉLIORATIONS (Robustesse)

#### 7. **Pas de versioning API**

**Problème**: Si backend change signature commande, frontend casse silencieusement

**Solution**: Ajouter version dans commandes critiques
```rust
#[tauri::command]
pub async fn memory_get_projects_v2(
    limit: usize,
    filters: Option<ProjectFilters>
) -> Result<Vec<ProjectSummary>, TauriError>
```

#### 8. **Timeouts non configurés**

```typescript
// ❌ Appel bloque indéfiniment si backend freeze
await invoke('long_running_command');

// ✅ Devrait avoir timeout
await invokeWithTimeout('command', 5000);
```

#### 9. **Pas de retry automatique**

**Commandes réseau** (Gemini, Ollama) devraient retry automatiquement:
```typescript
async function invokeWithRetry<T>(
  cmd: string, 
  retries: number = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await invoke(cmd);
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * Math.pow(2, i));  // Exponential backoff
    }
  }
}
```

---

## 🎯 PLAN D'ALIGNEMENT

### Phase 1: Unification Types (1 semaine)

#### 1.1 Générer types TypeScript depuis Rust
```bash
# Installer ts-rs
cargo add ts-rs --features tauri

# Annoter tous les types publics
#[derive(Serialize, TS)]
#[ts(export, export_to = "../src/types/tauri/")]
```

**Résultat**: 100% types garantis synchronisés

#### 1.2 Créer types d'erreur unifiés
```rust
// src-tauri/src/types/error.rs
#[derive(Serialize, TS)]
#[ts(export)]
pub struct TauriError {
    pub code: ErrorCode,
    pub message: String,
    pub details: Option<Value>,
    pub timestamp: i64,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub enum ErrorCode {
    Validation,
    NotFound,
    Internal,
    Timeout,
    Unauthorized,
}
```

#### 1.3 Audit tous les contrats existants
**Checklist**:
- [ ] Lister toutes commandes avec signature
- [ ] Vérifier types Rust → TypeScript
- [ ] Identifier mismatches (Status ✅/❌)
- [ ] Créer rapport divergences

### Phase 2: Centralisation Services (1 semaine)

#### 2.1 Créer services frontend unifiés
```typescript
// src/services/api/
├── system.ts      // Health, status, metrics
├── memory.ts      // Memory Core (nouveau)
├── chat.ts        // Chat IA
├── voice.ts       // TTS/ASR
├── persona.ts     // Persona Engine
└── evolution.ts   // Auto-heal, evolution
```

**Règle**: Tous `invoke()` DOIVENT passer par ces services

#### 2.2 Supprimer invoke() direct
```bash
# Audit
grep -r "invoke(" src/ --include="*.ts" --include="*.tsx"

# Refactor vers services
# ChatWindow.tsx: invoke('speak') → voice.speak()
# VoiceUI.tsx: invoke('start_recording') → voice.startRecording()
```

#### 2.3 Ajouter couche validation
```typescript
export class VoiceService {
  async speak(text: string, online: boolean): Promise<void> {
    // Validation
    if (!text || text.length === 0) {
      throw new ValidationError('Text cannot be empty');
    }
    if (text.length > 10000) {
      throw new ValidationError('Text too long (max 10000 chars)');
    }
    
    // Appel Tauri
    await invoke('speak', { text, useOnline: online });
  }
}
```

### Phase 3: Robustesse (1 semaine)

#### 3.1 Implémenter retry logic
```typescript
export async function invokeWithRetry<T>(
  cmd: string,
  payload?: Record<string, unknown>,
  options?: { retries?: number; timeout?: number }
): Promise<T> {
  const retries = options?.retries ?? 3;
  const timeout = options?.timeout ?? 30000;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await Promise.race([
        invoke<T>(cmd, payload),
        timeoutPromise(timeout),
      ]);
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await exponentialBackoff(attempt);
    }
  }
}
```

#### 3.2 Centraliser gestion erreurs
```typescript
export class TauriErrorHandler {
  static handle(error: unknown): never {
    if (error instanceof TauriError) {
      switch (error.code) {
        case 'VALIDATION':
          toast.error('Données invalides');
          break;
        case 'NOT_FOUND':
          toast.error('Resource introuvable');
          break;
        case 'TIMEOUT':
          toast.error('Timeout - Réessayez');
          break;
        default:
          toast.error('Erreur système');
      }
    }
    throw error;
  }
}
```

#### 3.3 Tests intégration E2E
```typescript
describe('Memory Core Integration', () => {
  it('should save and load projects', async () => {
    const projects = await memory.getActiveProjects(5);
    expect(projects).toHaveLength(5);
    expect(projects[0]).toMatchSchema(ProjectSummarySchema);
  });
  
  it('should handle timeout gracefully', async () => {
    await expect(
      memory.getActiveProjects(1000000)
    ).rejects.toThrow(TimeoutError);
  });
});
```

### Phase 4: Documentation & Monitoring (ongoing)

#### 4.1 Générer doc API
```bash
# Générer markdown depuis annotations Rust
cargo doc --open

# Générer TypeScript types + JSDoc
npx ts-rs generate
```

#### 4.2 Ajouter métriques
```rust
#[tauri::command]
pub async fn memory_get_projects(limit: usize) -> TauriResult<Vec<ProjectSummary>> {
    let start = Instant::now();
    let result = inner_get_projects(limit).await;
    
    metrics::record_command_latency("memory_get_projects", start.elapsed());
    result
}
```

#### 4.3 Dashboard monitoring
- Latence moyenne par commande
- Taux erreurs
- Commandes les plus appelées
- Divergences types détectées

---

## 📊 MÉTRIQUES CIBLES

| Métrique | Actuel | Cible | Méthode |
|----------|--------|-------|---------|
| **Coverage wrappers** | 20% | 100% | Services par domaine |
| **Type safety** | 80% | 100% | ts-rs auto-gen |
| **Erreurs unifiées** | 30% | 100% | TauriError type |
| **Tests E2E** | 0 | 50+ | Vitest + Playwright |
| **Latence P95** | ? | <100ms | Métriques Rust |
| **Taux erreurs** | ? | <1% | Monitoring |

---

## 🚀 ORDRE D'IMPLÉMENTATION

**Semaine 1**: Phase 1 (Types unifiés)
- Installer ts-rs
- Générer types TypeScript
- Créer TauriError unifié
- Audit contrats (rapport complet)

**Semaine 2**: Phase 2 (Services)
- Créer 6 services API
- Refactor tous invoke() directs
- Validation entrées/sorties

**Semaine 3**: Phase 3 (Robustesse)
- Retry logic + timeouts
- Gestion erreurs centralisée
- Tests E2E (20 scénarios)

**Semaine 4**: Phase 4 (Doc + Monitor)
- Doc API auto-générée
- Dashboard métriques
- Alertes divergences

---

## 🔗 RESSOURCES

- **ts-rs**: https://github.com/Aleph-Alpha/ts-rs
- **specta**: https://github.com/specta-rs/specta
- **Tauri best practices**: https://tauri.app/v1/guides/features/command

---

**Status**: ⏳ Diagnostic complet - Prêt Phase 1 (Types unifiés)
