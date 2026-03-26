# V25 Fullstack Sync Audit

Target question intent:
- Ask active modules and orchestrator state.

Expected:
- A real assistant answer describing modules/orchestrator/runtime chain.

Observed:
- Assistant response stays: `Mode OFFLINE_SIM actif. Reponse hors ligne deterministe.`
- Runtime badges include offline/fallback/simulated.
- No timeout marker, but degraded fallback is explicit.

Classification:
- `FULLSTACK_SYNC_DEFECT`
- `PROVIDER_FAILURE` (degraded fallback path)
- `HARNESS_LIMITATION` (send activation typing path only)

Backend/orchestrator/provider/memory conclusion:
- UI is live and responsive.
- Chat request/response loop exists.
- Fullstack chain does not present a normal real-provider answer for the canonical prompt on this run; degraded simulated response dominates.

## Postbuild confirmation

- Rebuild + rerun did not remove degraded output.
- Runtime attributes now explicitly prove local offline fallback (`OFFLINE` + `FALLBACK_OFFLINE`, network false).
- Therefore issue is not just a stale artifact gap; it remains a runtime fullstack behavior defect for certification scope.
