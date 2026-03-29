# COMMANDS_RUN

```
mkdir -p proof_packs/LOCK1_PROVIDER_FABRIC_STATUS_FIX_2026-03-27_e88264039
pnpm exec vitest run src/services/ai/__tests__/providerFabricStatus.test.ts src/services/ai/providers/__tests__/providerFabricAdapter.test.ts
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```
