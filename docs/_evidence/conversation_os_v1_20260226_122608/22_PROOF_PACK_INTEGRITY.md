# 22_PROOF_PACK_INTEGRITY.md

Date (UTC): 2026-02-26

## Objet
- Sceller un manifeste d’intégrité SHA-256 du proof pack final.

## Artefact d’intégrité
- `reports/proof_pack_hash_manifest_20260226T134308Z.txt`

## Périmètre hashé
- Fichiers `*.md` et `*.txt` du dossier:
  - `docs/_evidence/conversation_os_v1_20260226_122608/`

## Méthode
- Tri déterministe des noms de fichiers.
- Calcul SHA-256 fichier par fichier.

## Vérification
- Rejouer la commande de hash sur le même périmètre.
- Comparer la sortie à l’artefact ci-dessus.

## Verdict
- Intégrité pack: **SCELLÉE**.

## Métadonnées de changement
- Ring impacté: **Governance/Repo hygiene**
- Statut: **STABLE**

---

## Addendum append-only — 2026-02-26T14:32:25Z

### Extension du périmètre
- Nouveau fichier de preuve ajouté au pack:
  - `23_PACK5_1_PROOF_DIGEST.md`

### Nouvel artefact d’intégrité
- `reports/proof_pack_hash_manifest_pack5_1_20260226T143225Z.txt`

### Vérification addendum
- Rejouer le hash sur `docs/_evidence/conversation_os_v1_20260226_122608/*.{md,txt}` (tri déterministe).
- Comparer avec l’artefact ci-dessus.

### État
- Intégrité append-only post-Pack5.1: **SCELLÉE**.

### Métadonnées addendum
- Ring impacté: **Governance/Repo hygiene**
- Statut: **QUALIFIED**
