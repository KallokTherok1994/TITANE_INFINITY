# 08 DIFF FILES

## Fichiers modifies (scope design)
1. `src/App.tsx`
   - ajout `UIThemeProvider` global autour de l'application.

2. `src/features/design-center/DesignCenterPage.tsx`
   - ajout `useUIThemeOptional()` pour eviter provider imbrique.

3. `src/features/design-center/providers/UIThemeProvider.tsx`
   - ajout utilitaires contraste
   - ajout aliases CSS canoniques
   - ajout variables `--color-text-on-*`
   - export `useUIThemeOptional`

4. `src/features/design-center/tabs/DesignSystemTab.tsx`
   - preview passe en couleurs texte lisibles auto-corrigees.

5. `src/features/design-center/__tests__/DesignCenter.truth-chain.test.tsx`
   - tests aliases canoniques
   - test white-on-white auto-correct + ratio

6. `src/features/design-center/utils/contrast.ts` (nouveau)
   - calcul luminance/ratio contraste et choix couleur lisible.

## Diff stats (scope)
- 5 fichiers tracked modifies: `197 insertions`, `49 deletions`
- 1 nouveau fichier tracked: `src/features/design-center/utils/contrast.ts`

## Hors scope
Aucun refactor massif. Aucun changement backend non design.