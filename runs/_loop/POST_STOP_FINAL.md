# POST STOP FINAL

- verdict: PASS
- cause racine prouvée: signal externe SIGINT/SIGTERM pendant run continu (pas de timeout/kill/trap interne avant instrumentation)
- patch appliqué:
  - `tools/go_p_campaign_autoheal.sh`
  - `runs/_loop/TRIAGE_SIGNAL_130.md`
  - `runs/_loop/FIXLOOP_LOG.md`
- preuves x3:
  - `runs/_loop/dry_run_1.log`
  - `runs/_loop/dry_run_2.log`
  - `runs/_loop/dry_run_3.log`
- reprise validée:
  - `bash tools/go_p_campaign_autoheal.sh --resume --from p2184_2190 --max-windows 1`
  - résultat: `CAMPAIGN_DONE verdict=DONE stop_reason=DONE_MAX_WINDOWS`
- proof pack: runs/_loop/proofs/post_stop_130_20260227_1822_c955b541c
- next action unique:
  - `bash tools/go_p_campaign_autoheal.sh --resume --from p2184_2190`
