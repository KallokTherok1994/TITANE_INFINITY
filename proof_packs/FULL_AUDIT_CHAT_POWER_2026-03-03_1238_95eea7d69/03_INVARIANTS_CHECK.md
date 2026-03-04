# 03_INVARIANTS_CHECK

Timestamp: 2026-03-03T13:16:00-05:00

## Invariant: Tauri-only en production

- Statut: PASS
- Vérification:
	- UI de config branchée sur `tauriClient` (IPC canonique), pas d’appel HTTP direct dans `ConfigurationHub.tsx`.
	- Commandes backend enregistrées côté Tauri (`main.rs`) et allowlist mises à jour (`commands/security.rs`, `src/lib/security.ts`).
- Preuve: scans bootstrap + grep ciblés + diff `08_DIFF_FILES.md`.

## Invariant: Online-first gouverné + fallback local obligatoire

- Statut: PASS
- Vérification:
	- Chemin réseau gouverné attesté (`SearchGatewayService::default_governed` côté backend).
	- Fallback explicite en absence de backend full (erreur gouvernée non silencieuse).
	- Durcissement parsing metadata stream côté frontend pour éviter crash parse et maintenir retour visible.
- Preuve: `conversation_engine/commands.rs` + diff TS (`chatEngine.ts`, `api/chat.ts`, `services/tauriClient.ts`).

## Invariant: Architecture 4-Ring stricte

- Statut: PASS
- Vérification:
	- `pnpm test:architecture` exécuté x3, PASS x3.
- Preuve: `05_TESTS_X3.log`.

## Invariant: Stabilité capabilities/allowlists

- Statut: PASS
- Vérification:
	- Nouvelles commandes chat config/profils ajoutées dans allowlists backend/frontend.
- Preuve: diff sur `src-tauri/src/commands/security.rs` et `src/lib/security.ts`.

## Invariant: Anti-silence IPC/UI

- Statut: PASS
- Vérification:
	- Contrat `{ok, content, error}` implémenté côté backend config update.
	- UI consomme des enveloppes et remonte erreurs visibles.
	- Parsing stream durci pour éviter exception bloquante silencieuse.
- Preuve: `src-tauri/src/config/update.rs`, `src/pages/ConfigurationHub.tsx`, `src/services/ai/chatEngine.ts`.

## Invariant: Pas de boucle non bornée

- Statut: PASS
- Vérification:
	- Débounce flush avec task coalescée, abort explicite des handles, flush immédiat borné.
	- Aucune boucle infinie ajoutée dans périmètre modifié.
- Preuve: `src-tauri/src/chat_engine/memory.rs`.

## Conclusion invariants

- Résultat global invariants: PASS.
- Stop-the-line: non déclenché sur le périmètre audité.

