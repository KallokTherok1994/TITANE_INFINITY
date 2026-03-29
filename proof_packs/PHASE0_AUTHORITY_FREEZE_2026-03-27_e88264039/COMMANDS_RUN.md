# COMMANDS_RUN

All commands run from repository root.

## Bootstrap

- `git status --porcelain`
- `git rev-parse --short HEAD`
- `git branch --show-current`
- `git log -20 --oneline`

## Discovery

- `sed -n '1,220p' AGENTS.md`
- `sed -n '1,260p' README.md`
- `sed -n '1,260p' .github/copilot-instructions.md`
- `sed -n '1,220p' .github/instructions/titane.instructions.md`
- `sed -n '1,220p' .github/instructions/tauri.instructions.md`
- `sed -n '1,220p' .github/instructions/frontend.instructions.md`
- `sed -n '1,220p' .github/instructions/docs-registry.instructions.md`
- targeted `rg` / `find` / `sed` scans over provider, router, memory, eval, proof-pack surfaces

## Validation

- `bash scripts/verify/enforce-online-first.sh` -> exit 0
- `pnpm exec vitest run src/__tests__/provider-decision-invariants.test.ts src/__tests__/online-availability.test.ts` -> exit 0
- `node -v` -> `v24.14.0`
- `pnpm -v` -> `10.30.2`
