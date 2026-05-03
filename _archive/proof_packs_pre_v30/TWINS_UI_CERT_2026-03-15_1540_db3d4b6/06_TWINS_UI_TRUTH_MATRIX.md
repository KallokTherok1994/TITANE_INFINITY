# 06 — MATRICE DE VÉRITÉ UI TWINS

| Invariant | Règle | Statut |
|-----------|-------|--------|
| Zéro silence | Erreur IPC toujours visible pour l'utilisateur | PASS (après patch) |
| IPC contract | { ok, content, error } respecté | PASS |
| ErrorBoundary | TwinsPage dans ErrorBoundary | PASS (carry-forward) |
| data-testid stable | Composants existants inchangés | PASS |
| Pas de fetch direct | Aucun appel réseau direct depuis UI | PASS |
| Pas de nouvelles classes CSS | Styles inline uniquement dans ce patch | PASS |
| TypeScript strict | `npx tsc --noEmit` EXIT 0 | PASS |

## Contrôles source

```bash
grep -n identityError src/components/twin/TwinEvolutionPanel.tsx
# → lignes: destructure + hookError + condition

grep -n evolutionError src/components/twin/TwinEvolutionPanel.tsx
# → lignes: destructure + hookError

grep -n hookError src/components/twin/TwinEvolutionPanel.tsx
# → ligne: const hookError + {hookError && ...}

grep -n feedback src/components/twin/TwinEvolutionPanel.tsx
# → lignes: useState, showFeedback, setTimeout, {feedback && ...}
```
