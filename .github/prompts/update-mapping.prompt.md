# Prompt: Update Mapping

## Scope

Refresh mapping docs and mapping proofs after architecture/surface changes.

## Inputs

- `docs/MAP_*.md`
- `reports/MAP_PROOFS.log`
- code diffs touching architecture, IPC, or network surfaces

## Steps

1. Update impacted MAP documents only.
2. Run `bash scripts/map_refresh.sh`.
3. Verify mapping gates are PASS.
4. AutoHeal gate (Rule 10 — mandatory even for mapping-only sessions):

```bash
bash scripts/autoheal/detect_recurrence.sh  # must exit 0
bash scripts/verify_instructions.sh          # must exit 0
```

5. Append AutoHeal entry to the canonical AutoHeal registry (Rule 10) if any file was modified.

## Output

- Updated mapping files.
- Extract of mapping gate results.
- AutoHeal entry confirmation.
- Rollback commands.
