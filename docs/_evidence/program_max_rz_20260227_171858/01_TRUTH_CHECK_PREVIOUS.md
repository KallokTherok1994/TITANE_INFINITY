# 01_TRUTH_CHECK_PREVIOUS.md

Statut: PASS (prérequis historiques), puis BLOCKED (invariants d’entrée)
Ring impacté: Ring 3 + Ring 4 (audit)
Qualification: QUALIFIED

## Preuves de programmes antérieurs
- `docs/_evidence/program_p6_13_20260226_144448/`
- `docs/_evidence/program_p14_20_20260226_151353/`
- `docs/_evidence/program_p21_27_20260226_155906/09_FINAL_VERDICT.md` (PASS_QUALIFIED)
- `docs/_evidence/program_autoheal_ah_20260226_232605/09_FINAL_VERDICT.md` (PASS)
- `docs/_evidence/program_max_iq_20260227_151711/09_FINAL_VERDICT.md`

## Capacités/contrats/compliance
Indices trouvés dans preuves + code via scans précheck (tool contract, schema, structured, transient, TTL, purge).

## Verdict précheck préalable
- Prérequis historiques: PROUVÉS
- Invariants d’entrée runbook strict: NON PROUVÉS PROPRES
- Décision: `BLOCKED` (stop-the-line)

## UNKNOWN / manquants
- Aucun chemin requis manquant détecté.
- Ambiguïté restante: le scan brut mélange runtime/tests/docs, nécessitant une gate gouvernée de classification pour repasser en PASS.

