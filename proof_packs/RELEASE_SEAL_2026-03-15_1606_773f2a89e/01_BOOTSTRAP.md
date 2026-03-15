# 01_BOOTSTRAP — Release Seal Phase

Date: 2026-03-15T16:06Z
SHA: 773f2a89e
Branch: MAIN
Node: v18.19.1 local / v20.20.0 via nvm (nvm use 20 — REQUIRED for build)
Rust: 1.94.0 (stable)
pnpm: 10.30.2
App version: 28.0.0

## Git truth
HEAD: 773f2a89e — docs(proof): seal TWINS_UI_CERT + OMEGA_TIMEOUT_RECERT proof packs
Status: staged proof_packs/TWINS_UI_CERT_2026-03-15_1540_db3d4b6 (committed later as 773f2a89e)
       + src/lib/security.ts modified (unstaged — not part of release seal scope)

## Version alignment
| Item              | Local         | CI Release | CI Unified | package.json  |
|-------------------|---------------|------------|------------|---------------|
| Node              | 18.19.1 (sys) | 20         | 22         | >=20.0.0      |
| Rust              | 1.94.0        | 1.83       | stable     | N/A           |
| pnpm              | 10.30.2       | (corepack) | (corepack) | >=9.0.0       |
| App               | 28.0.0        | N/A        | N/A        | 28.0.0        |

DIVERGENCE: CI-unified uses Node 22; release workflow uses Node 20; package.json requires >=20.0.0.
            Node 22 is not a blocker (semver compatible). Build uses nvm node 20 locally.
DIVERGENCE: CI release pins Rust 1.83; local has 1.94.0 (stable).
            Newer Rust is forward-compatible; not a blocker.
