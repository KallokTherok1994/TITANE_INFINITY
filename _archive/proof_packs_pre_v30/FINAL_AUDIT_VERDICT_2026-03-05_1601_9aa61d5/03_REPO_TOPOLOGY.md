# 03_REPO_TOPOLOGY — Topologie du Dépôt
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## Arbre Résumé (zones actives)

```
TITANE_INFINITY/
├── .github/
│   ├── workflows/         ← 43 fichiers CI (ci-unified, mermaid, codeql, p0-p6 gates...)
│   ├── instructions/      ← instructions Copilot (frontend, tauri, e2e, docs)
│   └── copilot-agents/    ← agents personnalisés
├── e2e/                   ← specs Playwright desktop (10 fichiers)
├── docs/                  ← MAP_*.md + guides + architecture (200+ fichiers)
│   ├── 01_architecture/
│   ├── 02_ARCHITECTURE/
│   └── diagrams/sources/  ← 4 .mmd sources (mermaid)
├── deployment/
│   ├── latest/            ← MANIFEST.json + SHA256 + certifications LFS (240MB)
│   ├── v27.0.0-PRODUCTION/
│   └── v27.4.1/
├── proof_packs/           ← 15 packs, 179 fichiers (append-only)
├── registry/              ← 7 JSONL append-only (ui-events, chat-events, autofix...)
├── runtime/
│   ├── dev/               ← tauri.conf.json dev
│   └── stable/            ← tauri.conf.json stable
├── scripts/
│   ├── verify/            ← 20+ scripts de vérification
│   ├── autoheal/          ← autoheal_rules.jsonl + detect_recurrence.sh
│   ├── e2e/               ← tauri-wrapper.sh, ensure-webkit-webdriver.sh
│   └── guards/            ← guard-network-policy.sh, guard-ipc-only-tests.sh
├── src/                   ← 23MB TS frontend (React + Zustand + Tauri API)
│   ├── __tests__/         ← 136 fichiers test
│   ├── apps/devtools/     ← DevTools R4
│   ├── components/        ← 52 composants
│   ├── constants/         ← R1 constants
│   ├── core/              ← R3 http/commands
│   ├── engines/           ← R2 TS engines (~20)
│   ├── features/          ← R4 features (24)
│   ├── hooks/             ← R3/R4 hooks
│   ├── lib/               ← R3 utilities (tauriClient, security, ipcContract)
│   ├── modules/           ← R2/R3 modules
│   ├── os/bridge/         ← R3 TauriBridge, StateBridge
│   ├── pages/             ← R4 pages
│   ├── services/          ← R3 services (~56 modules)
│   ├── stores/            ← R3/R4 Zustand stores
│   ├── tests/             ← tests E2E Vitest
│   ├── types/             ← R1 types
│   └── ui/                ← R4 UI atoms
├── src-tauri/             ← 14MB Rust backend (Tauri)
│   ├── capabilities/      ← 6 JSON capabilities
│   ├── src/
│   │   ├── commands/      ← 1283 #[tauri::command] handlers
│   │   ├── core/          ← types, http_types
│   │   ├── engines/       ← R2 Rust (9 engines)
│   │   │   └── unified_memory/ ← ⚠️ VIOLATION HTTP
│   │   ├── modules/       ← R3 Rust modules
│   │   ├── overdrive/     ← R3 Rust gateway (chat_orchestrator, api_bridge)
│   │   └── tests/         ← 20 fichiers tests Rust
│   └── tests/             ← intégration Rust
└── tests/                 ← ~45 suites TS (unit/integration/e2e/contract/security)
```

---

## Manifests Clés

```
./package.json                       — version 27.2.0, scripts + deps
./src-tauri/Cargo.toml               — version 27.2.0
./src-tauri/tauri.conf.json          — version 27.2.0, productName TITANE-Infinity
./runtime/dev/tauri.conf.json        — conf dev
./runtime/stable/tauri.conf.json     — conf stable
./vite.config.ts                     — Vite/React
./orchestration/package.json         — workspace orchestration
./deployment/latest/MANIFEST.json    — version 27.2.0 (LFS)
```

---

## Zones Lourdes (volume > 100MB)

| Zone | Taille | Contenu |
|------|--------|---------|
| `.git/` | ~405MB | Historique Git + LFS |
| `deployment/latest/` | ~240MB | Binaires + certifications LFS |
| `src/` | ~23MB | Frontend TS |
| `src-tauri/` | ~14MB | Backend Rust |
| `proof_packs/` | ~3MB | 15 packs audit |

---

## Points d'Entrée

| Entrée | Fichier | Ring |
|--------|---------|------|
| Frontend main | `src/main.tsx` | R4 |
| Tauri main | `src-tauri/src/main.rs` | R4 |
| IPC canonical | `src/lib/tauriClient.ts` | R3 |
| Gateway réseau | `src-tauri/src/overdrive/chat_orchestrator.rs` | R3 |
| Tests Vitest | `vitest.config.ts` | CI |
| Tests E2E | `playwright.config.ts` | CI |
