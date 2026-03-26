# 15 Rollback

## Full Rollback Command

```bash
git restore -- src/pages/TitanePage-local.css registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl
rm -rf proof_packs/UI_EXCELLENCE_V18_2026-03-11_0934_5573d5646
rm -f .v18_ui_excellence_web_audit.mjs
```

## Scope

- Reverts V18 UI fix, registry entry, autoheal entry, and proof pack artifacts.
