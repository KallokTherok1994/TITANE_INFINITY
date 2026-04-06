# ROUTER MATRIX

| Point d'entrée | Logique décision | Critères | Fallback | Traces | Tests | Runtime prouvé | Statut |
|---|---|---|---|---|---|---|---|
| Frontend `AIOrchestrator.selectProvider()` | NeuralSelection stats-based | success rate, latency, circuit breaker, availability TTL | TitaneLocal (garantie) | ✅ logs provider sélectionné | ⚠️ UNKNOWN | ⚠️ UNKNOWN | **PARTIAL_ROUTER** |
| Backend `AIRouter::new()` (ai/router.rs) | Défaut Ollama model | default_model env var | aucun documenté | ⚠️ minimal | ⚠️ UNKNOWN | ⚠️ UNKNOWN | **MINIMAL** |
| `conversation_generate` → `RouterEngine::classify()` | Classification message type | message content analysis | PolicyEngine | ⚠️ UNKNOWN | ⚠️ UNKNOWN | ⚠️ UNKNOWN | **PARTIAL** |
| `ChatOrchestratorState` `provider` field | Sélection explicite par caller | `ChatRequest.provider: String` | non-auto | ⚠️ log provider | ⚠️ UNKNOWN | ⚠️ UNKNOWN | **EXPLICIT_ONLY** |
| `chat_orchestrator.rs` `send_to_*_internal()` | Provider déjà choisi | HTTP direct vers API cloud | Ollama si cloud fail | ✅ error logs | ⚠️ UNKNOWN | ⚠️ UNKNOWN | **PARTIAL** |

## Observations Critiques

1. **"NeuralSelection"** = marketing name. Implémentation réelle = confidence score basé sur stats historiques (success rate, latency). **Ce n'est pas du routage sémantique ou contextuel.**

2. **`AIRouter::new(None, Some(default_model))`** dans main.rs L906 = initialisation minimale avec le modèle Ollama par défaut. Aucune logique de sélection intelligente démontrée.

3. **`ChatRequest.provider`** est un champ EXPLICITE = le caller frontend choisit le provider. Le backend ne fait pas de routage autonome.

4. **`RouterEngine::classify(&message)`** dans conversation_generate est la partie la plus proche d'un routeur réel mais non audité complètement — classification type de message → provider mapping.

5. **Cascade de fallback frontend**: TauriBackend → Ollama → TitaneLocal (eager) + Cloud (lazy). C'est une cascade de disponibilité, **pas un routage par compétence/contexte**.

## Classification INTELLIGENT_ROUTER

**VERDICT: `PARTIAL_ROUTER`**

**Justification**:
- Cascade de fallback stats-based ✅
- Circuit breaker fonctionnel ✅
- RouterEngine.classify() backend ✅ (code existe)
- Routage sémantique/contextuel = NON PROUVÉ ❌
- Sélection intelligente autonome = NON PROUVÉE ❌
- "NeuralSelection" = label marketing ≠ implémentation IA

> PARTIAL_ROUTER car: infrastructure de fallback solide + classify() présent, mais pas de routage contextuel/sémantique prouvé.
