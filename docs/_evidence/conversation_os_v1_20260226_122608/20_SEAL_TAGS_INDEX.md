# 20_SEAL_TAGS_INDEX.md

Date (UTC): 2026-02-26

## Objet
- Centraliser les tags Git de scellement associés au proof pack `conversation_os_v1_20260226_122608`.

## Tags de scellement publiés
- `evidence-seal-20260226`
  - Type: annoté
  - Portée: jalon documentaire de scellement global
  - Référence: `refs/tags/evidence-seal-20260226`

- `evidence-seal-20260226T1340Z`
  - Type: annoté
  - Portée: jalon documentaire UTC granulaire
  - Référence: `refs/tags/evidence-seal-20260226T1340Z`

## Politique d'usage
- Ces tags sont des ancres de traçabilité, non des tags de release produit.
- Toute suppression/modification de tag de seal est interdite sans addendum de gouvernance explicite.

## Vérification rapide
- `git tag --list "evidence-seal-20260226*"`
- `git ls-remote --tags origin | rg "evidence-seal-20260226"`

## Métadonnées de changement
- Ring impacté: **Governance/Repo hygiene**
- Statut: **QUALIFIED**
