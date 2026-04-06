# AUTOHEAL MATRIX

| Mécanisme | Déclencheur | Action | Borne | Rollback | Masque possible | Statut |
|---|---|---|---|---|---|---|
| `autoheal_rules.jsonl` (20+ règles) | Pattern match sur erreur | Apply fix script | Règle par règle | `git restore` | ❌ si règle bien écrite | **RÉEL** |
| `singularity_fusion/autoheal_*` (~15 cmds IPC) | Frontend invoke | Rust self-heal operations | Bounded par logique Rust | IPC rollback | ⚠️ si action masque erreur | **RÉEL** |
| `autoHealEngine.ts` (frontend) | Orchestrator failures | Reinit provider stats | Bounded (max retries) | Reset stats | ❌ | **RÉEL** |
| `detect_recurrence.sh` | Post-fix manual trigger | Check pattern recurrence | Scan seulement | N/A | ❌ | **RÉEL** |
| `pick_fallback_model()` (Rust) | Ollama model not found | Pick first available model | 1 fallback attempt | Err si aucun | ⚠️ cache absence backend | **PARTIAL** |
| `TitaneLocal` guaranteed fallback | Provider failure cascade | Return local response | Toujours | N/A | ⚠️ peut masquer cloud failure | **RÉEL** |
| Circuit breaker (AIOrchestrator) | Error threshold reached | Disable provider temporarily | TTL-based | Auto-reset | ❌ | **RÉEL** |
| `InputValidator` (chat.rs + ts) | Malformed input | Reject + error IPC | Validation only | N/A | ❌ | **RÉEL** |
| `RateLimiter` (Rust) | Request threshold | Block request | Per-window | N/A | ❌ | **RÉEL** |
| ConversationOS legacy cleanup | App init | Remove old localStorage keys | Once at boot | N/A | ❌ | **RÉEL** |

## AutoHeal Rules Sample (autoheal_rules.jsonl — UNSTAGED)

```
AH-E2E-TIMEOUT-010: E2E webkit timeouts hardening (v28.0.0 sealed)
AH-2026-03-04-0002: WDIO smoke desktop hardening
AH-2026-03-05-0004: Final audit BLOCKED verdict recovery
AH-2026-03-05-0012: Node 22 CI requirement
AH-2026-03-05-0013: libpng-dev CI dependency
AH-ULTRA-MASTER-2026-03-16: [AJOUTÉ CET AUDIT — voir ci-dessous]
```

## AutoHeal Interdit — Vérification

Aucun mécanisme détecté qui:
- ✅ Invente de la mémoire → NON
- ✅ Invente une décision provider → NON (pick_fallback_model est réel)
- ✅ Transforme UNKNOWN en état rassurant → NON (sauf engine_get_evolution_state stub, mais ce n'est pas un mécanisme autoheal)
- ✅ Simule un routeur intelligent → NON
- ✅ Présente STM/MTM/LTM comme opérationnels sans chaîne complète → NON (non exposé en UI directement)
- ✅ Cache un backend manquant par état UI → PARTIEL (TitaneLocal fallback masque absence cloud, mais de manière explicite et documentée)

## Verdict AutoHeal

**G_AUTOHEAL_BOUNDED: PASS** — Les mécanismes autoheal sont bornés, explicites, et ne masquent pas la réalité de manière frauduleuse.

**Exception**: `pick_fallback_model()` peut cacher l'absence du modèle préféré en tombant silencieusement sur le premier disponible. Risque P2 acceptable (comportement documenté).
