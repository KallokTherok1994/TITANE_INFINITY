# 09 — Trace Propagation Proof

## Propagation Chain
Backend `ProviderDecisionMeta` → Frontend `ConversationResponse.meta` → Hook `metadataPatch.providerUsed` → UI `metadata.providerUsed`

## Evidence

### Step 1: conversationEngine.ts normalizes metadata
```typescript
const normalizedMetadata = normalizeConversationMetadata({
  ...metadata,
  provider_used:
    (typeof raw?.provider === 'string' && raw.provider.trim().length > 0
      ? raw.provider
      : undefined) ??
    (typeof metadata['provider_used'] === 'string'
      ? metadata['provider_used']
      : undefined) ??
    'fallback',
  latency_ms:
    (typeof raw?.latencyMs === 'number' ? raw.latencyMs : undefined) ??
    (typeof metadata['latency_ms'] === 'number' ? metadata['latency_ms'] : 0),
});
```

### Step 2: useChat.ts extracts actual provider
```typescript
const backendMeta = finalResponse.metadata as Record<string, unknown> | undefined;
const actualProviderUsed: string =
  (typeof backendMeta?.provider_used === 'string' && backendMeta.provider_used) ||
  provider;
```

### Step 3: useChat.ts creates metadataPatch
```typescript
const metadataPatch: Record<string, unknown> = {
  // ... other fields ...
  providerUsed: actualProviderUsed,
  requestedProvider: preferredProviderState,
};
```

### Step 4: MessageBubble.tsx displays badge
```tsx
{role === 'assistant' && typeof metadata?.providerUsed === 'string' && (
  <span
    className={`message-provider-badge${...}`}
    title={`Fournisseur réel: ${metadata.providerUsed}`}
  >
    {metadata.providerUsed as string}
  </span>
)}
```

## Proof
- Backend truth (`provider_used`) correctly propagated to frontend
- Frontend correctly normalizes and maps to camelCase (`providerUsed`)
- Hook correctly extracts and propagates to UI
- UI correctly displays the actual provider used

## Status
**CERTIFIED** ✅