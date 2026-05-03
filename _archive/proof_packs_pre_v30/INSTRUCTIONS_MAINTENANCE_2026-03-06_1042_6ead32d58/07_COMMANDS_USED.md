# 07_COMMANDS_USED

## Bootstrap realite

- `git status`
- `git rev-parse --short HEAD`
- `git log -5 --oneline`
- `find .github -maxdepth 5 -type f | sort`
- `find . -name AGENTS.md -type f | sort || true`
- `find .github -type f | rg "prompt|agent|instruction" -n || true`
- `find scripts -maxdepth 5 -type f | sort || true`
- `rg -n "Local-first|online-first|fallback local|One Door|4-Ring|BLOCKED_DOCTRINE|AutoHeal|verify_instructions|verify-copilot-instructions|detect_recurrence|map_refresh" -S .`

## Inventaire/decouverte

- `find .github -maxdepth 4 -type f | sort | rg -n "(index|prompt|agent|instruction|copilot)" -i`
- `find scripts -type f | sort | rg -n "verify|instruction|agent|prompt|kernel|map|mapping|autoheal|registry" -i`
- `find docs -type f | sort | rg -n "instruction|agent|prompt|mapping|copilot|governance|proof|registry" -i`

## Validateurs executes

- `bash scripts/verify_instructions.sh`
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

Preuve detaillee: `08_TESTS_AND_VALIDATORS.log`.
