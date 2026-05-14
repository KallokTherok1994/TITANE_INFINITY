VERDICT: PASS
DATE: 2026-05-14

Scope

- e2e/runtime-validation/chat-ar20.spec.ts

Symptom

Sous runtime Tauri actif, la suite `chat-ar20` validait les cas A, long-message, offline et invalid-keys, mais le scénario `AR20` à `20` messages séquentiels tombait sur le timeout global Playwright avant la fin de la boucle.

Fix

- augmentation du timeout du seul test `AR20` à `6` minutes, cohérente avec `20` tours de boucle et leurs attentes séquentielles

Executable proof

- `TITANE_E2E_TAURI=1 pnpm exec playwright test e2e/runtime-validation/chat-ar20.spec.ts --grep "TEST AR20" --reporter=line` -> PASS avec `AR20 PASS: 20/20 messages answered`
- `TITANE_E2E_TAURI=1 pnpm exec playwright test e2e/runtime-validation/chat-ar20.spec.ts --reporter=line` -> PASS (`5 passed`)
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS (`entries=1967`)
- `bash scripts/verify_instructions.sh` -> PASS (`PASS=52 FAIL=0`)

Rollback

`git restore -- e2e/runtime-validation/chat-ar20.spec.ts scripts/autoheal/autoheal_rules.jsonl reports/runtime-ar20-timeout-hardening-2026-05-14.md proof_packs/RUNTIME_AR20_TIMEOUT_HARDENING_2026-05-14_v35_1_5/VERDICT.md proof_packs/RUNTIME_AR20_TIMEOUT_HARDENING_2026-05-14_v35_1_5/ROLLBACK.md`