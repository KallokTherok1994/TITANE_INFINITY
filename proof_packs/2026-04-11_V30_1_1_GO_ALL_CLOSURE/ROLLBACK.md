# ROLLBACK

If rollback is required, execute only the minimal scope needed.

## 1) Revert latest closure commits from MAIN

```bash
git revert --no-edit dac95b34853bd30087b2512ae085cd799d6923b4
# revert additional closure commit(s) from this session if present
```

## 2) Restore runtime/stable legacy artifacts (if required)

If v30.0.0 artifacts must be reintroduced, restore from release bundle backups or repository history:

```bash
# Example from git history when tracked
# git checkout <good_commit> -- runtime/stable/Titan-Stable_30.0.0_amd64.AppImage runtime/stable/Titan-Stable_30.0.0_amd64.deb runtime/stable/TITANE-Infinity_30.0.0_amd64.deb
```

## 3) Restore modified working tree files to HEAD (dangerous: tracked files only)

```bash
git restore -- package.json runtime/stable/manifest.json runtime/stable/tauri.conf.json src-tauri/Cargo.lock src-tauri/Cargo.toml src-tauri/src/chat_engine/memory.rs src-tauri/src/chat_engine/mod.rs src-tauri/src/commands/ai_chat.rs src-tauri/src/commands/copilot_commands.rs src-tauri/src/commands/devtools.rs src-tauri/src/commands/engines_commands.rs src-tauri/src/commands/ia_commands.rs src-tauri/src/commands/memory_compactor_commands.rs src-tauri/src/commands/mod.rs src-tauri/src/devtools/api.rs src-tauri/src/devtools/metrics.rs src-tauri/src/main.rs src-tauri/src/tts/mod.rs src-tauri/tauri.base.json src-tauri/tauri.conf.json src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap src/cognitive/knowledge/knowledgeVault.ts tauri.base.json
```

## 4) Re-run mandatory gates

```bash
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
pnpm run check
```
