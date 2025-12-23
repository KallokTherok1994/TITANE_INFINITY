// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — Unified IA Engine
//   Central orchestration: Gemini + OpenAI + Claude + Local
//   Auto-fallback chain: Claude → GPT → Gemini → Local
// ═══════════════════════════════════════════════════════════════

use super::anthropic_claude::{ClaudeClient, ClaudeMessage, ClaudeRequest};
use super::openai_gpt::{ChatMessage, OpenAIClient, OpenAIRequest};
use crate::security::secrets_engine::SecureSecretsEngine;
use log::{debug, error, info, warn};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
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

    pub fn display_name(&self) -> &str {
        match self {
            IAEngine::TitaneLocal => "TITANE Local",
            IAEngine::Gemini => "Google Gemini",
            IAEngine::OpenAI => "OpenAI GPT",
            IAEngine::Claude => "Anthropic Claude",
        }
    }
}

impl FromStr for IAEngine {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "titane_local" | "local" => Ok(IAEngine::TitaneLocal),
            "gemini" => Ok(IAEngine::Gemini),
            "openai" | "gpt" => Ok(IAEngine::OpenAI),
            "claude" | "anthropic" => Ok(IAEngine::Claude),
            _ => Err(()),
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
    openai_client: Arc<RwLock<Option<OpenAIClient>>>,
    claude_client: Arc<RwLock<Option<ClaudeClient>>>,
}

impl UnifiedIAEngine {
    pub fn new(secrets: Arc<SecureSecretsEngine>) -> Self {
        Self {
            secrets,
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
            info!("[UnifiedIA] ✅ OpenAI initialisé");
        } else {
            info!("[UnifiedIA] ⚠️ OpenAI désactivé (clé absente)");
        }

        // Check Claude
        if let Ok(Some(key)) = self.secrets.get_claude_key() {
            let client = ClaudeClient::new(key);
            *self.claude_client.write().await = Some(client);
            available.push(IAEngine::Claude);
            info!("[UnifiedIA] ✅ Claude initialisé");
        } else {
            info!("[UnifiedIA] ⚠️ Claude désactivé (clé absente)");
        }

        // Check Gemini
        if let Ok(Some(_key)) = self.secrets.get_secret("gemini_api_key") {
            available.push(IAEngine::Gemini);
            info!("[UnifiedIA] ✅ Gemini initialisé");
        } else {
            info!("[UnifiedIA] ⚠️ Gemini désactivé (clé absente)");
        }

        // Local always available
        available.push(IAEngine::TitaneLocal);
        info!("[UnifiedIA] ✅ TITANE Local toujours disponible");

        info!("[UnifiedIA] 🔥 {} moteurs IA disponibles", available.len());
        Ok(available)
    }

    /// Generate response with automatic fallback
    pub async fn generate(&self, request: UnifiedIARequest) -> Result<UnifiedIAResponse, String> {
        let engines = self.get_fallback_chain(request.preferred_engine.clone());

        debug!("[UnifiedIA] Chaîne de secours: {:?}", engines);

        for (idx, engine) in engines.iter().enumerate() {
            let is_fallback = idx > 0;

            if is_fallback {
                warn!(
                    "[UnifiedIA] ⚠️ Basculement vers {}...",
                    engine.display_name()
                );
            }

            match self.try_engine(engine, &request).await {
                Ok(response) => {
                    if is_fallback {
                        warn!(
                            "[UnifiedIA] ✅ Basculement {} réussi",
                            engine.display_name()
                        );
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
                    error!("[UnifiedIA] ❌ {} échoué: {}", engine.display_name(), e);
                    if idx == engines.len() - 1 {
                        return Err(format!(
                            "Tous les moteurs IA ont échoué. Dernière erreur: {}",
                            e
                        ));
                    }
                }
            }
        }

        Err("Aucun moteur IA disponible".into())
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
            .ok_or("Client OpenAI non initialisé (clé absente)")?;

        let openai_req = OpenAIRequest {
            message: request.message.clone(),
            history: request
                .history
                .iter()
                .map(|m| ChatMessage {
                    role: m.role.clone(),
                    content: m.content.clone(),
                })
                .collect(),
            system_prompt: request.system_prompt.clone(),
            temperature: request.temperature,
            max_tokens: request.max_tokens,
            model: None,
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
            .ok_or("Client Claude non initialisé (clé absente)")?;

        let claude_req = ClaudeRequest {
            message: request.message.clone(),
            history: request
                .history
                .iter()
                .map(|m| ClaudeMessage {
                    role: m.role.clone(),
                    content: m.content.clone(),
                })
                .collect(),
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

    /// Gemini call (stub - integrate existing implementation)
    async fn call_gemini(&self, _request: &UnifiedIARequest) -> Result<EngineResponse, String> {
        // Implementation: Integrate existing Gemini client from crate::ai::gemini
        // - Client: Use GeminiClient::new(api_key) from ai/gemini.rs module
        // - Mapping: Convert UnifiedIARequest → AIRequest (prompt, model, temperature)
        // - Call: let response = gemini_client.query(&ai_request).await?;
        // - Response: Map AIResponse → EngineResponse (content, tokens, latency)
        // - API key: Retrieve from SecureSecretsEngine.get_secret("gemini_api_key")
        // - Error handling: Return detailed error on API failures for debugging
        warn!("[UnifiedIA] Gemini not yet integrated into UnifiedEngine");
        Err("Gemini integration pending".into())
    }

    /// Local call (emergency fallback)
    async fn call_local(&self, request: &UnifiedIARequest) -> Result<EngineResponse, String> {
        warn!("[UnifiedIA] ⚠️ Basculement mode secours TITANE Local");

        // Emergency response
        let response = format!(
            "Mode secours TITANE∞ activé.\n\nVotre requête: \"{}\"\n\nTous les moteurs IA externes sont indisponibles. \
            Veuillez vérifier vos clés API dans les paramètres de sécurité.",
            request.message.chars().take(100).collect::<String>()
        );

        Ok(EngineResponse {
            content: response,
            model: "titane-local-emergency".to_string(),
            tokens_used: 50,
            latency_ms: 10,
        })
    }

    /// Get fallback chain based on preference
    fn get_fallback_chain(&self, preferred: Option<IAEngine>) -> Vec<IAEngine> {
        match preferred {
            Some(engine) => {
                let mut chain = vec![engine.clone()];

                // Add remaining in priority order (excluding preferred)
                let fallbacks = vec![
                    IAEngine::Claude,
                    IAEngine::OpenAI,
                    IAEngine::Gemini,
                    IAEngine::TitaneLocal,
                ];

                for fb in fallbacks {
                    if fb != engine {
                        chain.push(fb);
                    }
                }

                chain
            }
            None => {
                // Default priority: Claude → OpenAI → Gemini → Local
                vec![
                    IAEngine::Claude,
                    IAEngine::OpenAI,
                    IAEngine::Gemini,
                    IAEngine::TitaneLocal,
                ]
            }
        }
    }

    /// Get list of available engines
    pub async fn get_available_engines(&self) -> Vec<IAEngine> {
        let mut engines = Vec::new();

        if self.openai_client.read().await.is_some() {
            engines.push(IAEngine::OpenAI);
        }
        if self.claude_client.read().await.is_some() {
            engines.push(IAEngine::Claude);
        }
        if self
            .secrets
            .get_secret("gemini_api_key")
            .ok()
            .flatten()
            .is_some()
        {
            engines.push(IAEngine::Gemini);
        }

        engines.push(IAEngine::TitaneLocal);
        engines
    }
}

#[derive(Debug)]
struct EngineResponse {
    content: String,
    model: String,
    tokens_used: usize,
    latency_ms: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_engine_from_str() {
        assert_eq!(IAEngine::from_str("openai"), Ok(IAEngine::OpenAI));
        assert_eq!(IAEngine::from_str("gpt"), Ok(IAEngine::OpenAI));
        assert_eq!(IAEngine::from_str("claude"), Ok(IAEngine::Claude));
        assert_eq!(IAEngine::from_str("anthropic"), Ok(IAEngine::Claude));
        assert_eq!(IAEngine::from_str("gemini"), Ok(IAEngine::Gemini));
        assert_eq!(IAEngine::from_str("local"), Ok(IAEngine::TitaneLocal));
        assert_eq!(IAEngine::from_str("invalid"), Err(()));
    }

    #[test]
    fn test_fallback_chain_default() {
        let secrets = Arc::new(
            SecureSecretsEngine::new(None)
                .expect("secure secrets engine should initialize without config"),
        );
        let engine = UnifiedIAEngine::new(secrets);

        let chain = engine.get_fallback_chain(None);

        assert_eq!(chain[0], IAEngine::Claude);
        assert_eq!(chain[1], IAEngine::OpenAI);
        assert_eq!(chain[2], IAEngine::Gemini);
        assert_eq!(chain[3], IAEngine::TitaneLocal);
    }

    #[test]
    fn test_fallback_chain_preferred() {
        let secrets = Arc::new(
            SecureSecretsEngine::new(None)
                .expect("secure secrets engine should initialize without config"),
        );
        let engine = UnifiedIAEngine::new(secrets);

        let chain = engine.get_fallback_chain(Some(IAEngine::OpenAI));

        assert_eq!(chain[0], IAEngine::OpenAI);
        assert!(chain.contains(&IAEngine::Claude));
        assert!(chain.contains(&IAEngine::Gemini));
        assert_eq!(chain.last(), Some(&IAEngine::TitaneLocal));
    }
}
