# FIXLOOP LOG

- iteration: 1
- action: patch minimal instrumentation+resume dans `tools/go_p_campaign_autoheal.sh`
- notes:
  - ajout trap SIGINT/SIGTERM -> `runs/_loop/interrupt.log` (append-only)
  - ajout checkpoint atomique -> `runs/_loop/checkpoint.json`
  - ajout options `--resume` (default), `--from`, `--max-windows`, `--dry-run`
  - ajout reprise sûre des artefacts `runs/_loop` non scellés
  - ajout compteurs de fenêtres traitées (`windows_done_total`)
- status: PATCH_APPLIED
- iteration: 2
- action: dry-run instrumentation x3
  - run_1: START 2026-02-27T18:19:59Z
  - run_1: EXIT=0
  - run_2: START 2026-02-27T18:19:59Z
  - run_2: EXIT=0
  - run_3: START 2026-02-27T18:19:59Z
  - run_3: EXIT=0
