# ROLLBACK

```bash
git restore -- \
  docs/governance/BASELINE_VERDICT.md \
  src/services/api/chat.ts \
  src/services/conversationEngine.ts \
  src/services/conversationEngine.test.ts \
  src/services/userPreferencesEngine.ts \
  src/services/cognitive/index.ts \
  src/cognitive/progression/xpEngine.ts \
  src/lib/serviceInvoker.ts \
  src/utils/tauriProtector.ts \
  proof_packs/ROUTING_PROOF_UNBLOCK_2026-03-27_e88264039
```

Post-rollback verification:

```bash
pnpm exec vitest run src/services/api/chat.test.ts src/services/conversationEngine.test.ts src/__tests__/provider-decision-invariants.test.ts src/__tests__/online-availability.test.ts
```
