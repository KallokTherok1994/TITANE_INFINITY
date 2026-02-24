# G6 RUNTIME ASSERTIONS — ONLINE-FINAL

## Gate G6: BLOCKED (environnement sandbox — pas de Tauri runtime disponible)

### Raison
Impossible de lancer le binaire Tauri dans l'environnement CI sandbox.
Conformément à la politique stop-the-line, ce gate est marqué BLOCKED (pas FAIL).

### Assertions attendues (non vérifiables en sandbox)

| Assertion | Condition | Attendu |
|-----------|-----------|---------|
| `internetReachable=true` | réseau disponible | log: `[AI Router v20.1] ✓ Gemini success` ou `has_internet=true` |
| `mode=REMOTE` | provider remote utilisé | `meta.mode = "REMOTE"` |
| `network_used=true` | appel réseau effectué | `meta.network_used = true` |
| `provider_used!=local_only` | provider remote | `meta.provider_used = "gemini"|"openai"|...` |
| `latency > 50ms` | pas de réponse immédiate gated | `latency_ms_total > 50` |

### Assertions alternatives prouvées (via tests unitaires G5)

| Assertion | Preuve | Fichier |
|-----------|--------|---------|
| REMOTE => network_used=true | ✅ INV1.1-1.3 | provider-decision-invariants.test.ts |
| local_only => mode!=REMOTE | ✅ INV3.1-3.3 | provider-decision-invariants.test.ts |
| internetReachable => provider!=local_only | ✅ G5.2.1-2.4 | online-availability.test.ts |
| fallback => reason_code stable | ✅ G5.3.1-3.3 | online-availability.test.ts |
| UI tags from meta | ✅ G5.4.1-4.3 | online-availability.test.ts |

### Remediation pour validation runtime

```bash
VITE_ENABLE_EXTERNAL_AI=1 pnpm dev:tauri
# Envoyer message: "test online"
# Vérifier logs: mode=REMOTE, network_used=true, provider_used=gemini
```
