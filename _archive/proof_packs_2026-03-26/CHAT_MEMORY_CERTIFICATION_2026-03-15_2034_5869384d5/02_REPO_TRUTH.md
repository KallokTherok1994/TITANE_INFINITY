5869384d5 fix(vision): remove decorative overlay mock + seal truth addendum
1d5518b15 audit(ui): certification intégrale UI P1 — ERROR_NOT_SURFACED + MOCK_LEAK fixes
9a322f7a9 fix(e2e+fmt): session crash false PASS → throw + prettier pass
223716fe7 chore(fmt+e2e): prettier pass + e2e robustness improvements
87ad502c5 chore(deploy): resync latest metadata to stable 28.0.0

 scripts/autoheal/autoheal_rules.jsonl     |  4 ++++
 src-tauri/src/commands/memory_commands.rs |  1 +
 src-tauri/src/main.rs                     |  8 +++++---
 src/services/tauriCommands.ts             | 28 ++++++++++++++--------------
 4 files changed, 24 insertions(+), 17 deletions(-)
