# PROOF PACK — SEAL doc_engine DOCX Export v31.1.0

**Date:** 2026-04-23
**Scope:** Export DOCX natif — Phase 1 (Rust) + Phase 2 (IPC) + Phase 3 (UI) + Phase 4 (E2E) + Governance complète
**Verdict:** SEALED

---

## Commits

| Commit | Contenu |
|---|---|
| `b5f53ea18` | Phase 1: docx-rs, ExportFormat::Docx, export_docx() (session précédente) |
| `cfa8e98b1` | Phase 2-3-4: IPC export_docx_file, DocCenterPage /doc-center, Playwright E2E |
| `f29df54fd` | UI_SURFACE_MAP.md: entrée DocCenter |
| `b534772c4` | SEAL: tests enrichis, WDIO, TS fixes, README, RELEASE_SURFACE_INVENTORY, AutoHeal |

---

## Gates PASS

| Gate | Résultat | Détail |
|---|---|---|
| `pnpm run check` | ✅ PASS | 0 erreurs TypeScript |
| Vitest DocCenterPage | ✅ PASS | 12/12 (rendu, IPC succès x2, IPC erreur x2, contrat invoke) |
| Vitest contrat IPC | ✅ PASS | 14/14 (export_docx_file présent dans security.ts) |
| Vitest total | ✅ PASS | 26/26 |
| Rust doc_engine | ✅ PASS | 3/3 (export_docx_file_returns_ok, export_docx_file_bad_dir_returns_error, export_docx_content_type) |
| `detect_recurrence.sh` | ✅ PASS | G_AH_RECURRENCE_GUARD_PASS — 1242 entries |
| `verify_instructions.sh` | ✅ PASS | PASS=33 FAIL=0 |

---

## Fichiers créés / modifiés

### Backend (Rust)
- `src-tauri/src/doc_engine/commands.rs` — commandes IPC Tauri Phase 2
- `src-tauri/src/doc_engine/mod.rs` — exports module
- `src-tauri/src/doc_engine/exporter.rs` — logique docx-rs Phase 1
- `src-tauri/capabilities/export_import.json` — capability sans underscore (Tauri 2.0)
- `src-tauri/src/lib.rs` — registration `export_docx_file`

### Frontend (TypeScript/React)
- `src/pages/DocCenterPage.tsx` — surface UI `/doc-center` avec data-testid stables
- `src/pages/__tests__/DocCenterPage.test.tsx` — 12 tests Vitest
- `src/lib/security.ts` — `export_docx_file` dans ALLOWED_COMMANDS
- `src/App.tsx` — route lazy `/doc-center`
- `src/pages/Experience.tsx` — FIX TS2532 cast explicite
- `src/services/monitoring/syncSupervisor.ts` — FIX TS2550 `.at(0)` → `[0]`

### Tests E2E
- `e2e/doc-center-export-docx.spec.ts` — Playwright E2E
- `e2e/desktop/doc-center-export-docx.wdio.test.js` — WDIO desktop 6 scénarios
- `e2e/desktop/page-objects/uiPages.po.js` — page object docCenter ajouté
- `tests/contract/tauri-ipc-contract.test.ts` — contrat IPC mis à jour

### Governance
- `UI_SURFACE_MAP.md` — entrée DocCenter complète
- `ARCHITECTURE.md` — truth DocCenter IPC + UI
- `docs/CARTOGRAPHY_COMPLETE.md` — DocCenterPage + route /doc-center
- `CHANGELOG.md` — section [31.1.0] 2026-04-23
- `README.md` — Nouveautés v31.1.0, qualité 2026-04-23
- `RELEASE_SURFACE_INVENTORY.md` — addendum v31.1.0
- `scripts/autoheal/autoheal_rules.jsonl` — AH-0001/0002/0003

---

## Selectors data-testid stables

| testid | Surface |
|---|---|
| `doc-center-page` | Racine DocCenterPage |
| `btn-export-docx` | Bouton déclencheur export |
| `doc-export-status` | Statut retour IPC |
| `input-doc-title` | Champ titre document |
| `input-output-dir` | Champ répertoire de sortie |

---

## IPC Contract

```
Command: export_docx_file
Payload: { req: { document: DocContent, output_dir: string } }
Response: { ok: boolean, content: string, error: string | null }
```

---

## Rollback Plan

1. `git revert b534772c4` — rollback governance + tests SEAL
2. `git revert f29df54fd` — rollback UI_SURFACE_MAP
3. `git revert cfa8e98b1` — rollback IPC + UI + Playwright
4. `git revert b5f53ea18` — rollback Rust doc_engine (session précédente)

Pour un rollback partiel IPC seulement :
- Retirer `export_docx_file` de `src/lib/security.ts` ALLOWED_COMMANDS
- Supprimer route `/doc-center` dans `src/App.tsx`
- Retirer `invoke_handler!` entry dans `src-tauri/src/lib.rs`

---

**VERDICT FINAL: SEALED** — v31.1.0 doc_engine DOCX export — 4 commits — gates 100% PASS
