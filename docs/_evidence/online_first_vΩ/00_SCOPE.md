# SCOPE LOCK — ONLINE-FIRST vΩ

## But
Implémenter le Truth Contract ONLINE-FIRST avec invariants codés, guards backend+frontend,
tests unitaires bloquants, et le plan Network Diagnostic Engine (4-Ring doc-only).

## Fichiers / Rings potentiellement impactés

| Ring | Fichiers | Statut |
|------|----------|--------|
| Ring 1 (Types) | `src/types/providerMeta.ts`, `src/types/providerDecisionMeta.ts` (nouveau) | IMPACTÉ |
| Ring 3 (Services) | `src/services/conversationEngine.ts` | IMPACTÉ (bug REMOTE+network_used=false) |
| Ring 4 (UI/Hooks) | `src/hooks/useConversationEngine.ts` | IMPACTÉ (guard frontend) |
| Tests | `src/__tests__/provider-decision-invariants.test.ts` (nouveau) | NOUVEAU |
| Docs | `docs/01_architecture/NETWORK_DIAGNOSTIC_ENGINE_4RING.md` | NOUVEAU |
| Evidence | `docs/_evidence/online_first_vΩ/` | NOUVEAU |

## Interdits
- ❌ Modification allowlist/capabilities
- ❌ Ajout gestion WiFi OS-level
- ❌ Refactor esthétique gratuit
- ❌ Build PROD sans gate explicite

## Stop conditions
- FAIL si test skippé ou absent
- FAIL si touche allowlist/capabilities sans instruction
- FAIL si impossibilité de produire les preuves
