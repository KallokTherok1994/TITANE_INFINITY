# 10_VISIBLE_TRUTH_MATRIX

| Claim visible UI | Vérité runtime | Classification |
|---|---|---|
| ChatWindow visible | Statiquement OUI, L4 BLOCKED | META_PARTIAL |
| provider='mock' dans réponse | truthful (feature mock active) | META_TRUTH_OK |
| Jauges body/affect masquées | truthful (estimationCount=0) | META_TRUTH_OK |
| Disclaimer "en cours de développement" | truthful | META_TRUTH_OK |
| OMEGA "initialized" | PARTIAL — pipeline fail au runtime | META_PARTIAL |
| Ollama disponible | truthful — endpoint confirmed | META_TRUTH_OK |
| API keys configurées | truthful — Gemini/OpenAI/Anthropic | META_TRUTH_OK |
| Memory active | truthful — UnifiedMemory initialized | META_TRUTH_OK |
| Body analysis active | FAUX — NO_REAL_ANALYSIS | META_LIE_AVAILABILITY (si affiché) |
| Energy level "medium" | SYMBOLIC_ONLY — valeur constante | META_LIE_AVAILABILITY (si affiché) |

Note: Les jauges body/energy ne s'affichent PAS car estimationCount=0 et landmarksDetected=false (fix 536d86574 actif).
Donc la LIE d'availability est masquée côté UI. Mais la data sous-jacente reste symbolique.
