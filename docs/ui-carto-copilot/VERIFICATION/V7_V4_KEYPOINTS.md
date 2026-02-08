# V7_V4_KEYPOINTS

Sources v4 (extraits prouvés)

## Portée de la cartographie
- Cartographie exhaustive/actionnable et objectif “zéro angle mort” ([docs/reference/ui-carto-v4/extracted/README.md](docs/reference/ui-carto-v4/extracted/README.md#L1-L15)).
- Dossier structuré par architecture/pages/components/issues/qa/data ([docs/reference/ui-carto-v4/extracted/00_README.md](docs/reference/ui-carto-v4/extracted/00_README.md#L27-L40)).

## Principes non négociables
- “Zéro silence” UI/IPC/chargement ([docs/reference/ui-carto-v4/extracted/00_README.md](docs/reference/ui-carto-v4/extracted/00_README.md#L44-L47)).
- “Local‑first / Tauri‑only” pour le boot UI ([docs/reference/ui-carto-v4/extracted/00_README.md](docs/reference/ui-carto-v4/extracted/00_README.md#L44-L46)).

## Navigation & sections
- Niveaux de navigation + sections principales (TITANE/TIME/STATS/ADMIN/DEV/Plus) ([docs/reference/ui-carto-v4/extracted/01_NAVIGATION_MAP.md](docs/reference/ui-carto-v4/extracted/01_NAVIGATION_MAP.md#L1-L6)).
- DEV: onglets et actions clés ([docs/reference/ui-carto-v4/extracted/01_NAVIGATION_MAP.md](docs/reference/ui-carto-v4/extracted/01_NAVIGATION_MAP.md#L10-L66)).
- TITANE: modules, états attendus, erreurs observées (Ollama) ([docs/reference/ui-carto-v4/extracted/01_NAVIGATION_MAP.md](docs/reference/ui-carto-v4/extracted/01_NAVIGATION_MAP.md#L69-L122)).
- TIME: sous‑sections (Maintenant/Agenda/Timeline/Snapshots/Intelligence/Flow) ([docs/reference/ui-carto-v4/extracted/01_NAVIGATION_MAP.md](docs/reference/ui-carto-v4/extracted/01_NAVIGATION_MAP.md#L125-L145)).
- STATS: Global Health et états UNKNOWN/NaN à traiter comme contrat UI ([docs/reference/ui-carto-v4/extracted/01_NAVIGATION_MAP.md](docs/reference/ui-carto-v4/extracted/01_NAVIGATION_MAP.md#L149-L165)).

## Shell global & patterns
- Header global + menu principal, sous‑nav DEV/TITANE/TIME ([docs/reference/ui-carto-v4/extracted/architecture/SHELL_GLOBAL.md](docs/reference/ui-carto-v4/extracted/architecture/SHELL_GLOBAL.md#L5-L41)).
- Widget flottant “Cognitive Layout” (risque si états invalides) ([docs/reference/ui-carto-v4/extracted/architecture/SHELL_GLOBAL.md](docs/reference/ui-carto-v4/extracted/architecture/SHELL_GLOBAL.md#L52-L61)).
- “BOOT BEACON”/Console overlay pour diagnostic ([docs/reference/ui-carto-v4/extracted/architecture/SHELL_GLOBAL.md](docs/reference/ui-carto-v4/extracted/architecture/SHELL_GLOBAL.md#L62-L67)).
- Hiérarchie recommandée AppShell + ErrorBoundary ([docs/reference/ui-carto-v4/extracted/architecture/SHELL_GLOBAL.md](docs/reference/ui-carto-v4/extracted/architecture/SHELL_GLOBAL.md#L71-L82)).

Notes:
- Aucun élément non prouvé n’est ajouté ici.
