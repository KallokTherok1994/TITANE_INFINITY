# 06_RING_SURFACE_MAP.md

Date (UTC): 2026-02-26

## Règles ring
- Ring 1 Types: pas d'I/O.
- Ring 2 Engines: logique pure, sans I/O.
- Ring 3 Services: I/O contrôlé uniquement.
- Ring 4 Modules/UI: orchestration + IPC visibles.

## Validation structurelle (commande de contrôle)
- UI -> open-web primitives:
	- `rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket" src`
- Backend HTTP gouverné hors façade centrale:
	- `rg -n "reqwest|ureq" src-tauri/src | rg -v "src-tauri/src/core/http_types.rs"`
- Services important UI (forbidden):
	- `rg -n "from ['\"].*(components|pages|ui)" src/services src/core src/lib`
- Types important Services (forbidden):
	- `rg -n "from ['\"].*(services|engines)" src/types`

## État initial
- Violations ring critiques prouvées: aucune bloquante identifiée à ce stade.
- `G_RING_INTEGRITY`: **EN COURS** (validation x3 en phase de sealing).

