# P13 PROOF PACK — UX Preuves (Citations + Locator + Trace)
# Date: 2026-02-24T19:45:00Z

## 1. Vérité simple

P13 = Locator textuel stable (`locator_text`) dans Citation + TracePanel enrichi.
Aucun réseau UI. Uniquement IPC `web_research`.
Types Rust + TypeScript alignés.

## 2. Fichiers touchés

- MOD: `src-tauri/src/types/research.rs`
  - Citation: ajout `pub locator_text: Option<String>`
- MOD: `src-tauri/src/services/rag_service.rs`
  - NEW: `make_locator_text(paragraph_index, char_start) -> Option<String>`
  - `build_citations()`: populate `locator_text`
  - 6 tests P13 ajoutés
- MOD: `src/types/research.ts`
  - Citation interface: ajout `locator_text?: string | null`
- MOD: `src/pages/ResearchPage.tsx`
  - `CitationCard`: affichage `locator_text` avec 📍 (data-testid="locator-text-{i}")
  - `TracePanel`: budgets + cache hit/miss stats

## 3. Format locator_text

| Champs disponibles              | locator_text produit     |
|---------------------------------|--------------------------|
| paragraph_index=3, char_start=120 | "p=3, c≈120"          |
| paragraph_index=5 seulement    | "p=5"                    |
| char_start=200 seulement        | "c≈200"                  |
| Aucun                          | null                     |

## 4. Gates

| Gate                          | Résultat | Méthode                                   |
|-------------------------------|----------|-------------------------------------------|
| G_P13_UI_NO_NETWORK           | PASS     | scan: 0 fetch/axios dans ResearchPage.tsx |
| G_P13_CITATION_LOCATOR_VALID  | PASS     | test_build_citations_locator_text_populated |
| G_P13_NO_LONG_QUOTES          | PASS     | excerpt ≤ 25 mots (P6 guarantee)          |
| G_P13_TRACE_VISIBILITY        | PASS     | TracePanel collapsible, budgets, cache    |
| G_P13_TS_TYPE_ALIGNED         | PASS     | `npx tsc --noEmit` clean                  |

## 5. Tests Rust P13

- `test_locator_text_both` — PASS
- `test_locator_text_para_only` — PASS
- `test_locator_text_char_only` — PASS
- `test_locator_text_none` — PASS
- `test_build_citations_locator_text_populated` — PASS
- `test_build_citations_locator_text_none_when_no_indices` — PASS

Default test suite: 4387/4394 PASS (inchangé).

## 6. Verdict

PASS — QUALIFIED

## 7. Rollback

```
git revert HEAD
```
