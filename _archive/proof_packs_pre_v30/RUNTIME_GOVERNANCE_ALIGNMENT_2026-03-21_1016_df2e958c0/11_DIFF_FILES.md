# Diff (HEAD~3..HEAD for governance files)
diff --git a/scripts/e2e/run-online-chat-proof-ui.sh b/scripts/e2e/run-online-chat-proof-ui.sh
index 0d636d06b..6c3198162 100644
--- a/scripts/e2e/run-online-chat-proof-ui.sh
+++ b/scripts/e2e/run-online-chat-proof-ui.sh
@@ -26,14 +26,18 @@ export TITANE_E2E_ENFORCE_SOURCE="${TITANE_E2E_ENFORCE_SOURCE:-0}"
 # E2E stability profile: prefer a lightweight local model and cap backend turn timeout
 # to avoid long-running UI hangs that can invalidate the WRY WebDriver session.
 export OLLAMA_DEFAULT_MODEL="${TITANE_E2E_OLLAMA_MODEL:-gemma2:2b}"
-export TITANE_CONVERSATION_TIMEOUT_SECS="${TITANE_CONVERSATION_TIMEOUT_SECS:-30}"
+# OLLAMA_REQUEST_TIMEOUT_SECS: governs the Rust HTTP client timeout in ollama.rs.
+# Default 60s; harness may raise to 90s for cold-model scenarios.
+export OLLAMA_REQUEST_TIMEOUT_SECS="${OLLAMA_REQUEST_TIMEOUT_SECS:-60}"
+# TITANE_CONVERSATION_TIMEOUT_SECS: [DEAD — no Rust runtime honors this env var.
+# Kept as a labelled stub only; remove if confusing.]
 
 echo "[E2E_CHAT_PROOF] OUT_DIR=$OUT_DIR"
 echo "[E2E_CHAT_PROOF] EXPECT_SOURCE=$TITANE_E2E_EXPECT_SOURCE"
 echo "[E2E_CHAT_PROOF] ENFORCE_SOURCE=$TITANE_E2E_ENFORCE_SOURCE"
 echo "[E2E_CHAT_PROOF] USE_TAURI_DEV=$TITANE_E2E_USE_TAURI_DEV"
 echo "[E2E_CHAT_PROOF] OLLAMA_DEFAULT_MODEL=$OLLAMA_DEFAULT_MODEL"
-echo "[E2E_CHAT_PROOF] TITANE_CONVERSATION_TIMEOUT_SECS=$TITANE_CONVERSATION_TIMEOUT_SECS"
+echo "[E2E_CHAT_PROOF] OLLAMA_REQUEST_TIMEOUT_SECS=$OLLAMA_REQUEST_TIMEOUT_SECS [effective Rust HTTP client cap]"
 
 # ── Ollama Pre-warm Preflight ─────────────────────────────────────────────────
 # Purpose: load the target model into memory BEFORE starting Tauri/WDIO to avoid
diff --git a/src-tauri/src/ai/ollama.rs b/src-tauri/src/ai/ollama.rs
index eea19a965..47062e266 100644
--- a/src-tauri/src/ai/ollama.rs
+++ b/src-tauri/src/ai/ollama.rs
@@ -10,11 +10,14 @@ use crate::core::http_types::Client;
 use serde::{Deserialize, Serialize};
 use std::collections::HashMap;
 use std::sync::Mutex;
-use std::time::Instant;
+use std::time::{Duration, Instant};
 use tauri::{command, Emitter, Window};
 
 const DEFAULT_OLLAMA_BASE_URL: &str = "http://127.0.0.1:11434";
 const DEFAULT_OLLAMA_MODEL: &str = "gemma2:2b";
+/// Env var governing the Ollama HTTP client request timeout (seconds, bounded 10..300).
+const OLLAMA_REQUEST_TIMEOUT_SECS_ENV: &str = "OLLAMA_REQUEST_TIMEOUT_SECS";
+const OLLAMA_REQUEST_TIMEOUT_SECS_DEFAULT: u64 = 120;
 
 // ✨ v27.2.1: Ollama status cache (anti-flapping)
 // Cache TTL: 10s to avoid repeated health checks
@@ -53,8 +56,21 @@ fn ollama_default_model() -> String {
         .unwrap_or_else(|| DEFAULT_OLLAMA_MODEL.to_string())
 }
 
+/// Returns the effective Ollama HTTP request timeout.
+/// Governed by env var OLLAMA_REQUEST_TIMEOUT_SECS (bounded 10..300).
+/// Defaults to 120s if unset or out of bounds.
+fn ollama_request_timeout() -> Duration {
+    std::env::var(OLLAMA_REQUEST_TIMEOUT_SECS_ENV)
+        .ok()
+        .and_then(|v| v.trim().parse::<u64>().ok())
+        .filter(|&s| s >= 10 && s <= 300)
+        .map(Duration::from_secs)
+        .unwrap_or(Duration::from_secs(OLLAMA_REQUEST_TIMEOUT_SECS_DEFAULT))
+}
+
 fn build_ollama_client() -> Result<Client, String> {
     Client::builder()
+        .timeout(ollama_request_timeout())
         .build()
         .map_err(|e| format!("Client error: {}", e))
 }
@@ -678,6 +694,10 @@ impl OllamaClient {
 #[cfg(test)]
 mod tests {
     use super::*;
+    use std::sync::Mutex;
+
+    // Serialize env-var tests to prevent parallel mutation races.
+    static ENV_TEST_LOCK: Mutex<()> = Mutex::new(());
 
     #[test]
     fn test_ollama_installed() {
@@ -705,4 +725,70 @@ mod tests {
         let selected_unknown = select_fallback_model("unknown:latest", &models);
