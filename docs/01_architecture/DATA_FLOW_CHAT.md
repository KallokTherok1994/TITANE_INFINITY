# 💬 TITANE∞ — Flux Chat End-to-End (Réalité v24.2.0)

**Date:** 15 décembre 2025  
**Version:** v24.2.0  
**Source:** Analyse code réel (tauriBridge.ts + chat_orchestrator.rs + omega/pipeline.rs)

---

## 🎯 OBJECTIF

Documenter le **flux RÉEL** d'un message chat depuis l'UI jusqu'à la réponse.  
Aucune spéculation, uniquement ce qui est **implémenté dans le code**.

---

## 📊 VUE D'ENSEMBLE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + TS)                         │
├─────────────────────────────────────────────────────────────────────┤
│  ChatInterface → tauriBridge.sendChatMessage()                      │
│  └─ Prépare: messages[], config                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ invokeTauriCommand('chat_send_message')
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Tauri + Rust)                           │
├─────────────────────────────────────────────────────────────────────┤
│  main.rs → .invoke_handler() → chat_send_message()                 │
│  └─ overdrive::chat_orchestrator::chat_send_message()              │
│     ├─ 1. Adaptive Timeout (10-60s selon taille message)           │
│     ├─ 2. Provider Selection (auto|openai|claude|gemini|ollama)    │
│     ├─ 3. Memory Injection (UnifiedMemory → STM/MTM/LTM)           │
│     ├─ 4. AI Generation (HTTP/API call)                            │
│     └─ 5. Response Processing                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ ChatResponse
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Display)                             │
├─────────────────────────────────────────────────────────────────────┤
│  tauriBridge → ChatMessage component                                │
│  └─ Affiche réponse IA dans interface                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 FLUX DÉTAILLÉ ÉTAPE PAR ÉTAPE

### PHASE 1 — FRONTEND (UI → tauriBridge)

**Fichier** : [`src/services/tauriBridge.ts`](../../src/services/tauriBridge.ts) L200-250

#### 1.1 Préparation Requête

```typescript
export async function sendChatMessage(messages: ChatMessage[], config: ChatConfig) {
  // Extraction dernier message utilisateur
  const lastUserMessage = [...messages]
    .reverse()
    .find(m => m.role === 'user')?.content;

  const userMessage = (lastUserMessage ?? messages[messages.length - 1]?.content ?? '').trim();

  // Génération historique conversation (20 derniers messages)
  const history = messages
    .slice(-20)
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  // Construction requête
  const request = {
    message: userMessage,
    conversation_id: `chat-${Date.now()}`,
    provider: 'auto',             // auto-sélection provider
    model: config.model,
    streaming: false,
    system_prompt: history ? `Contexte conversation (résumé):\n${history}` : undefined,
  };
```

**Données envoyées** :
- `message` : Texte utilisateur (dernier message)
- `conversation_id` : Identifiant unique (`chat-${timestamp}`)
- `provider` : `auto` (laisse backend choisir) ou spécifique
- `streaming` : `false` (mode requête/réponse simple)
- `system_prompt` : Historique 20 derniers messages (contexte)

#### 1.2 Invocation Tauri

```typescript
const raw = await invokeTauriCommand<unknown>(
  'chat_send_message',
  { request },
  { timeout: 30000, retries: 2, retryDelay: 1000 }
);
```

**Paramètres** :
- **Commande** : `chat_send_message`
- **Timeout** : 30s (fixe frontend, override backend adaptatif)
- **Retries** : 2 tentatives
- **Retry Delay** : 1s entre tentatives

#### 1.3 Extraction Réponse

```typescript
const extractChatContent = (response: unknown): string => {
  if (typeof response === 'string') return response;
  if (response?.content) return response.content;
  if (response?.message?.content) return response.message.content;
  return '';
};

return {
  success: true,
  data: extractChatContent(raw.data),
  timestamp: Date.now(),
};
```

**Gestion formats** : Supporte 3 formats de réponse (string directe, `{content}`, `{message: {content}}`).

---

### PHASE 2 — BACKEND (Tauri → Chat Orchestrator)

**Fichier** : [`src-tauri/src/overdrive/chat_orchestrator.rs`](../../src-tauri/src/overdrive/chat_orchestrator.rs) L1-1935

#### 2.1 Commande Tauri

**Fichier** : [`src-tauri/src/main.rs`](../../src-tauri/src/main.rs) L560

```rust
.invoke_handler(tauri::generate_handler![
    // ...
    overdrive::chat_orchestrator::chat_send_message,
    // ...
])
```

#### 2.2 Adaptive Timeout (R02 Fix)

**Fichier** : `chat_orchestrator.rs` L14-39

```rust
const TIMEOUT_QUICK_SECS: u64 = 10;      // <500 chars
const TIMEOUT_STANDARD_SECS: u64 = 30;   // 500-2000 chars
const TIMEOUT_EXTENDED_SECS: u64 = 60;   // >2000 chars
const TIMEOUT_LOCAL_SECS: u64 = 45;      // Ollama/Local

fn calculate_adaptive_timeout(message_length: usize, is_local: bool) -> u64 {
    if is_local {
        return TIMEOUT_LOCAL_SECS;
    }

    if message_length < 500 {
        TIMEOUT_QUICK_SECS
    } else if message_length < 2000 {
        TIMEOUT_STANDARD_SECS
    } else {
        TIMEOUT_EXTENDED_SECS
    }
}
```

**Logique** : Timeout adaptatif selon taille message (10s → 60s).

#### 2.3 Provider Selection

**Providers supportés** (L180-230) :
- **OpenAI** : GPT-4o, GPT-4-turbo, GPT-4
- **Anthropic** : Claude 3.5 Sonnet, Claude 3 Opus/Haiku
- **Google Gemini** : Gemini 1.5 Pro/Flash
- **Ollama Local** : Models locaux (llama3, mistral, etc.)

**Auto-sélection** (`provider: "auto"`) :
1. Vérifie clés API disponibles
2. Test latence providers (ping)
3. Fallback si échec (Ollama → OpenAI → Claude → Gemini)

#### 2.4 Memory Integration (R04 Fix)

**Fichier** : `chat_orchestrator.rs` L143-165

```rust
pub struct ChatOrchestratorState {
    // ...
    pub unified_memory: Arc<RwLock<UnifiedMemory>>,
}

pub fn init() -> ChatOrchestratorState {
    let mut unified_memory = UnifiedMemory::new();
    if let Err(e) = unified_memory.init() {
        eprintln!("[CHAT] ⚠️ UnifiedMemory init failed: {:?}", e);
    } else {
        println!("[CHAT] ✅ UnifiedMemory initialized (STM/MTM/LTM ready)");
    }
    // ...
}
```

**Intégration** :
- **STM (Short-Term Memory)** : Stocke message actuel
- **MTM (Mid-Term Memory)** : Contexte session
- **LTM (Long-Term Memory)** : Mémoire persistante

#### 2.5 AI Generation

**Exemple OpenAI** (L600-700) :

```rust
async fn generate_openai(
    state: &ChatOrchestratorState,
    request: ChatRequest,
) -> Result<ChatMessage, TAPIError> {
    let api_key = state.openai_api_key.read().await
        .clone()
        .ok_or_else(|| TAPIError::Unauthorized("OpenAI API key not set".into()))?;

    // Construction requête HTTP
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&openai_request)
        .send()
        .await?;

    // Extraction contenu
    let content = response_json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("")
        .to_string();

    Ok(ChatMessage {
        id: format!("msg-{}", uuid::Uuid::new_v4()),
        role: "assistant".to_string(),
        content,
        timestamp: chrono::Utc::now().timestamp_millis() as u64,
        provider: "openai".to_string(),
        model: request.model.unwrap_or_else(|| "gpt-4o".to_string()),
        tokens: Some(response_json["usage"]["total_tokens"].as_u64().unwrap_or(0) as u32),
        multimodal: false,
    })
}
```

**Flux** :
1. Récupération clé API (depuis state)
2. HTTP POST → `https://api.openai.com/v1/chat/completions`
3. Extraction réponse JSON
4. Construction `ChatMessage` avec métadonnées

---

### PHASE 3 — RÉPONSE (Backend → Frontend)

#### 3.1 Serialization Rust → JSON

**Fichier** : `chat_orchestrator.rs` L43-58

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatResponse {
    pub message: ChatMessage,
    pub success: bool,
    pub error: Option<String>,
    pub latency_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub role: String,        // "assistant"
    pub content: String,     // Texte généré IA
    pub timestamp: u64,
    pub provider: String,    // "openai", "claude", etc.
    pub model: String,
    pub tokens: Option<u32>,
    pub multimodal: bool,
}
```

#### 3.2 Retour Frontend

**Fichier** : `tauriBridge.ts` L240-250

```typescript
if (!raw.success) {
  return raw as CoreResponse<string>;
}

return {
  success: true,
  data: extractChatContent(raw.data),
  timestamp: Date.now(),
};
```

**Format final** :
```typescript
{
  success: true,
  data: "Réponse IA en texte brut",
  timestamp: 1734271200000
}
```

---

## 🔄 MODES ALTERNATIFS

### Mode Streaming

**Commande** : `chat_stream_message` (L800-1200 `chat_orchestrator.rs`)

**Différences** :
- **Events SSE** : `stream:chunk` émis en temps réel
- **Chunked Response** : Texte généré par morceaux
- **UI Update** : Affichage progressif (typewriter effect)

**Frontend** :
```typescript
// Non implémenté dans tauriBridge actuel
// Nécessite listen() pour events Tauri
```

### Mode Multimodal (Images)

**Support** :
- **Gemini** : ✅ Vision (images base64)
- **GPT-4o** : ✅ Vision
- **Claude** : ✅ Vision (Opus/Sonnet)
- **Ollama** : ⚠️ Certains models (llava)

**Requête** :
```typescript
{
  message: "Décris cette image",
  images: ["data:image/png;base64,..."],
  multimodal: true
}
```

---

## ⚡ OPTIMISATIONS & SÉCURITÉ

### 1. Adaptive Timeout (R02)

**Problème résolu** : Timeout fixe 50s trop élevé.  
**Solution** : 10s (court) → 30s (standard) → 60s (long).

### 2. Retry Logic

**Frontend** : 2 retries, 1s delay  
**Backend** : Provider fallback automatique

### 3. Error Handling

**Cascade** :
1. Frontend catch → Affiche erreur UI
2. Backend catch → Log + return error response
3. Provider unavailable → Fallback autre provider

### 4. Sécurité

**API Keys** :
- Stockées `Arc<RwLock<Option<String>>>` (thread-safe)
- Jamais exposées frontend
- Validation backend avant usage

**Sandbox** :
- Tauri ACL (allowlist commands)
- Pas d'exécution code arbitraire
- HTTPS uniquement (API calls)

---

## 🧪 TESTS & VALIDATION

### Tests Manuels

```bash
# Test provider OpenAI
curl -X POST http://localhost:1420/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "provider": "openai"}'

# Test fallback
# 1. Désactiver clé OpenAI
# 2. Envoyer message
# → Devrait fallback Ollama local
```

### Tests Unitaires

**Rust** :
```rust
#[tokio::test]
async fn test_adaptive_timeout() {
    assert_eq!(calculate_adaptive_timeout(100, false), 10);
    assert_eq!(calculate_adaptive_timeout(1000, false), 30);
    assert_eq!(calculate_adaptive_timeout(3000, false), 60);
}
```

**Frontend** :
```typescript
// src/tests/chat-ia-diagnostic.test.ts
test('sendChatMessage handles errors', async () => {
  const result = await sendChatMessage([], {});
  expect(result.success).toBe(false);
});
```

---

## 📊 MÉTRIQUES & OBSERVABILITÉ

### Logs Backend

```rust
println!("[CHAT] ✅ UnifiedMemory initialized");
println!("[CHAT] 🚀 Sending to OpenAI: {}", request.message);
println!("[CHAT] ✅ Response received ({} ms)", latency);
```

### Logs Frontend

```typescript
console.log(`[TauriBridge] → chat_send_message`, request);
console.log(`[TauriBridge] ← chat_send_message (300ms)`, response);
```

### Métriques Disponibles

```rust
pub struct ChatMemoryStats {
    pub total_messages: usize,
    pub total_conversations: usize,
    pub context_tokens: u32,
    pub stm_entries: usize,
    pub mtm_entries: usize,
    pub ltm_entries: usize,
}

#[tauri::command]
pub async fn chat_get_memory_stats(
    state: State<'_, ChatOrchestratorState>
) -> Result<ChatMemoryStats, String> {
    // R04 FIX: Return UnifiedMemory stats
}
```

---

## 🔗 FICHIERS SOURCES

| Fichier | Lignes | Rôle |
|---------|--------|------|
| [`src/services/tauriBridge.ts`](../../src/services/tauriBridge.ts) | 658 | Wrapper Tauri frontend |
| [`src-tauri/src/overdrive/chat_orchestrator.rs`](../../src-tauri/src/overdrive/chat_orchestrator.rs) | 1935 | Orchestrateur Chat backend |
| [`src-tauri/src/main.rs`](../../src-tauri/src/main.rs) | 711 | Point entrée + invoke_handler |
| [`src-tauri/src/core/mod.rs`](../../src-tauri/src/core/mod.rs) | ? | UnifiedMemory (STM/MTM/LTM) |

---

## 🚀 ÉVOLUTIONS FUTURES

### Phase 3 Roadmap

1. ✅ Mode streaming frontend (actuellement backend only)
2. ✅ Memory retrieval intelligent (RAG sur LTM)
3. ✅ Multi-turn conversations (context window optimisé)
4. ✅ Voice-to-Chat integration (Whisper → Chat → TTS)

---

**Statut** : ✅ Flux documenté factuellement (code v24.2.0)  
**Prochaine étape** : [OMEGA_PIPELINE_DETAILED.md](./OMEGA_PIPELINE_DETAILED.md)

---

*TITANE∞ Documentation Evolution Engine — Phase 2 Architecture*
