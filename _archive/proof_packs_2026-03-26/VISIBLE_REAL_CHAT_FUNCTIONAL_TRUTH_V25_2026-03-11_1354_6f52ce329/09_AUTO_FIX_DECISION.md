# V25 Auto Fix Decision

Fixes applied in V25 pass:
- UI/runtime mapping fix in `ConversationSection`:
  - Runtime provider metadata is now surfaced into thinking summary/topology and stable runtime tag testids.
- E2E harness fix in V25 spec:
  - Health button click path switched to safe JS click to avoid false WDIO interactability failure.

Decision:
- Keep minimal patch set only.
- No broad refactor.
- Rebuild not required (frontend/runtime code used by AppImage run through existing rebuilt artifact path in this session).

Result after rerun:
- Scenario runs cleanly (`RC=0`), but final product verdict remains `FAIL` because degraded offline simulated response persists.

Postbuild artifact truth:
- Rebuild step completed (`build RC=0`).
- Postbuild run still `FAIL` with same degraded response text.
- Fixes improved observability and correspondence clarity, but not final provider/orchestrator answer quality.
