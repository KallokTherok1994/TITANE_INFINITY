# UI Visual Broken Routes + Desktop Gaps v80 — Startup Audit

Date: 2026-05-11
Mode: DURABLE
Mission: TITANE UI_VISUAL_BROKEN_ROUTES_DESKTOP_GAPS_AND_CI_SEAL_v80

## Git startup truth

- HEAD: 67e15f5600b8c020cf4738bc44a123f9bc175e25
- Branch: MAIN
- Upstream: origin/MAIN
- Ahead/Behind: 0/0
- Remote MAIN: 67e15f5600b8c020cf4738bc44a123f9bc175e25

## Worktree state

- Dirty tracked files: none
- Untracked files:
  - artifacts/ui-visual/v78-desktop-installed-visual-capture.jsonl
  - docs/ui/visual/UI_FULL_VISUAL_PRODUCTION_DESKTOP_AUDIT_CERTIFICATION_v78.md

## v79 baseline file checks

- OK artifacts/ui-visual/v79-production-visual-capture.jsonl
- OK docs/ui/visual/UI_VISUAL_PROOF_STRICTNESS_CERTIFICATION_v79.md
- OK docs/ui/visual/PROOF_PACK_VISUAL_UI_FINAL_INDEX_v79.md
- OK docs/ui/visual/PROOF_PACK_VISUAL_UI_FINAL_MANIFEST_v79.json
- OK e2e/production/ui-production-full-visual-capture.spec.ts
- OK scripts/verify/verify-ui-visual-capture.mjs
- OK e2e/desktop/ui-desktop-agent-overlay-contract.wdio.test.js
- OK e2e/desktop/ui-desktop-installed-full-visual-capture.wdio.test.js
- OK e2e/desktop/ui-desktop-action-sync-matrix.wdio.test.js

## v79 artifact truth

- Artifact: artifacts/ui-visual/v79-production-visual-capture.jsonl
- Line count: 29
- visualActive: 27
- visualBroken: 2
- activeFalsePositives: 0

Broken routes:
- /dev
  - blocker: root selector missing: expected [data-testid="page-dev"] not found
  - errorBoundary: false
  - rootFound: false
- /memory
  - blocker: ErrorBoundary visible in DOM
  - errorBoundary: true
  - rootFound: true

## Current remote CI state (for v79 HEAD)

- Commit: 67e15f5600b8c020cf4738bc44a123f9bc175e25
- Completed success:
  - Deploy TITANE to GitHub Pages
  - Deploy TITANE to Cloudflare Pages
  - CodeQL Security Analysis
  - TITANE Static Gates v67
  - ci-guardrails
- In progress:
  - TITANE CI/CD Unified Pipeline v32.0.1
  - Android Build (Mock Debug)

Classification: REMOTE_CI_PENDING

## Startup blockers

- None blocking startup execution.
- Mission blockers to investigate next:
  - /dev root selector mismatch or hydration timing gap
  - /memory visible ErrorBoundary root cause
  - Desktop optional/conditional assertion semantics in WDIO
