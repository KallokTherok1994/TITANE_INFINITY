# 12 PROD DEPLOY BLOCKED

## Why deploy cannot proceed

- `BUILD_GO` is already blocked.
- Desktop E2E is blocked by missing `runtime/ALLOW_E2E_TAURI_BUILD.ok`.
- Deployment/runtime version authority is drifted:
  - `runtime/stable/tauri.conf.json` -> `28.0.0`
  - `deployment/latest/MANIFEST.json` -> `28.44.0`
  - app authority surfaces -> `28.88.0`

## Deploy decision

Production deploy would rely on a drifted runtime/deployment surface without full native or E2E certification. That violates proof-first release discipline.

## DEPLOY_GO

- DEPLOY_GO: NO
- Classification: BLOCKED
