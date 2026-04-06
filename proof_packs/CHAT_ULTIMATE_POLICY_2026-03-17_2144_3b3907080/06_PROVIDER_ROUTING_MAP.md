# 06_PROVIDER_ROUTING_MAP

## Providers disponibles

| Provider | Chargement | Ordre scoring | Statut |
|---|---|---|---|
| `titane-local` | Synchrone (fallback ultime) | Dernier (score de base non boosted) | PROVEN_RUNTIME |
| `tauriChat` | Synchrone | Backend Tauri (si disponible) | PROVEN_RUNTIME |
| `ollama` | Synchrone | Priorité auto: après clouds | PROVEN_RUNTIME |
| `openai` | Lazy loaded (`AIProviderLazyLoader`) | Cloud standard | WIRED_BUT_UNPROVEN |
| `claude` | Lazy loaded | Cloud premium | WIRED_BUT_UNPROVEN |
| `gemini` | Lazy loaded | Cloud principal (diversity boost) | WIRED_BUT_UNPROVEN |
| `copilot` | Lazy loaded | Cloud GitHub | WIRED_BUT_UNPROVEN |

## Logique de sélection actuelle

L'orchestrateur utilise un **score numérique** pour sélectionner le provider :
- Score boutons/messages courts → ollama
- Disponibilité/réaltime → titane-local
- Clouds en mode AUTO : gemini → openai → claude → ollama
- Circuit breaker actif (30s malus sur fail récent)
- Diversity threshold (5 locaux consécutifs → force cloud)

**Sécurité** : Aucune injection utilisateur dans la sélection provider (supprimé v21Ω). Sélection score-only.

## Paramètres incompatibles par provider (responsePolicy.ts)

| Provider | Params interdits |
|---|---|
| ollama | reasoning_effort, logprobs, n, presence_penalty |
| titane-local | reasoning_effort, logprobs, n, tools |
| gemini | reasoning_effort, logit_bias, presence_penalty |
| claude | reasoning_effort, logit_bias, n |
| openai | (aucun) |
| copilot | reasoning_effort, n, logit_bias |

## Préférence par profil (responsePolicy.ts)

| Profil | Providers préférés (ordre) |
|---|---|
| DIRECT | ollama, titane-local |
| BALANCED | ollama, gemini, openai, titane-local |
| DEEP | gemini, openai, claude, ollama, titane-local |
| ARCHITECT | gemini, claude, openai, ollama, titane-local |

**Note** : Ces préférences sont définies mais non encore câblées dans l'orchestrateur. L'orchestrateur utilise son scoring natif. Prochaine étape.
