# UI VERSION 30.1.27 GITHUB RELEASE TRUTH

Date: 2026-04-16
Status: BLOCKED

## Scope

- Verifier si un artefact 30.1.27 est recuperable depuis GitHub Releases.
- Distinguer une release note repo locale d une publication GitHub externe reellement disponible.

## Findings

- La page releases GitHub du depot liste `v30.1.25`, `v30.1.22`, `v30.1.11`, `v30.1.4` et `v30.0.0`, mais aucune entree `v30.1.27`.
- Les URLs GitHub release `releases/tag/v30.1.27` et `releases/tag/30.1.27` renvoient 404.
- La page GitHub tags ne montre pas de tag `v30.1.27` sur les tags visibles de la serie `v30.1.x`.
- Les URLs directes `tree/v30.1.27` et `archive/refs/tags/v30.1.27.tar.gz` renvoient 404.

## Conclusion

- Aucune release GitHub publiquement recuperable n existe actuellement pour `v30.1.27`.
- Aucune evidence externe ne permet donc, dans la session courante, de recuperer l AppImage 30.1.27 depuis GitHub.
- Le blocage 30.1.27 reste actif avec deux faits maintenant prouves:
  - aucune ancre Git reconstructible 30.1.27 dans le repo actuel,
  - aucune publication GitHub externe recuperable pour `v30.1.27`.

## Evidence

- `https://github.com/KallokTherok1994/TITANE_INFINITY/releases` -> liste `v30.1.25`, `v30.1.22`, `v30.1.11`, `v30.1.4`, `v30.0.0`, sans `v30.1.27`
- `https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v30.1.27` -> 404
- `https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/30.1.27` -> 404
- `https://github.com/KallokTherok1994/TITANE_INFINITY/tags` -> aucun tag visible `v30.1.27`
- `https://github.com/KallokTherok1994/TITANE_INFINITY/tree/v30.1.27` -> 404
- `https://github.com/KallokTherok1994/TITANE_INFINITY/archive/refs/tags/v30.1.27.tar.gz` -> 404

## Practical Impact

- La prochaine action utile ne peut plus etre une simple recuperation GitHub release/tag dans ce depot public.
- Les seules pistes restantes sont:
  - retrouver l artefact 30.1.27 hors GitHub Releases, par exemple dans un stockage local ou un autre canal de distribution,
  - ou reconstruire 30.1.27 depuis un historique prive ou une branche de travail non publiee si elle existe encore.

## Rollback

- `rm -f reports/UI_VERSION_30.1.27_GITHUB_RELEASE_TRUTH_2026-04-16.md`
