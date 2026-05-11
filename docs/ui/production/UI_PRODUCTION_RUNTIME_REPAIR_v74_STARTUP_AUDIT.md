# UI_PRODUCTION_RUNTIME_REPAIR_v74_STARTUP_AUDIT

Date: 2026-05-11
Mode: DURABLE

## Startup Snapshot
- branch: MAIN
- HEAD: bed6440cca4383e642cda21719132324089df718
- remote HEAD (origin/MAIN): bed6440cca4383e642cda21719132324089df718
- ahead/behind: 0/0
- dirty worktree: yes
- dirty files:
  - artifacts/ui-production/v73-production-route-proof.jsonl

## v73 Artifact Status
- artifacts/ui-production/v73-production-route-proof.jsonl: FOUND
- scripts/verify/verify-ui-production-route-proof.mjs: FOUND
- e2e/production/ui-production-route-proof.spec.ts: FOUND
- docs/ui/production/PROOF_PACK_PRODUCTION_FINAL_INDEX_v73.md: FOUND
- docs/ui/production/PROOF_PACK_PRODUCTION_FINAL_MANIFEST_v73.json: FOUND
- docs/ui/production/UI_PRODUCTION_FRONTEND_BACKEND_SYNC_FINAL_CERTIFICATION_v73.md: FOUND
- src/registry/uiSurfaceRegistry.ts: FOUND
- .github/workflows/titane-static-gates.yml: FOUND

## v73 Artifact Line Count
- artifacts/ui-production/v73-production-route-proof.jsonl: 35 lines

## v73 Verifier Result Before Patch
- command: pnpm run verify:ui-production-route-proof
- exit: 1
- summary: FAIL missing truth badge/disclosure on priority routes: /titane, /time, /admin, /dev, /fusion, /twins, /optimization, /total-dev

## Latest Remote CI Status (HEAD bed6440)
- Codespaces Prebuilds: success
- CodeQL Security Analysis: success
- Android Build (Mock Debug): failure
- ci-guardrails: success
- Deploy TITANE∞ to Cloudflare Pages: success
- Deploy TITANE∞ to GitHub Pages: success
- TITANE∞ CI/CD Unified Pipeline v32.0.1: failure

## Startup Blockers
- Production route proof verifier failing on priority truth badges/disclosures.
- Android CI failing at buildSrc Kotlin duplicate/conflicting declarations.
- Unified CI pipeline failing on format:check.
- Worktree dirty due v73 artifact overwrite risk; v73 artifact must be preserved and v74 artifact path introduced.
