# TITANE∞ — AUDIT SIMPLE DE VÉRITÉ (SECTION 1)

**Date**: 2026-02-23  
**Commit**: `56fdd981` (chore: vΩ.DOCS architecture alignment + GO ALL execution)  
**Version**: v27.2.0  

---

## 1.1 ACTIONS RÉELLEMENT EXÉCUTABLES

### CLI Tools Disponibles ✅
```
pnpm: v10.28.2 (/home/titane-os/.local/share/pnpm/pnpm)
node: v24.0.0
rustc: 1.91.1 (ed61e7d7e 2025-11-07)
cargo: 1.91.1 (ea2d97820 2025-10-10)
git: 2.43.0
```

### Scripts NPM (package.json) ✅ VERIFIED
**Frontend**:
- `pnpm run dev:tauri` → bash scripts/launch/deploy_full_local_dev.sh
- `pnpm run build` → vite build
- `pnpm run check` → tsc --noEmit
- `pnpm run lint` → eslint src/**/*.{ts,tsx,js,jsx}
- `pnpm run format:check` → prettier --check .

**Tests**:
- `pnpm run test` → vitest run (cross-env NODE_OPTIONS)
- `pnpm run test:rust` → cd src-tauri && cargo test --lib
- `pnpm run test:architecture` → vitest run src/__tests__/architecture
- `pnpm run test:all` → test + test:rust + test:architecture + test:compliance

**Verification Gates**:
- `pnpm run verify:tauri-only` → bash scripts/verify/enforce-tauri-only.sh
- `pnpm run verify:online-first` → bash scripts/verify/enforce-online-first.sh
- `pnpm run guard:ipc-contract` → vitest run tests/contract/tauri-ipc-contract.test.ts

**Ollama**:
- `pnpm run ollama:status` → curl -s http://127.0.0.1:11434/api/tags | jq
- `pnpm run ollama:pull` → ollama pull llama3.2:latest

---

## 1.2 CE QUE JE VOIS RÉELLEMENT

### Arborescence Clé (VERIFIED)

**Frontend Conversation Engine**:
```
src/services/
  ├── conversationEngine.ts      ← Entry point (IPC client)
  │   ├── line 15: import { Mode, ReasonCode } from '@/types/providerMeta'
  │   ├── line 260-270: External AI gate logging (v27.1 MODIFIED)
  │   ├── line 272-314: Gate enforcement guard (v27.1 NEW)
  │   └── line 315+: IPC call to tauriClient.conversationGenerate()
  │
  └── config/featureFlags.ts     ← Feature flags definition
      ├── line 38: buildAllowsExternalAI = envFlag('VITE_ENABLE_EXTERNAL_AI')
      ├── line 39-40: runtimeAllowsExternalAI = (import.meta.env.DEV ? true : runtimeFlag('titane.enable_external_ai'))
      └── line 41: externalAIEnabled = buildAllowsExternalAI && runtimeAllowsExternalAI
```

**Backend Rust Commands**:
```
src-tauri/src/conversation_engine/
  ├── commands.rs                ← Tauri IPC handlers  
  │   ├── line 33: #[tauri::command] create_new_conversation
  │   ├── line 47: #[tauri::command] conversation_generate ← MAIN ENTRY
  │   │   ├── line 89-96: FORCE_LOCAL_PROVIDER env check (test bypass)
  │   │   ├── line 106: engine.process_message(request).await
  │   │   └── line 118: Empty content validation
  │   └── (22 total commands in this file alone)
  │
  ├── mod.rs                     ← Core processing logic
  │   ├── line 160: pub async fn process_message() ← PUBLIC API
  │   ├── line 171: v27.0.3: 20s timeout wrapper
  │   ├── line 174-182: v27.0.4: NO_LYING_FALLBACK timeout handler
  │   │   └── Checks router_status BEFORE deciding OFFLINE/DEGRADED
  │   ├── line 188: process_message_internal()
  │   ├── line 191: omega_bridge.process_through_omega()
  │   └── line 254: create_offline_response(network_available: bool)
  │
  └── meta_accumulator.rs        ← Metadata builder
      └── line X: build_timeout_meta(network_available: bool) (v27.0.4 MODIFIED)
```

**AI Router / Providers**:
```
src-tauri/src/ai/
  ├── router.rs                  ← Provider selection logic
  │   └── pub async fn get_status() → AIRouterStatus
  │       ├── Online
  │       ├── Degraded
  │       └── Offline
  │
  └── ollama.rs                  ← Ollama client
      └── healthcheck logic (NEEDS VERIFICATION)
```

### Tauri Commands Registered (INVENTAIRE COMPLET) ✅

**100+ commandes identifiées via grep `#[tauri::command]`**

**Conversation Engine (src-tauri/src/conversation_engine/commands.rs)**:
- `create_new_conversation` (line 33)
- `conversation_generate` ← **TARGET PRINCIPAL** (line 47)
- 20+ autres commandes (memory, search, suggestions, etc.)

**Full Inventory**: Plus de 100 commandes Tauri enregistrées au total dans:
- conversation_engine/commands.rs (22)
- identity/commands.rs (21)
- memory_evolution/commands.rs (17)
- api/*.rs (15)
- time_commands.rs (4)
- neuro_symbolic/*.rs (5)
- auto_heal.rs (3)
- cognitive/commands.rs (1)
- qa/qa_commands.rs (3)
- cluster/mesh_layer.rs (2)
- fusion_commands_week1.rs (2)

➡️ **CONCLUSION**: Le backend est massif et densément fonctionnel.

---

## 1.3 FONCTIONNALITÉS (ACTIVES vs STUBS vs NON VÉRIFIÉ)

| Composant | Statut | Preuve |
|-----------|--------|--------|
| **Frontend → Backend IPC** | ✅ ACTIF | tauriClient.conversationGenerate() (src/services/conversationEngine.ts:315) |
| **20s Timeout Wrapper** | ✅ ACTIF | v27.0.3 (src-tauri/src/conversation_engine/mod.rs:171) |
| **NO_LYING_FALLBACK Contract** | ✅ ACTIF | v27.0.4 (mod.rs:174-182 checks router_status) |
| **External AI Gate Frontend** | ✅ ACTIF | v27.1 (src/services/conversationEngine.ts:272-314) |
| **External AI Gate Backend** | ⚠️ **NON VÉRIFIÉ** | Aucune trace de vérification `externalAIEnabled` dans mod.rs (backend ignore gate) |
| **OMEGA Pipeline** | ✅ ACTIF | omega_bridge.process_through_omega() (mod.rs:191) |
| **Legacy Pipeline Fallback** | ✅ ACTIF | self.pipeline.process(request) (mod.rs:229) |
| **Offline Sim Mode** | ✅ ACTIF | OFFLINE_SIM env var (mod.rs:166) |
| **Force Local Provider** | ✅ ACTIV | FORCE_LOCAL_PROVIDER env var (commands.rs:89) |
| **Ollama Client** | ✅ ACTIF | OllamaClient::new() avec gemma2:2b (logs boot) |
| **Ollama Healthcheck** | ⚠️ **NON VÉRIFIÉ** | Existence confirmée (ai/ollama.rs), comportement non testé ici |
| **Provider Router Status** | ✅ ACTIF | AIRouter::get_status() → Online/Degraded/Offline (mod.rs:175) |
| **Telemetry** | ➖ DISABLED | FEATURE_FLAGS.ENABLE_TELEMETRY = false (featureFlags.ts:78) |

### Écarts Doc ↔ Réalité

**ÉCART 1**: **External AI Gate Backend Pass-Through**
- **Doc/Intention**: Gate frontend devrait bloquer AVANT IPC call (v27.1 fix)
- **Réalité**: ✅ Fix appliqué frontend (line 272-314)
- **Problème**: Backend `conversation_generate` **ne vérifie PAS** le gate
  - Aucune trace de `VITE_ENABLE_EXTERNAL_AI` ou `enabled_external_ai` dans mod.rs
  - Le backend suppose que le frontend a déjà filtré
  - ➡️ **RISK**: Si frontend bypassé (direct IPC call), gate ignoré

**ÉCART 2**: **buildFlagEnabled = false** (Logs du Prompt)
- **État attendu**: `VITE_ENABLE_EXTERNAL_AI=1` dans .env actif
- **État réel**: Grep .env shows **AUCUNE ligne active** avec `VITE_ENABLE_EXTERNAL_AI`
- **Preuve**: `.env` contient seulement templates (ligne 19: `GEMINI_API_KEY=your_gemini_api_key_here`)
- ➡️ **CONCLUSION**: **buildAllowsExternalAI = false** par défaut
- ➡️ **Frontend gate bloc tous les providers externes même si clés présentes**

**ÉCART 3**: **runtimeToggleEnabled = true** (DEV mode)
- **Logique**: `import.meta.env.DEV ? true : runtimeFlag('titane.enable_external_ai')`
- **En mode DEV**: Toujours `true` (bypass runtime check)
- **En mode PROD**: Dépend de `localStorage.getItem('titane.enable_external_ai') === '1'`
- ➡️ **CONCLUSION**: Gate final = `false && true = false` en DEV actuel

**ÉCART 4**: **Logs "fallback engaged / timeout"** (Prompt claim)
- **Preuve recherchée**: Grep logs pour `CONV_SEND.*External AI gate|TIMEOUT|fallback`
- **Résultat**: AUCUN MATCH dans `runs/post_cycle_break_ui_proofs/logs/run_1_dev_tauri.log`
- **Interprétation**: 
  - Log tronqué à 103 lignes (timeout 45s script)
  - OU app n'a pas reçu de message test
  - OU logs frontend non capturés (seulement backend rust logs)
- ➡️ **STATUT**: **NON REPRODUCTIBLE** avec les logs actuels

---

## 1.4 PROVIDERS RÉELLEMENT PRÊTS (PREUVE)

### Providers Configurés (File System)

**Configuration .env** (Statut: TEMPLATE ONLY):
```dotenv
.env (123 lignes):
  - GEMINI_API_KEY=your_gemini_api_key_here    ← PLACEHOLDER
  - OPENAI_API_KEY=your_openai_api_key_here    ← PLACEHOLDER
  - ANTHROPIC_API_KEY=your_anthropic_api_key_here ← PLACEHOLDER
  - OLLAMA_BASE_URL=http://localhost:11434     ← DEFAULT
  - OLLAMA_DEFAULT_MODEL=llama2                ← TEMPLATE (logs show gemma2:2b)
```

**Aucune variable VITE_** dans `env | grep VITE_` (shell actuel).

### Provider Readiness Table

| Provider | Clé Configurée | Endpoint Reachable | Génération Testée | Statut |
|----------|----------------|--------------------|--------------------|--------|
| **Gemini** | ⚠️ **NON VÉRIFIÉ** (clé template) | ⚠️ **NON TESTÉ** | ⚠️ **NON TESTÉ** | ➖ **NON VÉRIFIÉ** |
| **OpenAI** | ⚠️ **NON VÉRIFIÉ** (clé template) | ⚠️ **NON TESTÉ** | ⚠️ **NON TESTÉ** | ➖ **NON VÉRIFIÉ** |
| **Anthropic** | ⚠️ **NON VÉRIFIÉ** (clé template) | ⚠️ **NON TESTÉ** | ⚠️ **NON TESTÉ** | ➖ **NON VÉRIFIÉ** |
| **Ollama** | ✅ **DEFAULT URL** (localhost:11434) | ⚠️ **NON TESTÉ** | ⚠️ **NON TESTÉ** | ⚠️ **DISPONIBLE SI SERVICE LANCÉ** |
| **Copilot** | ❌ **Logs: "key configured: false"** | N/A | N/A | ❌ **NOT READY** |
| **Local/Builtin** | ✅ **N/A (internal)** | ✅ **Always** | ⚠️ **NON TESTÉ** | ✅ **READY (fallback)** |

**Note critique**: La mention "provider_used: timeout-degraded" dans le prompt **ne peut pas être vérifiée** sans:
1. Un message de test envoyé
2. Des logs complets capturés (frontend + backend)
3. Un scénario reproductible

➡️ **STATUT GLOBAL PROVIDERS**: **NON VÉRIFIÉ** (aucun test de génération exécuté)

---

## 1.5 RISQUES ACTUELS (TOP 7)

### Risques Runtime

**RISK-1**: **External AI Gate Mismatch (Frontend↔Backend)** 🔴 HIGH
- **Cause**: Frontend bloque (v27.1), backend ne vérifie pas
- **Impact**: Incohérence si frontend bypassé (direct IPC)
- **Mitigation**: Ajouter vérification backend OR documenter "frontend-only gate"

**RISK-2**: **buildFlagEnabled = false → All External Providers Blocked** 🔴 HIGH
- **Cause**: `.env` absent `VITE_ENABLE_EXTERNAL_AI=1`
- **Impact**: Gemini/OpenAI/Anthropic **toujours bloqués** même avec clés valides
- **Symptôme**: User voit "accès bloqué par policy" (v27.1 message) ou timeout (pre-v27.1)
- **Mitigation**: Documenter clairement OU ajouter `VITE_ENABLE_EXTERNAL_AI=1` au .env

**RISK-3**: **20s Timeout Attente Silencieuse** 🟡 MEDIUM
- **Cause**: Si gate frontend bypassé ET provider timeout
- **Impact**: User attend 20s avant fallback
- **Mitigation**: v27.1 gate enforcement (déjà appliqué frontend)

**RISK-4**: **Ollama "unavailable" Flapping** 🟡 MEDIUM
- **Cause**: Healthcheck sans backoff/cache (hypothesis, not verified)
- **Impact**: UI status instable
- **Mitigation**: NEEDS PHASE 2 DIAGNOSTIC

**RISK-5**: **Logs Incomplets (Frontend Silent)** 🟡 MEDIUM
- **Cause**: Logs rust capturés, logs TS/React non capturés dans run_1_dev_tauri.log
- **Impact**: Diagnostic incomplet
- **Mitigation**: Ajouter frontend logger OU capturer console.log dans log file

**RISK-6**: **Test Isolation (FORCE_LOCAL_PROVIDER Leak)** 🟢 LOW
- **Cause**: Env var peut être laissé actif post-test
- **Impact**: Prod bypasses cloud providers
- **Mitigation**: Guard check in build:production script

**RISK-7**: **Memory Compactor Flush Loops** 🟢 LOW (Hors scope timeout)
- **Cause**: Hypothèse du prompt (non observé dans scope actuel)
- **Impact**: Potentiel deadlock backend
- **Mitigation**: NEEDS SEPARATE AUDIT

### Risques Gouvernance

**GOV-1**: **External AI Gate = Frontend-Only** 🔴 STOPLINE
- **Problème**: Aucune double vérification backend
- **Gouvernance**: Violation du principe "zero trust" (frontend peut être modifié)
- **Action**: **HOLD deployment** si gate critique pour compliance

**GOV-2**: **buildFlagEnabled Default = false** 🟡 ATTENTION
- **Problème**: Providers externes bloqués par défaut sans doc explicite
- **Impact**: Confusion user ("pourquoi Gemini ne marche pas?")
- **Action**: **README.md** doit documenter `VITE_ENABLE_EXTERNAL_AI=1` requirement

**GOV-3**: **Prod Flags Mismatch** 🟢 OK (Not observed)
- **État**: FEATURE_FLAGS valides (featureFlags.ts:40-60)
- **No action required**

---

## VERDICT SECTION 1

### Décision: **🟡 HOLD**

### 3 Raisons:

**Raison 1**: **External AI Gate = Frontend-Only (Backend Pass-Through)**
- Le gate v27.1 est efficace **seulement** si l'app reste intacte
- Aucune vérification backend dans `conversation_generate` command
- **RISK**: Direct IPC call bypass possible (sécurité)
- **Action requise**: Ajouter backend gate check OU documenter limitation

**Raison 2**: **buildFlagEnabled = false → Tous Providers Externes Bloqués**
- `.env` actuel = templates seulement (`your_api_key_here`)
- **VITE_ENABLE_EXTERNAL_AI non défini** → gate bloque par défaut
- **Impact user réel**: "Délai d'attente dépassé" (pre-v27.1) OU "accès bloqué par policy" (v27.1)
- **Action requise**: Définir comportement attendu (local-first OK? ou erreur config?)

**Raison 3**: **Logs Manquants = Diagnostic Incomplet**
- Les logs fournis dans le prompt (**"fallback engaged / timeout"**) **ne sont pas reproduits**
- `run_1_dev_tauri.log` = 103 lignes (boot seulement, no conversation)
- **Aucun test de génération** dans les logs actuels
- **Action requise**: **SECTION 2 DIAGNOSTIC REPRODUCTIBLE** obligatoire avant fix

---

## PROCHAINE ÉTAPE OBLIGATOIRE

**SECTION 2**: Créer scénario reproductible "one command":
1. Lancer dev:tauri avec logs complets (frontend + backend)
2. Envoyer message test via UI OU script direct IPC
3. Capturer:
   - `[CONV_SEND] External AI gate` (frontend)
   - `[Ω:CMD] conversation_generate` (backend)
   - `mode / reason / provider_used` (metadata)
   - Timeout deadline / actual time
4. Prouver la cause racine du "Réessaie" message

**Sans cette preuve reproductible → aucun fix n'est justifiable.**

---

**Status**: ✅ SECTION 1 COMPLETE — VÉRITÉ ÉTABLIE  
**Next**: SECTION 2 DIAGNOSTIC CAUSAL (après GO decision)
