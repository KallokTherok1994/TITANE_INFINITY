# 10_COMMANDS_USED

## Bootstrap reality

- `git status`
- `git rev-parse --short HEAD`
- `git log -5 --oneline`
- `find .github -maxdepth 5 -type f | sort`
- `find . -name AGENTS.md -type f | sort || true`
- `find scripts -maxdepth 5 -type f | sort || true`
- `find docs -maxdepth 4 -type f | sort || true`
- `rg -n "copilot-instructions|instructions\.md|AGENTS\.md|\.agent\.md|\.prompt\.md|AutoHeal|verify_instructions|verify-copilot-instructions|detect_recurrence|map_refresh|Local-first|online-first|BLOCKED_DOCTRINE|4-Ring|One Door|fallback local" -S .`
- `rg -n "GO_FOR_PROD_BUILD__TITANE_INFINITY|GO_FOR_PROD_DEPLOY__TITANE_INFINITY" -S .`

## Inventaire complementaire

- `find .github -maxdepth 4 -type f | sort | rg -n "(prompts|agents|instructions|copilot|index|checklist|workflow|mermaid)" -i`
- `find scripts -type f | sort | rg -n "verify|autoheal|map_refresh|check_autofix_autoheal_registry" -i`

## Validation complete

- `bash scripts/verify_instructions.sh`
- `bash scripts/verify-copilot-instructions.sh` (missing)
- `bash scripts/verify/verify-copilot-instructions.sh`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify/verify_status_vocabulary.sh`
- `bash scripts/verify/verify_instruction_layers.sh`
- `bash scripts/verify/verify_prompt_files_index.sh`
- `bash scripts/verify/verify_agents_index.sh`
- `bash scripts/verify/verify_local_markers_consistency.sh`
- `bash scripts/verify/verify_kernel_budget.sh`
- `bash scripts/verify/verify_no_doctrine_duplication.sh`
- `node scripts/qa/check_autofix_autoheal_registry.mjs`
- `bash scripts/map_refresh.sh`

## Hygiene delta

- `git restore -- reports/MAP_PROOFS.log`
- `git status --short`
