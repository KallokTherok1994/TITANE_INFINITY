# TITANE_INFINITY - Copilot Instructions (Governed)

Mode : AUTO, arrêt immédiat strict
Objectif : Mettre à jour et sceller les instructions du dépôt avec preuves
Portée : dépôt complet

## A) Invariants gouvernés

**À FAIRE**

- Online-first gouverné. Réseau autorisé uniquement via des surfaces contrôlées. Fallback local obligatoire.
- Online-first governed policy active: controlled network surfaces only, mandatory local fallback.
- Local-first fallback remains mandatory when controlled network surfaces are unavailable.
- Tauri-only. Aucun serveur web/preview et aucune API HTTP interne de type `server/`.
- Architecture 4-Ring (Types -> Engines -> Services -> Modules/UI).
- Les listes d’autorisation/capabilities restent stables et justifiées par des portes de contrôle et des tests.

**À NE PAS FAIRE**

- Exécuter un serveur web/preview ou étendre la surface réseau sans approbation explicite et sans portes de contrôle.
- Ajouter des capabilities sans preuve et sans chemin de rollback.

**Éléments de preuve attendus**

- Scripts de vérification et logs dans `reports/`.

**Porte de contrôle**

- Stop-the-line immédiat si un invariant est violé.

## B) Flux standard

**À FAIRE**

- diagnostiquer -> planifier -> appliquer -> vérifier -> rapporter.
- diagnose -> plan -> apply -> verify -> report.
- Garder les changements minimaux et strictement bornés à la portée demandée.

**À NE PAS FAIRE**

- Reporter la preuve ou la vérification à plus tard.

**Éléments de preuve attendus**

- Logs, diffs et marqueurs PASS dans `reports/`.

**Porte de contrôle**

- Tout FAIL arrête immédiatement l’exécution.

## C) Politique PROD (neutre)

**À FAIRE**

- Exiger les tokens exacts avant tout build ou déploiement de production.

**Tokens**

- `GO_FOR_PROD_BUILD__TITANE_INFINITY`
- `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`

**À NE PAS FAIRE**

- Déduire, approximer ou reformuler les tokens.

**Éléments de preuve attendus**

- `VERDICT.md` dans le proof pack.

## C.1) Porte de synchronisation de version (obligatoire avant PROD)

**À FAIRE (avant tout build/deploy PROD)**

- Synchroniser la version de release dans tous les fichiers canoniques :
  - `package.json`
  - `src-tauri/Cargo.toml`
  - `src-tauri/tauri.conf.json`
- Synchroniser les métadonnées de déploiement avec la même version cible :
  - `deployment/latest/MANIFEST.json`
  - `deployment/latest/SHA256SUMS_v<version>.txt`
  - `deployment/latest/SIZES_v<version>.txt`

**À NE PAS FAIRE**

- Lancer un build/déploiement PROD avec des versions incohérentes (stop-the-line).

**Porte de contrôle**

- Tout mismatch entre version app/bundle/deployment = FAIL.

## C.2) Gouvernance IDE (VS Code)

**Principe**

- L’IDE fait partie de la surface gouvernée. La surface active doit être minimisée.

**IA — autorité unique**

- EXACT : un seul agent IA **exécutant** à la fois (capable d’écrire/committer/lancer).
- Les autres agents IA doivent être désactivés au niveau espace de travail.
- Multi-agents exécutants simultanés = dérive = stop-the-line.

**E2E — autorité unique**

- EXACT : un seul runner E2E autorité à la fois.
- Runner autorisé : WebdriverIO **ou** Playwright, jamais les deux actifs simultanément.
- Tout rapport de test doit nommer explicitement le runner autorité.

**Extensions — minimisation (socle recommandé TITANE∞)**

- `rust-analyzer`
- `CodeLLDB`
- `Tauri`
- `Even Better TOML`
- `ESLint`
- `Prettier`
- `Tailwind CSS IntelliSense`
- `pnpm` (et helper uniquement si utilisé)
- `Path IntelliSense`
- `Error Lens`
- `YAML`
- `DotENV`
- Git : choisir 1–2 outils (`GitLens` ou `GitHub Pull Requests`)

**À éviter / supprimer si non requis pour TITANE∞**

- Extensions langages hors scope (C/C++/Go/Unity/Firefox Debugger/.NET/Python) si non nécessaires au projet.
- `TypeScript Nightly` ou variantes TS expérimentales.
- Outils Remote/Containers si non utilisés.
- Doublons de runner Vitest (garder un seul).
- Extensions “open in browser” si elles poussent vers une dérive hors Tauri-only.

**Règle opérationnelle**

- Une fonction critique = un seul outil autorité actif.
- Toute exception doit être documentée, justifiée, datée et réversible.

## C.3) Clarification Tauri-only vs Vite dev

**À FAIRE**

- Le serveur Vite est acceptable uniquement comme outil de développement encapsulé dans le workflow Tauri (`tauri dev`).
- Le serveur Vite ne doit jamais être présenté comme preview web autonome ni comme surface de production.
- Les échanges réseau passent par les surfaces gouvernées (API Provider uniquement + garde anti-endpoints non autorisés).

**À NE PAS FAIRE**

- Exposer des endpoints frontend directs.
- Faire des appels localhost hors surface gouvernée.

## D) Anti-silence (UI/IPC/Chat)

**À FAIRE**

- Toujours répondre avec succès ou erreur visible.
- IPC retourne `{ ok, content, error }`.
- Les erreurs doivent être attribuées à leur cause racine : `IPC_*` ≠ `ProviderDown`.
- Toujours en français dans tes instructions.

**À NE PAS FAIRE**

- Laisser l’UI ou l’IPC dans un état silencieux.

**Éléments de preuve attendus**

- Logs E2E et exports.

## E) Règles ring par ring

Ring 1 (Types)

- À faire : schémas stricts, aucune logique runtime.
- À ne pas faire : I/O ou effets de bord.

Ring 2 (Engines)

- À faire : logique pure, déterministe, sans I/O.
- À ne pas faire : réseau, système de fichiers, aléatoire basé sur le temps.

Ring 3 (Services)

- À faire : I/O contrôlés, timeouts, circuit breakers, logs.
- À ne pas faire : retries non bornés.

Ring 4 (Modules/UI)

- À faire : erreurs visibles, ErrorBoundary, `data-testid` stables pour E2E.
- À ne pas faire : échecs silencieux.

## F) Interdiction d’invoke direct

**À FAIRE**

- Utiliser uniquement le client canonique TS <-> Tauri.

**À NE PAS FAIRE**

- Disperser des appels `invoke` bruts dans le codebase.

## G) Tests et portes de contrôle avant DONE

**À FAIRE**

- Exécuter les tests et portes de contrôle requis pour le ring impacté.
- Enregistrer les preuves dans `reports/`.

**À NE PAS FAIRE**

- Marquer DONE sans preuve PASS.

## H) Rollback

**À FAIRE**

- Fournir des étapes de `git restore` ou `git revert`.

**À NE PAS FAIRE**

- Utiliser des commandes destructives.

## Exigence de métadonnées de changement

**À FAIRE**

- Pour toute proposition de changement, indiquer le Ring impacté et le statut : EXPERIMENTAL, QUALIFIED ou STABLE.
- Pour tout changement UI, ajouter une entrée dans `registry/ui-events.jsonl`.
