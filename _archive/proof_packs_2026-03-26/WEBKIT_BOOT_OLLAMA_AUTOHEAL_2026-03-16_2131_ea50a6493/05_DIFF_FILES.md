diff --git a/src/main.tsx b/src/main.tsx
index f16e526be..b750afa0f 100644
--- a/src/main.tsx
+++ b/src/main.tsx
@@ -1078,6 +1078,39 @@ window.addEventListener('unhandledrejection', event => {
 console.log('✅ TITANE∞ frontend loaded successfully');
 console.log('>>> MOUNTING REACT ROOT NOW...\n');
 
+// ⚡ FIX: NON-MAIN WINDOW GUARD
+// Root cause: avatar-floating pre-created in tauri.conf.json (no dedicated URL)
+// loads full React bundle → duplicate App.tsx useEffects + Ollama probes + WebKit crash
+// Evidence: tauri.conf.json:47-63, App.tsx:456, main.rs:952+976, ollama.ts:156-165
+const _titaneCurrentWindowLabel: string = (() => {
+  try {
+    const internals = (window as any).__TAURI_INTERNALS__;
+    const label = internals?.metadata?.currentWindow?.label;
+    return typeof label === 'string' && label.length > 0 ? label : 'main';
+  } catch {
+    return 'main';
+  }
+})();
+
+if (_titaneCurrentWindowLabel !== 'main') {
+  // Non-main window (e.g. avatar-floating): mount minimal stub only.
+  // Prevents: duplicate Ollama probes, duplicate boot useEffects, WebKit crash.
+  const _nonMainRoot = document.getElementById('root');
+  if (_nonMainRoot) {
+    ReactDOM.createRoot(_nonMainRoot).render(
+      <React.StrictMode>
+        <div
+          id="titane-secondary-window-stub"
+          data-window-label={_titaneCurrentWindowLabel}
+          data-boot-status="minimal-non-main"
+          aria-hidden="true"
+          style={{ display: 'none' }}
+        />
+      </React.StrictMode>
+    );
+  }
+  console.log(`[TITANE] Non-main window "${_titaneCurrentWindowLabel}" — minimal mode active (boot dedup)`);
+} else {
 // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 // 🎯 REACT ROOT MOUNT - Point critique d'affichage
 // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@@ -1229,3 +1262,4 @@ try {
   `;
   throw error;
 }
+} // end non-main window guard (FIX: UI_BOOT_DUPLICATION + OLLAMA_PROBE_STORM)
diff --git a/src/services/ai/providers/ollama.ts b/src/services/ai/providers/ollama.ts
index 7e87314a5..38d42a6d9 100644
--- a/src/services/ai/providers/ollama.ts
+++ b/src/services/ai/providers/ollama.ts
@@ -79,6 +79,11 @@ const runtimeConfig = (globalThis as any)?.__TITANE_RUNTIME_CONFIG__ || {};
 // ✅ AUDIT FIX #3: Boot ready gate — tracks if Ollama initialized successfully
 export let IS_OLLAMA_READY = false;
 
+// ⚡ FIX-2: Singleton init promise — prevents concurrent probes (OLLAMA_PROBE_STORM)
+// If called from multiple windows/effects, only one real probe runs.
+let _initOllamaPromise: Promise<boolean> | null = null;
+let _initOllamaSettled = false;
+
 // ✅ PROD FIX v27.0.2: Default Ollama Configuration
 export const DEFAULT_OLLAMA_CONFIG = {
   port: 11434,
@@ -156,9 +161,16 @@ const isTestEnv = typeof process !== 'undefined' && Boolean((process as any).env
 let endpointHealthy: boolean | null = null;
 let lastHealthCheck = 0;
 let errorCount = 0;
-const HEALTH_CHECK_INTERVAL = 45000; // 45 secondes
+const HEALTH_CHECK_INTERVAL = 45000; // 45 secondes (stable state)
 const MAX_ENDPOINT_ERRORS = 5;
 
+// ⚡ FIX-3: Warming-up grace period
+// If Ollama fails first probe (just starting), retry sooner than 45s.
+// Distinguishes: warming_up (failed <30s ago) vs truly offline.
+const WARMUP_GRACE_PERIOD_MS = 30000;  // 30s after first failure = "warming_up"
+const WARMUP_RETRY_INTERVAL_MS = 5000; // 5s retry during warmup
+let _initFailedAt = 0;                 // timestamp of first health failure (0 = never)
+
 const CIRCUIT_FAILURE_WINDOW_MS = 60000;
 const CIRCUIT_FAILURE_THRESHOLD = 3;
 const CIRCUIT_OPEN_MS = 120000;
@@ -168,8 +180,27 @@ let failureTimestamps: number[] = [];
 /**
  * OMEGA: Initialize Ollama provider at startup (v27.2Ω)
  * Tests endpoint health via unified transport (HTTP dev / IPC prod)
+ * ⚡ FIX-2: Singleton — returns shared promise if probe already in flight or settled.
  */
 export async function initializeOllama(): Promise<boolean> {
+  // Return cached health if already settled
+  if (_initOllamaSettled && endpointHealthy !== null) {
+    logger.debug('⚡ initializeOllama() — already settled, returning cached state');
+    return endpointHealthy;
+  }
+  // Return in-flight promise if probe already running
+  if (_initOllamaPromise !== null) {
+    logger.debug('⚡ initializeOllama() — probe in flight, sharing promise');
+    return _initOllamaPromise;
+  }
+  // Start new probe (first call)
+  _initOllamaPromise = _doInitializeOllama().finally(() => {
+    _initOllamaSettled = true;
+  });
+  return _initOllamaPromise;
+}
+
+async function _doInitializeOllama(): Promise<boolean> {
   logger.debug('🚀 Initializing Ollama provider (gateway)...');
 
   try {
@@ -182,10 +213,12 @@ export async function initializeOllama(): Promise<boolean> {
 
     if (healthy) {
       errorCount = 0;
+      _initFailedAt = 0; // ⚡ FIX-3: Clear warmup tracking on success
       logger.info('✅ Health check passed (gateway)');
       logger.debug(`📦 Model: ${OLLAMA_MODEL}`);
     } else {
-      logger.warn('⚠️ Endpoint offline (gateway)');
+      if (_initFailedAt === 0) _initFailedAt = Date.now(); // ⚡ FIX-3: Record first failure
+      logger.warn('⚠️ Endpoint offline (gateway) — warming_up grace period active');
       if (!healthResult.ok && healthResult.error) {
         logger.warn(`❌ ${healthResult.error.message}`);
       }
@@ -195,6 +228,7 @@ export async function initializeOllama(): Promise<boolean> {
     return healthy;
   } catch (error) {
     IS_OLLAMA_READY = false; // ✅ AUDIT FIX #3: Mark not ready on error
+    if (_initFailedAt === 0) _initFailedAt = Date.now(); // ⚡ FIX-3: Record warmup failure
     handleOllamaError(error, 'initialization', { transport: 'gateway' });
     logger.error('❌ Initialization failed:', error);
     return false;
@@ -426,10 +460,16 @@ export const ollamaProvider: AIProvider = {
     const bypassCache = isTestEnv;
 
     // OMEGA: Use cached health status if recent (unless test forces re-check)
+    // ⚡ FIX-3: Use shorter interval during warmup grace period
+    const inWarmupPeriod =
+      _initFailedAt > 0 && (now - _initFailedAt) < WARMUP_GRACE_PERIOD_MS;
+    const effectiveCacheInterval = inWarmupPeriod
+      ? WARMUP_RETRY_INTERVAL_MS  // 5s during warmup (warming_up state)
+      : HEALTH_CHECK_INTERVAL;    // 45s stable state
     if (
       !bypassCache &&
       endpointHealthy !== null &&
-      now - lastHealthCheck < HEALTH_CHECK_INTERVAL
+      now - lastHealthCheck < effectiveCacheInterval
     ) {
       return endpointHealthy;
     }
@@ -453,6 +493,9 @@ export const ollamaProvider: AIProvider = {
     if (endpointHealthy) {
       errorCount = 0; // Reset on success
       resetFailures();
+      _initFailedAt = 0; // ⚡ FIX-3: Clear warmup tracking on recovery
+    } else if (_initFailedAt === 0) {
+      _initFailedAt = now; // ⚡ FIX-3: Record first failure for warmup window
     }
 
     logger.debug(
@@ -649,6 +692,9 @@ export const ollamaProvider: AIProvider = {
     errorCount = 0;
     endpointHealthy = null;
     lastHealthCheck = 0;
+    _initFailedAt = 0;         // ⚡ FIX-3: Reset warmup tracking
+    _initOllamaPromise = null; // ⚡ FIX-2: Allow re-init after explicit reset
+    _initOllamaSettled = false;
     logger.debug('🔄 Errors and health state reset');
   },
 
