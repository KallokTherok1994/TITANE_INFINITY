# 🔧 TITANE∞ — Référence Commandes Tauri (v24.2.0)

**Date:** 15 décembre 2025  
**Source:** [`src-tauri/src/main.rs`](../../src-tauri/src/main.rs) L538-700 + modules

---

## 📊 VUE D'ENSEMBLE

**Total** : **100+ commandes Tauri** organisées en 15 catégories

| Catégorie | Commandes | Description |
|-----------|-----------|-------------|
| **Chat & IA** | 12 | Génération réponses multi-providers |
| **Voice & Audio** | 23 | TTS, STT, recording, devices |
| **Singularity State** | 18 | État 5-layer (Physical/Cognitive/Symbolic/Adaptive/Meta) |
| **Memory OS** | 14 | STM/MTM/LTM + timeline + snapshots |
| **Governance** | 11 | Policies IA, permissions, audit |
| **System Center** | 9 | Diagnostics, cluster, hypervision |
| **Auth & Security** | 13 | API keys, tokens, roles |
| **DevTools** | 6 | Logs, debug, monitoring |
| **Conversation Engine** | 5 | OMEGA conversations |
| **Helios** | 2 | Monitoring système |
| **Persistent Memory** | 4 | Bundles, archive, promote |
| **UI Theme** | 2 | Sauvegarde/chargement thèmes |
| **Self-Healing** | 4 | Trigger, status, enable/disable |
| **Whisper Streaming** | 3 | STT streaming audio |
| **Core** | 2 | Message sending, Ollama query |

---

## 🗂️ COMMANDES PAR CATÉGORIE

### 1. CHAT & IA (12 commandes)

#### `chat_send_message` ⭐ PRINCIPALE
**Module** : `overdrive::chat_orchestrator`  
**Signature** :
```rust
pub async fn chat_send_message(
    state: State<'_, ChatOrchestratorState>,
    request: ChatRequest
) -> Result<ChatResponse, String>
```
**Paramètres** :
- `message`: String — Texte utilisateur
- `conversation_id`: Option<String>
- `provider`: String — "auto"|"openai"|"claude"|"gemini"|"ollama"
- `model`: Option<String>
- `streaming`: bool
- `system_prompt`: Option<String>

**Retour** :
```typescript
{
  message: ChatMessage,
  success: bool,
  error?: string,
  latency_ms: number
}
```

#### `chat_stream_message`
**Description** : Version streaming (SSE events)  
**Events** : `stream:chunk`, `stream:done`

#### `chat_get_providers_status`
**Retour** : Liste providers disponibles + latences

#### `chat_check_providers`
**Description** : Ping tous providers (health check)

#### `chat_get_conversation`
**Paramètres** : `conversation_id: String`  
**Retour** : Historique messages conversation

#### `chat_create_conversation`
**Retour** : `conversation_id: String`

#### `chat_delete_conversation`
**Paramètres** : `conversation_id: String`

#### `chat_generate_suggestions`
**Description** : Génère 3-5 suggestions continuations

#### `chat_get_memory_stats`
**Retour** : Statistiques UnifiedMemory (STM/MTM/LTM)

#### `chat_generate_gemini` / `chat_generate_openai` / `chat_generate_claude`
**Description** : Génération provider-spécifique (bypass auto-sélection)

---

### 2. VOICE & AUDIO (23 commandes)

#### Voice Engine (17 commandes)

| Commande | Description |
|----------|-------------|
| `voice_start_listening` | Démarre enregistrement micro |
| `voice_stop_listening` | Arrête enregistrement |
| `voice_cancel_recording` | Annule enregistrement en cours |
| `voice_is_recording` | Retourne `bool` status |
| `voice_transcribe_audio` | STT (audio → texte) |
| `voice_get_status` | Status pipeline vocal |
| `voice_get_config` | Configuration voice |
| `voice_update_config` | Mise à jour config |
| `voice_play_audio` | Joue fichier audio |
| `voice_stop_speaking` | Arrête TTS en cours |
| `voice_test_pipeline` | Test end-to-end vocal |
| `voice_calibrate_microphone` | Calibration micro (auto-gain) |
| `voice_detect_wake_word` | Détection wake word ("Hey TITANE") |
| `voice_get_available_models` | Liste models Whisper disponibles |
| `voice_enable_duplex` | Active mode full-duplex |
| `voice_disable_duplex` | Désactive full-duplex |
| `voice_check_interruption` | Vérifie si utilisateur interrompt |

#### Audio System (6 commandes)

| Commande | Description |
|----------|-------------|
| `tts_speak` | Text-to-Speech (texte → audio) |
| `tts_stop` | Arrête TTS |
| `test_tts` | Test TTS avec phrase test |
| `test_microphone` | Test enregistrement micro |
| `get_audio_output_devices` | Liste devices sortie audio |
| `get_audio_input_devices` | Liste devices entrée micro |

---

### 3. SINGULARITY STATE (18 commandes)

**État 5-layer** : Physical → Cognitive → Symbolic → Adaptive → Meta

| Commande | Description |
|----------|-------------|
| `singularity_get_full_state` | État complet 5 layers |
| `singularity_get_physical` | Layer Physical (CPU, RAM, disk) |
| `singularity_get_cognitive` | Layer Cognitive (engines status) |
| `singularity_get_symbolic` | Layer Symbolic (abstractions) |
| `singularity_get_adaptive` | Layer Adaptive (apprentissage) |
| `singularity_get_meta` | Layer Meta (réflexivité) |
| `singularity_get_global_coherence` | Score cohérence globale (0-1) |
| `singularity_is_critical` | Retourne si état critique |
| `singularity_update_physical` | Mise à jour layer Physical |
| `singularity_update_cognitive` | Mise à jour layer Cognitive |
| `singularity_update_symbolic` | Mise à jour layer Symbolic |
| `singularity_update_adaptive` | Mise à jour layer Adaptive |
| `singularity_update_meta` | Mise à jour layer Meta |
| `singularity_update_full_state` | Mise à jour complète |
| `sync_singularity` | Auto-sync tous layers |
| `singularity_save_state` | Sauvegarde disque (JSON) |
| `singularity_load_state` | Restaure depuis disque |
| `singularity_self_check` | Auto-diagnostic integrity |

---

### 4. MEMORY OS (14 commandes)

#### Memory API (8 commandes)

| Commande | Description |
|----------|-------------|
| `get_memory_state` | État UnifiedMemory complet |
| `write_snapshot` | Sauvegarde snapshot mémoire |
| `read_snapshot` | Restaure snapshot |
| `write_log` | Écrit entrée log mémoire |
| `read_logs` | Lit logs mémoire (filtrés) |
| `add_timeline_event` | Ajoute event timeline |
| `memory_get_active_projects` | Projets actifs (LTM) |
| `memory_get_recent_decisions` | Décisions récentes (MTM) |

#### Memory OS Commands (5 commandes)

| Commande | Description |
|----------|-------------|
| `memory_clear` | Efface STM (Short-Term Memory) |
| `memory_promote` | Promotion STM → MTM ou MTM → LTM |
| `memory_demote` | Rétrogradation LTM → MTM ou MTM → STM |
| `memory_delete` | Suppression entrée spécifique |
| `memory_prune` | Nettoyage mémoire (anciennes entrées) |

---

### 5. GOVERNANCE (11 commandes)

| Commande | Description |
|----------|-------------|
| `get_ia_policies` | Récupère policies IA |
| `save_ia_policies` | Sauvegarde policies |
| `toggle_ia_policy` | Active/désactive policy |
| `create_ia_policy` | Crée nouvelle policy |
| `delete_ia_policy` | Supprime policy |
| `get_permission_matrix` | Matrice permissions |
| `clear_permission_audit` | Efface audit permissions |
| `get_security_log` | Récupère logs sécurité |
| `append_security_log` | Ajoute entrée log sécurité |
| `export_security_log` | Exporte logs (JSON/CSV) |
| `clear_security_log` | Efface logs sécurité |

---

### 6. SYSTEM CENTER (9 commandes)

| Commande | Description |
|----------|-------------|
| `sc_run_quick_diagnostics` | Diagnostic rapide (30s) |
| `sc_run_full_diagnostics` | Diagnostic complet (5min) |
| `sc_get_diagnostic_status` | Statut dernier diagnostic |
| `sc_clear_logs` | Efface logs System Center |
| `sc_add_log` | Ajoute entrée log |
| `sc_initialize_cluster` | Init cluster nodes |
| `sc_shutdown_cluster` | Shutdown cluster |
| `sc_hypervision_stop` | Arrête hypervision |
| `sc_hypervision_clear_anomalies` | Efface anomalies détectées |
| `sc_hypervision_resolve_anomaly` | Résout anomalie spécifique |

---

### 7. AUTH & SECURITY (13 commandes)

#### API Keys (6 commandes)

| Commande | Description |
|----------|-------------|
| `chat_set_gemini_key` | Définit clé Gemini |
| `get_gemini_key_status` | Status clé (présente/absente) |
| `chat_set_openai_key` | Définit clé OpenAI |
| `get_openai_key_status` | Status clé OpenAI |
| `chat_set_anthropic_key` | Définit clé Claude |
| `get_anthropic_key_status` | Status clé Claude |

#### Auth OS (7 commandes)

| Commande | Description |
|----------|-------------|
| `auth_get_status` | Status authentification |
| `auth_generate_dev_token` | Génère token dev |
| `auth_validate_dev_token` | Valide token |
| `auth_revoke_dev_token` | Révoque token |
| `auth_save_api_keys` | Sauvegarde clés API |
| `auth_get_api_keys` | Récupère clés (masquées) |
| `auth_delete_api_key` | Supprime clé API |
| `auth_grant_role` | Attribue rôle utilisateur |
| `auth_revoke_role` | Révoque rôle |

#### Security

| Commande | Description |
|----------|-------------|
| `check_system_integrity` | Vérifie intégrité système (checksums) |

---

### 8. DEVTOOLS (6 commandes)

| Commande | Description |
|----------|-------------|
| `devtools_enable` | Active DevTools |
| `devtools_disable` | Désactive DevTools |
| `devtools_debug_clear` | Efface logs debug |
| `get_devtools_logs` | Récupère logs DevTools |
| `clear_devtools_logs` | Efface logs |
| `devtools_get_status` | Status DevTools (enabled/disabled) |

---

### 9. CONVERSATION ENGINE (5 commandes)

| Commande | Description |
|----------|-------------|
| `create_new_conversation` | Crée conversation OMEGA |
| `conversation_generate` | Génère réponse OMEGA |
| `conversation_process_message` | Traite message OMEGA Pipeline |
| `conversation_health_check` | Health check Conversation Engine |
| `conversation_memory_stats` | Stats mémoire conversations |

---

### 10. HELIOS (2 commandes)

| Commande | Description |
|----------|-------------|
| `get_helios_state` | État système Helios (monitoring) |
| `helios_get_health` | Health Helios |

---

### 11. PERSISTENT MEMORY (4 commandes)

| Commande | Description |
|----------|-------------|
| `persistent_memory_promote_entry` | Promotion entry → bundle |
| `persistent_memory_archive_entry` | Archive entry |
| `persistent_memory_delete_entry` | Suppression entry |
| `persistent_memory_add_to_bundle` | Ajoute entry à bundle |

---

### 12. UI THEME (2 commandes)

| Commande | Description |
|----------|-------------|
| `save_ui_theme` | Sauvegarde thème UI (JSON) |
| `load_ui_theme` | Charge thème UI |

---

### 13. SELF-HEALING (4 commandes)

| Commande | Description |
|----------|-------------|
| `self_healing_trigger` | Déclenche auto-réparation |
| `self_healing_get_status` | Status self-healing |
| `self_healing_enable` | Active self-healing |
| `self_healing_disable` | Désactive self-healing |

---

### 14. WHISPER STREAMING (3 commandes)

| Commande | Description |
|----------|-------------|
| `start_whisper_streaming` | Démarre STT streaming |
| `stop_whisper_streaming` | Arrête STT streaming |
| `send_audio_chunk` | Envoie chunk audio (streaming) |

---

### 15. CORE (2 commandes)

| Commande | Description |
|----------|-------------|
| `send_message` | Envoi message générique |
| `ollama_query` | Query directe Ollama local |

---

## 🔍 EXEMPLES UTILISATION

### Frontend (React + TypeScript)

```typescript
import { invokeTauriCommand } from '@/services/tauriBridge';

// Chat
const response = await invokeTauriCommand('chat_send_message', {
  request: {
    message: "Bonjour TITANE",
    provider: "auto",
    streaming: false
  }
});

// Voice
await invokeTauriCommand('voice_start_listening');
const result = await invokeTauriCommand('voice_stop_listening');
console.log('Transcription:', result.data.transcription);

// Singularity
const state = await invokeTauriCommand('singularity_get_full_state');
console.log('Cohérence:', state.data.global_coherence);
```

### Backend (Rust)

```rust
#[tauri::command]
pub async fn custom_workflow(
    chat_state: State<'_, ChatOrchestratorState>,
    singularity: State<'_, SingularityState>,
) -> Result<String, String> {
    // Combine multiple commands
    let chat_response = chat_send_message(chat_state, request).await?;
    let singularity_state = singularity_get_full_state(singularity).await?;
    
    Ok(format!("Chat: {}, Coherence: {}", 
        chat_response.message.content,
        singularity_state.global_coherence
    ))
}
```

---

## 📊 STATISTIQUES

**Total commandes** : 100+  
**Modules backend** : 15  
**Coverage tests** : ~60% (à améliorer)  
**Documentation** : ✅ Ce fichier + inline docs Rust

---

**Statut** : ✅ Référence complète commandes Tauri v24.2.0  
**Prochaine étape** : [GLOSSARY.md](../00_core/GLOSSARY.md)

---

*TITANE∞ Documentation Evolution Engine — Phase 2 API Reference*
