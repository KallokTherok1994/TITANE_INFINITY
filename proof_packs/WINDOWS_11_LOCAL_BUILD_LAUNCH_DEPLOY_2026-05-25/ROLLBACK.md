# Rollback

Rollback for the Windows certification fix set:

```bash
git restore -- .prettierignore package.json vitest.config.ts scripts/post-build.sh src/services/ai/retryStrategy.ts src/__tests__/chatEngine.test.ts src/__tests__/omega/conversation-manager.test.ts src/services/ai/__tests__/ConversationManager.test.ts src/services/orchestration/__tests__/strategies/CognitiveStrategy.test.ts scripts/autoheal/autoheal_rules.jsonl BUILD_PERMISSION_MATRIX.md
git rm -f scripts/test/run-vitest-sharded.mjs
git rm -rf proof_packs/WINDOWS_11_LOCAL_BUILD_LAUNCH_DEPLOY_2026-05-25
```

If MSI install smoke succeeds and a local install is present, uninstall through Windows Apps or the product uninstaller before withdrawing the release proof.

Current install status: `BLOCKED_ADMIN_REQUIRED`; no MSI install completed in this non-admin shell, so uninstall rollback was documented but not executed.
