# 🏗️ ARCHITECTURE DUAL STATE — TITANE∞

**Version**: v∞.1.1  
**Date**: 11 décembre 2025  
**Context**: Clarification séparation SingularityState

---

## 📊 VUE D'ENSEMBLE

TITANE∞ utilise **2 implémentations SingularityState distinctes** avec rôles complémentaires :

1. **Singularity Meta-Processing** (Chat IA specific)
2. **System State Monitor** (Global monitoring)

Cette séparation est **intentionnelle** et reflète la distinction entre :
- **Meta-cognition conversationnelle** (validation réponses Chat IA)
- **État système global** (monitoring santé 5 layers)

---

## 🎯 FICHIER #1 : SINGULARITY META-PROCESSING

### Identification
- **Path**: `src-tauri/src/singularity/singularity_state.rs`
- **Taille**: 250 lignes
- **Import**: `use crate::singularity::singularity_state::ChatContext;`
- **Scope**: **Conversation-specific** (Chat IA uniquement)

### Rôle
**Meta-cognitive validation** des conversations Chat IA :
1. Validation cohérence (réponse ↔ intention détectée)
2. Analyse style (French-only, détection fuites anglais)
3. Critères LTM (suggestions consolidation mémoire)
4. Détection ambiguïtés (marqueurs incertitude)
5. Enrichissement metadata (meta-tags, coherence scores)

### Structures Clés
```rust
pub struct ChatContext {
    pub user_message: String,
    pub ai_response: String,
    pub conversation_id: String,
    pub intention: String,
    pub emotion_state: (f32, f32, f32),
    pub cognitive_summary: String,
    pub cognitive_tags: Vec<String>,
    pub memory_context: String,
}

pub struct SingularityMetaOutput {
    pub final_message: String,
    pub refined_intention: Option<String>,
    pub refined_emotion: Option<(f32, f32, f32)>,
    pub meta_tags: Vec<String>,
    pub ltm_suggestions: Vec<String>,
    pub meta_coherence: f32,
    pub corrections_applied: Vec<String>,
}
```

### Méthode Principale
```rust
pub async fn singularity_meta_process_conversation(
    &mut self,
    context: ChatContext,
) -> Result<SingularityMetaOutput, String>
```

### Utilisation
**Unique point d'appel** : `ConversationPipeline.process()` Step 12

```rust
// src-tauri/src/conversation_engine/pipeline.rs (ligne ~219)
let mut singularity = self.singularity.write().await;
match singularity.singularity_meta_process_conversation(context).await {
    Ok(meta_output) => {
        // Utiliser message raffiné + enrichir cognitive_tags
        final_response.content = meta_output.final_message;
        final_response.cognitive_tags.extend(meta_output.meta_tags);
    }
    Err(e) => {
        // Graceful fallback: log erreur, continuer avec réponse originale
        eprintln!("⚠️ Singularity meta-processing failed: {}", e);
    }
}
```

### Performance
- **Latence target** : 10-30ms par conversation
- **Tests** : 3/3 passing (omega_p2_performance_test.rs)
- **Status** : ✅ Production-ready (commit `47d8e3a`, 10 déc 2025)

---

## 🌐 FICHIER #2 : SYSTEM STATE MONITOR

### Identification
- **Path**: `src-tauri/src/singularity_state/mod.rs`
- **Taille**: 501 lignes
- **Import**: `mod singularity_state { include!("singularity_state/mod.rs"); }`
- **Scope**: **System-wide** (monitoring global)

### Rôle
**Monitoring état système global** via architecture 5 layers :
1. **PhysicalLayer** : Helios, health, metrics système
2. **CognitiveLayer** : Memory, conversation, knowledge
3. **SymbolicLayer** : Persona, archetypes, visual
4. **AdaptiveLayer** : Evolution, learning, auto-heal
5. **MetaLayer** : UI, runtime, introspection

### Structure Principale
```rust
pub struct SingularityState {
    pub physical: PhysicalLayer,
    pub cognitive: CognitiveLayer,
    pub symbolic: SymbolicLayer,
    pub adaptive: AdaptiveLayer,
    pub meta: MetaLayer,
    
    pub meta_cognition_report: Option<MetaCognitiveReport>,
    pub deep_sync_status: Option<SyncedState>,
    pub timestamp: u64,
    pub signature: String,
}
```

### Modules
```rust
pub mod commands;     // Tauri commands (singularity_get_full_state, etc.)
pub mod layers;       // PhysicalLayer, CognitiveLayer, etc.
pub mod persistence;  // SQLite storage
pub mod sync;         // EventSyncLayer (Backend → Frontend React)
```

### Méthodes Clés
```rust
pub fn global_coherence(&self) -> f32
pub fn is_critical(&self) -> bool
pub async fn singularity_deep_sync(&mut self) -> Result<MetaCognitiveReport, String>
```

### Utilisation
**Intégration globale** via `main.rs` et Tauri commands :

```rust
// src-tauri/src/main.rs (ligne ~322)
let singularity_engine = Arc::new(
    singularity_state::SingularityEngine::new(app.handle().clone())
);
app.manage(singularity_engine.clone());
```

**Tauri Commands exposés** (frontend React) :
- `singularity_get_full_state`
- `singularity_get_physical`
- `singularity_get_cognitive`
- `singularity_get_symbolic`
- `singularity_get_adaptive`
- `singularity_get_meta`
- `singularity_update_physical`
- `singularity_update_cognitive`
- `singularity_update_symbolic`
- `singularity_update_adaptive`
- `singularity_update_meta`
- `singularity_trigger_deep_sync`

### Performance
- **Latence** : N/A (monitoring asynchrone)
- **Persistence** : SQLite (état sauvegardé)
- **Status** : ✅ Opérationnel (v14+ legacy, production-stable)

---

## 🔀 QUAND UTILISER QUEL MODULE

### Utilisez Fichier #1 (singularity/singularity_state.rs) SI :
- ✅ Vous travaillez sur **Chat IA** (conversation pipeline)
- ✅ Besoin de **meta-processing conversationnel** (validation, enrichissement)
- ✅ Validation cohérence **réponse ↔ intention**
- ✅ Détection fuites anglais, ambiguïtés
- ✅ Suggestions LTM basées conversation

**Exemple** :
```rust
use crate::singularity::singularity_state::{ChatContext, SingularityMetaOutput};

let context = ChatContext {
    user_message: "Bonjour TITANE".to_string(),
    ai_response: "Bonjour ! Je suis TITANE∞...".to_string(),
    // ...
};

let meta_output = singularity.singularity_meta_process_conversation(context).await?;
println!("Coherence: {}", meta_output.meta_coherence);
```

---

### Utilisez Fichier #2 (singularity_state/mod.rs) SI :
- ✅ Vous travaillez sur **monitoring système global**
- ✅ Besoin d'accès **5 layers** (Physical, Cognitive, Symbolic, Adaptive, Meta)
- ✅ Synchronisation **META-COGNITION ENGINE** + **DEEP SYNC ENGINE**
- ✅ Persistence SQLite (sauvegarde état)
- ✅ Tauri commands frontend (état système UI)

**Exemple** :
```rust
use crate::singularity_state::SingularityState;

let mut state = SingularityState::new();
let coherence = state.global_coherence();

if state.is_critical() {
    eprintln!("⚠️ System in critical state!");
}

let meta_report = state.singularity_deep_sync().await?;
println!("Anomalies: {:?}", meta_report.anomalies_detected);
```

---

## 📊 COMPARAISON RAPIDE

| Aspect | Fichier #1 (Meta-Processing) | Fichier #2 (System Monitor) |
|--------|------------------------------|------------------------------|
| **Scope** | Conversation-specific | System-wide |
| **Layers** | Aucune (flat structures) | 5 layers |
| **Persistence** | ❌ Aucune | ✅ SQLite |
| **Tauri Events** | ❌ Aucun | ✅ EventSyncLayer |
| **Usage** | ConversationPipeline Step 12 | SingularityEngine (main.rs) |
| **Tests** | ✅ 3/3 passing | ⏳ Non testés |
| **Latence** | 10-30ms | N/A (async) |
| **Frontend** | ❌ Non exposé | ✅ 12+ commands Tauri |

---

## ⚠️ ERREURS COMMUNES

### ❌ NE PAS faire :
```rust
// ERREUR : Mélanger les 2 modules
use crate::singularity::singularity_state::ChatContext;
use crate::singularity_state::SingularityState;

let chat_ctx = ChatContext { /* ... */ };
let system_state = SingularityState::new();

// ❌ Tentative d'utiliser ChatContext avec SingularityState system-wide
system_state.process(chat_ctx); // COMPILE ERROR: méthode inexistante
```

### ✅ À la place :
```rust
// CORRECT : Utiliser module approprié selon contexte

// Pour Chat IA meta-processing:
use crate::singularity::singularity_state::{ChatContext, SingularityState as ChatSingularity};
let chat_singularity = ChatSingularity::default();
chat_singularity.singularity_meta_process_conversation(context).await?;

// Pour monitoring système:
use crate::singularity_state::{SingularityState as SystemState};
let system_state = SystemState::new();
system_state.global_coherence();
```

---

## 🔄 ÉVOLUTION FUTURE

### Potentielle Unification (v∞.2.0+)
Si nécessaire à long terme, envisager :
1. **Renaming** : `singularity_state` → `system_state_monitor`
2. **Integration** : ChatContext comme sous-module CognitiveLayer
3. **Unified API** : Méthode unique `process()` (conversation + monitoring)

**Prérequis** :
- ✅ Tests terrain Fichier #1 validés
- ✅ Tests unitaires Fichier #2 créés (coverage 50%+)
- ✅ Documentation architecture unifiée
- ✅ Migration progressive (backward compatibility)

**Effort estimé** : 8-12h (refactoring + tests)

---

## 📚 RÉFÉRENCES

### Documentation
- **Singularity Integration** : `SINGULARITY_INTEGRATION_COMPLETE.md` (456 lignes)
- **AUTO ALL Report** : `AUTO_ALL_SESSION_REPORT.md` (398 lignes)
- **R05 Status** : `R05_STATUS_FINAL.md` (248 lignes)
- **Diagnostic** : `DIAGNOSTIC_ARCHITECTURE_SINGULARITY.md` (ce document parent)

### Commits
- **Fichier #1** : `47d8e3a` — Singularity meta-processing integration (10 déc 2025)
- **Fichier #2** : v14+ legacy (CHANGELOG.md v14.7, stable depuis nov 2025)

### Tests
- **Fichier #1** : `src-tauri/tests/omega_p2_performance_test.rs` (3/3 passing)
- **Fichier #2** : ⏳ Tests à créer (system_state_monitor_test.rs)

---

## ✅ CHECKLIST DÉVELOPPEUR

Avant de modifier Singularity, vérifiez :

- [ ] **Quel module** ? Conversation (Fichier #1) ou System (Fichier #2)
- [ ] **Import correct** ? `singularity::` vs `singularity_state::`
- [ ] **Tests appropriés** ? omega_p2 vs system_monitor_test
- [ ] **Documentation à jour** ? Ce fichier + SINGULARITY_INTEGRATION_COMPLETE.md
- [ ] **Build stable** ? `cargo build --lib` → 0 errors
- [ ] **Aucune régression** ? Tests existants passent

---

**Maintenu par** : KallokTherok1994  
**Dernière mise à jour** : 11 décembre 2025  
**Repository** : [TITANE_INFINITY](https://github.com/KallokTherok1994/TITANE_INFINITY)
