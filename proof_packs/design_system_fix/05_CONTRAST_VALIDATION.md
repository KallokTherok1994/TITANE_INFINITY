# 05 CONTRAST VALIDATION

## Regle implemente
`textColor = contrast(background)` avec seuil dynamique:
- mode normal: ratio minimum 4.5
- mode high contrast: ratio minimum 7.0

Implementation: `src/features/design-center/utils/contrast.ts`
- `contrastRatio(foreground, background)`
- `pickReadableTextColor(background)`
- `ensureReadableTextColor(...)`
- `ensureReadableTextColorForBackgrounds(...)`

## Surfaces couvertes
- Background global
- Surface
- Surface elevated
- Boutons preview (primary/accent)
- Cards preview
- Inputs preview
- Labels/status preview

## Preuve automatee
Test ajoute:
`auto-corrects unreadable white-on-white combinations to maintain contrast`

Scenario:
- tokens injectes: background/surface/text = `#ffffff`
- provider runtime applique les vars
- assertion:
  - `--text-primary` != `#ffffff`
  - `contrastRatio(--text-primary, --background) >= 4.5`

Resultat: PASS

## Cas white-on-white
- Interdit par correction runtime: si texte fourni ne respecte pas le seuil, provider force couleur lisible (`#111111` ou `#ffffff` selon ratio).
- Aucun fallback mensonger: correction derivee uniquement de calcul de contraste.