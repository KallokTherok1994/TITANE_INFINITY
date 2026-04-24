# 12_MODULE_AUDIT_MATRIX — Matrice des Modules

**Proof Pack:** AUDIT_MODULES_2026-03-05_1433_0f7d943  
**Timestamp:** 2026-03-05T14:33:25Z

---

## Matrice Complète

| #   | Module                     | Ring    | Entrypoints                                    | Dépendances Sortantes      | I/O                                        | Surfaces Réseau                             | Statut       | Observations / Risques                                                                             |
| --- | -------------------------- | ------- | ---------------------------------------------- | -------------------------- | ------------------------------------------ | ------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| 1   | `src/types/`               | R1      | `index.ts`, `aiModel.ts`, `conversation.ts`    | Aucune (R1 = zéro imports) | Aucune                                     | Aucune                                      | STABLE       | ✅ Contrat pur. URL endpoints définis comme constantes (pas d'appels)                              |
| 2   | `src/constants/`           | R1      | Inclus dans types/                             | Aucune                     | Aucune                                     | Aucune                                      | STABLE       | ✅                                                                                                 |
| 3   | `src/engines/`             | R2      | `index.ts` + 20+ sous-engines                  | R1 (types) uniquement      | **RISK**: engines/unified_memory font HTTP | Ollama (localhost:11434) via Rust           | QUALIFIED    | ⚠️ FIX-002: `summarizer.rs`, `embeddings.rs` (R2→HTTP violation)                                   |
| 4   | `src/services/`            | R3      | `ai/`, `chat/`, `audio/`, `memory/`            | R1+R2                      | FS/IPC/Audio                               | Via IPC canonique                           | QUALIFIED    | ⚠️ FIX-003: `selfHealingObserver.ts` monkey-patch fetch                                            |
| 5   | `src/lib/`                 | R3      | `tauriClient.ts`, `security.ts`                | R1                         | IPC                                        | Via tauriClient                             | STABLE       | ✅ Canonical client bien défini. `security.ts` utilisé par providers                               |
| 6   | `src/core/`                | R2/R3   | `http/httpClient.ts`, `bridge/`, `commands/`   | R1+R2                      | HTTP (bloqué en prod)                      | BLOQUÉ en runtime prod                      | QUALIFIED    | ✅ httpClient bloque frontend HTTP. ⚠️ FIX-003: bridges invoke direct                              |
| 7   | `src/os/bridge/`           | R4      | `TauriBridge.ts`, `StateBridge.ts`             | R1-R3                      | IPC                                        | Via Tauri IPC                               | EXPERIMENTAL | ⚠️ FIX-003: `invoke()` direct hors canonical client                                                |
| 8   | `src/components/`          | R4      | `ChatWindow.tsx`, `ErrorBoundary.tsx`, etc.    | R1-R3                      | IPC/UI                                     | Via tauriClient                             | QUALIFIED    | ✅ Pas de fetch direct. ErrorBoundary présent                                                      |
| 9   | `src/pages/`               | R4      | `ResearchPage.tsx`, etc.                       | R1-R4                      | UI/IPC                                     | URLs Wikipedia (pour IPC)                   | EXPERIMENTAL | ⚠️ FIX-007: URLs externes construites dans `ConversationSection.tsx` — vérifier si passent par IPC |
| 10  | `src/features/`            | R4      | `governance-center/`, etc.                     | R1-R4                      | UI/IPC                                     | Clés API (Gemini, OpenAI)                   | EXPERIMENTAL | ⚠️ FIX-008: APIProviderCard configure des providers externes                                       |
| 11  | `src/config/`              | R3      | `offline-first.ts`, `index.ts`                 | R1                         | Config                                     | `httpClient.head()` pour connectivity check | QUALIFIED    | ✅ Passe par httpClient gouverné                                                                   |
| 12  | `src-tauri/src/commands/`  | R4      | `core_system.rs`, `persistent_memory.rs`       | R1-R3 Rust                 | IPC/FS                                     | Aucune directe                              | STABLE       | ✅ Commands bien définies, `Result<T, String>`                                                     |
| 13  | `src-tauri/src/overdrive/` | R3      | `chat_orchestrator.rs`                         | R1-R2 Rust                 | HTTP (reqwest, bounded)                    | Ollama (11434), Gemini, OpenAI              | QUALIFIED    | ✅ HTTP avec timeouts bornés (build_http_client_with_timeout). ONE DOOR                            |
| 14  | `src-tauri/src/engines/`   | R2      | `unified_memory/`, `cognitive/`, etc.          | R1 Rust                    | **RISK**: HTTP dans unified_memory         | Ollama local                                | EXPERIMENTAL | ⚠️ FIX-002: summarizer.rs + embeddings.rs = I/O dans Ring 2                                        |
| 15  | `src-tauri/src/ipc/`       | R3/R4   | IPC handlers                                   | R1-R3 Rust                 | IPC                                        | Via tauri                                   | QUALIFIED    | ✅                                                                                                 |
| 16  | `src-tauri/src/services/`  | R3      | AI/audio/memory services                       | R1-R2                      | FS/HTTP                                    | Via overdrive gateway                       | QUALIFIED    | ✅ Délèguent au overdrive pour réseau                                                              |
| 17  | `src-tauri/capabilities/`  | Runtime | 6 JSON files                                   | Tauri config               | Config seule                               | Whitelist URLs explicite                    | STABLE       | ✅ Allowlist bien définie par feature                                                              |
| 18  | `scripts/verify/`          | CI      | `enforce-tauri-only.sh`, etc.                  | Shell/Node                 | FS                                         | Aucune                                      | STABLE       | ✅ Gates de vérification présentes                                                                 |
| 19  | `scripts/autoheal/`        | CI      | `autoheal_rules.jsonl`, `detect_recurrence.sh` | Shell/JSON                 | FS                                         | Aucune                                      | STABLE       | ✅ 3 règles AutoHeal existantes                                                                    |
| 20  | `e2e/`                     | CI      | `e2e/desktop/`, `e2e/playwright/`              | Playwright/WDIO            | Runtime Tauri                              | Tauri IPC                                   | EXPERIMENTAL | ⚠️ BLOCKED_E2E_RUNTIME sans runtime compilé                                                        |
| 21  | `tests/`                   | CI      | `vitest.config.ts`, suites                     | Vitest                     | FS/Mock                                    | Mocked                                      | QUALIFIED    | BLOCKED: node_modules absent                                                                       |
| 22  | `.github/workflows/`       | CI      | `ci-unified.yml`, 40+ workflows                | GitHub Actions             | Cloud CI                                   | Aucune directe                              | STABLE       | ✅ CI complet. Beaucoup de workflows décoratifs (cosmiques)                                        |
| 23  | `docs/`                    | Docs    | `MAP_*.md`, etc.                               | Markdown                   | FS                                         | Aucune                                      | STABLE       | ✅ Cartographie présente. 179MB total (LFS)                                                        |
| 24  | `registry/`                | Docs    | `ui-events.jsonl`, `repo-events.jsonl`         | JSON                       | FS append-only                             | Aucune                                      | STABLE       | ✅ Registres append-only présents                                                                  |
| 25  | `src/utils/invoke.ts`      | R3      | Wrappers invoke                                | `@tauri-apps/api`          | IPC                                        | Via Tauri                                   | EXPERIMENTAL | ⚠️ FIX-004: Wrapper parallèle au tauriClient canonical                                             |

---

## Top Risques par Ring

| Ring | Risque Principal                           | FIX Associé |
| ---- | ------------------------------------------ | ----------- |
| R2   | I/O HTTP dans engines (Rust)               | FIX-002     |
| R3   | Monkey-patch fetch (selfHealingObserver)   | FIX-001     |
| R3   | Wrapper invoke parallèle (utils/invoke.ts) | FIX-004     |
| R4   | invoke() direct dans bridges               | FIX-003     |
| R4   | URLs externes dans pages                   | FIX-007     |
| CI   | Nombreux workflows décoratifs              | FIX-009     |

---

## Distribution par Statut

| Statut       | Modules | %   |
| ------------ | ------- | --- |
| STABLE       | 9       | 36% |
| QUALIFIED    | 9       | 36% |
| EXPERIMENTAL | 7       | 28% |

**Note**: EXPERIMENTAL ≠ défaillant. Indique nécessité de gate/proof supplémentaire.
