# 10_ROLLBACK_PROVIDER_LOCK

## Complete rollback (all LOCK1 changes)

```bash
git restore -- src/services/api/chat.ts
git restore -- src/services/api/chat.test.ts
git restore -- src/hooks/useChat.ts
git restore -- src/components/ChatWindow.tsx
git restore -- src/components/chat/MessageBubble.tsx
git restore -- src/components/chat/MessageBubble.css
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

Or by commit range:
```bash
git revert 0dd11f69e  # LOCK1 original
git revert <LOCK1-REPAIR commit>
```

## Rollback proof
Removing these changes restores the pre-LOCK1 behavior: UI shows `preferredProviderState` (localStorage value) instead of actual backend provider.
