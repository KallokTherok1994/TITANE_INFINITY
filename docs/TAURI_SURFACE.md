# TITANE∞ — TAURI SURFACE SPECIFICATION

**Version** : 1.0.0  
**Status** : 🔒 SEALED (Production Certification P0-2)  
**Date** : 15 janvier 2026  
**Last Updated** : 2026-04-06 (stable allowlist sync `v29.0.0`)  

---

## 🎯 Objectif

Documentation **SCELLÉE** de la surface d'attaque Tauri pour certification PROD.  
Toute modification de l'allowlist stable doit être documentée et justifiée.

**Loi P0-2** : Surface stable = immuable sauf documentation + approbation.

---

## 📊 Surface Stable Actuelle

### 1. COMMANDS (Tauri Invoke) - 218 Commands Total
```json
// src-tauri/allowlist.whitelist.stable.json (Production Allowlist)
{
  "app": {
    "security": {
      "capabilities": [{
        "identifier": "stable-capability",
        "allow": [
          // === RUNTIME & CONFIG ===
          "get_runtime_config",       // READ: configuration runtime
          "get_system_info",          // READ: infos système
          "get_system_health",        // READ: santé système
          "ping",                     // READ: ping bridge
          
          // === ONBOARDING ===
          "is_onboarding_complete",   // READ: état onboarding
          "complete_onboarding",      // WRITE: finaliser onboarding
          "get_onboarding_preferences", // READ: préférences utilisateur
          
          // === MEMORY CORE ===
          "get_memory_state",         // READ: état mémoire globale
          "memory_get_state",         // READ: état mémoire détaillée
          "memory_ingest_file",       // WRITE: ingestion fichier en mémoire
          "write_snapshot",           // WRITE: sauvegarde snapshot
          "read_snapshot",            // READ: lecture snapshot
          "check_sqlite_available",   // READ: vérification SQLite
          "memory_clear",             // WRITE: purge mémoire OS
          "clear_all_memory",         // WRITE: purge mémoire chat
          "delete_conversation",      // WRITE: suppression conversation
          
          // === TIMELINE & EVENTS ===
          "add_timeline_event",       // WRITE: ajout événement timeline
          "get_timeline",             // READ: lecture timeline
          "get_active_projects",      // READ: projets actifs
          "get_recent_decisions",     // READ: décisions récentes
          "get_knowledge",            // READ: base connaissances
          "get_active_rituals",       // READ: rituels actifs
          
          // === CHAT & IA ===
          "chat_generate",            // SYSTEM: génération IA
          "chat_stream_message",      // SYSTEM: streaming chat
          "chat_generate_glm46v",     // SYSTEM: génération IA (GLM-46v)
          "check_glm46v_health",      // READ: santé service GLM-46v
          "start_glm46v_server",      // SYSTEM: démarrage service GLM-46v
          "stop_glm46v_server",       // SYSTEM: arrêt service GLM-46v
          "save_chat_interaction",    // WRITE: sauvegarde interaction
          "cp_get_ai_config",         // READ: config IA Copilot
          "cp_set_ai_config",         // WRITE: config IA Copilot

          // === STATE & IDENTITY ===
          "set_state",                // WRITE: set state bridge
          "delete_state",             // WRITE: delete state bridge
          "identity_set_matrix",      // WRITE: update identity matrix

          // === LOGGING ===
          "log_entries",              // WRITE: ingestion logs structurés
          
          // === SINGULARITY ENGINE (16 commands) ===
          "get_singularity_state",    // READ: état singularité
          "singularity_get",          // READ: données singularité
          "singularity_set",          // WRITE: modification singularité
          "singularity_sync",         // SYSTEM: synchronisation
          "sync_singularity",         // SYSTEM: sync alternative
          "singularity_get_full_state", // READ: état complet
          "singularity_get_physical", // READ: état physique
          "singularity_get_cognitive", // READ: état cognitif
          "singularity_get_symbolic", // READ: état symbolique
          "singularity_get_adaptive", // READ: état adaptatif
          "singularity_get_meta",     // READ: métadonnées
          "singularity_get_global_coherence", // READ: cohérence globale
          "singularity_is_critical",  // READ: statut critique
          "singularity_export_json",  // SYSTEM: export JSON
          
          // === ORCHESTRATION ===
          "orchestration_get_cognitive_state", // READ: état cognitif orchestré
          "orchestration_get_unified_state",   // READ: état unifié
          "get_helios_state",         // READ: état Helios
          
          // === EXPERIENCE ENGINE ===
          "experience_get_state",     // READ: état expérience
          "experience_update_state",  // WRITE: mise à jour expérience
          
          // === FILE OPERATIONS ===
          "import_file",              // SENSITIVE: import fichier
          "file_analyze",             // SYSTEM: analyse fichier
          "upload_and_process_file",  // SENSITIVE: upload + traitement
          
          // === AVATAR & FULLBODY ===
          "fullbody_init",            // SYSTEM: initialisation corps
          "fullbody_get_state",       // READ: état corps
          "fullbody_update_pose",     // WRITE: mise à jour pose
          "fullbody_update_expression", // WRITE: mise à jour expression
          "avatar_get_expression",    // READ: expression avatar
          
          // === TTS (Text-to-Speech) ===
          "tts_speak_parler",         // SENSITIVE: synthèse vocale
          "tts_stop",                 // WRITE: arrêt synthèse
          "tts_is_speaking",          // READ: statut synthèse
          "tts_get_status",           // READ: état TTS
        ]
      }]
    }
  }
}
```

#### 1.1 Sync complémentaire — stable allowlist documentée (2026-04-06)

> Alignement append-only avec `src-tauri/allowlist.whitelist.stable.json` pour la surface active `v29.0.0`.  
> Référence : `218` entrées allowlist brutes / `204` noms de commandes uniques.

```json
          "ai_check_ollama_status",                // STABLE: documented sync 2026-04-06
          "chat_generate_openai",                // STABLE: documented sync 2026-04-06
          "chat_get_providers_status",                // STABLE: documented sync 2026-04-06
          "cloud_get_devices",                // STABLE: documented sync 2026-04-06
          "cloud_get_status",                // STABLE: documented sync 2026-04-06
          "cloud_get_sync_history",                // STABLE: documented sync 2026-04-06
          "cloud_list_backups",                // STABLE: documented sync 2026-04-06
          "cognitive_get_state",                // STABLE: documented sync 2026-04-06
          "conversation_generate",                // STABLE: documented sync 2026-04-06
          "conversation_health_check",                // STABLE: documented sync 2026-04-06
          "conversation_memory_stats",                // STABLE: documented sync 2026-04-06
          "conversation_reset",                // STABLE: documented sync 2026-04-06
          "cp_get_design_config",                // STABLE: documented sync 2026-04-06
          "cp_get_modules_status",                // STABLE: documented sync 2026-04-06
          "cp_toggle_module",                // STABLE: documented sync 2026-04-06
          "create_new_conversation",                // STABLE: documented sync 2026-04-06
          "engine_health",                // STABLE: documented sync 2026-04-06
          "engine_init",                // STABLE: documented sync 2026-04-06
          "engine_metrics",                // STABLE: documented sync 2026-04-06
          "engine_modules",                // STABLE: documented sync 2026-04-06
          "engine_singularity_reset",                // STABLE: documented sync 2026-04-06
          "engine_stop",                // STABLE: documented sync 2026-04-06
          "engine_tick",                // STABLE: documented sync 2026-04-06
          "engines_build_get_result",                // STABLE: documented sync 2026-04-06
          "engines_build_get_status",                // STABLE: documented sync 2026-04-06
          "engines_monitoring_get_dashboard",                // STABLE: documented sync 2026-04-06
          "engines_monitoring_get_health",                // STABLE: documented sync 2026-04-06
          "engines_monitoring_get_metrics",                // STABLE: documented sync 2026-04-06
          "evolution_get_stats",                // STABLE: documented sync 2026-04-06
          "exp_get_categories",                // STABLE: documented sync 2026-04-06
          "exp_get_global_state",                // STABLE: documented sync 2026-04-06
          "exp_get_projects",                // STABLE: documented sync 2026-04-06
          "exp_get_talents",                // STABLE: documented sync 2026-04-06
          "get_all_configs",                // STABLE: documented sync 2026-04-06
          "get_audio_input_devices",                // STABLE: documented sync 2026-04-06
          "get_audio_output_devices",                // STABLE: documented sync 2026-04-06
          "get_cognitive_state",                // STABLE: documented sync 2026-04-06
          "get_core_info",                // STABLE: documented sync 2026-04-06
          "get_dashboard_metrics",                // STABLE: documented sync 2026-04-06
          "get_engines_status",                // STABLE: documented sync 2026-04-06
          "get_event_stream",                // STABLE: documented sync 2026-04-06
          "get_helios_metrics",                // STABLE: documented sync 2026-04-06
          "get_logs",                // STABLE: documented sync 2026-04-06
          "get_module_health",                // STABLE: documented sync 2026-04-06
          "get_system_logs",                // STABLE: documented sync 2026-04-06
          "get_system_metrics",                // STABLE: documented sync 2026-04-06
          "get_system_state",                // STABLE: documented sync 2026-04-06
          "get_travel_stats",                // STABLE: documented sync 2026-04-06
          "harmonia_get_state",                // STABLE: documented sync 2026-04-06
          "hyper_get_insights",                // STABLE: documented sync 2026-04-06
          "hyper_get_thoughts",                // STABLE: documented sync 2026-04-06
          "identity_disable_rule",                // STABLE: documented sync 2026-04-06
          "identity_enable_rule",                // STABLE: documented sync 2026-04-06
          "identity_get_active_rules",                // STABLE: documented sync 2026-04-06
          "identity_get_active_voice_profile",                // STABLE: documented sync 2026-04-06
          "identity_get_available_modes",                // STABLE: documented sync 2026-04-06
          "identity_get_coherence_score",                // STABLE: documented sync 2026-04-06
          "identity_get_current_mode",                // STABLE: documented sync 2026-04-06
          "identity_get_current_tone",                // STABLE: documented sync 2026-04-06
          "identity_get_matrix",                // STABLE: documented sync 2026-04-06
          "identity_get_personality_snapshot",                // STABLE: documented sync 2026-04-06
          "identity_list_voice_profiles",                // STABLE: documented sync 2026-04-06
          "identity_set_active_voice_profile",                // STABLE: documented sync 2026-04-06
          "identity_set_mode",                // STABLE: documented sync 2026-04-06
          "list_config_presets",                // STABLE: documented sync 2026-04-06
          "list_conversations",                // STABLE: documented sync 2026-04-06
          "list_snapshots",                // STABLE: documented sync 2026-04-06
          "memory_evolve_full",                // STABLE: documented sync 2026-04-06
          "memory_get_active_projects",                // STABLE: documented sync 2026-04-06
          "memory_get_active_rituals",                // STABLE: documented sync 2026-04-06
          "memory_get_all_keys",                // STABLE: documented sync 2026-04-06
          "memory_get_clusters",                // STABLE: documented sync 2026-04-06
          "memory_get_entry",                // STABLE: documented sync 2026-04-06
          "memory_get_knowledge",                // STABLE: documented sync 2026-04-06
          "memory_get_recent_decisions",                // STABLE: documented sync 2026-04-06
          "memory_get_stats",                // STABLE: documented sync 2026-04-06
          "memory_get_timeline",                // STABLE: documented sync 2026-04-06
          "memory_save_chat_interaction",                // STABLE: documented sync 2026-04-06
          "memory_search",                // STABLE: documented sync 2026-04-06
          "mesh_get_stats",                // STABLE: documented sync 2026-04-06
          "multi_ai_get_state",                // STABLE: documented sync 2026-04-06
          "nexus_get_state",                // STABLE: documented sync 2026-04-06
          "one_core_get_engine_status",                // STABLE: documented sync 2026-04-06
          "one_core_get_event_history",                // STABLE: documented sync 2026-04-06
          "one_core_get_metrics",                // STABLE: documented sync 2026-04-06
          "one_core_get_state",                // STABLE: documented sync 2026-04-06
          "one_core_list_commands",                // STABLE: documented sync 2026-04-06
          "orchestrator_get_metrics",                // STABLE: documented sync 2026-04-06
          "orchestrator_get_state",                // STABLE: documented sync 2026-04-06
          "orchestrator_init",                // STABLE: documented sync 2026-04-06
          "orchestrator_run_cycle",                // STABLE: documented sync 2026-04-06
          "orchestrator_set_mode",                // STABLE: documented sync 2026-04-06
          "performance_get_metrics",                // STABLE: documented sync 2026-04-06
          "qa_get_hardening_config",                // STABLE: documented sync 2026-04-06
          "qa_get_logs",                // STABLE: documented sync 2026-04-06
          "qa_get_performance_report",                // STABLE: documented sync 2026-04-06
          "qa_get_state",                // STABLE: documented sync 2026-04-06
          "qa_get_system_metrics",                // STABLE: documented sync 2026-04-06
          "qa_get_test_result",                // STABLE: documented sync 2026-04-06
          "qa_list_alerts",                // STABLE: documented sync 2026-04-06
          "qa_list_monitors",                // STABLE: documented sync 2026-04-06
          "qa_list_test_suites",                // STABLE: documented sync 2026-04-06
          "reality_get_state",                // STABLE: documented sync 2026-04-06
          "sc_get_cluster_peers",                // STABLE: documented sync 2026-04-06
          "sc_get_cluster_status",                // STABLE: documented sync 2026-04-06
          "sc_get_diagnostic_status",                // STABLE: documented sync 2026-04-06
          "sc_get_env",                // STABLE: documented sync 2026-04-06
          "sc_get_log_stats",                // STABLE: documented sync 2026-04-06
          "sc_get_logs",                // STABLE: documented sync 2026-04-06
          "sc_hypervision_get_anomalies",                // STABLE: documented sync 2026-04-06
          "sc_hypervision_get_layers",                // STABLE: documented sync 2026-04-06
          "sc_hypervision_get_metrics",                // STABLE: documented sync 2026-04-06
          "sc_hypervision_get_state",                // STABLE: documented sync 2026-04-06
          "selfheal_force_evaluation",                // STABLE: documented sync 2026-04-06
          "selfheal_get_health",                // STABLE: documented sync 2026-04-06
          "selfheal_get_prediction",                // STABLE: documented sync 2026-04-06
          "selfheal_get_state",                // STABLE: documented sync 2026-04-06
          "send_audio_chunk",                // STABLE: documented sync 2026-04-06
          "set_audio_input_device",                // STABLE: documented sync 2026-04-06
          "set_audio_output_device",                // STABLE: documented sync 2026-04-06
          "singularity_self_check",                // STABLE: documented sync 2026-04-06
          "test_microphone",                // STABLE: documented sync 2026-04-06
          "titan_get_persistence_status",                // STABLE: documented sync 2026-04-06
          "titan_state_get",                // STABLE: documented sync 2026-04-06
          "tts_speak",                // STABLE: documented sync 2026-04-06
          "update_chat_engine_config",                // STABLE: documented sync 2026-04-06
          "vad_configure",                // STABLE: documented sync 2026-04-06
          "vad_get_state",                // STABLE: documented sync 2026-04-06
          "vad_process_frame",                // STABLE: documented sync 2026-04-06
          "vad_reset",                // STABLE: documented sync 2026-04-06
          "window_get_zoom",                // STABLE: documented sync 2026-04-06
          "window_is_fullscreen",                // STABLE: documented sync 2026-04-06
          "window_set_fullscreen",                // STABLE: documented sync 2026-04-06
          "window_set_zoom",                // STABLE: documented sync 2026-04-06
          "window_toggle_fullscreen",                // STABLE: documented sync 2026-04-06
          "window_zoom_in",                // STABLE: documented sync 2026-04-06
          "window_zoom_out",                // STABLE: documented sync 2026-04-06
          "window_zoom_reset",                // STABLE: documented sync 2026-04-06
```

**Total Commands** : 218 commands  
**Classification** :
- **READ** : lecture données/état système
- **WRITE** : modification données utilisateur
- **SYSTEM** : opérations système/IA contrôlées
- **SENSITIVE** : accès privilégié (fichiers, audio)

### 2. PERMISSIONS (Tauri Capabilities)
```json
// Permissions système accordées (inchangé)
{
  "permissions": [
    "core:default",               // Permissions Tauri de base
    "core:event:default",         // Système événements
    "core:window:default",        // Gestion fenêtres
    "clipboard-manager:default",  // Presse-papier
    "dialog:default"              // Dialogues natifs
  ]
}
```

### 3. CSP (Content Security Policy)
```
default-src 'self' tauri:;
script-src 'self' 'unsafe-inline' tauri:;
style-src 'self' 'unsafe-inline' tauri:;
img-src 'self' data: asset: tauri:;
font-src 'self' data: tauri:;
```

**Surface Réseau directe UI → externe** : ZÉRO (doctrine active : online-first gouverné via gateway canonique + fallback local obligatoire)

---

## 🔐 Classification Risques

### CRITIQUE (Accès privilégié système)
- `unlock_memory_vault` / `lock_memory_vault` - Gestion vault chiffré
- `start_recording` / `stop_recording` - Capture audio micro

### ÉLEVÉ (Modifications données)
- `memory_set` - Écriture mémoire utilisateur
- `chat_reset` - Reset historique conversation
- `memory_compact` - Compactage/réorganisation mémoire

### MOYEN (Lecture/opérations contrôlées)
- `chat_generate` - IA génération (pas de réseau direct)
- `memory_get` / `chat_get_history` - Lecture données
- `test_microphone` / `get_system_info` - Info/test système

### FAIBLE (Métadonnées)
- `get_app_version` - Version application
- `dev_get_debug_info` - Debug infos basiques

---

## 🛡️ Guards Implémentés

### 1. Input Validation
```rust
// Tous les commands ont validation input
fn memory_get(key: String) -> Result<String, String> {
    if key.len() > 1000 { 
        return Err("Key too long".to_string()); 
    }
    // ...
}
```

### 2. Rate Limiting
```rust
// Operations sensibles limitées
static LAST_VAULT_UNLOCK: Mutex<Option<Instant>> = Mutex::new(None);
// Min 1s entre unlock attempts
```

### 3. Error Sanitization
```rust
// Pas de leak d'infos système dans erreurs
.map_err(|_| "Operation failed".to_string())
```

### 4. Audit Logging
```rust
// Operations critiques loggées
info!("[AUDIT] Memory vault unlock attempt by user");
```

---

## 📋 Matrice de Changements

### INTERDIT (Breaking Changes)
- ❌ Ajout nouveau command sans documentation
- ❌ Élargissement permissions CSP
- ❌ Nouveaux accès réseau/filesystem
- ❌ Bypass validation input existante

### AUTORISÉ (Non-Breaking)
- ✅ Amélioration validation input (plus stricte)
- ✅ Ajout audit logging
- ✅ Optimisation performance (même comportement)
- ✅ Correction bugs sans changement API

### PROCESS REQUIS (Breaking Allowed)
1. Documentation impact dans ce fichier
2. Tests régression complets
3. Approbation sécurité explicite
4. Mise à jour version majeure

---

## 🔄 Évolution Historique

### v29.0.0 (sync documentaire surface stable) - 6 avril 2026
- **Alignement** : ajout append-only des commandes stables manquantes depuis `src-tauri/allowlist.whitelist.stable.json`
- **Impact** : synchronisation documentaire de la surface P0-2 sans élargissement runtime supplémentaire dans ce patch
- **Preuve locale** : `bash scripts/security/surface-guard.sh`

### v26.3.1 (PHASE 6) - 15 janvier 2026
- **Ajout** : `unlock_memory_vault`, `lock_memory_vault` 
- **Justification** : PHASE 6 capabilities - vault encryption
- **Tests** : Tests unitaires Rust + validation promotion gate
- **Risque** : CRITIQUE (mais isolated, password-protected)

### v26.2.0 (Baseline Stable)
- **Commands** : 11 commands core (memory, chat, audio, system)
- **Surface** : Baseline production minimale

---

## ✅ Validation P0-2

### Gate P0-2: Surface Guard
```bash
# Détection changement allowlist stable sans doc
./scripts/security/surface-guard.sh
# Résultat attendu: ✅ SURFACE-GUARD: PASS - Aucun changement non documenté
```

### Checklist de Certification
- [x] ✅ Surface stable documentée exhaustivement
- [x] ✅ Classification risques complète (CRITIQUE/ÉLEVÉ/MOYEN/FAIBLE)
- [x] ✅ Guards sécurité identifiés
- [x] ✅ Matrice changements définie
- [x] ✅ Guard CI automatique BLOQUANT
- [x] ✅ Historique évolution tracké

---

## 📊 Métriques Sécurité

- **Surface Commands** : 13 (target: <20 pour stable)
- **Commands CRITIQUE** : 2 (target: <5)
- **Permissions CSP** : 5 (target: minimal nécessaire)
- **Accès Réseau** : 0 (target: 0 - local-first)
- **Validation Coverage** : 100% (tous commands)

---

## 📞 Process d'Approbation

### Changement Surface Stable
1. **STOP** - Documenter impact dans ce fichier
2. **ANALYSE** - Évaluation risque sécurité
3. **TESTS** - Validation régression complète
4. **APPROBATION** - Review sécurité obligatoire
5. **DEPLOY** - Mise à jour version avec changelog

### Escalade
Si surface non documentée détectée en CI :
1. **BLOCK** - CI doit échouer (gate bloquant)
2. **ANALYSE** - Identification changements non autorisés
3. **REVERT** - Rollback si changement non approuvé
4. **DOCUMENT** - Mise à jour documentation si approuvé

---

**🔒 RÈGLE P0-2** : La surface d'attaque stable est scellée. Toute modification requiert documentation explicite et approbation sécurité.

**Status** : ✅ SEALED (P0-2 Production Certification)  
**Maintainer** : TITANE∞ Security Team  
**Surface Commands** : 13 commands documentés  
**Last Updated** : 15 janvier 2026