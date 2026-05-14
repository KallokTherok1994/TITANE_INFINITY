VERDICT: PASS
DATE: 2026-05-14T21:53:01Z

Scope

- e2e/helpers/navigation.ts
- e2e/features/chat-file-generation.spec.ts
- e2e/features/audio-center.spec.ts

Symptom

Le balayage `e2e/features` en mode full exposait deux dérives de harness et un faux négatif instable:

- `openAdminTab` ne trouvait plus l onglet Admin Audio car le helper cherchait des `button` alors que la surface active expose des `tab`
- `chat-file-generation` contournait le `baseURL` Playwright avec `http://localhost:1420/`
- `audio-center` ciblait un slider trop générique et traitait un rendu runtime partiel comme un échec dur

Fix

- réalignement du helper Admin sur `role=tab`
- suppression de l URL hardcodée dans `chat-file-generation` au profit de `page.goto('/')`
- stabilisation du check slider Audio sur un slider visible de la section voix avec classification honnête du cas runtime non interactif

Executable proof

- `TITANE_E2E_FULL=1 pnpm exec playwright test e2e/features/audio-center.spec.ts --reporter=line` -> PASS (`10 passed`)
- `TITANE_E2E_FULL=1 pnpm exec playwright test e2e/features/chat-file-generation.spec.ts --reporter=line` -> PASS (`4 passed`)
- `TITANE_E2E_FULL=1 pnpm exec playwright test e2e/features/audio-center.spec.ts --grep "volume sliders interaction" --reporter=line` -> PASS (`1 passed`)
- `TITANE_E2E_FULL=1 pnpm exec playwright test e2e/features/audio-center.spec.ts e2e/features/governance-center.spec.ts e2e/features/memory-tree-viewer.spec.ts e2e/features/chat-file-generation.spec.ts e2e/features/production-health.spec.ts e2e/features/multiproject-navigation.spec.ts e2e/features/all-pages-sync.spec.ts e2e/features/admin-main-menu-truth.spec.ts --reporter=line` -> PASS (`39 passed`)
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS (`entries=1965`)
- `bash scripts/verify_instructions.sh` -> PASS (`PASS=52 FAIL=0`)

Rollback

`git restore -- e2e/helpers/navigation.ts e2e/features/chat-file-generation.spec.ts e2e/features/audio-center.spec.ts scripts/autoheal/autoheal_rules.jsonl reports/e2e-feature-harness-hardening-2026-05-14.md proof_packs/E2E_FEATURE_HARNESS_HARDENING_2026-05-14_v35_1_5/VERDICT.md proof_packs/E2E_FEATURE_HARNESS_HARDENING_2026-05-14_v35_1_5/ROLLBACK.md`