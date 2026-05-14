# Proof Pack — ToolSelectorPanel + Dev Config Fix
**Date** : 2026-05-04  
**Version** : 33.0.4  
**Branch** : MAIN  
**HEAD** : f59a822b1  
**Verdict** : SEALED

---

## Scope

| Artefact | Commits |
|----------|---------|
| `src/features/chat/chatToolsRegistry.ts` | `4ee1443ee` |
| `src/components/chat/ToolSelectorPanel.tsx` + `.css` | `4ee1443ee` |
| `src/components/sections/ConversationSection.tsx` | `5d422810a` |
| `e2e/critical/tool-selector.spec.ts` | `5d422810a` |
| `proof_packs/2026-05-04-tool-selector-seal/` | `be370f10a` |
| `src-tauri/tauri.conf.json` + `scripts/generate-tauri-config.mjs` | `aa1fdafa2` |
| `src/__tests__/components/chat/ToolSelectorPanel.test.tsx` | `8b7f362f2` |
| `src/__tests__/features/chat/chatToolsRegistry.test.ts` | `8b7f362f2` |
| `UI_SURFACE_MAP.md` + `docs/CARTOGRAPHY_COMPLETE.md` | `f59a822b1` |
| `ARCHITECTURE.md` | seal commit |

---

## Gate Results

### G1 — Vitest unit (Rule 16)
```
pnpm vitest run src/__tests__/components/chat/ToolSelectorPanel.test.tsx
                src/__tests__/features/chat/chatToolsRegistry.test.ts

✓ ToolSelectorPanel.test.tsx  (12 tests) 74ms
✓ chatToolsRegistry.test.ts   (13 tests)  9ms
Tests  25 passed (25)   Duration 1.05s
```
**PASS** — 25/25

### G2 — E2E Playwright (Rule 16) × 3 runs isolés
```
TITANE_E2E_FULL=1 npx playwright test e2e/critical/tool-selector.spec.ts --reporter=line

RUN-1: 13 passed (39.4s)
RUN-2: 13 passed (39.4s)
RUN-3: 13 passed (39.3s)
```
**PASS** — 13/13 × 3

### G3 — detect_recurrence (Rule 10)
```
bash scripts/autoheal/detect_recurrence.sh
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=1601
```
**PASS**

### G4 — verify_instructions (Rule 10)
```
bash scripts/verify_instructions.sh
PASS=33 FAIL=0
```
**PASS** — 33/33

### G5 — Git clean (Rule 18)
```
git status --short
 M memory/memory_core_state.json   ← runtime state, non stagé
git log --oneline origin/MAIN..HEAD → (vide — synced)
```
**PASS** — origin/MAIN synced, worktree propre

---

## Mapping docs (Rule 15)

| Doc | Status |
|-----|--------|
| `UI_SURFACE_MAP.md` | ✅ ToolSelectorPanel + data-testids + test paths + counts 25/25 |
| `docs/CARTOGRAPHY_COMPLETE.md` | ✅ ToolSelectorPanel Ring 4 + chatToolsRegistry |
| `ARCHITECTURE.md` | ✅ section 2026-05-04 ajoutée |
| `docs/IPC_CATALOG.md` | N/A — aucune nouvelle commande Rust |
| `OLLAMA_RUNTIME_MAP.md` | N/A — pas de changement Ollama |

---

## AutoHeal entries

| ID | Scope | Date |
|----|-------|------|
| `AH-20260504-TOOL-SELECTOR-0001` | chatToolsRegistry + ToolSelectorPanel + ConversationSection | 2026-05-04 |
| `AH-20260504-TOOL-SELECTOR-E2E-0001` | slash-detection native DOM clear | 2026-05-04 |
| `AH-20260504-DEV-CONFIG-0001` | tauri.conf.json devUrl + beforeDevCommand | 2026-05-04 |

---

## Rollback plan

```bash
# Rollback ToolSelectorPanel
git revert 4ee1443ee  # feat(chat)
git revert 5d422810a  # test(e2e)
git revert be370f10a  # seal
git revert 8b7f362f2  # test(vitest)
git revert f59a822b1  # docs(mapping)

# Rollback dev config only
git revert aa1fdafa2
# Restore tauri dev:
# supprimer devUrl + beforeDevCommand de src-tauri/tauri.conf.json
```

---

## VERDICT : SEALED

Tous les gates G1-G5 PASS. origin/MAIN synced. Mapping docs complets. AutoHeal 3 entrées full-schema. E2E déterministe ×3.
