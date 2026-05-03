A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (diagnostic local block)
C) RISK: P0
D) PLAN: 1) constater blocage 2) definir impact 3) proposer next step unique.
E) PROOFS: obtenues = gate git + diffstats.
F) ROLLBACK: suppression du proof pack uniquement.

# 17 LOCAL BLOCK REPORT

Blocage principal:
- `DIRTY_CONFLICTING` + local en retard de `origin/MAIN`.

Impact:
- Toute fusion documentaire large risquerait une autorite canonique erronée.

Decision:
- Stop-the-line sur rewrite docs canoniques.

Next action unique:
- Preserver explicitement le travail local, puis fast-forward propre sur `origin/MAIN`, ensuite relancer la mission docs fusion.
