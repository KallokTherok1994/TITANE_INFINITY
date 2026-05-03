# 06 Decision Matrix

| File | Evidence class | Candidate actions | Decision | Decision status | Rationale |
|---|---|---|---|---|---|
| `runtime/stable/manifest.json` | Timestamp-only metadata refresh | `KEEP` / `REVERT` | `KEEP` | `PASS` | Maintains latest validation trace; semantic state unchanged (`FORBIDDEN_SCAN_PASSED`). |
| `titane-infinity.desktop` | Launcher coherence update to existing artifact | `KEEP` / `REVERT` | `KEEP` | `PASS` | `27.2.0` executable exists, `27.0.5` executable missing; revert risks broken desktop launch. |

Decision constraints:

- No scope expansion allowed.
- No additional file mutation beyond explicit keep acceptance.

