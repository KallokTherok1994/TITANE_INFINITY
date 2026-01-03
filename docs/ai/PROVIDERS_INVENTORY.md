# PROVIDERS INVENTORY — État des lieux IA de TITANE_INFINITY

**Date:** 2025-01-03  
**Version:** v26.2.0  
**Objectif:** Diagnostic complet des providers IA existants avant intégration GitHub Copilot

---

## 1. Providers IA Existants

### 1.1 OpenAI GPT
- **Status:** ✅ Actif et fonctionnel
- **Modèles:** GPT-4o, GPT-4 Turbo, GPT-3.5
- **Fichiers clés:**
  - Frontend: `/src/services/ai/providers/openai.ts`
  - Backend: `/src-tauri/src/commands/chat_generate_commands.rs` (chat_generate_openai)
  - API Hub: `/src-tauri/src/api_hub/openai.rs`
  - Provider Registry: `/src-tauri/src/api_hub/provider_registry.rs`
- **Capacités:**
  - Text generation ✅
  - Streaming ✅
  - Function calling ✅
  - Vision (GPT-4o) ✅
  - Code generation ✅
- **Configuration:**
  - Key storage: Tauri backend via `secrets_engine.rs`
  - Encryption: AES-256-GCM + Argon2id
  - UI: Governance Center → SecretsTab
  - Validation: Test connection disponible

### 1.2 Anthropic Claude
- **Status:** ✅ Actif et fonctionnel
- **Modèles:** Claude 3.5 Sonnet, Claude 3 Opus
- **Fichiers clés:**
  - Frontend: `/src/services/ai/providers/claude.ts`
  - Backend: `/src-tauri/src/commands/chat_generate_commands.rs` (chat_generate_anthropic)
  - API Hub: `/src-tauri/src/api_hub/anthropic.rs`
- **Capacités:**
  - Text generation ✅
  - Long context (200K tokens) ✅
  - Streaming ✅
  - Function calling ✅
- **Configuration:**
  - Key storage: Même système sécurisé que OpenAI
  - UI: Governance Center → SecretsTab

### 1.3 Google Gemini
- **Status:** ✅ Actif et fonctionnel
- **Modèles:** gemini-2.0-flash-exp, gemini-1.5-pro
- **Fichiers clés:**
  - Frontend: `/src/services/ai/providers/gemini.ts`
  - Backend: `/src-tauri/src/commands/chat_generate_commands.rs` (chat_generate_gemini)
  - API Hub: `/src-tauri/src/api_hub/gemini.rs`
  - Legacy: `/src-tauri/src/ai/gemini.rs`
- **Capacités:**
  - Text generation ✅
  - Vision multimodal ✅
  - Streaming ✅
- **Configuration:**
  - Key storage: Même système sécurisé
  - UI: Governance Center → SecretsTab

### 1.4 Ollama (Local)
- **Status:** ✅ Fonctionnel (optionnel)
- **Modèles:** Llama 3.1, Mistral, Qwen2.5, Phi3.5
- **Fichiers clés:**
  - Frontend: `/src/services/ai/providers/ollama.ts`
  - Backend: `/src-tauri/src/overdrive/chat_orchestrator.rs`
  - Orchestrator: `/src-tauri/src/ai/orchestrator_multi.rs`
- **Particularité:**
  - Pas de clé API requise
  - Local-first (http://localhost:11434)
  - Opt-in uniquement (évite probes localhost)

### 1.5 TITANE Local
- **Status:** ✅ Fallback interne
- **Fichiers clés:**
  - `/src/services/ai/providers/titaneLocal.ts`
  - `/src-tauri/src/ai/providers/titane_engine.rs`
- **Rôle:**
  - Fallback constitutionnel
  - Réponses garanties sans API externe

---

## 2. Architecture Data Flow

### 2.1 Flux UI → Backend → Provider

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│ 1. Chat UI                                                      │
│    └─ /src/ui/pages/Chat.tsx                                   │
│    └─ /src/hooks/useChat.ts (ProviderPreference selection)     │
│                                                                 │
│ 2. Provider Selection                                          │
│    └─ useChat: preferredProvider state                         │
│    └─ Options: 'auto' | 'openai' | 'gemini' | 'anthropic'     │
│                 | 'ollama' | 'local'                           │
│                                                                 │
│ 3. Provider Adapters (services/ai/providers/)                  │
│    ├─ openai.ts → secureInvoke('chat_generate_openai')        │
│    ├─ claude.ts → secureInvoke('chat_generate_anthropic')     │
│    ├─ gemini.ts → secureInvoke('chat_generate_gemini')        │
│    └─ ollama.ts → Direct HTTP (localhost:11434)               │
│                                                                 │
│ 4. Security Layer                                              │
│    └─ /src/lib/security.ts (secureInvoke wrapper)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Tauri IPC
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Rust/Tauri)                      │
├─────────────────────────────────────────────────────────────────┤
│ 5. Tauri Commands                                              │
│    └─ /src-tauri/src/commands/chat_generate_commands.rs       │
│       ├─ chat_generate_openai()                               │
│       ├─ chat_generate_anthropic()                            │
│       └─ chat_generate_gemini()                               │
│                                                                 │
│ 6. Orchestrator (Routing)                                      │
│    ├─ /src-tauri/src/overdrive/chat_orchestrator.rs           │
│    └─ /src-tauri/src/api_hub/router.rs                        │
│                                                                 │
│ 7. API Key Management                                          │
│    └─ /src-tauri/src/security/secrets_engine.rs               │
│       ├─ Encrypted storage (AES-256-GCM)                      │
│       ├─ KEY_OPENAI, KEY_CLAUDE, KEY_GEMINI                   │
│       └─ Passphrase derivation (Argon2id)                     │
│                                                                 │
│ 8. Provider Implementation                                     │
│    └─ /src-tauri/src/api_hub/                                 │
│       ├─ openai.rs (HTTP client OpenAI API)                   │
│       ├─ anthropic.rs (HTTP client Anthropic API)             │
│       └─ gemini.rs (HTTP client Gemini API)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL API PROVIDERS                     │
├─────────────────────────────────────────────────────────────────┤
│ • OpenAI: api.openai.com                                       │
│ • Anthropic: api.anthropic.com                                 │
│ • Google: generativelanguage.googleapis.com                    │
│ • Ollama: localhost:11434 (local)                              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Governance Center Flow (Key Management)

```
┌─────────────────────────────────────────────────────────────────┐
│              GOVERNANCE CENTER UI                               │
│  /src/features/governance-center/                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  GovernanceCenterPage.tsx                                      │
│      └─ SecretsTab.tsx                                         │
│          ├─ APIProviderCard (per provider)                     │
│          │   ├─ Status badge (Active/Inactive)                │
│          │   ├─ API Key input field                           │
│          │   ├─ Save/Delete buttons                           │
│          │   └─ Test connection button                        │
│          │                                                     │
│          └─ Actions (via useGovernance hook)                   │
│              ├─ setGeminiKey()                                │
│              ├─ setOpenAIKey()                                │
│              └─ setAnthropicKey()                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│        GOVERNANCE SERVICE (Frontend)                            │
│  /src/features/governance-center/services/governanceService.ts │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  • setGeminiKey(key) → secureInvoke('set_gemini_key')         │
│  • setOpenAIKey(key) → secureInvoke('set_openai_key')         │
│  • setAnthropicKey(key) → secureInvoke('set_anthropic_key')   │
│  • getGeminiStatus() → secureInvoke('get_gemini_status')      │
│  • getOpenAIStatus() → secureInvoke('get_openai_status')      │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Tauri IPC
┌─────────────────────────────────────────────────────────────────┐
│         TAURI COMMANDS (Backend)                                │
│  /src-tauri/src/commands/                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  security.rs:                                                  │
│    ├─ set_gemini_key(key) → secrets_engine.set_secret()       │
│    ├─ set_openai_key(key) → secrets_engine.set_secret()       │
│    ├─ set_anthropic_key(key) → secrets_engine.set_secret()    │
│    ├─ get_gemini_status() → check key presence                │
│    └─ get_openai_status() → check key presence                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         SECRETS ENGINE (Encrypted Storage)                      │
│  /src-tauri/src/security/secrets_engine.rs                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SecureSecretsEngine:                                          │
│    ├─ Mode: Encrypted { path, passphrase }                    │
│    ├─ Encryption: AES-256-GCM                                 │
│    ├─ Key derivation: Argon2id                                │
│    ├─ Storage: ~/.config/titane-infinity/secrets.enc          │
│    │                                                           │
│    ├─ set_secret(key, value) → encrypt → persist             │
│    ├─ get_secret(key) → decrypt → return value               │
│    ├─ has_secret(key) → bool                                  │
│    └─ delete_secret(key) → remove → persist                   │
│                                                                 │
│  Constants:                                                    │
│    ├─ KEY_OPENAI = "openai_api_key"                           │
│    ├─ KEY_CLAUDE = "claude_api_key"                           │
│    └─ KEY_GEMINI = "gemini_api_key"                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Points de Fragilité Identifiés

### 3.1 Duplication de Configuration
- **Problème:** Plusieurs sources de vérité pour la configuration provider
  - `useChat.ts`: ProviderPreference local
  - `governanceService.ts`: Status des providers
  - `chat_orchestrator.rs`: ChatOrchestratorState avec clés en mémoire
- **Impact:** Risque de désynchronisation UI ↔ Backend

### 3.2 Absence de Registre Unifié
- **Problème:** Pas d'interface commune AIProviderAdapter
  - Chaque provider a son propre contrat
  - Code de routing dupliqué
  - Difficile d'ajouter un nouveau provider
- **Solution requise:** Unified Provider Interface

### 3.3 Sélection Modèle Incohérente
- **Problème:** La sélection de modèle n'est pas uniformisée
  - OpenAI: model passé en config
  - Gemini: model hardcodé en backend
  - Claude: model dans api_hub mais pas exposé UI
- **Impact:** UX incohérente, pas de flexibilité

### 3.4 Tests de Connexion Incomplets
- **Problème:** Test de connexion non systématique
  - Gemini: a un test (get_gemini_status)
  - OpenAI/Claude: statut basique (clé présente/absente)
  - Pas de test réel d'API call avant utilisation
- **Risque:** Découverte d'erreurs à l'exécution

### 3.5 Gestion d'Erreurs Non Normalisée
- **Problème:** Format d'erreur différent selon provider
  - OpenAI: erreurs typées (invalid_api_key, rate_limit)
  - Gemini: erreurs génériques
  - Claude: format Anthropic-specific
- **Impact:** Messages utilisateur inconsistants

### 3.6 Streaming Non Uniforme
- **Problème:** Implémentation streaming divergente
  - Ollama: streaming natif via AsyncIterator
  - OpenAI/Claude: streaming via Tauri events
  - Gemini: support partiel
- **Impact:** Complexité de maintenance

---

## 4. Besoins pour GitHub Copilot

### 4.1 Questions Critiques

**Q1: Quelle API utiliser pour Copilot?**
- Option A: GitHub Models API (https://models.github.com)
- Option B: Azure OpenAI Copilot endpoint
- Option C: Extension VSCode (non applicable runtime)
- **Décision requise:** Clarifier l'endpoint exact

**Q2: Authentification**
- GitHub Personal Access Token?
- OAuth GitHub?
- Clé API dédiée?
- **Décision requise:** Méthode d'auth

**Q3: Modèles disponibles**
- Liste statique ou découverte dynamique?
- Quels modèles: GPT-4, GPT-3.5-turbo, other?
- **Décision requise:** Mapping modèles

**Q4: Capacités**
- Streaming supporté?
- Function calling?
- Vision multimodal?
- **Décision requise:** Feature set

### 4.2 Intégration Requise

Pour ajouter GitHub Copilot au même niveau que les autres providers:

1. **Frontend:**
   - `src/services/ai/providers/copilot.ts`
   - Ajouter 'copilot' à `ProviderPreference` type
   - Mettre à jour `APIProviderCard` avec config Copilot
   - Ajouter dans `SecretsTab.tsx`

2. **Backend:**
   - `src-tauri/src/api_hub/copilot.rs` (nouveau)
   - `src-tauri/src/commands/chat_generate_commands.rs` → `chat_generate_copilot`
   - Ajouter `KEY_COPILOT` dans `secrets_engine.rs`
   - Mettre à jour `provider_registry.rs`

3. **UI Governance:**
   - Badge status Copilot
   - Champ token/key
   - Bouton test connexion
   - Liste modèles (dropdown)

4. **Chat Routing:**
   - Ajouter case 'copilot' dans orchestrateur
   - Supporter streaming si disponible
   - Normaliser erreurs

---

## 5. Recommandations Architecture

### 5.1 Unified Provider Interface (Priorité 1)

Créer une interface commune pour TOUS les providers:

```typescript
// src/services/ai/types.ts
export type AIProviderId = 
  | 'openai' 
  | 'anthropic' 
  | 'gemini' 
  | 'ollama' 
  | 'copilot' 
  | 'local';

export interface AIProviderAdapter {
  id: AIProviderId;
  name: string;
  
  // Capacités
  capabilities: {
    textGeneration: boolean;
    streaming: boolean;
    vision: boolean;
    functionCalling: boolean;
  };
  
  // Lifecycle
  isAvailable(): Promise<boolean>;
  testConnection(): Promise<TestResult>;
  listModels(): Promise<ModelInfo[]>;
  
  // Core
  generate(request: GenerateRequest): Promise<AIResponse>;
  stream?(request: GenerateRequest): AsyncIterator<Chunk>;
  
  // Status
  getStatus(): ProviderStatus;
}
```

### 5.2 Single Source of Truth (Priorité 1)

Centraliser l'état des providers dans un store unifié:

```typescript
// src/stores/providersStore.ts
interface ProvidersState {
  // Sélection active
  selectedProviderId: AIProviderId;
  selectedModelId: string | null;
  
  // État des providers
  providers: Record<AIProviderId, ProviderInfo>;
  
  // Health
  lastHealthCheck: Record<AIProviderId, number>;
  
  // Actions
  setSelectedProvider(id: AIProviderId): void;
  setSelectedModel(modelId: string): void;
  refreshModels(providerId: AIProviderId): Promise<void>;
  testProvider(providerId: AIProviderId): Promise<TestResult>;
}
```

### 5.3 Normalized Error Handling (Priorité 2)

Uniformiser les erreurs:

```typescript
export interface ProviderError {
  code: 
    | 'INVALID_KEY'
    | 'RATE_LIMIT'
    | 'TIMEOUT'
    | 'QUOTA_EXCEEDED'
    | 'NETWORK_ERROR'
    | 'UNKNOWN';
  message: string;
  provider: AIProviderId;
  retryable: boolean;
}
```

---

## 6. Checklist Implémentation GitHub Copilot

- [ ] **Phase 0:** Diagnostic complet ✅ (ce document)
- [ ] **Phase 1:** Architecture Unified Providers
  - [ ] Définir `AIProviderId` avec 'copilot'
  - [ ] Créer interface `AIProviderAdapter`
  - [ ] Documenter contrat unifié
- [ ] **Phase 2:** Gouvernance UI
  - [ ] Ajouter Copilot dans SecretsTab
  - [ ] Créer APIProviderCard Copilot
  - [ ] Implémenter test connexion
  - [ ] Liste modèles dynamique
- [ ] **Phase 3:** Backend Integration
  - [ ] Créer `copilot.rs` provider
  - [ ] Implémenter `chat_generate_copilot`
  - [ ] Ajouter KEY_COPILOT secrets
  - [ ] Mettre à jour registry
- [ ] **Phase 4:** Chat Routing
  - [ ] Ajouter 'copilot' dans useChat
  - [ ] Router vers Copilot adapter
  - [ ] Tester streaming
  - [ ] Normaliser erreurs
- [ ] **Phase 5:** Validation
  - [ ] Tests unitaires
  - [ ] Tests intégration
  - [ ] Tests E2E Chat
  - [ ] Documentation utilisateur

---

## Annexe: Fichiers Critiques

**Frontend:**
- `/src/services/ai/types.ts` — Types AI
- `/src/services/ai/providers/` — Adapters providers
- `/src/hooks/useChat.ts` — Hook principal Chat
- `/src/features/governance-center/` — UI Gouvernance
- `/src/lib/security.ts` — Wrapper secureInvoke

**Backend:**
- `/src-tauri/src/commands/chat_generate_commands.rs` — Commands Tauri
- `/src-tauri/src/api_hub/` — Implémentations providers
- `/src-tauri/src/security/secrets_engine.rs` — Stockage chiffré
- `/src-tauri/src/overdrive/chat_orchestrator.rs` — Orchestrateur
- `/src-tauri/src/api_hub/provider_registry.rs` — Registre providers

**Tests:**
- `/src/__tests__/omega-provider-tests.test.ts`
- `/src-tauri/tests/integration/fallback_chain_test.rs`

---

**Prochaine étape:** PHASE 1 — Architecture Unified Providers
