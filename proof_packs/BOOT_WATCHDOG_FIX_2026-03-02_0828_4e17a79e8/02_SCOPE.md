# SCOPE

- ring_target: R4 only
- patch_type: minimal fix
- scope_files:
  - src/components/diagnostics/SplashWatchdog.tsx
  - registry/ui-events.jsonl
  - proof_packs/PROD_ISOLATION_2026-03-01_1557_6c47b0253/62_COMMIT_READY.md

## 4-Ring impact map

- Ring 1: no change
- Ring 2: no change
- Ring 3: no change
- Ring 4: `SplashWatchdog` readiness logic + append-only proof/registry entries

## Out of scope

- No network surface expansion
- No tauri capability/allowlist change
- No production deploy action
