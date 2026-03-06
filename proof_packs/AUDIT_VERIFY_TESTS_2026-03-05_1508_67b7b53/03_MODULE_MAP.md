# 03_MODULE_MAP — Cartographie des Modules
**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z

---

## Inventaire Automatique

```bash
# Manifests trouvés
./orchestration/package.json
./package.json
./src-tauri/Cargo.toml
./src-tauri/tauri.conf.json
./runtime/dev/tauri.conf.json
./runtime/stable/tauri.conf.json
./vite.config.ts

# Total fichiers source
TS/TSX (global): 1654
RS (global):      968
TS/TSX (src/):   1521
RS (src-tauri/src/): 940

# Entrypoints Tauri (package.json à la racine): 1
# Cargo workspaces: 1 (src-tauri/Cargo.toml)
```

---

## Table des Modules

| # | ModulePath | Type | Ring | Entrypoint(s) | Lang | Output dirs | Notes |
|---|-----------|------|------|---------------|------|-------------|-------|
| 1 | `src/types/` | Types | R1 | `index.ts` (28 files) | TS | — | Contrats purs, zéro I/O |
| 2 | `src/constants/` | Constants | R1 | — | TS | — | Part of R1 |
| 3 | `src/engines/aura/` | Engine | R2 | `index.ts` | TS | — | Moteur aura |
| 4 | `src/engines/cognitive/` | Engine | R2 | `index.ts` | TS | — | Moteur cognitif |
| 5 | `src/engines/continuum/` | Engine | R2 | `index.ts` | TS | — | Moteur continuum |
| 6 | `src/engines/conversation/` | Engine | R2 | `index.ts` | TS | — | Moteur conversation |
| 7 | `src/engines/emotion/` | Engine | R2 | `index.ts` | TS | — | Moteur émotion |
| 8 | `src/engines/identity/` | Engine | R2 | `index.ts` | TS | — | Moteur identité |
| 9 | `src/engines/narrative/` | Engine | R2 | `index.ts` | TS | — | Moteur narratif |
| 10 | `src/engines/` (autres 13) | Engines | R2 | `index.ts` | TS | — | autopoiesis, embodiment, expression, flow, holopresence, interoception, metasingularity, output, phasespace, predictive, presence, psyche, spatial, time, uiux, selfHealing |
| 11 | `src/services/ai/` | Service AI | R3 | `index.ts`, providers/ | TS | — | Providers: Gemini, OpenAI, Ollama, GLM, tauriChat |
| 12 | `src/services/chat/` | Service Chat | R3 | `index.ts` | TS | — | Chat pipeline |
| 13 | `src/services/audio/` | Service Audio | R3 | `index.ts` | TS | — | TTS, transcription |
| 14 | `src/services/memory/` | Service Memory | R3 | `index.ts` | TS | — | Chat memory |
| 15 | `src/services/selfHealing/` | Service SelfHeal | R3 | `selfHealingObserver.ts` | TS | — | ⚠️ Monkey-patch fetch (FIX-001) |
| 16 | `src/services/` (autres 40+) | Services | R3 | `index.ts` | TS | — | cognitive, consistency, monitoring, tts, webResearch, etc. |
| 17 | `src/lib/tauriClient.ts` | Canonical IPC | R3 | `tauriClient.ts` | TS | — | ✅ Canonical client — invoke() centralisé |
| 18 | `src/lib/security.ts` | Security | R3 | `security.ts` | TS | — | secureInvoke, SecureAIService |
| 19 | `src/core/http/httpClient.ts` | HTTP Governed | R3 | `httpClient.ts` | TS | — | ✅ Bloque réseau frontend en prod |
| 20 | `src/core/commands/TAURI_COMMANDS.ts` | Commands Map | R3 | `TAURI_COMMANDS.ts` | TS | — | Whitelist des commandes |
| 21 | `src/os/bridge/TauriBridge.ts` | OS Bridge | R3/R4 | `TauriBridge.ts` | TS | — | ⚠️ invoke() direct hors canonical |
| 22 | `src/os/bridge/StateBridge.ts` | State Bridge | R3/R4 | `StateBridge.ts` | TS | — | ⚠️ invoke() direct hors canonical |
| 23 | `src/utils/invoke.ts` | Invoke Util | R3 | `invoke.ts` | TS | — | ⚠️ Wrapper parallèle (mais via secureInvoke) |
| 24 | `src/components/` | UI Components | R4 | `ChatWindow.tsx`, `ErrorBoundary.tsx` | TSX | — | 52 composants |
| 25 | `src/pages/` | Pages | R4 | `ResearchPage.tsx`, etc. | TSX | — | Routes React |
| 26 | `src/features/` | Features | R4 | 24 modules fonctionnels | TSX | — | governance-center, etc. |
| 27 | `src/apps/` | Apps | R4 | devtools, etc. | TSX | — | |
| 28 | `src-tauri/src/commands/` | Tauri Commands | R4 | 1283 `#[tauri::command]` | RS | — | Result<T, String> |
| 29 | `src-tauri/src/overdrive/` | AI Gateway | R3 | `chat_orchestrator.rs` | RS | — | ✅ ONE DOOR réseau backend (reqwest+timeout) |
| 30 | `src-tauri/src/engines/` | Rust Engines | R2 | `mod.rs` per engine | RS | — | ⚠️ unified_memory: HTTP dans R2 (FIX-002) |
| 31 | `src-tauri/src/engines/unified_memory/` | Memory Engine | R2 | `summarizer.rs`, `embeddings.rs` | RS | — | **VIOLATION R2 I/O**: HTTP directs |
| 32 | `src-tauri/src/ipc/` | IPC Layer | R3 | `mod.rs` | RS | — | IPC handlers |
| 33 | `src-tauri/capabilities/` | Capabilities | Runtime | 6 JSON files | JSON | — | ✅ deny-by-default |
| 34 | `src-tauri/allowlist.whitelist.stable.json` | Allowlist | Runtime | `allowlist.whitelist.stable.json` | JSON | — | Whitelist stable des commandes |
| 35 | `orchestration/` | Orchestration | CI | `package.json` | Mixed | — | Second package.json (sous-projet) |
| 36 | `.github/workflows/` | CI/CD | CI | 44 YAML files | YAML | — | 44 workflows (dont ~15 décoratifs) |
| 37 | `scripts/verify/` | Verify Gates | CI | 20+ sh scripts | SH | — | enforce-tauri-only, enforce-online-first, etc. |
| 38 | `scripts/autoheal/` | AutoHeal | CI | `autoheal_rules.jsonl`, `detect_recurrence.sh` | JSONL/SH | — | 4 règles actives |
| 39 | `e2e/` | E2E Tests | CI | `playwright.config.ts`, `wdio.desktop.conf.cjs` | TS | — | BLOCKED sans runtime Tauri |
| 40 | `tests/` | Unit Tests | CI | `vitest.config.ts` | TS | — | BLOCKED sans node_modules |
| 41 | `docs/MAP_*.md` | Cartographie | Docs | 8 fichiers MAP | MD | — | ✅ Présents |
| 42 | `registry/` | Registres | Docs | `ui-events.jsonl`, etc. | JSONL | — | ✅ 7 registres append-only |

---

## Statistiques

| Métrique | Valeur |
|---------|--------|
| Total fichiers TS/TSX | 1 654 |
| Total fichiers RS | 968 |
| Commandes Tauri (#[tauri::command]) | 1 283 |
| Capabilities Tauri | 6 |
| Workflows CI | 44 |
| Registres (JSONL) | 7 |
| Proof packs | 13 (dont ce nouveau) |
| Règles AutoHeal | 4 |
