# 04_RELEASE_REENTRY_TRIGGERS

A) EXEC_MODE
- `LOCAL`

B) SCOPE_RING
- Déclencheurs légitimes de réouverture release.

C) RISK
- `P1`

D) PLAN (<=7 étapes)
1. Définir les 3 triggers autorisés.
2. Spécifier preuve minimale pour chacun.
3. Spécifier ce qui ne suffit pas.
4. Définir premier geste correct.
5. Définir type de prompt de reprise.

E) PROOFS
- Baseline canon de référence: `proof_packs/PROD_PASS_CANONIZATION_2026-03-07_1519_757ae4d4c9/`
- Release active de référence: `27.2.0`
- Commit baseline: `757ae4d4c9`

F) ROLLBACK
- N/A (cadre de reprise future).

Trigger 1: `EXPLICIT_NEW_RELEASE_SCOPE`
- Preuve minimale requise: objectif release explicite (nouvelle version, nouveau canal, nouvelle cible, nouvelle distribution).
- Ce qui ne suffit pas: "on relance pour vérifier" ou confort opérationnel.
- Premier geste correct: ouvrir un dossier de scope release avec objectifs, impacts, critères de sortie.
- Type de prompt: prompt de lancement d'un nouveau cycle release gouverné.

Trigger 2: `PROVEN_PROD_DRIFT`
- Preuve minimale requise: divergence mesurable par rapport à baseline `27.2.0` / `757ae4d4c9` (version, artefact, hash, invariant).
- Ce qui ne suffit pas: suspicion non corrélée, ressenti, log isolé non reproductible.
- Premier geste correct: produire un diff factuel baseline vs état observé.
- Type de prompt: prompt de diagnostic drift prod borné.

Trigger 3: `CRITICAL_PROD_FAILURE`
- Preuve minimale requise: incident prod sérieux, observable, documenté, impact utilisateur/système explicite.
- Ce qui ne suffit pas: warning mineur sans impact ou incident local non prouvé.
- Premier geste correct: dossier incident avec symptômes, impact, horodatage, artefacts.
- Type de prompt: prompt de réponse incident prod critique (gouverné, scope minimal).
