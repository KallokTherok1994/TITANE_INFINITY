# RUNTIME ERROR CAPTURE

## Symptom (from user capture)
- TITANE shell loads ✓
- Memory page opens ✓
- STM / MTM / LTM cards render ✓ (useMemoryCore path — unaffected)
- Memory tree appears mounted ✓ (devtools local state — unaffected)
- Memory dashboard shows error banner:
  **"Erreur: Erreur de chargement mémoire"**
- Lower UI suggests degraded/demo/backend-inactive mode

## Error Chain Reconstruction

```
[usePersistentMemory] refresh() triggered on mount
  → tauriClient.persistentMemoryRead({ request: { levels, topics, currentMode, ... } })
    → secureInvoke('persistent_memory_read', payload)
      → validateCommand('persistent_memory_read')
        → COMMAND_WHITELIST.includes('persistent_memory_read') === false
        → throw Error("Security: Command 'persistent_memory_read' not in whitelist")
      [THROW]
    [CATCH in secureInvoke]
  [PROPAGATE]
[CATCH in usePersistentMemory.refresh()]
  → setState(prev => ({ ...prev, isLoading: false, error: 'Erreur de chargement mémoire' }))

[MemoryDashboard render]
  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 ...">
        <p className="text-red-400">Erreur: {error}</p>   ← THE BANNER
        <button onClick={refresh}>Réessayer</button>
      </div>
    )
  }
```

## Root Error Location
`src/lib/security.ts` — COMMAND_WHITELIST array, lines ~304-314
Missing entries: `'persistent_memory_read'`, `'persistent_memory_get_bundles'`

## After Patch
Both commands added to whitelist at lines 305-306.
Fix already committed in HEAD `379464342` (v28.0.0) via commit `a8be15a55`.

## Pre-existing TSC Errors (NOT caused by this fix)
- `src/services/ai/chatEngine.ts(539,20): error TS2339: Property 'maxTokens' does not exist on type 'ChatModeConfig'`
- `src/services/ai/chatEngine.ts(1631,20): error TS2339: Property 'maxTokens' does not exist on type 'ChatModeConfig'`
- Confirmed identical before and after our patch. Out of scope.
