# V24 Rollback Plan

If rollback is required:

```bash
cd /tmp/titane_v15_wt_20260311_080118
git restore -- src/features/chat/ThinkingPanel.tsx
git restore -- src/ui/pages/Chat.tsx
git restore -- src/hooks/useConversationEngine.ts
git restore -- src/components/sections/ConversationSection.tsx
git restore -- e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js
git restore -- registry/ui-events.jsonl
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

Optional proof-pack rollback (if explicitly requested):

```bash
cd /tmp/titane_v15_wt_20260311_080118
git restore -- proof_packs/VISIBLE_REAL_UI_FULLSTACK_PERFECTION_V24_2026-03-11_1205_f99844548
```

Status: DONE