# 05 — PREUVE SUPPRESSION deployment/latest/builds/

## Vérification gitignore

Pattern `.gitignore`: `deployment/latest/builds/target-run-*/`
Pattern `.gitignore`: `deployment/latest/builds/pnpm-cache*/` (ou équivalent)

## Artefacts canonical conservés

Les fichiers suivants dans `deployment/latest/builds/` sont CONSERVÉS:
- BUILD_REPRODUCIBILITY.md
- P8_INSTALL_VERIFICATION.md
- build_run_{1,2,3}.log
- hash_run_{1,2}.txt
- titane-infinity.run1.normalized
- titane-infinity.run2.normalized

## Commandes exécutées

```bash
rm -rf deployment/latest/builds/target-run-1/   # 8.8G
rm -rf deployment/latest/builds/target-run-2/   # 8.8G
rm -rf deployment/latest/builds/target-run-3/   # 6.3G
rm -rf deployment/latest/builds/pnpm-cache-1/   # 22M
rm -rf deployment/latest/builds/pnpm-cache-2/   # 22M
rm -rf deployment/latest/builds/pnpm-cache-3/   # 4K
```

## Mesures avant/après

| Répertoire | Avant | Après |
|---|---|---|
| deployment/latest/builds/ | ~24G | 67M |
| deployment/latest/ | 25G | 705M |

## Libéré: ~23.9G

## Fichiers canonical deployment/latest/builds/ post-suppression

```
BUILD_REPRODUCIBILITY.md  build_run_3.log  P8_INSTALL_VERIFICATION.md
build_run_1.log           hash_run_1.txt   titane-infinity.run1.normalized
build_run_2.log           hash_run_2.txt   titane-infinity.run2.normalized
```

## G_SAFE_DELETE_PROOF: PASS
