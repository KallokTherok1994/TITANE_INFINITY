# UNIFIED PROVIDERS ARCHITECTURE — Architecture Unifiée IA

**Date:** 2025-01-03  
**Version:** v26.3.0  
**Objectif:** Définir une architecture unifiée pour tous les providers IA (OpenAI, Anthropic, Gemini, Ollama, Copilot)

---

## 1. Vision & Objectifs

### 1.1 Problèmes Résolus

**AVANT (Architecture fragmentée):**
- ❌ Chaque provider avait son propre contrat d'interface
- ❌ Code de routing dupliqué dans orchestrateur
- ❌ Sélection de modèles inconsistante
- ❌ Tests de connexion non uniformisés
- ❌ Gestion d'erreurs spécifique à chaque provider
- ❌ Difficile d'ajouter un nouveau provider

**APRÈS (Architecture unifiée):**
- ✅ Interface commune `AIProviderAdapter` pour tous
- ✅ Routing centralisé et typé
- ✅ Sélection modèle normalisée (UI + backend)
- ✅ Tests de connexion systématiques
- ✅ Erreurs normalisées avec codes communs
- ✅ Ajout d'un provider = implémentation interface + déclaration registre

### 1.2 Single Source of Truth

**Un seul endroit pour:**
- ✅ Définir les providers disponibles (`AIProviderId`)
- ✅ Gérer l'état des providers (configuré/disponible/activé)
- ✅ Lister les modèles par provider
- ✅ Router les requêtes vers le bon provider
- ✅ Tester la santé des providers

---

## 2. Architecture Components

### 2.1 Types Unifiés (Frontend)

**Fichier:** `/src/services/ai/types.ts`

```typescript
/**
 * Identifiant normalisé des providers IA
 */
export type AIProviderId = 
  | 'openai' 
  | 'anthropic' 
  | 'gemini' 
  | 'ollama' 
  | 'copilot' 
  | 'local';

/**
 * Choix provider dans l'UI (inclut 'auto' pour routing intelligent)
 */
export type ProviderChoice = 
  | 'auto' 
  | 'openai' 
  | 'claude' 
  | 'gemini' 
  | 'ollama' 
  | 'copilot' 
  | 'local';

/**
 * Informations sur un modèle
 */
export interface ModelInfo {
  id: string;                    // ex: "gpt-4o", "claude-3-5-sonnet"
  name: string;                  // Nom affiché dans l'UI
  contextWindow: number;         // Nombre de tokens max
  supportsVision?: boolean;
  supportsStreaming?: boolean;
  supportsFunctionCalling?: boolean;
  isDefault?: boolean;
  costPer1kInput?: number;
  costPer1kOutput?: number;
}

/**
 * Résultat d'un test de connexion
 */
export interface ProviderTestResult {
  success: boolean;
  message: string;               // Message user-friendly
  latencyMs?: number;            // Latence mesurée
  error?: string;                // Détail erreur technique
  availableModels?: string[];    // Liste modèles découverts
}

/**
 * Statut d'un provider
 */
export interface ProviderStatus {
  configured: boolean;           // Clé API présente
  available: boolean;            // Test connexion OK
  enabled: boolean;              // Activé par utilisateur
  lastCheck?: number;            // Timestamp dernière vérification
  error?: string;                // Erreur si problème
  latencyMs?: number;            // Performance mesurée
}

/**
 * Capacités d'un provider
 */
export interface ProviderCapabilities {
  textGeneration: boolean;
  streaming: boolean;
  vision: boolean;
  functionCalling: boolean;
  codeGeneration: boolean;
  embeddings: boolean;
  longContext: boolean;
}

/**
 * Interface unifiée pour tous les providers
 * Contrat à implémenter pour chaque nouveau provider
 */
export interface AIProviderAdapter {
  // Identité
  readonly id: AIProviderId;
  readonly name: string;
  readonly description?: string;

  // Capacités
  readonly capabilities: ProviderCapabilities;

  // Lifecycle & Health
  isAvailable(): Promise<boolean>;
  testConnection(): Promise<ProviderTestResult>;
  getStatus(): Promise<ProviderStatus>;

  // Modèles
  listModels(): Promise<ModelInfo[]>;
  getDefaultModel(): string;

  // Core Generation
  generate(
    message: string,
    history?: AIMessage[],
    config?: AIConfig
  ): Promise<AIResponse>;

  // Streaming (optionnel)
  stream?(
    message: string,
    history?: AIMessage[],
    config?: AIConfig
  ): AsyncGenerator<string>;

  // Stats & Debug
  getStats?(): Record<string, unknown>;
  resetErrors?(): void;
}
```

### 2.2 Provider Registry (Backend)

**Fichier:** `/src-tauri/src/api_hub/provider_registry.rs`

```rust
/// Provider ID unifié (Rust)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Provider {
    OpenAI,
    Anthropic,
    Gemini,
    Ollama,
    Copilot,  // ✨ Nouveau
    Local,
}

impl Provider {
    pub fn as_str(&self) -> &'static str {
        match self {
            Provider::OpenAI => "openai",
            Provider::Anthropic => "anthropic",
            Provider::Gemini => "gemini",
            Provider::Ollama => "ollama",
            Provider::Copilot => "copilot",
            Provider::Local => "local",
        }
    }
    
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "openai" => Some(Provider::OpenAI),
            "anthropic" | "claude" => Some(Provider::Anthropic),
            "gemini" => Some(Provider::Gemini),
            "ollama" => Some(Provider::Ollama),
            "copilot" => Some(Provider::Copilot),
            "local" | "titane-local" => Some(Provider::Local),
            _ => None,
        }
    }
}

/// Profil complet d'un provider
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProviderProfile {
    pub name: String,
    pub provider: Provider,
    pub capabilities: Vec<ProviderCapability>,
    pub supports_text: bool,
    pub supports_vision: bool,
    pub supports_audio: bool,
    pub supports_embeddings: bool,
    pub max_context_tokens: u32,
    pub cost_rating: u8,    // 1-10
    pub speed_rating: u8,   // 1-10
    pub quality_rating: u8, // 1-10
    pub safety_rating: u8,  // 1-10
    pub models: Vec<ModelInfo>,
    pub available: bool,
    pub last_latency_ms: Option<u64>,
    pub error_rate: f32,
}

impl ProviderProfile {
    /// Profil GitHub Copilot
    pub fn copilot_default() -> Self {
        Self {
            name: "GitHub Copilot".to_string(),
            provider: Provider::Copilot,
            capabilities: vec![
                ProviderCapability::TextGeneration,
                ProviderCapability::Streaming,
                ProviderCapability::CodeGeneration,
                ProviderCapability::FunctionCalling,
            ],
            supports_text: true,
            supports_vision: false,  // À confirmer selon API
            supports_audio: false,
            supports_embeddings: false,
            max_context_tokens: 128000,  // À confirmer
            cost_rating: 5,
            speed_rating: 8,
            quality_rating: 8,
            safety_rating: 9,
            models: vec![
                ModelInfo {
                    id: "gpt-4".to_string(),
                    name: "GPT-4 (Copilot)".to_string(),
                    context_window: 128000,
                    cost_per_1k_input: 0.0,  // Managed by GitHub
                    cost_per_1k_output: 0.0,
                    supports_vision: false,
                    supports_audio: false,
                    is_default: true,
                },
            ],
            available: false,
            last_latency_ms: None,
            error_rate: 0.0,
        }
    }
}
```

### 2.3 Secrets Management (Backend)

**Fichier:** `/src-tauri/src/security/secrets_engine.rs`

```rust
// Constantes clés API
pub const KEY_OPENAI: &str = "openai_api_key";
pub const KEY_CLAUDE: &str = "claude_api_key";
pub const KEY_GEMINI: &str = "gemini_api_key";
pub const KEY_COPILOT: &str = "copilot_api_key";  // ✨ Nouveau

impl SecureSecretsEngine {
    /// Récupère la clé pour un provider
    pub fn get_provider_key(&self, provider_id: &str) -> Result<Option<String>, SecretsError> {
        let key_name = match provider_id {
            "openai" => KEY_OPENAI,
            "anthropic" | "claude" => KEY_CLAUDE,
            "gemini" => KEY_GEMINI,
            "copilot" => KEY_COPILOT,
            _ => return Ok(None),
        };
        
        self.get_secret(key_name)
    }
    
    /// Définit la clé pour un provider
    pub fn set_provider_key(&self, provider_id: &str, key: &str) -> Result<(), SecretsError> {
        let key_name = match provider_id {
            "openai" => KEY_OPENAI,
            "anthropic" | "claude" => KEY_CLAUDE,
            "gemini" => KEY_GEMINI,
            "copilot" => KEY_COPILOT,
            _ => return Err(SecretsError::InvalidKey("Unknown provider".to_string())),
        };
        
        self.set_secret(key_name, key)
    }
}
```

---

## 3. Data Flow (Architecture Layers)

### 3.1 Diagramme Global

```
┌───────────────────────────────────────────────────────────────────┐
│                     LAYER 1: UI (React)                           │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Chat UI]                    [Governance Center]                │
│      │                               │                           │
│      ├─ Provider Selector            ├─ SecretsTab              │
│      │  (Dropdown: auto/openai/...)  │  └─ APIProviderCard × 5  │
│      │                               │     (OpenAI, Anthropic,   │
│      └─ Model Selector                │      Gemini, Ollama,      │
│         (Dynamique par provider)      │      Copilot)            │
│                                      │                           │
│  useChat Hook                        useGovernance Hook         │
│    ├─ selectedProvider: AIProviderId   ├─ providers status       │
│    ├─ selectedModel: string            ├─ testConnection()      │
│    └─ sendMessage()                    └─ setProviderKey()       │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────┐
│              LAYER 2: Provider Adapters (Frontend)                │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /src/services/ai/providers/                                     │
│    ├─ openai.ts    → implements AIProviderAdapter               │
│    ├─ claude.ts    → implements AIProviderAdapter               │
│    ├─ gemini.ts    → implements AIProviderAdapter               │
│    ├─ ollama.ts    → implements AIProviderAdapter               │
│    └─ copilot.ts   → implements AIProviderAdapter (NEW)         │
│                                                                   │
│  Chaque adapter:                                                 │
│    ✓ Appelle secureInvoke('chat_generate_<provider>')           │
│    ✓ Implémente testConnection()                                │
│    ✓ Retourne listModels()                                      │
│    ✓ Normalise erreurs                                          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                              ↓ Tauri IPC
┌───────────────────────────────────────────────────────────────────┐
│              LAYER 3: Tauri Commands (Backend)                    │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /src-tauri/src/commands/chat_generate_commands.rs              │
│    ├─ chat_generate_openai()                                    │
│    ├─ chat_generate_anthropic()                                 │
│    ├─ chat_generate_gemini()                                    │
│    └─ chat_generate_copilot()  (NEW)                            │
│                                                                   │
│  /src-tauri/src/commands/security.rs                            │
│    ├─ set_<provider>_key()                                      │
│    ├─ get_<provider>_status()                                   │
│    └─ test_<provider>_connection()                              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────┐
│           LAYER 4: Provider Implementations (Backend)             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /src-tauri/src/api_hub/                                         │
│    ├─ openai.rs       → HTTP client OpenAI API                  │
│    ├─ anthropic.rs    → HTTP client Anthropic API               │
│    ├─ gemini.rs       → HTTP client Gemini API                  │
│    └─ copilot.rs      → HTTP client GitHub Copilot API (NEW)    │
│                                                                   │
│  /src-tauri/src/security/secrets_engine.rs                       │
│    └─ Encrypted key storage (AES-256-GCM + Argon2id)            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌───────────────────────────────────────────────────────────────────┐
│                    External APIs                                  │
│  • api.openai.com                                                │
│  • api.anthropic.com                                             │
│  • generativelanguage.googleapis.com                             │
│  • api.github.com/copilot (ou models.github.com)                │
│  • localhost:11434 (Ollama local)                                │
└───────────────────────────────────────────────────────────────────┘
```

### 3.2 Séquence: Chat Message avec Provider Sélectionné

```
User (Chat UI)
    │
    ├─ Sélectionne provider: "copilot"
    ├─ Sélectionne modèle: "gpt-4"
    └─ Tape message: "Explain async/await"
    │
    ↓
useChat Hook
    │
    ├─ selectedProvider = "copilot"
    ├─ selectedModel = "gpt-4"
    └─ sendMessage("Explain async/await")
    │
    ↓
copilot.ts (AIProviderAdapter)
    │
    ├─ Validation input
    ├─ Format history
    └─ secureInvoke('chat_generate_copilot', {
        message: "Explain async/await",
        history: [...],
        config: { model: "gpt-4", temperature: 0.7 }
      })
    │
    ↓ Tauri IPC
chat_generate_copilot (Rust)
    │
    ├─ Permission check (PERMISSION_GUARD)
    ├─ Validate message not empty
    ├─ Check Copilot key configured
    └─ Call copilot::send_chat()
    │
    ↓
copilot.rs (API Implementation)
    │
    ├─ Retrieve key from secrets_engine
    ├─ Build HTTP request to GitHub API
    ├─ Send request (with timeout)
    ├─ Parse response
    └─ Return GenerateResponse
    │
    ↓ (response flows back)
copilot.ts
    │
    └─ Normalize response → AIResponse
    │
    ↓
useChat
    │
    ├─ Update messages state
    ├─ Trigger TTS (if enabled)
    └─ Save to memory
    │
    ↓
Chat UI
    │
    └─ Display assistant message
```

### 3.3 Séquence: Test Connection (Gouvernance)

```
User (Governance Center)
    │
    ├─ Enters Copilot API key
    └─ Clicks "Test Connection"
    │
    ↓
APIProviderCard (Copilot)
    │
    └─ onSetKey("sk-copilot-xxxxx")
    │
    ↓
useGovernance Hook
    │
    └─ setCopilotKey(key)
    │
    ↓
governanceService.ts
    │
    └─ secureInvoke('set_copilot_key', { key })
    │
    ↓ Tauri IPC
set_copilot_key (Rust)
    │
    ├─ Validate key format
    ├─ secrets_engine.set_secret(KEY_COPILOT, key)
    └─ Return { ok: true }
    │
    ↓ (then auto-trigger test)
test_copilot_connection (Rust)
    │
    ├─ Retrieve key
    ├─ Call copilot::test_connection()
    │   ├─ Simple API call (list models or echo)
    │   └─ Measure latency
    └─ Return ProviderTestResult {
        success: true,
        message: "✅ Connected successfully",
        latencyMs: 234,
        availableModels: ["gpt-4", "gpt-3.5-turbo"]
      }
    │
    ↓
APIProviderCard
    │
    └─ Display status badge: "Actif" (green)
```

---

## 4. Mapping AVANT → APRÈS

### 4.1 Types

| **AVANT**                          | **APRÈS**                        | **Bénéfice**                          |
|------------------------------------|----------------------------------|---------------------------------------|
| `ProviderChoice` sans copilot      | `ProviderChoice` + 'copilot'     | Support Copilot UI                    |
| Pas d'interface commune            | `AIProviderAdapter`              | Contrat unifié pour tous providers    |
| `AIProviderName` (legacy)          | `AIProviderId` (normalized)      | Identifiants cohérents                |
| Pas de `ModelInfo` standardisé     | `ModelInfo` interface            | Liste modèles unifiée                 |
| Tests connexion ad-hoc             | `ProviderTestResult` interface   | Tests systématiques                   |
| Status fragmentés                  | `ProviderStatus` interface       | État cohérent (configured/available)  |

### 4.2 Frontend Providers

| **Provider** | **AVANT**                                | **APRÈS**                                      |
|--------------|------------------------------------------|------------------------------------------------|
| OpenAI       | `openai.ts` (custom interface)           | `openai.ts` implements `AIProviderAdapter`     |
| Anthropic    | `claude.ts` (custom interface)           | `claude.ts` implements `AIProviderAdapter`     |
| Gemini       | `gemini.ts` (custom interface)           | `gemini.ts` implements `AIProviderAdapter`     |
| Ollama       | `ollama.ts` (custom interface)           | `ollama.ts` implements `AIProviderAdapter`     |
| **Copilot**  | ❌ N'existe pas                          | ✅ `copilot.ts` implements `AIProviderAdapter` |

### 4.3 Backend Commands

| **Command**                    | **AVANT**                  | **APRÈS**                            |
|--------------------------------|----------------------------|--------------------------------------|
| `chat_generate_openai`         | ✅ Existe                  | ✅ Maintenu (refactor minimal)       |
| `chat_generate_anthropic`      | ✅ Existe                  | ✅ Maintenu (refactor minimal)       |
| `chat_generate_gemini`         | ✅ Existe                  | ✅ Maintenu (refactor minimal)       |
| `chat_generate_copilot`        | ❌ N'existe pas            | ✅ Nouveau                           |
| `set_copilot_key`              | ❌ N'existe pas            | ✅ Nouveau                           |
| `get_copilot_status`           | ❌ N'existe pas            | ✅ Nouveau                           |
| `test_copilot_connection`      | ❌ N'existe pas            | ✅ Nouveau                           |

### 4.4 Governance UI

| **Provider** | **AVANT**                        | **APRÈS**                                   |
|--------------|----------------------------------|---------------------------------------------|
| OpenAI       | ✅ APIProviderCard               | ✅ Maintenu (mise à jour interface)         |
| Anthropic    | ✅ APIProviderCard               | ✅ Maintenu (mise à jour interface)         |
| Gemini       | ✅ APIProviderCard               | ✅ Maintenu (mise à jour interface)         |
| Ollama       | ✅ APIProviderCard (no key)      | ✅ Maintenu                                 |
| **Copilot**  | ❌ Absent                        | ✅ Nouveau APIProviderCard                  |

---

## 5. Implémentation Checklist

### 5.1 Frontend (TypeScript)

- [x] Mettre à jour `/src/services/ai/types.ts`
  - [x] Ajouter 'copilot' à `ProviderChoice`
  - [x] Ajouter 'copilot' à `AIProviderName`
  - [x] Définir interface `AIProviderAdapter`
  - [x] Définir types `ModelInfo`, `ProviderTestResult`, `ProviderStatus`, etc.

- [ ] Créer `/src/services/ai/providers/copilot.ts`
  - [ ] Implémenter `AIProviderAdapter`
  - [ ] Méthodes: `isAvailable()`, `testConnection()`, `listModels()`, `generate()`, `stream()`
  - [ ] Utiliser `secureInvoke('chat_generate_copilot')`

- [ ] Mettre à jour Governance Center
  - [ ] `/src/features/governance-center/tabs/SecretsTab.tsx`
    - [ ] Ajouter état copilotStatus
    - [ ] Ajouter champ copilotKey
    - [ ] Ajouter handler setCopilotKey
  - [ ] `/src/features/governance-center/components/APIProviderCard.tsx`
    - [ ] Support provider='copilot'
    - [ ] Config: icon 🤖, helpUrl GitHub, description

- [ ] Mettre à jour Chat UI
  - [ ] `/src/hooks/useChat.ts`
    - [ ] Ajouter 'copilot' dans `ProviderPreference`
    - [ ] Router vers `copilotProvider.generate()`
  - [ ] Provider selector dropdown
    - [ ] Option "GitHub Copilot"

### 5.2 Backend (Rust)

- [ ] Créer `/src-tauri/src/api_hub/copilot.rs`
  - [ ] Struct `CopilotClient`
  - [ ] Méthode `send_chat(message, history, config)`
  - [ ] HTTP client vers GitHub API
  - [ ] Gestion erreurs normalisée

- [ ] Mettre à jour `/src-tauri/src/api_hub/provider_registry.rs`
  - [ ] Ajouter `Provider::Copilot` enum variant
  - [ ] Implémenter `copilot_default()` profile
  - [ ] Ajouter dans `from_str()` match

- [ ] Mettre à jour `/src-tauri/src/security/secrets_engine.rs`
  - [ ] Ajouter `KEY_COPILOT` constant
  - [ ] Mettre à jour `get_provider_key()`
  - [ ] Mettre à jour `set_provider_key()`

- [ ] Créer commands dans `/src-tauri/src/commands/`
  - [ ] `chat_generate_copilot()`
  - [ ] `set_copilot_key()`
  - [ ] `get_copilot_status()`
  - [ ] `test_copilot_connection()`

- [ ] Mettre à jour `/src-tauri/src/main.rs`
  - [ ] Enregistrer nouveaux commands Tauri

### 5.3 Documentation

- [x] `/docs/ai/PROVIDERS_INVENTORY.md` ✅
- [x] `/docs/ai/UNIFIED_PROVIDERS_ARCH.md` ✅ (ce document)
- [ ] `/docs/ai/SECRETS_STORAGE.md`
- [ ] `/docs/ai/PROVIDER_COPILOT.md`
- [ ] `/docs/ai/CHAT_PROVIDER_ROUTING.md`
- [ ] `/docs/ai/PROVIDERS_AUDIT_REPORT.md`

---

## 6. Principes de Design

### 6.1 Extensibilité

**Ajouter un nouveau provider = 3 étapes:**

1. **Backend:**
   - Créer `/src-tauri/src/api_hub/<provider>.rs`
   - Implémenter client HTTP + méthode `send_chat()`
   - Créer command `chat_generate_<provider>`
   - Ajouter clé dans `secrets_engine.rs`

2. **Frontend:**
   - Créer `/src/services/ai/providers/<provider>.ts`
   - Implémenter interface `AIProviderAdapter`
   - Ajouter provider à `ProviderChoice` type

3. **UI:**
   - Ajouter `APIProviderCard` dans `SecretsTab`
   - Mettre à jour provider selector dans Chat

### 6.2 Backward Compatibility

**Aucune breaking change pour providers existants:**
- OpenAI, Anthropic, Gemini continuent de fonctionner
- Adaptation progressive vers `AIProviderAdapter` (refactor non bloquant)
- Types legacy (`AIProviderName`) maintenus pour compatibilité

### 6.3 Security First

**Principes de sécurité:**
- ✅ Aucune clé en clair dans le code
- ✅ Stockage chiffré (AES-256-GCM + Argon2id)
- ✅ Clés jamais exposées au frontend (transit via Tauri IPC uniquement)
- ✅ Permission checks sur tous les commands sensibles
- ✅ Validation input (message, keys, configs)

### 6.4 Error Handling

**Erreurs normalisées:**

```typescript
export interface ProviderError {
  code: 
    | 'INVALID_KEY'
    | 'RATE_LIMIT'
    | 'TIMEOUT'
    | 'QUOTA_EXCEEDED'
    | 'NETWORK_ERROR'
    | 'MODEL_NOT_FOUND'
    | 'UNKNOWN';
  message: string;              // User-friendly message
  provider: AIProviderId;
  retryable: boolean;
  technicalDetails?: string;    // Pour debug
}
```

**Mapping provider-specific errors:**
- OpenAI `401` → `INVALID_KEY`
- OpenAI `429` → `RATE_LIMIT`
- Anthropic `overloaded_error` → `RATE_LIMIT`
- Gemini `RESOURCE_EXHAUSTED` → `QUOTA_EXCEEDED`
- Timeout réseau → `TIMEOUT`

---

## 7. Tests & Validation

### 7.1 Tests Unitaires

**Frontend:**
- [ ] `/src/__tests__/services/ai/providers/copilot.test.ts`
  - [ ] Test `generate()` avec mock Tauri
  - [ ] Test `testConnection()` success/failure
  - [ ] Test `listModels()`
  - [ ] Test error normalization

**Backend:**
- [ ] `/src-tauri/tests/integration/copilot_provider_test.rs`
  - [ ] Test `send_chat()` avec mock HTTP
  - [ ] Test gestion erreurs API
  - [ ] Test encryption/decryption clé

### 7.2 Tests Intégration

- [ ] Test flow complet: UI → Tauri → API → Response
- [ ] Test avec clé invalide (erreur graceful)
- [ ] Test rate limiting (retry strategy)
- [ ] Test streaming (si supporté)

### 7.3 Tests E2E

- [ ] Playwright: Sélectionner Copilot dans Chat
- [ ] Playwright: Configurer clé dans Gouvernance
- [ ] Playwright: Envoyer message et recevoir réponse

---

## 8. Prochaines Étapes

1. **PHASE 2:** Gouvernance UI/UX
   - Implémenter APIProviderCard Copilot
   - Ajouter gestion clé Copilot dans SecretsTab

2. **PHASE 3:** Backend Copilot
   - Créer `copilot.rs` provider
   - Implémenter commands Tauri

3. **PHASE 4:** Chat Routing
   - Brancher Copilot dans useChat
   - Tester génération messages

4. **PHASE 5:** Audit & Validation
   - Vérifier cohérence avec autres providers
   - Tests complets

---

**Document maintenu par:** TITANE∞ Team  
**Dernière mise à jour:** 2025-01-03
