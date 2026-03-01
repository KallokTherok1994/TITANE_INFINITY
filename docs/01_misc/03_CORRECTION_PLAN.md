# 03_CORRECTION_PLAN

## Plan exécuté (RC)
1. Corriger chirurgicalement la surface réseau frontend ciblée (Ring 3).
2. Rejouer les gates critiques en x3 (`test:architecture`, `build:tauri:e2e`, scans ring/réseau).
3. Simuler les pannes contrôlées et vérifier l'explicitation des erreurs.
4. Exécuter un audit de dérive final (diff, allowlist, sécurité, duplication policy).
5. Statuer les gates RC et émettre un verdict unique.

## Résultat du plan
- Étapes 1 à 3: complétées et validées par preuves PASS x3.
- Étape 4: complétée et conforme après recalibrage gouverné du drift audit (`allowlist_scan=0`, `secret_scan=0`, `git_diff_exit_code=0`).
- Étape 5: verdict final `PASS` (voir `14_VERDICT_RC.md`).

## Plan résiduel obligatoire avant nouveau seal
1. Maintenir le contrôle allowlist via gate officielle `g7` + audit capabilities.
2. Conserver le scan sécurité en scope production par défaut.
3. Rejouer `11_DIFF_AUDIT` à chaque cycle de correction avant verdict final.
