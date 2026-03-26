# DIFF — Fichiers modifiés

## src/services/conversationEngine.ts

Ajout d'un bloc de détection après le try/catch principal:

```typescript
  // ═══ DETECT TAURI PROTECTOR FALLBACK OBJECT (silent fallback) ═══
  const rawMetaCheck = (raw as Record<string, unknown>)?.meta as
    | Record<string, unknown>
    | undefined;
  const rawProviderCheck = (raw as Record<string, unknown>)?.provider as string | undefined;
  const isTauriProtectorFallback =
    rawMetaCheck?.policy === 'tauri_protector_runtime_fallback' ||
    rawMetaCheck?.reason_code === 'FALLBACK_OFFLINE' ||
    (rawProviderCheck === 'fallback' && rawMetaCheck?.mode === 'ERROR');

  if (isTauriProtectorFallback) {
    // ... tentative orchestrator fallback ...
  }
```
