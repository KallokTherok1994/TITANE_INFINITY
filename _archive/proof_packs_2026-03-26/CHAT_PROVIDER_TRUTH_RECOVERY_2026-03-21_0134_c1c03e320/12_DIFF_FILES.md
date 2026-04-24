diff --git a/src-tauri/src/overdrive/chat_orchestrator.rs b/src-tauri/src/overdrive/chat_orchestrator.rs
index 4b42a90ef..e911a2e59 100644
--- a/src-tauri/src/overdrive/chat_orchestrator.rs
+++ b/src-tauri/src/overdrive/chat_orchestrator.rs
@@ -389,6 +389,14 @@ async fn is_provider_available(
last_check.insert(provider.to_string(), now);
}

- // ✅ FIX: FAILURE_COUNTER_NOT_RESET — quand le probe réussit après expiration du cache,
- // réinitialiser le compteur d'échecs pour éviter un état "désactivé" persistant alors que
- // le provider répond correctement à la sonde de santé.
- // Rationale: probe success = provider présumé disponible = nouvelle fenêtre d'essais.
- if is_available {
-        reset_provider_failures(provider, state).await;
- }
-     is_available
  }

@@ -398,10 +406,17 @@ async fn increment_provider_failures(provider: &str, state: &ChatOrchestratorSta
let count = failures.entry(provider.to_string()).or_insert(0);
\*count += 1;

- if \*count >= 3 {

* // ✅ FIX: afficher le compte réel, et ne loguer qu'à la première désactivation
* // (count == 3) pour éviter le log flooding sur les éc hecs suivants.
* if \*count == 3 {
*        println!(
*            "[CHAT] ⚠️ Provider {} temporairement désactivé ({} échecs consécutifs)",
*            provider, count
*        );
* } else if \*count > 3 {
  println!(

-            "[CHAT] ⚠️ Provider {} temporairement désactivé (3 échecs)",
-            provider

*            "[CHAT] 🔄 Provider {} toujours désactivé ({} échecs depuis dernière réactivation)",
*            provider, count
           );
       }
  }
  diff --git a/src/services/ai/circuitBreaker.ts b/src/services/ai/circuitBreaker.ts
  index bfc47f56b..61980d2db 100644
  --- a/src/services/ai/circuitBreaker.ts
  +++ b/src/services/ai/circuitBreaker.ts
  @@ -201,8 +201,12 @@ class CircuitBreaker {
  circuit.halfOpenAttempts = 0;
  }
  } else if (circuit.state === 'CLOSED') {

-      // Reset failure count on success in closed state
-      circuit.failures = Math.max(0, circuit.failures - 1);

*      // ✅ FIX: Reset failure count to 0 on success (not decrement-by-1) and clear stale
*      // failure timestamps so they don't cause a spurious OPEN after intermittent failures.
*      // Rationale: a successful call proves the provider is healthy; stale timestamps
*      // from a previous degraded window must not re-trigger OPEN state.
*      circuit.failures = 0;
*      this.failureTimestamps.delete(provider);
  }
  }
