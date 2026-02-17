# Rollback - P3-6 Strict No-Server

If rollback is required:

1) Revert script additions
- git restore -- scripts/smoke/ipc-ar20.cjs scripts/smoke/ipc-offline5.cjs

2) Revert registry append (if applied)
- git restore -- docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md

3) Proof pack
- Do not delete proof pack; keep as append-only evidence unless explicitly instructed.
