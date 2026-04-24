# 04_ADMIN_SURFACE_MAP

Date: 2026-03-14
Pack: `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0`

## Evidence Sources

- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/01_admin_selectors.txt`
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/02_submodule_surface_markers.txt`
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/11_admin_route_map.txt`
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/12_submodule_testids_inventory.txt`
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/13_testid_counts_by_module.txt`

## Route Ownership

- Canonical Admin route is declared at `src/App.tsx:1077` (`/admin`).
- Legacy module routes are redirected to `/admin` (examples: `src/App.tsx:1085`, `src/App.tsx:1091`, `src/App.tsx:1092`, `src/App.tsx:1095`, `src/App.tsx:1098`).

Status: `PASS`

## Admin Shell Surface

- Root container: `data-testid="page-admin"` at `src/features/admin/AdminPage.tsx:162`.
- Content container: `data-testid="page-admin-content"` at `src/features/admin/AdminPage.tsx:208`.
- Tab selectors are generated as `data-testid="tab-admin-${tab.id}"` at `src/features/admin/AdminPage.tsx:188`.
- Lazy surface ownership in `src/features/admin/AdminPage.tsx`:
  - `system` -> `SystemCenterPage` (`src/features/admin/AdminPage.tsx:44`, `src/features/admin/AdminPage.tsx:94`)
  - `config` -> `ConfigurationHub` (`src/features/admin/AdminPage.tsx:48`, `src/features/admin/AdminPage.tsx:102`)
  - `audio` -> `AudioCenterPage` (`src/features/admin/AdminPage.tsx:52`, `src/features/admin/AdminPage.tsx:110`)
  - `design` -> `DesignCenterPage` (`src/features/admin/AdminPage.tsx:56`, `src/features/admin/AdminPage.tsx:118`)
  - `governance` -> `GovernanceCenterPage` (`src/features/admin/AdminPage.tsx:60`, `src/features/admin/AdminPage.tsx:126`)
  - `production-health` -> `ProductionHealthPanel` (`src/features/admin/AdminPage.tsx:64`, `src/features/admin/AdminPage.tsx:134`)

Status: `PASS`

## Submodule Surface Marker Coverage

- `configuration-hub`: `12` testids (`src/pages/ConfigurationHub.tsx`, proof file `13_testid_counts_by_module.txt`).
- `audio-center`: `7` testids (`src/features/audio-center/AudioCenterPage.tsx`, proof file `13_testid_counts_by_module.txt`).
- `system-center`: `0` testids (`src/features/system-center`, proof file `13_testid_counts_by_module.txt`).
- `design-center`: `0` testids (`src/features/design-center`, proof file `13_testid_counts_by_module.txt`).
- `governance-center`: `0` testids (`src/features/governance-center`, proof file `13_testid_counts_by_module.txt`).

Status: `BLOCKED`

Next action (<=30 min):

- Add one stable root `data-testid` per missing submodule page (`system`, `design`, `governance`) to unblock deterministic desktop E2E anchoring.

## Surface Verdict

- Admin route and shell ownership: `PASS`
- Submodule selector completeness for deterministic E2E: `BLOCKED`
