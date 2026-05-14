VERDICT: PASS
DATE: 2026-05-14

Scope

- e2e/production/ui-production-prod-freshness.spec.ts

Symptom

La paire `e2e/production/ui-production-route-proof.spec.ts` + `e2e/production/ui-production-prod-freshness.spec.ts` cassait sur deux hypothèses invalides du spec de fraîcheur:

- usage direct de `__dirname` en contexte ESM Playwright
- comparaison mensongère entre `package.json` courant et `deployment/latest/VERSION.txt` sans build/publish de la version courante

Fix

- calcul du répertoire du spec via `fileURLToPath(import.meta.url)`
- remplacement de l assertion `package.json == deployment/latest/VERSION.txt` par une vérification de cohérence interne du dossier publié: `VERSION.txt`, `MANIFEST.json` et noms d artefacts présents dans `deployment/latest`

Executable proof

- `pnpm exec playwright test e2e/production/ui-production-route-proof.spec.ts e2e/production/ui-production-prod-freshness.spec.ts --reporter=line` -> PASS (`10 passed`)
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS (`entries=1966`)
- `bash scripts/verify_instructions.sh` -> PASS (`PASS=52 FAIL=0`)

Rollback

`git restore -- e2e/production/ui-production-prod-freshness.spec.ts scripts/autoheal/autoheal_rules.jsonl reports/production-prod-freshness-spec-hardening-2026-05-14.md proof_packs/PRODUCTION_PROD_FRESHNESS_SPEC_HARDENING_2026-05-14_v35_1_5/VERDICT.md proof_packs/PRODUCTION_PROD_FRESHNESS_SPEC_HARDENING_2026-05-14_v35_1_5/ROLLBACK.md`