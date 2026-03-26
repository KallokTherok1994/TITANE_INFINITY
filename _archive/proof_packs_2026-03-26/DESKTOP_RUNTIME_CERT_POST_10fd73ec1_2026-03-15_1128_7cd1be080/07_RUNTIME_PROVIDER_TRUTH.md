# 07_RUNTIME_PROVIDER_TRUTH

## Réponse Q5: Ordre de traversal des providers

### Chemin frontend (generate_response mock):
1. `generate_response` → mock_commands → provider="mock" → "(MOCK) Réponse instantanée"
2. Aucun appel réseau ni Ollama

### Chemin backend (conversation_generate):
1. OMEGA pipeline → FAIL (Pipeline not initialized)
2. Legacy pipeline → AI Router → LOCAL MODE
3. Ollama gemma2:2b → réponse réelle

### Providers disponibles runtime:
- Gemini API key: LOADED ✅
- OpenAI API key: LOADED ✅
- Anthropic API key: LOADED ✅
- Ollama: AVAILABLE ✅ (endpoint already available)
- Mock: ACTIVE (feature mock compilé) ✅

### Réponse Q6: Meta tags UI truthfulness

| Meta claim | Vérité runtime | Classification |
|---|---|---|
| provider='mock' (generate_response) | truthful — mock compilé actif | META_TRUTH_OK |
| Ollama disponible | truthful — endpoint disponible | META_TRUTH_OK |
| API keys chargées | truthful — Gemini/OpenAI/Anthropic chargés | META_TRUTH_OK |
| OMEGA initialisé | PARTIAL LIE — "initialized" loggué mais "Pipeline not initialized" à runtime | META_PARTIAL |
| Memory initialized | "UnifiedMemory initialized (STM/MTM/LTM ready)" | META_TRUTH_OK |

**Classification globale provider/meta: META_PARTIAL** (OMEGA se dit initialisé mais pipeline fail)
