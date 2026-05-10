# UI Backend Runtime Proof Plan — v47
<!-- Mission: UI_BACKEND_RUNTIME_PROMOTION_v47 -->
<!-- Created: 2026-05-10 -->
<!-- Status: PENDING_RUNTIME — requires active Tauri build + hardware -->

## Purpose

This plan defines the exact commands, prerequisites, expected evidence, and blocker conditions required to upgrade the v47 surfaces from `ACTIVE_PARTIAL` (static classification) to `RUNTIME_PROVEN` (live wiring verified).

**Current state after v47:** All static gates pass. Runtime verification is blocked pending a Tauri production build and live execution environment.

---

## Prerequisites

| Prerequisite | Command | Expected Outcome |
|---|---|---|
| Tauri build present | `ls src-tauri/target/release/TITANE_INFINITY` | Binary exists (>10MB) |
| AppImage available | `ls release/*.AppImage` or `ls deployment/latest/*.AppImage` | AppImage artifact ≥100MB |
| Ollama running | `curl -s http://127.0.0.1:11434/api/tags` | JSON response with `gemma2:2b` in models |
| Tauri dev mode possible | `pnpm run dev:tauri 2>&1 | head -20` | Vite + Tauri start without fatal error |
| Display available | `echo $DISPLAY` | `:0` or equivalent |

---

## Phase 1 — IPC Command Verification (requires Tauri runtime)

### 1.1 Core IPC commands for ACTIVE_PARTIAL surfaces

| Route | IPC Command | Verification Command | Expected |
|---|---|---|---|
| `/titane` | `conversation_generate` | Tauri invoke from frontend | `{ ok: true, content: "..." }` |
| `/time` | `get_time_agenda`, `get_time_snapshots` | Tauri invoke + UI tab switch | Data rendered in TIME tabs |
| `/admin` | `get_system_status`, `get_runtime_config` | Admin page load | System status visible |
| `/dev` | `get_dev_operations`, `run_dev_command` | Dev page load + button click | Command output in panel |
| `/experience` | `get_experience_state`, `award_xp` | XP display visible | Level + XP bar populated |
| `/memory` | `get_memory_stats`, `persist_memory` | Memory page load | Stats populated |
| `/research` | `web_research_search` | Submit research query | Citations returned |
| `/doc-center` | `doc_export_docx` | Export button click | DOCX file created |
| `/twins` | `get_twin_identity`, `get_twin_evolution` | Twins page load | Twin profile visible |
| `/fusion` | `get_fusion_state`, `run_fusion_sync` | Fusion dashboard load | Engine nodes visible |

### 1.2 Verification script

```bash
# Prerequisites: Tauri dev mode running on http://localhost:1420
# Run this AFTER confirming Vite + Tauri are up

# Verify IPC contract exists for each surface
node scripts/verify/verify-ui-surface-registry.mjs  # should PASS
pnpm run guard:ipc-contract 2>&1 | tail -5        # IPC contract gate
```

---

## Phase 2 — E2E Runtime Proof (requires Tauri AppImage + display)

### 2.1 Playwright E2E critical paths

```bash
# Start AppImage in background
DISPLAY=:0 ./deployment/latest/titane-infinity_*.AppImage &
APP_PID=$!
sleep 5

# Run critical E2E suite
pnpm run test:e2e 2>&1 | tee proof_packs/v47/e2e-runtime-proof.log

# Check for data-testid presence on each priority page
npx playwright test e2e/critical/ --grep "truth-badge|PARTIAL" 2>&1 | tee proof_packs/v47/badge-e2e.log

kill $APP_PID
```

### 2.2 Expected E2E evidence

For each priority page, the following must be observable:

```
✅ surface-truth-badge-partial visible on /titane
✅ surface-truth-badge-partial visible on /time
✅ surface-truth-badge-partial visible on /admin
✅ surface-truth-badge-partial visible on /dev
✅ surface-truth-badge-partial visible on /experience
✅ surface-truth-badge-partial visible on /memory
✅ surface-truth-badge-partial visible on /research
✅ surface-truth-badge-partial visible on /doc-center
✅ surface-truth-badge-partial visible on /twins
✅ surface-truth-badge-partial visible on /fusion
```

### 2.3 SIMULATED surfaces (verified in v46)

```
✅ page-health-banner-orchestration-intelligence — PageHealthBanner present
✅ page-health-banner-quantum-center — PageHealthBanner present
```

---

## Phase 3 — Runtime Truth Upgrade Gates

Once Phases 1-2 pass, surfaces can be upgraded in the registry:

| Condition | Registry Change |
|---|---|
| IPC confirmed live + UI populated | `status: 'ACTIVE_PARTIAL'` → `status: 'ACTIVE_SYNCED'` |
| Backend command returns live data | `truthClass: 'MIXED_LIVE_AND_STATIC'` → `truthClass: 'LIVE_TAURI'` |
| Full pipeline verified end-to-end | `truthClass` → `truthClass: 'LIVE_TAURI_GOVERNED'` |

---

## Blocker Conditions

| Blocker | Classification | Resolution |
|---|---|---|
| No Tauri build present | `BLOCKED_RUNTIME_BUILD` | Run `pnpm run build:tauri` first |
| Ollama not running | `BLOCKED_RUNTIME_OLLAMA` | Run `ollama serve` first |
| No DISPLAY (headless env) | `BLOCKED_RUNTIME_DISPLAY` | Use Xvfb or real display |
| IPC command not in allowlist | `BLOCKED_IPC_ALLOWLIST` | Add to `src-tauri/capabilities/default.json` |
| AppImage missing | `BLOCKED_ARTIFACT_MISSING` | Run BUILD ALL first |

---

## AutoHeal Entry (to be added after runtime proof)

```jsonl
{"id":"v47-runtime-proof-2026-05-10","date":"2026-05-10","scope":"src/registry/uiSurfaceRegistry.ts,src/pages/*","symptom":"ACTIVE_PARTIAL surfaces lack RUNTIME_PROVEN status — IPC wiring unverified","root_cause":"Runtime unavailable during v47 static certification session","fix":"Execute Phases 1-3 of this proof plan with Tauri runtime active","prevention_test":"pnpm run verify:ui-surface-registry + E2E badge checks","commands":["node scripts/verify/verify-ui-surface-registry.mjs","pnpm run test:e2e"],"files_changed":["docs/ui/UI_BACKEND_RUNTIME_PROOF_PLAN_v47.md"],"rollback":"Registry status fields remain at ACTIVE_PARTIAL until runtime confirmed"}
```

---

## Proof Pack Location

All runtime proof artifacts must go to: `proof_packs/v47/`

Required files:
- `e2e-runtime-proof.log` — Playwright E2E output with exit code
- `badge-e2e.log` — Badge visibility E2E output
- `ipc-contract-gate.log` — IPC contract verifier output
- `screenshot-<route>.png` — Screenshot per priority page (10 required)
- `RUNTIME_VERDICT.md` — Final verdict (`PASS` or `FAIL`)

---

## Current Session Status

```
Session mode: Durable (MAIN branch)
Runtime available: NO (Tauri build not executed in this session)
Static gates: PASS (tsc + verifier + 60 tests)
Badge coverage: APPLIED (10 priority pages)
SIMULATED disclosure: CONFIRMED (2 surfaces)
Docs generator: OPERATIONAL
Verifier: PASS (0 warnings)

CURRENT VERDICT: UI_BACKEND_RUNTIME_PROMOTION_STATIC_CLEAN_RUNTIME_PENDING
```
