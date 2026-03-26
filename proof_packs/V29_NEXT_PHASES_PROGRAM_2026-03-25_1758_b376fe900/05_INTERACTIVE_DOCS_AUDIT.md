# Audit phase B - Interactive Docs

## Etat trouve

- Le repo contient un corpus `docs/` important.
- Des surfaces d'aide existent:
  - `src/components/a11y/KeyboardShortcuts.tsx`
  - aide contextuelle clavier
- Aucune route `/docs` n'a ete trouvee dans `src/App.tsx`.
- Aucune surface in-app liee aux modules, aux preuves, ou a un index de documentation runtime n'a ete prouvee.

## Classification

- Statut de phase: `DOC_ONLY`
- Verdict dedie: `INTERACTIVE_DOCS_STATIC_ONLY`

## Gap principal

- Pas de surface de documentation interactive gouvernee:
  - pas d'explorer
  - pas de lien feature -> docs -> proof pack
  - pas de labels `STATIC_DOC` / `RUNTIME_BACKED` / `OUTDATED`

## Decision

- Aucun patch applique.
- Le programme garde cette phase honnetement non implementee cote runtime.
