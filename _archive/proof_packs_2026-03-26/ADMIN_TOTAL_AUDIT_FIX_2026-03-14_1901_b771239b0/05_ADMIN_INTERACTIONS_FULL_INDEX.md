# 05_ADMIN_INTERACTIONS_FULL_INDEX

Date: 2026-03-14
Pack: `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0`

## Evidence Sources

- Frontend callsites: `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/03_frontend_callsites.txt`
- Backend registrations (post-fix): `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/04_main_registrations_postfix.txt`
- Secret command implementations: `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/05_secure_secret_commands.txt`
- Governance contract (pre-fix): `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/09_governance_service_response_contract.txt`, `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/10_governance_backend_signatures.txt`
- Governance contract (post-fix): `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/14_governance_backend_signatures_postfix.txt`, `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/15_governance_service_contract_postfix.txt`

## Interaction Index

| Domain                        | Frontend caller                                                    | Command(s)                                                                                                                                                                                                                                   | Backend registration                                                                                                                                                | Status |
| ----------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| System Logs                   | `src/features/system-center/hooks/useSystemLogs.ts:51`             | `sc_get_logs`, `sc_get_log_stats`, `sc_clear_logs`, `sc_add_log`                                                                                                                                                                             | `src-tauri/src/main.rs:1596`, `src-tauri/src/main.rs:1597` (+ clear/add)                                                                                            | `PASS` |
| Cluster                       | `src/features/system-center/hooks/useNodeCluster.ts:45`            | `sc_get_cluster_status`, `sc_get_cluster_peers`, `sc_initialize_cluster`, `sc_shutdown_cluster`                                                                                                                                              | `src-tauri/src/main.rs:1601`-`1604`                                                                                                                                 | `PASS` |
| HyperVision                   | `src/features/system-center/hooks/useHyperVision.ts:56`            | `sc_hypervision_get_state`, `sc_hypervision_get_metrics`, `sc_hypervision_get_layers`, `sc_hypervision_get_anomalies`, `sc_hypervision_start`, `sc_hypervision_stop`                                                                         | `src-tauri/src/main.rs:1606`-`1613`                                                                                                                                 | `PASS` |
| Introspection                 | `src/features/system-center/hooks/useIntrospection.ts:47`          | `sc_introspection_quick_scan`, `sc_introspection_full_scan`, `sc_introspection_auto_fix`                                                                                                                                                     | `src-tauri/src/main.rs:1615`-`1617`                                                                                                                                 | `PASS` |
| Design Tokens                 | `src/features/design-center/providers/UIThemeProvider.tsx:159`     | `load_ui_theme`, `save_ui_theme`, `reset_ui_theme`, `update_ui_token`                                                                                                                                                                        | `src-tauri/src/main.rs:1676`-`1679`                                                                                                                                 | `PASS` |
| Secrets API                   | `src/features/governance-center/services/governanceService.ts:253` | `secure_store_secret`, `has_secret`, `delete_secret`                                                                                                                                                                                         | `src-tauri/src/main.rs:1504`-`1506`; impl at `src-tauri/src/secure_commands.rs:499`, `src-tauri/src/secure_commands.rs:576`, `src-tauri/src/secure_commands.rs:602` | `PASS` |
| Governance Policies/Perms/Log | `src/features/governance-center/services/governanceService.ts:298` | `get_ia_policies`, `save_ia_policies`, `toggle_ia_policy`, `create_ia_policy`, `delete_ia_policy`, `get_permission_matrix`, `clear_permission_audit`, `get_security_log`, `append_security_log`, `export_security_log`, `clear_security_log` | Registered in `src-tauri/src/main.rs:1569`-`1579`; signatures now return `SecureResponse<...>` in `src-tauri/src/commands/governance_commands.rs:81`-`292`          | `PASS` |

## Governance Interaction Resolution Detail

- Frontend normalization now accepts both envelope variants and legacy payloads (`src/features/governance-center/services/governanceService.ts:77`-`123`).
- Governance backend commands now return `SecureResponse<...>` envelopes for policies, permissions, and security logs (`src-tauri/src/commands/governance_commands.rs:81`-`292`).
- Result: governance interactions keep a stable `ok/data/error` response path in Admin flows.

Status: `PASS`

## Interaction Verdict

- System/Design/Secrets command wiring: `PASS`
- Governance interaction contract (frontend normalization and backend payload shape): `PASS`
