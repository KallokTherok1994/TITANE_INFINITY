# VERDICT

- Session: `preprod_final_2026-03-15_2050_5869384`
- `VERDICT_UNIQUE: FAIL`

## Layered Statuses

1. `G_CURRENT_VALIDATION: PASS`
2. `G_TESTS_X3: PASS`
3. `G_E2E_ONLINE_CHAT_PROOF: PASS`
4. `G_BUILD_X3: FAIL`
5. `G_BUILD_SINGLE_EXTENDED: PASS`
6. `G_AH_RECURRENCE_GUARD_PASS: PASS`
7. `G_VERIFY_INSTRUCTIONS: PASS`
8. `PROD_BUILD_STATUS: BLOCKED_APPROVAL`
9. `PROD_DEPLOY_STATUS: BLOCKED_APPROVAL`

## Why FAIL

- Mandatory build profile x3 gate is red (`exit 124` on run 1 with profile timeout 420s), so readiness cannot be upgraded to DONE/SEALED.
- Even with a successful extended single build, canonical x3 build gate remains failed in this session proof.
- Production authorization tokens are absent, so PROD lane stays blocked by approval policy.
