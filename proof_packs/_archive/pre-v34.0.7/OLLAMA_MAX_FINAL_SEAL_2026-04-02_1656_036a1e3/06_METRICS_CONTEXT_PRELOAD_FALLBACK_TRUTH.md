# 06_METRICS_CONTEXT_PRELOAD_FALLBACK_TRUTH

## Metrics chain
- Champs implementes et propages (Rust -> IPC -> Provider metadata):
  - `total_duration`
  - `load_duration`
  - `prompt_eval_count`
  - `prompt_eval_duration`
  - `eval_count`
  - `eval_duration`
  - `done_reason`
- Captures runtime x3 completes (session courante):
  - `raw/x3_generate_run1_summary.txt`
  - `raw/x3_generate_run2_summary.txt`
  - `raw/x3_generate_run3_summary.txt`
  - recap runs: `raw/x3_generate_bounded_runs.txt`

## Context policy truth
- `num_ctx=8192` dans `src-tauri/src/ollama.rs`.
- `context_window_used` expose via IPC/Provider.
- Runtime memory context observe: `raw/ollama_ps.txt` (`CONTEXT 8192`).

## Preload / keep_alive truth
- `keep_alive` renseigne dans requetes Rust (`5m`) + preload commande (`10m`).
- Runtime memory evidence: `raw/ollama_ps.txt` (`UNTIL ... minutes from now`).

## Fallback honesty truth
- Probe modele inexistant: `raw/fallback_probe_missing_model.txt` -> 404 explicite.
- Aucun masquage observe dans cette voie.

## Statut technique
- Metrics chain runtime x3 complete: `PASS`
- Context policy: `PASS`
- Preload/keep_alive: `PASS`
- Fallback honesty: `PASS`
