# 00_PLAN.md

Date (UTC): 2026-02-26

## Objectif d'exécution
Exécuter un run complet **Conversation OS v1** en micro-phases avec scellage par preuves, sans dérive d'architecture ni extension réseau.

## Hypothèses et preuves attendues
- Le pipeline canonique est déjà `conversation_generate` (OMEGA v2) et non `chat_send_message`.
	- Preuve: scans commandes Tauri + fichiers `conversation_engine` / `overdrive`.
- Les briques de base (DB, policy, router, resilience, gateway) existent déjà.
	- Preuve: lecture des fichiers `db_service.rs`, `policy.rs`, `router.rs`, `resilience.rs`, `network_gateway.rs`.
- Le run peut être validé sans migration destructrice (append-only docs + logs).
	- Preuve: `git status`, `11_PROOF_LOGS.txt`, gates x3.

## Zones inconnues initiales
- Reachability exacte des chemins legacy depuis UI (non seulement présence code).
- Couverture réelle de `NetworkMeta` complet demandé par le prompt.
- Exhaustivité des simulations d'échec côté runtime vs tests existants.

## Stratégie de résolution des inconnues
1. Discovery complète et quantifiée.
2. Cartographie entrypoints + surfaces réseau + stockage.
3. Exécution gates/tests x3.
4. Si une gate échoue: phase concernée marquée BLOCKED, sans contourner les invariants.

## Séquence micro-phases (immuable)
Conforme à la demande utilisateur: 1A → 1B → 2A → 3A → 3B → 4A → 4B → 5A → 5B → 6A → 6B → 2B → 7A → 7B → 8A → 8B → 9.

## Hotspots de risque
- Multiplicité historique des commandes Tauri (dispersion legacy potentielle).
- Ambiguïté entre détection brute (`reqwest|ureq`) et détection gouvernée.
- Scans frontend contenant tests/docs pouvant surévaluer les appels web réels.

## Stop conditions (hard)
- Violation Ring 4-Ring détectée.
- Nouvelle surface réseau hors gateway.
- Micro-phase >10 fichiers touchés (si runtime modif).
- Dépendance nouvelle sans justification + rollback.

## Livrables attendus par phase
- Mise à jour de `04_MICRO_PHASES.md`, `05_FILES_TOUCHED.md`, `06_RING_SURFACE_MAP.md`, `09_GATES_STATUS.md`.
- Logs bruts dans `11_PROOF_LOGS.txt`.
- Exécution x3 documentée dans `10_TEST_RUNS_X3.md`.

