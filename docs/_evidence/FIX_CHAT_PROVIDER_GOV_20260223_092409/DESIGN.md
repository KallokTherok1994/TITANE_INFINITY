# DESIGN CIBLE MINIMAL — FIX CHAT PROVIDER GOV

**Date:** 2026-02-23  
**Objectif:** Corriger le "faux offline" avec patch minimal, sans duplication, sans refactor gratuit

---

## ARCHITECTURE DÉCOUVERTE

### Flow réel (système moderne)

```
useConversationEngine (Ring 4)
  ↓
conversationEngine.ts (Ring 3)
  → payload = { provider: 'auto', ... }  ✅ OK
  ↓
tauriClient.conversationGenerate() (Ring 3)
  ↓
secureInvoke('conversation_generate')
  ↓
Backend Rust conversation_engine
  → Peut forcer local si FORCE_LOCAL_PROVIDER env ⚠️
  → Sélectionne provider (auto/local/gemini/...)
  → Si échec: retourne fallback offline 
  ↓
Response: { content, meta, decision, ... }
  ↓
Frontend: affiche content (peut contenir "Réponse en mode hors ligne...")
```

### Système legacy (NON utilisé par chat moderne)

```
chatEngine (Ring 3)
  ↓
orchestrator.ts (Ring 3)
  ↓
tauriChatProvider (tauriChat.ts)
  → ❌ Force provider='local' (ligne 173)
  → Non utilisé par useConversationEngine
```

**CONCLUSION:** tauriChat.ts N'EST PAS LE PROBLÈME pour le chat moderne.

---

## CAUSES RACINES CONFIRMÉES

### 1. ENV VAR `FORCE_LOCAL_PROVIDER` (Backend)

**Fichier:** `src-tauri/src/conversation_engine/commands.rs`  
**Lignes:** 85-90  
**Impact:** Si set, force provider='local' même si 'auto' demandé

```rust
let effective_provider = if std::env::var("FORCE_LOCAL_PROVIDER").is_ok() {
    Some("local".to_string())
} else {
    provider
};
```

### 2. Fallback offline sans distinction

**Fichier:** `src-tauri/src/conversation_engine/mod.rs`  
**Ligne:** 243  
**Impact:** Retourne texte offline générique sans exposer `reason_code` clair

```rust
assistant_message: "Réponse en mode hors ligne. Je suis en train de traiter votre demande avec mes capacités autonomes.".to_string(),
```

### 3. Meta renvoyée mais sous-utilisée (Frontend)

**Fichier:** `src/services/conversationEngine.ts`  
**Lignes:** 268-269  
**Impact:** Meta capturée mais pas utilisée pour debug/UI

```typescript
const providerMeta = normalizeProviderMeta(raw?.meta);
const decision = normalizeDecision(raw?.decision);
// Puis stockée dans response, mais pas utilisée pour afficher raison offline
```

---

## DESIGN CIBLE

### Principe: ONLINE-FIRST avec traçabilité complète

1. **Backend renvoie TOUJOURS meta** avec:
   - `mode` : 'LOCAL' | 'REMOTE' | 'OFFLINE' | ...
   - `reason_code` : exact (OK, TIMEOUT, PROVIDER_DOWN, POLICY_LOCAL_ONLY, ...)
   - `requested_provider` : ce qui a été demandé
   - `selected_provider` : ce qui a été réellement utilisé
   - `network_used` : bool
   - `fallback_chain` : array (si cascades)

2. **Frontend logs systématiques**:
   - Avant invoke: `[CONV_SEND] provider=auto, externalAllowed=true/false`
   - Après receive: `[CONV_RECV] mode=LOCAL|REMOTE|OFFLINE, reason_code=..., selected_provider=...`

3. **UI n'affiche "offline" que si `mode=='OFFLINE'`**:
   - `mode == 'REMOTE'` → "En ligne (cloud)"
   - `mode == 'LOCAL'` → "Mode local" + reason si pertinent (ex: "cloud désactivé")
   - `mode == 'OFFLINE'` → "Hors ligne" + **reason_code explicite** (ex: "timeout", "provider down")

4. **Backend: log WARN si forçage local actif**:
   ```rust
   if std::env::var("FORCE_LOCAL_PROVIDER").is_ok() {
       log::warn!("[CONV-ENGINE] ⚠️ FORCE_LOCAL_PROVIDER active → cloud providers disabled by env");
   }
   ```

---

## PATCH MINIMAL (FICHIERS TOUCHÉS)

### Ring 3 (Services Backend)

#### `src-tauri/src/conversation_engine/commands.rs`

**Ligne 85-90:** Ajouter log EXPLICIT si forçage

```rust
// ✨ v27.0.2: Force local provider in tests (bypass cloud timeouts in AR20)
let effective_provider = if std::env::var("FORCE_LOCAL_PROVIDER").is_ok() {
    log::warn!(
        "[Ω:CMD] ⚠️ FORCE_LOCAL_PROVIDER env active | cloud providers DISABLED | reason=test_mode"
    );
    Some("local".to_string())
} else {
    provider
};
```

**Impact:** Visibilité immédiate si forçage actif. Pas de changement de logique.

---

### Ring 3 (Services Frontend)

#### `src/services/conversationEngine.ts`

**Ligne 240-260:** Ajouter logs decision avant invoke

```typescript
console.log('[conversationEngine] 🚀 Envoi du message via secureInvoke');

// ✨ OBSERVABILITY: Log external AI gate state
const externalAllowed = FEATURE_FLAGS.ENABLE_EXTERNAL_AI;
console.log('[CONV_SEND] External AI gate', {
  buildFlagEnabled: envFlag('VITE_ENABLE_EXTERNAL_AI'),
  runtimeToggleEnabled: import.meta.env.DEV ? true : runtimeFlag('titane.enable_external_ai'),
  allowed: externalAllowed,
  requested_provider: 'auto',
});

const systemPrompt = getSystemPrompt(options?.mode ?? 'default');
const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const payload = validateIpcPayload('conversation_generate', {
  args: {
    message: userMessage,
    conversationId,
    mode: options?.mode || 'default',
    provider: 'auto',
    systemPrompt,
    requestId,
  },
});
const raw = (await tauriClient.conversationGenerate(payload)) as OmegaGenerateResponse;
```

**Ligne 330-340:** Ajouter log decision après receive

```typescript
console.log('[conversationEngine] 📥 Backend response:', {
  message_id: response.message_id,
  assistant_message_length: response.assistant_message?.length || 0,
  assistant_message_preview: response.assistant_message?.substring(0, 100),
  provider: response.metadata?.provider_used,
});

// ✨ OBSERVABILITY: Log provider decision meta
if (providerMeta) {
  console.log('[CONV_RECV] Provider decision', {
    mode: providerMeta.mode,
    reason_code: providerMeta.reason_code,
    provider_used: providerMeta.provider_used,
    network_used: providerMeta.network_used,
    attempts_count: providerMeta.attempts?.length || 0,
    latency_ms: providerMeta.latency_ms_total,
  });
} else {
  console.warn('[CONV_RECV] ⚠️ Provider meta missing in response');
}

return response;
```

**Impact:** Traçabilité complète du flow decision provider. Pas de changement de logique.

---

### Ring 4 (UI)

#### `src/hooks/useConversationEngine.ts` (ou composant qui affiche "offline")

**PRINCIPE:** Ne jamais afficher "Réponse en mode hors ligne" basé sur le **contenu** du message.

**Option A:** Détecter pattern dans le contenu (fallback si meta absente)

```typescript
// Dans sendMessage après receive
if (result.assistant_message.includes("Réponse en mode hors ligne")) {
  // C'est un fallback offline du backend
  console.warn('[CONV] Offline fallback detected in content', {
    mode: result.meta?.mode,
    reason_code: result.meta?.reason_code,
  });
  
  // Option: afficher un bandeau warning avec reason_code si dispo
  if (result.meta?.reason_code) {
    setError(`Mode hors ligne: ${result.meta.reason_code}`);
  } else {
    setError('Mode hors ligne détecté (raison inconnue)');
  }
}
```

**Option B:** Utiliser `meta.mode` systématiquement

```typescript
// Dans sendMessage après receive
const mode = result.meta?.mode || 'UNKNOWN';
const reasonCode = result.meta?.reason_code || 'UNKNOWN';

if (mode === 'OFFLINE') {
  console.warn('[CONV] Mode OFFLINE', { reason_code: reasonCode });
  setError(`Mode hors ligne: ${reasonCode}`);
} else if (mode === 'LOCAL') {
  console.info('[CONV] Mode LOCAL', { reason_code: reasonCode });
  // Optionnel: afficher info "Utilisation locale uniquement"
} else if (mode === 'REMOTE') {
  console.info('[CONV] Mode REMOTE (online)', { provider: result.meta?.provider_used });
  setError(null); // Clear any previous error
}
```

**CHOIX:** Option B (basée sur meta) est plus robuste.

**Ajout dans useConversationEngine:**

```typescript
// Après setLastResponse(result)
const mode = result.meta?.mode || 'UNKNOWN';
const reasonCode = result.meta?.reason_code || 'UNKNOWN';

if (mode === 'OFFLINE') {
  const message = reasonCode !== 'UNKNOWN' 
    ? `Mode hors ligne: ${reasonCode}` 
    : 'Mode hors ligne (raison inconnue)';
  setError(message);
  logger.warn('[useConversationEngine] OFFLINE mode', { reasonCode });
} else if (mode === 'LOCAL') {
  logger.info('[useConversationEngine] LOCAL mode', { reasonCode });
  // Clear error if any
  if (error) setError(null);
} else if (mode === 'REMOTE') {
  logger.info('[useConversationEngine] REMOTE mode', { 
    provider: result.meta?.provider_used,
    network_used: result.meta?.network_used,
  });
  if (error) setError(null);
} else {
  logger.warn('[useConversationEngine] UNKNOWN mode', { meta: result.meta });
}
```

**Impact:** L'UI affiche maintenant un message d'erreur explicite basé sur `meta.mode` et `reason_code`.

---

## FICHIERS MODIFIÉS (INVENTAIRE)

| Fichier | Ring | Modification | Reason |
|---------|------|--------------|--------|
| `src-tauri/src/conversation_engine/commands.rs` | 3 | Ajout log WARN si FORCE_LOCAL_PROVIDER | Observabilité |
| `src/services/conversationEngine.ts` | 3 | Ajout logs CONV_SEND + CONV_RECV | Observabilité |
| `src/hooks/useConversationEngine.ts` | 4 | Ajout logique mode detection (meta-based) | Fix UI offline display |

**Total:** 3 fichiers, modifications minimales (logs + 1 logique UI)

---

## TYPES EXISTANTS (RÉUTILISÉS)

✅ `ProviderDecisionMeta` (src/types/providerMeta.ts)  
✅ `OnlineDecision` (src/types/providerMeta.ts)  
✅ `Mode`, `ReasonCode` (src/types/providerMeta.ts)

**Pas de nouveau type requis.**

---

## EXTERNAL AI GATE (CONSTAT)

**Config actuelle:**
- `FEATURE_FLAGS.ENABLE_EXTERNAL_AI` existe
- DEV: buildFlag suffit
- STABLE: buildFlag && runtimeFlag

**Constat:**
- conversationEngine.ts envoie `provider: 'auto'` ✅ (OK)
- Le backend décide du provider selon disponibilité
- Le gate est **implicite** (disponibilité des providers cloud)
- Pas de forçage explicite frontend basé sur gate

**Design actuel = CONFORME** pour ONLINE-FIRST:
- Si `ENABLE_EXTERNAL_AI=true` → backend peut choisir cloud ou local
- Si `ENABLE_EXTERNAL_AI=false` → frontend n'empêche pas 'auto', mais backend n'aura pas de clés cloud → fallback local automatique

**Action requise:** AUCUNE (le gate fonctionne implicitement via disponibilité providers)

---

## PREUVES REQUISES (BLOC 4)

### Test ONLINE

**Setup:**
1. Set `VITE_ENABLE_EXTERNAL_AI=1` (build)
2. En DEV: check auto
3. Si STABLE: `localStorage.setItem('titane.enable_external_ai', '1')`
4. Assurer au moins 1 provider cloud a une clé valide

**Run:**
1. Envoyer un message via useConversationEngine
2. Capturer logs `[CONV_SEND]` et `[CONV_RECV]`
3. Vérifier:
   - `requested_provider == 'auto'`
   - `mode != 'OFFLINE'`
   - `selected_provider` est un provider cloud (gemini/openai/claude) OU local si cloud indispo
   - Pas de texte "Réponse en mode hors ligne..." dans content
   - `reason_code` explicite

**PASS critères:**
- `mode == 'REMOTE'` OU `mode == 'LOCAL'` (si cloud down)
- `reason_code != 'FALLBACK_OFFLINE'`
- UI n'affiche pas message erreur "hors ligne"

### Test LOCAL (cloud disabled)

**Setup:**
1. Set `VITE_ENABLE_EXTERNAL_AI=0` (ou omis)
2. En STABLE: remove localStorage key

**Run:**
1. Envoyer un message
2. Capturer logs
3. Vérifier:
   - `mode == 'LOCAL'` (ou 'OFFLINE' si local down)
   - `reason_code` explicite (ex: POLICY_LOCAL_ONLY)
   - UI affiche raison claire

**PASS critères:**
- `mode == 'LOCAL'` avec `reason_code` explicite
- OU `mode == 'OFFLINE'` avec `reason_code` explicite (ex: PROVIDER_DOWN)

---

## ROLLBACK

```bash
git restore src-tauri/src/conversation_engine/commands.rs
git restore src/services/conversationEngine.ts
git restore src/hooks/useConversationEngine.ts
```

Ou:
```bash
git revert <commit_hash>
```

---

## VERDICT DESIGN

✅ **MINIMAL:** 3 fichiers, <50 lignes ajoutées  
✅ **SANS DUPLICATION:** Réutilise types existants  
✅ **STRUCTUREL:** Fix permanent via observabilité + UI decision logic  
✅ **ONLINE-FIRST:** Respecte architecture (provider='auto', backend choisit)  
✅ **PROOF-DRIVEN:** Logs permettent validation cas ONLINE + LOCAL  

**STATUT:** READY → BLOC 3 (Implémentation)

---

**FIN DESIGN**
