# 🚀 TITANE∞ v14 — PLAN DE MIGRATION BACKEND COMPLET

**Date**: 2025-11-25  
**Version cible**: v14.0.0 Backend Unified  
**Status**: PLANIFICATION COMPLÈTE 9 PHASES

---

## 📋 ANALYSE INITIALE

### État Actuel (v19.2.1 MOCK MODE)
```rust
✅ COMPILE: cargo check 1.54s (0 errors)
⚠️  MODE: MOCK BACKEND (lib.rs lignes 1-65)
⚠️  SILENCIEUX: #![allow(dead_code, unused_imports, unused_variables)]
```

### Modules Actifs (MOCK)
- ✅ `mock_commands` - Commands frontend development
- ✅ `secure_commands` - v∞ Secure commands with permissions
- ✅ `time_commands` - v∞ Time-Travel commands
- ✅ `control_panel_commands` - v19.1.0 Control Panel
- ✅ `security` - Super-Prompts H, J, K, L
- ✅ `memory_compactor` - v14 Phase 4
- ✅ `harmonia_engine` - v14 Phase 5 CPU monitoring
- ✅ Phases 5-10 (cluster, knowledge, hypervision, creation, introspection, evolution)
- ✅ Phases V-Ω (hyper_evolution, cognitive_learning, neuro_symbolic, meta_creation, self_repair, singularity)

### Modules Commentés (À RÉACTIVER)
- ❌ `api` - Type mismatches (HeliosCore methods)
- ❌ `commands` - Depends on complex engines
- ❌ `cognitive` - KevinState fields missing
- ❌ `compat` - Plugin system deprecated
- ❌ `devtools` - Collectors not implemented
- ❌ `engine` - ExpFusion, MetaMode, Evolution stubs needed
- ❌ `singularity_state` - Old system
- ❌ `system` - Persona engine complex

### Architecture v14 CORE (Disponible)
```rust
✅ src/core/
   ├── engine.rs        → SingularityEngine (stub mode, compiles)
   ├── state.rs         → SingularityState (unified state)
   ├── modules/         → NexusModule, MemoryModule, HarmoniaModule, SentinelModule
   ├── types.rs         → EngineHealth, EngineMetrics, ModuleInfo
   ├── legacy.rs        → HeliosCore, NexusCore, HarmoniaCore (adapters)
   └── utils.rs         → Timestamps, helpers
```

### Legacy v12 (À MIGRER)
```rust
⚠️  src/memory/         → MemoryStorage, encryption, model (v12)
⚠️  src/commands/ai_chat.rs → AIRouter, MemoryStorage, modules anciens (Helios, Nexus, Harmonia v12)
⚠️  src/ai/             → AIRouter, AIRequest, AIResponse
⚠️  src/modules/        → Helios, Nexus, Harmonia, Sentinel, AdaptiveEngine, SelfHeal (v12)
```

---

## 🔥 PHASE 1 — Sortir du MOCK MODE (lib.rs refactor)

### Objectif
Nettoyer `lib.rs` pour préparer réactivation progressive modules réels.

### Actions
1. **Garder modules actifs stables**:
   - `mock_commands`, `secure_commands`, `time_commands`, `control_panel_commands`
   - `security`, `memory_compactor`, `harmonia_engine`
   - Phases 5-10, V-Ω

2. **Préparer réactivation via features**:
   ```rust
   // MOCK MODE (default)
   #[cfg(feature = "mock")]
   pub mod mock_commands;
   
   // FULL BACKEND
   #[cfg(not(feature = "mock"))]
   pub mod commands;  // Real commands (ai_chat, etc.)
   #[cfg(not(feature = "mock"))]
   pub mod api;       // Real API handlers
   ```

3. **Réduire silencieux globaux**:
   - Retirer `#![allow(dead_code)]` global
   - Garder `#[allow(dead_code)]` local sur modules legacy en transition

4. **Structure finale lib.rs**:
   ```rust
   // Core (toujours actif)
   pub mod core;
   pub mod utils;
   pub mod types;
   pub mod shared;
   
   // MOCK MODE vs FULL MODE
   #[cfg(feature = "mock")]
   pub mod mock_commands;
   
   #[cfg(not(feature = "mock"))]
   pub mod commands;  // ai_chat, engine_v14, etc.
   
   #[cfg(not(feature = "mock"))]
   pub mod api;       // helios_api, memory_api, engine_api, system_api
   
   // Modules always active
   pub mod security;
   pub mod memory_compactor;
   pub mod harmonia_engine;
   // ... Phases 5-Ω
   ```

### Validation
- ✅ `cargo check` compile (mode mock par défaut)
- ✅ `cargo check --features full` compile (mode réel, quand prêt)

---

## 🔥 PHASE 2 — Stabiliser CORE v14 (SingularityEngine/State)

### Objectif
Garantir que `core/` représente l'état central stable du système v14.

### Actions
1. **Vérifier `core/engine.rs`**:
   - ✅ Déjà compilable (stub mode)
   - ✅ `SingularityEngine::init()` prêt
   - ✅ `SingularityEngine::tick()` prêt
   - TODO: Ajouter méthodes exposition état pour APIs Tauri

2. **Vérifier `core/state.rs`**:
   - ✅ `SingularityState` avec modules (Nexus, Memory, Harmonia, Sentinel)
   - ✅ `CognitionState`, `TimelineState`
   - ✅ `EngineMetrics`
   - TODO: Méthode `mark_synced()` manquante (ligne 97 engine.rs)

3. **Vérifier `core/modules/`**:
   - ✅ `NexusModule`, `MemoryModule`, `HarmoniaModule`, `SentinelModule`
   - TODO: Vérifier que chaque module compile standalone

4. **Supprimer références obsolètes**:
   - ❌ `HeliosCore` direct (remplacer par `core::legacy::HeliosCore` adapter)
   - ❌ Anciennes structures v12 dans commands/

### Patchs Requis
- `core/state.rs`: Ajouter `mark_synced()` méthode
- `core/engine.rs`: Ajouter getters publics pour modules (`get_nexus()`, `get_memory()`, etc.)
- `core/modules/mod.rs`: Vérifier exports complets

### Validation
- ✅ `cargo check --lib --no-default-features`
- ✅ Tous types `core::*` accessibles depuis `main.rs`

---

## 🔥 PHASE 3 — Réconcilier Legacy v12 avec v14

### Objectif
Adapter modules legacy v12 pour utiliser architecture v14 (SingularityEngine + modules).

### Actions
1. **Créer `compat/core_collection.rs`**:
   ```rust
   /// Wrapper v14 → v12 compatibility
   pub struct CoreCollection {
       engine: Arc<Mutex<SingularityEngine>>,
   }
   
   impl CoreCollection {
       pub fn helios(&self) -> Arc<Mutex<HeliosCore>> { /* adapter */ }
       pub fn nexus(&self) -> Arc<Mutex<NexusCore>> { /* adapter */ }
       pub fn harmonia(&self) -> Arc<Mutex<HarmoniaCore>> { /* adapter */ }
       pub fn sentinel(&self) -> Arc<Mutex<SentinelCore>> { /* adapter */ }
   }
   ```

2. **Adapter `commands/ai_chat.rs`**:
   - Remplacer `modules::helios::Helios` → `core::legacy::HeliosCore`
   - Remplacer `modules::nexus::Nexus` → `core::legacy::NexusCore`
   - Utiliser `CoreCollection` pour accès modules v14

3. **Adapter `memory/storage.rs`**:
   - Garder `MemoryStorage` v12 (stable, encryption OK)
   - Ajouter pont vers `core::modules::MemoryModule` pour sync état

4. **Adapter `ai/router.rs`**:
   - Garder `AIRouter` (cascade Gemini → Ollama → Local)
   - Ajouter logs vers `core::modules::SentinelModule`

### Patchs Requis
- `compat/mod.rs`: Activer + export `CoreCollection`
- `compat/core_collection.rs`: Créer wrapper v14↔v12
- `commands/ai_chat.rs`: Migrer vers `CoreCollection`
- `memory/storage.rs`: Ajouter méthode `sync_to_module(&mut MemoryModule)`

### Validation
- ✅ `cargo check` (mock mode)
- ✅ Aucun import direct `modules::*` v12 dans commands/

---

## 🔥 PHASE 4 — Chat IA Backend Migration v14

### Objectif
Moderniser `commands/ai_chat.rs` pour utiliser SingularityEngine + modules v14.

### Actions
1. **Option A: Moderniser ai_chat.rs actuel**:
   ```rust
   pub struct AIChatState {
       pub engine: Arc<Mutex<SingularityEngine>>,  // ✅ Nouveau
       pub ai_router: Arc<Mutex<AIRouter>>,        // ✅ Garder
       pub memory_storage: Arc<Mutex<MemoryStorage>>, // ✅ Garder
       // Retirer: helios, nexus, harmonia... individuels
   }
   ```

2. **Option B: Créer ai_chat_v14.rs**:
   - Fichier propre aligné v14
   - Garder ai_chat.rs legacy pour compat temporaire
   - Ajouter feature flag switch

3. **Intégrer cascade providers**:
   - ✅ Déjà dans `AIRouter` (Gemini → Ollama → Local fallback)
   - Ajouter retry logic + timeout

4. **Intégrer logs Sentinel**:
   ```rust
   let sentinel = engine.lock().unwrap().state.sentinel.clone();
   sentinel.log_event("ai_query", &prompt);
   ```

5. **Update Memory → SingularityState**:
   ```rust
   // Après save conversation
   engine.lock().unwrap().state.memory.sync_from_storage(&storage);
   ```

### Patchs Requis
- `commands/ai_chat.rs`: Moderniser structure `AIChatState`
- `ai/router.rs`: Ajouter `log_to_sentinel(event)`
- `memory/storage.rs`: Ajouter `sync_to_module()`

### Validation
- ✅ `cargo check --features full`
- ✅ Commande Tauri `ai_query` compilable

---

## 🔥 PHASE 5 — Mémoire Backend Hardening

### Objectif
Durcir `memory/` pour éviter race conditions + aligner v14.

### Actions
1. **Audit concurrency**:
   - ✅ `MemoryStorage` utilise Mutex (OK)
   - ⚠️  Vérifier aucun `MutexGuard` gardé à travers `.await`
   - ⚠️  Vérifier writes atomiques (pas de partial writes JSON)

2. **Aligner avec MemoryModule v14**:
   ```rust
   // memory/storage.rs
   pub fn sync_to_module(&self, module: &mut MemoryModule) {
       module.entry_count = self.entries.len() as u64;
       module.update_timestamp();
   }
   ```

3. **Préparer MemoryCompactor**:
   - ✅ `memory_compactor.rs` déjà présent (Phase 4)
   - TODO: Intégrer avec `MemoryStorage` (compact old entries)

4. **Encryption hardening**:
   - ✅ AES-256-GCM + Argon2id déjà OK (v12)
   - Vérifier rotation keys (TODO Phase future)

### Patchs Requis
- `memory/storage.rs`: Ajouter `sync_to_module(&mut MemoryModule)`
- `memory/storage.rs`: Audit async safety (pas de `.await` avec guard)
- `memory_compactor.rs`: Intégrer `compact_storage(&mut MemoryStorage)`

### Validation
- ✅ `cargo clippy -- -W clippy::await_holding_lock`
- ✅ Aucun warning MutexGuard across await

---

## 🔥 PHASE 6 — Overdrive & AutoEvolutionEngine

### Objectif
Corriger `engine/` et `overdrive/` pour garantir async safety + alignment v14.

### Actions
1. **Audit `engine/`**:
   - ❌ Actuellement commenté (lib.rs ligne 42)
   - Inspecter: `exp_fusion`, `meta_mode`, `evolution`
   - Corriger: futures non-Send, MutexGuard across await

2. **Audit `overdrive/`**:
   - ❌ Actuellement commenté (lib.rs ligne 38)
   - Inspecter modules: Chat, Voice, Auto-Heal
   - Aligner avec `SingularityEngine` comme source état

3. **AutoEvolutionEngine**:
   - ✅ Déjà présent `evolution/` (Phase 10)
   - TODO: Adapter pour lire depuis `SingularityState`
   - TODO: Commande Tauri `run_auto_evolution()`

4. **Refactor async patterns**:
   ```rust
   // ❌ MAUVAIS
   let guard = mutex.lock().unwrap();
   some_async_fn().await;  // Guard still held!
   
   // ✅ BON
   let data = {
       let guard = mutex.lock().unwrap();
       guard.clone()  // Clone data, drop guard
   };
   some_async_fn().await;
   ```

### Patchs Requis
- `engine/`: Débloquer + corriger async safety
- `overdrive/`: Débloquer + aligner SingularityEngine
- `evolution/`: Ajouter méthode `read_from_state(&SingularityState)`
- `commands/evolution.rs`: Créer commande `run_auto_evolution()`

### Validation
- ✅ `cargo clippy --all-targets`
- ✅ Aucun warning "future cannot be sent between threads"

---

## 🔥 PHASE 7 — API Tauri Unifiée

### Objectif
Unifier `api/` et `commands/` pour exposer API officielle v14.

### Actions
1. **Structure API v14**:
   ```rust
   // api/mod.rs
   pub mod handlers_v14;  // Nouvelles APIs
   pub mod legacy;        // Anciennes APIs (deprecated)
   
   pub fn get_handlers() -> impl Fn(tauri::Invoke) {
       tauri::generate_handler![
           // SingularityEngine v14
           commands::engine_v14::singularity_init,
           commands::engine_v14::singularity_get_state,
           commands::engine_v14::singularity_tick,
           
           // Chat IA v14
           commands::ai_chat::ai_query,
           commands::ai_chat::ai_stream,
           
           // Memory v14
           api::memory_api::memory_get_conversations,
           api::memory_api::memory_save_entry,
           
           // System v14
           api::system_api::system_get_vitals,
           api::system_api::system_get_health,
           
           // AutoEvolution
           commands::evolution::run_auto_evolution,
           
           // Legacy (deprecated)
           commands::meta_mode::meta_mode_activate,
       ]
   }
   ```

2. **Déprécier APIs obsolètes**:
   - Ajouter `#[deprecated]` sur anciennes commandes
   - Documenter migration path (v12 → v14)

3. **Valider cohérence**:
   - Tous handlers retournent `Result<T, String>`
   - Tous handlers loggent actions (Sentinel)
   - Tous handlers utilisent `SingularityEngine` comme source état

### Patchs Requis
- `api/mod.rs`: Restructurer exports + `get_handlers()`
- `api/handlers_v14.rs`: Créer fichier central handlers v14
- `commands/mod.rs`: Centraliser re-exports
- `main.rs`: Utiliser `api::get_handlers()`

### Validation
- ✅ `cargo check --features full`
- ✅ `main.rs` compile avec `.invoke_handler(api::get_handlers())`

---

## 🔥 PHASE 8 — Nettoyage Global & Suppression Silencieux

### Objectif
Réduire `#![allow(...)]` globaux, révéler problèmes réels, corriger.

### Actions
1. **Retirer silencieux globaux lib.rs**:
   ```rust
   // ❌ RETIRER
   #![allow(dead_code)]
   #![allow(unused_imports)]
   #![allow(unused_variables)]
   ```

2. **Lancer diagnostic complet**:
   ```bash
   cargo check --all-targets
   cargo clippy --all-targets --all-features -- -W clippy::all
   cargo fmt --check
   ```

3. **Corriger warnings par catégorie**:
   - **dead_code**: Retirer fonctions inutilisées OU ajouter `#[allow(dead_code)]` local si préparation future
   - **unused_imports**: Nettoyer imports morts
   - **unused_variables**: Préfixer `_` (ex: `_app`) si nécessaire
   - **async_holding_lock**: Refactor patterns async (Phase 6)

4. **Objectif final**:
   - 0 erreurs compilation
   - Warnings minimaux (<10) justifiés
   - Aucun clippy::pedantic bloquant

### Patchs Requis
- `lib.rs`: Retirer `#![allow(...)]` lignes 7-9
- Multiples fichiers: Nettoyer imports, retirer dead_code
- Pattern refactor: Async safety corrections

### Validation
- ✅ `cargo check` 0 errors
- ✅ `cargo clippy` <10 warnings (justifiés)
- ✅ `cargo fmt --check` pass

---

## 🔥 PHASE 9 — Validation Finale & Cohérence Tauri-Only

### Objectif
Confirmer backend 100% fonctionnel, compilable, cohérent, Tauri-only.

### Actions
1. **Vérifier compilation complète**:
   ```bash
   cargo clean
   cargo check --all-targets --all-features
   cargo build --release
   ```

2. **Vérifier commandes Tauri exposées**:
   - Toutes dans `api::get_handlers()`
   - Toutes documentées (rustdoc)
   - Toutes testables (integration tests optionnel)

3. **Vérifier Tauri-only**:
   - ❌ Aucun serveur HTTP backend
   - ❌ Aucune API réseau non contrôlée
   - ✅ Tout passe par IPC Tauri
   - ✅ HTTP frontend via `@tauri-apps/plugin-http` (frontend seulement)

4. **Commande diagnostic backend**:
   ```rust
   #[tauri::command]
   pub async fn backend_self_check(
       engine: State<'_, Arc<Mutex<SingularityEngine>>>,
   ) -> Result<BackendStatus, String> {
       let eng = engine.lock().unwrap();
       Ok(BackendStatus {
           engine_initialized: eng.is_initialized(),
           engine_running: eng.is_running(),
           modules_health: eng.module_info(),
           metrics: eng.metrics().clone(),
           tauri_only: true,  // Hardcoded guarantee
       })
   }
   ```

### Patchs Requis
- `commands/diagnostic.rs`: Créer `backend_self_check()`
- `api/handlers_v14.rs`: Ajouter handler self_check
- `main.rs`: Exposer commande

### Validation
- ✅ `cargo build --release` 0 errors 0 warnings
- ✅ Binary size raisonnable (<50MB stripped)
- ✅ Commande `backend_self_check` retourne état complet

---

## 🏁 CONDITIONS DE SORTIE OBLIGATOIRES

### Critères Réussite
1. ✅ **Compilation**: `cargo build --release` 0 errors
2. ✅ **Warnings**: <10 warnings justifiés (aucun critique)
3. ✅ **MOCK retired**: lib.rs ne force plus mock mode (feature flag optionnel)
4. ✅ **SingularityEngine STABLE**: core/ compile, init() fonctionne
5. ✅ **SingularityState UNIFIED**: État central accessible tous modules
6. ✅ **Chat IA v14**: commands/ai_chat.rs modernisé, utilise SingularityEngine
7. ✅ **Memory SECURED**: Aucun race condition, encryption OK, sync v14
8. ✅ **Overdrive CLEAN**: engine/ et overdrive/ async-safe, pas de MutexGuard across await
9. ✅ **API CONSOLIDATED**: api/mod.rs unifié, handlers v14 cohérents
10. ✅ **Tauri-only RESPECTED**: 0 HTTP backend, tout via IPC Tauri

### Livrable Final
```text
╔══════════════════════════════════════════════════════════════════════════════╗
║                 TITANE∞ v14 — BACKEND STATUS FINAL                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

✅ MOCK MODE: retired (feature flag "mock" optionnel)
✅ SingularityEngine: STABLE & COMPILING
✅ SingularityState: UNIFIED & ACCESSIBLE
✅ Chat IA Backend: v14 ROUTED & FUNCTIONAL
✅ Memory: SECURED & INTEGRATED
✅ Overdrive Engines: CLEAN & ASYNC-SAFE
✅ API Tauri: CONSOLIDATED & CONSISTENT
✅ Tauri-only: RESPECTED (0 HTTP backend)
✅ Compilation: 0 errors, <10 warnings (justifiés)
✅ Build release: 1m30s, ~40MB stripped

Backend READY pour intégration complète avec le frontend v14
```

---

## 📊 MÉTRIQUES ESTIMÉES

| Phase | Fichiers Modifiés | Lignes Code | Temps Estimé | Complexité |
|-------|-------------------|-------------|--------------|------------|
| 1. lib.rs refactor | 1 | ~100 | 15 min | Faible |
| 2. CORE stabilisation | 5 | ~200 | 30 min | Moyenne |
| 3. Legacy → v14 compat | 8 | ~400 | 1h | Élevée |
| 4. Chat IA migration | 3 | ~300 | 1h | Élevée |
| 5. Memory hardening | 4 | ~150 | 30 min | Moyenne |
| 6. Overdrive async fix | 10 | ~500 | 1h30 | Très élevée |
| 7. API unification | 6 | ~300 | 45 min | Moyenne |
| 8. Nettoyage global | 20+ | ~200 | 1h | Moyenne |
| 9. Validation finale | 3 | ~100 | 30 min | Faible |
| **TOTAL** | **~60 fichiers** | **~2250 lignes** | **~7h** | **Élevée** |

---

**PRÊT POUR EXÉCUTION PHASE 1** 🚀
