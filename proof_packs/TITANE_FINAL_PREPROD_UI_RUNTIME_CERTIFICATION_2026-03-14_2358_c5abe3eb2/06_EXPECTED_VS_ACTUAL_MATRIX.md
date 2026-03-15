# 06 EXPECTED VS ACTUAL MATRIX

| ID | Issue or Improvement | Zone | Expected Result | Code Change Found | Runtime Effect Found | Visible Effect Found | Regression Found | Final State |
|---|---|---|---|---|---|---|---|---|
| EV-01 | Top navigation canonical routing | GLOBAL | TITANE/STATS/ADMIN/DEV navigables | Oui | Oui | Oui | Non | CERTIFIED |
| EV-02 | Admin dynamic imports healed | ADMIN | tabs sans import failure | Oui | Oui | Oui | Non | CERTIFIED |
| EV-03 | Admin section sub-tabs visible | ADMIN | système/config/audio/design/gouvernance/santé prod exposés | Oui | Oui | Oui | Non | CERTIFIED |
| EV-04 | Memory section reachable from TITANE | MEMORY | onglet mémoire charge | Oui | Oui | Oui | Non | CERTIFIED |
| EV-05 | Memory tree full expert controls | MEMORY | zoom/filter/noeuds expert présents | Oui | Partiel | Partiel | Non | PARTIAL |
| EV-06 | Chat interaction path | CHAT | envoyer + recevoir réponse | Oui | Oui en mock | Oui | Non | PARTIAL |
| EV-07 | Chat fallback/retry réel | CHAT | fallback puis retry véridiques | Oui | Non live | Non live | Non | UNVERIFIED |
| EV-08 | Build frontend safe | GLOBAL | vite build prod-safe passe | Oui | Oui | Oui | Non | CERTIFIED |
| EV-09 | Repo release hygiene | GLOBAL | format:check vert | Oui | Non | n/a | Non | FAILED |
| EV-10 | Ollama local readiness | CHAT Runtime | serveur + config locale prête | Partiel | serveur Oui, config Non | n/a | Non | FAILED |
| EV-11 | Admin config propagation | ADMIN Config | write puis effet canonique prouvé | Oui | Non | Non | Non | UNVERIFIED |
