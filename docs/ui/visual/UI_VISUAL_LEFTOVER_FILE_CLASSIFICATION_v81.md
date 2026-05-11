# UI VISUAL Leftover File Classification v81

Date: 2026-05-11

## Input Evidence
- git status --short executed
- find artifacts/ui-visual -maxdepth 4 -type f executed
- git ls-files artifacts/ui-visual executed

## Untracked Residue Classification

- artifacts/ui-visual/screenshots/v78/desktop/
  - Classification: KEEP_UNTRACKED_GENERATED_SCREENSHOT
  - Reason: historical desktop screenshot set; large binary footprint; not required for v81 CI repair commit.

- artifacts/ui-visual/screenshots/v80/
  - Classification: KEEP_UNTRACKED_GENERATED_SCREENSHOT
  - Reason: generated visual screenshot tree already represented by tracked JSONL artifacts and proof docs.

- artifacts/ui-visual/v78-desktop-installed-visual-capture.jsonl
  - Classification: KEEP_UNTRACKED_RUNTIME_LOG
  - Reason: historical intermediate desktop artifact; not required by current v80/v81 certification chain.

- artifacts/ui-visual/v80-debug-dev-memory.jsonl
  - Classification: KEEP_UNTRACKED_RUNTIME_LOG
  - Reason: debug-only intermediate artifact used during v80 diagnosis; superseded by final v80 artifact.

- docs/ui/visual/UI_FULL_VISUAL_PRODUCTION_DESKTOP_AUDIT_CERTIFICATION_v78.md
  - Classification: COMMIT_AS_HISTORICAL_PROOF
  - Reason: documentation artifact of prior sealed campaign; valuable history.

- docs/ui/visual/UI_REMOTE_CI_STATUS_v80.md
  - Classification: COMMIT_AS_HISTORICAL_PROOF
  - Reason: prior status trail relevant for audit continuity.

- docs/ui/visual/UI_VISUAL_BROKEN_ROUTES_DESKTOP_GAPS_v80_STARTUP_AUDIT.md
  - Classification: COMMIT_AS_HISTORICAL_PROOF
  - Reason: startup context of v80 closure, complements v81 audit chain.

- docs/ui/visual/UI_VISUAL_BROKEN_ROUTE_REPRO_v80.md
  - Classification: COMMIT_AS_HISTORICAL_PROOF
  - Reason: root-cause repro record for v80 broken-route campaign.

## Policy Notes
- No broad ignore added under artifacts/.
- No untracked item remains unclassified.
