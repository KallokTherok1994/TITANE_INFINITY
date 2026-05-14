# GATE REPORT — PROD_RELEASE_v29.0.0_2026-04-05

## Required gates

| Gate | Command | Result |
|---|---|---|
| Stable packaging | `bash runtime/stable/build.sh` | PASS |
| Certified deploy | `bash scripts/deployment/certified-deploy.sh --target both --deploy-path deployment/latest --manifest-update --verbose` | PASS |
| Lint | `pnpm run lint` | PASS |
| Format | `pnpm run format:check` | PASS |
| TypeScript | `pnpm run check` | PASS |
| AutoHeal recurrence | `bash scripts/autoheal/detect_recurrence.sh` | PASS |
| Instruction verification | `bash scripts/verify_instructions.sh` | PASS |

## Release verdict

- Stable AppImage + DEB refreshed to `29.0.0`
- `deployment/latest` manifest, hashes, and sizes aligned
- Root docs and archival surfaces updated
- Historical proof preserved non-destructively in `_archive/prod_patch010/`
