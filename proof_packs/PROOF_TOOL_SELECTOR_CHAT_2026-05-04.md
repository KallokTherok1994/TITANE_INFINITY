# PROOF PACK — Chat Tool Selector Panel — 2026-05-04

## VERDICT: DONE

## Scope
Implémentation complète du sélecteur d'outils chat ⚡ (bouton `tool-selector-btn` + panel `tool-selector-panel`)
avec 10 raccourcis organisés en 4 catégories. Slash-detection (`/` → ouvre panel), autoSend tools,
inject-template tools, pref-save detection. Fix React 18 controlled-textarea reconciliation en real Chromium.

## Commits

| SHA | Message |
|-----|---------|
| `4ee1443ee` | feat(chat): add ToolSelectorPanel — 10-tool selector with slash-detection + pref-save |
| `5d422810a` | test(e2e): add tool-selector E2E spec (13/13 PASS) + fix slash-detection native clear |

## Fichiers livrés

| Fichier | Type | Statut |
|---------|------|--------|
| `src/features/chat/chatToolsRegistry.ts` | Registry pur (10 outils, 4 catégories) | NEW |
| `src/components/chat/ToolSelectorPanel.tsx` | Composant React Ring 4 | NEW |
| `src/components/chat/ToolSelectorPanel.css` | Styles TITANE dark + animation slide-up | NEW |
| `src/components/chat/__tests__/ToolSelectorPanel.test.tsx` | Tests Vitest (14 tests) | NEW |
| `src/features/chat/__tests__/chatToolsRegistry.test.ts` | Tests Vitest (11 tests) | NEW |
| `e2e/critical/tool-selector.spec.ts` | Spec E2E Playwright (13 tests, 6 RUNs) | NEW |
| `src/components/sections/ConversationSection.tsx` | Intégration (state, slash-detection, handleToolSelect, JSX) | MODIFIED |

## Gates

| Gate | Status | Preuve verbatim |
|------|--------|-----------------|
| **G1 — Vitest 25 tests** | ✅ PASS | `Tests 25 passed (25)` — 14 ToolSelectorPanel + 11 chatToolsRegistry |
| **G2 — E2E Playwright 13 tests** | ✅ PASS | `13 passed (40.9s)` — RUN1→RUN6, TITANE_E2E_FULL=1 |
| **G3 — detect_recurrence** | ✅ PASS | `PASS: G_AH_RECURRENCE_GUARD_PASS` — entries=1600 |
| **G4 — verify_instructions** | ✅ PASS | `SUMMARY: PASS=33 FAIL=0` |

## G1 — Vitest verbatim (25/25)

```
 ✓  core  src/components/chat/__tests__/ToolSelectorPanel.test.tsx (14 tests) 81ms
 ✓  core  src/features/chat/__tests__/chatToolsRegistry.test.ts (11 tests) 7ms
 Test Files  2 passed (2)
      Tests  25 passed (25)
   Start at  14:06:38
   Duration  1.06s
```

Tests ToolSelectorPanel (14) :
- rend le bouton déclencheur avec data-testid correct
- le panel est masqué par défaut (isOpen=false)
- affiche le panel quand isOpen=true
- appelle onToggle au clic sur le bouton
- rend toutes les cartes outil quand isOpen=true
- appelle onToolSelect avec le bon outil au clic sur une carte
- appelle onToolSelect avec un outil autoSend=true
- affiche le badge online quand isOnline=true
- affiche "Hors ligne" quand isOnline=false
- affiche le badge deep analysis quand deepAnalysisActive=true
- masque le badge deep analysis quand deepAnalysisActive=false
- appelle onClose au clic extérieur
- appelle onClose sur Escape
- le bouton est disabled quand la prop disabled est true

Tests chatToolsRegistry (11) :
- contient exactement 10 outils
- chaque outil a un id non-vide unique
- chaque outil a une icône non-vide
- chaque outil a un label non-vide
- chaque outil a un templateText non-vide
- chaque outil a une catégorie valide
- les outils autoSend=true ont un templateText complet (pas de placeholder)
- les outils autoSend=false ont un templateText terminant par espace ou "https://"
- la propriété autoSend est un booléen
- contient une entrée pour chaque catégorie valide
- contient les 4 catégories exactement une fois

## G2 — E2E Playwright verbatim (13/13)

```
✓  1 [chromium] › RUN1 — Tool selector button & panel toggle › RUN1-T1 — ⚡ Outils button is visible in chat toolbar (8.9s)
✓  2 [chromium] › RUN1 — Tool selector button & panel toggle › RUN1-T2 — clicking button opens the panel (2.2s)
✓  3 [chromium] › RUN1 — Tool selector button & panel toggle › RUN1-T3 — clicking button again closes the panel (2.6s)
✓  4 [chromium] › RUN2 — Panel content (10 tools, categories, status) › RUN2-T1 — all 10 tool cards are rendered (2.3s)
✓  5 [chromium] › RUN2 — Panel content (10 tools, categories, status) › RUN2-T2 — 4 category labels are present (2.6s)
✓  6 [chromium] › RUN2 — Panel content (10 tools, categories, status) › RUN2-T3 — status bar elements are present (2.1s)
✓  7 [chromium] › RUN3 — Tool selection behaviour (template / autoSend) › RUN3-T1 — inject-template tool pre-fills input without sending (2.4s)
✓  8 [chromium] › RUN3 — Tool selection behaviour (template / autoSend) › RUN3-T2 — analyze_site pre-fills with URL template (2.5s)
✓  9 [chromium] › RUN3 — Tool selection behaviour (template / autoSend) › RUN3-T3 — autoSend tool (quick_summary) sends message automatically (3.5s)
✓ 10 [chromium] › RUN4 — Slash-detection (typing / opens panel) › RUN4-T1 — typing "/" in input opens the panel and clears input (2.0s)
✓ 11 [chromium] › RUN5 — Panel close behaviours › RUN5-T1 — clicking outside the panel closes it (2.2s)
✓ 12 [chromium] › RUN5 — Panel close behaviours › RUN5-T2 — Escape key closes the panel (2.3s)
✓ 13 [chromium] › RUN6 — Full flow: analyze_site → type URL → send › RUN6-T1 — full analyze_site flow produces user message in chat (2.6s)
13 passed (40.9s)
```

## G3 — detect_recurrence verbatim

```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=1600
```

## G4 — verify_instructions verbatim

```
PASS: G_RULE16_TEST_MATRIX_PRESENT
PASS: G_RULE15_FAIL_ON_MISSING_MAPPING
PASS: G_RULE16_BLOCKED_WITHOUT_TESTS
PASS: G_ADVANCED_AGENTS_AUDIT_SCRIPT_PRESENT
PASS: G_VSCODE_AGENT_WORKFLOW_SCRIPT_PRESENT
PASS: G_REGLE_CRITIQUE_ARCHIVED
PASS: G_AH_RECURRENCE_GUARD_PASS
SUMMARY: PASS=33 FAIL=0
```

## AutoHeal entries

| ID | Scope | Fix |
|----|-------|-----|
| `AH-20260504-TOOL-SELECTOR-0001` | chatToolsRegistry.ts + ToolSelectorPanel.tsx + ConversationSection.tsx | Nouvelle surface UI — 10 raccourcis outils accessibles en un clic |
| `AH-20260504-TOOL-SELECTOR-E2E-0001` | tool-selector.spec.ts + ConversationSection.tsx | React 18 controlled-textarea reconciliation fix — native DOM clear avant updateInputValue |

## Conformité Rules

| Rule | Aspect | Verdict |
|------|--------|---------|
| Rule 1 | Minimal patch | ✅ PASS — 2 commits scope-limités, zéro refactor gratuit |
| Rule 2 | Proof before verdict | ✅ PASS — Gates G1-G4 verbatim tous PASS |
| Rule 10 | AutoHeal capture | ✅ PASS — 2 entrées full-schema, IDs uniques |
| Rule 15 | Mapping updates | ✅ PASS — UI_SURFACE_MAP.md + docs/CARTOGRAPHY_COMPLETE.md mis à jour |
| Rule 16 | Tests obligatoires | ✅ PASS — 25 Vitest + 13 E2E, chaque source couverte |
| Rule 17 | Anti-drift surface | ✅ PASS — 1 surface canonique, zéro alias fantôme |
| Rule 18 | Phase commits MAIN | ✅ PASS — 2 commits directs scopés sur MAIN |

## Rollback plan

```bash
# Réversion complète (zéro impact backend/IPC/Rust)
git revert 5d422810a  # Revert E2E spec + slash-detection native clear fix
git revert 4ee1443ee  # Revert ToolSelectorPanel full implementation
```

Impact rollback : 0 IPC modifié, 0 Rust touché, 0 régression backend garantie.

## Git state au seal

```
HEAD: 5d422810a (MAIN)
origin/MAIN: f9455bb06
Worktree: clean (memory_core_state.json untracked — non lié à la feature)
```
