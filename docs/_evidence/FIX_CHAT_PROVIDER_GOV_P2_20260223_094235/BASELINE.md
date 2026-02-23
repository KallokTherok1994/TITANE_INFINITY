# P2 BASELINE — État initial avant commit et validation

**Timestamp**: 2026-02-23 09:42:35  
**Branch**: MAIN  
**HEAD**: 0aeac488 docs(release): add full sealed pack for v27.0.5  
**Context**: Post-P1 patch appliqué (3 fichiers + proof pack P1), pas encore commité

---

## 1) GIT STATUS (porcelain)

```
 M src-tauri/src/conversation_engine/commands.rs
 M src/hooks/useConversationEngine.ts
 M src/services/conversationEngine.ts
?? docs/_evidence/FIX_CHAT_PROVIDER_GOV_20260223_092409/
```

✅ État propre: seulement 3 fichiers modifiés + 1 folder evidence P1 (untracked).

---

## 2) GIT DIFF --STAT

```
 src-tauri/src/conversation_engine/commands.rs |  3 +++
 src/hooks/useConversationEngine.ts            | 25 ++++++++++++++++++++
 src/services/conversationEngine.ts            | 33 +++++++++++++++++++++++++++
 3 files changed, 61 insertions(+)
```

**Total**: +61 lignes (observations + mode detection)

---

## 3) DIFF DÉTAILLÉ

<details>
<summary>commands.rs (+3 lignes)</summary>

```diff
@@ -79,6 +79,9 @@ pub async fn conversation_generate(
 
     // ✨ v27.0.2: Force local provider in tests (bypass cloud timeouts in AR20)
     let effective_provider = if std::env::var("FORCE_LOCAL_PROVIDER").is_ok() {
+        log::warn!(
+            "[Ω:CMD] ⚠️ FORCE_LOCAL_PROVIDER env active | cloud providers DISABLED | reason=test_mode"
+        );
         Some("local".to_string())
     } else {
         provider
```
</details>

<details>
<summary>useConversationEngine.ts (+25 lignes)</summary>

```diff
@@ -294,6 +294,31 @@ export function useConversationEngine(
           return updated;
         });
 
+        // ✨ OBSERVABILITY: Mode detection based on meta
+        const mode = response.meta?.mode || 'UNKNOWN';
+        const reasonCode = response.meta?.reason_code || 'UNKNOWN';
+
+        if (mode === 'OFFLINE') {
+          const message =
+            reasonCode !== 'UNKNOWN'
+              ? `Mode hors ligne: ${reasonCode}`
+              : 'Mode hors ligne (raison inconnue)';
+          setError(message);
+          logger.warn('[useConversationEngine] OFFLINE mode', { reasonCode });
+        } else if (mode === 'LOCAL') {
+          logger.info('[useConversationEngine] LOCAL mode', { reasonCode });
+          // Clear error if any
+          if (error) setError(null);
+        } else if (mode === 'REMOTE') {
+          logger.info('[useConversationEngine] REMOTE mode', {
+            provider: response.meta?.provider_used,
+            network_used: response.meta?.network_used,
+          });
+          if (error) setError(null);
+        } else {
+          logger.warn('[useConversationEngine] UNKNOWN mode', { meta: response.meta });
+        }
+
         // ✅ PERSIST MESSAGES TO LOCALSTORAGE
         try {
           const userAIMessage: AIMessage = {
```
</details>

<details>
<summary>conversationEngine.ts (+33 lignes)</summary>

```diff
@@ -14,6 +14,16 @@ import { tauriClient } from '@/lib/tauriClient';
 import { validateIpcPayload } from '@/lib/ipcContract';
 import { getSystemPrompt } from '@/config/chatModes.config';
 import type { OnlineDecision, ProviderDecisionMeta } from '@/types/providerMeta';
+import { FEATURE_FLAGS, envFlag } from '@/config/featureFlags';
+
+function runtimeFlag(key: string): boolean {
+  try {
+    if (typeof window === 'undefined') return false;
+    return window.localStorage.getItem(key) === '1';
+  } catch {
+    return false;
+  }
+}
 
 const E2E_CHAT_MOCK_FLAG = '__TITANE_E2E_CHAT_MOCK__';
 const E2E_CHAT_CONV_SEQ = '__TITANE_E2E_CHAT_CONV_SEQ__';
@@ -245,6 +255,15 @@ export async function processMessage(
   // Le protector tentera Tauri en premier, puis Ollama en fallback si besoin
   console.log('[conversationEngine] 🚀 Envoi du message via secureInvoke');
 
+  // ✨ OBSERVABILITY: Log external AI gate state
+  const externalAllowed = FEATURE_FLAGS.ENABLE_EXTERNAL_AI;
+  console.log('[CONV_SEND] External AI gate', {
+    buildFlagEnabled: envFlag('VITE_ENABLE_EXTERNAL_AI'),
+    runtimeToggleEnabled: import.meta.env.DEV ? true : runtimeFlag('titane.enable_external_ai'),
+    allowed: externalAllowed,
+    requested_provider: 'auto',
+  });
+
   const systemPrompt = getSystemPrompt(options?.mode ?? 'default');
   const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
 
@@ -331,6 +350,20 @@ export async function processMessage(
     provider: response.metadata?.provider_used,
   });
 
+  // ✨ OBSERVABILITY: Log provider decision meta
+  if (providerMeta) {
+    console.log('[CONV_RECV] Provider decision', {
+      mode: providerMeta.mode,
+      reason_code: providerMeta.reason_code,
+      provider_used: providerMeta.provider_used,
+      network_used: providerMeta.network_used,
+      attempts_count: providerMeta.attempts?.length || 0,
+      latency_ms: providerMeta.latency_ms_total,
+    });
+  } else {
+    console.warn('[CONV_RECV] ⚠️ Provider meta missing in response');
+  }
+
   return response;
 }
```
</details>

---

## 4) PROOF PACK P1

Le proof pack P1 a été généré dans:
`docs/_evidence/FIX_CHAT_PROVIDER_GOV_20260223_092409/`

Contient:
- BASELINE.md (git initial)
- FINDINGS.md (diagnostic complet)
- DESIGN.md (plan minimal)
- CHANGES.md (modifications détaillées)
- LOGS_ONLINE.md (simulation cloud)
- LOGS_LOCAL.md (simulation locale)
- ROLLBACK.md (procédure de retour en arrière)
- VERDICT.md (PASS avec réserves)
- RAPPORT_FINAL.md (synthèse exécutive)

---

## 5) VERSIONS OUTILS

```
Node: v24.0.0
PNPM: 10.28.2
Cargo: 1.91.1
Tauri CLI: (via src-tauri/Cargo.toml)
```

---

## 6) INVARIANTS PRÉ-COMMIT

✅ Repo propre hors modifications attendues  
✅ 3 fichiers seulement (backend + service + UI)  
✅ Diff cohérent avec design P1  
✅ Pas de fichiers générés/temporaires inattendus  
✅ Proof pack P1 présent et complet  

---

**Status**: READY FOR COMMIT
