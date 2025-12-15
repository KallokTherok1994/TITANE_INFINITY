# 📖 TITANE∞ — Glossaire Technique (Code Réel v24.2.0)

**Date:** 15 décembre 2025  
**Sources:** Code Rust + TypeScript (analysé)

---

## A

### Adaptive Timeout
**Fichier** : `src-tauri/src/overdrive/chat_orchestrator.rs` L14-39  
**Définition** : Mécanisme ajustant dynamiquement le timeout requêtes selon provider et complexité.  
**Valeurs** :
- **Simple query** : 10s
- **Standard** : 30s (défaut)
- **Complex/streaming** : 60s

**Exemple code** :
```rust
fn calculate_timeout(provider: &str, streaming: bool) -> u64 {
    match (provider, streaming) {
        ("ollama", _) => 10_000,
        (_, true) => 60_000,
        _ => 30_000,
    }
}
```

### API Keys
**Fichiers** : `src-tauri/src/auth/`, `auth_commands.rs`  
**Définition** : Clés d'authentification providers IA (OpenAI, Claude, Gemini).  
**Stockage** : Chiffré dans `~/.config/titane/auth/keys.enc`  
**Commandes** : `chat_set_openai_key`, `get_openai_key_status`

---

## C

### ChatOrchestrator
**Fichier** : `src-tauri/src/overdrive/chat_orchestrator.rs` (1935 lignes)  
**Définition** : Moteur central gérant conversations multi-providers.  
**Responsabilités** :
- Sélection provider (auto/manuel)
- Gestion timeout adaptatif
- Injection context UnifiedMemory
- Streaming réponses
- Retry logic

**État** :
```rust
pub struct ChatOrchestratorState {
    pub unified_memory: Arc<Mutex<UnifiedMemory>>,
    pub providers: Arc<HashMap<String, Box<dyn ChatProvider>>>,
    pub config: ChatConfig,
}
```

### Control Panel
**Fichier** : `src-tauri/src/control_panel_commands.rs` (26 commandes)  
**Définition** : Interface administration système (diagnostics, logs, cluster).  
**Exemples** : `sc_run_full_diagnostics`, `sc_initialize_cluster`

### Conversation Engine
**Fichier** : `src-tauri/src/conversation_engine/`  
**Définition** : Moteur conversations OMEGA Pipeline.  
**Différence vs ChatOrchestrator** :
- **ChatOrchestrator** : Requêtes unitaires multi-providers
- **Conversation Engine** : Conversations OMEGA 4-stage processing

---

## D

### DevTools
**Fichier** : `src-tauri/src/devtools/`  
**Définition** : Outils développement (debug logs, monitoring).  
**Commandes** : `devtools_enable`, `get_devtools_logs`

### Diagnostics
**Fichier** : `src-tauri/src/omega/diagnostics.rs` (~200 lignes)  
**Définition** : Module métriques Pipeline OMEGA.  
**Métriques collectées** :
- Latence par étape (Router, Executor, Merger, Guardrails)
- Taux succès/échec
- Cache hits
- Requêtes bloquées

---

## E

### Executor
**Fichier** : `src-tauri/src/omega/executor.rs` (~600 lignes)  
**Définition** : ÉTAPE 2 Pipeline OMEGA — exécution tâches parallèles.  
**Fonctionnalités** :
- Workers parallèles (max 4)
- Multi-providers (local + cloud)
- Integration UnifiedMemory
- Timeout gestion

---

## F

### Fusion
**Fichier** : `src-tauri/src/fusion.rs` (9 commandes)  
**Définition** : Fusion données multi-sources.  
**Usage** : Combinaison résultats providers IA.

---

## G

### Gemini
**Provider** : Google Gemini (API cloud)  
**Modèles** : `gemini-2.0-flash-exp`, `gemini-pro`  
**Config** : `src-tauri/src/overdrive/providers/gemini.rs`  
**Commande** : `chat_generate_gemini`

### Governance
**Fichier** : `src-tauri/src/governance/` (11 commandes)  
**Définition** : Gestion policies IA, permissions, audit.  
**Commandes** : `get_ia_policies`, `toggle_ia_policy`, `get_security_log`

### Guardrails
**Fichier** : `src-tauri/src/omega/guardrails.rs` (~450 lignes)  
**Définition** : ÉTAPE 4 Pipeline OMEGA — validation sécurité.  
**Checks** :
- Contenu inapproprié
- Données sensibles
- Hallucinations
- Cohérence logique

**Output** :
```rust
pub struct GuardrailResult {
    pub safety_score: f64,      // 0.0 - 1.0
    pub was_blocked: bool,
    pub was_modified: bool,
    pub checks: Vec<GuardrailCheck>,
}
```

---

## H

### Helios
**Fichier** : `src-tauri/src/helios/` (2 commandes)  
**Définition** : Monitoring système temps réel.  
**Métriques** : CPU, RAM, disque, réseau  
**Commande** : `get_helios_state`

### Hyper Intelligence
**Fichier** : `src-tauri/src/hyper_intelligence/commands.rs` (11 commandes)  
**Définition** : Système intelligence avancée (méta-apprentissage).

---

## L

### LTM (Long-Term Memory)
**Fichier** : `src-tauri/src/memory/unified_memory.rs`  
**Définition** : Mémoire à long terme (connaissances persistantes).  
**Durée** : Permanent (stockage disque)  
**Contenu** : Faits appris, projets, contexte long terme

---

## M

### Merger
**Fichier** : `src-tauri/src/omega/merger.rs` (~350 lignes)  
**Définition** : ÉTAPE 3 Pipeline OMEGA — fusion résultats.  
**Stratégies** :
- `SelectBest` : Sélectionne meilleure réponse (score)
- `Concatenate` : Combine toutes
- `Weighted` : Moyenne pondérée
- `Consensus` : Accord multi-sources

### MTM (Mid-Term Memory)
**Fichier** : `src-tauri/src/memory/unified_memory.rs`  
**Définition** : Mémoire à moyen terme (contexte session).  
**Durée** : Heures/jours  
**Contenu** : Décisions récentes, contexte projet actuel

### Multimodal
**Fichier** : `src-tauri/src/multimodal/commands.rs` (12 commandes)  
**Définition** : Support multi-modalités (texte, image, audio, vidéo).

---

## O

### OMEGA Pipeline
**Fichier** : `src-tauri/src/omega/pipeline.rs` (589 lignes)  
**Définition** : Pipeline traitement requêtes en 4 étapes.  
**Étapes** :
1. **Router** : Analyse intent, routing
2. **Executor** : Exécution tâches
3. **Merger** : Fusion résultats
4. **Guardrails** : Validation sécurité

**Documentation** : [OMEGA_PIPELINE_DETAILED.md](../01_architecture/OMEGA_PIPELINE_DETAILED.md)

### Ollama
**Provider** : Ollama local (modèles open-source)  
**Modèles** : Llama 3.3, Mistral, etc.  
**Avantage** : Privacy, offline, gratuit  
**Timeout** : 10s (rapide)

### Overdrive
**Fichier** : `src-tauri/src/overdrive/`  
**Définition** : Module conversation avancée (chat + voice).  
**Composants** :
- `chat_orchestrator.rs` (1935L)
- `voice_engine.rs` (voice commands)
- `providers/` (OpenAI, Claude, Gemini, Ollama)

---

## P

### Pipeline
→ Voir **OMEGA Pipeline**

### Provider
**Définition** : Fournisseur IA externe (OpenAI, Claude, Gemini, Ollama).  
**Interface** :
```rust
pub trait ChatProvider {
    async fn send_message(&self, request: ChatRequest) -> ChatResponse;
    async fn health_check(&self) -> bool;
}
```

---

## R

### Router
**Fichier** : `src-tauri/src/omega/router.rs` (~400 lignes)  
**Définition** : ÉTAPE 1 Pipeline OMEGA — routage intelligent.  
**Analyse** :
- Intent (question, commande, conversation)
- Confidence score
- Cache hit/miss
- Execution mode (local/cloud/hybrid)

---

## S

### Self-Healing
**Fichier** : `src-tauri/src/self_healing/` (4 commandes)  
**Définition** : Système auto-réparation (détection + correction anomalies).  
**Commandes** : `self_healing_trigger`, `self_healing_get_status`

### Singularity State
**Fichier** : `src-tauri/src/singularity_state/` (18 commandes)  
**Définition** : État système 5-layer.  
**Layers** :
1. **Physical** : Ressources matérielles (CPU, RAM, disk)
2. **Cognitive** : Engines cognitifs (14 engines)
3. **Symbolic** : Abstractions haut-niveau
4. **Adaptive** : Apprentissage & adaptation
5. **Meta** : Réflexivité & self-awareness

**Métriques** : Global Coherence Score (0.0 - 1.0)

### STM (Short-Term Memory)
**Fichier** : `src-tauri/src/memory/unified_memory.rs`  
**Définition** : Mémoire à court terme (contexte immédiat).  
**Durée** : Minutes  
**Contenu** : Messages récents, focus actuel

### System Center
**Fichier** : `src-tauri/src/system_center/` (9 commandes)  
**Définition** : Centre contrôle système (diagnostics, cluster, hypervision).  
**Commandes** : `sc_run_full_diagnostics`, `sc_initialize_cluster`

---

## T

### tauriBridge
**Fichier** : `src/services/tauriBridge.ts` (658 lignes)  
**Définition** : Wrapper TypeScript centralisant appels Tauri.  
**Fonction principale** :
```typescript
export async function invokeTauriCommand<T>(
  command: string,
  args?: Record<string, any>
): Promise<TauriResponse<T>>
```

### Titan-Dev
**Définition** : Runtime développement TITANE∞.  
**Command** : `./runtime/dev/run-dev.sh`  
**Stack** : Vite (HMR) + Tauri Dev + React DevTools

### Titan-Stable
**Définition** : Runtime production TITANE∞.  
**Build** : `./runtime/stable/build.sh`  
**Optimisations** : Minification, tree-shaking, code splitting

### TTS (Text-to-Speech)
**Fichier** : `src-tauri/src/audio/tts.rs`  
**Définition** : Synthèse vocale (texte → audio).  
**Commandes** : `tts_speak`, `tts_stop`

---

## U

### UnifiedMemory
**Fichier** : `src-tauri/src/memory/unified_memory.rs`  
**Définition** : Système mémoire unifié 3-tier (STM/MTM/LTM).  
**Architecture** :
```
STM (minutes) → MTM (heures/jours) → LTM (permanent)
     ↓ Promotion automatique ↓
```

**Commandes** : `get_memory_state`, `memory_promote`, `memory_clear`

---

## V

### Voice Engine
**Fichier** : `src-tauri/src/overdrive/voice_engine.rs` (17 commandes)  
**Définition** : Moteur vocal complet (STT + TTS + wake word).  
**Fonctionnalités** :
- Enregistrement micro
- Transcription (Whisper)
- Wake word detection ("Hey TITANE")
- Full-duplex (simultané STT + TTS)
- Calibration auto-gain

**Commandes** : `voice_start_listening`, `voice_transcribe_audio`

---

## W

### Whisper
**Modèle** : OpenAI Whisper (STT)  
**Fichier** : `src-tauri/src/audio/whisper.rs`  
**Modes** :
- **Batch** : Fichier audio complet
- **Streaming** : Chunks temps réel

**Commandes** : `voice_transcribe_audio`, `start_whisper_streaming`

---

## Y

### YOLO Mode
**Contexte** : Documentation TITANE∞  
**Définition** : Mode génération documentation autonome accélérée (avec qualité maintenue).  
**Origine** : "You Only Live Once" (approche audacieuse mais contrôlée)  
**Règles** :
- Génération rapide sans validation étape par étape
- Factualité préservée (analyse code réel)
- Aucune suppression (création uniquement)
- Reversible (git revert possible)

---

## STATISTIQUES

**Termes définis** : 45  
**Fichiers sources** : 20+  
**Commandes référencées** : 100+  
**Lignes code analysées** : 10,000+

---

## 🔗 RÉFÉRENCES

- [OMEGA_PIPELINE_DETAILED.md](../01_architecture/OMEGA_PIPELINE_DETAILED.md) — Pipeline 4-stage détaillé
- [TAURI_COMMANDS_REFERENCE.md](../06_api/TAURI_COMMANDS_REFERENCE.md) — 100+ commandes Tauri
- [DATA_FLOW_CHAT.md](../01_architecture/DATA_FLOW_CHAT.md) — Flux chat complet
- [ARCHITECTURE_CURRENT_v24.md](../01_architecture/ARCHITECTURE_CURRENT_v24.md) — Architecture globale

---

**Statut** : ✅ Glossaire factuel complet (termes code v24.2.0)  
**Prochaine étape** : [ARCHITECTURE_CURRENT_v24.md](../01_architecture/ARCHITECTURE_CURRENT_v24.md)

---

*TITANE∞ Documentation Evolution Engine — Phase 2 Glossaire*
