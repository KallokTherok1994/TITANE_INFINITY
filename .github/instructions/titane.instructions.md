---
applyTo: 'src/**, src-tauri/**, tests/**, scripts/**'
---

# TITANE_INFINITY - Surface Instruction (Scoped)

# Applies to: src/, src-tauri/, tests/, scripts/

## Invariants rappeles

- Ring impacte: cross-ring operational surface (`src/`, `src-tauri/`, `tests/`, `scripts/`).
- Online-first governed policy with mandatory local fallback remains active.
- Local-first wording is compatibility marker only; no local-first-only behavior.
- Keep this file local: do not restate global kernel doctrine.

## DO

- Use PATH_SIMPLE for local low-risk tasks:
  - targeted discovery
  - local rules only
  - targeted proofs only
- Use PATH_HEAVY for architecture/runtime/IPC/E2E/release tasks:
  - full bootstrap
  - layer conflict checks
  - broader validators
  - proof-pack discipline
  - mapping/cartography update verification (Rule 15)
  - test creation verification (Rule 16)
- For Android build/runtime work, enforce the Android freshness sequence from `.github/copilot-instructions.md` Rule 13.2: rebuild frontend first, verify packaged artifact truth, verify installed device truth, and treat `conversation_generate` IPC clamp/fallback as a backend/frontend desynchronization until proven otherwise.
- For Android dev-runtime UI freshness, `bash scripts/android/dev-stable.sh` must delegate to `scripts/android/vite-network-server.sh` as the only Vite launcher, prove `http://127.0.0.1:1420` is still reachable after startup, then rerun `corepack pnpm run test:e2e:android:browser` before closure. Without ADB evidence, keep the device lane explicitly BLOCKED.
- Keep fixes minimal and reversible.
- Route binary, repeated rules toward validator scripts.
- If a custom agent, specialist delegation, or exploration-oriented handoff is unavailable because of platform quota or tooling unavailability, continue immediately with canonical local discovery or evidence collection whenever the task remains locally provable; classify the delegation gap honestly instead of blocking on the delegation itself.
- For every new file in `src/` or `src-tauri/`: confirm corresponding test file exists (Rule 16).
- For every structural change: confirm relevant mapping doc is updated (Rule 15).
- For frontend/UI work, enforce the scoped mandatory UI procedure from `frontend.instructions.md` as part of PATH_HEAVY verification whenever runtime truth, fullscreen, zoom, build, or cross-platform proof is involved.
- For route/page/runtime regressions, enforce the canonical surface anti-drift sequence: identify the real visible surface first, then realign live aliases, deprecated routes, preloading, compatibility exports, and touched tooling references before PASS.
- In direct-to-main mode explicitly requested by the user, finish each proven phase with a targeted commit on `MAIN` instead of batching multiple completed fixes together.
- For Ollama Dev / Ollama Chat boundary work, keep the canonical local AI truth synchronized across frontend defaults, backend loopback, scripts, repo-owned Copilot instructions, `.github/agents/ollama-dev-chat-boundary.agent.md`, docs, and validators in the same patch. Development baseline: `http://127.0.0.1:11434` + `qwen3.5:9b` for GitHub Copilot VS Code conversation. Product baseline: `http://127.0.0.1:11434` + `gemma2:2b` + IPC path + no token gate for TITANE chat runtime. Controlled communication is allowed only through explicit, traced, bounded interfaces; shared default mutation between the two surfaces is forbidden.

## DONT

- Do not duplicate global status doctrine from kernel.
- Do not duplicate PROD token doctrine in lower layers.
- Do not keep workflow-heavy runbooks in always-on instruction files.
- Do not claim completion without validator output.
- Do not skip mapping update or test creation for new features (Rule 15/16 are hard gates).

## Preuves attendues

- Command list and check outputs with exit codes.
- Relevant validator output for touched scope.
- Explicit rollback commands.

## Indexation et mapping agents avancés

- Tout nouvel agent (monitoring, diagnostic, explainability, orchestrateur, sécurité) doit être indexé dans la doc repo (README ou section dédiée), mappé dans tous les fichiers de cartographie, et disposer d’une preuve (log, capture, rapport, rollback).

## Gates specifiques

- `bash scripts/verify_instructions.sh`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify/verify-ollama-copilot-boundary.sh` when Ollama Dev / Ollama Chat defaults, repo-owned Copilot doctrine, boundary agent, or agent stack access paths change.
- For governed frontend/UI procedure changes also run targeted UI tests plus the instruction architecture validators below.
- For instruction architecture changes also run:
  - `bash scripts/verify/verify_instruction_layers.sh`
  - `bash scripts/verify/verify_no_doctrine_duplication.sh`
  - `bash scripts/verify/verify_status_vocabulary.sh`
  - `bash scripts/verify/verify_agents_index.sh`
  - `bash scripts/verify/verify_prompt_files_index.sh`
  - `bash scripts/verify/verify_local_markers_consistency.sh`
  - `bash scripts/verify/verify_kernel_budget.sh`

## Rollback

- `git restore -- .github/copilot-instructions.md .github/instructions/titane.instructions.md`
- `git restore -- .github/prompts .github/agents src/AGENTS.md src-tauri/AGENTS.md e2e/AGENTS.md docs/AGENTS.md scripts/AGENTS.md`
- `git restore -- scripts/verify governance`
