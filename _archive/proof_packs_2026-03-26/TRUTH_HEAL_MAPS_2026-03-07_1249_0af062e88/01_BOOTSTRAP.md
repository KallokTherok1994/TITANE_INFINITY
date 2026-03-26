Status: PASS

Proof artifacts:
- `raw/git_status.txt`
- `raw/git_status_sb.txt`
- `raw/git_rev_parse_short.txt`
- `raw/git_log_20_oneline.txt`
- `raw/find_maxdepth3_dirs.txt`
- `raw/find_governance_like_files.txt`
- `raw/surface_*.txt`

Notes:
- `raw/bootstrap_env.txt` contains terminal control-prefix noise.
- Clean companion: `raw/bootstrap_env_clean.txt`.

Bootstrap commands executed:
- `git status --short`
- `git status -sb`
- `git rev-parse --short HEAD`
- `git log -20 --oneline`
- `find . -maxdepth 3 -type d | sort`
- `find . -maxdepth 4 (governance extensions) | sort`

Real state:
- Repo is not clean.
- Governance proofs are still possible for scoped truth recalculation.

Target state:
- Scoped governance coherence proven with explicit residual-risk classification.
