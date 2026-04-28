# Rapport — WEB_SEARCH_TESTS_SEAL 2026-04-28

## Identité de la session

| Champ         | Valeur                                                           |
|---------------|------------------------------------------------------------------|
| Date          | 2026-04-28                                                       |
| Branche       | MAIN                                                             |
| HEAD          | `f36143bb9`                                                      |
| Commits       | `ee23eb3c4`, `f36143bb9`                                         |
| Mode          | Durable (Rule 19)                                                |
| Version       | v31.2.31 → v31.2.33 (tests-only, pas de bump — Rule 13 N/A)     |

## Périmètre

Création d'une suite de tests exhaustifs pour deux services critiques du pipeline de recherche web :

- `src/services/webResearchService.ts` — proxy Wikipedia + IPC Tauri + sécurité XSS/injection
- `src/services/chat/toolCaller.ts` — registre d'outils, parsing, exécution, historique

## Gate Report

### Tests Vitest

| Fichier                                              | Tests | Groupes | Résultat |
|------------------------------------------------------|-------|---------|----------|
| `src/services/__tests__/webResearchService.test.ts`  | 55    | 10      | ✅ PASS   |
| `src/services/chat/__tests__/toolCaller.test.ts`     | 43    | 15      | ✅ PASS   |
| **Total**                                            | **98**| **25**  | ✅ PASS   |

**Commande** : `pnpm vitest run src/services/__tests__/webResearchService.test.ts src/services/chat/__tests__/toolCaller.test.ts`

**Sortie terminale** :
```
 ✓  core  src/services/__tests__/webResearchService.test.ts (55 tests) 31ms
 ✓  core  src/services/chat/__tests__/toolCaller.test.ts (43 tests) 39ms

 Test Files  2 passed (2)
      Tests  98 passed (98)
   Duration  1.16s
```

### Gouvernance

| Check                        | Résultat                  |
|------------------------------|---------------------------|
| `verify_instructions.sh`     | ✅ 33/33 PASS              |
| `detect_recurrence.sh`       | ✅ PASS — entries=1395     |

### AutoHeal

| ID                                              | Scope              | Description                             |
|-------------------------------------------------|--------------------|-----------------------------------------|
| `AH-2026-04-28-ADVANCED-TESTS-WEB-SEARCH-0001`  | `src/services/**`  | Création suites initiales (74 tests)    |
| `AH-2026-04-28-ADVANCED-TESTS-OPTIMIZE-0002`    | `src/services/**`  | Optimisation couverture 74→98 tests     |

## Détail des groupes de tests

### webResearchService.test.ts (55 tests, 10 groupes)

1. **webResearch — E2E mock injection** (4 tests) — flag `__TITANE_E2E_WEB_RESEARCH_MOCK`
2. **webResearch — Tauri IPC** (5 tests) — appel `tauri("web_research")`, timeout, offline
3. **webSearch — mode Tauri (IPC)** (6 tests) — `safeInvokeCanonical("web_search")`, contrat
4. **webSearch — mode browser (Tauri indisponible)** (7 tests) — proxy `/api/wiki-search`, erreurs HTTP
5. **browserWebSearch — parseur Wikipedia JSON** (11 tests) — parsing, URLs, srlimit, titres encodés
6. **webSearch — scénarios de sécurité** (4 tests) — XSS, SQL injection, no credentials
7. **webSearch — concurrence et edge cases** (7 tests) — appels simultanés, Unicode JP/AR, bascule auto
8. **webSearch — contrat de réponse WebSearchResponse** (4 tests) — shape ok/content/error
9. **browserWebSearch — stripHtmlTags HTML avancé** (5 tests) — imbrication, attributs, entités
10. **webSearch — content undefined/null Tauri** (2 tests) — contrat IPC sur null/undefined

### toolCaller.test.ts (43 tests, 15 groupes)

1. **registerTool()** (4 tests) — enregistrement, double register, description, exécuteur
2. **getToolDescriptions()** (2 tests) — liste vide, liste complète
3. **parseToolCalls()** (5 tests) — JSON valide, format alternatif, JSON invalide, vide
4. **executeToolCall()** (3 tests) — outil trouvé, outil inexistant, outil qui throw
5. **executeToolCalls()** (1 test) — batch parallèle
6. **web_search intégration** (3 tests) — succès, erreur IPC, résultats vides
7. **calculate** (6 tests) — somme, flottants, parenthèses, XSS, `rm` BLOQUER, division
8. **get_time** (2 tests) — format ISO 8601, timezone UTC
9. **getToolCaller() — singleton** (2 tests) — instance unique, persistance
10. **getCallHistory()** (4 tests) — vide, après succès, après erreur (outil existant), MAX_HISTORY
11. **formatToolResult()** (3 tests) — string, number, objet JSON
12. **get_weather** (2 tests) — succès, ville inconnue
13. **get_stock** (2 tests) — succès, ticker inconnu
14. **MAX_HISTORY enforcement** (1 test) — fenêtre glissante 50 entrées
15. **web_search edge cases** (3 tests) — requête vide, Unicode, très longue requête

## Commits

```
ee23eb3c4  test(web-search): suite complète webResearchService (48 tests, 8 groupes) + toolCaller (26 tests, 9 groupes)
f36143bb9  test(web-search): optimisation couverture 74→98 tests — sécurité/Unicode/contrat/edge cases
```

**Diff session** :
```
 scripts/autoheal/autoheal_rules.jsonl             |   1 +
 src/services/__tests__/webResearchService.test.ts | 134 +++++++++++-
 src/services/chat/__tests__/toolCaller.test.ts    | 255 +++++++++++++++++++++-
 3 files changed, 379 insertions(+), 11 deletions(-)
```

## Rollback Plan

Pour révertir la totalité de la session de tests :

```bash
# Revert les deux fichiers de tests
git checkout $(git log --oneline | grep -A1 "ee23eb3c4" | tail -1 | cut -c1-9) -- \
  src/services/__tests__/webResearchService.test.ts
git rm src/services/chat/__tests__/toolCaller.test.ts

# Revert l'entrée AutoHeal (supprimer dernière ligne)
head -n -2 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_tmp.jsonl
mv /tmp/ah_tmp.jsonl scripts/autoheal/autoheal_rules.jsonl

git commit -m "revert(web-search-tests): rollback suite WEB_SEARCH_TESTS_SEAL_2026-04-28"
git push origin MAIN
```

## VERDICT: SEALED
