# 02_SCOPE — Périmètre, Rings, Surfaces

**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z

---

## Architecture 4-Ring (Déclarée + Observée)

| Ring | Libellé                  | Dossiers TS                                                             | Dossiers Rust                                                      | Règle                           |
| ---- | ------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------- |
| R1   | Types/Constants          | `src/types/`, `src/constants/`                                          | `src-tauri/src/*/types/`                                           | Zéro imports, zéro I/O          |
| R2   | Engines                  | `src/engines/` (20+ moteurs)                                            | `src-tauri/src/engines/`                                           | Imports R1 uniquement, zéro I/O |
| R3   | Services                 | `src/services/` (56 modules), `src/lib/`, `src/core/`, `src/os/bridge/` | `src-tauri/src/overdrive/`, `src-tauri/src/services/`              | I/O orchestré, imports R1+R2    |
| R4   | UI + Runtime + CI + Docs | `src/components/`, `src/pages/`, `src/features/`, `src/apps/`           | `src-tauri/src/commands/` (1283 commands), `src-tauri/src/main.rs` | Interaction OS/UI               |

### CI/Infrastructure (hors rings applicatifs)

- `.github/workflows/` (44 workflows)
- `scripts/` (CI, verify, guards)
- `e2e/` (Playwright + WDIO)
- `tests/` (Vitest suites)
- `docs/` (Documentation + MAP)

---

## Surfaces Réseau

| Surface              | Localisation                                                                  | Gouvernance                                      | Statut      |
| -------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------ | ----------- |
| Ollama (local:11434) | `src-tauri/src/overdrive/chat_orchestrator.rs`                                | Via reqwest avec timeout                         | ✅ Gouverné |
| Gemini API           | `src-tauri/src/overdrive/chat_orchestrator.rs`                                | Via reqwest avec timeout                         | ✅ Gouverné |
| OpenAI API           | `src-tauri/src/overdrive/chat_orchestrator.rs`                                | Via reqwest avec timeout                         | ✅ Gouverné |
| Anthropic API        | Capabilities config                                                           | Via tauri remote URLs                            | ✅ Déclaré  |
| Frontend httpClient  | `src/core/http/httpClient.ts`                                                 | **BLOQUÉ en runtime prod** (exception explicite) | ✅ Gouverné |
| Ring 2 HTTP (Rust)   | `src-tauri/src/engines/unified_memory/summarizer.rs:315`, `embeddings.rs:216` | **NON gouverné** — I/O dans Ring 2               | ⚠️ RISK     |

---

## Surfaces d'Écriture

| Surface             | Localisation                  | Usage                      |
| ------------------- | ----------------------------- | -------------------------- |
| `reports/`          | racine + `src-tauri/reports/` | Logs runtime               |
| `registry/`         | racine                        | JSONL append-only          |
| `proof_packs/`      | racine                        | Audit proofs               |
| `src-tauri/target/` | Rust build                    | Exclue (gitignore)         |
| `dist/`             | Vite build output             | Exclue (gitignore)         |
| `memory/`           | racine                        | Chat memory persistence    |
| `data/`             | racine + src-tauri            | Données cognitives         |
| `runtime/`          | racine                        | Runtime binaries + configs |

---

## Règles de cette Session

1. **Audit-only** — aucun fichier source modifié
2. **No-fix** — corrections listées dans `13_RECOMMENDATIONS_MINIMAL.md` uniquement
3. **No-skip** — tout invariant non prouvable = BLOCKED
4. **Stop-the-line** si invariant CRITIQUE violé (noter FAIL, continuer l'audit)
5. **Proof-driven** — toute affirmation = commande + log + ligne

---

## Périmètre de l'Audit

| Zone        | Inclus                                                         | Exclus                               |
| ----------- | -------------------------------------------------------------- | ------------------------------------ |
| Source code | `src/`, `src-tauri/src/`                                       | `node_modules/`, `target/`, `dist/`  |
| Config      | `tauri.conf.json`, `package.json`, `Cargo.toml`, capabilities/ | Env secrets                          |
| CI          | `.github/workflows/` (44 fichiers)                             | GitHub Actions runner state          |
| Tests       | Config files (vitest.config.ts, playwright.config.ts)          | Exécution (BLOCKED)                  |
| Docs        | `docs/MAP_*.md`, `registry/`, `proof_packs/`                   | `docs/__AUDITS__/` (27MB, decoratif) |
| LFS         | Inventorié (deployment/, runtime/, docs/)                      | Binaires compilés                    |
