# Risques de dérive

## Risques réduits

- absence de profil par défaut sûr
- absence de réseau explicitement coupé par défaut
- absence de contexte repo racine
- duplication doctrinale dans le repo

## Risques restants

- la CLI `codex` n'est pas présente localement, donc la compatibilité sémantique runtime de chaque clé ne peut pas être prouvée par le binaire lui-même
- `~/.codex/rules/default.rules` contient des autorisations persistées de sessions passées; elles ne sont pas dangereuses par défaut ici, mais restent une surface locale indépendante
- le repo conserve plusieurs surfaces historiques Copilot/Cline; elles sont validées, mais nombreuses

## Recommandation

- quand `codex` sera disponible localement, lancer une vérification runtime simple de chargement de profil et de fichier d'instructions
