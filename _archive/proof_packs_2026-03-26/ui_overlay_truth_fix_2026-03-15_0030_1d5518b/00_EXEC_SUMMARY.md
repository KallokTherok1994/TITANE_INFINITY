# UI Overlay Truth Fix — Exec Summary

- Date: 2026-03-15
- Base SHA: 1d5518b15
- Scope: `src/features/vision/DetectionOverlay.tsx`
- Objective: remove residual decorative mock signaling and enforce truthful runtime state.

## Change

`DetectionOverlay` now:
- reads real observation state from `useVisionStore(selectIsObservationActive)`.
- no longer draws mock boxes.
- no longer reports fake detection count fallback (`|| 2`).
- shows explicit zero-state message when no detections are available.

## Validation

- `pnpm check`: PASS
- `pnpm lint`: PASS
- `pnpm format:check`: PASS
- `pnpm test`: PASS (216 files, 3224 tests)
- `bash scripts/autoheal/detect_recurrence.sh`: PASS (`entries=307`)
- `bash scripts/verify_instructions.sh`: PASS (`PASS=20 FAIL=0`)
