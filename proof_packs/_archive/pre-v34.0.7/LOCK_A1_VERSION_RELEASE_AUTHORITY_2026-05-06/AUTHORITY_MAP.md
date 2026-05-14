# AUTHORITY_MAP — Lock A1

**Lock**: A1  
**Date**: 2026-05-06

## Version Authority Chain

```
L1 (kernel): .github/copilot-instructions.md — Rule 13: version bump policy
L2 (path-specific): .github/instructions/titane.instructions.md — release integrity
L3 (AGENTS.md): Build Agent scope — RELEASE_SURFACE_INVENTORY.md updates
L6 (mechanical truth): package.json, Cargo.toml, tauri.conf.json — source of version truth
L6 (release proof): proof_packs/SEAL_v33.0.8_2026-05-05 — evidence authority for 33.0.8
```

## Version Authority Table

| authority_source | version_value | status | trusted |
|-----------------|---------------|--------|---------|
| `package.json` | 33.0.9 | VERSION_BUMPED_NOT_RELEASED | YES (code version) |
| `src-tauri/Cargo.toml` | 33.0.9 | IN_SYNC | YES |
| `src-tauri/tauri.conf.json` | 33.0.9 | IN_SYNC | YES |
| `runtime/stable/manifest.json` | 33.0.9 | IN_SYNC | YES |
| `SEAL_v33.0.8_2026-05-05/VERDICT.md` | 33.0.8 | SEALED | YES (latest proven) |
| `RELEASE_ARTIFACTS_CHECKSUMS_33.0.8.txt` | 33.0.8 | PROVEN | YES |
| `deployment/latest/VERSION.txt` | 33.0.8 | DEPLOYMENT_DRIFT | PARTIAL |
| `deployment/latest/MANIFEST.json` | 33.0.7 | DEPLOYMENT_DRIFT | PARTIAL |
| `README.md` (before A1) | 33.0.0 | DOCS_DRIFT | NO (stale — fixed) |
| `RELEASE_SURFACE_INVENTORY.md` (before A1) | 33.0.3 | DOCS_DRIFT | NO (stale — noted) |
| `CHANGELOG.md` (head) | 33.0.0 | CHANGELOG_GAP | PARTIAL |

## Eval Champion Authority

| scorecard | champion | champion_tag | authority |
|-----------|---------|--------------|-----------|
| All 6 scorecards | `7973fbdec` | v28.0.0 | STALE — champion authority broken; B0 required |

## Authority Decision

Authoritative version for documentation: v33.0.8 (latest proven sealed release)
Code version: v33.0.9 (bumped, not yet released)
README now accurately reflects both facts.
