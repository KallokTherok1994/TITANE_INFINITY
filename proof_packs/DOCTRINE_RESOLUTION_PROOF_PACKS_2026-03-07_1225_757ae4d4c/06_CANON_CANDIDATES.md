# 06_CANON_CANDIDATES

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `candidate evaluation without applying`

C) RISK: `P1`

D) PLAN (<=7):
1. Evaluate Candidate A (`TRACK_ALL`).
2. Evaluate Candidate B (`KEEP_UNTRACKED`).
3. Compare against authority and minimal-patch criteria.

E) PROOFS:

Candidate A - `TRACK_ALL`
- Avantages:
  - workspace propre si tous packs commits.
  - preuve centralisee dans git.
- Risques:
  - aucune source niveau 1/2 n'impose explicitement TRACK_ALL.
  - bruit/poids repo eleve (pack observe a `157M`).
  - conflit avec tolerance script "expected untracked".
- Contradictions:
  - impose une contrainte plus forte non mandatee.
- Changements necessaires:
  - policy explicite + process de commit systematique des proof packs.
- Cout d'adoption:
  - moyen/eleve (discipline de commit + volume).
- Reversibilite:
  - moyenne.

Candidate B - `KEEP_UNTRACKED`
- Avantages:
  - aligne avec `lib_cert.sh` (expected untracked).
  - aligne avec minimal patch/no repo noise.
  - compatible avec obligation de produire des preuves sous `proof_packs`.
- Risques:
  - hygiene visuelle `git status` peut rester bruyante.
  - conservation long terme depend de discipline locale/archives externes.
- Contradictions:
  - historique tracked existe mais de niveau inferieur.
- Changements necessaires:
  - clarification operationnelle de la notion de clean-tree (tracked-only) pour gate hygiene.
- Cout d'adoption:
  - faible.
- Reversibilite:
  - elevee.

Comparatif final:
- Aucune autorite haute n'exige `TRACK_ALL`.
- `KEEP_UNTRACKED` est la decision minimale, plus sobre, et compatible avec les sources gagnantes.

F) ROLLBACK:
- Aucun changement applique.
