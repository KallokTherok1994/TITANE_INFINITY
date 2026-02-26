# 01_TRUTH_SNAPSHOT.md

Date (UTC): 2026-02-26

## Snapshot dépôt
- HEAD: `fa973695`
- Branche: `MAIN`
- Working tree au démarrage du run: propre (`STATUS_SHORT_COUNT=0`)
- Preuve brute: `11_PROOF_LOGS.txt`

## Entrypoints chat et chaîne canonique (observé)
- Entrypoint canonique: `src-tauri/src/conversation_engine/commands.rs` (`conversation_generate`, `create_new_conversation`).
- Chaîne effective observée dans `conversation_generate`:
	1) `RouterEngine::classify`
	2) `PolicyEngine::evaluate`
	3) `ResilienceEngine::is_request_allowed`
	4) `MemoryEngine::decide_memory_strategy`
	5) `SearchEngine::normalize` (si search autorisée)
	6) Persistance via artefacts Conversation OS
	7) Trace JSON renvoyée au frontend

## Chemins legacy / contournements potentiels
- `overdrive/chat_orchestrator.rs` contient encore `chat_send_message` marqué DEPRECATED.
- `commands/security.rs` indique retrait de `chat_send_message` de l'allowlist prod.
- Statut: **UNKNOWN partiel** sur la reachability UI réelle de tous les chemins legacy (présence détectée, exploitabilité à confirmer via gates).

## Surfaces réseau actuelles
- Backend HTTP brut (`reqwest|ureq|hyper|...`): `71` occurrences (brut, bruit inclus sur mots "Hyper").
- Backend HTTP gouverné hors allowlist façade centrale: `0`.
- Surface gateway gouvernée: `src-tauri/src/services/network_gateway.rs`.
- Search gouvernée: `src-tauri/src/services/search_gateway.rs` avec erreur explicite `CREDENTIALS_MISSING`.
- Frontend primitives web détectées (brut): `155` (inclut tests/docs/mocks potentiels).

## Composants mémoire / persistence observés
- `DbService` présent: `src-tauri/src/services/db_service.rs`.
- Tables observées: `events`, `snapshots`, `provider_decisions`, `sources`, `failures`.
- Modèle append-only visible côté API d'écriture (insert-only).

## Structure d'évidence/gates existante
- Le dépôt contient des packs antérieurs scellés.
- Ce run crée un pack dédié: `docs/_evidence/conversation_os_v1_20260226_122608/`.

## Tooling observé
- Node: `v24.0.0`
- pnpm: `10.30.2`
- cargo: `1.91.1`
- rustc: `1.91.1`
- `pnpm lint`: `exit=0`
- `pnpm test`: `exit=0` (203 fichiers de tests passés, 3216 tests passés, extrait dans `11_PROOF_LOGS.txt`)

## Évaluation vérité initiale
- Les briques runtime demandées existent déjà majoritairement.
- Le run courant est orienté **validation/scellage** + correction ciblée seulement si gate fail.

