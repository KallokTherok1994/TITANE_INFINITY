# ROLLBACK

If the shared a11y controls batch regresses, restore the entire slice with:

`git restore -- src/features/chat/ChatProviderSelector.tsx src/components/chat/ChatModeSelector.tsx src/components/sections/ConversationSection.tsx src/ui/components/Toast.tsx src/__tests__/components/chat/ChatProviderSelector.test.tsx src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx src/components/sections/__tests__/ConversationSection.render.test.tsx src/__tests__/ui/Toast.legacyA11y.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14.md proof_packs/A11Y_REDUCTION_2026-05-14_CONVERSATION_DASHBOARD`