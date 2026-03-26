# 03_TWINS_CALL_CHAIN

## Chaîne d'appel complète

```
UI (TwinEvolutionPanel)
  └─ useTwinIdentity() / useTwinEvolution() / useTwinBehavior()
       └─ numericTwinService.getIdentity() / getEvolutionProfile() / submitObservation()
            └─ secureInvoke('twin_get_identity' | 'twin_get_evolution_profile' | 'twin_submit_observation')
                 └─ [One Door Gateway: src/lib/security.ts → secureInvoke]
                      └─ IPC Tauri → main.rs generate_handler![]  ← BLOCAGE RC-001/RC-002/RC-003
                           └─ numeric_twin::twin_commands::twin_get_identity(State<NumericTwinState>)
                                └─ NumericTwinEngine (src-tauri/src/numeric_twin/operational_twin.rs)
                                     ├─ cognitive_modeler.rs
                                     ├─ creative_mirror.rs
                                     ├─ evolution_syncer.rs
                                     └─ identity_collector.rs
```

## Commandes IPC du module (8)

| Commande | Handler Rust | State requis |
|---|---|---|
| `twin_get_state` | `twin_commands::twin_get_state` | `NumericTwinState` |
| `twin_get_fusion_index` | `twin_commands::twin_get_fusion_index` | `NumericTwinState` |
| `twin_submit_observation` | `twin_commands::twin_submit_observation` | `NumericTwinState` |
| `twin_apply_evolution` | `twin_commands::twin_apply_evolution` | `NumericTwinState` |
| `twin_validate_sync` | `twin_commands::twin_validate_sync` | `NumericTwinState` |
| `twin_get_evolution_profile` | `twin_commands::twin_get_evolution_profile` | `NumericTwinState` |
| `twin_get_identity` | `twin_commands::twin_get_identity` | `NumericTwinState` |
| `twin_recalculate_fusion` | `twin_commands::twin_recalculate_fusion` | `NumericTwinState` |

## Contradictions identifiées
- NONE: chaîne cohérente une fois les 3 causes racines corrigées
- La One Door governance est respectée (secureInvoke → IPC → Rust)
- Contrat IPC: les handlers Rust retournent `Result<T, String>` (conforme { ok, content, error } via secureInvoke wrapper)
