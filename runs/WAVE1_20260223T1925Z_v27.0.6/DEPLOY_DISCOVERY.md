# PHASE 1 — DEPLOY MECHANISM ANALYSIS

## Discovered Deployment Scripts
- scripts/deployment/certified-deploy.sh (production-ready)
- scripts/deployment/tauri-full-deploy.sh (full pipeline)

## deployment/latest/ Structure
- Contains MANIFEST.json (current: v27.0.5)
- Contains AppImage, DEB, RPM artifacts (multiple versions)
- Contains SHA256SUMS verification files

## Deployment Mechanism Type

**MECHANISM: MANUAL_EXTERNAL**

### Evidence:
1. No automated updater found in tauri.conf.json
2. No cohort/wave configuration in deployment scripts
3. Deployment is artifact-based (AppImage, DEB, RPM)
4. MANIFEST.json tracks latest version but no auto-update endpoint
5. Certification docs mention 'manual upload to channels'

### Current State:
- deployment/latest/MANIFEST.json points to v27.0.5
- v27.0.6 artifacts NOT YET BUILT (docs-only release)

### Deployment Strategy for v27.0.6 (docs-only):

Since v27.0.6 is DOCS-ONLY with ZERO runtime changes:

**Option A: NO BINARY DEPLOYMENT NEEDED**
- v27.0.6 contains only API documentation JSDoc updates
- Runtime code identical to v27.0.5-prod
- Users continue using v27.0.5-prod binary (SAFE, IMMUTABLE)
- Tag v27.0.6 serves as documentation milestone

**Option B: Republish v27.0.5-prod as v27.0.6 (symbolic)**
- Copy v27.0.5 artifacts → rename to v27.0.6
- Update MANIFEST.json → version=27.0.6
- SHA256 identical (proves zero runtime change)

**Option C: Full rebuild v27.0.6 from source (unnecessary but provable)**
- Execute: pnpm run build:tauri -- --target all
- Generates new AppImage/DEB/RPM
- Deploy to deployment/latest/
- Update MANIFEST.json

## Recommended Path: Option A (NO DEPLOYMENT)

Rationale:
- P2 Policy allows docs-only without binary release
- v27.0.5-prod is IMMUTABLE and SAFE
- v27.0.6 tag provides git-level documentation tracking
- Zero user impact (no download, no install, no risk)
- 5% Wave 1 cohort concept not applicable (no runtime change)

## VERDICT P1: READY_FOR_DECISION

Wave 1 deployment redefined:
- **No binary distribution** (docs-only release)
- **Monitoring equivalent:** Track v27.0.5-prod stability (already LIVE)
- **Success gate:** v27.0.5-prod remains stable (baseline already proven)
- **Wave promotion:** N/A (no deployment to promote)

Alternative: Execute Option B (symbolic rename) to satisfy MANIFEST consistency.

