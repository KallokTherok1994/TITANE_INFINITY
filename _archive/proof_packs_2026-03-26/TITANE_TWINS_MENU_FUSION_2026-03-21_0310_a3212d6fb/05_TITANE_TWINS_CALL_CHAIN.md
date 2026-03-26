# 05_TITANE_TWINS_CALL_CHAIN

## Navigation → UI → Runtime chain

```
TopNav (items) → TITANE entry (slot 1) → /titane → TitanePage
  └─ activeTab = 'symbiose'
  └─ renderActiveSection() → case 'symbiose' → <TwinEvolutionPanel isAdmin={true} compact={false} />
       └─ useTwinEvolution()
            └─ numericTwinService.getEvolutionProfile()  → secureInvoke('twin_get_evolution_profile')
            └─ numericTwinService.getFusionIndex()        → secureInvoke('twin_get_fusion_index')
       └─ useTwinIdentity() (inside TwinEvolutionPanel)
            └─ numericTwinService.getIdentity()           → secureInvoke('twin_get_identity')
       └─ twin_* Tauri commands → src-tauri/src/numeric_twin/twin_commands.rs
            └─ NumericTwinState (managed state) → OperationalTwin / TwinEngine
```

## Chat Context Chain

```
useTwinEvolution.fetchData()
  └─ numericTwinService.getFusionIndex() → fusionIndex.globalScore, trend
  └─ localStorage.setItem('titane_twin_fusion_v1', { globalScore, trend, currentPhase, syncScore, updatedAt })

chatMemorySingleDoor.buildChatContextEnvelope()
  └─ readFreshTwinsFusion()
       └─ localStorage.getItem('titane_twin_fusion_v1')
       └─ stale guard: age > 30min → null
       └─ returns: { globalScore, trend, currentPhase, syncScore, updatedAt }
  └─ envelope.twinsContext = readFreshTwinsFusion()

Rust conversation_engine/commands.rs
  └─ extract_context_binding(context_envelope)
       └─ twins = context_envelope["twinsContext"]
       └─ twinsFusionScore = twins["globalScore"]
       └─ twinsTrend = twins["trend"]
       └─ twinsPhase = twins["currentPhase"]
  └─ build_system_prompt()
       └─ has_twins_context = score > 0.0 && trend != "unknown"
       └─ → "TWINS_CONTEXT: fusion_score={:.2}, trend={trend}, phase={phase}"
```

## Legacy Route Chain (post-fusion)

```
/twins → <Navigate to="/titane" replace />  (Route in App.tsx)
/twin  → <Navigate to="/titane" replace />  (Route in App.tsx)
```

## Classification
- Navigation chain: PASS (menu → TITANE → symbiose tab → TwinEvolutionPanel)
- IPC chain: PROVEN_RUNTIME (twin_* commands unchanged)
- Chat chain: PROMPT_EFFECT_PROVEN / RESPONSE_EFFECT_UNPROVEN (pre-existing, unchanged)
