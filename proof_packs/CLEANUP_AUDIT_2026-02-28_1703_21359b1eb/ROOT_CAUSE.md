# ROOT_CAUSE

Cause racine unique retenue:

**Surface réseau front-end non gouvernée de manière univoque** (coexistence d’appels `fetch` directs et d’une porte HTTP frontend), ce qui empêche de prouver l’invariant « zéro réseau direct UI + porte unique backend ».

Conséquence:
- Gates conformité critiques en échec.
- Verdict global non PASS.
