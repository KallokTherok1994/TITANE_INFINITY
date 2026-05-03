# Rollback

```bash
cd /tmp/titane_v15_wt_20260311_080118
git restore -- src/hooks/useConversationEngine.ts src/features/chat/ThinkingPanel.tsx src/ui/pages/Chat.tsx src/components/sections/ConversationSection.tsx e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## V24.1 Continuation Rollback (docs-only addendum)

```bash
cd /tmp/titane_v15_wt_20260311_080118
PACK="proof_packs/VISIBLE_REAL_UI_FULLSTACK_PERFECTION_V24_2026-03-11_1205_f99844548"
git restore -- "$PACK/09_RUNTIME_VISIBLE_METRICS.md" "$PACK/10_EXPECTED_VS_OBSERVED.md" "$PACK/11_FAIL_CLASSIFICATION.md" "$PACK/12_AUTO_FIX_AND_HEAL_DECISION.md" "$PACK/13_RERUNS_AND_STABILITY.md" "$PACK/15_GATES_REPORT.md" "$PACK/18_FINAL_VERDICT.md" "$PACK/VERDICT.md" "$PACK/ROLLBACK.md"
```

Status: DONE