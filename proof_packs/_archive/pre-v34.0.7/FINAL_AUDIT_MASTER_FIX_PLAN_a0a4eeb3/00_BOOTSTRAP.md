# Bootstrap — Vérité du Repo
**Date:** 2026-03-03T20:12:50Z
**Commit:** a0a4eeb3
**Branch:** copilot/audit-repository-contents

---

## Git State

```
HEAD: a0a4eeb3
Branch: copilot/audit-repository-contents
Recent commits:
  a0a4eeb3 feat: UI Interactive Cartography Proof-Pack — Audit complet TITANE∞ v27.2.0
  e97177da fix: Chat IA audit — provider attribution, cache deduplication, health_check accuracy
```

## Versions (Source-of-Truth Alignment)

| Source | Version | Status |
|--------|---------|--------|
| package.json | 27.2.0 | ✅ |
| src-tauri/Cargo.toml | 27.2.0 | ✅ SYNC |
| src-tauri/tauri.conf.json | 27.2.0 | ✅ SYNC |
| deployment/latest/MANIFEST_v27.2.0.json | 27.2.0 | ✅ SYNC |
| deployment/latest/MANIFEST.json | version=null | ⚠️ Root MANIFEST has no version field |

## Tech Stack (H1 CONFIRMÉ)

- Frontend: React 19 / TypeScript strict — **PROUVÉ** (src/main.tsx, package.json)
- Backend: Rust / Tauri v2 — **PROUVÉ** (src-tauri/Cargo.toml `tauri = "2"`)
- Routing: react-router-dom v7 — **PROUVÉ** (src/App.tsx)
- State: zustand v5 + tanstack-query v5 — **PROUVÉ** (package.json)
- IPC: secureInvoke → ALLOWED_COMMANDS → tauriClient — **PROUVÉ** (src/lib/security.ts, tauriClient.ts)

## E2E Mechanism (H2 STATUS)

- playwright.config.ts — **PROUVÉ** (racine repo)
- wdio.desktop.conf.cjs — **PROUVÉ** (racine repo)
- scripts/e2e/tauri-wrapper.sh — **PROUVÉ** (scripts/e2e/)
- pnpm test:e2e → **BLOCKED** (Tauri runtime requis, non disponible en sandbox)

## CI Workflows

- Total: 43 workflows dans .github/workflows/
- Principaux: ci-unified.yml, stable-build.yml, deploy-v27-production.yml, codeql.yml
- Node: 22 | Rust: 1.83 | pnpm: 10.28.2

## Scripts Clés Disponibles

```
lint / lint:fix / format / format:check
test / test:watch / test:architecture / test:compliance
test:e2e / test:rust / test:tauri
audit / audit:master / audit:security
verify / verify:tauri-only / verify:online-first
run:x3:tests / run:x3:build / run:x3:network
gate:all / stopline:rebuild-proof
```
