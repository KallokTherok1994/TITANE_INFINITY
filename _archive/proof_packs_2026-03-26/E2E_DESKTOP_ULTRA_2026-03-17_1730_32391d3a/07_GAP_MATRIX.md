# 07_GAP_MATRIX.md

## Classification Legend
- PROVEN_RUNTIME: IPC chain proven end-to-end, desktop E2E x3 passed
- PROVEN_VISIBLE_ONLY: DOM visible, not IPC-proven
- STATIC_ONLY: file/contract/route exists, no runtime proof
- UI_ONLY: UI renders, no IPC wiring proven
- PARTIAL_CHAIN: some IPC commands covered, full chain not proven
- STALE_TARGET_RISK: proven against binary that doesn't reflect current HEAD
- STALE_ARTIFACT_RISK: artifact present but outdated relative to HEAD
- BLOCKED_BY_ENV: blocked by environment (display, driver, build)
- BLOCKED_BY_IPC: IPC command exists but fails or unregistered
- LEGACY_PATH: deprecated/redirect path
- STUB_PATH: stub implementation, not real product
- UNKNOWN: no E2E, no discovery proof

---

## Critical Surfaces

| Surface | Route/Access | Classification | Evidence | Blocker |
|---------|-------------|----------------|---------|---------|
| Chat (send/receive) | /titane tab-conversation | STALE_TARGET_RISK | Desktop E2E PASS x3 at 13:14 binary; binary doesn't include FIX-009..012 | Binary stale |
| TTS audio controls | /titane → /admin tab-audio | STALE_TARGET_RISK | audio-tts-runtime-controls x3 PASS (16:20Z prev session); binary stale re: current HEAD | Binary stale |
| Boot / shell | App init | PROVEN_VISIBLE_ONLY | smoke.wdio.test.js PASS, waitAppReady marker proven | IPC boot sequence not proven separately |
| Main navigation | top nav (7 items) | PROVEN_VISIBLE_ONLY | ui-ultra-smoke, v22_visible_real_ui_cert PASS | IPC chains per page not individually proven |
| Admin tabs | /admin (6 tabs) | PROVEN_VISIBLE_ONLY | admin-design-truth PASS | Deeper IPC chains not proven |
| Memory list | /memory | PARTIAL_CHAIN | memory-conversations.wdio PASS | Full memory IPC chain partial |
| Time page | /time | PARTIAL_CHAIN | smoke PASS navigation | Tab IPC chains not proven |
| Dev/Stats | /dev | PARTIAL_CHAIN | v22/v24 cert PASS | Deep IPC (diagnostic, security) not proven |

## High-Priority Surfaces

| Surface | Route | Classification | Notes |
|---------|-------|----------------|-------|
| /sentinel | /sentinel | PARTIAL_CHAIN | sentinel page navigable; runtime chain not proven E2E |
| /watchdog | /watchdog | PARTIAL_CHAIN | system-resilience.spec.ts covers alert detection |
| /singularity | /singularity | UNKNOWN | No E2E coverage; 10 IPC commands registered |
| /orchestration | /orchestration | PARTIAL_CHAIN | omega-pipeline browser E2E; no desktop E2E |
| /identity-center | /identity-center | UNKNOWN | IPC: persona_get_multipliers discovered; no E2E |
| /memory-evolution | /memory-evolution | UNKNOWN | No E2E coverage |
| /reality-center | /reality-center | UNKNOWN | IPC: pipeline registered; no E2E |
| /nexus-engine | /nexus-engine | UNKNOWN | NexusEngineState aligned (FIX-003); no E2E |
| /harmonia-engine | /harmonia-engine | UNKNOWN | HarmoniaEngineState aligned (FIX-003); no E2E |
| /cloud | /cloud | UNKNOWN | No E2E coverage |
| /selfheal | /selfheal | UNKNOWN | IPC: autoheal_* registered; no E2E |

## Medium/Low Priority

| Surface | Route | Classification | Notes |
|---------|-------|----------------|-------|
| /cognitive-evolution | /cognitive-evolution | UNKNOWN | No E2E |
| /identity-memory-evolution | /identity-memory-evolution | UNKNOWN | No E2E |
| /experience | /experience | UNKNOWN | No E2E |
| /meta-center | /meta-center | UNKNOWN | No E2E |
| /multi-ai-dashboard | /multi-ai-dashboard | UNKNOWN | No E2E |
| /cognitive-state | /cognitive-state | UNKNOWN | No E2E |
| /hyper-center | /hyper-center | UNKNOWN | No E2E |
| /quantum-center | /quantum-center | UNKNOWN | No E2E |
| /twins | /twins | UNKNOWN | No E2E |
| /knowledge | /knowledge | UNKNOWN | No E2E |
| /creation | /creation | UNKNOWN | No E2E |
| /evolution | /evolution | UNKNOWN | No E2E |
| /adaptive | /adaptive | UNKNOWN | No E2E |
| /research | /research | UNKNOWN | No E2E |
| /performance | /performance | UNKNOWN | No E2E |

## Redirect/Legacy Paths

| Path | Redirects To | Classification |
|------|-------------|----------------|
| /chat → /titane | LEGACY_PATH | redirect confirmed |
| /camera → /titane | LEGACY_PATH | redirect confirmed |
| /stats → /dev | LEGACY_PATH | redirect confirmed |
| /cognitive → /dev | LEGACY_PATH | redirect confirmed |
| /settings → /admin | LEGACY_PATH | redirect confirmed |
| /audio-center → /admin | LEGACY_PATH | redirect confirmed |
| /diagnostics → /admin | LEGACY_PATH | redirect confirmed |
| /governance-center → /admin | LEGACY_PATH | redirect confirmed |

## Anti-Lie Gap Surfaces

| Anti-Lie Check | Surface | Current Status | Risk |
|---------------|---------|----------------|------|
| UI says cloud but network_used=false | /titane chat | PARTIAL — provider-decision-certification tests provider routing | MEDIUM |
| UI says available=true but chain fails | /admin health | NOT TESTED | HIGH |
| UI says updated but no real refresh | Memory/Stats | NOT TESTED | MEDIUM |
| UI says ready while only shell exists | Boot | PROVEN_VISIBLE_ONLY | LOW (boot proven) |
| Stale artifact certified as current | Desktop binary | STALE_ARTIFACT_RISK | HIGH |
| Engine labels mismatch IPC state | /nexus-engine, /harmonia-engine | UNKNOWN | HIGH |
| Source label mismatches real source | Chat provider label | PARTIAL | MEDIUM |

## Gap Summary

| Classification | Count | % of 36 routes |
|---------------|-------|----------------|
| PROVEN_RUNTIME | 0 | 0% (all proven pre-current-HEAD = STALE_TARGET_RISK) |
| STALE_TARGET_RISK | 2 | 5.5% |
| PROVEN_VISIBLE_ONLY | 5 | 13.9% |
| PARTIAL_CHAIN | 9 | 25% |
| UNKNOWN | 23 | 63.9% |
| UI_ONLY | 2 | 5.5% |

**CRITICAL FINDING: 0 routes currently at PROVEN_RUNTIME due to binary staleness.**
**63.9% of routes are UNKNOWN (no E2E at any level).**
