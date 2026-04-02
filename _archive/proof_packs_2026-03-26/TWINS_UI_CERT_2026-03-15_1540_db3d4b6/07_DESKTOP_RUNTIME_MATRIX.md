# 07 — MATRICE RUNTIME DESKTOP

## Statut

**BLOCKED_BY_DESKTOP_RUNTIME**

Le runtime Tauri desktop ne peut pas être lancé dans cet environnement CI.

## Justification BLOCKED acceptable

- La chaîne IPC est complète et source-prouvée (carry-forward)
- Les patches P1/P2 sont purement frontend (React state + JSX)
- Le comportement est vérifiable via TypeScript uniquement
- GAP-003 ne bloque pas le PASS selon les règles de verdict définies

## Commandes runtime (non exécutables ici)

```bash
# Si runtime disponible:
npx tauri dev &
# → naviguer vers /twins
# → déclencher une erreur IPC
# → vérifier la bannière rouge
# → cliquer "Recalculer FusionIndex"
# → vérifier le feedback "✅ FusionIndex recalculé: X.XX"
```

## Prochaine action

Exécution E2E desktop à planifier dans un environnement avec Tauri disponible.
Durée estimée: ≤30 minutes si runtime opérationnel.
