# DIFF_FILES

## git diff --stat
 .clinerules/05-truth-surface.md                |  60 +++++-----
 docs/AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26.md |  31 +++--
 e2e/desktop/online-chat-proof-ui.wdio.test.js  | 155 +++++++++++++++++++++++++
 registry/proofpack-index.jsonl                 |   6 +
 scripts/autoheal/autoheal_rules.jsonl          |   6 +-
 scripts/benchmark.sh                           |   0
 scripts/e2e/run-memory-chat-proof-ui.sh        |   0
 scripts/e2e/run-online-chat-proof-ui.sh        |   0
 scripts/fix-prod-v27.0.2.sh                    |   0
 scripts/install/install-e2e.sh                 |   0
 scripts/post-build.sh                          |   0
 scripts/prepare-ollama-bundle.sh               |   0
 scripts/publish/publish-v27.2.0.sh             |   0
 scripts/setup-dev.sh                           |   0
 scripts/test-all.sh                            |   0
 src-tauri/capabilities/persistence.json        |   1 +
 src-tauri/src/main.rs                          |   1 +
 src-tauri/src/persistence/commands.rs          |  31 +++++
 src-tauri/src/system/persona_engine/mod.rs     |   8 +-
 src-tauri/tauri.conf.json                      |   3 +
 src/lib/security.ts                            |   2 +
 21 files changed, 252 insertions(+), 52 deletions(-)
