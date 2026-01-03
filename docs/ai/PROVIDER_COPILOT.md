# PROVIDER COPILOT — Guide d'Implémentation

**Date:** 2025-01-03  
**Version:** v26.3.0  
**Objectif:** Documentation technique pour l'intégration complète du provider GitHub Copilot

---

## 1. État d'Avancement

### ✅ PHASE 0 — INVENTAIRE & DIAGNOSTIC (100%)
- ✅ Documentation complète de l'architecture existante
- ✅ Identification des 5 providers actuels (OpenAI, Anthropic, Gemini, Ollama, Local)
- ✅ Analyse des flux de données UI→Backend→API
- ✅ Identification des 6 points de fragilité
- ✅ Questions critiques pour Copilot identifiées

### ✅ PHASE 1 — ARCHITECTURE UNIFIED PROVIDERS (100%)
- ✅ Types unifiés: `AIProviderId` avec 'copilot'
- ✅ Interface `AIProviderAdapter` définie (contrat commun pour tous providers)
- ✅ `ModelInfo`, `ProviderTestResult`, `ProviderStatus`, `ProviderCapabilities` types ajoutés
- ✅ Documentation architecture 25KB (`UNIFIED_PROVIDERS_ARCH.md`)

### ✅ PHASE 2 — GOUVERNANCE UI/UX (80%)
- ✅ Documentation `SECRETS_STORAGE.md` (20KB - sécurité complète)
- ✅ Frontend hooks & services mis à jour:
  - `useGovernance`: loadCopilotStatus(), setCopilotKey()
  - `governanceService`: getCopilotStatus(), setCopilotKey()
  - `GovernanceCenterPage`: copilotStatus prop passé
  - `SecretsTab`: handleCopilotSubmit() implémenté
- ⏳ **TODO:** Ajouter l'UI card Copilot dans SecretsTab (render JSX)
- ⏳ **BLOQUÉ:** Tests UI nécessitent backend

### ⏳ PHASE 3 — PROVIDER COPILOT BACKEND (0%)
**Critique:** Backend requis pour débloquer Phase 2 et suivantes

### ⏳ PHASE 4 — CHAT ROUTING (0%)

### ⏳ PHASE 5 — AUDIT (0%)

### ⏳ PHASE 6 — VALIDATION (0%)

---

## 2. Hypothèses & Décisions Techniques

### 2.1 API Endpoint GitHub Copilot

**Hypothèse actuelle:** GitHub Models API

```
Endpoint: https://models.github.com/chat/completions
ou: https://api.github.com/copilot/chat/completions
```

**Questions non résolues:**
1. Quel endpoint exact utiliser? (à confirmer avec GitHub docs)
2. Authentification: GitHub Personal Access Token (PAT) ou OAuth?
3. Format requête: Compatible OpenAI API? ou format propriétaire?
4. Rate limits: quels sont les quotas?

**Action requise:** Recherche documentation officielle GitHub Models / Copilot API

### 2.2 Authentification

**Proposition:** GitHub Personal Access Token (classic)

Scopes requis (à confirmer):
- `read:org` (si accès à Copilot via organisation)
- `copilot` (si scope dédié existe)

**Alternatives:**
- OAuth App (plus complexe, meilleure UX)
- GitHub App (pour usage entreprise)

### 2.3 Modèles Disponibles

**Hypothèse:** GitHub Copilot utilise des modèles sous-jacents OpenAI

Liste provisoire (à confirmer):
- `gpt-4` (Copilot)
- `gpt-3.5-turbo` (Copilot)
- Possibilité d'autres modèles via GitHub Models

**Action requise:** Appel API `GET /models` pour discovery dynamique

### 2.4 Streaming Support

**Hypothèse:** Streaming supporté (format SSE comme OpenAI)

Format attendu:
```
data: {"choices":[{"delta":{"content":"text"}}]}
data: [DONE]
```

**Fallback:** Non-streaming si problèmes

---

## 3. Implémentation Backend (PHASE 3)

### 3.1 Créer `/src-tauri/src/api_hub/copilot.rs`

```rust
//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v26.3 — GITHUB COPILOT PROVIDER
//! HTTP client pour GitHub Copilot / GitHub Models API
//! ═══════════════════════════════════════════════════════════════════════════════

use reqwest::{Client, header};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use log::{debug, error, info};

const COPILOT_API_BASE: &str = "https://api.github.com/copilot"; // À ajuster
const COPILOT_TIMEOUT_SECS: u64 = 60;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopilotRequest {
    pub model: String,
    pub messages: Vec<Message>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
    pub stream: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CopilotResponse {
    pub choices: Vec<Choice>,
    pub usage: Option<Usage>,
    pub model: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Choice {
    pub message: Message,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Usage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

/// Client GitHub Copilot
pub struct CopilotClient {
    client: Client,
    api_key: String,
}

impl CopilotClient {
    pub fn new(api_key: String) -> Result<Self, String> {
        let client = Client::builder()
            .timeout(Duration::from_secs(COPILOT_TIMEOUT_SECS))
            .build()
            .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

        Ok(Self { client, api_key })
    }

    /// Envoyer une requête chat non-streaming
    pub async fn send_chat(
        &self,
        request: CopilotRequest,
    ) -> Result<CopilotResponse, String> {
        let url = format!("{}/chat/completions", COPILOT_API_BASE);

        debug!("Sending Copilot request: model={}", request.model);

        let response = self
            .client
            .post(&url)
            .header(header::AUTHORIZATION, format!("Bearer {}", self.api_key))
            .header(header::CONTENT_TYPE, "application/json")
            .header(header::USER_AGENT, "TITANE-Infinity/v26.3")
            .json(&request)
            .send()
            .await
            .map_err(|e| {
                error!("Copilot HTTP request failed: {}", e);
                format!("Network error: {}", e)
            })?;

        let status = response.status();

        if !status.is_success() {
            let error_body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            error!("Copilot API error {}: {}", status, error_body);

            return Err(match status.as_u16() {
                401 => "Clé API Copilot invalide. Vérifiez votre token GitHub.".to_string(),
                403 => "Accès refusé. Vérifiez les permissions de votre token GitHub.".to_string(),
                429 => "Limite de taux Copilot atteinte. Réessayez dans quelques secondes.".to_string(),
                _ => format!("Erreur Copilot ({}): {}", status, error_body),
            });
        }

        let copilot_response: CopilotResponse = response.json().await.map_err(|e| {
            error!("Failed to parse Copilot response: {}", e);
            format!("Invalid response format: {}", e)
        })?;

        info!("Copilot response OK: model={}", copilot_response.model);

        Ok(copilot_response)
    }

    /// Tester la connexion (simple ping)
    pub async fn test_connection(&self) -> Result<TestResult, String> {
        let start = std::time::Instant::now();

        // Test avec un message minimal
        let test_request = CopilotRequest {
            model: "gpt-4".to_string(),
            messages: vec![Message {
                role: "user".to_string(),
                content: "Hello".to_string(),
            }],
            temperature: Some(0.0),
            max_tokens: Some(5),
            stream: false,
        };

        match self.send_chat(test_request).await {
            Ok(response) => {
                let latency_ms = start.elapsed().as_millis() as u64;
                Ok(TestResult {
                    success: true,
                    message: format!("✅ Copilot connecté ({}ms)", latency_ms),
                    latency_ms: Some(latency_ms),
                    available_models: Some(vec![response.model]),
                })
            }
            Err(e) => Ok(TestResult {
                success: false,
                message: format!("❌ {}", e),
                latency_ms: None,
                available_models: None,
            }),
        }
    }

    /// Lister les modèles disponibles (si endpoint existe)
    pub async fn list_models(&self) -> Result<Vec<String>, String> {
        // TODO: Implémenter si endpoint /models existe
        // Pour l'instant, retourner liste statique
        Ok(vec![
            "gpt-4".to_string(),
            "gpt-3.5-turbo".to_string(),
        ])
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct TestResult {
    pub success: bool,
    pub message: String,
    pub latency_ms: Option<u64>,
    pub available_models: Option<Vec<String>>,
}
```

### 3.2 Mettre à jour `/src-tauri/src/security/secrets_engine.rs`

```rust
// Ajouter la constante
pub const KEY_COPILOT: &str = "copilot_api_key";

// Mettre à jour get_provider_key() et set_provider_key()
pub fn get_provider_key(&self, provider_id: &str) -> Result<Option<String>, SecretsError> {
    let key_name = match provider_id {
        "openai" => KEY_OPENAI,
        "anthropic" | "claude" => KEY_CLAUDE,
        "gemini" => KEY_GEMINI,
        "copilot" => KEY_COPILOT, // ✨ NEW
        _ => return Ok(None),
    };
    
    self.get_secret(key_name)
}
```

### 3.3 Créer commands dans `/src-tauri/src/commands/`

**Fichier:** `/src-tauri/src/commands/copilot_commands.rs` (nouveau)

```rust
//! Tauri commands pour GitHub Copilot provider

use crate::api_hub::copilot::{CopilotClient, CopilotRequest, Message};
use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use crate::security::secrets_engine::{SecureSecretsEngine, KEY_COPILOT};
use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateRequest {
    pub message: String,
    pub history: Vec<HistoryMessage>,
    pub config: Option<GenerateConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateConfig {
    pub model: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateResponse {
    pub ok: bool,
    pub data: Option<GenerateData>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateData {
    pub content: String,
    pub model: Option<String>,
    pub tokens: Option<u32>,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiKeyStatus {
    pub configured: bool,
    pub provider_enabled: bool,
    pub masked_key: Option<String>,
    pub env_present: bool,
    pub env_purged: bool,
    pub was_updated: bool,
}

pub struct CopilotState {
    pub api_key: Arc<RwLock<Option<String>>>,
    pub secrets_engine: Arc<SecureSecretsEngine>,
}

/// Générer une réponse avec GitHub Copilot
#[tauri::command]
pub async fn chat_generate_copilot(
    request: GenerateRequest,
    state: State<'_, CopilotState>,
) -> Result<GenerateResponse, String> {
    // Permission check
    PERMISSION_GUARD
        .require("ai_generate", Role::User, "chat_generate_copilot")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Validation
    if request.message.trim().is_empty() {
        return Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some("Message vide".to_string()),
        });
    }

    // Récupérer clé
    let api_key = match state.api_key.read().await.clone() {
        Some(key) => key,
        None => {
            // Charger depuis secrets_engine
            match state.secrets_engine.get_secret(KEY_COPILOT) {
                Ok(Some(key)) => key,
                _ => {
                    return Ok(GenerateResponse {
                        ok: false,
                        data: None,
                        error: Some("Clé API Copilot non configurée".to_string()),
                    });
                }
            }
        }
    };

    // Créer client
    let client = CopilotClient::new(api_key).map_err(|e| e.to_string())?;

    // Construire messages
    let mut messages: Vec<Message> = request
        .history
        .into_iter()
        .map(|h| Message {
            role: h.role,
            content: h.content,
        })
        .collect();

    messages.push(Message {
        role: "user".to_string(),
        content: request.message,
    });

    // Config
    let config = request.config.unwrap_or_else(|| GenerateConfig {
        model: Some("gpt-4".to_string()),
        temperature: Some(0.7),
        max_tokens: Some(2048),
    });

    let copilot_request = CopilotRequest {
        model: config.model.unwrap_or_else(|| "gpt-4".to_string()),
        messages,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        stream: false,
    };

    // Appel API
    match client.send_chat(copilot_request).await {
        Ok(response) => {
            let choice = response.choices.first().ok_or("No choices returned")?;

            Ok(GenerateResponse {
                ok: true,
                data: Some(GenerateData {
                    content: choice.message.content.clone(),
                    model: Some(response.model),
                    tokens: response.usage.map(|u| u.total_tokens),
                    finish_reason: choice.finish_reason.clone(),
                }),
                error: None,
            })
        }
        Err(e) => Ok(GenerateResponse {
            ok: false,
            data: None,
            error: Some(format!("Erreur Copilot: {}", e)),
        }),
    }
}

/// Définir la clé API Copilot
#[tauri::command]
pub async fn chat_set_copilot_key(
    api_key: String,
    state: State<'_, CopilotState>,
) -> Result<GeminiKeyStatus, String> {
    PERMISSION_GUARD
        .require("secrets_write", Role::User, "chat_set_copilot_key")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    if api_key.trim().is_empty() || api_key.len() < 16 {
        return Err("Clé invalide (min 16 caractères)".to_string());
    }

    // Stocker dans secrets engine
    state
        .secrets_engine
        .set_secret(KEY_COPILOT, &api_key)
        .map_err(|e| format!("Failed to store key: {}", e))?;

    // Mettre à jour state en mémoire
    *state.api_key.write().await = Some(api_key.clone());

    // Masquer clé pour retour
    let masked = if api_key.len() > 8 {
        format!("{}...{}", &api_key[..4], &api_key[api_key.len() - 4..])
    } else {
        "****".to_string()
    };

    Ok(GeminiKeyStatus {
        configured: true,
        provider_enabled: true,
        masked_key: Some(masked),
        env_present: false,
        env_purged: false,
        was_updated: true,
    })
}

/// Obtenir le statut de la clé Copilot
#[tauri::command]
pub async fn get_copilot_key_status(
    state: State<'_, CopilotState>,
) -> Result<GeminiKeyStatus, String> {
    PERMISSION_GUARD
        .require("secrets_read", Role::User, "get_copilot_key_status")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let has_key = match state.secrets_engine.has_secret(KEY_COPILOT) {
        Ok(has) => has,
        Err(_) => false,
    };

    Ok(GeminiKeyStatus {
        configured: has_key,
        provider_enabled: has_key,
        masked_key: if has_key { Some("****...****".to_string()) } else { None },
        env_present: false,
        env_purged: false,
        was_updated: false,
    })
}

/// Tester la connexion Copilot
#[tauri::command]
pub async fn test_copilot_connection(
    state: State<'_, CopilotState>,
) -> Result<serde_json::Value, String> {
    let api_key = match state.secrets_engine.get_secret(KEY_COPILOT) {
        Ok(Some(key)) => key,
        _ => {
            return Ok(serde_json::json!({
                "success": false,
                "message": "Clé API non configurée",
            }));
        }
    };

    let client = CopilotClient::new(api_key).map_err(|e| e.to_string())?;

    match client.test_connection().await {
        Ok(result) => Ok(serde_json::to_value(result).unwrap()),
        Err(e) => Ok(serde_json::json!({
            "success": false,
            "message": e,
        })),
    }
}
```

### 3.4 Enregistrer commands dans `main.rs`

```rust
// Dans src-tauri/src/main.rs

mod commands;
use commands::copilot_commands::{
    chat_generate_copilot,
    chat_set_copilot_key,
    get_copilot_key_status,
    test_copilot_connection,
};

fn main() {
    tauri::Builder::default()
        .manage(CopilotState {
            api_key: Arc::new(RwLock::new(None)),
            secrets_engine: secrets_engine.clone(),
        })
        .invoke_handler(tauri::generate_handler![
            // ... autres commands
            chat_generate_copilot,
            chat_set_copilot_key,
            get_copilot_key_status,
            test_copilot_connection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 4. Implémentation Frontend Adapter (PHASE 3)

### 4.1 Créer `/src/services/ai/providers/copilot.ts`

```typescript
/**
 * TITANE∞ v26.3 — GitHub Copilot Provider
 * Adapter pour GitHub Copilot / GitHub Models API
 */

import { secureInvoke } from '@/lib/security';
import type { 
  AIProvider, 
  AIMessage, 
  AIResponse, 
  AIProviderAdapter,
  ModelInfo,
  ProviderTestResult,
  ProviderStatus,
  ProviderCapabilities,
} from '../types';
import { createLogger } from '@/utils/logger';
import { withRetry, getRetryConfig } from '../retryStrategy';
import { withCache } from '../apiCache';

const logger = createLogger('[CopilotProvider]');

interface CopilotConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

async function generateCopilotUncached(
  message: string,
  history: AIMessage[],
  config: Required<CopilotConfig>
): Promise<AIResponse> {
  const startTime = Date.now();

  try {
    if (!message?.trim()) {
      throw new Error('Message vide');
    }

    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const retryConfig = getRetryConfig('copilot');

    const response = await withRetry(
      async () => {
        return await secureInvoke<{
          ok: boolean;
          data: {
            content: string;
            model?: string;
            tokens?: number;
            finishReason?: string;
          } | null;
          error: string | null;
        }>('chat_generate_copilot', {
          message: message.trim(),
          history: formattedHistory,
          config,
        });
      },
      retryConfig,
      { provider: 'copilot', message: message.substring(0, 50) }
    );

    const latency = Date.now() - startTime;

    if (!response.ok || !response.data) {
      const errorMsg = response.error || 'Erreur inconnue';

      if (errorMsg.includes('invalid') || errorMsg.includes('401')) {
        throw new Error(
          'Clé API Copilot invalide. Vérifiez votre token GitHub dans Gouvernance.'
        );
      }

      if (errorMsg.includes('rate_limit') || errorMsg.includes('429')) {
        throw new Error(
          'Limite de taux Copilot atteinte. Réessayez dans quelques secondes.'
        );
      }

      if (errorMsg.includes('timeout')) {
        throw new Error(`Délai d'attente Copilot dépassé (${latency}ms).`);
      }

      throw new Error(`Erreur Copilot (${latency}ms): ${errorMsg}`);
    }

    return {
      content: response.data.content,
      provider: 'copilot',
      timestamp: Date.now(),
      model: response.data.model || config.model,
      tokens: response.data.tokens,
      metadata: {
        latencyMs: latency,
        finishReason: response.data.finishReason,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Copilot generation failed:', errorMessage);
    throw error;
  }
}

const generateCopilot = withCache(generateCopilotUncached, 'copilot');

/**
 * AIProviderAdapter implementation for GitHub Copilot
 */
export const copilotAdapter: AIProviderAdapter = {
  id: 'copilot',
  name: 'GitHub Copilot',
  description: 'GitHub Copilot / GitHub Models API',

  capabilities: {
    textGeneration: true,
    streaming: false, // TODO: Implement streaming
    vision: false,
    functionCalling: true,
    codeGeneration: true,
    embeddings: false,
    longContext: true,
  },

  async isAvailable(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.available;
    } catch {
      return false;
    }
  },

  async testConnection(): Promise<ProviderTestResult> {
    try {
      const result = await secureInvoke<ProviderTestResult>('test_copilot_connection');
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },

  async getStatus(): Promise<ProviderStatus> {
    try {
      const status = await secureInvoke<{
        configured: boolean;
        provider_enabled: boolean;
      }>('get_copilot_key_status');

      return {
        configured: status.configured,
        available: status.provider_enabled,
        enabled: status.provider_enabled,
        lastCheck: Date.now(),
      };
    } catch (error) {
      return {
        configured: false,
        available: false,
        enabled: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async listModels(): Promise<ModelInfo[]> {
    // Static list for now, TODO: dynamic discovery
    return [
      {
        id: 'gpt-4',
        name: 'GPT-4 (Copilot)',
        contextWindow: 128000,
        supportsStreaming: false,
        supportsFunctionCalling: true,
        isDefault: true,
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo (Copilot)',
        contextWindow: 16385,
        supportsStreaming: false,
        supportsFunctionCalling: true,
        isDefault: false,
      },
    ];
  },

  getDefaultModel(): string {
    return 'gpt-4';
  },

  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: Partial<AIConfig>
  ): Promise<AIResponse> {
    const finalConfig: Required<CopilotConfig> = {
      model: config?.preferredProvider === 'copilot' ? 'gpt-4' : 'gpt-4',
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 2048,
    };

    return generateCopilot(message, history, finalConfig);
  },

  // Streaming TODO
  // async *stream(message, history, config) {
  //   // TODO: Implement streaming
  // },
};

// Legacy AIProvider for backward compatibility
export const copilotProvider: AIProvider = {
  name: 'copilot',
  isAvailable: () => copilotAdapter.isAvailable(),
  generate: (msg, hist, cfg) => copilotAdapter.generate(msg, hist, cfg),
  testConnection: () => copilotAdapter.testConnection(),
  description: 'GitHub Copilot / GitHub Models',
};

export default copilotProvider;
```

---

## 5. Actions Immédiates Requises

### Priorité P0 (Bloquants)

1. **Recherche API GitHub Copilot:**
   - [ ] Trouver documentation officielle endpoint
   - [ ] Confirmer format authentification (PAT vs OAuth)
   - [ ] Identifier rate limits
   - [ ] Tester endpoint avec curl/Postman

2. **Implémentation Backend Rust:**
   - [ ] Créer `copilot.rs` client HTTP
   - [ ] Créer commands Tauri (generate, set_key, get_status, test)
   - [ ] Ajouter `KEY_COPILOT` dans secrets_engine
   - [ ] Enregistrer commands dans main.rs

3. **Tests Backend:**
   - [ ] Test unitaire: `copilot::send_chat()`
   - [ ] Test unitaire: secrets encryption/decryption
   - [ ] Test intégration: command → copilot.rs → mock HTTP

### Priorité P1 (Critiques)

4. **Finaliser UI Gouvernance:**
   - [ ] Ajouter Copilot card JSX dans SecretsTab
   - [ ] Tester flow: enter key → save → test connection → success

5. **Créer Frontend Adapter:**
   - [ ] Implémenter `copilot.ts` adapter
   - [ ] Tester `copilotAdapter.generate()` avec mock

6. **Chat Integration:**
   - [ ] Ajouter 'copilot' dans provider selector dropdown
   - [ ] Router useChat vers copilotAdapter
   - [ ] Test E2E: select copilot → send message → receive response

### Priorité P2 (Important)

7. **Documentation:**
   - [ ] Créer `PROVIDER_COPILOT.md` (hypothèses, implémentation, limites)
   - [ ] Créer `CHAT_PROVIDER_ROUTING.md` (sequence diagrams)

8. **Tests:**
   - [ ] Unit tests: copilot.ts adapter
   - [ ] Integration tests: full flow UI → Backend → API mock
   - [ ] E2E Playwright: Governance + Chat scenarios

9. **Audit:**
   - [ ] Vérifier cohérence avec autres providers (OpenAI, Anthropic, Gemini)
   - [ ] Créer `PROVIDERS_AUDIT_REPORT.md`

---

## 6. Risques & Mitigations

| **Risque** | **Impact** | **Probabilité** | **Mitigation** |
|------------|------------|-----------------|----------------|
| API endpoint GitHub inconnu | Élevé | Moyenne | Recherche docs + contact GitHub support |
| Rate limits trop bas | Moyen | Moyenne | Implémenter retry exponential backoff |
| Pas de streaming support | Faible | Faible | Fallback non-streaming OK |
| Token GitHub insuffisant | Élevé | Faible | Documentation scopes requis |
| Conflits avec providers existants | Faible | Faible | Tests isolation providers |

---

## 7. Checklist Complétude

### Backend
- [ ] copilot.rs créé et testé
- [ ] Commands Tauri enregistrés
- [ ] KEY_COPILOT dans secrets_engine
- [ ] Tests unitaires Rust passent
- [ ] Tests intégration backend OK

### Frontend
- [ ] copilot.ts adapter créé
- [ ] copilotAdapter implements AIProviderAdapter
- [ ] Gouvernance UI card Copilot
- [ ] Chat selector inclut Copilot
- [ ] Tests unitaires TypeScript passent

### Documentation
- [ ] PROVIDER_COPILOT.md complet
- [ ] CHAT_PROVIDER_ROUTING.md
- [ ] PROVIDERS_AUDIT_REPORT.md
- [ ] Guide utilisateur mis à jour

### Tests
- [ ] Unit tests backend (Rust)
- [ ] Unit tests frontend (TypeScript)
- [ ] Integration tests (mock API)
- [ ] E2E tests (Playwright)
- [ ] Manual smoke test: full flow OK

### Déploiement
- [ ] Build production OK
- [ ] Lint passé (ESLint + Clippy)
- [ ] Security scan OK (CodeQL)
- [ ] PR review complete
- [ ] Merged to main

---

## 8. Ressources & Références

**Documentation GitHub:**
- GitHub Models API: https://github.com/marketplace/models
- GitHub Copilot: https://docs.github.com/en/copilot
- GitHub REST API: https://docs.github.com/en/rest

**Exemples similaires:**
- OpenAI API client: `src-tauri/src/api_hub/openai.rs`
- Anthropic API client: `src-tauri/src/api_hub/anthropic.rs`
- Secrets management: `src-tauri/src/security/secrets_engine.rs`

**Crates Rust:**
- reqwest: HTTP client
- serde: Serialization
- tokio: Async runtime

---

**Prochaine étape:** Implémenter Backend (PHASE 3)

**Contact:** kevin@titane-infinity.com  
**Maintenu par:** TITANE∞ Development Team  
**Dernière mise à jour:** 2025-01-03
