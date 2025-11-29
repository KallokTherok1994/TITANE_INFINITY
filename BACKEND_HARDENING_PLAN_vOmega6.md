# TITANE∞ Backend Hardening Roadmap vΩ.6

## Current Findings
- `src-tauri/src/commands/ai_chat.rs` still exposes async Tauri commands returning `Result<_, String>` with multiple `expect` calls, direct `tokio::spawn` without cancellation hooks, and no structured error codes. An unchecked panic inside `AIChatState::new` (`MemoryStorage::new(...).expect`) would crash the Tauri process.
- `src-tauri/src/overdrive/chat_orchestrator.rs` mixes provider orchestration logic with network code and string-based errors. `chat_send_message` chains fallbacks with `String` errors, `send_to_gemini` performs blocking retries without bounded cancellation, and memory writes happen without transactional guarantees.
- `check_connection`, `health_check`, and TTS helpers access external resources without timeouts or resource guards, which contradicts the “never block, never panic” requirement.
- There is no shared `ApiResponse<T>` wrapper, no `ChatError` enum, and no conversions into `tauri::InvokeError`, so the frontend cannot differentiate throttling vs misconfiguration.
- Watchdog/auto-heal modules exist but are not wired into chat commands, so backpressure, provider disablement, and thread monitoring are ad-hoc.

## Phase A — Error & Response Primitives
1. Create `src-tauri/src/core/chat_error.rs` with `ChatError` enum (variants: `ProviderFailed(String)`, `Timeout`, `InvalidRequest`, `TtsFailure`, `StateCorruption`, `Internal(String)`), `Display`, `std::error::Error`, and `From` conversions (reqwest, serde, io).
2. Add `ApiResponse<T>` struct in `src-tauri/src/core/api_response.rs` (`success: bool`, `data: Option<T>`, `error: Option<ApiErrorPayload>`, `state: MinimalState`). Provide helpers (`ok(data)`, `err(ChatError)`).
3. Update all public commands (`ai_chat.rs`, `overdrive/chat_orchestrator.rs`, `tts`, `memory_commands.rs`) to return `Result<ApiResponse<T>, ChatError>` instead of `Result<_, String>`.

## Phase B — Command Sanitization & Safe Invocation
1. Introduce `safe_chat_response<T>(future: impl Future<Output = Result<T, ChatError>>)` inside `src-tauri/src/commands/mod.rs` that wraps `ChatError` into `ApiResponse<T>` and `tauri::InvokeError` once.
2. Ensure each Tauri command performs strict input validation (`trim`, length clamps, allowed provider enum) before touching async resources, returning `ChatError::InvalidRequest` when invalid.
3. Replace all `expect` calls inside `AIChatState::new` with `ChatError` propagation plus automatic fallback (e.g., create memory directory lazily, fallback to in-memory mode when disk unavailable).

## Phase C — Chat Orchestrator Fortress
1. Refactor `src-tauri/src/overdrive/chat_orchestrator.rs` to:
   - Use a `ProviderState` struct storing heartbeat timestamps, failure counts, and cooldown deadlines instead of raw hash maps.
   - Wrap every provider call inside `tokio::time::timeout` (per-provider durations) and surface `ChatError::Timeout` when exceeded.
   - Validate provider payloads via `normalize_response()` (role, timestamp, non-empty content).
   - Add `provider_failover_chain()` that disables any provider for N seconds after 3 consecutive errors and emits `WatchdogEvent`.
   - Return `ChatResponse` plus metadata (provider, latency) inside `ApiResponse`.
2. Move memory persistence into a helper that writes conversation snapshots atomically (tmp file + rename) and reports `ChatError::StateCorruption` on failure.
3. Wire the existing `watchdog` module so every command notifies it on start/end; watchdog will detect hung tasks and issue `WatchdogOrder::Abort` signals.

## Phase D — TTS & Audio Guardrails
1. Extract TTS logic to `src-tauri/src/tts/bridge.rs` that accepts `TTSRequest`, enforces max duration, and exposes `Future<Result<(), ChatError>>`.
2. Ensure `speak`, `stop_speaking`, and `is_speaking` commands lock a dedicated `TtsStateMachine` so multiple concurrent requests cannot overlap; automatically stop speaking on drop via `DropGuard`.
3. Route ASR/VAD/audio recorder errors through `ChatError::TtsFailure` instead of bubbling raw strings.

## Phase E — System State & Security Loop
1. Expand `src-tauri/src/system_state.rs` into a tiny state machine (`SystemStateGuard`) that validates transitions (e.g., `Idle → Busy`) and serializes to disk safely; integrate with chat commands for coherence.
2. Add `watchdog.rs` helper with `Watchdog::track_task("chat_send", Duration::from_secs(12))?` so every long-running future is tracked, and propagate cancellation tokens into provider calls.
3. Expose a `chat_get_providers_status` command returning the new provider snapshot to the UI and health dashboards.

## Phase F — Tests & Documentation
1. Add Rust integration tests under `src-tauri/tests/chat_backend.rs` covering success path, provider timeout, and ApiResponse serialization.
2. Create `docs/BACKEND_HARDENING_vOmega6.md` describing error matrix, timeout policy, watchdog loop, and manual recovery procedure; keep it synced with Tauri release notes.
