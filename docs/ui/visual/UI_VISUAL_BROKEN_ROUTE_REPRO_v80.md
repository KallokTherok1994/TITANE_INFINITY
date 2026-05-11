# UI Visual Broken Route Reproduction — v80

Date: 2026-05-11
Baseline artifact: artifacts/ui-visual/v79-production-visual-capture.jsonl

## Baseline reproduction from v79 artifact

v79 broken entries:
- /dev
  - visualStatus: VISUAL_BROKEN
  - rootFound: false
  - blocker: root selector missing: expected [data-testid="page-dev"] not found
- /memory
  - visualStatus: VISUAL_BROKEN
  - errorBoundary: true
  - blocker: ErrorBoundary visible in DOM

v79 counters:
- routes: 29
- visualActive: 27
- visualBroken: 2
- activeFalsePositives: 0

## Repro execution status

Pending in this file:
- jq extraction for /dev and /memory
- v80 debug capture run focused on /dev and /memory investigation
- post-patch before/after evidence

This document will be appended with exact command outputs and route deltas during v80 repair.
