# 10_ROLLBACK.md — Rollback

```bash
# Rollback complet (avant tout commit)
git restore -- src-tauri/tauri.conf.json
git restore -- src-tauri/src/services/db_service.rs
git restore -- src-tauri/src/conversation_engine/commands.rs
git restore -- src/engines/selfHealing/selfHealingEngine.ts
git restore -- src/services/selfHealing/selfHealingService.ts
git restore -- src/modules/devSudo/devSudoBuiltins.ts
git restore -- src/core/healing/AutoHealEngine.ts
git restore -- src/__tests__/architecture/engine-isolation.test.ts
git restore -- src/engines/cognitive/cognitiveLayoutIntegrations.ts
rm -f src/services/selfHealing/selfHealingIOAdapter.ts
rm -f src/services/cognitive/cognitiveLayoutIntegrations.ts

# Si déjà commité:
git revert HEAD --no-edit
```
