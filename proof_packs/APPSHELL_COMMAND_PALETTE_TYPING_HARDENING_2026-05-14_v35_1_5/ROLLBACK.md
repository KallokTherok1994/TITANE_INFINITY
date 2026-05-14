# ROLLBACK

If the AppShell / Command Palette hardening regresses, restore the entire slice with:

`git restore -- src/utils/lazyWithRetry.ts src/App.tsx src/components/sections/ConversationSection.tsx src/pages/DevPage.tsx src/components/shadcn/command.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/appshell-command-palette-typing-hardening-2026-05-14.md proof_packs/APPSHELL_COMMAND_PALETTE_TYPING_HARDENING_2026-05-14_v35_1_5`