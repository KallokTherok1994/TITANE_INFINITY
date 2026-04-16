# CHAT_LONG_MESSAGE_VISIBILITY_2026-04-16

Date: 2026-04-16
Status: PASS

## Scope

- Corriger la disparition apparente des messages conversation tres longs sur la surface chat canonique.
- Supprimer la borne fixe 100k du chemin virtualise quand aucun plafond explicite n'est configure.
- Conserver un signal `titane-message-truncated` strictement reserve aux cas ou une limite UI explicite filtre reellement des messages.

## Root Cause

- `VirtualizedMessageList` rejetait les messages de plus de 100000 caracteres avant meme de decider si la surface devait revenir a `MessageList` pour un rendu naturel.
- Le fallback de hauteur naturelle existait deja, mais il etait court-circuite par ce filtrage amont.
- Le test navigateur initial lisait trop strictement `textContent()` du message utilisateur sans tenir compte du chrome UI adjoint, ce qui masquait la verite produit validee par la surface.

## Fix Applied

- Remplacement de la borne fixe par une limite optionnelle issue de `window.TITANE_MAX_MESSAGE_LENGTH`.
- Emission de `titane-message-truncated` uniquement lorsqu'une limite configuree filtre reellement les messages.
- Ajout de tests unitaires couvrant les contenus assistant >100k et de la lane Playwright ciblee `TEST LONG MESSAGE`.

## Validation

- `./node_modules/.bin/vitest run src/components/chat/MessageList.test.tsx src/components/chat/__tests__/VirtualizedMessageList.test.tsx` -> PASS
- `TITANE_E2E_TAURI=1 TITANE_E2E_USE_WEBSERVER=1 ./node_modules/.bin/playwright test e2e/runtime-validation/chat-ar20.spec.ts --project chromium --grep "TEST LONG MESSAGE"` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS

## Result

La surface conversation ne perd plus les messages tres longs par simple passage dans le chemin virtualise; elle repasse honnetement sur le rendu naturel, et toute alerte de troncature est desormais conditionnee par une limite UI explicitement configuree.# CHAT_LONG_MESSAGE_VISIBILITY_2026-04-16

- Scope: conversation long-message rendering and anti-truncation signal path.
- Root cause: `VirtualizedMessageList` filtered `content.length > 100000` before the natural-height fallback could run.
- Implemented fix: render limit is now opt-in via `window.TITANE_MAX_MESSAGE_LENGTH`; long assistant messages fall back to `MessageList` instead of being dropped.
- Unit proof: `./node_modules/.bin/vitest run src/components/chat/MessageList.test.tsx src/components/chat/__tests__/VirtualizedMessageList.test.tsx` -> PASS (`2 files`, `5 tests`).
- E2E proof lane: `TITANE_E2E_TAURI=1 TITANE_E2E_USE_WEBSERVER=1 ./node_modules/.bin/playwright test e2e/runtime-validation/chat-ar20.spec.ts --project chromium --grep "TEST LONG MESSAGE"` -> PASS (`1 passed`, `9999 caracteres affiches sans alerte de troncature`).
- Runtime note: the first Playwright run failed on an over-strict assertion using raw `textContent().length`; the assertion was corrected to validate full payload presence instead of raw node length.
- Governance proof: `bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh` -> PASS (`PASS=30`, `FAIL=0`).
