# 17_ROLLBACK
Rollback commands:
- git restore -- src/features/chat/exportImport.ts
- git restore -- src/features/conversation/exportImport.ts
- git restore -- src/components/sections/ConversationSection.tsx
- git restore -- scripts/autoheal/autoheal_rules.jsonl
- git restore -- proof_packs/CHAT_ARTIFACTS_PRO_FILES_*/

Risk note:
- rollback removes truthful save statuses and restores prior browser-only behavior.
