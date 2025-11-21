# ARCHITECTURE OVERDRIVE v16

**Version :** TITANE∞ v16.0 — OVERDRIVE ENGINE  
**Date :** $(date +%Y-%m-%d)  
**Type :** Architecture système complète

---

## 🎯 VUE D'ENSEMBLE

TITANE∞ v16 OVERDRIVE est un **moteur de déploiement et d'exécution autonome** comprenant :

1. **8 modules Rust backend** (Overdrive Engine)
2. **1 script Bash de déploiement** (1500+ lignes, 12 sections)
3. **Intégration frontend React/Vite** avec hooks
4. **Auto-Heal System v3** (OS + Backend + Frontend)
5. **Voice Engine full-duplex** (Whisper + Piper)
6. **Chat IA hybride** (Gemini cloud + Ollama local)
7. **Memory Engine sémantique** (embeddings + vector store)
8. **EXP System gamifié** (niveaux + talent tree)
9. **Project AutoPilot** (analyse + suggestions + exécution nocturne)

---

## 📁 STRUCTURE FICHIERS

```
TITANE_INFINITY/
├── scripts/
│   └── titane_overdrive_v16.sh       # Script déploiement (1500+ lignes)
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                   # Point d'entrée Tauri (modifié)
│   │   └── overdrive/
│   │       ├── mod.rs                # Module principal Overdrive
│   │       ├── auto_heal.rs          # Auto-Heal Engine (650+ lignes)
│   │       ├── voice_engine.rs       # Voice Engine (350+ lignes)
│   │       ├── chat_orchestrator.rs  # Chat IA (400+ lignes)
│   │       ├── memory_engine.rs      # Memory Engine (450+ lignes)
│   │       ├── semantic_kernel.rs    # Semantic Kernel (400+ lignes)
│   │       ├── exp_engine.rs         # EXP System (500+ lignes)
│   │       ├── project_autopilot.rs  # Project AutoPilot (450+ lignes)
│   │       └── api_bridge.rs         # API Bridge (450+ lignes)
│   │
│   └── Cargo.toml                    # Dépendances Rust (modifié)
│
├── src/
│   ├── App.tsx                       # Application principale (optimisée v16)
│   ├── router.tsx                    # Routes React Router
│   ├── ui/
│   │   ├── pages/Chat.tsx            # Chat IA v16
│   │   └── layouts/AppLayout.tsx     # Layout principal
│   ├── components/
│   │   └── AutoHealErrorBoundary.tsx # ErrorBoundary avec auto-réparation
│   └── utils/
│       └── autoHealClient.ts         # Client Tauri Auto-Heal
│
└── docs/
    ├── ARCHITECTURE_OVERDRIVE_v16.md # Ce fichier
    ├── CHANGELOG_v16.1_OVERDRIVE.md  # Changelog détaillé
    └── GUIDE_DEPLOYMENT_v16.md       # Guide utilisation
```

---

## 🏗️ ARCHITECTURE MODULAIRE

### **Niveau 1 : OS Layer**

```
┌───────────────────────────────────────────────────────────────┐
│                     Pop!_OS 24.04 LTS                         │
├───────────────────────────────────────────────────────────────┤
│  • WebKitGTK 4.1        • GLIBC 2.35+                        │
│  • PipeWire             • libsoup3                            │
│  • Rust stable          • Node.js 22+                         │
│  • Ollama               • Python 3.x                          │
└───────────────────────────────────────────────────────────────┘
```

### **Niveau 2 : Tauri Runtime**

```
┌───────────────────────────────────────────────────────────────┐
│                      Tauri v2 Core                            │
├───────────────────────────────────────────────────────────────┤
│  • WebView2 (WebKitGTK)                                       │
│  • IPC Bridge (invoke/emit)                                   │
│  • State Management (Arc<Mutex<T>>)                           │
│  • Window Manager                                             │
└───────────────────────────────────────────────────────────────┘
```

### **Niveau 3 : Overdrive Engine (Backend Rust)**

```
┌───────────────────────────────────────────────────────────────┐
│                    Overdrive Core Module                      │
├───────────────────────────┬───────────────────────────────────┤
│  AUTO-HEAL ENGINE         │  VOICE ENGINE                     │
│  • Scan système           │  • ASR (Whisper.cpp)             │
│  • Repair modules         │  • TTS (Piper/Kokoro)            │
│  • Panic handler          │  • Full-duplex audio             │
│  • Logs structurés        │  • Wake word detection           │
├───────────────────────────┼───────────────────────────────────┤
│  CHAT ORCHESTRATOR        │  MEMORY ENGINE                    │
│  • Gemini API             │  • Embeddings (Nomic)            │
│  • Ollama local           │  • Vector store                  │
│  • Fallback cascade       │  • Semantic search               │
│  • Streaming support      │  • Context recall                │
├───────────────────────────┼───────────────────────────────────┤
│  SEMANTIC KERNEL          │  EXP ENGINE                       │
│  • Skills library         │  • XP par catégorie              │
│  • Intent recognition     │  • Niveaux + progression         │
│  • Skill chaining         │  • Talent tree                   │
│  • Prompt templates       │  • Achievements                  │
├───────────────────────────┼───────────────────────────────────┤
│  PROJECT AUTOPILOT        │  API BRIDGE                       │
│  • Indexation projets     │  • Gemini connector              │
│  • Task management        │  • Ollama connector              │
│  • Suggestions IA         │  • GitHub connector              │
│  • Exécution nocturne     │  • Cache + stats                 │
└───────────────────────────┴───────────────────────────────────┘
```

### **Niveau 4 : Frontend React**

```
┌───────────────────────────────────────────────────────────────┐
│                    React 18 + TypeScript                      │
├───────────────────────────────────────────────────────────────┤
│  • AppLayout (Menu + Header + Footer)                         │
│  • Chat IA v16 (orchestrateur + streaming)                    │
│  • Voice Panel (contrôle ASR/TTS)                             │
│  • EXP Panel (progression + talents)                          │
│  • Project Dashboard (autopilot + suggestions)                │
│  • Settings (configuration modules)                           │
│  • AutoHealErrorBoundary (récupération auto)                  │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUX DE DONNÉES

### **1. Chat IA — Requête utilisateur**

```
User Input (Chat UI)
  ↓
ChatRequest {message, provider: "auto"}
  ↓
invoke('chat_send_message')
  ↓
ChatOrchestrator::chat_send_message()
  ↓
select_best_provider() → "gemini" | "ollama" | "local"
  ↓
send_to_provider()
  ↓
ChatResponse {message, latency_ms}
  ↓
Store in Memory Engine
  ↓
Display in Chat UI
```

### **2. Voice — Commande vocale**

```
Audio Input (Micro)
  ↓
invoke('voice_transcribe_audio', {audio_data})
  ↓
VoiceEngine::voice_transcribe_audio()
  ↓
Whisper.cpp → TranscriptionResult {text}
  ↓
Chat Orchestrator (text)
  ↓
ChatResponse {message}
  ↓
invoke('voice_synthesize_speech', {text})
  ↓
Piper TTS → Audio Output
  ↓
invoke('voice_play_audio', {audio_data})
  ↓
Speakers
```

### **3. Auto-Heal — Erreur détectée**

```
React Error (any component)
  ↓
AutoHealErrorBoundary::componentDidCatch()
  ↓
invoke('auto_heal_scan')
  ↓
AutoHealEngine::auto_heal_scan()
  ↓
HealReport {system_health, critical_errors}
  ↓
invoke('auto_heal_repair')
  ↓
AutoHealEngine::auto_heal_repair()
  ↓
Repair modules → Success
  ↓
window.location.reload()
```

---

## 📊 COMMANDES TAURI EXPOSÉES

### **Auto-Heal (8 commandes)**

```rust
auto_heal_scan() -> HealReport
auto_heal_repair(module?) -> Vec<String>
auto_heal_get_logs() -> HealReport
```

### **Voice Engine (12 commandes)**

```rust
voice_start_listening() -> String
voice_stop_listening() -> String
voice_transcribe_audio(audio_data) -> TranscriptionResult
voice_detect_wake_word(audio_data) -> bool
voice_synthesize_speech(request) -> Vec<u8>
voice_play_audio(audio_data) -> String
voice_stop_speaking() -> String
voice_get_config() -> VoiceConfig
voice_update_config(config) -> String
voice_get_status() -> VoiceStatus
voice_calibrate_microphone() -> f32
voice_enable_duplex() -> String
```

### **Chat Orchestrator (7 commandes)**

```rust
chat_send_message(request) -> ChatResponse (async)
chat_stream_message(request) -> String (async)
chat_create_conversation() -> String
chat_get_conversation(id) -> ConversationMemory
chat_delete_conversation(id) -> String
chat_set_gemini_key(key) -> String
chat_get_providers_status() -> Vec<ProviderStatus>
```

### **Memory Engine (12 commandes)**

```rust
memory_store(content, metadata) -> String (async)
memory_store_conversation(id, messages) -> usize (async)
memory_search(query) -> Vec<MemoryResult> (async)
memory_get_related(id, limit) -> Vec<MemoryEntry>
memory_rebuild_index() -> String
memory_get_stats() -> MemoryStats
memory_prune(min_importance, min_access) -> usize
memory_delete(id) -> String
memory_clear() -> String
memory_export() -> Vec<MemoryEntry>
memory_import(entries) -> usize
```

### **Semantic Kernel (9 commandes)**

```rust
semantic_execute_skill(request) -> SemanticResponse (async)
semantic_analyze_intent(query) -> IntentAnalysis (async)
semantic_chain_skills(names, input) -> String (async)
semantic_list_skills() -> Vec<SemanticSkill>
semantic_get_skill(name) -> SemanticSkill
semantic_add_skill(skill) -> String
semantic_remove_skill(name) -> String
semantic_toggle_skill(name, enabled) -> String
semantic_clear_cache() -> usize
```

### **EXP Engine (10 commandes)**

```rust
exp_add(amount, category, source, description) -> ExpProfile
exp_add_batch(gains) -> ExpProfile
exp_get_profile() -> ExpProfile
exp_get_level_up_history(limit) -> Vec<LevelUpEvent>
exp_get_talents() -> Vec<Talent>
exp_unlock_talent(id) -> ExpProfile
exp_reset_talents() -> ExpProfile
exp_get_history(category?, limit) -> Vec<ExpGain>
exp_get_category_stats(category) -> CategoryExp
exp_get_total_contributions() -> u32
```

### **Project AutoPilot (12 commandes)**

```rust
project_add(name, path, type) -> Project
project_list() -> Vec<Project>
project_get(id) -> Project
project_update(project) -> Project
project_delete(id) -> String
project_analyze(id) -> ProjectMetadata
task_create(project_id, title, description) -> Task
task_list(project_id?) -> Vec<Task>
task_update_status(id, status) -> Task
task_delete(id) -> String
autopilot_run() -> AutoPilotReport
autopilot_get_suggestions() -> Vec<AutoPilotSuggestion>
```

### **API Bridge (9 commandes)**

```rust
api_request(request) -> ApiResponse (async)
api_get_configs() -> Vec<ApiConfig>
api_update_config(config) -> String
api_set_key(name, key) -> String
api_enable(name, enabled) -> String
api_get_stats() -> Vec<ApiStats>
api_clear_cache() -> usize
api_gemini_generate(prompt) -> String (async)
api_ollama_generate(model, prompt) -> String (async)
```

### **Overdrive Global (2 commandes)**

```rust
overdrive_health_check() -> OverdriveHealthReport
overdrive_get_version() -> OverdriveVersion
```

**TOTAL : ~90 commandes Tauri exposées**

---

## 🚀 DÉPLOIEMENT

### **Option 1 : Script automatique**

```bash
cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY
./scripts/titane_overdrive_v16.sh
```

### **Option 2 : Manuel**

```bash
# 1. Installer dépendances OS
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libsoup-3.0-dev libssl-dev

# 2. Installer Rust + Node
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
nvm install 22

# 3. Installer Ollama + modèles
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b
ollama pull nomic-embed-text

# 4. Build frontend
npm install
npm run build

# 5. Build backend
cd src-tauri
cargo tauri build

# 6. Installer
sudo cp target/release/titane-infinity /usr/local/bin/titane
```

---

## 📈 ÉVOLUTION FUTURE

### **v16.1 — Prochaines fonctionnalités**

- [ ] Streaming WebSocket pour Chat IA
- [ ] Whisper.cpp intégration complète
- [ ] Piper TTS intégration complète
- [ ] Base de données SQLite pour Memory/EXP/Projects
- [ ] UI Talent Tree interactive
- [ ] AutoPilot scheduling avec cron
- [ ] Multi-utilisateurs avec authentification
- [ ] Marketplace de Skills (Semantic Kernel)
- [ ] Export/Import configuration complète

---

## 🔒 SÉCURITÉ

- **API Keys** : Stockage sécurisé (keyring système)
- **IPC** : Validation complète des commandes Tauri
- **Panic Handler** : Capture tous les crashes Rust
- **ErrorBoundary** : Capture toutes les erreurs React
- **Logs** : Rotation automatique, max 100MB
- **Cache** : Limite 100 entrées, expiration 5min

---

## 📝 LICENCE

TITANE∞ v16 Overdrive — Propriétaire  
© 2025 Kevin (@titane_os)

---

**FIN ARCHITECTURE OVERDRIVE v16**
