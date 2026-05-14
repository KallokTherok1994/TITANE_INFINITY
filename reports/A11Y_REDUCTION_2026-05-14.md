# A11Y Reduction - 2026-05-14

Verdict: PASS

Scope:
- `src/features/chat/ChatProviderSelector.tsx`
- `src/components/chat/ChatModeSelector.tsx`
- `src/components/sections/ConversationSection.tsx`
- `src/ui/components/Toast.tsx`
- `src/__tests__/components/chat/ChatProviderSelector.test.tsx`
- `src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx`
- `src/components/sections/__tests__/ConversationSection.render.test.tsx`
- `src/__tests__/ui/Toast.legacyA11y.test.tsx`

Symptoms closed:
- `titane-conversation` and `dashboard` still carried blocking Axe failures from shared controls.
- Remaining defects were two unnamed selects, an invalid switch ARIA contract on `toggle-audio-tts`, and an invalid labeled toast container.

Applied fix:
- Added stable accessible names to the provider and compact mode selects.
- Realigned `toggle-audio-tts` to a real `role="switch"` + `aria-checked` contract.
- Converted the toast container into a valid live region with compatible labeling.
- Added focused Vitest guards for the four corrected contracts.

Executable proof:
- `runTests` targeted slice: `<summary passed=12 failed=0 />`
- `pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --reporter=line`:
  - `[a11y:titane-conversation] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:dashboard] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:aggregate] blocking=12 baseline=30`
  - `12 passed (48.4s)`
- `pnpm verify:registry`:
  - `Changed files: 14`
  - `No watched files changed - registry sync not required`
  - `registry-integrity: PASS`
  - `registry-quality: PASS`
- `bash scripts/autoheal/detect_recurrence.sh`:
  - `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`
  - `PASS: G_AH_RECURRENCE_GUARD_PASS`
  - `INFO: entries=1968`
- `bash scripts/verify_instructions.sh`:
  - `SUMMARY: PASS=52 FAIL=0`

Residual repo state:
- The aggregate a11y baseline still reports `blocking=12` on other routes (`admin-system`, `dev-overview`, `time`, `monitoring`, `memory`, `governance-center`, `orchestration-center`, `research`). This batch intentionally stayed scoped to the shared controls slice proven on `titane-conversation` and `dashboard`.

Rollback:
- `git restore -- src/features/chat/ChatProviderSelector.tsx src/components/chat/ChatModeSelector.tsx src/components/sections/ConversationSection.tsx src/ui/components/Toast.tsx src/__tests__/components/chat/ChatProviderSelector.test.tsx src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx src/components/sections/__tests__/ConversationSection.render.test.tsx src/__tests__/ui/Toast.legacyA11y.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14.md proof_packs/A11Y_REDUCTION_2026-05-14_CONVERSATION_DASHBOARD`