# 02_VERSION_TRUTH

## Surfaces canoniques inspectees

| Surface | Etat observe |
|---|---|
| `package.json` | `version: 28.88.0` et `description: TITANE∞ v28.88.0 ...` |
| `src-tauri/Cargo.toml` | `version = 28.88.0` et `description = TITANE∞ v28.88.0 ...` |
| `src-tauri/tauri.conf.json` | `version: 28.88.0` |
| `runtime/stable/tauri.conf.json` | `version: 28.88.0` |
| `README.md` | phase courante et footer alignes sur `28.88.0` |
| `CHANGELOG.md` | historique recent en `28.x`; intitule actif nettoye de la derive `v29.2` |
| `RELEASE_v28.88.0_SEALED.txt` | surface de release `28.88.0` presente |
| tags git locaux | pas de tag `v28.88.0` visible localement |

## Presence de V29 dans le repo

- `src/pages/DevPage.tsx` affiche maintenant `TITANE∞ v28.88.0 • 5 tabs fusionnes`
- `src/features/evolution/EvolutionTimeline.tsx` expose des jalons `v29.0`
- `src/features/transformation/TransformationRoadmap.tsx` expose `version: 'v29.0'`
- plusieurs docs historiques parlent de `v29.x`

## Determination du baseline actuel

- classification baseline: `CURRENT_BASELINE_IS_V28_X`
- version canonique la plus defendable: `28.88.0`
- alignement complet des surfaces actives et canoniques: oui

## Conclusion

Le baseline actuel reste `v28.88.0`. Le lock de derive de version sur les surfaces actives et canoniques a ete corrige dans cette session. La presence de `v29.x` subsiste surtout dans des surfaces historiques, de roadmap ou de commentaires, ce qui ne suffit plus a invalider le baseline courant.
