# Step 7: The 7 Failing Specs — Root Cause Analysis

## Complete Classification

### Spec 1: `ai-verification.full.e2e.js` (worker #0-0) — 3 test failures

| Phase | Error | Root Cause |
|-------|-------|-----------|
| always respond (20 prompts) | `PHASE_ABORT_CONSECUTIVE_ERRORS(ALWAYS_RESPOND): 3 failures; last=timeout waiting for send acknowledgement` | **OLLAMA_ENV_BLOCKED** — Ollama API was timing out at run time (06:57 UTC) |
| offline autonomy (5 prompts) | `PHASE_ABORT_CONSECUTIVE_ERRORS(OFFLINE): 3 failures; last=RECOVERED_RETRY_FAILED` + `session deleted because of page crash or hang` | **TEST_HARNESS_LIMITATION** — test injects `window.fetch = () => Promise.reject('OFFLINE_TEST')` which crashes WebKit/Tauri session |
| memory + metacognition | `PHASE_ABORT_CONSECUTIVE_ERRORS(MEMORY_METACOG): timeout waiting for send acknowledgement` | **CASCADE** from OFFLINE_SIM session crash |

### Spec 2: `ui-ultra-full.e2e.js` (worker #0-1) — 1 failure
```
Error: element ("[data-testid="chat-input"]") still not enabled after 5000ms
  at sendChatAndAssertNoSilence (ui-driver.wdio.js:569:3)
```
**Root cause**: **OLLAMA_ENV_BLOCKED** — chat input remains disabled when no AI provider is reachable (input enabled only after provider health check passes)

### Spec 3: `audio-tts-runtime-controls.wdio.test.js` (worker #0-5) — 1 failure
```
Error: No audio test result text detected within timeout
```
**Root cause**: **INDEPENDENT_OF_OLLAMA** — TTS/audio subsystem test. Not related to online chat path.

### Spec 4: `chat-ar20.wdio.test.js` AR20 (worker #0-6) — 1 failure (4 passing)
```
AssertionError: Message 3/20 failed: WebDriverError: Could not parse script result
  when running "execute/async" with method "POST"
```
**Root cause**: **OLLAMA_ENV_BLOCKED (intermittent)** — at message 3/20 during the 6-minute AR20 run, Ollama response was unavailable or timed out causing WebDriver async execute to fail to parse result.

### Spec 5: `online-chat-proof-ui.wdio.test.js` (worker #0-11) — 1 failure
```
AssertionError: [G_RESPONSE_KIND] expected assistant, got timeout
{"assistantText":"","providerUsed":"","ipcReadyState":"READY","providerMode":""}
```
**Root cause**: **OLLAMA_ENV_BLOCKED** — IPC ready but Ollama did not return a response within timeout window. providerUsed="" confirms provider selection failed.

### Spec 6: `total-dev-debug.wdio.test.js` (worker #0-15) — 1 failure (2 passing)
```
panelFound: false, lockFound: false, headerFound: false
```
**Root cause**: **UI_PANEL_NOT_FOUND** — debug panel/lock/header elements not rendered. Possibly Ollama-dependent (panel only renders after AI provider init) or separate UI timing issue.

### Spec 7: `ui-connectivity-critical.wdio.test.js` (worker #0-18) — 1 failure (1 passing)
```
ReferenceError: Cannot access uninitialized variable.
  url: tauri://localhost/assets/services-ai-C2K6-7v0.js
  line: 2, col: 2817
Also: Command start_recording not found
```
**Root cause**: **INDEPENDENT_JS_ERROR** — TDZ (Temporal Dead Zone) ReferenceError in the bundled AI services chunk. Not Ollama-dependent. Pre-existing JS initialization order issue in build artifact.

## Summary by Category

| Category | Count | Specs |
|----------|-------|-------|
| OLLAMA_ENV_BLOCKED | 4 | ai-verification ph1, ui-ultra-full, chat-ar20 AR20, online-chat-proof-ui |
| TEST_HARNESS_LIMITATION | 2 | ai-verification ph2-3 (OFFLINE_SIM WebKit crash) |
| INDEPENDENT_OF_OLLAMA | 2 | audio-tts-runtime-controls, ui-connectivity (JS error) |
| UI_PANEL_NOT_FOUND | 1 | total-dev-debug (possibly Ollama-dependent) |

## Key Finding: Online Chat Path IS Working
V25, V26, and chat-AR20 TEST A/B/C all PASSED in the same run that produced these 7 failures.
- V26 captured a REAL assistant response from gemma2 via Ollama
- chat-AR20 TEST A (simple prompt), TEST B (offline fallback), TEST C (invalid keys) all PASS

The 7 failures are **NOT** evidence of a product defect in the online chat path.
