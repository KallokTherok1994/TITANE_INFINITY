# 02_BASELINE_AND_CI_TRUTH

Baseline integrity:
- `HEAD` remains `757ae4d4c`.
- Branch remains `MAIN`.
- No tracked file drift detected:
  - `raw/git_diff_name_only.txt` is empty.
  - `raw/git_diff_cached_name_only.txt` is empty.

CI truth for baseline HEAD:
- Total runs: `22` (`raw/metric_head_total_runs.txt`)
- Success runs: `22` (`raw/metric_head_success_runs.txt`)
- Non-success/pending: `0` (`raw/metric_head_non_success_or_pending.txt`)
- Workflow table: `raw/gh_runs_for_head_table.txt`
- Source JSON: `raw/gh_runs_for_head.json`

Conclusion:
- Baseline code and CI remain stable. The only blocker dimension is workspace governance/hygiene doctrine.
