# 05 — Primary Rupture Point

## Chosen Rupture Point
**Provider Label Conditional Visibility in MessageBubble.tsx**

## Evidence
```tsx
{role === 'assistant' && typeof metadata?.providerUsed === 'string' && (
  <span className={`message-provider-badge${...}`}>
```

The badge is only shown when `metadata?.providerUsed` is a string. If the field is undefined or not a string, no badge is shown.

## Why This Is Highest Leverage
1. **Visibility Gap**: Users may not see which provider was used if the field is missing
2. **Truth Contract Risk**: If `providerUsed` is not propagated correctly, the badge silently disappears
3. **Anti-Lie Impact**: Without a visible badge, users cannot verify provider truth

## Analysis
However, the code in `useChat.ts` shows that `actualProviderUsed` is ALWAYS defined:
```typescript
const actualProviderUsed: string =
  (typeof backendMeta?.provider_used === 'string' && backendMeta.provider_used) ||
  provider;
```

This means `providerUsed` should always be a string. The conditional check is defensive programming, not a contract violation.

## Why No Patch Is Needed
The contract is correctly implemented. The conditional visibility is justified:
- If backend returns no meta, `provider` (the requested provider) is used as fallback
- If backend returns meta with `provider_used`, that value is used
- In both cases, a string is always provided

## What Remains Out Of Scope
- Memory label truth (separate contract, AV-01 fixed)
- Mode label truth (separate contract)
- Effort label truth (separate contract)
- UI cosmetics