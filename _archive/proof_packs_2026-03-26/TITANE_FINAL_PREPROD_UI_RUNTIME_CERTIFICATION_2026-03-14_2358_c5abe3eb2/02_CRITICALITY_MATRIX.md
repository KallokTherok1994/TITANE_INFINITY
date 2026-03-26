# 02 CRITICALITY MATRIX

| ID | Surface or Chain | Zone | Criticality | Why | Must Pass Build | Must Pass Deploy |
|---|---|---|---|---|---|---|
| CR-01 | Main navigation chain | GLOBAL | CRITICAL | entrée primaire vers toutes les surfaces | Oui | Oui |
| CR-02 | Chat send/fallback/retry réel | TITANE Chat | CRITICAL | usage coeur, vérité runtime | Oui | Oui |
| CR-03 | Chat status/capabilities truth | TITANE Chat | CRITICAL | confiance utilisateur | Oui | Oui |
| CR-04 | Memory persistence/retrieval/linkage | TITANE Memory | CRITICAL | mémoire coeur du produit | Oui | Oui |
| CR-05 | Admin config propagation | ADMIN Config | CRITICAL | contrôle runtime canonique | Oui | Oui |
| CR-06 | Admin import/load stability | ADMIN | CRITICAL | pages critiques admin | Oui | Oui |
| CR-07 | Route load for Time/Dev/Admin/Titane | GLOBAL | CRITICAL | accessibilité produit | Oui | Oui |
| MJ-01 | OMEGA trace/detail truth | OMEGA | MAJOR | expertise et explication | Oui | Oui |
| MJ-02 | Time grouped/fused truth | TIME | MAJOR | cohérence produit | Oui | Oui |
| MJ-03 | Dev grouped/fused truth | DEV | MAJOR | confiance opérateur | Oui | Oui |
| MJ-04 | Memory tree controls completeness | TITANE Memory | MAJOR | UX experte non bloquante | Non | Non |
| MN-01 | Global formatting drift | Repo | MINOR for runtime, MAJOR for release gate | casse la gate format | Oui | Oui |
