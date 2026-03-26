# 03_PATCH_PLAN

## Diagnose

- Baseline nominal path returned `timeout-degraded` with provider available.
- S1 before patch showed fallback around `22.7s`.
- Probe with env override (`TITANE_CONVERSATION_TIMEOUT_SECS=60`) switched behavior to `provider=Ollama`, `reason=OK`.

## Minimal Plan Applied

1. Increase backend default timeout guard (`20 -> 60`) to enlarge useful response window.
2. Add a command-specific frontend timeout (`75s`) so frontend does not cut before backend guard when using `conversation_generate` via `tauriClient`.
3. Keep degraded fallback logic unchanged (honesty path preserved).

## Why This Is Minimal

- 2 files changed.
- No architectural route changes.
- No new command/capability.
- No fallback wording changes.
