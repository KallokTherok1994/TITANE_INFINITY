]633;E;{   echo "# 08_DIFF_FILES"\x3b   echo "Generated: $(date -Iseconds)"\x3b   echo\x3b   echo "## git diff --name-only"\x3b   git --no-pager diff --name-only\x3b   echo\x3b   echo "## git diff --stat"\x3b   git --no-pager diff --stat\x3b   echo\x3b   echo "## git diff -- src-tauri/src/chat_engine src-tauri/src/config src/pages/ConfigurationHub.tsx src/lib src/services registry/ui-events.jsonl"\x3b   git --no-pager diff -- src-tauri/src/chat_engine src-tauri/src/config src/pages/ConfigurationHub.tsx src/lib src/services registry/ui-events.jsonl | sed -n '1,260p'\x3b } > proof_packs/FULL_AUDIT_CHAT_POWER_2026-03-03_1238_95eea7d69/08_DIFF_FILES.md;32c7e064-f869-4c42-8d04-279039079122]633;C# 08_DIFF_FILES
Generated: 2026-03-03T12:41:06-05:00

## git diff --name-only
registry/ui-events.jsonl
src-tauri/src/chat_engine/config.rs
src-tauri/src/chat_engine/memory.rs
src-tauri/src/chat_engine/mod.rs
src-tauri/src/chat_engine/streaming.rs
src-tauri/src/commands/security.rs
src-tauri/src/config/mod.rs
src-tauri/src/config/update.rs
src-tauri/src/main.rs
src/lib/security.ts
src/lib/tauriClient.ts
src/lib/tauriCommands.ts
src/pages/ConfigurationHub.tsx
src/services/ai/chatEngine.ts
src/services/api/chat.ts
src/services/tauri/chatEngine.commands.ts
src/services/tauriClient.ts
titane-infinity.desktop

## git diff --stat
 registry/ui-events.jsonl                  |   1 +
 src-tauri/src/chat_engine/config.rs       |   7 +
 src-tauri/src/chat_engine/memory.rs       | 143 ++++++++++++-
 src-tauri/src/chat_engine/mod.rs          |   4 +-
 src-tauri/src/chat_engine/streaming.rs    |  51 ++++-
 src-tauri/src/commands/security.rs        |   5 +
 src-tauri/src/config/mod.rs               |   9 +-
 src-tauri/src/config/update.rs            | 324 +++++++++++++++++++++++++++--
 src-tauri/src/main.rs                     |   5 +
 src/lib/security.ts                       |   5 +
 src/lib/tauriClient.ts                    |  35 ++++
 src/lib/tauriCommands.ts                  |   5 +
 src/pages/ConfigurationHub.tsx            | 328 +++++++++++++++++++++++++++---
 src/services/ai/chatEngine.ts             |  17 +-
 src/services/api/chat.ts                  |  23 ++-
 src/services/tauri/chatEngine.commands.ts |  61 +++++-
 src/services/tauriClient.ts               |  18 +-
 titane-infinity.desktop                   |   4 +-
 18 files changed, 975 insertions(+), 70 deletions(-)

## git diff -- src-tauri/src/chat_engine src-tauri/src/config src/pages/ConfigurationHub.tsx src/lib src/services registry/ui-events.jsonl
diff --git a/registry/ui-events.jsonl b/registry/ui-events.jsonl
index 2d9dc80a3..c08cef465 100644
--- a/registry/ui-events.jsonl
+++ b/registry/ui-events.jsonl
@@ -102,3 +102,4 @@
 {"id":"ui-040","ts":"2026-02-28T13:22:00Z","category":"ui","scope":"routing|singularity|ipc-discipline","change_type":"fix","summary":"Supprime la redirection dupliquée /singularity vers /dev et force le client IPC canonique pour identity_set_matrix","reason":"Éviter une route masquée (UI mapping incohérent) et supprimer un invoke direct hors client canonique TS↔Tauri.","files_changed":["src/App.tsx","src/core/identity/defaultIdentityMatrix.ts","docs/ui/UI_MAP.md","docs/ui/IA_FLOW.mmd"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["pnpm run test:architecture x3","pnpm run test:compliance x3","vitest src/tests/e2e/titane_e2e.test.ts x3"],"proofs":["/singularity route unique vers SingularityMonitor","saveIdentityMatrix utilise tauriClient.identitySetMatrix","Cartographie Mermaid UI/IA ajoutée"],"risk_level":"low","rollback":"git restore -- src/App.tsx src/core/identity/defaultIdentityMatrix.ts docs/ui/UI_MAP.md docs/ui/IA_FLOW.mmd registry/ui-events.jsonl","status":"qualified"}
 {"id":"ui-event-2026-03-02T10:40:00Z-splash-watchdog-boot-ready-alignment","ts":"2026-03-02T10:40:00Z","category":"ui","scope":"boot|watchdog|loading","change_type":"fix","summary":"Align boot readiness detection with BOOT:READY markers to prevent false infinite-loading timeout","reason":"SplashWatchdog only treated '[BOOT] App render' as ready, while runtime advances to BOOT:READY. This could trigger a false timeout overlay although boot had completed.","files_changed":["src/components/diagnostics/SplashWatchdog.tsx"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["pnpm test:architecture (pending)","targeted diagnostics validation (pending)"],"proofs":["isBootReady now accepts __TITANE_BOOT_READY__ and dom dataset titaneBootReady=1","isBootReady now accepts stage BOOT:READY before fallback visibility checks"],"risk_level":"low","rollback":"git restore -- src/components/diagnostics/SplashWatchdog.tsx registry/ui-events.jsonl","status":"pending-validation"}
 {"id":"ui-event-2026-03-02T13:05:00Z-splash-watchdog-no-silent-infinite-loading","ts":"2026-03-02T13:05:00Z","category":"ui","scope":"boot|watchdog|suspense-loading","change_type":"fix","summary":"Prevent watchdog premature ready state while route loading fallback is still visible","reason":"A BOOT ready marker could be set before route Suspense fallback disappeared, disabling watchdog and allowing perceived infinite loading.","files_changed":["src/components/diagnostics/SplashWatchdog.tsx"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["pnpm test:architecture (PASS)","AppImage smoke logs x2 PASS (x2/x3)","AppImage fixcheck smoke PASS (UI main page_load)"],"proofs":["isBootReady now requires fallback invisibility for BOOT-ready signals","Repeated AppImage logs show main window + page_load main with no watchdog timeout markers"],"risk_level":"low","rollback":"git restore -- src/components/diagnostics/SplashWatchdog.tsx registry/ui-events.jsonl","status":"validated"}
+{"id":"ui-event-2026-03-03T12:27:00Z-chat-engine-config-sync-and-stream-json-hardening","ts":"2026-03-03T12:27:00Z","category":"ui","scope":"config-hub|chat-stream|ipc","change_type":"fix","summary":"Synchronise Configuration Hub avec config backend Chat Engine/Request Defaults et durcit le parsing stream contre Bad Unicode escape","reason":"Assurer source unique backend pour config chat + éviter erreurs runtime JSON.parse sur métadonnées de stream malformées.","files_changed":["src/pages/ConfigurationHub.tsx","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src/lib/security.ts","src/services/tauri/chatEngine.commands.ts","src/services/ai/chatEngine.ts","src/services/api/chat.ts","src/services/tauriClient.ts","src-tauri/src/config/update.rs","src-tauri/src/config/mod.rs","src-tauri/src/main.rs","src-tauri/src/commands/security.rs"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["pnpm test:architecture (PASS)","cargo test --lib x3 (PASS, logged)","get_errors TS targeted files (PASS)"],"proofs":["Nouvelles commandes get/set chat engine + request defaults + profiles via IPC canonique","ConfigurationHub lit/écrit via enveloppes {ok,content,error}","safe parse avec sanitation sur done payloads stream pour éviter Bad Unicode escape"],"risk_level":"low","rollback":"git restore -- src/pages/ConfigurationHub.tsx src/lib/tauriCommands.ts src/lib/tauriClient.ts src/lib/security.ts src/services/tauri/chatEngine.commands.ts src/services/ai/chatEngine.ts src/services/api/chat.ts src/services/tauriClient.ts src-tauri/src/config/update.rs src-tauri/src/config/mod.rs src-tauri/src/main.rs src-tauri/src/commands/security.rs registry/ui-events.jsonl","status":"qualified"}
diff --git a/src-tauri/src/chat_engine/config.rs b/src-tauri/src/chat_engine/config.rs
index 1851574bc..c5bc01561 100644
--- a/src-tauri/src/chat_engine/config.rs
+++ b/src-tauri/src/chat_engine/config.rs
@@ -13,6 +13,8 @@ pub struct ChatEngineConfig {
     pub memory_retention_tokens: usize,
     /// Interval used to debounce memory flush operations to disk.
     pub memory_flush_interval: Duration,
+    /// Buffer capacity for stream channels.
+    pub stream_channel_buffer: usize,
     /// Enables the text-to-speech pipeline automatically after a response.
     pub auto_tts_enabled: bool,
 }
@@ -25,6 +27,7 @@ impl Default for ChatEngineConfig {
             memory_context_tokens: 2_048,
             memory_retention_tokens: 3_000,
             memory_flush_interval: Duration::from_millis(350),
+            stream_channel_buffer: 32,
             auto_tts_enabled: true,
         }
     }
@@ -42,6 +45,7 @@ mod tests {
         assert_eq!(config.memory_context_tokens, 2_048);
         assert_eq!(config.memory_retention_tokens, 3_000);
         assert_eq!(config.memory_flush_interval, Duration::from_millis(350));
+        assert_eq!(config.stream_channel_buffer, 32);
         assert!(config.auto_tts_enabled);
     }
 
@@ -70,6 +74,7 @@ mod tests {
             memory_context_tokens: 4096,
             memory_retention_tokens: 6000,
             memory_flush_interval: Duration::from_millis(500),
+            stream_channel_buffer: 64,
             auto_tts_enabled: false,
         };
 
@@ -107,6 +112,7 @@ mod tests {
             memory_context_tokens: 1,
             memory_retention_tokens: 1,
             memory_flush_interval: Duration::from_millis(1),
+            stream_channel_buffer: 1,
             auto_tts_enabled: false,
         };
 
@@ -122,6 +128,7 @@ mod tests {
             memory_context_tokens: 100_000,
             memory_retention_tokens: 200_000,
             memory_flush_interval: Duration::from_secs(10),
+            stream_channel_buffer: 1024,
             auto_tts_enabled: true,
         };
 
diff --git a/src-tauri/src/chat_engine/memory.rs b/src-tauri/src/chat_engine/memory.rs
index a7913b1bc..d843fe179 100644
--- a/src-tauri/src/chat_engine/memory.rs
+++ b/src-tauri/src/chat_engine/memory.rs
@@ -1,8 +1,11 @@
 use std::collections::HashMap;
 use std::path::PathBuf;
 use std::sync::Arc;
+use std::time::Duration;
 
-use tokio::sync::RwLock;
+use tokio::sync::{Mutex, RwLock};
+use tokio::task::JoinHandle;
+use tokio::time;
 
 use crate::memory::model::Conversation;
 use crate::memory::storage::MemoryStorage;
@@ -13,16 +16,20 @@ use super::errors::ChatEngineError;
 /// High-level memory manager with in-memory caching and corruption guards.
 pub struct ChatMemoryManager {
     storage: Arc<MemoryStorage>,
-    cached: RwLock<HashMap<String, Conversation>>, // in-memory cache for fast access
+    cached: Arc<RwLock<HashMap<String, Conversation>>>, // in-memory cache for fast access
     retention_tokens: usize,
+    flush_interval: Duration,
+    flush_tasks: Mutex<HashMap<String, JoinHandle<()>>>,
 }
 
 impl ChatMemoryManager {
-    pub fn new(storage: Arc<MemoryStorage>, retention_tokens: usize) -> Self {
+    pub fn new(storage: Arc<MemoryStorage>, retention_tokens: usize, flush_interval: Duration) -> Self {
         Self {
             storage,
-            cached: RwLock::new(HashMap::new()),
+            cached: Arc::new(RwLock::new(HashMap::new())),
             retention_tokens,
+            flush_interval,
+            flush_tasks: Mutex::new(HashMap::new()),
         }
     }
 
@@ -95,9 +102,8 @@ impl ChatMemoryManager {
         conversation.add_entry(role, content, tokens);
         self.enforce_retention(conversation);
 
-        self.storage
-            .save_conversation(conversation)
-            .map_err(ChatEngineError::from)?;
+        drop(cache);
+        self.schedule_flush(conversation_id.to_string()).await;
         Ok(())
     }
 
@@ -107,16 +113,96 @@ impl ChatMemoryManager {
         }
 
         let mut accumulated = 0usize;
-        conversation.entries.retain(|entry| {
-            accumulated += entry.tokens.max(1);
-            accumulated <= self.retention_tokens
-        });
+        let mut keep_from_index = conversation.entries.len();
+        for (idx, entry) in conversation.entries.iter().enumerate().rev() {
+            let entry_tokens = entry.tokens.max(1);
+            if accumulated + entry_tokens > self.retention_tokens {
+                break;
+            }
+            accumulated += entry_tokens;
+            keep_from_index = idx;
+        }
+
+        if keep_from_index > 0 {
+            conversation.entries.drain(0..keep_from_index);
+        }
 
         conversation.metadata.total_tokens =
             conversation.entries.iter().map(|entry| entry.tokens).sum();
         conversation.metadata.message_count = conversation.entries.len();
     }
 
+    async fn schedule_flush(&self, conversation_id: String) {
+        let mut tasks = self.flush_tasks.lock().await;
+        if let Some(handle) = tasks.get(&conversation_id) {
+            if !handle.is_finished() {
+                log::debug!("[Memory] flush coalesced: {}", conversation_id);
+                return;
+            }
+        }
+
+        let storage = self.storage.clone();
+        let cached = self.cached.clone();
+        let delay = self.flush_interval;
+        let conversation_id_for_task = conversation_id.clone();
+        let handle = tokio::spawn(async move {
+            log::debug!("[Memory] flush scheduled: {}", conversation_id_for_task);
+            time::sleep(delay).await;
+
+            let snapshot = {
+                let guard = cached.read().await;
+                guard.get(&conversation_id_for_task).cloned()
+            };
+
+            if let Some(conversation) = snapshot {
+                if let Err(err) = storage.save_conversation(&conversation) {
+                    log::error!(
+                        "[Memory] flush persist failed for {}: {}",
+                        conversation_id_for_task,
+                        err
+                    );
+                } else {
+                    log::debug!("[Memory] flush persisted: {}", conversation_id_for_task);
+                }
+            }
+        });
+
+        tasks.insert(conversation_id, handle);
+    }
+
+    pub async fn flush_conversation_now(&self, conversation_id: &str) -> Result<(), ChatEngineError> {
+        if let Some(handle) = self.flush_tasks.lock().await.remove(conversation_id) {
+            handle.abort();
+        }
+
+        let snapshot = {
+            let guard = self.cached.read().await;
+            guard.get(conversation_id).cloned()
+        };
+
+        if let Some(conversation) = snapshot {
+            self.storage
+                .save_conversation(&conversation)
+                .map_err(ChatEngineError::from)?;
+            log::debug!("[Memory] flush persisted: {}", conversation_id);
+        }
+
+        Ok(())
+    }
+
+    pub async fn flush_all_now(&self) -> Result<(), ChatEngineError> {
+        let ids = {
+            let guard = self.cached.read().await;
+            guard.keys().cloned().collect::<Vec<_>>()
+        };
+
+        for conversation_id in ids {
+            self.flush_conversation_now(&conversation_id).await?;
+        }
+
+        Ok(())
+    }
+
     async fn load_into_cache(&self, conversation_id: &str) -> Result<(), ChatEngineError> {
         // Fast path: already cached
         if self.cached.read().await.contains_key(conversation_id) {
@@ -175,6 +261,12 @@ impl ChatMemoryManager {
     }
 
     pub async fn reset_all(&self) -> Result<(), ChatEngineError> {
+        {
+            let mut tasks = self.flush_tasks.lock().await;
+            for (_, handle) in tasks.drain() {
+                handle.abort();
+            }
+        }
         self.storage
             .clone()
             .clear_all()
@@ -230,6 +322,7 @@ fn estimate_tokens(content: &str) -> usize {
 #[cfg(test)]
 mod tests {
     use super::*;
+    use tempfile::TempDir;
 
     // ─────────────────────────────────────────────────────────────
     // estimate_tokens Tests
@@ -301,4 +394,32 @@ mod tests {
         let tokens = estimate_tokens(short_many_words);
         assert!(tokens >= 10); // Should be 10 (more words than ascii tokens)
     }
+
+    #[test]
+    fn test_enforce_retention_keeps_most_recent_entries() {
+        let temp_dir = TempDir::new().expect("create temp dir");
+        let storage = Arc::new(
+            MemoryStorage::new(temp_dir.path().to_path_buf(), "test-key".to_string())
+                .expect("create storage"),
+        );
+        let manager = ChatMemoryManager::new(storage, 6, Duration::from_millis(50));
+
+        let mut conversation = Conversation::new("Retention test".to_string());
+        conversation.add_entry(MessageRole::User, "oldest".to_string(), 2);
+        conversation.add_entry(MessageRole::Assistant, "middle".to_string(), 2);
+        conversation.add_entry(MessageRole::User, "newer".to_string(), 2);
+        conversation.add_entry(MessageRole::Assistant, "newest".to_string(), 2);
+
+        manager.enforce_retention(&mut conversation);
+
+        let kept: Vec<String> = conversation
