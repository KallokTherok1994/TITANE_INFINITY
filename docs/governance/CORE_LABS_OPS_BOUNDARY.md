# CORE / LABS / OPS BOUNDARY

## 1. Purpose and scope
Define the canonical boundaries between Core, Labs, Ops, Governance, Proof, and Historical surfaces for TITANE. This is a governance convergence artifact, not a release seal or runtime certification.

## 2. What TITANE Core includes
- Product runtime code: `src/`, `src-tauri/src/`.
- Entry surfaces: `src/main.tsx`, `src/App.tsx` (shell boundary).
- Canonical runtime configuration: `src-tauri/tauri.conf.json` and IPC command registry.

## 3. What belongs to Labs
- Experimental, exploratory, or analysis surfaces that are not required for runtime:
  - `evals/`, `documentation/`, `docs/ui-carto-copilot/`.
- Prototype reports and internal research artifacts not required for product execution.

## 4. What belongs to Ops / Governance / Proof
- Ops: `scripts/`, `.github/`, `docs/ops/`, release execution notes.
- Governance: `docs/governance/`, `.clinerules/`, policy docs.
- Proof: `proof_packs/`, audit evidence, verification artifacts.

## 5. Historical and legacy surfaces
- `_archive/`, `docs/99_ARCHIVE/`, `docs/01_misc/`.
- Deprecated code kept for reference: `src/_deprecated/`.
- Prior release artifacts stored for traceability: `_archive/releases/`.

## 6. Current conflict register summary
- Core surfaces still contain ops/labs signals (e.g., dev dashboards inside App shell): CONFLICT_MAJOR.
- Deprecated router under `src/_deprecated/` lives in the core tree: CONFLICT_MINOR.
- Ops/release documents in `docs/` can read as current product truth if not clearly labeled: DOC_ONLY.

## 7. Reclassification rules
- New experiments must land in Labs or Governance, not in Core.
- Ops tooling and CI surfaces must not live in runtime paths.
- Proof packs are evidence only and cannot claim product truth on their own.
- Historical items remain accessible but must not be treated as active Core.

## 8. Minimal movement rules
- No large file moves without proof of non-runtime usage.
- No product behavior changes in this lane.
- Only bounded doc-level reclassification is allowed here.

## 9. Reopen rule
- Any runtime/product correction requires a fresh proven trigger.

## 10. Rollback rule
- Revert this doc with: `git restore -- docs/governance/CORE_LABS_OPS_BOUNDARY.md`
- Supersession allowed only by a new bounded convergence cycle or a proven trigger that changes actual boundaries.
