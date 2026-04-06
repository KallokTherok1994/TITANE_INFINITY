# 05_SCANS_NETWORK_UI.md — Scan réseau UI

**Generated:** 2026-02-28T16:13:09Z  
**Pack:** PREP_BG_2026-02-28_1613_a8b70c2

## Commande exécutée

```bash
rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket|https?://" src --glob "*.ts" --glob "*.tsx"
```

## Résumé

- **34 fichiers** contiennent au moins une correspondance.
- Après filtrage (hors tests/mocks/commentaires):

### ✅ Non-critiques (strings, templates, commentaires)

| Fichier                                  | Hit                  | Nature                                           |
| ---------------------------------------- | -------------------- | ------------------------------------------------ |
| `src/types/aiModel.ts`                   | URLs endpoints       | Constantes de config (pas d'appel réseau direct) |
| `src/components/ui/LazyImage.tsx`        | data:image URI       | Inline SVG placeholder — OK                      |
| `src/components/ui/button.tsx`           | xmlns URI            | Attribut SVG — OK                                |
| `src/lib/accessibility.ts`               | URLs W3C             | Commentaires JSDoc — OK                          |
| `src/core/holography/HOLOMESH_ENGINE.ts` | xmlns SVG            | Template SVG — OK                                |
| `src/modules/fusion/DatasetBuilder.ts`   | curl string          | Template shell dans string — OK                  |
| `src/hooks/useChat.ts`                   | curl string          | Template shell dans string — OK                  |
| `src/modules/devSudo/devSudoHandler.ts`  | curl localhost:11434 | Texte d'aide dans string — OK                    |
| `src/modules/devSudo/devSudoBuiltins.ts` | curl localhost:11434 | Texte d'aide dans string — OK                    |

### ⚠️ À INVESTIGUER — URLs wikipedia/wikidata

| Fichier                                           | Lignes  | Nature                                         |
| ------------------------------------------------- | ------- | ---------------------------------------------- |
| `src/pages/ResearchPage.tsx`                      | 83-86   | URLs Wikipedia/Wiktionary/Wikidata dans arrays |
| `src/components/sections/ConversationSection.tsx` | 227-236 | URLs Wikipedia/Wikidata + `target_url` field   |

**Action requise:** Vérifier si ces URLs sont consommées via `tauri_invoke` (surface gouvernée) ou directement via `fetch()` dans le browser.

### Verdict fetch() direct

```bash
# fetch() dans non-test src files → ZERO résultats
rg -n "fetch\(" src --glob "*.ts" --glob "*.tsx" | grep -v "test|spec|mock|__tests__"
→ 0 hits
```

✅ Aucun appel `fetch()` direct trouvé hors contexte test.

## Verdict 05

**PASS** (conditionnel) — Aucun `fetch()` direct trouvé en production.  
⚠️ WARN: URLs wikipedia dans ResearchPage/ConversationSection à confirmer via IPC audit.
