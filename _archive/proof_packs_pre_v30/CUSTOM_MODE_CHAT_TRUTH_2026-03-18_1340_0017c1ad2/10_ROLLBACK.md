# ROLLBACK

## Rollback command (instant, full revert of this session's changes)

```bash
git restore -- src/config/chatModes.config.ts src/components/sections/ConversationSection.tsx
```

## Effect of rollback

- `registerCustomMode` export removed from `chatModes.config.ts`
- `getSystemPrompt` reverts to built-in-only lookup
- ConversationSection reverts to not registering custom modes
- Custom modes revert to silent FALLBACK_MASKING behavior (pre-fix state)

## No data loss

- `localStorage['titane_custom_modes']` is NOT affected by rollback
- User-created modes are preserved in browser storage
