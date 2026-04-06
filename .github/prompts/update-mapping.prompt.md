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

## Output

- Updated mapping files.
- Extract of mapping gate results.
- Rollback commands.
