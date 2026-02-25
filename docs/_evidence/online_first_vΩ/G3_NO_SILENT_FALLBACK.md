# G3 NO SILENT FALLBACK — ONLINE-FIRST vΩ

## Contrat No-Silent-Fallback

Tout fallback doit:
- Afficher une bannière/log UI visible
- Log backend avec reason_code stable
- Log frontend avec code identifiable
- Inclure reason_code non-vide (jamais NONE)

## Exemples logs (runtime + guards)

### Backend clamp (NO_LYING_VIOLATION_BACKEND)
```
[NO_LYING_VIOLATION_BACKEND] NO_LYING_VIOLATION: mode=REMOTE requires network_used=true (got network_used=false, provider=local_only)
→ meta.mode clamped: REMOTE → LOCAL
→ meta.reason_code set to: CONTRACT_VIOLATION_CLAMPED
```

### Frontend guard (NO_LYING_VIOLATION_FRONTEND)
```
[NO_LYING_VIOLATION_FRONTEND] mode=REMOTE but network_used=false — displaying as LOCAL/RESTRICTED
[useConversationEngine] NO_LYING_VIOLATION_FRONTEND: REMOTE+network_used=false {provider: "local_only"}
```

### Fallback policy-blocked (POLICY_BLOCKED)
```
[CONV_SEND] ⚠️ External AI gate BLOCKED: returning immediate REMOTE_BLOCKED response (no 20s wait)
[CONV_RECV] Immediate response (gated) { mode: "LOCAL", reason_code: "POLICY_BLOCKED", provider_used: "local_only", network_used: false, latency_ms: 50 }
```

## Invariants couverts

| Invariant | Guard | Localisation |
|-----------|-------|-------------|
| `mode=REMOTE => network_used=true` | `validateProviderDecisionMeta` + `clampProviderDecisionMeta` | `src/types/providerDecisionMeta.ts` |
| `provider_used=local_only => mode!=REMOTE` | `validateProviderDecisionMeta` | `src/types/providerDecisionMeta.ts` |
| `network_used=false => mode!=REMOTE` | `clampProviderDecisionMeta` | `src/types/providerDecisionMeta.ts` |
| UI: REMOTE+!network_used → log visible | `NO_LYING_VIOLATION_FRONTEND` | `src/hooks/useConversationEngine.ts` |

## Gate G3: PASS
Tous les fallbacks produisent un log identifiable et un reason_code stable.
Aucun fallback silencieux.
