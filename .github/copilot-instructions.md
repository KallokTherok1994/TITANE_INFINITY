# TITANE_INFINITY - Copilot Instructions (Governed) — v3 Constitution Finale

Mode : AUTO, autorité unique, arrêt immédiat strict
Objectif : exécuter, vérifier et sceller toute session sans dérive
Portée : dépôt complet (instructions, cartographie, preuves)
Principe directeur : gouvernance avant vitesse

Compatibility markers (required by verifier):
- Local-first
- diagnose -> plan -> apply -> verify -> report

## 1) Préambule

Cette constitution est normative, exécutable et prioritaire.

**Action**

- Exécuter : diagnostiquer -> planifier -> appliquer -> vérifier -> rapporter -> sceller.
- Limiter chaque changement à la portée demandée.
- Produire des preuves append-only dans `reports/`.

**Interdiction**

- Déclarer terminé sans preuve.
- Employer des formulations non mesurables.

**Preuve attendue**

- Journal horodaté avec statut explicite par phase.

**Porte de contrôle**

- Preuve manquante = FAIL.

## 2) Définitions formelles (PASS / FAIL / BLOCKED / DONE / SEALED)

**PASS** : contrôle exécuté + preuve vérifiable.

**FAIL** : règle violée, preuve absente, ambiguïté ou contradiction.

**BLOCKED** : exécution impossible malgré prérequis satisfaits.

**DONE** : implémentation terminée + validations prévues exécutées.

**SEALED** : DONE + toutes gates applicables PASS + rollback documenté.

**Action**

- Assigner un statut unique à chaque étape.

**Interdiction**

- Confondre DONE et SEALED.

**Preuve attendue**

- `VERDICT.md` avec statut final unique.

**Porte de contrôle**

- Statut final multiple ou absent = FAIL.

## 3) Invariants non négociables

**Action**

- Maintenir Tauri-only en production.
- Maintenir Online-first gouverné avec fallback local obligatoire.
- Maintenir architecture 4-Ring stricte.
- Maintenir stabilité capabilities/allowlists avec justification testable.

**Interdiction**

- Étendre surfaces réseau sans gate, preuve et rollback.

**Preuve attendue**

- Scans d’architecture/réseau/config dans `reports/`.

**Porte de contrôle**

- Violation d’invariant = STOP-THE-LINE.

## 4) Architecture 4-Ring formalisée

**Action**

- Ring 1 Types : contrats uniquement, zéro I/O.
- Ring 2 Engines : logique pure, import Ring 1 seulement.
- Ring 3 Services : orchestration I/O gouvernée.
- Ring 4 Modules/UI : interaction utilisateur/OS, erreurs visibles.

**Interdiction**

- Import inversé de ring.
- I/O en Ring 1 ou Ring 2.

**Preuve attendue**

- PASS `test:architecture`.

**Porte de contrôle**

- Violation de ring = FAIL.

## 5) Gouvernance réseau (One Door)

**Action**

- Chemin unique : UI -> IPC canonique -> Services -> Gateway réseau -> Externe.
- Conserver fallback local opérationnel.

**Interdiction**

- UI -> Externe direct.

**Preuve attendue**

- Rapport scan réseau + preuve fallback local.

**Porte de contrôle**

- Surface non gouvernée = FAIL.

## 6) Flux d’exécution obligatoire

**Action**

- Exécuter les phases dans l’ordre, sans saut.
- Publier statut explicite par phase.

**Interdiction**

- Reporter la vérification.

**Preuve attendue**

- Log : commande, horodatage, résultat.

**Porte de contrôle**

- Phase non traçable = FAIL.

## 7) Système de preuves

**Action**

- Écrire les preuves en append-only dans `reports/`.
- Inclure commandes, extraits, gates, rollback, verdict.

**Interdiction**

- Réécriture destructive d’artefacts.

**Preuve attendue**

- `VERDICT.md` + `ROLLBACK.md`.

**Porte de contrôle**

- Artefact obligatoire absent = FAIL.

## 8) Gates globales

**Action**

- Exécuter toutes gates applicables.
- Capturer PASS/FAIL/BLOCKED.

**Interdiction**

- Déclarer PASS sans exécution.

**Preuve attendue**

- Tableau des gates avec artefact lié.

**Porte de contrôle**

- Gate obligatoire non traitée = FAIL.

## 9) Politique PROD stricte

**Action**

- Exiger strictement les tokens exacts avant action PROD.

**Tokens exacts**

- `GO_FOR_PROD_BUILD__TITANE_INFINITY`
- `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`

**Interdiction**

- Alias, approximation ou reformulation.

**Preuve attendue**

- Trace exacte + `VERDICT.md`.

**Porte de contrôle**

- Token absent/altéré = FAIL.

## 10) Synchronisation version

**Action**

- Aligner strictement :
  - `package.json`
  - `src-tauri/Cargo.toml`
  - `src-tauri/tauri.conf.json`
  - `deployment/latest/MANIFEST.json`
  - `deployment/latest/SHA256SUMS_v<version>.txt`
  - `deployment/latest/SIZES_v<version>.txt`

**Interdiction**

- Build/deploy PROD avec mismatch version.

**Preuve attendue**

- Rapport comparaison fichier par fichier.

**Porte de contrôle**

- Mismatch version = FAIL.

## 11) Gouvernance IDE

**Action**

- Maintenir un seul agent IA exécutant actif.
- Maintenir un seul runner E2E autorité actif.

**Interdiction**

- Multi-agent exécutant simultané.
- Double runner E2E simultané.

**Preuve attendue**

- Snapshot outillage + rapport runner.

**Porte de contrôle**

- Concurrence d’autorité = FAIL.

## 12) Anti-silence

**Action**

- Retour visible obligatoire : succès ou erreur.
- Respect strict du contrat IPC `{ ok, content, error }`.

**Interdiction**

- Silence UI/IPC.
- Fallback trompeur.

**Preuve attendue**

- Logs E2E/IPC avec cause racine.

**Porte de contrôle**

- Interaction silencieuse = FAIL.

## 13) Discipline invoke

**Action**

- Utiliser le client canonique TypeScript <-> Tauri.

**Interdiction**

- Nouvel `invoke` brut hors client canonique.

**Preuve attendue**

- Scan d’absence de dérive invoke.

**Porte de contrôle**

- Invoke direct non conforme = FAIL.

## 14) Tests et validation x3

**Action**

- Exécuter tests ciblés selon ring impacté.
- Exécuter triplet de confiance (tests/checks/smoke) x3 quand applicable.

**Interdiction**

- Déclarer DONE sans tests applicables.

**Preuve attendue**

- Résumé PASS/FAIL/BLOCKED + logs.

**Porte de contrôle**

- Test obligatoire non exécuté = FAIL.

## 15) Rollback

**Action**

- Fournir rollback explicite, reproductible, non destructif.

**Interdiction**

- Commandes destructives sans récupération.

**Preuve attendue**

- `ROLLBACK.md`.

**Porte de contrôle**

- Rollback absent = FAIL.

## 16) Métadonnées de changement

**Action**

- Déclarer `Ring` impacté + statut (`STABLE`, `QUALIFIED`, `EXPERIMENTAL`, `UNKNOWN`).
- Pour changement UI : entrée append-only `registry/ui-events.jsonl`.

**Interdiction**

- Changement non classifié.

**Preuve attendue**

- Diff métadonnées + entrée registre si UI.

**Porte de contrôle**

- Métadonnées incomplètes = FAIL.

## 17) Système de progression mesurable

**Action**

- Publier bloc progression à chaque jalon.
- Calculer : `Global Completion = (tâches terminées / tâches totales) * 100`.

**Interdiction**

- Progression implicite.

**Preuve attendue**

- Bloc progression présent dans le rapport final.

**Format obligatoire**

- `Current Phase`
- `Tasks Completed`
- `Global Completion`
- `Gates Passed`
- `Gates Pending`
- `Blocking Issues`
- `Seal Status`

**Porte de contrôle**

- Bloc absent/incohérent = FAIL.

## 18) Cartographie & Mapping System

**Action**

- Maintenir cartographie canonique, régénérable, prouvable.
- Maintenir artefacts obligatoires :
  - `docs/MAP_INDEX.md`
  - `docs/MAP_ARCHITECTURE_4RING.md`
  - `docs/MAP_SURFACES_NETWORK.md`
  - `docs/MAP_IPC_COMMANDS.md`
  - `docs/MAP_TESTS_GATES.md`
  - `docs/MAP_MERMAID_OVERVIEW.md`
  - `reports/MAP_PROOFS.log`
- Convention par entrée : **Objet**, **Ring**, **Responsabilité**, **Interfaces**, **I/O**, **Preuve**, **Statut**.
- Toute donnée non prouvable = `UNKNOWN`.

**Interdiction**

- Inventer des éléments non dérivés des artefacts réels.

**Preuve attendue**

- `reports/MAP_PROOFS.log` horodaté.

**Porte de contrôle**

- Artefact mapping absent = FAIL.

## 19) Mermaid obligatoires

**Action**

- Maintenir 4 diagrammes minimum dans `docs/MAP_MERMAID_OVERVIEW.md` :
  1. Vue 4-Ring
  2. One Door Network
  3. Pipeline gouverné
  4. Gates & Proof Pack

**Interdiction**

- Diagrammes décoratifs non structurels.

**Preuve attendue**

- 4 blocs Mermaid valides.

**Porte de contrôle**

- Nombre ou structure insuffisante = FAIL.

## 20) Anti-drift

**Action**

- Toute modification surfaces/IPC/architecture impose mise à jour cartographie.
- Rafraîchir les preuves via `scripts/map_refresh.sh`.

**Interdiction**

- Changer code gouverné sans update mapping.

**Preuve attendue**

- Diff mapping + update `reports/MAP_PROOFS.log`.

**Porte de contrôle**

- Dérive non corrigée = FAIL.

## 21) Seal Protocol

**Action**

- Protocole d’auto-fix pré-scellement obligatoire :
  1. Vérifier présence des 22 sections
  2. Vérifier absence d’ambiguïté
  3. Vérifier absence de contradiction
  4. Vérifier preuve pour chaque règle
  5. Vérifier progression mesurable
- Corriger automatiquement toute incohérence détectée avant verdict.
- Déclarer `SCELLÉ` uniquement si toutes gates applicables sont PASS.

**Interdiction**

- Sceller avec gate FAIL ou BLOCKED non résolue.

**Preuve attendue**

- `VERDICT.md` final unique + index preuves + rollback.

**Porte de contrôle**

- Condition de scellement non satisfaite = NON SCELLÉ.

## 22) Stop-the-line global

**Déclencheurs**

- Violation invariant non négociable.
- Gate obligatoire FAIL.
- Contradiction interne non résolue.
- Ambiguïté verdict non résolue.
- Dérive multi-agent/multi-runner.

**Action**

- Arrêt immédiat, diagnostic cause racine, correction ou rollback.

**Interdiction**

- Continuer malgré FAIL.

**Preuve attendue**

- Journal d’arrêt + décision de reprise.

**Porte de contrôle**

- Reprise sans levée explicite du FAIL = FAIL.

## Gates Mapping obligatoires V3

- `G_MAP_INDEX_PRESENT`
- `G_MAP_ARCHITECTURE_PRESENT`
- `G_MAP_SURFACES_PRESENT`
- `G_MAP_IPC_COMMANDS_PRESENT`
- `G_MAP_TESTS_GATES_PRESENT`
- `G_MERMAID_PRESENT`
- `G_MAP_PROOF_LOG_PRESENT`
- `G_MAP_NO_UNKNOWN_CRITICAL`
- `G_MAP_ANTI_DRIFT_RULE_PRESENT`

Règle de scellement : une gate mapping non PASS interdit `SCELLÉ`.
