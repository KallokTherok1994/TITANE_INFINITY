# Lock C1 — Desktop Lane Linkage

Lock: C1 — MemoryGraph v2 Shadow Mode
Date: 2026-05-06

## Linked Desktop E2E Lanes

| Lane ID | Name | Status | Blocker | Lock dependency |
|---------|------|--------|---------|-----------------|
| AI-DESKTOP-06 | Memory write/read baseline | PLANNED | pending E0 harness | C1/E0 |
| AI-DESKTOP-07 | MemoryGraph shadow write | PLANNED | pending E0 harness | C1/E0 |

## Coverage Notes

Both lanes are registered in `docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md`.
They remain `PLANNED` because the E0 desktop harness (actual binary + launch) has not been
executed yet. C1 implementation is complete and tested at unit level (47/47 PASS).

## Execution Prerequisites for AI-DESKTOP-06/07

1. E0 harness: `e2e/advanced-intelligence/` scaffold activated
2. `VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW=true` set in E2E env
3. Production TITANE binary running with C1 feature flag
4. E2E test driver can write a memory node and observe shadow write result
5. AI-DESKTOP-07: verify shadowWriteCoordinator called; log `[MemoryGraph v2 Shadow]` emitted

## Evidence File Location

Once E0 executes, evidence will be stored in:
- `e2e/advanced-intelligence/artifacts/AI-DESKTOP-06-result.log`
- `e2e/advanced-intelligence/artifacts/AI-DESKTOP-07-result.log`
