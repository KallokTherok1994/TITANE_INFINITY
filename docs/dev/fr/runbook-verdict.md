# TITANE∞ — Runbook de Verdict (FR)

**Version :** 30.0.0  
**Statut :** QUALIFIED  
**Date :** 2026-04-18

> Runbook opératoire pour choisir et rédiger le verdict final d une session gouvernée de correction ou de vérification.

---

## Verdicts autorisés

Utiliser un seul vocabulaire de statut :

| Verdict | À utiliser quand |
|---|---|
| PASS | Les preuves obligatoires ont été exécutées et sont vertes pour le scope concerné |
| FAIL | Un gate obligatoire a tourné et a échoué ; stop-the-line immédiat |
| BLOCKED | Un gate obligatoire ne peut pas être exécuté à cause d un prérequis externe manquant |
| BLOCKED_APPROVAL | L exécution attend une approbation humaine explicite |
| DONE | Le travail est terminé mais la clôture gouvernée n est pas encore entièrement scellée |
| SEALED | La session gouvernée est clôturée avec proof pack, rollback et trace finale en place |

Ne pas inventer d autre libellé.

---

## Chemin de décision rapide

1. Confirmer le scope exact de la correction ou de la vérification.
2. Lister les preuves obligatoires pour ce scope.
3. Séparer la preuve réellement exécutée de la preuve supposée.
4. Si une preuve obligatoire a échoué, le verdict est FAIL.
5. Si une preuve obligatoire ne peut pas tourner, le verdict est BLOCKED avec prochaine action.
6. Si toutes les preuves obligatoires sont PASS, le verdict du lot ou gate est PASS.
7. Utiliser DONE seulement pour un travail fini avant fermeture gouvernée complète.
8. Utiliser SEALED seulement quand le proof pack, le rollback et la trace finale sont tous présents.

---

## Vérifications obligatoires avant PASS

- Tests exacts ciblés pour le scope modifié
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- Mises à jour mapping/cartographie requises pour la surface touchée
- Artifacts de preuve sous `reports/` et `proof_packs/` quand la session est gouvernée

Si un de ces points manque, ne pas déclarer PASS.

---

## Contenu obligatoire avant SEALED

- Un rapport ciblé dans `reports/`
- Un proof pack contenant au minimum `GATE_REPORT.md`, `VERDICT.md` et `ROLLBACK.md`
- Une commande de rollback bornée au lot concerné
- Une preuve réellement exécutée et rapportée honnêtement
- Aucune contradiction entre l état git, les fichiers de preuve et le verdict annoncé

Si un point manque, rester à PASS, DONE, FAIL ou BLOCKED selon le cas.

---

## BLOCKED vs FAIL

Utiliser FAIL quand le gate a réellement tourné et que le résultat est mauvais.

Utiliser BLOCKED quand le gate n a pas tourné à cause d une contrainte externe, par exemple :

- runner ou répertoire d artefacts verrouillé
- device ou runner absent
- credential ou approbation manquante
- binaire, fixture ou environnement requis absent

Tout verdict BLOCKED doit inclure une prochaine action réaliste et exécutable en 30 minutes ou moins.

---

## Modèles minimaux de verdict

### PASS

```md
- Status: PASS
- Scope: <lot ciblé>
- Proof: <commandes exécutées avec succès>
```

### FAIL

```md
- Status: FAIL
- Scope: <lot ciblé>
- Failed gate: <commande ou contrôle>
- Stop line reason: <raison factuelle courte>
```

### BLOCKED

```md
- Status: BLOCKED
- Scope: <lot ciblé>
- Missing prerequisite: <blocage externe>
- Next action: <étape suivante bornée>
```

### SEALED

```md
- Status: SEALED
- Scope: <lot ou session>
- Proof pack: <chemin>
- Rollback: <chemin ou commande>
```

---

## Erreurs fréquentes à éviter

- Marquer PASS après les edits mais avant l exécution des gates obligatoires
- Marquer FAIL alors que le contrôle n a jamais réellement tourné
- Marquer BLOCKED sans prochaine action concrète
- Marquer SEALED avant complétude du proof pack
- Mélanger des affirmations session-wide avec un lot plus petit

---

*Documentation anglaise : [docs/dev/en/verdict-runbook.md](../en/verdict-runbook.md)*