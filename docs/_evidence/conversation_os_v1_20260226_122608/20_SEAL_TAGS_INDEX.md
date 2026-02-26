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

---

## Addendum append-only — 2026-02-26T14:14:59Z

### Nouveau tag de scellement publié
- `evidence-seal-pack5-20260226T141459Z`
  - Type: annoté
  - Portée: scellement Pack 5.1 (self-audit clean x3, verdict superseding)
  - Commit scellé: `c6fe8237`
  - Référence: `refs/tags/evidence-seal-pack5-20260226T141459Z`

### Vérification rapide (addendum)
- `git tag --list "evidence-seal-pack5-20260226T141459Z"`
- `git ls-remote --tags origin | rg "evidence-seal-pack5-20260226T141459Z"`

### Métadonnées addendum
- Ring impacté: **Governance/Repo hygiene**
- Statut: **QUALIFIED**

---

## Addendum append-only — 2026-02-26T14:42:13Z

### Tag terminal de session publié
- `evidence-seal-terminal-20260226T144213Z`
  - Type: annoté
  - Portée: borne terminale post-pass de la session
  - Commit scellé: `651014c3`
  - Référence: `refs/tags/evidence-seal-terminal-20260226T144213Z`

### Vérification rapide (addendum)
- `git tag --list "evidence-seal-terminal-20260226T144213Z"`
- `git ls-remote --tags origin | rg "evidence-seal-terminal-20260226T144213Z"`

### Métadonnées addendum
- Ring impacté: **Governance/Repo hygiene**
- Statut: **QUALIFIED**

---

## Addendum append-only — 2026-02-26T14:20:00Z

### Tag miroir court publié
- `evidence-seal-pack5-20260226`
  - Type: annoté
  - Portée: alias court du scellement Pack 5.1
  - Commit scellé: `02888efe`
  - Référence: `refs/tags/evidence-seal-pack5-20260226`

### Vérification rapide (addendum)
- `git tag --list "evidence-seal-pack5-20260226"`
- `git ls-remote --tags origin | rg "evidence-seal-pack5-20260226"`

### Métadonnées addendum
- Ring impacté: **Governance/Repo hygiene**
- Statut: **QUALIFIED**
