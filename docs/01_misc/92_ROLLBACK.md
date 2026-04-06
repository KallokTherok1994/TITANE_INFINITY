# Rollback - P3-6 NO_VITE Recovery

1) Revert test harness
- git restore -- src-tauri/tests/p3_provider_meta_gates.rs

2) Revert registry append (if applied)
- git restore -- docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md

3) Optional cleanup for previous IPC scripts (if not needed)
- git restore -- scripts/smoke/ipc-ar20.cjs scripts/smoke/ipc-offline5.cjs

4) Proof pack
- Do not delete proof pack; keep as append-only evidence unless explicitly instructed.
