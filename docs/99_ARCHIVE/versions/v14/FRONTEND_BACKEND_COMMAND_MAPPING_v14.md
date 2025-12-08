# TITANE∞ v14 — Frontend ↔ Backend Command Mapping

## ✅ Commands Already Implemented (handlers.rs)

### System Commands
- ✅ `get_system_status` → `commands::get_system_status`
- ✅ `helios_get_metrics` → `commands::helios_get_metrics`
- ✅ `nexus_get_graph` → `commands::nexus_get_graph`
- ✅ `harmonia_get_flows` → `commands::harmonia_get_flows`
- ✅ `sentinel_get_alerts` → `commands::sentinel_get_alerts`

### Engine v14 Commands
- ✅ `engine_init` → `commands::engine_init`
- ✅ `engine_tick` → `commands::engine_tick`
- ✅ `engine_sync` → `commands::engine_sync`
- ✅ `engine_health` → `commands::engine_health`
- ✅ `engine_metrics` → `commands::engine_metrics`
- ✅ `engine_modules_info` → `commands::engine_modules_info`

### AI Chat Commands
- ✅ `ai_query` → `commands::ai_query`
- ✅ `speak` → `commands::speak`
- ✅ `start_recording` → `commands::start_recording`
- ✅ `stop_recording` → `commands::stop_recording`
- ✅ `transcribe_audio` → `commands::transcribe_audio`
- ✅ `create_conversation` → `commands::create_conversation`
- ✅ `load_conversation` → `commands::load_conversation`
- ✅ `list_conversations` → `commands::list_conversations`
- ✅ `delete_conversation` → `commands::delete_conversation`
- ✅ `clear_all_memory` → `commands::clear_all_memory`
- ✅ `check_connection` → `commands::check_connection`
- ✅ `health_check` → `commands::health_check`
- ✅ `get_vad_state` → `commands::get_vad_state`
- ✅ `get_module_status` → `commands::get_module_status`

### Memory & Evolution
- ✅ `memory_compactor_run` → `commands::memory_compactor_run`
- ✅ `memory_compactor_status` → `commands::memory_compactor_status`
- ✅ `evolution_run_cycle` → `commands::evolution_run_cycle`
- ✅ `evolution_get_stats` → `commands::evolution_get_stats`
- ✅ `evolution_get_state` → `commands::evolution_get_state`

### Diagnostic
- ✅ `backend_self_check` → `commands::backend_self_check`

### Secure Commands
- ✅ `secure_import_file` → `secure_commands::secure_import_file`
- ✅ `secure_read_file` → `secure_commands::secure_read_file`
- ✅ `secure_list_files` → `secure_commands::secure_list_files`
- ✅ `secure_delete_file` → `secure_commands::secure_delete_file`
- ✅ `get_permission_audit` → `secure_commands::get_permission_audit`
- ✅ `validate_chat_message` → `secure_commands::validate_chat_message`
- ✅ `check_system_integrity` → `secure_commands::check_system_integrity`

---

## ❌ Commands Called by Frontend but NOT Implemented

### Chat API (tauriClient.ts)
- ❌ `chat_send_message` → **NEEDS IMPLEMENTATION**
- ❌ `chat_stream_message` → **NEEDS IMPLEMENTATION**
- ❌ `chat_delete_conversation` → ✅ IMPLEMENTED as `delete_conversation`
- ❌ `chat_set_gemini_key` → **NEEDS IMPLEMENTATION**
- ❌ `chat_get_providers_status` → **NEEDS IMPLEMENTATION**
- ❌ `chat_check_providers` → **NEEDS IMPLEMENTATION**

### System API (tauriClient.ts)
- ❌ `get_system_vitals` → **NEEDS IMPLEMENTATION**
- ❌ `singularity_get_full_state` → ✅ EXISTS in mock_commands

### Memory API
- ❌ `memory_get` → **NEEDS IMPLEMENTATION**
- ❌ `memory_set` → **NEEDS IMPLEMENTATION**

### Auto-Evolution
- ❌ `run_auto_evolution` → ✅ EXISTS as `evolution_run_cycle`

---

## 🔧 Required Actions

### PHASE 2 — Action Items

1. **Ajouter commands manquantes dans ai_chat.rs :**
   ```rust
   #[tauri::command]
   pub async fn chat_send_message(state: State<'_, AIChatState>, request: ChatRequest) -> Result<ChatResponse, String>

   #[tauri::command]
   pub async fn chat_stream_message(state: State<'_, AIChatState>, request: ChatRequest) -> Result<(), String>

   #[tauri::command]
   pub async fn chat_set_gemini_key(state: State<'_, AIChatState>, api_key: String) -> Result<(), String>

   #[tauri::command]
   pub async fn chat_get_providers_status(state: State<'_, AIChatState>) -> Result<Vec<ProviderStatus>, String>

   #[tauri::command]
   pub async fn chat_check_providers(state: State<'_, AIChatState>) -> Result<Vec<ProviderStatus>, String>
   ```

2. **Ajouter system commands dans commands/mod.rs :**
   ```rust
   #[tauri::command]
   pub async fn get_system_vitals(state: State<'_, Arc<Mutex<TitaneCore>>>) -> Result<String, String>
   ```

3. **Mettre à jour handlers.rs pour inclure nouvelles commandes**

4. **Aligner frontend tauriClient.ts avec commandes réelles**

---

## 📊 Status Summary

- ✅ **Implemented**: 42+ commands
- ❌ **Missing**: 6 commands critical
- 🔄 **Need Rename**: 2 commands (alias frontend)

**Next Step**: Implémenter les 6 commandes manquantes dans PHASE 2.
