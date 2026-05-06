# ROLLBACK — Lock A0 v5
# Date: 2026-05-06

## Rollback Commands

```bash
# Revert A0 v5 commit (after commit is made):
git revert HEAD

# Or restore individual files:
git restore .vscode/settings.json
git restore .github/prompts/OWNERSHIP.md
git restore scripts/verify/verify_prompt_files_index.sh
git restore scripts/verify_instructions.sh
git rm -f docs/research/COPILOT_INSTRUCTION_SYSTEM_SOURCE_MAP.md
git rm -f .github/prompts/autopilot-lock-runner.prompt.md
git rm -f scripts/verify/verify_copilot_instruction_source_map.sh
git rm -f scripts/verify/verify_autopilot_lock_bounds.sh
git rm -rf proof_packs/LOCK_A0_INSTRUCTIONS_SYSTEM_ALIGNMENT_2026-05-06/
git rm -f docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md
```

## Prior Sealed State

Prior seal commit: `b546bcad0` (phase P — agent-tooling gate + prompt frontmatter depth-of-defence)

To return to prior sealed state:
```bash
git revert HEAD   # reverts A0 v5 commit
# Re-add chat.mcp.enabled: true to .vscode/settings.json manually
```

## What This Rollback Removes

- `.vscode/settings.json` regression fix → must be manually re-applied after rollback
- L7 source map (advisory only, no runtime impact)
- autopilot-lock-runner.prompt.md (meta-prompt, no runtime impact)
- 2 new validators (source map + bounds)
- 4 new gates in verify_instructions.sh (PASS 51 → 47)
- OWNERSHIP.md autopilot_allowed column
- prompt index updated to 12 entries (12 → 11)
- proof pack directory
- roadmap status file

## Safety

This rollback is safe. No runtime code was modified. No Tauri, src/, src-tauri/src/,
tests/, e2e/, package.json, Cargo.toml, or deployment/ files were touched.
