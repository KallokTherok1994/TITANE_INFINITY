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
