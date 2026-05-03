# OLLAMA RUNTIME MAP — TITANE_INFINITY

> 2026-05-02 — Ollama Dev fine-tuning truth: la surface de développement Copilot VS Code est renforcée par un prompt dédié `.github/prompts/ollama-dev-session.prompt.md`, une doctrine enrichie dans `.github/agents/ollama-dev-chat-boundary.agent.md` (capacités qwen3.5:9b, diagnostic MCP, comportements interdits), et des validateurs durcis (`scripts/verify/verify-ollama-copilot-boundary.sh`, `scripts/verify/verify-vscode-agent-workflow.sh`, `scripts/verify/verify_prompt_files_index.sh`). Les defaults produit restent inchangés sur `gemma2:2b` et la séparation Dev/Chat reste gouvernée sans mutation partagée.

> 2026-05-02 — Boundary normalization truth: les surfaces runtime partagées reviennent à la baseline produit `gemma2:2b` (`src/config/ollamaDefaults.ts`, `config/championChallenger.json`, `src-tauri/src/runtime_config.rs`, `src-tauri/src/config/update.rs`, `src-tauri/src/ollama.rs`, `src-tauri/src/ai/ollama.rs`, `src-tauri/src/ollama_provider_refactor.rs`), tandis que la doctrine de développement GitHub Copilot VS Code reste isolée sur `qwen3.5:9b` dans `.github/copilot-instructions.md`, `.github/instructions/titane.instructions.md`, `AGENTS.md`, `.github/agents/ollama-dev-chat-boundary.agent.md` et `scripts/verify/verify-ollama-copilot-boundary.sh`. Communication autorisée uniquement via validateurs, preuves et interfaces explicites; aucune mutation partagée de default runtime n est permise.

> 2026-05-02 — Model upgrade: modèle gouverné migré de `gemma2:2b` vers `qwen3.5:9b` (vision+tools+thinking, contexte 256K, 6.6 GB). Raison: gemma2:2b est text-only sans vision ni tool-calling natif — incompatible avec Cline ACT et les exigences dev VS Code. Surfaces mises à jour: `src/config/ollamaDefaults.ts`, `config/championChallenger.json` (×8), `src-tauri/src/ollama.rs`, `src-tauri/src/ai/ollama.rs`, `src-tauri/src/ollama_provider_refactor.rs` (model + num_ctx 8192→32768), `src-tauri/src/runtime_config.rs` (defaults + test assert), `src-tauri/src/config/update.rs`, `scripts/verify/verify-ollama-cline-alignment.sh`. Gate anti-drift `verify:ollama:cline` mis à jour pour vérifier `qwen3.5:9b`. AutoHeal entry `autoheal-ollama-model-qwen35-9b-20260502` ajoutée.

> 2026-05-02 — Active chat context truth tightened: `src/services/chat/tokenCounter.ts` et `src/services/ai/contextManager.ts` reconnaissent maintenant explicitement `gemma2:2b` comme modèle Ollama gouverné à `8192` tokens. La surface active `src/components/chat/ContextUsage.tsx` n exagère donc plus artificiellement sa fenêtre via le fallback `gpt-4-turbo` à `128000` tokens quand le chat tourne sur le champion local.

> 2026-05-02 — Active chat config truth tightened: le socle canonique `gemma2:2b` était déjà aligné sur les surfaces principales, mais deux surfaces de chat actives dérivaient encore. `src/services/ai/ConversationManager.ts` exposait `defaultModel: 'llama3'` pour la voie locale, et `src/hooks/useChat.ts` recommandait encore `ollama pull llama3.1:latest` dans le message de récupération utilisateur. Les deux surfaces pointent désormais vers `gemma2:2b`, ce qui réaligne la configuration chat active, la guidance utilisateur et la vérité runtime Ollama.

> 2026-05-02 — Authority-boundary correction: la posture `Copilote de Cohérence` demandée par l utilisateur est re-routée vers l environnement de développement Cline/VS Code (`.clinerules/00-kernel.md`, `.clinerules/hooks/TaskStart`, `.cline/config-optimized.sh`) et ne pilote plus directement le runtime conversationnel TITANE ni le fallback Ollama. La vérité Ollama runtime revient à une responsabilité strictement produit: modèle, loopback, fallback local et contrat conversationnel naturel.

> 2026-05-02 — Daily conversation truth tightened: `src/services/ai/responsePolicy.ts` route désormais les modes `default` et `standard` vers le profil `BALANCED` au lieu de `DEVELOPED`, et les profils quotidiens `BALANCED`, `DEVELOPED` et `DEEP` gardent `ollama` en tête de `preferredProviders`. `src/services/ai/providers/ollama.ts` et `src/config/chatModes.config.ts` ont été assouplis pour produire une réponse plus conversationnelle, proportionnée et naturelle, sans perdre la gouvernance locale ni la vérité runtime. Preuves: Vitest `responsePolicy.unit`, `chatDefaultInstructions`, `chatModes.phase17`, `chatModes.runtimeDepth`, `useChat-streaming`, `online-availability`, et `verify:ollama:cline` PASS.

> 2026-04-26 — Transport truth tightened: `src/services/ai/transports/ollamaTransport.ts` distingue maintenant trois voies effectives sans ambiguite. `BROWSER_PROXY` reste reserve au vrai navigateur Vite/LAN via `/api/ollama`, `REMOTE_GATEWAY` repasse par la voie distante gouvernee existante au lieu d un fetch same-origin, et le contexte Node/test reste qualifie `IPC` pour conserver le contrat One Door et les tests de transport. Preuve attendue: contrat Vitest transport vert sans `fetch()` en Node/test, proxy navigateur conserve via les gardes statiques et runtime deja qualifies.

> 2026-04-27 — Browser/mobile proxy truth: la voie navigateur/mobile sur `http://<lan>:1420/titane` n est plus bloquee par le fallback local quand Tauri est absent. `src/services/api/chat.ts` tente maintenant Ollama en premier sur la branche web pour `auto|ollama`, `src/services/ai/transports/ollamaTransport.ts` utilise le proxy same-origin `/api/ollama`, et `vite.config.ts` retire le header `Origin` avant forward vers `127.0.0.1:11434`. Preuve: direct Ollama `POST /api/generate` retourne `403` avec `Origin: http://192.168.2.16:1420`, alors que le meme POST via `http://127.0.0.1:1420/api/ollama/generate` retourne `200` apres correctif; la surface `/titane` affiche ensuite `Requested: auto | Provider: ollama` sur un nouveau tour web/mobile.

> 2026-04-25 — Audit & correction complète backend+frontend: (1) `ollama_generate` (Rust) retourne désormais `Ok({ok:false, error:Some(e)})` au lieu de `Err(String)` — conformité Rule 6 IPC contract; (2) `ai_check_ollama_status` sonde maintenant `GET /api/version` (timeout 3s, non-bloquant) pour publier la version réelle au lieu de `"unknown"`; commentaire section `LEGACY CLIENT` dupliqué supprimé; (3) `OllamaConfig::default()` dans `ollama_provider_refactor.rs` corrigé: `model: "gemma2:2b"`, `num_ctx: 8192` — alignement canon; (4) `const IS_TAURI` inutilisée retirée de `ollamaTransport.ts` (dead code post-refactor IPC-only). Verdict: PASS — tous les gates `verify:ollama:cline`, `guard:ollama-proxy`, `tsc --noEmit`, `detect_recurrence` green.

> 2026-04-24 — Frontend CSP one-door truth: `src/security/constants.ts` ne liste plus `http://127.0.0.1:11434` dans `connect-src`. La surface frontend reste bornee a `'self'`; les appels Ollama passent par le transport IPC gouverne `src/services/ai/transports/ollamaTransport.ts`, puis par le backend Tauri qui possede le loopback local.

> 2026-04-22 — Backend runtime default truth: `src-tauri/src/runtime_config.rs`, `src-tauri/src/config/update.rs`, `src-tauri/src/ai/ollama.rs` et `src-tauri/src/ollama.rs` utilisent de nouveau `gemma2:2b` comme modèle Ollama par défaut gouverné. Cette voie retire une dérive backend vers `llama3.1:latest` qui contredisait déjà la cartographie active et faisait échouer la qualification Rust de la runtime config.

> 2026-04-19 — Android runtime endpoint qualification truth: `scripts/e2e/validate-android-backends.sh` ne se limite plus a verifier qu un `ollamaUrl` Android est non-loopback. La voie de qualification extrait maintenant aussi `ollamaModel`, probe `${ollamaUrl}/api/tags` via `curl`, valide le JSON de l inventaire et exige que le modele configure par l application Android installee soit effectivement publie par l endpoint cible. La lane device `e2e/android/android-build-ui.device.spec.ts` capture en plus `runtime_settings_v1.json` et `runtime_config.json` pour sceller cette verite sur l APK reellement lancee.

> 2026-04-18 — Governance endpoint classification truth: `src-tauri/src/ai/ollama.rs::ai_check_ollama_status` ne se contente plus de répondre `available/models`. La voie canonique résout maintenant `url`, `model`, `endpoint_kind`, `endpoint_source`, `model_source`, `network_used` et `health` depuis `src-tauri/src/runtime_config.rs` avant probe, puis `src/features/governance-center/components/APIProviderCard.tsx` expose cette vérité sur la carte `provider-card-ollama` sans retomber sur le faux alias `/api/ollama`.

> 2026-04-18 — Hook/config propagation truth: la même réponse enrichie `ai_check_ollama_status` alimente désormais `src/hooks/useBackendHealth.ts` et `src/pages/ConfigurationHub.tsx`. Le hook publie `ollamaDetails` pour distinguer loopback vs distant dans les surfaces de dégradation, et ConfigurationHub rend les champs runtime `endpoint/source/model-source/network-used/health` en lecture seule sans maintenir un deuxième modèle de vérité frontend.

> 2026-04-18 — Transport inventory truth: `src/services/ai/transports/ollamaTransport.ts` aligne désormais `ollamaCheckHealth()` sur `ai_check_ollama_status` au lieu de renvoyer un faux inventaire `[gemma2:2b]` après `ping_ollama`. Les providers qui consomment ce transport reçoivent donc la liste réelle des modèles détectés et un statut offline honnête quand le backend déclare un endpoint indisponible.

> 2026-04-18 — Requested-used-shown model truth: la voie conversationnelle active conserve désormais la vérité du modèle au-delà du provider. `src/services/conversationEngine.ts` normalise `model_requested`, `model_used` et `fallback_used`, `src/hooks/useConversationEngine.ts` les persiste sur le message assistant, et `src/components/sections/ConversationSection.tsx` les expose dans le résumé runtime et les badges de la surface canonique `/titane?tab=conversation`.

> 2026-04-17 — Local AI alignment truth: the governed local stack is now normalized on `gemma2:2b` across the frontend provider default, champion/challenger registry, verification scripts, Windows Ollama spin-up proof, and local Cline safeguards. `verify:ollama:cline` is the canonical anti-drift gate for this surface, and no local tooling layer may reintroduce a token/passphrase gate for builds or deploys.

> 2026-04-16 — Backend Ollama canonical loopback truth: `src-tauri/src/overdrive/chat_orchestrator.rs` utilise maintenant `http://127.0.0.1:11434` pour le probe, la génération et le streaming, et le fallback streaming par défaut est réaligné sur `gemma2:2b` afin d'éviter les dérives `localhost`/IPv6 et les écarts de modèle dans les lanes desktop gouvernées.

**Date**: 2026-04-02
**Verdict**: QUALIFIED
**Status**: DISCOVERY_COMPLETE

---

## 1. BOOTSTRAP TRUTH

| Component         | Version                | Status               |
| ----------------- | ---------------------- | -------------------- |
| Node.js           | v24.14.1               | ✅ Active            |
| pnpm              | 10.30.2                | ✅ Active            |
| Cargo             | 1.94.0                 | ✅ Active            |
| rustc             | 1.94.0                 | ✅ Active            |
| Ollama            | 0.18.0 (client 0.18.2) | ⚠️ Version mismatch  |
| Git HEAD          | 0ff58c9c6              | ✅ MAIN branch       |
| Branch divergence | 4173 local vs 1 remote | ⚠️ Significant drift |

---

## 2. OLLAMA MODELS AVAILABLE

| Model                    | Size   | Modified     | Status                       |
| ------------------------ | ------ | ------------ | ---------------------------- |
| gemma2:2b                | 1.6 GB | 6 weeks ago  | ✅ ACTIVE (loaded in memory) |
| llama3:latest            | 4.7 GB | 2 weeks ago  | ⚠️ Available                 |
| qwen2.5:latest           | 4.7 GB | 2 months ago | ⚠️ Available                 |
| codellama:latest         | 3.8 GB | 3 months ago | ⚠️ Available                 |
| deepseek-coder-v2:latest | 8.9 GB | 3 months ago | ⚠️ Available                 |
| gemma2:latest            | 5.4 GB | 3 months ago | ⚠️ Available                 |
| llama3.2:1b              | 1.3 GB | 3 months ago | ⚠️ Available                 |
| llama3.2:latest          | 2.0 GB | 3 months ago | ⚠️ Available                 |
| llama3.1:latest          | 4.9 GB | 3 months ago | ⚠️ Available                 |
| phi3.5:latest            | 2.2 GB | 3 months ago | ⚠️ Available                 |

**Active Model**: gemma2:2b (2.1 GB loaded, 100% CPU, 4096 context)

---

## 3. OLLAMA PATH MAP

### 3.1 Frontend → Backend Path

```
UI (Chat.tsx)
  ↓
chatEngine.ts (generate/stream)
  ↓
orchestrator.ts (selectOptimalProvider)
  ↓
providers/ollama.ts (ollamaProvider)
  ↓
transports/ollamaTransport.ts (IPC mode)
  ↓
secureInvoke('ollama_generate')
  ↓
Tauri IPC Bridge
  ↓
src-tauri/src/ollama.rs (query_ollama)
  ↓
HTTP POST http://127.0.0.1:11434/api/generate
  ↓
Ollama Server
```

### 3.2 Configuration Entry Points

| Config Source | Variable               | Value                  | Priority           |
| ------------- | ---------------------- | ---------------------- | ------------------ |
| Environment   | `OLLAMA_BASE_URL`      | http://127.0.0.1:11434 | HIGH               |
| Environment   | `OLLAMA_URL`           | (fallback)             | MEDIUM             |
| Environment   | `TITANE_OLLAMA_MODEL`  | gemma2:2b              | HIGH               |
| Environment   | `VITE_OLLAMA_MODEL`    | gemma2:2b              | HIGH               |
| Hardcoded     | `DEFAULT_OLLAMA_MODEL` | gemma2:2b              | LOW                |
| Modelfile     | FROM                   | llama3.1               | N/A (custom model) |

### 3.3 Transport Mode

- **Mode**: IPC (Inter-Process Communication via Tauri)
- **HTTP**: Disabled (functions redirect to IPC)
- **Health Check**: `ping_ollama` (lightweight backend ping)
- **Timeout**: 45000ms (configurable via `PROVIDER_TIMEOUTS.ollama`)

---

## 4. CONTEXT & GENERATION CONFIG

| Parameter             | Value            | Source                              |
| --------------------- | ---------------- | ----------------------------------- |
| Temperature           | 0.7              | `OLLAMA_CONFIG.temperature`         |
| numCtx                | 8192             | `OLLAMA_CONFIG.numCtx`              |
| Max retries           | 3                | `OLLAMA_CONFIG.maxRetries`          |
| Max errors            | 5                | `OLLAMA_CONFIG.maxErrors`           |
| Health check interval | 300000ms (5 min) | `OLLAMA_CONFIG.healthCheckInterval` |
| Timeout               | 45000ms          | `PROVIDER_TIMEOUTS.ollama`          |

**Note**: Modelfile `num_ctx` is aligned with frontend `numCtx 8192` — safe default for 8GB VRAM.

---

## 5. PROVIDER CASCADE ORDER

```
1. claude (lazy, cloud) → +50 score
2. openai (lazy, cloud) → +45 score
3. copilot (lazy, cloud) → +42 score
4. gemini (lazy, cloud) → +40 score
5. tauri-backend (eager) → +20 score
6. ollama (eager) → +30 score (auto mode), +200 score (local mode)
7. titane-local (eager, fallback) → +0 score
```

**Current Mode**: auto (daily conversational path = local-first governed)
**Ollama Role**: Primary provider on default daily conversational profiles; fallback remains available for other paths
**Local Mode**: Forces Ollama exclusively (+200 boost)

---

## 6. CURRENT LOCK: REQUESTED_USED_SHOWN_UNPROVEN

**Problem**: When Ollama is selected as provider, the UI does not verify that the requested model was actually used by the backend. The response shows `provider: 'ollama'` but does not confirm `model_used`.

**Evidence**:

- `ollama.ts` returns `model: data.model || OLLAMA_CONFIG.model` (line ~200)
- `ollamaTransport.ts` returns `model: result.model` from IPC
- `ollama.rs` returns `response: String` (no model field in response)
- UI shows provider name but NOT model name

**Gap**: REQUESTED → USED → SHOWN chain is incomplete.

---

## 7. FALLBACK PATH

- **Frontend fallback**: `ollamaProvider.generate()` fails → orchestrator tries next provider
- **Backend fallback**: `ollama.rs` tries default model → fallback model via `pick_fallback_model()`
- **Emergency**: `titane-local` provider (always available)

**Risk**: Fallback model selection in backend may silently use different model than requested.
