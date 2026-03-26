# 03 — TWINS CALL CHAIN

```
user nav → /twins (App.tsx)
  → TwinsPage.tsx (mounts)
    → TwinEvolutionPanel.tsx
      → useTwinIdentity (hooks/useTwinIdentity.ts)
          → numericTwinService.getIdentity()
              → secureInvoke('twin_get_identity', payload)
                  → Tauri IPC → twin_get_identity (twin_commands.rs)
                      → NumericTwinState::get_identity()
      → useTwinEvolution (hooks/useTwinEvolution.ts)
          → numericTwinService.getFusionIndex()
              → secureInvoke('twin_get_fusion_index', payload)
                  → Tauri IPC → twin_get_fusion_index (twin_commands.rs)
                      → NumericTwinState::get_fusion_index()
          → on success: localStorage.setItem('titane_twin_fusion_v1', {
              globalScore, trend, updatedAt: Date.now()
            })
```

All 8 IPC commands registered in main.rs `generate_handler!` macro.
All 8 in ALLOWED_COMMANDS whitelist (src/lib/security.ts).
