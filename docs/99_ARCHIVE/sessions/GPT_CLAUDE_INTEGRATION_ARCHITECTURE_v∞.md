# 🔥 INTÉGRATION GPT + CLAUDE v∞ — ARCHITECTURE COMPLÈTE

**TITANE∞ v∞.19.3Ω — Singularity Architecture**
**Date**: 4 décembre 2025
**Status**: Architecture complète prête pour implémentation

---

## 🅐 ARCHITECTURE GLOBALE

### Arborescence Finale

```
/src-tauri/src/
├── ia/
│   ├── mod.rs                    [✅ EXISTANT - à étendre]
│   ├── titane_local.rs           [✅ EXISTANT]
│   ├── gemini.rs                 [✅ EXISTANT]
│   ├── openai_gpt.rs             [🆕 NOUVEAU]
│   ├── anthropic_claude.rs       [🆕 NOUVEAU]
│   └── ia_engine.rs              [🆕 NOUVEAU - Unified Engine]
├── security/
│   ├── secrets_engine.rs         [✅ EXISTANT - à étendre]
│   └── api_key_validator.rs     [🆕 NOUVEAU]
├── commands/
│   └── ia_commands.rs            [🆕 NOUVEAU]
├── conversation_engine/
│   ├── mod.rs                    [✅ EXISTANT - à étendre]
│   ├── pipeline.rs               [✅ EXISTANT - à étendre]
│   └── providers.rs              [✅ EXISTANT - à étendre]
└── singularity/
    └── singularity_state.rs      [✅ EXISTANT - à étendre]

/src/
├── services/
│   ├── ia/
│   │   ├── ia.types.ts           [🆕 NOUVEAU]
│   │   ├── ia.selector.ts        [🆕 NOUVEAU]
│   │   └── ia.api.ts             [🆕 NOUVEAU]
│   └── tauri/
│       └── iaCommands.ts         [🆕 NOUVEAU]
├── components/
│   └── security/
│       ├── SecurityPanel.tsx     [🆕 NOUVEAU]
│       ├── AddAPIKeyModal.tsx    [🆕 NOUVEAU]
│       └── APIKeyManager.tsx     [🆕 NOUVEAU]
└── pages/
    └── SecurityPage.tsx          [🆕 NOUVEAU]
```

---

## 🅑 SECURESECRETSENGINE v∞ (Extension GPT + Claude)

### Modifications Required

**Fichier**: `src-tauri/src/security/secrets_engine.rs`

```rust
// ═══════════════════════════════════════════════════════════════
// Extension: Support OpenAI + Claude API Keys
// ═══════════════════════════════════════════════════════════════

// KEYS CONSTANTS
pub const KEY_OPENAI: &str = "openai_api_key";
pub const KEY_CLAUDE: &str = "claude_api_key";
pub const KEY_GEMINI: &str = "gemini_api_key";

impl SecureSecretsEngine {
    /// Set OpenAI API key
    pub fn set_openai_key(&self, key: String) -> Result<(), SecretsError> {
        self.validate_api_key(&key, "openai")?;
        self.set_secret(KEY_OPENAI, key)
    }

    /// Get OpenAI API key
    pub fn get_openai_key(&self) -> Result<Option<String>, SecretsError> {
        self.get_secret(KEY_OPENAI)
    }

    /// Set Claude API key
    pub fn set_claude_key(&self, key: String) -> Result<(), SecretsError> {
        self.validate_api_key(&key, "claude")?;
        self.set_secret(KEY_CLAUDE, key)
    }

    /// Get Claude API key
    pub fn get_claude_key(&self) -> Result<Option<String>, SecretsError> {
        self.get_secret(KEY_CLAUDE)
    }

    /// Validate API key format
    fn validate_api_key(&self, key: &str, provider: &str) -> Result<(), SecretsError> {
        if key.trim().is_empty() {
            return Err(SecretsError::InvalidKey("Empty key".into()));
        }

        match provider {
            "openai" => {
                // sk-proj-... ou sk-...
                if !key.starts_with("sk-") {
                    return Err(SecretsError::InvalidKey(
                        "OpenAI key must start with 'sk-'".into()
                    ));
                }
                if key.len() < 40 {
                    return Err(SecretsError::InvalidKey(
                        "OpenAI key too short".into()
                    ));
                }
            }
            "claude" => {
                // sk-ant-...
                if !key.starts_with("sk-ant-") {
                    return Err(SecretsError::InvalidKey(
                        "Claude key must start with 'sk-ant-'".into()
                    ));
                }
                if key.len() < 50 {
                    return Err(SecretsError::InvalidKey(
                        "Claude key too short".into()
                    ));
                }
            }
            "gemini" => {
                if key.len() < 30 {
                    return Err(SecretsError::InvalidKey(
                        "Gemini key too short".into()
                    ));
                }
            }
            _ => {}
        }

        Ok(())
    }

    /// List configured AI providers
    pub fn list_ai_providers(&self) -> Result<Vec<String>, SecretsError> {
        let mut providers = Vec::new();

        if self.get_secret(KEY_GEMINI)?.is_some() {
            providers.push("gemini".to_string());
        }
        if self.get_secret(KEY_OPENAI)?.is_some() {
            providers.push("openai".to_string());
        }
        if self.get_secret(KEY_CLAUDE)?.is_some() {
            providers.push("claude".to_string());
        }

        Ok(providers)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum SecretsError {
    // ... existing variants
    #[error("Invalid API key: {0}")]
    InvalidKey(String),
}
```

---

## 🅒 API RUST (OpenAI + Anthropic)

### 1. OpenAI GPT Module

**Fichier**: `src-tauri/src/ia/openai_gpt.rs`

```rust
// ═══════════════════════════════════════════════════════════════
// TITANE∞ v∞ — OpenAI GPT Integration
// Secure API calls with streaming support
// ═══════════════════════════════════════════════════════════════

use log::{debug, error, info, warn};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::time::Instant;
use tokio::sync::mpsc;

const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL: &str = "gpt-4o";  // GPT-4.1 Turbo
const MAX_TOKENS: usize = 4096;
const MAX_CONTEXT_LENGTH: usize = 50000;  // ~50k chars

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenAIRequest {
    pub message: String,
    pub history: Vec<ChatMessage>,
    pub system_prompt: Option<String>,
    pub temperature: f32,
    pub max_tokens: Option<usize>,
    pub model: Option<String>,
    pub stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,  // "user" | "assistant" | "system"
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenAIResponse {
    pub content: String,
    pub model: String,
    pub tokens_used: usize,
    pub finish_reason: String,
    pub latency_ms: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIAPIRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: Option<usize>,
    stream: bool,
}

#[derive(Debug, Deserialize)]
struct OpenAIAPIResponse {
    choices: Vec<Choice>,
    usage: Usage,
    model: String,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: ChatMessage,
    finish_reason: String,
}

#[derive(Debug, Deserialize)]
struct Usage {
    total_tokens: usize,
}

pub struct OpenAIClient {
    api_key: String,
    client: Client,
}

impl OpenAIClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
        }
    }

    /// Generate response (non-streaming)
    pub async fn generate(&self, request: OpenAIRequest) -> Result<OpenAIResponse, String> {
        let start = Instant::now();

        // Validate and truncate context
        let sanitized_message = self.sanitize_input(&request.message)?;
        let truncated_history = self.truncate_history(&request.history);

        // Build messages array
        let mut messages = Vec::new();

        // System prompt
        if let Some(sys_prompt) = &request.system_prompt {
            messages.push(ChatMessage {
                role: "system".to_string(),
                content: sys_prompt.clone(),
            });
        }

        // History
        messages.extend(truncated_history);

        // User message
        messages.push(ChatMessage {
            role: "user".to_string(),
            content: sanitized_message,
        });

        let api_request = OpenAIAPIRequest {
            model: request.model.unwrap_or(DEFAULT_MODEL.to_string()),
            messages,
            temperature: request.temperature.clamp(0.0, 2.0),
            max_tokens: request.max_tokens.or(Some(MAX_TOKENS)),
            stream: false,
        };

        debug!("[OpenAI] Sending request to API...");

        let response = self.client
            .post(OPENAI_API_URL)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&api_request)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            error!("[OpenAI] API error {}: {}", status, error_text);
            return Err(format!("API error {}: {}", status, error_text));
        }

        let api_response: OpenAIAPIResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        let latency = start.elapsed().as_millis() as u64;

        let choice = api_response.choices.first()
            .ok_or("No choices in response")?;

        info!("[OpenAI] Response received ({} tokens, {} ms)",
            api_response.usage.total_tokens, latency);

        Ok(OpenAIResponse {
            content: choice.message.content.clone(),
            model: api_response.model,
            tokens_used: api_response.usage.total_tokens,
            finish_reason: choice.finish_reason.clone(),
            latency_ms: latency,
        })
    }

    /// Generate response with streaming
    pub async fn generate_stream(
        &self,
        request: OpenAIRequest,
        sender: mpsc::Sender<String>,
    ) -> Result<OpenAIResponse, String> {
        // TODO: Implement streaming with Server-Sent Events (SSE)
        // For now, fallback to non-streaming
        warn!("[OpenAI] Streaming not yet implemented, using non-streaming");
        self.generate(request).await
    }

    /// Sanitize user input (CRITICAL)
    fn sanitize_input(&self, message: &str) -> Result<String, String> {
        if message.trim().is_empty() {
            return Err("Empty message".into());
        }

        if message.len() > MAX_CONTEXT_LENGTH {
            warn!("[OpenAI] Truncating message from {} to {} chars",
                message.len(), MAX_CONTEXT_LENGTH);
            Ok(message.chars().take(MAX_CONTEXT_LENGTH).collect())
        } else {
            Ok(message.trim().to_string())
        }
    }

    /// Truncate history to fit context window
    fn truncate_history(&self, history: &[ChatMessage]) -> Vec<ChatMessage> {
        let mut total_chars = 0;
        let mut result = Vec::new();

        // Reverse order to keep most recent messages
        for msg in history.iter().rev() {
            let msg_len = msg.content.len();
            if total_chars + msg_len > MAX_CONTEXT_LENGTH / 2 {
                break;
            }
            total_chars += msg_len;
            result.push(msg.clone());
        }

        result.reverse();
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_input() {
        let client = OpenAIClient::new("test_key".to_string());

        // Empty message
        assert!(client.sanitize_input("").is_err());
        assert!(client.sanitize_input("   ").is_err());

        // Valid message
        let result = client.sanitize_input("Hello, world!").unwrap();
        assert_eq!(result, "Hello, world!");

        // Long message truncation
        let long_msg = "a".repeat(MAX_CONTEXT_LENGTH + 1000);
        let result = client.sanitize_input(&long_msg).unwrap();
        assert_eq!(result.len(), MAX_CONTEXT_LENGTH);
    }
}
```

### 2. Anthropic Claude Module

**Fichier**: `src-tauri/src/ia/anthropic_claude.rs`

```rust
// ═══════════════════════════════════════════════════════════════
// TITANE∞ v∞ — Anthropic Claude Integration
// Secure API calls with Messages API v1
// ═══════════════════════════════════════════════════════════════

use log::{debug, error, info, warn};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::time::Instant;
use tokio::sync::mpsc;

const CLAUDE_API_URL: &str = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL: &str = "claude-3-5-sonnet-20241022";  // Claude 3.5 Sonnet
const MAX_TOKENS: usize = 4096;
const MAX_CONTEXT_LENGTH: usize = 100000;  // Claude supports 200k context

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeRequest {
    pub message: String,
    pub history: Vec<ClaudeMessage>,
    pub system_prompt: Option<String>,
    pub temperature: f32,
    pub max_tokens: Option<usize>,
    pub model: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClaudeMessage {
    pub role: String,  // "user" | "assistant"
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeResponse {
    pub content: String,
    pub model: String,
    pub tokens_input: usize,
    pub tokens_output: usize,
    pub stop_reason: String,
    pub latency_ms: u64,
}

#[derive(Debug, Serialize)]
struct ClaudeAPIRequest {
    model: String,
    messages: Vec<ClaudeMessage>,
    system: Option<String>,
    temperature: f32,
    max_tokens: usize,
}

#[derive(Debug, Deserialize)]
struct ClaudeAPIResponse {
    content: Vec<ContentBlock>,
    model: String,
    stop_reason: String,
    usage: ClaudeUsage,
}

#[derive(Debug, Deserialize)]
struct ContentBlock {
    #[serde(rename = "type")]
    block_type: String,
    text: String,
}

#[derive(Debug, Deserialize)]
struct ClaudeUsage {
    input_tokens: usize,
    output_tokens: usize,
}

pub struct ClaudeClient {
    api_key: String,
    client: Client,
}

impl ClaudeClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
        }
    }

    /// Generate response
    pub async fn generate(&self, request: ClaudeRequest) -> Result<ClaudeResponse, String> {
        let start = Instant::now();

        // Validate and sanitize
        let sanitized_message = self.sanitize_input(&request.message)?;
        let truncated_history = self.truncate_history(&request.history);

        // Build messages array (Claude requires alternating user/assistant)
        let mut messages = truncated_history;
        messages.push(ClaudeMessage {
            role: "user".to_string(),
            content: sanitized_message,
        });

        let api_request = ClaudeAPIRequest {
            model: request.model.unwrap_or(DEFAULT_MODEL.to_string()),
            messages,
            system: request.system_prompt,
            temperature: request.temperature.clamp(0.0, 1.0),
            max_tokens: request.max_tokens.unwrap_or(MAX_TOKENS),
        };

        debug!("[Claude] Sending request to API...");

        let response = self.client
            .post(CLAUDE_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(&api_request)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            error!("[Claude] API error {}: {}", status, error_text);
            return Err(format!("API error {}: {}", status, error_text));
        }

        let api_response: ClaudeAPIResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        let latency = start.elapsed().as_millis() as u64;

        let content = api_response.content.first()
            .ok_or("No content blocks in response")?;

        info!("[Claude] Response received ({} in, {} out tokens, {} ms)",
            api_response.usage.input_tokens,
            api_response.usage.output_tokens,
            latency);

        Ok(ClaudeResponse {
            content: content.text.clone(),
            model: api_response.model,
            tokens_input: api_response.usage.input_tokens,
            tokens_output: api_response.usage.output_tokens,
            stop_reason: api_response.stop_reason,
            latency_ms: latency,
        })
    }

    /// Sanitize user input
    fn sanitize_input(&self, message: &str) -> Result<String, String> {
        if message.trim().is_empty() {
            return Err("Empty message".into());
        }

        if message.len() > MAX_CONTEXT_LENGTH {
            warn!("[Claude] Truncating message from {} to {} chars",
                message.len(), MAX_CONTEXT_LENGTH);
            Ok(message.chars().take(MAX_CONTEXT_LENGTH).collect())
        } else {
            Ok(message.trim().to_string())
        }
    }

    /// Truncate and validate history (Claude requires alternating roles)
    fn truncate_history(&self, history: &[ClaudeMessage]) -> Vec<ClaudeMessage> {
        let mut total_chars = 0;
        let mut result = Vec::new();

        for msg in history.iter().rev() {
            let msg_len = msg.content.len();
            if total_chars + msg_len > MAX_CONTEXT_LENGTH / 2 {
                break;
            }
            total_chars += msg_len;
            result.push(msg.clone());
        }

        result.reverse();

        // Ensure alternating user/assistant roles
        self.ensure_alternating_roles(result)
    }

    /// Ensure messages alternate between user and assistant
    fn ensure_alternating_roles(&self, messages: Vec<ClaudeMessage>) -> Vec<ClaudeMessage> {
        let mut result = Vec::new();
        let mut last_role: Option<String> = None;

        for msg in messages {
            if let Some(ref last) = last_role {
                if last == &msg.role {
                    // Skip duplicate role
                    warn!("[Claude] Skipping duplicate {} message", msg.role);
                    continue;
                }
            }
            last_role = Some(msg.role.clone());
            result.push(msg);
        }

        // Must start with user message
        if !result.is_empty() && result[0].role == "assistant" {
            result.remove(0);
        }

        result
    }
}
```

---

## 🅓 UNIFIED IA ENGINE v∞

**Fichier**: `src-tauri/src/ia/ia_engine.rs`

```rust
// ═══════════════════════════════════════════════════════════════
// TITANE∞ v∞ — Unified IA Engine
// Central orchestration: Gemini + OpenAI + Claude + Local
// ═══════════════════════════════════════════════════════════════

use super::anthropic_claude::{ClaudeClient, ClaudeRequest};
use super::openai_gpt::{OpenAIClient, OpenAIRequest};
use crate::security::secrets_engine::SecureSecretsEngine;
use log::{debug, error, info, warn};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IAEngine {
    TitaneLocal,
    Gemini,
    OpenAI,
    Claude,
}

impl IAEngine {
    pub fn as_str(&self) -> &str {
        match self {
            IAEngine::TitaneLocal => "titane_local",
            IAEngine::Gemini => "gemini",
            IAEngine::OpenAI => "openai",
            IAEngine::Claude => "claude",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "titane_local" | "local" => Some(IAEngine::TitaneLocal),
            "gemini" => Some(IAEngine::Gemini),
            "openai" | "gpt" => Some(IAEngine::OpenAI),
            "claude" | "anthropic" => Some(IAEngine::Claude),
            _ => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UnifiedIARequest {
    pub message: String,
    pub history: Vec<UnifiedMessage>,
    pub system_prompt: Option<String>,
    pub temperature: f32,
    pub max_tokens: Option<usize>,
    pub preferred_engine: Option<IAEngine>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnifiedMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UnifiedIAResponse {
    pub content: String,
    pub engine_used: IAEngine,
    pub model: String,
    pub tokens_used: usize,
    pub latency_ms: u64,
    pub fallback_used: bool,
}

pub struct UnifiedIAEngine {
    secrets: Arc<SecureSecretsEngine>,
    gemini_client: Arc<RwLock<Option</* GeminiClient */>>>,
    openai_client: Arc<RwLock<Option<OpenAIClient>>>,
    claude_client: Arc<RwLock<Option<ClaudeClient>>>,
}

impl UnifiedIAEngine {
    pub fn new(secrets: Arc<SecureSecretsEngine>) -> Self {
        Self {
            secrets,
            gemini_client: Arc::new(RwLock::new(None)),
            openai_client: Arc::new(RwLock::new(None)),
            claude_client: Arc::new(RwLock::new(None)),
        }
    }

    /// Initialize all available engines based on API keys
    pub async fn initialize(&self) -> Result<Vec<IAEngine>, String> {
        let mut available = Vec::new();

        // Check OpenAI
        if let Ok(Some(key)) = self.secrets.get_openai_key() {
            let client = OpenAIClient::new(key);
            *self.openai_client.write().await = Some(client);
            available.push(IAEngine::OpenAI);
            info!("[UnifiedIA] OpenAI initialized");
        }

        // Check Claude
        if let Ok(Some(key)) = self.secrets.get_claude_key() {
            let client = ClaudeClient::new(key);
            *self.claude_client.write().await = Some(client);
            available.push(IAEngine::Claude);
            info!("[UnifiedIA] Claude initialized");
        }

        // Check Gemini
        if let Ok(Some(_key)) = self.secrets.get_secret("gemini_api_key") {
            available.push(IAEngine::Gemini);
            info!("[UnifiedIA] Gemini initialized");
        }

        // Local always available
        available.push(IAEngine::TitaneLocal);

        info!("[UnifiedIA] {} engines available", available.len());
        Ok(available)
    }

    /// Generate response with automatic fallback
    pub async fn generate(&self, request: UnifiedIARequest) -> Result<UnifiedIAResponse, String> {
        let engines = self.get_fallback_chain(request.preferred_engine);

        debug!("[UnifiedIA] Fallback chain: {:?}", engines);

        for (idx, engine) in engines.iter().enumerate() {
            let is_fallback = idx > 0;

            match self.try_engine(engine, &request).await {
                Ok(response) => {
                    if is_fallback {
                        warn!("[UnifiedIA] Fallback to {} succeeded", engine.as_str());
                    }
                    return Ok(UnifiedIAResponse {
                        content: response.content,
                        engine_used: engine.clone(),
                        model: response.model,
                        tokens_used: response.tokens_used,
                        latency_ms: response.latency_ms,
                        fallback_used: is_fallback,
                    });
                }
                Err(e) => {
                    error!("[UnifiedIA] {} failed: {}", engine.as_str(), e);
                    if idx == engines.len() - 1 {
                        return Err(format!("All engines failed. Last error: {}", e));
                    }
                }
            }
        }

        Err("No engines available".into())
    }

    /// Try a specific engine
    async fn try_engine(
        &self,
        engine: &IAEngine,
        request: &UnifiedIARequest,
    ) -> Result<EngineResponse, String> {
        match engine {
            IAEngine::OpenAI => self.call_openai(request).await,
            IAEngine::Claude => self.call_claude(request).await,
            IAEngine::Gemini => self.call_gemini(request).await,
            IAEngine::TitaneLocal => self.call_local(request).await,
        }
    }

    /// OpenAI GPT call
    async fn call_openai(&self, request: &UnifiedIARequest) -> Result<EngineResponse, String> {
        let client_guard = self.openai_client.read().await;
        let client = client_guard
            .as_ref()
            .ok_or("OpenAI client not initialized")?;

        let openai_req = OpenAIRequest {
            message: request.message.clone(),
            history: request.history.iter().map(|m| super::openai_gpt::ChatMessage {
                role: m.role.clone(),
                content: m.content.clone(),
            }).collect(),
            system_prompt: request.system_prompt.clone(),
            temperature: request.temperature,
            max_tokens: request.max_tokens,
            model: None,
            stream: false,
        };

        let response = client.generate(openai_req).await?;

        Ok(EngineResponse {
            content: response.content,
            model: response.model,
            tokens_used: response.tokens_used,
            latency_ms: response.latency_ms,
        })
    }

    /// Claude call
    async fn call_claude(&self, request: &UnifiedIARequest) -> Result<EngineResponse, String> {
        let client_guard = self.claude_client.read().await;
        let client = client_guard
            .as_ref()
            .ok_or("Claude client not initialized")?;

        let claude_req = ClaudeRequest {
            message: request.message.clone(),
            history: request.history.iter().map(|m| super::anthropic_claude::ClaudeMessage {
                role: m.role.clone(),
                content: m.content.clone(),
            }).collect(),
            system_prompt: request.system_prompt.clone(),
            temperature: request.temperature,
            max_tokens: request.max_tokens,
            model: None,
        };

        let response = client.generate(claude_req).await?;

        Ok(EngineResponse {
            content: response.content,
            model: response.model,
            tokens_used: response.tokens_input + response.tokens_output,
            latency_ms: response.latency_ms,
        })
    }

    /// Gemini call (stub - use existing implementation)
    async fn call_gemini(&self, _request: &UnifiedIARequest) -> Result<EngineResponse, String> {
        // TODO: Call existing Gemini client
        Err("Gemini integration pending".into())
    }

    /// Local call (stub - use existing Ollama/Llama)
    async fn call_local(&self, request: &UnifiedIARequest) -> Result<EngineResponse, String> {
        // Emergency fallback
        Ok(EngineResponse {
            content: format!("Local emergency response: {}", request.message),
            model: "titane-local".to_string(),
            tokens_used: 50,
            latency_ms: 10,
        })
    }

    /// Get fallback chain based on preference
    fn get_fallback_chain(&self, preferred: Option<IAEngine>) -> Vec<IAEngine> {
        match preferred {
            Some(engine) => vec![
                engine.clone(),
                IAEngine::Claude,
                IAEngine::OpenAI,
                IAEngine::Gemini,
                IAEngine::TitaneLocal,
            ].into_iter()
             .filter(|e| e != &engine)
             .collect::<Vec<_>>()
             .into_iter()
             .take(4)
             .chain(std::iter::once(engine))
             .collect(),
            None => vec![
                IAEngine::Claude,
                IAEngine::OpenAI,
                IAEngine::Gemini,
                IAEngine::TitaneLocal,
            ],
        }
    }
}

#[derive(Debug)]
struct EngineResponse {
    content: String,
    model: String,
    tokens_used: usize,
    latency_ms: u64,
}
```

---

## 🅔 INTÉGRATION CHATENGINE v∞

### Modifications Required

**Fichier**: `src-tauri/src/conversation_engine/pipeline.rs`

Ajouter support OpenAI + Claude dans `build_prompt`:

```rust
// Dans build_prompt(), ajouter validation provider:
let provider_hint = match ai_config.as_ref().map(|c| c.provider_preference) {
    Some(ProviderPreference::Gemini) => "\nProvider: Gemini",
    Some(ProviderPreference::Ollama) => "\nProvider: Ollama",
    Some(ProviderPreference::OpenAI) => "\nProvider: OpenAI (GPT)",
    Some(ProviderPreference::Claude) => "\nProvider: Claude (Anthropic)",
    Some(ProviderPreference::Local) => "\nProvider: TITANE Local",
    _ => "",
};
```

**Fichier**: `src-tauri/src/conversation_engine/types.rs`

Étendre `ProviderPreference`:

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProviderPreference {
    Auto,
    Gemini,
    Ollama,
    OpenAI,      // NEW
    Claude,      // NEW
    Local,
}
```

---

## 🅕 INTÉGRATION MULTI-AGENTS v∞

**Fichier**: `src-tauri/src/multi_agents/orchestrator.rs` (à créer si absent)

```rust
// Agents autorisés à utiliser IA externe
pub enum AgentIAPermission {
    NoExternal,           // Uniquement local
    OpenAIOnly,           // Code, logique, outils
    ClaudeOnly,           // Analyse, structuration
    GeminiOnly,           // Creative, traduction
    AllExternal,          // Admin/debug
}

impl Agent {
    pub fn ia_permission(&self) -> AgentIAPermission {
        match self.role {
            AgentRole::CodeGenerator => AgentIAPermission::OpenAIOnly,
            AgentRole::Analyst => AgentIAPermission::ClaudeOnly,
            AgentRole::Creative => AgentIAPermission::GeminiOnly,
            AgentRole::Security => AgentIAPermission::NoExternal,
            _ => AgentIAPermission::AllExternal,
        }
    }
}
```

---

## 🅖 MISE À JOUR SINGULARITYENGINE v∞

**Fichier**: `src-tauri/src/singularity/singularity_state.rs`

Ajouter contexte IA:

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IAContext {
    pub active_engine: Option<String>,          // "openai" | "claude" | "gemini" | "local"
    pub available_engines: Vec<String>,
    pub status: IAStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IAStatus {
    Ready { engine: String },
    MissingKey { engine: String },
    Disabled,
    Error { message: String },
}

impl SingularityState {
    pub fn update_ia_context(&mut self, context: IAContext) {
        // Propagation douce vers UI
        self.ia_context = context;
        self.last_sync_ms = current_timestamp();
    }
}
```

---

## 🅗 UI SÉCURITÉ (Gestion Clés API)

### Component: SecurityPanel

**Fichier**: `src/components/security/SecurityPanel.tsx`

```typescript
/**
 * TITANE∞ v∞ — Security Panel
 * Gestion sécurisée des clés API IA
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AddAPIKeyModal } from './AddAPIKeyModal';

interface APIKeyStatus {
  service: 'gemini' | 'openai' | 'claude';
  name: string;
  icon: string;
  active: boolean;
  valid: boolean;
  lastTest?: Date;
}

export const SecurityPanel: React.FC = () => {
  const [keys, setKeys] = useState<APIKeyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const providers = await invoke<string[]>('list_ai_providers');

      const allServices = ['gemini', 'openai', 'claude'];
      const statuses: APIKeyStatus[] = allServices.map(service => ({
        service: service as 'gemini' | 'openai' | 'claude',
        name: {
          gemini: 'Google Gemini',
          openai: 'OpenAI GPT',
          claude: 'Anthropic Claude',
        }[service],
        icon: {
          gemini: '🔷',
          openai: '🟢',
          claude: '🟣',
        }[service],
        active: providers.includes(service),
        valid: providers.includes(service),
      }));

      setKeys(statuses);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = (service: string) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const handleDeleteKey = async (service: string) => {
    if (!confirm(`Supprimer la clé ${service} ?`)) return;

    try {
      await invoke('delete_api_key', { service });
      await loadKeys();
    } catch (err) {
      console.error('Failed to delete key:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleTestKey = async (service: string) => {
    try {
      const result = await invoke<boolean>('test_api_key', { service });
      alert(result ? '✅ Clé valide' : '❌ Clé invalide');
      await loadKeys();
    } catch (err) {
      alert('❌ Échec du test');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="security-panel">
      <h2>🔐 Gestion des Clés API IA</h2>

      <div className="keys-grid">
        {keys.map(key => (
          <div key={key.service} className={`key-card ${key.active ? 'active' : 'inactive'}`}>
            <div className="key-header">
              <span className="key-icon">{key.icon}</span>
              <span className="key-name">{key.name}</span>
              <span className={`key-status ${key.active ? 'active' : 'inactive'}`}>
                {key.active ? '✅ Configurée' : '⚠️ Absente'}
              </span>
            </div>

            <div className="key-actions">
              {!key.active ? (
                <button onClick={() => handleAddKey(key.service)}>
                  Ajouter
                </button>
              ) : (
                <>
                  <button onClick={() => handleTestKey(key.service)}>
                    Tester
                  </button>
                  <button onClick={() => handleDeleteKey(key.service)} className="danger">
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <AddAPIKeyModal
          service={selectedService!}
          onClose={() => {
            setModalOpen(false);
            loadKeys();
          }}
        />
      )}
    </div>
  );
};
```

---

## 🅘 SÉCURITÉ : RÈGLES & INVARIANTS

### Invariants Critiques

1. **Jamais de clés en frontend** : Toutes les clés restent dans SecureSecretsEngine (Rust)
2. **Jamais de SingularityState brut vers IA externe** : Filtre strict via `filter_context_for_ia()`
3. **Sandbox contexte** : Max 50k chars pour OpenAI, 100k pour Claude
4. **Rate limiting** : ImmuneEngine bloque si > 100 requêtes/min
5. **Audit logs FR** : Tous appels IA loggés (`[OpenAI]`, `[Claude]`, `[Gemini]`)

### Protection ImmuneEngine

```rust
// src-tauri/src/immune_engine/mod.rs

impl ImmuneEngine {
    pub fn check_ia_request(&mut self, request: &IARequest) -> Result<(), String> {
        // Check context size
        if request.message.len() > 100_000 {
            return Err("Context too large (max 100k chars)".into());
        }

        // Check rate limit
        if self.ia_requests_last_minute > 100 {
            return Err("Rate limit exceeded (100 req/min)".into());
        }

        // Check for sensitive data
        if self.contains_secrets(&request.message) {
            return Err("Sensitive data detected in prompt".into());
        }

        Ok(())
    }

    fn contains_secrets(&self, text: &str) -> bool {
        let patterns = vec![
            r"sk-[a-zA-Z0-9]{20,}",           // API keys
            r"Bearer [a-zA-Z0-9]+",            // Tokens
            r"password\s*[:=]\s*\S+",          // Passwords
            r"\d{16}",                         // Credit cards
        ];

        for pattern in patterns {
            if regex::Regex::new(pattern).unwrap().is_match(text) {
                return true;
            }
        }

        false
    }
}
```

---

## 🅙 TESTS COMPLETS

### Test Rust: API Keys

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_openai_key() {
        let engine = SecureSecretsEngine::new(None).unwrap();

        // Valid
        assert!(engine.validate_api_key("sk-proj-abc123...xyz", "openai").is_ok());

        // Invalid prefix
        assert!(engine.validate_api_key("invalid-key", "openai").is_err());

        // Too short
        assert!(engine.validate_api_key("sk-abc", "openai").is_err());
    }

    #[test]
    fn test_validate_claude_key() {
        let engine = SecureSecretsEngine::new(None).unwrap();

        // Valid
        assert!(engine.validate_api_key("sk-ant-api03-abc123...xyz", "claude").is_ok());

        // Invalid prefix
        assert!(engine.validate_api_key("sk-abc", "claude").is_err());
    }

    #[tokio::test]
    async fn test_fallback_chain() {
        let secrets = Arc::new(SecureSecretsEngine::new(None).unwrap());
        let engine = UnifiedIAEngine::new(secrets);

        let chain = engine.get_fallback_chain(Some(IAEngine::OpenAI));

        assert_eq!(chain[0], IAEngine::OpenAI);
        assert_eq!(chain.last(), Some(&IAEngine::TitaneLocal));
    }
}
```

### Test Stress: 100 req/min

```bash
#!/bin/bash
# stress_test_ia.sh

echo "🔥 TITANE∞ - Stress Test IA (100 req/min)"

for i in {1..100}; do
  curl -X POST http://localhost:5173/api/ia/generate \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Test $i\", \"engine\": \"auto\"}" \
    &
done

wait
echo "✅ Stress test complete"
```

---

## 📊 ÉTAT D'IMPLÉMENTATION

| Composant | Status | Fichiers | Tests |
|-----------|--------|----------|-------|
| SecureSecretsEngine | 🟡 50% | `secrets_engine.rs` | ⬜ |
| OpenAI Client | ⬜ 0% | `openai_gpt.rs` | ⬜ |
| Claude Client | ⬜ 0% | `anthropic_claude.rs` | ⬜ |
| Unified Engine | ⬜ 0% | `ia_engine.rs` | ⬜ |
| Tauri Commands | ⬜ 0% | `ia_commands.rs` | ⬜ |
| UI Security Panel | ⬜ 0% | `SecurityPanel.tsx` | ⬜ |
| Tests Rust | ⬜ 0% | `tests/ia_tests.rs` | ⬜ |
| Tests E2E | ⬜ 0% | `tests/e2e/ia.spec.ts` | ⬜ |

---

## 🚀 PROCHAINES ÉTAPES

### Phase 1: Sécurité (2-3h)
1. Étendre `SecureSecretsEngine` pour OpenAI + Claude
2. Ajouter validation clés API
3. Créer `api_key_validator.rs`
4. Tests unitaires Rust

### Phase 2: Clients IA (4-5h)
1. Implémenter `openai_gpt.rs` complet
2. Implémenter `anthropic_claude.rs` complet
3. Implémenter `ia_engine.rs` (unified)
4. Gérer streaming (SSE)
5. Tests d'intégration

### Phase 3: Commands Tauri (2h)
1. Créer `ia_commands.rs`
2. Exposer commands frontend
3. Tests commands

### Phase 4: ChatEngine Integration (3-4h)
1. Modifier `pipeline.rs`
2. Étendre `ProviderPreference`
3. Intégrer Unified Engine
4. Tests pipeline

### Phase 5: UI (3-4h)
1. Créer `SecurityPanel.tsx`
2. Créer `AddAPIKeyModal.tsx`
3. Intégrer dans Settings
4. Tests UI

### Phase 6: Tests & Validation (2-3h)
1. Tests E2E complets
2. Stress tests
3. Documentation finale

**ESTIMATION TOTALE**: 16-21 heures de développement

---

## ✅ VALIDATION FINALE

Avant mise en production:

- [ ] Toutes les clés sont chiffrées AES-256-GCM
- [ ] Aucune clé exposée dans logs
- [ ] Fallback automatique fonctionne
- [ ] ImmuneEngine bloque surcharge
- [ ] UI masque clés API
- [ ] Tests stress 100 req/min OK
- [ ] Documentation complète
- [ ] Audit sécurité externe

---

**TITANE∞ v∞.19.3Ω — Singularity Architecture Active**
**Status**: Architecture prête pour implémentation
**Contact**: Architecture Team
