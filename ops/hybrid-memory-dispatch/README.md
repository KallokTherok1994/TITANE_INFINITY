# Hybrid Memory Dispatch Kit

This folder contains the Linux-safe operator pack for the governed hybrid-memory rollout.

## Contents

- `OFFICIAL_HANDOFF_PLAN.md` — authoritative dispatch charter
- `HANDOFF_TEMPLATE.md` — reusable packet for each agent handoff
- `START_HERE.md` — quick-start sequence for the operator

## Linux-safe scope

- uses the current repo agent format under `.github/agents`
- uses the prompt format under `.github/prompts`
- uses a shell launcher under `scripts/dispatch`
- excludes Windows-only wrappers, `pnpm.cmd`, PowerShell launchers, and MSVC bootstrap logic
