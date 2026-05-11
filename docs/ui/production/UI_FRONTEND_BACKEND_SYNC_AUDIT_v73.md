# UI_FRONTEND_BACKEND_SYNC_AUDIT_v73

## Priority Pages Audit Matrix

| Priority | Route | Visible Actions Audit | Status |
|---|---|---|---|
| P1 | /titane | send_message, provider switch, image analyze, tab switch | IPC_RESPONSE_PROVEN / WIRED_LIVE / ACTIVE_PARTIAL |
| P1 | /time | agenda read/write/delete, snapshots list/restore | IPC_RESPONSE_PROVEN / ACTIVE_PARTIAL |
| P1 | /experience | read progression | DISPLAY_ONLY_CONFIRMED |
| P1 | /memory | memory status/read/search | IPC_RESPONSE_PROVEN / ACTIVE_PARTIAL |
| P1 | /doc-center | documentation rendering | DISPLAY_ONLY_CONFIRMED |
| P2 | /admin | system/config/audio/governance panels | WIRED_LIVE + GUARDED_WITH_UI_PROOF |
| P2 | /dev | diagnostics/ops/validation/security | ACTIVE_PARTIAL + GUARDED_WITH_UI_PROOF |
| P2 | /fusion | fusion dashboards | GUARDED_WITH_UI_PROOF |
| P3 | /cloud | sync/vault status | IPC_RESPONSE_PROVEN |
| P3 | /research | research status/read lane | IPC_RESPONSE_PROVEN |
| P3 | /twins | identity/twin surfaces | GUARDED_WITH_UI_PROOF |
| P4 | /optimization | optimization panels | DISPLAY_ONLY_CONFIRMED / GUARDED_WITH_UI_PROOF |
| P4 | /total-dev | governed dev cockpit actions | GUARDED_WITH_UI_PROOF |

## Status Integrity
- Forbidden statuses not used: UNKNOWN, IMPLIED_LIVE, UI_VISIBLE_ONLY_AS_BACKEND_PROOF
- Missing commands: 0 newly introduced in this mission
- Capability blockers: 0 newly introduced in this mission

## Sync Verdict
- FRONTEND_BACKEND_SYNC: PASS_WITH_CLASSIFIED_PARTIAL_SURFACES
