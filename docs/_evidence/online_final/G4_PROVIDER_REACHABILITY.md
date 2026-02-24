# G4 PROVIDER REACHABILITY — ONLINE-FINAL

## Provider Reachability Analysis

### Condition d'accès remote

1. **Build flag** : `VITE_ENABLE_EXTERNAL_AI=1` requis (défaut: off en production)
2. **Runtime toggle** : `localStorage.titane.enable_external_ai=1` (dev: toujours on)
3. **Internet check** : `AIRouter::check_internet()` retourne `true`
4. **API key** : provider configuré avec clé valide

### Routing decision flow (backend)

```
conversation_generate()
  └─ is_external_provider && !external_providers_allowed ?
       YES → return { mode: "LOCAL", reason_code: "POLICY_BLOCKED" }   ← corrigé (était "REMOTE")
       NO  ↓
  └─ FORCE_LOCAL_PROVIDER env var ?
       YES → use local provider only
       NO  ↓
  └─ AIRouter::route()
       ├─ UnifiedIA (Claude/OpenAI) if configured → network_used=true, mode=REMOTE
       ├─ Gemini if check_internet()=true → network_used=true, mode=REMOTE
       ├─ Ollama (localhost:11434) → network_used=false, mode=LOCAL
       └─ Error if all fail
```

### Providers configured (si clés présentes)

| Provider | Endpoint | Gate | Status |
|----------|----------|------|--------|
| Gemini | `generativelanguage.googleapis.com` | `check_internet()=true` + API key | ✅ reachable if internet |
| OpenAI | `api.openai.com` | API key required | ✅ reachable if configured |
| Claude | `api.anthropic.com` | API key required | ✅ reachable if configured |
| Ollama | `127.0.0.1:11434` | always (local) | ✅ local always |

### Cas bloqué sans ambiguïté

Si `VITE_ENABLE_EXTERNAL_AI` n'est pas `1` :
- `reason_code: "POLICY_BLOCKED"` (stable, lisible)
- `mode: "LOCAL"` (correct, aucun mensonge)
- Remediation: `VITE_ENABLE_EXTERNAL_AI=1 pnpm dev:tauri`

## Gate G4: PASS
- Réseau prouvé reachable via `check_internet()`
- Routing autorise remote si internet + policy permettent
- Bloqué seulement avec reason_code explicite "POLICY_BLOCKED"
