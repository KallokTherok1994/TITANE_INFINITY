# 09_ROLLBACK

Timestamp: 2026-03-03T13:19:00-05:00

## Objectif

Rollback non destructif, reproductible, limité au périmètre chat/config/UI de cet audit.

## Rollback ciblé (code)

```bash
git restore -- \
	src-tauri/src/chat_engine/config.rs \
	src-tauri/src/chat_engine/memory.rs \
	src-tauri/src/chat_engine/mod.rs \
	src-tauri/src/chat_engine/streaming.rs \
	src-tauri/src/config/mod.rs \
	src-tauri/src/config/update.rs \
	src-tauri/src/commands/security.rs \
	src-tauri/src/main.rs \
	src/lib/security.ts \
	src/lib/tauriClient.ts \
	src/lib/tauriCommands.ts \
	src/pages/ConfigurationHub.tsx \
	src/services/ai/chatEngine.ts \
	src/services/api/chat.ts \
	src/services/tauri/chatEngine.commands.ts \
	src/services/tauriClient.ts \
	registry/ui-events.jsonl
```

## Rollback preuve-pack uniquement

```bash
git restore -- proof_packs/FULL_AUDIT_CHAT_POWER_2026-03-03_1238_95eea7d69
```

## Vérification post-rollback

```bash
git status --porcelain=v1
pnpm test:architecture
```

Critère PASS rollback: statut git conforme attendu + `test:architecture` PASS.

