# 01_TRUTH_CHECK_PREVIOUS.md

Statut: BLOCKED

Prérequis « evidence packs précédents »:
- Présent: `docs/_evidence/program_p6_13_20260226_144448`
- Présent: `docs/_evidence/program_p14_20_20260226_151353`
- Présent: `docs/_evidence/program_p21_27_20260226_155906`

Prérequis « Tool Contract + Capabilities Zero-Trust explicites »:
- Résultat de preuve stricte (regex demandées): `UNKNOWN/NOT PROVABLE` dans ce run.
- Commande exécutée:
  - `rg -n "TOOL_CONTRACT|Tool Contract|Capabilities Zero-Trust|capabilities.*deny|allowlist.*deny|explicit enable|provider compliance|transient storage|TTL|purge" -S docs/_evidence src src-tauri`
- Sortie: aucune correspondance sur ces marqueurs explicites.

Conclusion:
- Stop-the-line déclenché conformément au runbook.
- Verdict précheck: `BLOCKED`.

Preuve:
- `docs/_evidence/program_autoheal_ah_20260226_215033/06_PROOF_LOGS_MASTER.txt`
