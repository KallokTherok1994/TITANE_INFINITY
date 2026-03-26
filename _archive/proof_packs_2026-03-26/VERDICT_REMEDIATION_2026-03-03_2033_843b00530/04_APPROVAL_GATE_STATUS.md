# APPROVAL GATE STATUS

## Signal reçu

- Contexte confirmé en entrée: run CI branche `copilot/audit-repository-contents` marqué `action_required` (approbation PR / security gate), non-code.

## Classification gouvernée

- Statut: `BLOCKED_APPROVAL`.
- Règle: aucun contournement par code, aucune falsification de statut.

## Pourquoi ce n'est pas corrigeable par patch

- Le blocage concerne une approbation GitHub (UI/policy), pas une erreur exécutable locale.
- Les gates code locales sont exécutées et prouvées séparément.

## Action opérateur

- Ouvrir la PR concernée dans GitHub.
- Aller dans Checks / Protection rules.
- Effectuer l'approbation/review requise et relancer le workflow.

## Référence

- Voir `APPROVAL_REQUIRED.md`.
