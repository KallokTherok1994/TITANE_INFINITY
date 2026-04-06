# Rollback Plan

## HEAD anchor
- SHA: 3cf52967f

## Rollback for this continuation scope
```bash
git restore -- e2e/features/governance-center.spec.ts e2e/critical/app-launch.spec.ts e2e/critical/engine-navigation.spec.ts e2e/onboarding.test.ts scripts/autoheal/autoheal_rules.jsonl
```

## Rollback for proof artifacts only
```bash
git restore -- reports/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f.md proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f
rm -rf reports/e2e-desktop/release_online_chat_x3_2026-03-15_1706
```

## Verification after rollback
```bash
TITANE_E2E_FULL=1 TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_PORT=4000 ./node_modules/.bin/playwright test e2e/features/governance-center.spec.ts e2e/critical/app-launch.spec.ts e2e/critical/engine-navigation.spec.ts --project=chromium
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```

## Addendum rollback (2026-03-15 18:24Z)
```bash
git restore -- proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/11_GATE_REPORT.md proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/13_VERDICT.md
```
## Addendum rollback (2026-03-15 19:24Z)
```bash
git restore -- src/entry.ts scripts/autoheal/autoheal_rules.jsonl proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/11_GATE_REPORT.md proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/13_VERDICT.md proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/12_ROLLBACK.md
rm -rf reports/e2e-desktop/release_online_chat_entryfix_20260315T190315Z reports/e2e-desktop/release_online_chat_entryfix_race_20260315T192137Z
```

## Addendum rollback (2026-03-15 20:10Z)
```bash
git restore -- src-tauri/src/ai/ollama.rs scripts/autoheal/autoheal_rules.jsonl \
  proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/11_GATE_REPORT.md \
  proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/12_ROLLBACK.md \
  proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/13_VERDICT.md
rm -rf reports/e2e-desktop/release_online_chat_mallocfix_20260315T194957Z
```

## Addendum rollback (2026-03-15 20:30Z)
```bash
git restore -- scripts/autoheal/autoheal_rules.jsonl \
  proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/11_GATE_REPORT.md \
  proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/12_ROLLBACK.md \
  proof_packs/MASTER_CLOSURE_CONTINUE_2026-03-15_1313_3cf52967f/13_VERDICT.md

# rollback publication commit if required
git revert 023f4d2a8 --no-edit
git push origin MAIN
```
