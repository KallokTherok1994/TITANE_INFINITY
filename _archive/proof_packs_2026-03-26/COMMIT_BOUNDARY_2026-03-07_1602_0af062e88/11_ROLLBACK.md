# PHASE 9 - ROLLBACK

Rollback A: unstage Bucket A (if needed before commit)

```bash
git restore --staged \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88 \
	registry/proofpack-index.jsonl \
	registry/heavy-artifacts-manifest.jsonl \
	registry/closure-events.jsonl
```

Rollback B: undo Bucket A commit while preserving worktree

```bash
git reset --soft HEAD~1
```

Rollback C: discard only this lane pack if requested

```bash
git restore -- proof_packs/COMMIT_BOUNDARY_2026-03-07_1602_0af062e88
```

No destructive command used.
