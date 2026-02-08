# Gates de release (Beta/Stable)

## GATE-UI-BOOT (bloquant)
- React mount prouvé (marker)
- Aucune erreur JS fatale au boot
- ErrorBoundary global non déclenché

## GATE-ZERO-SILENCE (bloquant)
- Aucun écran vide sans message + action
- Chat Always Respond (réponse ou erreur visible)

## GATE-HEALTH-NULLSAFE (bloquant)
- Aucune lecture de propriété sur undefined (tests unit UI + runtime guard)

## GATE-LOCAL-FIRST (bloquant)
- Sans internet : l’app boot et les pages clés fonctionnent en mode dégradé.

## GATE-OBSERVABILITY (bloquant)
- Logs UI persistants + export diagnostic
- Correlation id par action

