A) EXEC_MODE: BACKGROUND (governed, proof-first)
B) SCOPE_RING: Ring4 E2E harness + config governance
C) RISK: HIGH (chat runtime truth not certified)
D) PLAN: discover -> classify lock -> minimal patch -> rerun proofs -> gate verdict
E) PROOFS: 14_TESTS_X3.log, 15_PLAYWRIGHT_X3.log, 16_DESKTOP_E2E_X3.log, 19_GATES_REPORT.md
F) ROLLBACK: see 21_ROLLBACK.md

1. REAL STATE
- HEAD: 0017c1ad2
- Branch: MAIN (clean before patch)
- Single code change: playwright.config.ts
- Lock fixed: Playwright scope drift (e2e-only, .spec-only)

2. CURRENT REAL LOCK
- Next lock after scope fix: tests/e2e/chat.spec.ts is stale versus current UI contract.
- Deterministic failures x3: input[type="text"], .conversation-list, #search-input not found.

3. DEFECT CLASSIFICATION
- Fixed lock: HARNESS (scope and discovery governance)
- Remaining lock: PRODUCT/HARNESS contract drift in legacy chat E2E selectors

4. FILES TOUCHED
- playwright.config.ts
- proof_packs/E2E_DESKTOP_CHAT_PLAYWRIGHT_ULTRA_2026-03-18_0920_0017c1ad2/*
- scripts/autoheal/autoheal_rules.jsonl

5. TESTS ADDED / FIXED
- No new test files added.
- Playwright config widened and segmented to include tests/e2e safely.

6. GATES STATUS
- See 19_GATES_REPORT.md (single source of gate truth).

7. PROOF PACK PATH
- proof_packs/E2E_DESKTOP_CHAT_PLAYWRIGHT_ULTRA_2026-03-18_0920_0017c1ad2/

8. FINAL UNIQUE VERDICT
- HARNESS_PASS_PRODUCT_UNPROVEN
