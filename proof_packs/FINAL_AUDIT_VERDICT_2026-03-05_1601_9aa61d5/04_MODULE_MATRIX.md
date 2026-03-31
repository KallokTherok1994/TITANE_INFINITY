# 04_MODULE_MATRIX — Matrice Modules
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

| # | ModulePath | Ring | Entrypoints | Lang | Outputs | Surfaces Réseau | Surfaces IPC | Statut |
|---|-----------|------|-------------|------|---------|----------------|-------------|--------|
| 1 | `src/types/` | R1 | 28 fichiers | TS | types | Aucune | Aucune | STABLE |
| 2 | `src/constants/` | R1 | — | TS | constants | Aucune | Aucune | STABLE |
| 3 | `src/engines/` (20 moteurs TS) | R2 | `index.ts` par moteur | TS | logique | **Zéro I/O attendu** | Aucune | QUALIFIED |
| 4 | `src-tauri/src/engines/` (9 Rust) | R2 | `mod.rs` | RS | logique | **VIOLATION: unified_memory** | Aucune | EXP |
| 5 | `src-tauri/src/engines/unified_memory/` | R2 | summarizer.rs, embeddings.rs | RS | résumés+vecteurs | **HTTP direct (FAIL P0)** | Aucune | EXP |
| 6 | `src/services/ai/` | R3 | providers/ | TS | AI responses | Via IPC→Rust | IPC canonical | QUALIFIED |
| 7 | `src/services/chat/` | R3 | index.ts | TS | messages | Via IPC | IPC canonical | QUALIFIED |
| 8 | `src/services/selfHealing/` | R3 | selfHealingObserver.ts | TS | health events | **⚠️ window.fetch:431** | IPC | EXP |
| 9 | `src/services/unified/` | R3 | UnifiedMemory.ts | TS | mémoire | Via IPC | IPC | QUALIFIED |
| 10 | `src/services/orchestration/` | R3 | OrchestratorService.ts | TS | orchestration | Via IPC | IPC | QUALIFIED |
| 11 | `src/services/` (autres ~48) | R3 | index.ts | TS | various | Via IPC | IPC | QUALIFIED |
| 12 | `src/lib/tauriClient.ts` | R3 | tauriClient.ts | TS | IPC layer | Aucune | **ONE DOOR IPC** | STABLE |
| 13 | `src/lib/security.ts` | R3 | security.ts | TS | security | Aucune | IPC | STABLE |
| 14 | `src/lib/ipcContract.ts` | R3 | ipcContract.ts | TS | validation | Aucune | IPC | STABLE |
| 15 | `src/lib/tauriCommands.ts` | R3 | tauriCommands.ts | TS | TAURI_COMMANDS | Aucune | IPC | STABLE |
| 16 | `src/core/http/httpClient.ts` | R3 | httpClient.ts | TS | HTTP (test) | Prod-blocked | IPC | STABLE |
| 17 | `src/os/bridge/TauriBridge.ts` | R3 | TauriBridge.ts | TS | bridge | Aucune | ⚠️ invoke direct | EXP |
| 18 | `src/os/bridge/StateBridge.ts` | R3 | StateBridge.ts | TS | state | Aucune | ⚠️ invoke direct | EXP |
| 19 | `src/utils/invoke.ts` | R3 | invoke.ts | TS | secureInvoke | Aucune | IPC (capped x3) | QUALIFIED |
| 20 | `src/components/` (52) | R4 | *.tsx | TSX | UI | Via IPC | IPC | QUALIFIED |
| 21 | `src/pages/` | R4 | *.tsx | TSX | pages | Via IPC | IPC | QUALIFIED |
| 22 | `src/features/` (24) | R4 | *.tsx | TSX | features | Via IPC | IPC | QUALIFIED |
| 23 | `src/apps/devtools/` | R4 | *.tsx | TSX | devtools | Via IPC | IPC | EXP |
| 24 | `src-tauri/src/commands/` | R4 | 1283 #[tauri::command] | RS | IPC handlers | Délègue R3 | **IPC handlers** | QUALIFIED |
| 25 | `src-tauri/src/overdrive/chat_orchestrator.rs` | R3 | — | RS | chat proxy | **ONE DOOR Network** | IPC | STABLE |
| 26 | `src-tauri/src/overdrive/api_bridge.rs` | R3 | — | RS | API bridge | backend (commenté) | IPC | STABLE |
| 27 | `src-tauri/src/core/http_types.rs` | R3 | — | RS | reqwest re-export | — | — | STABLE |
| 28 | `src-tauri/capabilities/` (6 JSON) | Runtime | — | JSON | capabilities | scoped URLs | — | STABLE |
| 29 | `.github/workflows/` (43 YML) | CI | ci-unified.yml | YAML | CI runs | GitHub API | — | QUALIFIED |
| 30 | `scripts/verify/` (20+ SH) | CI | — | SH | PASS/FAIL | FS | — | QUALIFIED |
| 31 | `scripts/autoheal/` | CI | autoheal_rules.jsonl | JSONL/SH | audit rules | FS | — | QUALIFIED |
| 32 | `docs/MAP_*.md` (8) | Docs | — | MD | documentation | FS | — | STABLE |
| 33 | `registry/` (7 JSONL) | Docs | ui-events.jsonl | JSONL | event registry | FS append-only | — | STABLE |

---

## Légende Statuts

- **STABLE**: prouvé par tests + docs + CI historical pass
- **QUALIFIED**: prouvé par tests mais env absent localement pour vérifier
- **EXP**: expérimental / violation connue / non encore certifié

## Modules avec Violations Actives

| Module | Violation | Sévérité |
|--------|-----------|----------|
| `engines/unified_memory/summarizer.rs` | HTTP direct Ring 2 | P0 |
| `engines/unified_memory/embeddings.rs` | HTTP direct Ring 2 | P0 |
| `services/selfHealing/selfHealingObserver.ts` | window.fetch monkey-patch | P1 |
| `os/bridge/TauriBridge.ts` | invoke() direct hors canonical | P1 |
| `os/bridge/StateBridge.ts` | invoke() direct hors canonical | P1 |
