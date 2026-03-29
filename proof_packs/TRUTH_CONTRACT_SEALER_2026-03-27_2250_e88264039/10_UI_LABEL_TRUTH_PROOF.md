# 10 — UI Label Truth Proof

## UI Truth Source
`src/components/chat/MessageBubble.tsx`

## Evidence
The badge displays the actual provider used:

```tsx
{role === 'assistant' && typeof metadata?.providerUsed === 'string' && (
  <span
    className={`message-provider-badge${
      typeof metadata.requestedProvider === 'string' &&
      metadata.requestedProvider !== 'auto' &&
      metadata.providerUsed !== metadata.requestedProvider
        ? ' message-provider-badge-mismatch'
        : ''
    }`}
    data-testid={`message-provider-badge-${timestamp}`}
    title={`Fournisseur réel: ${metadata.providerUsed}`}
    aria-label={`Fournisseur utilisé: ${metadata.providerUsed as string}`}
  >
    {metadata.providerUsed as string}
    {typeof metadata.requestedProvider === 'string' &&
      metadata.requestedProvider !== 'auto' &&
      metadata.providerUsed !== metadata.requestedProvider && (
        <span
          className="message-provider-mismatch-indicator"
          data-testid={`message-provider-mismatch-${timestamp}`}
          title={`Demandé: ${metadata.requestedProvider}, fallback: ${metadata.providerUsed as string}`}
          aria-label={`Avertissement: demandé ${metadata.requestedProvider}, utilisé ${metadata.providerUsed as string}`}
        >
          {' '}
          ⚠
        </span>
      )}
  </span>
)}
```

## Proof
- Badge shows `metadata.providerUsed` (actual provider)
- Title attribute shows "Fournisseur réel: {provider}"
- Mismatch indicator (⚠) shown when `requestedProvider !== providerUsed`
- CSS class `message-provider-badge-mismatch` applied on mismatch
- ARIA label provides accessible description

## Label Classification
- **Provider badge**: PROVEN_VISIBLE ✅
- **Mismatch indicator**: PROVEN_VISIBLE ✅
- **Title tooltip**: PROVEN_VISIBLE ✅

## Status
**CERTIFIED** ✅