# B30 — Résumé décisionnel (2026-01-14)

## Contexte
- Objectif: garder `MAIN` **vert** après l’alignement du contrat IPC Governance (Rust ↔ TS ↔ docs) et le push.
- Contrainte non négociable: **mode dev uniquement** (pas de build “stable”, pas de serveurs).

## Incident (symptôme)
- Gate Vitest OMEGA cassée hors “Governance IPC”.
- Erreurs observées pendant le warmup/self-heal: `Response validation failed: Response is null or undefined` sur des commandes Tauri non mockées.

## Cause racine
- En tests (Vitest), certaines invocations IPC Tauri n’étaient pas mockées → `invoke(...)` retournait `undefined`.
- Le wrapper `secureInvoke` valide strictement les réponses; `null/undefined` est rejeté sauf exceptions explicites → échec de test/gate.

## Correction minimale
- Ajout de mocks dans `src/test/setup.ts` pour couvrir:
  - `get_copilot_key_status`
  - `selfheal_get_vitals`, `selfheal_load_profile`, `selfheal_save_profile`, `selfheal_clear_cache`, `selfheal_reset_state`
- Objectif: éliminer les retours `undefined` en environnement test, **sans** modifier le comportement runtime.

## Preuves conservées (v27)
- **B28**: preuve d’un test ciblé OMEGA repassant au vert après ajout des mocks.
- **B29**: snapshot “repo vert” (git + COPILOT-XS validate/status/security-scan + check ports/process), commité et poussé pour conservation.

## Validation (état final)
- `copilot-xs:test` : `EXIT:0`
- `copilot-xs:validate` : PASS
- `copilot-xs:security-scan` : “No known vulnerabilities found”
- Check sécurité dev: aucun port (4000/5173/4173/1430), aucun process dev (vite/tauri dev).

## Notes
- Certains tests E2E déclenchent volontairement des scénarios “injection” (ex: `<script>`); ces logs peuvent apparaître sans indiquer une régression si les assertions attendent un blocage.
