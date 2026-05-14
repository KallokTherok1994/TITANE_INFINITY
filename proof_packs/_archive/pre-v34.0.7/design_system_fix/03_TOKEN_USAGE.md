# 03 TOKEN USAGE

## Tokens minimaux normalises (appliques au runtime)
- `--color-primary`
- `--color-secondary`
- `--color-accent`
- `--background`
- `--surface`
- `--surface-elevated`
- `--text-primary`
- `--text-muted`
- `--border`
- `--border-focus`

## Mapping applique par `UIThemeProvider`
- Source: `tokens.colors.*` (state React + persistence Rust).
- Sortie: variables `--color-*`, aliases legacy `--color-bg-*`, aliases canoniques `--background/--text-primary/...`.

## Tokens consommes (observes)
- UI design/admin consomme `--color-*` et `--tab-*`.
- Plusieurs composants legacy consomment `--text-primary`, `--text-muted`, `--background`, `--surface`.

## Tokens non connectes avant fix
- `--text-primary` et `--background` pouvaient rester sur valeurs CSS statiques (`a11y.css`) plutot que runtime tokens.

## Resultat
La propagation couvre maintenant l'ensemble des familles de variables utilisees dans la base UI (moderne + legacy).