# 11 — GATES REPORT (Session 2)

| Gate | Status | Evidence |
|------|--------|---------|
| G_ROUTE_TWINS_REACHABLE | PASS | App.tsx route confirmed |
| G_PANEL_TWINS_RENDERED | PASS | TwinsPage.tsx mounts TwinEvolutionPanel |
| G_TWIN_IPC_COMMANDS_REACHABLE | PASS | 8 commands in main.rs + ALLOWED_COMMANDS |
| G_TWIN_ALLOWLIST_ALIGNED | PASS | All 8 twin_* in ALLOWED_COMMANDS |
| G_TWIN_CONTEXT_WRITTEN | PASS | useTwinEvolution writes globalScore+trend+currentPhase+syncScore+updatedAt |
| G_TWIN_CONTEXT_ENVELOPED | PASS | 17/17 tests pass |
| G_TWIN_CONTEXT_BOUND | PASS | extract_context_binding now has twinsPhase + twinsSyncScore |
| G_TWIN_SYSTEM_PROMPT_INJECTED | PASS | TWINS_CONTEXT includes phase when known |
| G_TWIN_RESPONSE_EFFECT_PROVEN_OR_CLASSIFIED | PASS | TWINS_CONTEXT_INJECTED_BUT_EFFECT_UNPROVEN |
| G_NO_FAKE_TWIN_INTEGRATION | PASS | No hardcoded values; stale guard active; phase=unknown filtered |
| G_DESKTOP_TARGET_TRUTH | BLOCKED | Node<20 env, no Tauri binary |
| G_X3_STABILITY | BLOCKED | No desktop runtime |
| G_ROLLBACK_READY | PASS | git restore commands documented |

verify_instructions.sh: PASS=20 FAIL=0
detect_recurrence.sh: G_AH_RECURRENCE_GUARD_PASS
