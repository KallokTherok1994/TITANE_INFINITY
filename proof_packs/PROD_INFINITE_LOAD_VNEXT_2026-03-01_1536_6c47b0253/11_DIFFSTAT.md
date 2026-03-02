# DIFFSTAT

```diff
 .vscode/tasks.json                               | 12 +++++
 e2e/chat-provider-decision-certification.spec.ts |  9 ++++
 e2e/critical/app-launch.spec.ts                  | 17 +++++--
 e2e/critical/chat-interaction.spec.ts            |  9 ++++
 e2e/critical/engine-navigation.spec.ts           | 15 ++++--
 e2e/critical/system-resilience.spec.ts           | 11 ++++-
 e2e/critical/visual-engine.spec.ts               | 23 ++++++---
 e2e/features/audio-center.spec.ts                |  9 ++++
 e2e/features/governance-center.spec.ts           |  9 ++++
 e2e/features/memory-tree-viewer.spec.ts          |  9 ++++
 e2e/features/production-health.spec.ts           |  9 ++++
 e2e/feedback-loop.spec.ts                        | 13 +++--
 e2e/omega-pipeline-e2e.spec.ts                   |  9 ++++
 e2e/runtime-validation/chat-ar20.spec.ts         | 11 +++--
 e2e/smoke.test.ts                                |  2 +-
 e2e/user-flows.test.ts                           |  2 +-
 package.json                                     |  2 +-
 playwright.config.ts                             |  6 ++-
 scripts/e2e/vite-e2e-watch.cjs                   |  7 ++-
 src-tauri/src/runtime_config.rs                  |  5 +-
 src/App.tsx                                      | 20 ++++++++
 src/hooks/useChat.ts                             |  3 ++
 src/lib/security.ts                              | 11 +++++
 src/main.tsx                                     | 62 +++++++++++++++++++++++-
 24 files changed, 255 insertions(+), 30 deletions(-)
```

