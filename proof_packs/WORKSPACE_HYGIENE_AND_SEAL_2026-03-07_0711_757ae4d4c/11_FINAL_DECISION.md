# 11_FINAL_DECISION

VERDICT_UNIQUE: BLOCKED_DOCTRINE

WHY:
1. Baseline integrity and CI are fully PASS (`22/22 success`, no non-success).
2. Workspace dirtiness is proof-pack-only, but policy for proof-pack tracking is not canonical.
3. Available hygiene actions are either doctrinally risky (delete/move), policy-changing (ignore), or non-authoritative (force-commit mixed-mode artifacts).

TOP PROOFS:
1. `raw/final_light_rechecks.txt` -> HEAD `757ae4d4c`, branch `MAIN`, dirty proof-pack-only status.
2. `raw/metric_head_total_runs.txt` + `raw/metric_head_success_runs.txt` + `raw/metric_head_non_success_or_pending.txt` -> `22/22/0`.
3. `raw/proof_pack_tracking_mode_sample.txt` + `raw/lib_cert.sh` + `raw/docs_registry_instructions.md` -> mixed and unresolved tracking doctrine.

MANDATORY NEXT ACTION (<= 30 min):
1. Governance authority publishes a single canonical rule for proof-pack tracking mode (`TRACK_ALL` or `KEEP_UNTRACKED`).
2. Re-run this hygiene gate with that declared rule and apply exactly one minimal action path.
