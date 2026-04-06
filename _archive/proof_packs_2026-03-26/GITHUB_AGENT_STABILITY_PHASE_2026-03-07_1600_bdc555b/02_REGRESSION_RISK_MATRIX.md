# ANALYSE DES RISQUES DE RÉGRESSION

**Session:** GITHUB_AGENT_STABILITY_PHASE_2026-03-07_1600_bdc555b

---

## Zones de risque identifiées

### Zone 1 — Ajout de nouveaux workflows CI (P1, DÉTECTÉ)

**Risque:** Un nouveau workflow ajouté sans Prettier → cascade de failures  
**Détection existante:** `ci-unified.yml` format:check + `registry-guard.yml`  
**Couverture:** ✅ COMPLÈTE — double détection indépendante  
**AutoHeal:** AH-2026-03-07-0084, AH-2026-03-07-0086, AH-2026-03-07-0087

### Zone 2 — Commandes Rust sans working-directory (P1, DÉTECTÉ)

**Risque:** `cargo build/test` exécuté à la racine du dépôt (pas de Cargo.toml)  
**Détection existante:** `rust.yml` lui-même → FAIL immédiat  
**Couverture:** ✅ Auto-détectant (FAIL visible dès la prochaine exécution)  
**AutoHeal:** implicite dans rust.yml fix

### Zone 3 — Désynchronisation registre (P1, DÉTECTÉ)

**Risque:** Fichier surveillé changé sans mise à jour registry  
**Détection existante:** `registry-guard.yml` + `registry-sync.js`  
**Couverture:** ✅ COMPLÈTE  
**AutoHeal:** AH-2026-03-07-0085

### Zone 4 — Stubs non implémentés (P2, DOCUMENTÉ)

**Risque:** 268 commandes Tauri déclarées mais non enregistrées  
**Détection existante:** cargo check + tests  
**Couverture:** ✅ P2 budget documenté, non bloquant CI  
**AutoHeal:** Hérité sessions précédentes

### Zone 5 — Tests BLOCKED_ENV (P2, DOCUMENTÉ)

**Risque:** Tests qui nécessitent variable d'env spéciale  
**Détection existante:** Documentation dans proof packs  
**Couverture:** ✅ P2 documenté, non bloquant CI

### Zone 6 — CSP unsafe-inline (P2, WAIVÉ)

**Risque:** Directive CSP unsafe-inline dans tauri.conf.json  
**Détection existante:** `csp-baseline-gate.js`  
**Couverture:** ✅ CI waivé explicitement (CSP_ALLOW_UNSAFE=1)

---

## Matrice de risque

| Zone | Sévérité | Détection | État |
|------|---------|-----------|------|
| Nouveau workflow non formaté | P1 | Double (CI + Registry) | COUVERT |
| Cargo sans working-dir | P1 | Auto | COUVERT |
| Registre désynchronisé | P1 | Double (CI + script) | COUVERT |
| 268 stubs P2 | P2 | cargo check | DOCUMENTÉ |
| Tests BLOCKED_ENV | P2 | Proof packs | DOCUMENTÉ |
| CSP unsafe-inline | P2 | Waiver CI | WAIVÉ |

**Bilan: 0 zones non couvertes de niveau P1/P0**

---

## Recommandations futures

1. Envisager un pre-commit hook Prettier pour .github/workflows/ (hors scope session actuelle)
2. Surveiller régression de stubs P2 lors de l'implémentation progressive
3. Maintenir les 102 entrées AutoHeal à jour à chaque fix
