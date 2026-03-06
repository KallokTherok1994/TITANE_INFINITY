# FIX LOG

## ENV

- `corepack prepare pnpm@10.28.2 --activate`: PASS
- `pnpm install --frozen-lockfile`: PASS
- `pkg-config glib-2.0`: `2.80.0`
- `pkg-config gtk+-3.0`: `3.24.41`
- `pkg-config webkit2gtk-4.1`: `2.50.4`

## FIX-001 (P0)

- Objet: retirer traces `HttpClient::new` / `http_client` dans engines Ring2.
- Fichiers:
	- `src-tauri/src/engines/unified_memory/summarizer.rs`
	- `src-tauri/src/engines/unified_memory/embeddings.rs`
	- `src-tauri/src/overdrive/api_bridge.rs`
- Commit: `90ca3a261`

## FIX-002 (P0)

- Objet: guard OneDoor script.
- Fichier:
	- `scripts/verify/network-one-door.sh`
- Commit: `304d6616a`

## FIX-003 (P1)

- Objet: supprimer monkey-patch runtime `window.fetch=`.
- Fichier:
	- `src/services/selfHealing/selfHealingObserver.ts`
- Commit: `e18737ba8`

## FIX-004 (P1)

- Objet: adapter IPC canonique + garde `IPC_MALFORMED_RESPONSE` + timeout borne.
- Fichier:
	- `src/utils/invoke.ts`
- Commit: `6a4375b5f`

## FIX-005 (scripts/governance)

- Objet: reparer registres AutoHeal (duplicate id + latest fix capture) et finaliser format.
- Fichiers:
	- `scripts/autoheal/autoheal_rules.jsonl`
	- `registry/autofix-autoheal-rules.jsonl`
	- `e2e/desktop/ui-ultra-full.e2e.js`
	- `src/utils/invoke.ts`
- Commit: `4b93afb73`

## AutoHeal validators

- `bash scripts/autoheal/detect_recurrence.sh`: PASS
- `node scripts/qa/check_autofix_autoheal_registry.mjs`: PASS
- `bash scripts/verify_instructions.sh`: PASS
