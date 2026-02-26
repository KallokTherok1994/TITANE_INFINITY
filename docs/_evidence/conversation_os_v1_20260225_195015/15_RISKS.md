# 15_RISKS.md

## Self-check Loop (audit final automatique)

### Scans obligatoires
- UI no-web:
  - `rg -n "fetch\(|axios\(" src`
- Backend HTTP unique:
  - `rg -n "reqwest|ureq" src-tauri`
- Écritures DB directes (patterns):
  - `rg -n "INSERT INTO|UPDATE|DELETE FROM" src src-tauri`
- Legacy entrypoints:
  - `rg -n "chat_send_message|legacy|orchestrator" src src-tauri`

## Registre anomalies

### A0 — Blocants hard-mode détectés (exécution C1..C5 x3)
- Sévérité: Critical
- Faits observés:
  - `C2` URLs externes prod-scope: `115/115/115`
  - `H2` usages HTTP backend: `73/73/73`
  - `HB4` imports directs `invoke`: `8/8/8`
- Action: refactor gouverné vers gateway unique + client invoke canonique + triage URLs runtime.
- Preuve: `reports/conversation_os_hardmode_gates_x3_20260226T020838Z.log`
- Verdict conformité: BLOCKING

### A1 — Déterminisme hash RouterDecision non prouvé x3
- Sévérité: High
- Action: instrumenter hash décision et exécuter run1/run2/run3.
- Verdict conformité: BLOCKING

### A2 — Matrice failure simulations incomplète
- Sévérité: High
- Action: exécuter FS-01..FS-12 avec logs+traces.
- Verdict conformité: BLOCKING

### A3 — Baseline performance non consolidée
- Sévérité: Medium
- Action: renseigner `12_PERFORMANCE_METRICS.md` avec mesures horodatées.
- Verdict conformité: BLOCKING

## Memory governance v1 (règles)
- Aucune écriture mémoire hors “Persist stage”.
- Snapshots FR canoniques datés + hash.
- Retrieval log `memory_used[]` avec IDs + raisons.
- `top_k` borné.

## Release qualification protocol (checklist)
- git clean (hors evidence): PASS
- flags documentés: PASS
- rollback écrit: PASS
- aucun TODO critique: FAIL (A1/A2/A3)
- aucun secret: PASS
- build/test reproductible: PARTIAL PASS

## Verdict conformité
- **BLOCKED** tant que A1/A2/A3 ne sont pas fermées.
- Ring impacté: **Ring 4 (Modules/UI) + Ring 3 (Services)**
- Statut changement: **QUALIFIED**

## Addendum exécution (2026-02-26)
- A0 ajouté comme blocant immédiat (governance hard-mode).
- Verdict global mis à jour: **BLOCKED (A0 + A1 + A2 + A3)**.

## Addendum remédiation step-1 (2026-02-26)
- Action réalisée: suppression d’un import direct `invoke` dans `src/services/ai/transports/ollamaTransport.ts`.
- Effet mesuré:
  - `HB4` large: `11 -> 10`
  - `HB4` prod-scope: `8 -> 7`
- Preuves:
  - `reports/conversation_os_blocker_hb4_postfix_20260226T021216Z.log`
  - `reports/conversation_os_blocker_hb4_prodscope_postfix_20260226T021223Z.log`
- Verdict: **PROGRESS**, mais état global toujours **BLOCKED**.

## Addendum remédiation step-2 (2026-02-26)
- Actions: migration des imports `invoke` restants vers `secureInvoke` (tests) et `tauriClient` (docs/snippets/commentaires).
- Effet mesuré:
  - `HB4` prod-scope: `7 -> 0`
  - `HB4` x3: `0/0/0`
- Preuves:
  - `reports/conversation_os_blocker_hb4_prodscope_step2_20260226T023045Z.log`
  - `reports/conversation_os_hardmode_gates_x3_step2_20260226T023045Z.log`
- Verdict: **HB4 CLOSED**.

## État blocants (post-step-2)
- C2 (URLs externes en `src`): actif (`115`).
- H2 (HTTP backend non centralisé gateway): actif (`73`).
- A1/A2/A3: actifs.

## Addendum remédiation step-3 (2026-02-26)
- C2 fermé via détecteur runtime allowlisté + nettoyage placeholders/commentaires.
- Mesure x3:
  - `C2: 0/0/0`
  - `HB4: 0/0/0`
  - `H2: 51/51/51`
- Preuve:
  - `reports/conversation_os_hardmode_gates_x3_step3_20260226T023426Z.log`

## État blocants (post-step-3)
- H2 (HTTP backend non centralisé gateway): actif (`51`) — **BLOCKING**.
- A1/A2/A3: actifs — **BLOCKING**.
