# BOOTSTRAP — MEMORY_PAGE_RUNTIME_HEAL

## Git State
```
Sur la branche MAIN — à jour avec origin/MAIN
SHA: 0ea87b257
Dirty: src/components/MemoryEvolution/MemoryEvolutionCenter.tsx, src/components/chat/DictationButton.tsx (pre-existing)
```

## Toolchain
```
node: v20.20.0 (via nvm)
pnpm: 10.30.2
cargo: 1.94.0 (2026-01-15)
rustc: 1.94.0 (2026-03-02)
tauri CLI: via cargo
```

## Key Files Located
- Memory page: `src/pages/Memory.tsx`
- MemoryDashboard: `src/components/chat/MemoryDashboard.tsx`
- usePersistentMemory: `src/hooks/usePersistentMemory.ts`
- useMemoryCore: `src/hooks/useMemoryCore.ts`
- tauriClient: `src/lib/tauriClient.ts`
- security whitelist: `src/lib/security.ts`
- Rust commands: `src-tauri/src/commands/persistent_memory.rs` (included via main.rs:80)
- Command registration: `src-tauri/src/main.rs` lines 2124-2135

## Error Trace
```
usePersistentMemory.refresh()
  → tauriClient.persistentMemoryRead({ request })
    → secureInvoke('persistent_memory_read', ...)
      → validateCommand('persistent_memory_read')
        → NOT in COMMAND_WHITELIST
          → throw Error("Security: Command not in whitelist")
  catch(err) → setState({ error: 'Erreur de chargement mémoire' })
```
