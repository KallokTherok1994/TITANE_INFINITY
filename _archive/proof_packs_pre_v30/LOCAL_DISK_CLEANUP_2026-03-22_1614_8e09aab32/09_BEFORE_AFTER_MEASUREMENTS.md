# 09 — MESURES AVANT/APRÈS

## Disque système

| Métrique | Avant | Après |
|---|---|---|
| Total | 915G | 915G |
| Utilisé | 745G | 558G |
| Libre | 124G | 312G |
| Utilisation | 86% | 65% |
| **Libéré** | — | **~187G** |

## Répertoires clés

| Chemin | Avant | Après | Libéré |
|---|---|---|---|
| src-tauri/target/ | 171G | 15G | ~156G |
| deployment/latest/ | 25G | 705M | ~24G |
| .venv/ | 7.7G | SUPPRIMÉ | 7.7G |
| src-tauri/gen/android/app/build/ | 2.3G | SUPPRIMÉ | 2.3G |
| build_logs/ | 48K | SUPPRIMÉ | 48K |
| REPO_CLONE_TEST/ (voisin) | 17G | QUARANTAINE | — |
| Repo total (.) | 227G | 37G | ~190G |

## G_BEFORE_AFTER_MEASURED: PASS
