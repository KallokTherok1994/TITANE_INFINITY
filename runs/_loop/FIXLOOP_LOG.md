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
