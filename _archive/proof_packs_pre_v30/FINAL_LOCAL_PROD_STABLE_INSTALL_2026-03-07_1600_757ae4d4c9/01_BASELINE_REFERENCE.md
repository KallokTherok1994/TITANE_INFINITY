# 01_BASELINE_REFERENCE

A) EXEC_MODE
- `LOCAL`

B) SCOPE_RING
- Référence de baseline canonique prod pour installation locale.

C) RISK
- `P0`

D) PLAN (<=7 étapes)
1. Vérifier le pack canon source.
2. Vérifier le verdict canon actif.
3. Vérifier commit de référence.
4. Vérifier version cible.

E) PROOFS
- Pack canon: `proof_packs/PROD_PASS_CANONIZATION_2026-03-07_1519_757ae4d4c9`
- Verdict canon: `proof_packs/PROD_PASS_CANONIZATION_2026-03-07_1519_757ae4d4c9/VERDICT.md`
- Checks bootstrap: `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/01_baseline_checks.txt`

F) ROLLBACK
- N/A (référence).

Baseline confirmée:
- `VERDICT_UNIQUE = PROD_CANON_BASELINE_ESTABLISHED`
- `BASELINE_REFERENCE = 757ae4d4c9`
- `TARGET_VERSION = 27.2.0`
