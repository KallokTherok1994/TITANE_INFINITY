# 05_CONTRADICTION_MATRIX

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `formal contradiction classification`

C) RISK: `P1`

D) PLAN (<=7):
1. Project each source on TRACK_ALL vs KEEP_UNTRACKED.
2. Mark real/apparent contradiction.
3. Classify final contradiction status.

E) PROOFS:

| Source | Dit quoi ? | Implique TRACK_ALL ? | Implique KEEP_UNTRACKED ? | Tolere les deux ? | Niveau autorite | Contradiction reelle ? |
|---|---|---|---|---|---|---|
| `.github/copilot-instructions.md` | produire des preuves en `proof_packs` | Non explicite | Non explicite | Oui | 1 | Non |
| `.github/instructions/docs-registry.instructions.md` | append-only + no-delete + fichiers obligatoires | Non explicite | Compatible | Oui | 2 | Non |
| `scripts/certification/lib_cert.sh` | untracked proof packs expected | Non | Oui | Non | 3 | Non |
| `scripts/certification/run-p10-desktop-cert.sh` | commit d'un pack cert P10 specifique | Partiel (scope P10) | Oui (si non-committed) | Oui | 4 | Apparente |
| Historique git (`tracked=41`) | de nombreux packs suivis | Oui (historique) | Non | Non | 5 | Apparente |
| Etat courant (`untracked_status=6`) | packs courants non suivis | Non | Oui | Non | 5 | Apparente |
| `.gitignore` | pas de regle proof_packs | Non | Non | Oui | 6 | Non |

CONTRADICTION_STATUS: `RESOLVABLE`

Rationale:
- La contradiction est principalement de niveau pratique/historique.
- Les niveaux d'autorite superieurs n'imposent pas TRACK_ALL.
- Le niveau script gate (`lib_cert.sh`) donne une tolerance explicite KEEP_UNTRACKED.

F) ROLLBACK:
- Matrice analytique uniquement.
