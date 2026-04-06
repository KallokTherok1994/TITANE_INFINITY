# Commandes executees

## Bootstrap obligatoire
- `git status --short --branch`
- `git rev-parse --short HEAD`
- `git log -5 --oneline`
- `find .github -maxdepth 5 -type f | sort`
- `find . -name AGENTS.md -type f | sort || true`
- `find scripts -maxdepth 5 -type f | sort || true`
- `find docs -maxdepth 4 -type f | sort || true`
- `rg -n "copilot-instructions|instructions\\.md|AGENTS\\.md|\\.agent\\.md|\\.prompt\\.md|autoheal|verify_instructions|detect_recurrence|map_refresh|MAP_|Local-first|online-first|BLOCKED_DOCTRINE|SEALED|One Door|4-Ring|Tauri-only" -S .`
- `rg -n "GO_FOR_PROD_BUILD__TITANE_INFINITY|GO_FOR_PROD_DEPLOY__TITANE_INFINITY" -S .`

## Checks executes
- `bash scripts/verify_instructions.sh`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/map_refresh.sh`
- `tail -n 80 reports/MAP_PROOFS.log`
- `bash scripts/verify/verify-copilot-instructions.sh`

## Continuation implementation + validation
- `bash scripts/verify/verify_no_doctrine_duplication.sh`
- `bash scripts/verify/verify_status_vocabulary.sh`
- `bash scripts/verify/verify_agents_index.sh`
- `bash scripts/verify/verify_prompt_files_index.sh`
- `bash scripts/verify/verify_local_markers_consistency.sh`
- `bash scripts/verify/verify_kernel_budget.sh`
- `node scripts/qa/check_autofix_autoheal_registry.mjs`
- `bash scripts/verify/verify_instruction_layers.sh`
- `bash scripts/map_refresh.sh`
- `tail -n 25 reports/MAP_PROOFS.log`
