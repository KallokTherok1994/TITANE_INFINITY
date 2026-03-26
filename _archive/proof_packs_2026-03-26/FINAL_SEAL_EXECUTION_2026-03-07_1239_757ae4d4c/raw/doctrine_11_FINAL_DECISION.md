# 11_FINAL_DECISION

VERDICT_UNIQUE: `DOCTRINE_RESOLVED_KEEP_UNTRACKED`

DECISION_RULE: `KEEP_UNTRACKED`

JUSTIFICATION:
1. Les sources de plus haute autorite imposent la production et conservation append-only des preuves en `proof_packs`, mais n'imposent pas TRACK_ALL.
2. Le script de certification le plus explicite sur l'hygiene (`lib_cert.sh`) considere les proof packs untracked comme attendus.
3. La pratique historique mixte existe, mais elle est de niveau inferieur et ne peut pas battre les regles canoniques explicites.
4. `KEEP_UNTRACKED` est la decision minimale, sobre, immediate, et exploitable pour relancer le gate d'hygiene sans re-debat.

TOP 3 PROOFS:
1. `raw/source_scan_focused_rg.txt` (kernel + docs-registry + lib_cert signals).
2. `raw/proof_pack_tracking_counts.txt` (`tracked=41`, `untracked_status=6`) montrant la pratique mixte et l'absence de canon TRACK_ALL.
3. `raw/metric_ci_head_total.txt`, `raw/metric_ci_head_success.txt`, `raw/metric_ci_head_nonsuccess.txt` + `raw/git_diff_counts.txt` + recheck exits: baseline technique intacte.

TOP 3 RISQUES:
1. Bruit `git status` persistant si beaucoup de packs untracked.
2. Variabilite d'usage historique tracked/untracked dans l'equipe.
3. Risque de conservation locale inegale sans routine d'archivage explicite.

SOURCES GAGNANTES:
1. `.github/copilot-instructions.md`
2. `.github/instructions/docs-registry.instructions.md`
3. `scripts/certification/lib_cert.sh`

SOURCES ECARTEES:
1. Historique tracked (niveau pratique, non normatif).
2. Historique untracked (niveau pratique, non normatif).
3. `scripts/certification/run-p10-desktop-cert.sh` commit scope (`deployment/latest/certification/phase10/`) non generalisable a tout `proof_packs/`.

NEXT ACTION <= 30 min:
1. Relancer le gate hygiene avec `CANON_RULE=KEEP_UNTRACKED` et checks legers uniquement.
2. Appliquer la classification `DIRTY_PROOF_ONLY_NON_BLOCKING` si `tracked drift=0` et gates PASS.
3. Produire verdict hygiene final sans suppression/move des proof packs.
