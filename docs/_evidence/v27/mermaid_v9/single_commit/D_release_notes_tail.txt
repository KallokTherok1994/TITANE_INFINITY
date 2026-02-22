# Mermaid Governance Release Notes

## V9

- Date (UTC): 2026-02-22T16:49:45Z
- HEAD_SHA_AT_TIME: c891da3eb53a564dcc41b0d2a5888910ca1209c8

### What changed

- Enforced no-self-hash guard for Mermaid evidence.
- Proof pack writes HEAD_SHA_AT_TIME and avoids final SHA recording.
- CI summary now reports HEAD_SHA_AT_TIME and no-self-hash policy.
- CI guards accept explicit base refs for PR correctness.
- Added ops playbooks for branch protection and PR fixes.

### Why

- Remove multi-commit evidence loops.
- Keep governance traceable without self-referential SHA.
- Improve PR review clarity and operator workflows.

### How to verify

- `pnpm run op:mermaid`
- `bash scripts/verify/mermaid-proof-pack.sh`
