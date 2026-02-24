# TITANE∞ — DIAGNOSTIC CAUSAL (SECTION 2)

**Date**: 2026-02-23  
**Objectif**: Prouver la cause racine du timeout + fallback  

---

## 2.1 SCÉNARIO REPRODUCTIBLE "ONE COMMAND"

### Problème de Reproduction

**CONSTAT**: Les logs fournis dans le prompt (**"fallback engaged / timeout"**) **ne peuvent pas être reproduits** avec l'état actuel du repository car:

1. **Logs incomplets**: `run_1_dev_tauri.log` = 103 lignes (boot seulement, aucun message test)
2. **Pas de test E2E automatisé** dans l'état actuel des modifications (v27.1 gate frontend seulement)
3. **Besoin d'app ouverte + interaction manuelle** pour capturer conversation complète

**SOLUTION CRÉÉE**:
- Script: `scripts/diagnostic/reproduce_conversation_trace.sh`
- Test stub: `src-tauri/src/conversation_engine/diagnostic_section2_test.rs`
- ➡️ **Statut**: ⚠️ **PRÉPARÉ MAIS NON EXÉCUTÉ** (nécessite app running + action manuelle)

### Scénario Théorique (Basé sur Analyse de Code)

**Cas 1: External AI Gate DISABLED (État Actuel Prouvé)**

```bash
# État: buildFlagEnabled=false (VITE_ENABLE_EXTERNAL_AI non défini dans .env)
# État: runtimeToggleEnabled=true (DEV mode)
# Résultat: ENABLE_EXTERNAL_AI = false && true = false

[USER] Envoie un message via UI
  ↓
[FRONTEND] conversationEngine.ts:260 — Log gate state
  allowed: false
  buildFlagEnabled: false         ← CAUSE RACINE #1
  runtimeToggleEnabled: true
  ↓
[FRONTEND] conversationEngine.ts:272 — v27.1 Guard check
  if (!externalAllowed) {
    return {
      mode: 'REMOTE',               ← Network disponible
      reason_code: 'POLICY_BLOCKED',← Policy explicite
      latency_ms: ~50ms,            ← Immédiat
      network_used: false           ← Aucun appel
    };
  }
  ↓
[USER] Voit message: 
  "Service en ligne, mais accès aux providers externes bloqué par policy/configuration."
  Latency: <200ms ✅

RÉSULTAT: ✅ Pas de timeout (v27.1 fix fonctionne)
```

**Cas 2: External AI Gate ENABLED + Provider Timeout (Scénario Hypothétique)**

```bash
# État: VITE_ENABLE_EXTERNAL_AI=1 dans .env
# État: Provider (Gemini/OpenAI) configuré mais unreachable

[USER] Envoie un message
  ↓
[FRONTEND] conversationEngine.ts:272 — Guard check
  if (!externalAllowed) { ... }  ← FALSE (gate enabled)
  ↓
[FRONTEND] conversationEngine.ts:315+ — Appel IPC
  const raw = await tauriClient.conversationGenerate(payload);
  ↓
[BACKEND] conversation_engine/commands.rs:47 — conversation_generate
  engine.process_message(request).await
  ↓
[BACKEND] mod.rs:160 — process_message()
  timeout(Duration::from_secs(20), self.process_message_internal(request))
  ↓
[BACKEND] mod.rs:188 — process_message_internal()
  omega_bridge.process_through_omega(&request).await
  ↓
[OMEGA] Appelle provider externe (Gemini/OpenAI)
  → Provider unreachable / timeout après 20s   ← CAUSE RACINE #2
  ↓
[BACKEND] mod.rs:171 — Timeout wrapper triggered
  Err(_timeout_err) détecté
  ↓
[BACKEND] mod.rs:174-182 — v27.0.4 NO_LYING_FALLBACK
  router_status = AIRouter::get_status().await
  network_available = matches!(router_status, Online | Degraded)
  ↓
[BACKEND] mod.rs:254 — create_offline_response(network_available)
  if network_available {
    mode = "DÉGRADÉ" (NOT OFFLINE)  ← v27.0.4 fix
    message = "Service momentanément dégradé..."
  } else {
    mode = "hors ligne"
    message = "Service hors ligne..."
  }
  ↓
[FRONTEND] Reçoit response
  meta.mode = "REMOTE" (si dégradé) ou "OFFLINE" (si vraiment offline)
  meta.reason_code = "TIMEOUT"
  meta.latency_ms = ~20000ms
  ↓
[USER] Voit message de fallback
  Latency: 20s ❌
```

---

## 2.2 EXTERNAL AI GATE — ANALYSE COMPLÈTE

### Gate Inputs (PROUVÉ PAR CODE)

#### Input 1: `buildFlagEnabled`
**Fichier**: `src/config/featureFlags.ts:38`
```typescript
const buildAllowsExternalAI = envFlag('VITE_ENABLE_EXTERNAL_AI');
```

**Fonction `envFlag` (ligne 13-22)**:
```typescript
export function envFlag(key: string): boolean {
  const value = env[key];  // env = import.meta.env
  if (value === true) return true;
  if (value === false) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;  ← DEFAULT si variable absente
}
```

**Valeur actuelle (PROUVÉ)**:
- `.env` grep: AUCUNE ligne `VITE_ENABLE_EXTERNAL_AI=...`
- `env | grep VITE_`: AUCUNE variable VITE_ dans shell
- ➡️ **buildAllowsExternalAI = false** ✅ PROUVÉ

#### Input 2: `runtimeToggleEnabled`
**Fichier**: `src/config/featureFlags.ts:39-40`
```typescript
const runtimeAllowsExternalAI = import.meta.env.DEV
  ? true  ← DEV mode bypass
  : runtimeFlag('titane.enable_external_ai');
```

**Fonction `runtimeFlag` (ligne 24-30)**:
```typescript
function runtimeFlag(key: string): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}
```

**Valeur actuelle (PROUVÉ)**:
- Mode: DEV (pnpm run dev:tauri)
- ➡️ **runtimeAllowsExternalAI = true** (DEV bypass) ✅ PROUVÉ

#### Gate Output: `externalAIEnabled`
**Fichier**: `src/config/featureFlags.ts:41`
```typescript
const externalAIEnabled = buildAllowsExternalAI && runtimeAllowsExternalAI;
```

**Calcul actuel**:
```
false && true = false
```

➡️ **FEATURE_FLAGS.ENABLE_EXTERNAL_AI = false** ✅ PROUVÉ

---

### Gate Outputs → Tableau Décisionnel

| Condition | buildFlagEnabled | runtimeToggleEnabled | ENABLE_EXTERNAL_AI | Comportement |
|-----------|------------------|----------------------|--------------------|--------------|
| **Actuel (DEV, no .env)** | ❌ false | ✅ true | ❌ **false** | Gate BLOQUE (v27.1 immediate response) |
| Prod, no localStorage | ❌ false | ❌ false | ❌ false | Gate BLOQUE |
| DEV, .env=1 | ✅ true | ✅ true (DEV) | ✅ true | Gate OK → Providers externes accessibles |
| Prod, .env=1, localStorage=1 | ✅ true | ✅ true | ✅ true | Gate OK |

---

## 2.3 ROUTE RÉELLE QUAND `allowed=false`

### Frontend (v27.1 Fix Appliqué) ✅

**Fichier**: `src/services/conversationEngine.ts:272-314`

```typescript
// 🔒 v27.1: ENFORCE external AI gate (ONLINE-ALL-TIME fix)
if (!externalAllowed) {
  console.warn(
    '[CONV_SEND] ⚠️ External AI gate BLOCKED: returning immediate REMOTE_BLOCKED response (no 20s wait)',
  );
  const response: ConversationResponse = {
    assistant_message: 'Service en ligne, mais accès aux providers externes bloqué par policy/configuration.',
    // ... metadata ...
    meta: {
      provider_used: 'local_only',
      provider_class: 'local',
      mode: 'REMOTE',              ← Network IS available
      reason_code: 'POLICY_BLOCKED',← Clear policy reason
      latency_ms_total: 50,        ← Instant
      network_used: false,         ← Zero network calls
      policy: 'EXTERNAL_AI_DISABLED',
    },
    decision: {
      online: true,                ← System online
      reasonCode: 'ONLINE_OK',
      providerSelected: 'local_only',
      networkUsed: false,
      mode: 'REMOTE',
    },
  };
  return response;  ← EXIT ICI, pas d'appel IPC
}

// Line 315+: Si gate OK, appel IPC
const raw = await tauriClient.conversationGenerate(payload);
```

**Conclusion Frontend**:
- ✅ Gate enforcement ACTIF (v27.1)
- ✅ Pas de call backend si `allowed=false`
- ✅ Réponse immédiate (<200ms)
- ✅ Metadata cohérent: `mode='REMOTE'` + `reason_code='POLICY_BLOCKED'` + `network_used=false`

---

### Backend (Gate Pass-Through) ⚠️

**Fichier**: `src-tauri/src/conversation_engine/commands.rs:47-130`

**Code audit**:
```rust
#[tauri::command]
pub async fn conversation_generate(
    engine: State<'_, Arc<ConversationEngineState>>,
    args: ConversationGenerateArgs,
) -> CommandResult<serde_json::Value> {
    // ... parsing args ...
    
    // ✅ Check FORCE_LOCAL_PROVIDER (test mode)
    let effective_provider = if std::env::var("FORCE_LOCAL_PROVIDER").is_ok() {
        Some("local".to_string())
    } else {
        provider
    };
    
    // ⚠️ AUCUNE vérification de VITE_ENABLE_EXTERNAL_AI ici
    // ⚠️ AUCUNE vérification de titane.enable_external_ai ici
    
    // Traiter via pipeline
    let response = engine
        .process_message(request)
        .await
        .map_err(|e| e.to_string())?;
    
    // ...
}
```

**Conclusion Backend**:
- ⚠️ **Gate NOT verified** dans backend
- Backend suppose frontend a déjà filtré
- ⚠️ **RISK**: Direct IPC call bypass possible (si app modifiée)
- ✅ **MITIGATED**: Tauri security model empêche external IPC sauf authorized contexts

---

### Cohérence Metadata ✅

**Frontend v27.1 Response Construction**:
```typescript
meta: {
  mode: 'REMOTE',              // ← User IS online
  reason_code: 'POLICY_BLOCKED',// ← NOT "TIMEOUT"
  network_used: false,          // ← NOT true
  policy: 'EXTERNAL_AI_DISABLED'
}

decision: {
  online: true,                 // ← Explicit
  reasonCode: 'ONLINE_OK',      // ← NOT OFFLINE_*
  networkUsed: false
}
```

**v27.0.4 Backend Timeout Response (si gate=enabled + timeout)**:
```rust
// mod.rs:254-280
let (message, tags, summary) = if network_available {
    (
        "Service momentanément dégradé...".to_string(),
        vec!["degraded", "timeout", "online"],  ← "online" tag
        ...
    )
} else {
    (
        "Service hors ligne...".to_string(),
        vec!["offline", "fallback"],
        ...
    )
};

// Metadata construction
ProviderDecisionMeta {
    mode: if network_available { Mode::Remote } else { Mode::Offline }, ← NO_LYING
    reason_code: ReasonCode::Timeout,
    network_used: false,  ← No successful network call
    ...
}
```

**Alignement Complet**:

| Scénario | mode | reason_code | network_used | online | Cohérence |
|----------|------|-------------|--------------|--------|-----------|
| **Gate BLOCKED (v27.1)** | REMOTE | POLICY_BLOCKED | false | true | ✅ PARFAIT |
| **Timeout, network OK (v27.0.4)** | REMOTE | TIMEOUT | false | true | ✅ CORRECT (degraded) |
| **Timeout, network DOWN (v27.0.4)** | OFFLINE | TIMEOUT | false | N/A | ✅ CORRECT (offline) |
| **Pre-v27.0.4 (OLD)** | REMOTE | TIMEOUT | false | ? | ⚠️ LYING (claimed remote but actually offline) |

---

## 2.4 CAUSE RACINE DU "RÉESSAIE" MESSAGE (PROUVÉ)

### Hypothèse du Prompt

**Claim**: User voit "Délai d'attente dépassé. Réessaie." après timeout

**Analyse Code Frontend (recherche du message)**:

```bash
$ grep -r "Réessaie\|Délai d'attente" src/
# (Results: Message UI de fallback)
```

**PROBLÈME**: Ce message **ne peut plus apparaître** avec v27.1 gate enforcement car:

1. **Si gate=false** (état actuel): Response immédiate (<200ms) avec message explicite "accès bloqué par policy"
2. **Si gate=true + provider OK**: Pas de timeout
3. **Si gate=true + provider timeout**: Message v27.0.4 "Service momentanément dégradé..." (pas "Réessaie")

### Conclusion

**Le scénario "Réessaie après 20s timeout" était valide AVANT v27.1**:

**Timeline**:
- **Pre-v27.0.4**: Gate logged but not enforced → Provider timeout → Mode=REMOTE (lying) → User confused
- **v27.0.4**: Gate logged but not enforced → Provider timeout → Mode=REMOTE if network OK, Mode=OFFLINE if network down ← NO_LYING fix
- **v27.1** (actuel): Gate enforced frontend → NO provider call if gate=false → Immediate response ✅

**État actuel** (commit 56fdd981):
- v27.0.4: Backend NO_LYING ✅ ACTIF
- v27.1: Frontend gate enforcement ✅ ACTIF
- ➡️ **Plus de timeout silencieux sur policy block** ✅ RÉSOLU

---

## 2.5 SYNTHÈSE DIAGNOSTIC

### Causes Racines Identifiées

**Cause Racine #1**: **buildFlagEnabled = false → All External Providers Blocked**
- **Fichier**: `.env` (absence de `VITE_ENABLE_EXTERNAL_AI=1`)
- **Impact**: Gemini/OpenAI/Anthropic toujours bloqués même avec clés valides
- **Symptôme User**: 
  - Pre-v27.1: "Délai d'attente dépassé" (20s wait)
  - Post-v27.1: "Accès bloqué par policy" (50ms)
- **Fix**: Documenter requirement OU ajouter `VITE_ENABLE_EXTERNAL_AI=1` au .env template

**Cause Racine #2**: **Provider Timeout (20s) — Only if Gate=Enabled**
- **Fichier**: `src-tauri/src/conversation_engine/mod.rs:171`
- **Impact**: Si provider unreachable → 20s attente avant fallback
- **Mitigation**: v27.0.4 NO_LYING wrapper ✅ ACTIF
- **État**: ✅ HANDLED (network_available check before claiming OFFLINE)

**Cause Racine #3**: **Frontend-Only Gate (Backend Pass-Through)**
- **Fichier**: `src-tauri/src/conversation_engine/commands.rs:47`
- **Impact**: Aucune double vérification backend
- **RISK**: Sécurité (si frontend modifié)
- **Mitigation**: Tauri security model (IPC limited to authorized contexts)
- **Action**: Documenter "frontend-only gate" limitation

---

## 2.6 SCÉNARIOS DE TEST REQUIS (NON EXÉCUTÉS)

### Test 1: Gate DISABLED (Actuel)
**Setup**:
- VITE_ENABLE_EXTERNAL_AI non défini
- DEV mode

**Steps**:
1. Lancer app
2. Envoyer message
3. Observer response

**Expected**:
- Latency: <200ms
- Message: "accès bloqué par policy"
- mode='REMOTE', reason_code='POLICY_BLOCKED', network_used=false

**Status**: ⚠️ **NON EXÉCUTÉ** (nécessite app + interaction)

### Test 2: Gate ENABLED + Provider OK
**Setup**:
- VITE_ENABLE_EXTERNAL_AI=1
- GEMINI_API_KEY=<valid_key>
- Réseau OK

**Steps**:
1. Envoyer message
2. Observer génération

**Expected**:
- Latency: 500ms-5000ms (normal)
- Content: Réponse Gemini
- mode='REMOTE', reason_code='OK', network_used=true

**Status**: ⚠️ **NON EXÉCUTÉ**

### Test 3: Gate ENABLED + Provider Timeout
**Setup**:
- VITE_ENABLE_EXTERNAL_AI=1
- Provider API down (mock)
- Network OK

**Steps**:
1. Envoyer message
2. Attendre timeout

**Expected**:
- Latency: ~20s
- Message: "Service moment anément dégradé"
- mode='REMOTE', reason_code='TIMEOUT', network_used=false (v27.0.4)

**Status**: ⚠️ **NON EXÉCUTÉ** (nécessite mock provider)

---

## VERDICT SECTION 2

### Décision: **🟡 HOLD** (Diagnostic complet mais non reproductible)

### 3 Raisons:

**Raison 1**: **Cause Racine #1 PROUVÉE par Code (pas par logs)**
- buildFlagEnabled=false → Gate bloque tous providers externes
- v27.1 fix fonctionne CORRECTEMENT (immediate response)
- ➡️ Comportement actuel = **WORKING AS DESIGNED**
- **Action**: Documenter claramente que `VITE_ENABLE_EXTERNAL_AI=1` requis pour providers externes

**Raison 2**: **Scénario "Réessaie après 20s" NON REPRODUIT**
- Logs fournis dans prompt: ABSENTS dans repository actuel
- État actuel: v27.1 gate enforcement empêche le timeout
- ➡️ **Scénario historical (pre-v27.1) déjà résolu**
- **Action**: Confirmer si user report est sur version <v27.1

**Raison 3**: **Tests E2E Manquants (Nécessaires pour SECTION 6)**
- Aucun test automatisé ne valide:
  - Gate enforcement (frontend)
  - Timeout fallback (backend)
  - Metadata cohérence
- ➡️ **Verification manuelle requise**
- **Action**: SECTION 6 nécessite tests before GO

---

## PROCHAINE ÉTAPE

**DECISION POINT**: Fork du workflow

**Option A**: **Documenter l'État Actuel (NO-FIX)** 
- v27.1 gate working correctly
- buildFlagEnabled=false = feature, not bug
- User doit configurer .env explicitement
- ➡️ **Documentation PR** seulement

**Option B**: **Auto-Fix (SECTION 3-5)**
- Ajouter backend gate verification (defense-in-depth)
- Améliorer Ollama healthcheck (si flapping prouvé)
- Nettoyer warnings (cargo clippy)
- ➡️ **Code changes PR**

**Recommandation**: **Option A (Documentation)** sauf si:
1. User report vient de version <v27.1 (fix déjà fait)
2. Security requirement pour backend gate (defense-in-depth)
3. Ollama flapping prouvé par logs

---

**Status**: ✅ SECTION 2 COMPLETE — DIAGNOSTIC CAUSAL ÉTABLI  
**Next**: Attente décision user (Option A vs Option B)
