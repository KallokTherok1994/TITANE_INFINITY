# 13_FAILURE_SIMULATIONS.md

## Failure Simulation Expansion

### Format par scénario
- Setup
- Attendu (netstate + error class + message utilisateur)
- Preuve (log + trace)
- Verdict

### Scénarios obligatoires

#### FS-01 offline au démarrage
- Setup: démarrer avec réseau coupé.
- Attendu: `OFFLINE`, `FailureClass=OFFLINE`, erreur visible non silencieuse.
- Preuve: log boot + trace frame.
- Verdict: UNKNOWN

#### FS-02 offline en cours
- Setup: couper réseau pendant session active.
- Attendu: transition netstate vers `OFFLINE`, fallback local explicite.
- Preuve: log transition + trace.
- Verdict: UNKNOWN

#### FS-03 DNS failure
- Setup: endpoint non résolvable.
- Attendu: `FailureClass=DNS_FAILURE` (ou classe équivalente), message utilisateur stable.
- Preuve: log erreur classifiée.
- Verdict: UNKNOWN

#### FS-04 TLS failure
- Setup: certificat invalide.
- Attendu: `FailureClass=TLS_FAILURE`, pas de fallback silencieux.
- Preuve: log TLS + trace.
- Verdict: UNKNOWN

#### FS-05 timeout
- Setup: endpoint lent > timeout gateway.
- Attendu: `FailureClass=TIMEOUT`, timeout borné.
- Preuve: log timeout + `timeout_ms`.
- Verdict: UNKNOWN

#### FS-06 429
- Setup: simulation rate-limit.
- Attendu: `FailureClass=RATE_LIMIT`, backoff borné.
- Preuve: log retry/backoff.
- Verdict: UNKNOWN

#### FS-07 500
- Setup: endpoint retourne 500.
- Attendu: `FailureClass=UPSTREAM_5XX` (ou équivalent), erreur visible.
- Preuve: log status code.
- Verdict: UNKNOWN

#### FS-08 allowlist violation
- Setup: host hors allowlist.
- Attendu: `ALLOWLIST_BLOCK` avant requête.
- Preuve: log validation allowlist.
- Verdict: UNKNOWN

#### FS-09 clé API manquante
- Setup: retirer clé provider.
- Attendu: `CREDENTIALS_MISSING` explicite.
- Preuve: test SearchGateway dédié.
- Verdict: PASS (preuve historique)

#### FS-10 clé révoquée
- Setup: clé invalide côté provider.
- Attendu: classe auth explicite, pas de message trompeur.
- Preuve: trace erreur auth.
- Verdict: UNKNOWN

#### FS-11 circuit breaker open
- Setup: provoquer erreurs répétées jusqu’à ouverture.
- Attendu: état breaker `OPEN`, routage stable.
- Preuve: logs résilience.
- Verdict: UNKNOWN

#### FS-12 budget épuisé
- Setup: consommer budget réseau.
- Attendu: refus gouverné + classe erreur dédiée.
- Preuve: log budget remaining.
- Verdict: UNKNOWN

### Stop-the-line
- Crash ou fallback silencieux sur un scénario => **FAIL immédiat**.

### Statut global
- Couverture partielle prouvée, matrice complète non encore exécutée: **BLOCKED**.
- Ring impacté: **Ring 3 (Services)**
- Statut changement: **EXPERIMENTAL**
