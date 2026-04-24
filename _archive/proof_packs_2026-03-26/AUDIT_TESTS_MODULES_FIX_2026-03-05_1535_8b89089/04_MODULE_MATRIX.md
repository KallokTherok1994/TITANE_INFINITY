# 04_MODULE_MATRIX — Matrice Modules + Rings

**Proof Pack:** AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089  
**Timestamp:** 2026-03-05T15:35:28Z

---

## Manifests Trouvés

```
./orchestration/package.json
./package.json
./src-tauri/Cargo.toml
./src-tauri/tauri.conf.json
./runtime/dev/tauri.conf.json
./runtime/stable/tauri.conf.json
./vite.config.ts
```

---

## Matrice (modules critiques)

| #   | ModulePath                                     | Ring    | Entrypoints                                    | Lang     | I/O                                     | Statut    |
| --- | ---------------------------------------------- | ------- | ---------------------------------------------- | -------- | --------------------------------------- | --------- |
| 1   | `src/types/`                                   | R1      | 28 fichiers                                    | TS       | Zéro                                    | STABLE    |
| 2   | `src/constants/`                               | R1      | —                                              | TS       | Zéro                                    | STABLE    |
| 3   | `src/engines/` (20 moteurs)                    | R2      | `index.ts`                                     | TS       | Zéro (attendu)                          | QUALIFIED |
| 4   | `src-tauri/src/engines/` (9 engines)           | R2      | `mod.rs`                                       | RS       | **VIOLATION**: HTTP dans unified_memory | EXP       |
| 5   | `src-tauri/src/engines/unified_memory/`        | R2      | `mod.rs`, `summarizer.rs`, `embeddings.rs`     | RS       | HTTP direct (FAIL)                      | EXP       |
| 6   | `src/services/ai/`                             | R3      | providers/                                     | TS       | IPC                                     | QUALIFIED |
| 7   | `src/services/chat/`                           | R3      | `index.ts`                                     | TS       | IPC                                     | QUALIFIED |
| 8   | `src/services/selfHealing/`                    | R3      | `selfHealingObserver.ts`                       | TS       | ⚠️ window.fetch monkey-patch            | EXP       |
| 9   | `src/services/` (autres ~50)                   | R3      | `index.ts`                                     | TS       | IPC                                     | QUALIFIED |
| 10  | `src/lib/tauriClient.ts`                       | R3      | `tauriClient.ts`                               | TS       | IPC (canonical)                         | STABLE    |
| 11  | `src/lib/security.ts`                          | R3      | `security.ts`                                  | TS       | IPC                                     | STABLE    |
| 12  | `src/core/http/httpClient.ts`                  | R3      | `httpClient.ts`                                | TS       | HTTP (bloqué prod)                      | STABLE    |
| 13  | `src/core/commands/TAURI_COMMANDS.ts`          | R3      | —                                              | TS       | Zéro                                    | STABLE    |
| 14  | `src/os/bridge/TauriBridge.ts`                 | R3/R4   | —                                              | TS       | IPC ⚠️ direct                           | EXP       |
| 15  | `src/os/bridge/StateBridge.ts`                 | R3/R4   | —                                              | TS       | IPC ⚠️ direct                           | EXP       |
| 16  | `src/utils/invoke.ts`                          | R3      | —                                              | TS       | IPC (via secureInvoke)                  | QUALIFIED |
| 17  | `src/components/` (52)                         | R4      | `*.tsx`                                        | TSX      | IPC                                     | QUALIFIED |
| 18  | `src/pages/`                                   | R4      | `*.tsx`                                        | TSX      | IPC                                     | QUALIFIED |
| 19  | `src/features/` (24)                           | R4      | `*.tsx`                                        | TSX      | IPC                                     | QUALIFIED |
| 20  | `src/apps/devtools/`                           | R4      | `*.tsx`                                        | TSX      | IPC                                     | EXP       |
| 21  | `src-tauri/src/commands/`                      | R4      | 1283 `#[tauri::command]`                       | RS       | IPC                                     | QUALIFIED |
| 22  | `src-tauri/src/overdrive/chat_orchestrator.rs` | R3      | —                                              | RS       | Network (timeout borné)                 | STABLE    |
| 23  | `src-tauri/src/core/http_types.rs`             | R3      | —                                              | RS       | re-export reqwest                       | STABLE    |
| 24  | `src-tauri/capabilities/` (6 JSON)             | Runtime | —                                              | JSON     | Capabilities                            | STABLE    |
| 25  | `src-tauri/allowlist.whitelist.stable.json`    | Runtime | —                                              | JSON     | Allowlist                               | STABLE    |
| 26  | `.github/workflows/` (44 YML)                  | CI      | ci-unified.yml                                 | YAML     | Actions                                 | QUALIFIED |
| 27  | `scripts/verify/` (20+ sh)                     | CI      | scripts                                        | SH       | FS                                      | QUALIFIED |
| 28  | `scripts/autoheal/`                            | CI      | `autoheal_rules.jsonl`, `detect_recurrence.sh` | JSONL/SH | FS                                      | QUALIFIED |
| 29  | `registry/` (7 JSONL)                          | Docs    | `ui-events.jsonl` etc.                         | JSONL    | FS append-only                          | STABLE    |
| 30  | `docs/MAP_*.md` (8)                            | Docs    | —                                              | MD       | FS                                      | STABLE    |

**Légende statuts:**

- STABLE: prouvé par tests CI verts + docs
- QUALIFIED: prouvé par tests mais env absent localement
- EXP: expérimental / violation connue

---

## Modules avec Tests Couvrants

| Module          | Test(s)                                                       | Coverage       |
| --------------- | ------------------------------------------------------------- | -------------- |
| Engines (R2 TS) | `src/__tests__/architecture/engine-isolation.test.ts`         | Ring integrity |
| IPC             | `tests/contract/tauri-ipc-contract.test.ts`                   | invoke↔command |
| Chat            | `tests/chat/chat.test.ts`, `src/__tests__/chatEngine.test.ts` | Unit           |
| Security        | `tests/security/advanced-security.test.ts`                    | Security       |
| SelfHealing     | `src/services/selfHealing/__tests__/selfHealing.test.ts`      | Unit           |
| UnifiedMemory   | `src/services/unified/__tests__/UnifiedMemory.unit.test.ts`   | Unit           |
| PolicyFirewall  | `src/lib/security/__tests__/policyFirewallV2.test.ts`         | Unit           |
| CI Gates        | `tests/phase2/` → `phase6/`                                   | Gate P2-P6     |
| Performance     | `tests/performance/benchmarks.test.ts`                        | Perf           |
