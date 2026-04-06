# 03_TWINS_SCOPE_MAP

## Surface Map

| Surface | Value |
|---------|-------|
| route (legacy) | /twins |
| route (new) | /titane (tab: symbiose) |
| page | src/pages/TwinsPage.tsx (preserved, no longer routed from nav) |
| panel | src/components/twin/TwinEvolutionPanel.tsx |
| tab (new host) | TitanePage > symbiose tab |
| tab testid | tab-symbiose |
| panel testid | titane-panel-symbiose |

## Hooks
| hook | file | purpose |
|------|------|---------|
| useTwinIdentity | src/hooks/useTwinIdentity.ts | loads TwinIdentityCore via numericTwinService |
| useTwinEvolution | src/hooks/useTwinEvolution.ts | loads evolution profile + fusion index; persists to localStorage |
| useTwinBehavior | src/hooks/useTwinBehavior.ts | (referenced, not inspected in detail) |

## Services
| service | file | IPC commands called |
|---------|------|---------------------|
| numericTwinService | src/services/api/numericTwin.ts | twin_get_state, twin_get_fusion_index, twin_submit_observation, twin_apply_evolution, twin_validate_sync, twin_get_evolution_profile, twin_get_identity, twin_recalculate_fusion |

## Backend
| command | file | status |
|---------|------|--------|
| twin_get_state | src-tauri/src/numeric_twin/twin_commands.rs | REGISTERED |
| twin_get_fusion_index | idem | REGISTERED |
| twin_submit_observation | idem | REGISTERED |
| twin_apply_evolution | idem | REGISTERED |
| twin_validate_sync | idem | REGISTERED |
| twin_get_evolution_profile | idem | REGISTERED |
| twin_get_identity | idem | REGISTERED |
| twin_recalculate_fusion | idem | REGISTERED |

## Chat Integration
| point | mechanism | status |
|-------|-----------|--------|
| Context write | useTwinEvolution → localStorage `titane_twin_fusion_v1` | PROVEN_RUNTIME |
| Context read | chatMemorySingleDoor `readFreshTwinsFusion()` with 30min stale guard | PROVEN_RUNTIME |
| Envelope field | `envelope.twinsContext` → globalScore, trend, currentPhase, syncScore | PROVEN_RUNTIME |
| System prompt | conversation_engine extracts twinsFusionScore/twinsTrend/twinsPhase → TWINS_CONTEXT string | PROMPT_EFFECT_PROVEN |
| LLM response effect | non-deterministic | RESPONSE_EFFECT_UNPROVEN |

## Host Section (post-fusion)
**Target TITANE host section:** TitanePage > symbiose
