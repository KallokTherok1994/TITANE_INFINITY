# 08_ROLLBACK

## Avant commit

```bash
git restore -- \
  .github/copilot-instructions.md \
  .github/copilot-setup-checklist.md \
  .github/copilot-workflow.mermaid \
  .github/instructions/docs-registry.instructions.md \
  .github/instructions/frontend.instructions.md \
  .github/instructions/tauri.instructions.md \
  .github/instructions/tests-e2e.instructions.md \
  .github/instructions/titane.instructions.md \
  scripts/autoheal/README.md \
  scripts/autoheal/autoheal_rules.jsonl \
  scripts/autoheal/apply_autoheal.sh \
  scripts/autoheal/detect_recurrence.sh \
  scripts/verify_instructions.sh \
  proof_packs/INSTRUCTIONS_PERFECT_2026-03-04_1711_4a3ab09a5/*
```

## Après commit

```bash
git revert <sha>
```

## Contraintes

- Rollback non destructif uniquement.
