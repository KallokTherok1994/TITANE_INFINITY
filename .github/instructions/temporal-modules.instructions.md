---
applyTo: 'src/engines/time/**, src/hooks/useTimeAgenda.ts, src/components/runtime/GlobalTemporalContextPublisher.tsx, src/services/chat/chatMemorySingleDoor.ts, src/services/conversationEngine.ts, src/hooks/useConversationEngine.ts, src/pages/TimePage.tsx, tests/**, e2e/**'
---

# Temporal Modules Instructions

## Invariants

- Le module temporel doit rester cohérent sur les cinq moteurs: Time, Agenda, Energy, Priority et ChatScheduler.
- La vérité TIME publiée vers le chat doit rester honnête, fraîche et explicitement bornée.
- Les horaires de travail effectifs doivent refléter le contexte courant, y compris les heures customisées par jour.
- Les commandes agenda issues du chat doivent être parsées, validées, exécutées et journalisées sans faux positif.

## DO

- Utiliser les moteurs `src/engines/time/` comme source canonique pour toute logique temporelle.
- Maintenir `runtimeSource`, `updatedAt`, `currentDateTime`, `timeZone`, `currentSegment` et les compteurs d'événements cohérents dans les payloads TIME.
- Ajouter ou mettre à jour des tests Vitest pour chaque invariant temporel touché.
- Ajouter des preuves UI ou desktop quand la vérité temporelle visible change.
- Vérifier la cohérence des commandes agenda et des vues jour/semaine/mois après mutation.

## DONT

- Ne pas publier un contexte TIME partiel ou figé.
- Ne pas faire dépendre le chat d'une route `/time` si le publisher global suffit.
- Ne pas laisser `getTimeRemainingInWorkHours()` ignorer les heures personnalisées du jour courant.
- Ne pas faire passer une suppression/mise à jour agenda manquante pour un succès.

## Tests requis

- `pnpm vitest run src/engines/time/__tests__/temporal-engine.test.ts`
- `pnpm vitest run src/engines/time/__tests__/agenda-engine.test.ts`
- `pnpm vitest run src/engines/time/__tests__/energy-engine.test.ts`
- `pnpm vitest run src/engines/time/__tests__/priority-engine.test.ts`
- `pnpm vitest run src/engines/time/__tests__/chat-scheduler.test.ts`
- `pnpm vitest run src/services/chat/__tests__/chatMemorySingleDoor.timeContext.test.ts`
- `pnpm vitest run src/components/runtime/__tests__/GlobalTemporalContextPublisher.test.tsx`
- `pnpm vitest run src/__tests__/hooks/useTimeAgenda.test.tsx`
- `pnpm vitest run src/__tests__/pages/TimePage.test.tsx`

## Gates

- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `pnpm run verify:agents:advanced` si un nouvel agent ou un nouveau flux documenté est ajouté

## Rollback

- `git restore -- .github/instructions/temporal-modules.instructions.md src/engines/time src/hooks/useTimeAgenda.ts src/components/runtime/GlobalTemporalContextPublisher.tsx src/services/chat/chatMemorySingleDoor.ts src/services/conversationEngine.ts src/hooks/useConversationEngine.ts src/pages/TimePage.tsx tests e2e`