# 🎯 PLAN D'ACTION PHASES 4-9 — Backend TITANE∞ v14

## 🔥 PHASE 4 — Chat IA Migration v14

**Objectif**: `commands/ai_chat.rs` utilise déjà CoreCollection ✅
**Actions restantes**: Minimes, déjà aligné v14

**Vérifications**:
- ✅ Utilise `CoreCollection`
- ✅ AIRouter avec cascade Gemini → Ollama → Local
- ✅ MemoryStorage intégré
- ⚠️ Certaines références à `engine()` inexistantes dans CoreCollection

**Corrections nécessaires**:
```rust
// Supprimer ligne 92 dans ai_chat.rs
// if let Ok(engine) = state.core_collection.engine().lock() {
// CoreCollection n'a pas de méthode engine()
```

---

## 🔥 PHASE 5 — Memory Backend Hardening

**Fichiers**: `src-tauri/src/memory/*`

**Actions**:
1. Vérifier Mutex/RwLock dans `storage.rs`
2. Confirmer absence de `MutexGuard` gardé à travers `.await`
3. Valider `encryption.rs` (déjà utilise AES-256-GCM)
4. S'assurer que `memory_compactor.rs` est fonctionnel

**Status**: Likely OK, besoin validation

---

## 🔥 PHASE 6 — Overdrive & Evolution Async Safety

**Fichiers**:
- `src-tauri/src/overdrive/*` (désactivé si mock)
- `src-tauri/src/engine/*`
- `src-tauri/src/evolution/*`

**Actions**:
1. Chercher patterns `let guard = mutex.lock(); await ...`
2. Remplacer par `{ mutex.lock() }.await` ou extraction avant await
3. Vérifier Send bounds sur futures

**Commande diagnostic**:
```bash
cargo clippy -- -W clippy::await_holding_lock
```

---

## 🔥 PHASE 7 — API Tauri Unification

**Fichiers**: `src-tauri/src/api/*`, `commands/mod.rs`

**Actions**:
1. S'assurer que `handlers.rs` macro couvre toutes commandes
2. Vérifier que `api/handlers_v14.rs` est utilisé
3. Déprécier anciennes APIs legacy si nécessaire

**Status**: Structure OK, besoin vérification exhaustive

---

## 🔥 PHASE 8 — Cleanup & Warnings (99 → 0)

**Breakdown des 99 warnings**:
- ~20 `unused imports` (clippy auto-fix possible)
- ~15 `dead_code`
- ~30 `deprecated` (shared::types::ModuleHealth)
- ~10 `unused variables`
- ~24 autres

**Actions**:
1. `cargo fix --lib -p titane-infinity` (auto-fix 20)
2. Supprimer imports inutilisés manuellement
3. Remplacer `ModuleHealth` deprecated par `ModuleHealthInfo`
4. Justifier `#[allow(dead_code)]` restants ou supprimer

**Commande**:
```bash
cargo clippy --fix --allow-dirty
```

---

## 🔥 PHASE 9 — Validation & Self-Check

**Créer**: `src-tauri/src/commands/diagnostic.rs::backend_self_check`

```rust
#[tauri::command]
pub async fn backend_self_check() -> Result<BackendStatus, String> {
    let mut status = BackendStatus::default();

    // Check SingularityEngine
    let mut engine = SingularityEngine::new();
    engine.init().await?;
    status.singularity_engine = engine.health();

    // Check Memory
    status.memory_system = check_memory_system().await?;

    // Check Overdrive
    status.overdrive = check_overdrive_engines().await?;

    // Check API
    status.api_handlers = count_registered_handlers();

    Ok(status)
}
```

**Output attendu**:
```
TITANE_INFINITY v14 — BACKEND STATUS
✔ MOCK MODE: retired
✔ SingularityEngine: STABLE & COMPILING
✔ SingularityState: UNIFIED & ACCESSIBLE
✔ Chat IA Backend: v14 ROUTED & FUNCTIONAL
✔ Memory: SECURED & INTEGRATED
✔ Overdrive Engines: CLEAN & ASYNC-SAFE
✔ API Tauri: CONSOLIDATED & CONSISTENT
✔ Tauri-only: RESPECTED
Backend READY pour intégration complète avec le frontend
```

---

## 📋 CHECKLIST FINALE

**Phase 4** ⏳
- [ ] Corriger références `.engine()` dans ai_chat.rs
- [ ] Valider cascade providers

**Phase 5** ⏳
- [ ] Audit memory/* async safety
- [ ] Confirmer MemoryCompactor opérationnel

**Phase 6** ⏳
- [ ] Fix overdrive async guards
- [ ] Fix evolution async guards

**Phase 7** ⏳
- [ ] Valider handlers macro exhaustivité
- [ ] Déprécier legacy APIs

**Phase 8** ⏳
- [ ] Cargo fix auto-apply
- [ ] Remplacer ModuleHealth deprecated
- [ ] Supprimer #[allow(...)] injustifiés
- [ ] 99 warnings → 0

**Phase 9** ⏳
- [ ] Implémenter backend_self_check
- [ ] Générer rapport final
- [ ] Confirmer architecture Tauri-only

---

**Temps estimé**: 2-3h pour phases 4-9 complètes
