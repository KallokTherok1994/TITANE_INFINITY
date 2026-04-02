# 05 — PATCH DECISION MATRIX

| ISSUE_ID | ROOT_CAUSE_CONFIRMED | MINIMAL_PATCH | WHY_THIS_PATCH | RING | EXPOSED_SURFACE | NETWORK_IMPACT | ALLOWLIST_IMPACT | TESTS_REQUIRED | ROLLBACK | SAFE_TO_APPLY |
|---|---|---|---|---|---|---|---|---|---|---|
| F-003 | YES — `identity?.version` sans fallback | `identity?.version ?? 'N/A'` | Evite "vundefined" pour utilisateur | R4 (UI) | Cosmétique UI | AUCUN | AUCUN | tsc --noEmit | git restore -- src/components/twin/TwinEvolutionPanel.tsx | YES |
| F-004 | YES — absence aria-label | Ajout `aria-label` sur 4 boutons tab | Conformité accessibilité, aucun risque | R4 (UI) | Accessibilité | AUCUN | AUCUN | tsc --noEmit | git restore -- src/components/twin/TwinEvolutionPanel.tsx | YES |
| F-005 | YES — absence data-testid | Ajout `data-testid` panel + 4 tabs | Stabilité sélecteurs E2E | R4 (UI) | Test harness | AUCUN | AUCUN | tsc --noEmit | git restore -- src/components/twin/TwinEvolutionPanel.tsx | YES |
| F-006 | YES — `return null` silence | Remplacer par div message explicite | Evite état vide invisible | R4 (UI) | Cosmétique UI | AUCUN | AUCUN | tsc --noEmit | git restore -- src/components/twin/TwinEvolutionPanel.tsx | YES |
| F-007 | YES — dead code | DEFERRED — pas de défaut utilisateur | Code mort, aucun impact | R3/R4 | Dead code | AUCUN | AUCUN | N/A | N/A | DEFERRED |
| F-008 | YES — gap test | DEFERRED — scope E2E séparé | Hors scope patch session background | R4 test | Test coverage | AUCUN | AUCUN | E2E suite | N/A | DEFERRED |
