# 09_GATES_REPORT

| Gate | Status | Proof |
|---|---|---|
| G_BOOT_TRUTH | PASS | `raw/bootstrap.txt` |
| G_ACTIVE_TARGET_TRUTH | PASS | `raw/active_target_truth.txt`, `raw/ollama_ps.txt` |
| G_PRIOR_LOCK_AUDIT_COMPLETE | PASS | `03_PRIOR_LOCK_AUDIT.md` |
| G_REQUESTED_USED_SHOWN_TRUTH | PASS | `05_REQUESTED_USED_SHOWN_TRUTH.md`, `src/services/ai/providers/ollama.ts`, `src/ui/pages/Chat.tsx` |
| G_METRICS_CHAIN_TRUTH | PASS | `06_METRICS_CONTEXT_PRELOAD_FALLBACK_TRUTH.md`, `raw/x3_generate_run{1,2,3}_summary.txt` |
| G_CONTEXT_POLICY_TRUTH | PASS | `src-tauri/src/ollama.rs`, `raw/ollama_ps.txt` |
| G_PRELOAD_KEEPALIVE_TRUTH | PASS | `src-tauri/src/ollama.rs`, `src-tauri/src/commands/ollama_command.rs`, `raw/ollama_ps.txt` |
| G_FALLBACK_HONEST | PASS | `raw/fallback_probe_missing_model.txt`, `src/services/ai/providers/ollama.ts` |
| G_X3_RERUNS | PASS | `07_X3_RERUNS.md`, `raw/x3_generate_bounded_runs.txt`, `raw/x3_generate_run{1,2,3}_summary.txt` |
| G_NO_REGRESSION_ON_CORE_BATCH | PASS | Core locks maintenus + x3 stable + fallback honesty explicite |
| G_PROOF_PACK_COMPLETE | PASS | Presence des fichiers `00` a `12` |
| G_ROLLBACK_READY | PASS | `11_ROLLBACK.md` |

## Gate verdict unique
- Aucune gate critique en echec/bloquee pour le scope champion-core local.
- Verdict session: `BATCH_SEALABLE`
