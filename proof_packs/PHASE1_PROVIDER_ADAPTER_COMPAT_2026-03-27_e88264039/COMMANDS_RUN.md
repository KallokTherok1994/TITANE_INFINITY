# COMMANDS_RUN

All commands run from repository root.

## Bootstrap

- `git status --porcelain`
- `git rev-parse --short HEAD`
- `git branch --show-current`
- `git log -20 --oneline`

## Discovery

- `sed -n '1,220p' AGENTS.md`
- `sed -n '1,220p' README.md`
- `sed -n '1,260p' .github/copilot-instructions.md`
- `sed -n '1,260p' .github/instructions/titane.instructions.md`
- `sed -n '1,260p' docs/governance/TARGET_OPERATING_MODEL_v1.md`
- `sed -n '1,260p' docs/governance/PROVIDER_FABRIC_CANON_v1.md`
- `nl -ba src/services/ai/types.ts | sed -n '1,360p'`
- `nl -ba src/services/ai/providers/openai.ts | sed -n '1,260p'`
- `nl -ba src/services/ai/providers/claude.ts | sed -n '1,260p'`
- `nl -ba src/services/ai/providers/gemini.ts | sed -n '1,330p'`
- `nl -ba src/services/ai/providers/ollama.ts | sed -n '1,490p'`
- `nl -ba src/services/ai/providers/titaneLocal.ts | sed -n '454,620p'`
- `nl -ba src/services/ai/providers/copilot.ts | sed -n '1,320p'`

## Validation

- `pnpm exec vitest run src/services/ai/providers/__tests__/providerFabricAdapter.test.ts src/services/ai/providers/__tests__/openai.test.ts src/services/ai/providers/__tests__/claude.test.ts src/services/ai/providers/__tests__/providerMemoryReuse.test.ts`
- `bash scripts/verify_instructions.sh`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify/verify_instruction_layers.sh`
- `bash scripts/verify/verify_no_doctrine_duplication.sh`
