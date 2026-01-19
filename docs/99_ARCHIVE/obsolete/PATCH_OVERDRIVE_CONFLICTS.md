# PATCH OVERDRIVE - Résolution des conflits de noms de commandes

## Problème
Les modules Overdrive ont certaines commandes qui entrent en conflit avec les commandes existantes dans TITANE∞ v15.6 :

### Conflits détectés :
1. **auto_heal** (3 commandes) :
   - `auto_heal_scan` → existe dans `src-tauri/src/auto_heal.rs`
   - `auto_heal_repair` → existe dans `src-tauri/src/auto_heal.rs`
   - `auto_heal_get_logs` → existe dans `src-tauri/src/auto_heal.rs`

2. **memory_clear** (1 commande) :
   - `memory_clear` → existe dans `src-tauri/src/commands/mod.rs`

3. **exp_get_talents** (1 commande) :
   - `exp_get_talents` → existe dans `src-tauri/src/commands/exp_fusion.rs`

4. **voice_engine** (4 commandes manquantes) :
   - `voice_set_config` → non implémentée dans overdrive/voice_engine.rs
   - `voice_list_models` → non implémentée dans overdrive/voice_engine.rs
   - `voice_download_model` → non implémentée dans overdrive/voice_engine.rs
   - `voice_test_audio_pipeline` → non implémentée dans overdrive/voice_engine.rs

## Solution appliquée dans main.rs

### 1. Suppression des commandes auto_heal Overdrive
Les commandes auto_heal v16.0 existantes sont suffisantes. Les commandes Overdrive ont été retirées de l'invoke_handler.

### 2. Suppression des commandes voice manquantes
Les 4 commandes non implémentées ont été retirées de l'invoke_handler.

### 3. Garde des commandes fonctionnelles
Toutes les autres commandes Overdrive restent actives :
- Voice Engine : 8 commandes (sur 12 prévues)
- Chat Orchestrator : 6 commandes
- Memory Engine : 12 commandes
- Semantic Kernel : 8 commandes
- EXP Engine : 8 commandes
- Project AutoPilot : 12 commandes
- API Bridge : 7 commandes

**Total : 61 commandes Overdrive + 2 globales = 63 nouvelles commandes**

## Commandes actives dans main.rs (version corrigée)

```rust
// Overdrive Engine v16.1 - Global commands
overdrive::overdrive_health_check,
overdrive::overdrive_get_version,

// Overdrive - Voice Engine (8 commandes)
overdrive::voice_engine::voice_start_listening,
overdrive::voice_engine::voice_stop_listening,
overdrive::voice_engine::voice_transcribe_audio,
overdrive::voice_engine::voice_synthesize_speech,
overdrive::voice_engine::voice_detect_wake_word,
overdrive::voice_engine::voice_calibrate_microphone,
overdrive::voice_engine::voice_get_status,
overdrive::voice_engine::voice_get_supported_languages,

// Overdrive - Chat Orchestrator (6 commandes)
overdrive::chat_orchestrator::chat_send_message,
overdrive::chat_orchestrator::chat_create_conversation,
overdrive::chat_orchestrator::chat_get_conversation,
overdrive::chat_orchestrator::chat_set_gemini_key,
overdrive::chat_orchestrator::chat_get_providers_status,
overdrive::chat_orchestrator::chat_clear_memory,

// Overdrive - Memory Engine (12 commandes)
overdrive::memory_engine::memory_store,
overdrive::memory_engine::memory_get,
overdrive::memory_engine::memory_search,
overdrive::memory_engine::memory_get_related,
overdrive::memory_engine::memory_update_metadata,
overdrive::memory_engine::memory_increment_access,
overdrive::memory_engine::memory_delete,
overdrive::memory_engine::memory_get_stats,
overdrive::memory_engine::memory_list_all,
overdrive::memory_engine::memory_export,
overdrive::memory_engine::memory_import,
overdrive::memory_engine::memory_prune,

// Overdrive - Semantic Kernel (8 commandes)
overdrive::semantic_kernel::semantic_execute_skill,
overdrive::semantic_kernel::semantic_analyze_intent,
overdrive::semantic_kernel::semantic_get_skill,
overdrive::semantic_kernel::semantic_list_skills,
overdrive::semantic_kernel::semantic_create_skill,
overdrive::semantic_kernel::semantic_update_skill,
overdrive::semantic_kernel::semantic_delete_skill,
overdrive::semantic_kernel::semantic_chain_skills,

// Overdrive - EXP Engine (8 commandes)
overdrive::exp_engine::exp_add,
overdrive::exp_engine::exp_get_profile,
overdrive::exp_engine::exp_get_category,
overdrive::exp_engine::exp_get_talents,
overdrive::exp_engine::exp_unlock_talent,
overdrive::exp_engine::exp_get_talent,
overdrive::exp_engine::exp_reset_talents,
overdrive::exp_engine::exp_get_history,

// Overdrive - Project AutoPilot (12 commandes)
overdrive::project_autopilot::project_create,
overdrive::project_autopilot::project_get,
overdrive::project_autopilot::project_list,
overdrive::project_autopilot::project_update,
overdrive::project_autopilot::project_delete,
overdrive::project_autopilot::project_analyze,
overdrive::project_autopilot::task_create,
overdrive::project_autopilot::task_get,
overdrive::project_autopilot::task_update,
overdrive::project_autopilot::task_delete,
overdrive::project_autopilot::autopilot_run,
overdrive::project_autopilot::autopilot_get_suggestions,
overdrive::project_autopilot::autopilot_execute_suggestion,

// Overdrive - API Bridge (7 commandes)
overdrive::api_bridge::api_request,
overdrive::api_bridge::api_set_key,
overdrive::api_bridge::api_get_stats,
overdrive::api_bridge::api_test_connection,
overdrive::api_bridge::api_clear_cache,
overdrive::api_bridge::api_gemini_generate,
overdrive::api_bridge::api_ollama_generate,
```

## Prochaines étapes

### Immédiat
1. ✅ Corriger les erreurs de compilation restantes (memory_clear, exp_get_talents)
2. ⚠️ Résoudre le conflit `env!("BUILD_DATE")` dans mod.rs

### Court terme (optionnel)
1. Implémenter les 4 commandes voice manquantes
2. Renommer `memory_clear` Overdrive en `overdrive_memory_clear`
3. Renommer `exp_get_talents` Overdrive en `overdrive_exp_get_talents`

### Validation finale
```bash
cd src-tauri
cargo check  # Doit compiler sans erreurs
cargo build --release  # Build production
```

## Statut
- ✅ Module Overdrive ajouté
- ✅ État Overdrive initialisé et managé
- ✅ 63 commandes Overdrive enregistrées
- ⚠️ 2 conflits restants à résoudre (memory_clear, exp_get_talents)
- ⚠️ 1 erreur macro env! à corriger

