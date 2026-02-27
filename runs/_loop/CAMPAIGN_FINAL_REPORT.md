# CAMPAIGN FINAL REPORT

- verdict: STOP-THE-LINE
- batches_executed: 13
- stop_reason: INTERRUPTED_BY_SIGNAL_130
- last_processed_window: p2184_2190
- last_publish_commit: bb9ae9f87
- last_proof_pack: docs/_evidence/program_p2184_2190_20260227_175056
- autoheal_attempts: 0
- autoheal_outcome: none
- head_final: be4f8df54
- tree_clean: yes
- campaign_start_commit: a54bb9b9c
- note: la campagne a été interrompue pendant l'exécution continue (signal 130), après sealing du batch 2121_2127-2184_2190.

## Triage Command
- `cd /home/titane-os/Documents/GitHub/TITANE_INFINITY && git --no-pager log --oneline a54bb9b9c..HEAD && sed -n '1,200p' runs/_loop/LOOP_SUMMARY.md && sed -n '1,200p' runs/_loop/state.json`

## Next Action
- Relancer la campagne: `bash tools/go_p_campaign_autoheal.sh`
