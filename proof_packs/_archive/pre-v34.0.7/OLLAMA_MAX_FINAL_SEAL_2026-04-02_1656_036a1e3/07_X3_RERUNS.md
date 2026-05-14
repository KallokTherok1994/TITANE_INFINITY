# 07_X3_RERUNS

## Objectif
- 3 reruns bornes sur le chemin critique local Ollama.

## Execution tentee
1. Tentative desktop/dev smoke via `scripts/smoke/smoke-runtime-chat.sh`
   - traces: `raw/x3_run1.log`, `raw/x3_run1_bounded.log`
   - constat: processus enfants persistants (smoke/dev) en terminal integre, fermeture non deterministe.
2. Relance API generate x3 bornees (voie retenue pour certification)
   - traces run recap: `raw/x3_generate_bounded_runs.txt`
   - traces run payloads: `raw/x3_generate_run1.txt`, `raw/x3_generate_run2.txt`, `raw/x3_generate_run3.txt`
   - traces run summaries: `raw/x3_generate_run1_summary.txt`, `raw/x3_generate_run2_summary.txt`, `raw/x3_generate_run3_summary.txt`
   - resultat: 3/3 runs `EXIT=0`, `http_code=200`, `ok=true`, `model=gemma2:2b`, metriques completes, `done_reason=length`.

## Resultat x3
- run1: PASS
- run2: PASS
- run3: PASS

## Classification
- `G_X3_RERUNS = PASS`
- Stabilite locale Ollama sur reruns bornes: etablie pour le milestone champion-core local.
