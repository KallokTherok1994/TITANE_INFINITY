# PROVIDER MATRIX

| Provider | Configuré | Backend présent | Clé gérée | Sélectionnable | Appelable | Fallback | Meta exposée | Runtime prouvé | Statut |
|---|---|---|---|---|---|---|---|---|---|
| **Ollama** | ✅ env TITANE_OLLAMA_MODEL | ✅ ollama.rs + ollama_command.rs | N/A (local) | ✅ default | ✅ query_ollama() | ✅ pick_fallback_model() | ✅ model tags | ⚠️ UNKNOWN | **PARTIAL** |
| **TitaneLocal** | ✅ providers/titaneLocal.ts | ✅ eager provider | N/A | ✅ fallback garanti | ✅ | ✅ hardcoded | ⚠️ PARTIAL | ⚠️ UNKNOWN | **PARTIAL** |
| **Gemini** | ✅ providers/gemini.ts lazy | ✅ chat_generate_gemini IPC | ✅ SecureSecretsEngine | ✅ IPC | ✅ si clé présente | ❌ aucun | ✅ chat_get_providers_status | ❌ key-required | **PARTIAL** |
| **OpenAI** | ✅ providers/openai.ts lazy | ✅ chat_generate_openai IPC | ✅ SecureSecretsEngine | ✅ IPC | ✅ si clé présente | ❌ aucun | ✅ | ❌ key-required | **PARTIAL** |
| **Anthropic/Claude** | ✅ providers/claude.ts lazy | ✅ chat_generate_claude IPC | ✅ SecureSecretsEngine | ✅ IPC | ❌ aucun | ❌ aucun | ✅ | ❌ key-required | **PARTIAL** |
| **Copilot** | ✅ providers/copilot.ts | ✅ chat_generate_copilot IPC | ✅ SecureSecretsEngine | ✅ IPC | ✅ si clé présente | ❌ aucun | ✅ | ❌ key-required | **PARTIAL** |
| **GLM-4.6V** | ✅ glm46v.ts baseUrl:8000 | ✅ glm46v_commands.rs | N/A (local) | ✅ IPC | ✅ | ❌ | ⚠️ | ⚠️ UNKNOWN | **PARTIAL** |
| **TauriChat** | ✅ tauriChat.ts | ⚠️ dépend feature flags | N/A | ✅ eager | ⚠️ feature-gated | ✅ TitaneLocal | ⚠️ | ⚠️ UNKNOWN | **PARTIAL** |

## Observations

- **Seul Ollama est testable sans API key en local**
- Cloud providers (Gemini/OpenAI/Claude/Copilot) fonctionnels **seulement si API key configurée via SecureSecretsEngine**
- `streaming` via transport layer = **TODO non livré** (ollama.ts:673 `// TODO v27.2Ω`)
- `pick_fallback_model()` en Rust = fallback model list query depuis Ollama tags API → RÉEL
- NeuralSelection dans AIOrchestrator = cascade stats-based (success rate, latency, circuit breaker) ≠ sélection sémantique

## Classification MULTI-PROVIDER

**VERDICT: `PARTIAL`**

**Justification**:
- Code complet pour 6+ providers ✅
- IPC commands enregistrées ✅
- Sécurité clés AES-256 ✅
- Pas de runtime proof simultané 2+ providers ❌
- Streaming non livré ❌
- Cloud key-gated en prod ❌
- Feature flag "full" requis pour legacy bridge ❌

> PARTIAL car: code + wiring complets, mais runtime multi-provider non prouvé et streaming absent.
