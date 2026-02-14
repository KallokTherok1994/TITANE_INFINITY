# RUN SUMMARY — CHAT IPC ARGS VERIFY

Date: 2026-02-14
Run: reports/chat-ipc-args-verify/2026-02-14T16:05:00Z

## Status

FINAL_STATE: BLOCKED

## Gates

- G1 (pnpm test): FAIL (2 tests failed)
- G2 (guard:ipc-contract): NOT RUN
- G3 (dev:tauri smoke): NOT RUN

## Notes

- Git tree cleaned via commit: ce85a922
- Verification stopped after Gate-1 failure

## Next Action

Run `pnpm test` to satisfy Gate-1, then proceed to G2 and G3.
