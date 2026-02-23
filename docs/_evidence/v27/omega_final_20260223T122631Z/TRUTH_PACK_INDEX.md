# TRUTH PACK INDEX — OMEGA_FINAL

- Pack path: `docs/_evidence/v27/omega_final_20260223T122631Z`
- Head SHA (local): `28fc887dba9caf09ddbd045d3931b41d61aeece3`
- Origin MAIN SHA: voir `G_origin_main_sha.txt`

## A — Preflight
- `A_status.txt`
- `A_head.txt`
- `A_log.txt`
- `A_remote.txt`
- `A_diffstat.txt`

## B — Surface audit
- `B_network_scan.txt`
- `B_api_scan.txt`
- `B_tauri_invoke_scan.txt`
- `B_allowlist_scan.txt`

## C — Validations
- `C_build_1.txt`, `C_build_2.txt`, `C_build_3.txt` (BLOCKED_BY_POLICY)
- `C_test_1.txt`, `C_test_2.txt`, `C_test_3.txt` (PASS après correctif)
- `C_mermaid_verify_1.txt`, `C_mermaid_verify_2.txt`, `C_mermaid_verify_3.txt` (PASS)
- `C_op_mermaid_1.txt`, `C_op_mermaid_2.txt`, `C_op_mermaid_3.txt` (PASS)
- `C_cargo_version.txt`
- `C_cargo_test.txt` (PASS)
- `C_cargo_clippy.txt` (pas d’erreur)
- `C_cargo_release.txt` (BLOCKED_BY_POLICY)

## D — Artifacts + backup
- `D_dist_ls.txt`
- `D_tauri_release_ls.txt`
- `D_dist_sha256.txt`
- `D_tauri_release_sha256.txt`
- `D_backup_tar.txt`
- `D_backup_sha256.txt`
- Backup: `TITANE_OMEGA_BACKUP_20260223T122631Z.tar.gz`
- Backup SHA256: `4c5d1203e99ece204033c09f7c7caca548f7d434b11123088bc5d35ddfb683d0`

## E — Verdict + rollback
- `E_VERDICT_OMEGA_FINAL.md`
- `ROLLBACK_OMEGA_FINAL.md`
- `INDEX.md` (historique)
- `TRUTH_PACK_INDEX.md` (ce fichier)

## G — Post-sanity
- `G_fetch.txt`
- `G_origin_main_sha.txt`
- `G_status_after.txt`

## Decision
- Tests corrigés: oui
- PASS x3 validations tests+mermaid: oui
- PROD build/deploy exécuté: non
- Raison du blocage final: gouvernance PROD (tokens requis manquants + étapes build PROD interdites dans ce contexte)
