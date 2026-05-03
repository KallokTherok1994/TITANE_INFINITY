# 05 — MATRICE DE DÉCISION DES PATCHES

| Patch | Gap ciblé | Risque | Décision | Justification |
|-------|-----------|--------|----------|---------------|
| P1: bannière erreur | GAP-001 | Faible | APPLIQUÉ | Ajout minimal: destructure + div conditionnel |
| P2: feedback AdminTab | GAP-002 | Faible | APPLIQUÉ | Ajout état local + affichage conditionnel |
| P3: E2E desktop | GAP-003 | N/A | NON APPLICABLE | Runtime Tauri indisponible en CI |

## Principes appliqués

- **Patch minimal**: aucune restructuration de composants
- **Réversible**: `git restore` suffit pour rollback complet
- **Pas de nouvelles classes CSS**: styles inline uniquement
- **Pas de nouvelles dépendances**: useState déjà importé

## Changements source

### P1 (GAP-001) — TwinEvolutionPanel principal
```tsx
// Avant
const { identity, isLoading: identityLoading, coreValues, humanStyle } = useTwinIdentity();
// Après
const { identity, isLoading: identityLoading, coreValues, humanStyle, error: identityError } = useTwinIdentity();

// Avant
const { fusionIndex, ..., reinforceValue } = useTwinEvolution();
// Après
const { fusionIndex, ..., reinforceValue, error: evolutionError } = useTwinEvolution();

// Ajouté
const hookError = identityError ?? evolutionError ?? null;
// + bannière rouge conditionnelle dans le JSX
```

### P2 (GAP-002) — AdminTab
```tsx
// Ajouté
const [feedback, setFeedback] = useState<string | null>(null);
const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 4000); };
// handleRecalculate: showFeedback(`✅ FusionIndex recalculé: ${score.toFixed(2)}`)
// handleTransition: showFeedback('✅ Transition de phase effectuée')
// catch: showFeedback(`❌ Erreur: ${...}`)
```
