# Rollback

```bash
git restore -- \
  src/features/vision/DetectionOverlay.tsx \
  scripts/autoheal/autoheal_rules.jsonl \
  registry/ui-events.jsonl \
  registry/proofpack-index.jsonl

git clean -fd proof_packs/ui_overlay_truth_fix_2026-03-15_0030_1d5518b
```

Rollback is file-scoped and does not affect architecture boundaries.
