Rollback command

`git restore -- e2e/helpers/navigation.ts e2e/features/chat-file-generation.spec.ts e2e/features/audio-center.spec.ts scripts/autoheal/autoheal_rules.jsonl reports/e2e-feature-harness-hardening-2026-05-14.md proof_packs/E2E_FEATURE_HARNESS_HARDENING_2026-05-14_v35_1_5/VERDICT.md proof_packs/E2E_FEATURE_HARNESS_HARDENING_2026-05-14_v35_1_5/ROLLBACK.md`

Reason

Restores the prior E2E harness behavior if this Playwright alignment batch must be reverted independently of product code.