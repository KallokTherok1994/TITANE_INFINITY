# 🚀 TITANE∞ v15 — PLAN DE MIGRATION EXÉCUTABLE

**Date**: 2025-11-25
**État**: Phase 2 complète, Phase 3 en cours
**Versions**: Backend v15.0.0, Frontend v15.0.0

---

## ✅ **PHASES COMPLÉTÉES**

### **Phase 1: Cartographie** ✅ COMPLETE
- ✅ 298 fichiers backend scannés
- ✅ 355 fichiers frontend scannés
- ✅ 18 modules legacy identifiés
- ✅ Rapport `PHASE_1_CARTOGRAPHIE_v15.md` généré

### **Phase 2: Architecture v15** ✅ COMPLETE
- ✅ Cargo.toml → v15.0.0
- ✅ package.json → v15.0.0
- ✅ SingularityEngine v15 header updated
- ✅ NexusModule v15 init() simplifié
- ✅ MemoryModule v15 init() simplifié
- ✅ HarmoniaModule v15 init() simplifié
- ✅ SentinelModule v15 init() simplifié
- ✅ Backend compile: 0 errors
- ✅ Modules legacy supprimés: compression, interruptibility, noise_adaptive

---

## 🔥 **PHASES CRITIQUES (À FAIRE)**

### **Phase 3: Fusion Legacy** ⚠️ EN COURS (30% fait)

**Déjà fait:**
- ✅ Supprimé `/compression` (v13)
- ✅ Supprimé `/interruptibility` (v13)
- ✅ Supprimé `/noise_adaptive` (v13)
- ✅ lib.rs partiellement nettoyé

**À faire:**
```bash
# 1. Nettoyer lib.rs complètement
#    - Supprimer #[allow(dead_code)] (50 occurrences)
#    - Supprimer #[cfg(feature = "full")] modules désactivés
#    - Simplifier structure

# 2. Supprimer modules v12 morts
rm -rf src-tauri/src/modules      # v12 modules (Helios, etc.)
rm -rf src-tauri/src/audio        # v12 Audio
rm -rf src-tauri/src/tts          # v12 TTS
rm -rf src-tauri/src/compat       # v12/v14 bridges
rm -rf src-tauri/src/shared       # Duplic with core/types

# 3. Fusionner memory v12 → memory v15
# src-tauri/src/memory/{mod.rs, model.rs, encryption.rs, storage.rs}
# → Déjà opérationnel, juste mettre à jour headers v15

# 4. Migrer ai/ v∞ → ai/ v15
# src-tauri/src/ai/{mod.rs, router.rs, gemini.rs, ollama.rs}
# → Créer AIRouter v15 avec cascade propre
```

---

### **Phase 4: Chat IA v15** 🔥 PRIORITÉ ABSOLUE

**Objectif**: Pipeline IA fonctionnel Gemini→Ollama→Local

**Backend:**
```rust
// src-tauri/src/ai/router_v15.rs
pub struct AIRouter {
    providers: Vec<Provider>,  // [Gemini, Ollama, Local]
    fallback_enabled: bool,
    streaming: bool,
}

impl AIRouter {
    pub async fn chat(&self, msg: String) -> Result<String> {
        // 1. Try Gemini
        // 2. Fallback Ollama
        // 3. Fallback Local
    }

    pub async fn stream_chat(&self, msg: String) -> Stream {
        // Streaming Tauri events
    }
}
```

**Frontend:**
```typescript
// src/services/aiChatClient_v15.ts
export async function sendMessage(msg: string): Promise<string> {
  return await invoke('ai_chat_send', { message: msg });
}

export function setupStreaming(callback: (chunk: string) => void) {
  listen('ai_chat_stream', (event) => callback(event.payload));
}
```

**Commands:**
```rust
// src-tauri/src/commands/ai_chat_v15.rs
#[tauri::command]
pub async fn ai_chat_send(message: String) -> Result<String> {
    let router = AIRouter::new();
    router.chat(message).await
}

#[tauri::command]
pub async fn ai_chat_stream(message: String, window: Window) -> Result<()> {
    let router = AIRouter::new();
    let stream = router.stream_chat(message).await?;

    for chunk in stream {
        window.emit("ai_chat_stream", chunk)?;
    }
    Ok(())
}
```

---

### **Phase 5: Memory v15** ⚠️ CRITIQUE

**Objectif**: MemoryStorage v15 avec versioning + compaction

**Architecture:**
```rust
// src-tauri/src/memory/storage_v15.rs
pub struct MemoryStorage {
    path: PathBuf,
    version: String,       // "15.0.0"
    encryption: AES256GCM,
    compaction_enabled: bool,
}

impl MemoryStorage {
    // Key-Value storage
    pub fn get(&self, key: &str) -> Result<Option<String>>
    pub fn set(&self, key: &str, value: &str) -> Result<()>
    pub fn delete(&self, key: &str) -> Result<()>

    // Conversations storage
    pub fn save_conversation(&self, conv: &Conversation) -> Result<()>
    pub fn load_conversation(&self, id: &str) -> Result<Conversation>
    pub fn list_conversations(&self) -> Result<Vec<ConversationMeta>>

    // Compaction v15
    pub fn compact(&mut self) -> Result<CompactionReport>
}
```

**Schéma JSON:**
```json
{
  "version": "15.0.0",
  "key_value": {
    "user_preferences": "{}",
    "system_config": "{}"
  },
  "conversations": [
    {
      "id": "conv_123",
      "title": "Discussion IA",
      "messages": 42,
      "created_at": "2025-11-25T10:00:00Z",
      "updated_at": "2025-11-25T12:00:00Z",
      "file": "~/.local/share/titane-infinity/memory/conversations/conv_123.json"
    }
  ],
  "stats": {
    "total_keys": 128,
    "total_conversations": 15,
    "disk_usage_mb": 2.4,
    "last_compaction": "2025-11-25T08:00:00Z"
  }
}
```

---

### **Phase 6: Overdrive v15** ⚠️ MOYEN

**Objectif**: Auto-evolution propre intégrée à SingularityEngine

```rust
// src-tauri/src/overdrive/auto_evolution_v15.rs
pub struct Overdrive {
    diagnostics: DiagnosticEngine,
    repair: RepairEngine,
    updates: UpdateEngine,
}

impl Overdrive {
    pub async fn health_check(&self) -> HealthReport {
        // Check Nexus, Memory, Harmonia, Sentinel
    }

    pub async fn auto_repair(&mut self) -> RepairReport {
        // Fix issues détectés
    }

    pub async fn evolve(&mut self) -> EvolutionReport {
        // Trigger updates/improvements
    }
}
```

---

### **Phase 7: API Tauri v15** ⚠️ CRITIQUE

**Objectif**: invoke_handler minimal, propre, documenté

```rust
// src-tauri/src/handlers_v15.rs
pub fn create_handler() -> impl Fn(Invoke) {
    tauri::generate_handler![
        // Engine v15
        engine_init,
        engine_get_state,
        engine_tick,

        // AI Chat v15
        ai_chat_send,
        ai_chat_stream,
        ai_chat_history,

        // Memory v15
        memory_get,
        memory_set,
        memory_delete,
        memory_compact,
        memory_get_stats,

        // Evolution v15
        evolution_health_check,
        evolution_auto_repair,
        evolution_run_cycle,
    ]
}
```

---

### **Phase 8: Frontend v15** 🔧 MOYEN

**Fichiers prioritaires:**
```typescript
// 1. src/services/tauriClient.ts → tauriClient_v15.ts
// 2. src/services/aiChatClient.ts → aiChatClient_v15.ts
// 3. src/services/singularityBridge.ts → singularityBridge_v15.ts
// 4. src/hooks/useChat.ts → useChat_v15.ts
// 5. src/components/VitalsPanel.tsx → VitalsPanel_v15.tsx
```

**Actions:**
- Mettre à jour tous les `invoke()` vers commandes v15
- Simplifier hooks (supprimer legacy state)
- Unifier streaming Tauri events
- Nettoyer TODOs (30 actifs)

---

### **Phase 9: Design System v15** 🎨 BASSE PRIORITÉ

**Structure:**
```
src/design-system-v15/
├── tokens.css          # Variables CSS v15
├── components.css      # Composants réutilisables
├── themes/
│   ├── monochrome.css
│   ├── rubis.css
│   ├── saphir.css
│   ├── emeraude.css
│   └── diamant.css
└── main.css           # Import principal
```

**Actions:**
- Supprimer `src/design-system/titane-v12.css`
- Unifier tokens (couleurs, spacing, typography)
- Créer thèmes v15

---

### **Phase 10: Nettoyage Final** 🧹 IMPORTANT

**Script automatique:**
```bash
#!/bin/bash
# clean_repo_v15.sh

# 1. Supprimer fichiers obsolètes
find . -name "*_v12*" -delete
find . -name "*_v13*" -delete
find . -name "*_v14*" -delete
find . -name "*_v17*" -delete

# 2. Supprimer .md reports anciens
rm -f ANALYSE_FINALE_*.md
rm -f AUDIT_*.md
rm -f BACKEND_*.md
rm -f CHANGELOG_v*.md  # Keep only CHANGELOG.md

# 3. Nettoyer assets morts
# (à définir après audit)

# 4. Mettre à jour .gitignore
cat >> .gitignore << EOF
# TITANE∞ v15
*_v12*
*_v13*
*_v14*
*_v17*
*.backup
EOF
```

---

### **Phase 11: Tests v15** ✅ CRITIQUE

**Tests à créer:**
```rust
// src-tauri/src/tests_v15.rs

#[tokio::test]
async fn test_singularity_engine_init() {
    let mut engine = SingularityEngine::new();
    assert!(engine.init().await.is_ok());
}

#[tokio::test]
async fn test_ai_router_cascade() {
    let router = AIRouter::new();
    let response = router.chat("Hello".to_string()).await;
    assert!(response.is_ok());
}

#[tokio::test]
async fn test_memory_storage_v15() {
    let storage = MemoryStorage::new("./test_memory");
    storage.set("test_key", "test_value").unwrap();
    let value = storage.get("test_key").unwrap();
    assert_eq!(value, Some("test_value".to_string()));
}
```

**Commandes validation:**
```bash
cargo check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -W clippy::all
cargo test --manifest-path src-tauri/Cargo.toml
pnpm run type-check
pnpm run lint
```

---

### **Phase 12: Finalisation v15** 🎯 FINALE

**Checklist:**
```
[ ] 1. Mettre à jour TOUS les headers de fichiers → v15
[ ] 2. Générer CHANGELOG_v15.md complet
[ ] 3. Commit final: "feat: TITANE∞ v15.0.0 - Complete migration"
[ ] 4. Tag Git: v15.0.0
[ ] 5. Build Tauri release: pnpm run tauri:build
[ ] 6. Tester exécutable: ./src-tauri/target/release/titane-infinity
[ ] 7. Valider 0 warnings, 0 errors
[ ] 8. Documenter breaking changes
```

---

## 📊 **PROGRESSION ACTUELLE**

| Phase | Status | Complétée |
|-------|--------|-----------|
| 1. Cartographie | ✅ | 100% |
| 2. Architecture | ✅ | 100% |
| 3. Fusion Legacy | ⚠️ | 30% |
| 4. Chat IA | ⏸️ | 0% |
| 5. Memory | ⏸️ | 0% |
| 6. Overdrive | ⏸️ | 0% |
| 7. API Tauri | ⏸️ | 0% |
| 8. Frontend | ⏸️ | 0% |
| 9. Design System | ⏸️ | 0% |
| 10. Nettoyage | ⏸️ | 0% |
| 11. Tests | ⏸️ | 0% |
| 12. Finalisation | ⏸️ | 0% |

**Total**: 19% complet

---

## 🚧 **RECOMMANDATION**

La migration v15 complète nécessite **~200-300 changements de fichiers** répartis sur 653 fichiers source.

**Stratégie recommandée:**

1. **Continuer Phase 3** (Fusion Legacy):
   - Terminer nettoyage lib.rs
   - Supprimer modules v12 morts
   - Valider compilation

2. **Priorité Phase 4** (Chat IA v15):
   - C'est le cœur fonctionnel
   - Bloquer sur implémentation propre
   - Tests end-to-end

3. **Phases 5-7 en parallèle**:
   - Memory v15 (critique)
   - Overdrive v15 (moyen)
   - API Tauri v15 (critique)

4. **Phases 8-12 finales**:
   - Frontend (adapté aux APIs v15)
   - Design System (cosmétique)
   - Nettoyage + Tests + Finalisation

**Temps estimé**: 10-15 heures de développement actif

---

**Status**: 📍 Arrêt Phase 3 (30%) — Prêt à reprendre sur Phase 4 Chat IA v15
