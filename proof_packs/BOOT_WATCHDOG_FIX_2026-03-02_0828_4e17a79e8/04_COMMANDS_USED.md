# COMMANDS USED

- `git status --porcelain`
- `git rev-parse --short HEAD`
- `git log -20 --oneline`
- token presence checks (masked):
  - `TOKEN_BUILD=<present|missing>`
  - `TOKEN_DEPLOY=<present|missing>`
- `grep` invariants scans for direct UI network primitives
- `pnpm test:architecture` (single + x3)
- `get_errors` on changed scope files
- `git --no-pager diff -- registry/ui-events.jsonl`
- run-release evidence extraction from:
  - `runtime/stable/logs/appimage-run-20260302-075330-90s-x1.log`
  - `runtime/stable/logs/appimage-run-20260302-075358-90s-x2.log`
  - `runtime/stable/logs/appimage-run-20260302-075448-90s-x3.log`
