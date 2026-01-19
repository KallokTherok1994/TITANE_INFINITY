# TITANE∞ Memory Core Stabilization Plan vΩ.6

## Current Findings
- `src-tauri/src/core/legacy.rs`: the shipped `MemoryCore` is a stub returning zeros/empty lists for every method (snapshots, logs, chat interactions), so none of the Tauri commands (`memory_get_state`, `memory_save_chat_interaction`, etc.) actually touch disk.
- Frontend contracts disagree: `src/hooks/useMemoryCore.ts` expects `memory_get_state` to return `entries`, while the Rust `MemoryState` type (`src-tauri/src/types/memory.rs`) only contains counters; `memoryService.saveStructuredEntry()` calls `memory_save_entry`, but no such Tauri command exists in `src-tauri/src/api/memory_api.rs`.
- Actual JSON stores already exist under `memory/cognitive.json`, `memory/harmonics.json`, `memory/singularity.json`, and `memory/system_state.json`, yet no runtime code loads or validates them; the Zustand store (`src/stores/memoryStore.ts`) only surfaces synthetic data.
- The `memory_compactor.rs` module provides deduplication/validation utilities but is never invoked, so corruption or growth limits (`max_size_mb` in `memory/system_state.json`) are unenforced.
- There is no telemetry or watchdog path to flag failed writes, meaning the chat stack assumes persistence succeeded even though nothing is written.

## Phase 0 — Reality Capture & Telemetry Hooks
1. **Directory audit + schema snapshot**: implement a small `memory::filesystem::scan()` helper that inspects the `memory/` folder (from `auto_build.sh` working dir) and reports file sizes, versions, and timestamps; expose as a debug-only Tauri command so we can baseline before changes.
2. **Metric counters**: extend `MemoryState` to include `disk_mode` (disabled, read_only, write_ok) plus last validation timestamp; instrument `memory_get_state` responses so the frontend immediately sees whether persistence is real or synthetic.
3. **Telemetry logging**: wrap every storage call with `tracing::info!(target = "memory", ...)` and emit a `WatchdogEvent::MemoryFailure` on IO errors so the global watchdog can alert the UI.

## Phase 1 — Storage Engine Rebuild (Rust)
1. Replace the stub `MemoryCore` with a struct holding:
   - `base_path: PathBuf` (defaulting to `<app_dir>/memory`).
   - `serde` models mirroring the on-disk JSON (`cognitive`, `system_state`, etc.).
   - A mutex-protected `MemoryIndex` caching offsets to avoid rereading entire files for appends.
2. Implement bounded persistence helpers:
   - `fn load_json<T>(&self, file: &str) -> AppResult<T>` with atomic read + schema validation.
   - `fn append_entry(&self, file: &str, entry: &serde_json::Value)` writing to a temp file then `rename`.
   - `fn recalc_state(&self) -> MemoryState` derived from real counts/filesize.
3. Promote frequently-used operations into dedicated methods (`save_chat_interaction`, `write_log`, `add_event`) that internally call `append_entry` and enforce max entries defined inside `memory/system_state.json` (e.g., `max_size_mb`).
4. Store compaction metadata (last compaction timestamp, duplicates removed) next to each JSON file so we can surface health in the UI.

## Phase 2 — Command Surface & API Contract
1. Expand `src-tauri/src/api/memory_api.rs` to add the actually-used commands:
   - `memory_save_entry` (structured blob), `memory_clear`, `memory_load_context`, `memory_validate_disk`, and `memory_run_compaction`.
   - Every command must return `AppResult<ApiResponse<T>>` once `ChatError` plumbing from the backend hardening plan lands.
2. Ensure legacy commands remain but mark them `#[deprecated(note = "Use memory_load_context")]` where applicable; internally they should call the new engine rather than returning empty payloads.
3. Define shared DTOs in `src-tauri/src/types/memory.rs` for `StructuredEntry`, `MemoryContext`, `ValidationReport` so both Rust and TypeScript consume the same schema.
4. Update `src-tauri/src/compat/core_collection.rs` and `shared/titane_core.rs` so the global `TitaneCore` exposes the new `memory` methods to orchestrators and auto-verify routines.

## Phase 3 — Frontend Contract & Store Alignment
1. Refactor `src/services/api/memory.ts`:
   - Replace `memory_save_entry`/`secureInvoke` fallbacks with the new commands.
   - Surface `ValidationReport`, `disk_mode`, and compactor stats to the UI cache.
   - Add jitter/backoff-aware retry profiles (writes should be STRICT, reads can be FAST).
2. Update `src/stores/memoryStore.ts` so `fetchState` hydrates the expanded `MemoryState` (real counts, disk health) and expose selectors for `diskMode`, `lastValidation`, and `compactor` results.
3. Modernize `src/hooks/useMemoryCore.ts`: remove the legacy assumption about `entries`, switch to consuming the new `MemoryContext`, and expose helper actions (`requestCompaction`, `clearMemory`) that map directly to the new Tauri commands.
4. Ensure every UI write path (chat composer, diagnostics, manual entries) flows through `memoryService.saveChatInteraction` so cache invalidation remains centralized.

## Phase 4 — Persistence Integrity, Validators & Compactor Loop
1. Wire `src-tauri/src/memory_compactor.rs` into the new `MemoryCore`: after every N writes or when `max_size_mb` is exceeded, enqueue a compaction job (tokio task) that deduplicates + trims JSON files.
2. Add `MemoryValidator` that checks:
   - JSON readability and schema alignment.
   - Entry ordering (timestamps ascending when `enable_sorting` true).
   - Size/entry limits; if violated, return `StateCorruption` so the frontend can display a repair CTA.
3. Store validator outcomes inside `memory/system_state.json` (e.g., `last_validation`, `issues: Vec<String>`) and expose via `memory_get_state`.
4. Ship a CLI-friendly `memory doctor` (reusing validator + compactor) callable from `auto_build.sh` / CI pipelines to guarantee artifacts before release.

## Phase 5 — Auto-Heal & Observability
1. Integrate memory-specific watchdog signals: when validation fails or writes error out, emit `WatchdogEvent::MemoryDegraded` so `watchdog` modules (already used in chat hardening) can pause risky features.
2. Publish structured telemetry events to the frontend (via `backendV17.watchdog.subscribe`) so the UI can show banners (“Memory running in read-only safe mode”).
3. Provide rollback hooks: if `memory/` becomes corrupted, automatically switch to `read_only` mode, block writes, and prompt the operator to run compaction/doctor.
4. Persist daily snapshots into `memory/singularity.json` (already provisioned) so we can restore user context after repair; guard with atomic rename semantics.

## Phase 6 — Tests, Tooling & Rollout
1. **Rust tests**: add unit tests for `MemoryCore` (load/save, truncation, compaction triggers) plus integration tests under `src-tauri/tests/memory_core.rs` verifying Tauri commands touch disk files in a temp dir.
2. **TypeScript tests**: mock the `invoke` bridge to ensure `memoryService` cache invalidation, structured context assembly, and error propagation are deterministic (Vitest suite alongside existing diagnostics).
3. **Docs & Playbooks**: create `docs/MEMORY_CORE_vOmega6.md` summarizing file layout, validator checklist, CLI usage, and operator runbooks (detect → compact → revalidate).
4. **Release gating**: add a CI step (`pnpm run memory:doctor` + `cargo test memory_core`) so builds fail if the validator or tests regress; require a passing memory health report before enabling `GO ALL AUTO!` autonomous loops.

## Expected Outcomes
- Real disk-backed persistence with bounded size, deduplication, and recovery hooks.
- Unified front/back contracts plus telemetry so operators immediately know when memory is degraded.
- Automated repair path (validator + compactor) integrated into watchdog loops, enabling the autonomous mode to trust stored knowledge again.
