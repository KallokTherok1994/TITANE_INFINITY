# 🚀 GUIDE D'INTÉGRATION OVERDRIVE ENGINE

**Date**: 25 novembre 2025
**Version**: TITANE∞ v14.0.0
**Statut**: ⏳ EN ATTENTE

---

## 📊 CONTEXTE

Le système TITANE∞ v14 utilise actuellement **mock_commands.rs** pour le développement frontend. Le véritable backend **Overdrive Engine** existe dans `src-tauri/src/overdrive/` mais n'est pas intégré car il y aurait des conflits de noms de commandes.

### Architecture actuelle (MOCK MODE)

```
Frontend → tauriChatProvider → invoke('chat_send_message') → mock_commands.rs
```

### Architecture future (OVERDRIVE MODE)

```
Frontend → tauriChatProvider → invoke('chat_send_message') → overdrive::chat_orchestrator
```

---

## 🎯 ÉTAPES D'INTÉGRATION

### Étape 1: Supprimer les commandes dupliquées dans mock_commands.rs

**Fichier**: `src-tauri/src/mock_commands.rs`

**Commandes à supprimer** (présentes aussi dans `overdrive/chat_orchestrator.rs`):
- `chat_send_message`
- `chat_get_providers_status`
- `chat_check_providers`
- `chat_create_conversation`
- `chat_get_conversation`
- `chat_delete_conversation`
- `chat_set_gemini_key`
- `chat_stream_message`

**Commandes à garder** (Helios, Memory, Singularity, DevTools, Experience, etc.):
- Toutes les autres commandes mock non liées au Chat IA

---

### Étape 2: Activer le module overdrive dans lib.rs

**Fichier**: `src-tauri/src/lib.rs`

**Avant**:
```rust
pub mod memory_compactor; // ✅ v14 Phase 4: Memory Compactor
pub mod harmonia_engine;  // ✅ v14 Phase 5: Harmonia Engine (CPU Monitoring)
// pub mod overdrive;     // ⏳ v16 Overdrive Engine - TODO
```

**Après**:
```rust
pub mod memory_compactor; // ✅ v14 Phase 4: Memory Compactor
pub mod harmonia_engine;  // ✅ v14 Phase 5: Harmonia Engine (CPU Monitoring)
pub mod overdrive;        // ✅ v16 Overdrive Engine (Chat, Voice, Auto-Heal)
```

---

### Étape 3: Mettre à jour main.rs pour utiliser overdrive

**Fichier**: `src-tauri/src/main.rs`

**Remplacer** (lignes ~173-180):
```rust
// Chat AI - Mock Orchestrator (v18)
mock_commands::chat_send_message,
mock_commands::chat_get_providers_status,
mock_commands::chat_check_providers,
mock_commands::chat_create_conversation,
mock_commands::chat_get_conversation,
mock_commands::chat_delete_conversation,
mock_commands::chat_set_gemini_key,
mock_commands::chat_stream_message,
```

**Par**:
```rust
// Chat AI - Overdrive Real Backend (v16)
overdrive::chat_orchestrator::chat_send_message,
overdrive::chat_orchestrator::chat_get_providers_status,
overdrive::chat_orchestrator::chat_check_providers,
overdrive::chat_orchestrator::chat_create_conversation,
overdrive::chat_orchestrator::chat_get_conversation,
overdrive::chat_orchestrator::chat_delete_conversation,
overdrive::chat_orchestrator::chat_set_gemini_key,
overdrive::chat_orchestrator::chat_stream_message,
overdrive::chat_orchestrator::ai_chat_stream,
overdrive::chat_orchestrator::ai_chat_send,
```

---

### Étape 4: Initialiser OverdriveState dans main.rs

**Ajouter** dans le setup de Tauri (ligne ~90):
```rust
let overdrive_state = crate::overdrive::init();
```

**Ajouter** dans `.manage()`:
```rust
.manage(overdrive_state.chat)
// Ou .manage(overdrive_state) si tous les modules sont utilisés
```

---

### Étape 5: Implémenter les vraies API Gemini et Ollama

**Fichier**: `src-tauri/src/overdrive/chat_orchestrator.rs`

#### A. Gemini API (ligne ~220)

**Avant** (mock):
```rust
async fn send_to_gemini(request: &ChatRequest) -> Result<ChatMessage, String> {
    // Simulé: "Réponse simulée de Gemini"
    Ok(ChatMessage {
        role: "assistant".to_string(),
        content: format!("Réponse simulée de Gemini pour: {}", request.message),
    })
}
```

**Après** (vraie API):
```rust
async fn send_to_gemini(request: &ChatRequest) -> Result<ChatMessage, String> {
    // TODO: Récupérer la clé API depuis l'état ou config
    let api_key = "YOUR_GEMINI_API_KEY"; // À configurer

    let client = reqwest::Client::new();
    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

    let body = serde_json::json!({
        "contents": [{
            "role": "user",
            "parts": [{"text": request.message}]
        }],
        "generationConfig": {
            "temperature": 0.9,
            "maxOutputTokens": 2048,
        }
    });

    let response = client
        .post(url)
        .header("x-goog-api-key", api_key)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Gemini API error: {}", e))?;

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Gemini response: {}", e))?;

    let content = json["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .ok_or("No content in Gemini response")?
        .to_string();

    Ok(ChatMessage {
        role: "assistant".to_string(),
        content,
    })
}
```

---

#### B. Ollama API (ligne ~250)

**Avant** (mock):
```rust
async fn send_to_ollama(request: &ChatRequest) -> Result<ChatMessage, String> {
    // Simulé
    Ok(ChatMessage {
        role: "assistant".to_string(),
        content: format!("Réponse simulée d'Ollama pour: {}", request.message),
    })
}
```

**Après** (vraie API):
```rust
async fn send_to_ollama(request: &ChatRequest) -> Result<ChatMessage, String> {
    let client = reqwest::Client::new();
    let url = "http://localhost:11434/api/generate";

    let model = request.model.as_deref().unwrap_or("llama3.2");

    let body = serde_json::json!({
        "model": model,
        "prompt": request.message,
        "stream": false,
        "options": {
            "temperature": 0.8,
        }
    });

    let response = client
        .post(url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Ollama API error: {}", e))?;

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    let content = json["response"]
        .as_str()
        .ok_or("No response from Ollama")?
        .to_string();

    Ok(ChatMessage {
        role: "assistant".to_string(),
        content,
    })
}
```

---

### Étape 6: Configuration de la clé API Gemini

**Options**:

1. **Variable d'environnement** (recommandé):
```rust
use std::env;
let api_key = env::var("GEMINI_API_KEY")
    .map_err(|_| "GEMINI_API_KEY not set")?;
```

2. **Fichier de configuration**:
```rust
// Dans un fichier config.json:
{
  "gemini_api_key": "YOUR_KEY_HERE"
}
```

3. **Commande Tauri pour définir la clé**:
```rust
// Utiliser chat_set_gemini_key() déjà existant
```

---

### Étape 7: Tests

#### A. Vérifier compilation
```bash
cd src-tauri
cargo check
```

#### B. Tester les commandes
```bash
cargo tauri dev
```

#### C. Frontend - Tester via DevTools
```javascript
// Console du navigateur
await window.__TAURI__.core.invoke('chat_send_message', {
  request: {
    message: "Hello Gemini!",
    provider: "gemini",
    conversation_id: null,
    model: null,
    streaming: false,
    images: null,
    system_prompt: null
  }
});
```

---

## 📋 CHECKLIST D'INTÉGRATION

- [ ] Supprimer commandes dupliquées de `mock_commands.rs`
- [ ] Activer `pub mod overdrive` dans `lib.rs`
- [ ] Remplacer imports mock par overdrive dans `main.rs`
- [ ] Initialiser `OverdriveState` dans `main.rs`
- [ ] Implémenter vraie API Gemini dans `send_to_gemini()`
- [ ] Implémenter vraie API Ollama dans `send_to_ollama()`
- [ ] Configurer clé API Gemini (env var ou config)
- [ ] Tester compilation (`cargo check`)
- [ ] Tester en mode dev (`cargo tauri dev`)
- [ ] Valider cascade providers (gemini → ollama → local)
- [ ] Tester fallback automatique si Gemini offline
- [ ] Valider streaming (si implémenté)

---

## ⚠️ PRÉCAUTIONS

### Conflits de noms
- Ne PAS activer `overdrive` tant que `mock_commands` contient les mêmes commandes
- Supprimer TOUTES les commandes Chat de `mock_commands.rs` AVANT d'activer `overdrive`

### Dépendances
- Vérifier que `reqwest = { version = "0.11", features = ["json"] }` est dans `Cargo.toml`
- Vérifier que `serde_json` est disponible

### État
- `ChatOrchestratorState` doit être passé à toutes les commandes via `State<'_, ChatOrchestratorState>`
- Initialiser l'état AVANT d'enregistrer les commandes

---

## 🎯 BÉNÉFICES DE L'INTÉGRATION

### Actuellement (Mock Mode)
- ✅ Frontend développement rapide
- ✅ Pas de dépendance API externes
- ❌ Pas de vraies réponses IA
- ❌ Pas de cascade providers

### Après intégration (Overdrive Mode)
- ✅ Vraies API Gemini et Ollama
- ✅ Cascade automatique (failover)
- ✅ Streaming token-par-token (si implémenté)
- ✅ Gestion des conversations
- ✅ Historique et mémoire
- ✅ Fallback local garanti

---

## 📞 SUPPORT

Si problèmes lors de l'intégration:

1. Vérifier les logs Rust: `cargo tauri dev` dans terminal
2. Vérifier les logs frontend: DevTools → Console
3. Tester commandes individuellement via DevTools
4. Rollback vers mock_commands si nécessaire

---

*Guide créé automatiquement par GitHub Copilot (Claude Sonnet 4.5)*
*TITANE_INFINITY v14.0.0 — 25 novembre 2025*
