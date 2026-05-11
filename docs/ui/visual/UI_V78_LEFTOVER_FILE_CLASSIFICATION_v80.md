# UI v78 Leftover File Classification v80

Date: 2026-05-11
Mode: DURABLE

## Objective
Classify and preserve visibility on v78 leftovers while sealing v80 artifacts.

## Classified Leftovers
- `artifacts/ui-visual/v78-desktop-installed-visual-capture.jsonl`
  - Status: retained as historical evidence
  - Reason: pre-fix baseline where screenshot API mismatch existed
- `artifacts/ui-visual/screenshots/v78/desktop/`
  - Status: retained as historical evidence
  - Reason: baseline images tied to v78 desktop run

## v80 Authoritative Artifacts
- `artifacts/ui-visual/v80-production-visual-capture.jsonl`
- `artifacts/ui-visual/screenshots/v80/production/`
- `artifacts/ui-visual/v80-desktop-test-gap-results.jsonl`

## Notes
- v78 leftovers are not used for v80 verdict computation.
- v80 verifier input is explicitly set to v80 artifact path.
