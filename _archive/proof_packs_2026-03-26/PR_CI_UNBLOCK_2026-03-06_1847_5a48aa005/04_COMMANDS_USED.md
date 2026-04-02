# 04 Commands Used

- `git status --short --branch`
- `git status --porcelain`
- `git rev-parse --short HEAD`
- `git branch --show-current`
- `git log -20 --oneline`
- `gh auth status`
- `gh repo view KallokTherok1994/TITANE_INFINITY`
- `gh pr status`
- `gh run list --limit 20`
- `gh pr create --base MAIN --head copilot/pr-ci-unblock-20260306-1847 --title ... --body ...`
- `gh pr view 174 --json ...`
- `gh pr checks 174`
- `gh run list --branch copilot/pr-ci-unblock-20260306-1847 --workflow "Rust Tests (Docker)" --json ...`
- `gh workflow run rust-docker.yml --ref copilot/pr-ci-unblock-20260306-1847`
- `gh run view <run_id> --json ...`
- `gh run view <run_id> --log`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
