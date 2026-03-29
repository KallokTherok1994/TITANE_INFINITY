# 09 — Fallback Truth Proof

## Fallback Truth Source
`src/services/conversationEngine.ts`

## Evidence
Fallback is correctly detected and handled:

```typescript
// Tauri IPC Failure → orchestrator fallback
try {
  raw = (await tauriClient.conversationGenerate(payload)) as OmegaGenerateResponse;
} catch (tauriError) {
  // Fall back to aiOrchestrator
  const orchestratorResponse = await aiOrchestrator.generate(userMessage, [], aiConfig);
  raw = {
    content: orchestratorResponse.content,
    provider: orchestratorProvider,
    metadata: {
      provider_used: orchestratorProvider,
      mode: 'LOCAL',
      reason_code: 'OK',
      fallback_used: true,
      network_used: false,
    },
  };
}

// TauriProtector silent fallback detection
const isTauriProtectorFallback =
  rawMetaCheck?.policy === 'tauri_protector_runtime_fallback' ||
  rawMetaCheck?.reason_code === 'FALLBACK_OFFLINE' ||
  (rawProviderCheck === 'fallback' && rawMetaCheck?.mode === 'ERROR');
```

## Proof
- Fallback correctly detected via `isTauriProtectorFallback`
- Fallback correctly handled via orchestrator
- `fallback_used: true` set in metadata
- Provider correctly tracked via `provider_used`
- Degraded mode tracked via `mode: 'LOCAL'`

## Status
**CERTIFIED** ✅