# Mission
Sceller sur MAIN le lot CSP+XP: correction de l injection meta CSP en runtime Tauri et persistance durable des XP chat sur la surface Experience.

# Scope
- Frontend security bootstrap CSP
- Persistance XP chat frontend/backend mock Tauri
- Surfaces UI Experience/ThinkingPanel
- Mapping et registres gouvernes

# Actions
1. Validation Rust ciblee `experience_state_tests`
2. Validation Vitest ciblee (XP + CSP)
3. Validation Playwright ciblee `CHAT_XP_GENERATION_SYNC`
4. Gates gouvernance: recurrence + instructions + index agents/prompts
5. Preparation du pack de preuve et commit direct MAIN

# Evidence
- `cargo test --manifest-path src-tauri/Cargo.toml experience_state_tests`: PASS (3/3)
- `pnpm exec vitest run ...`: PASS (7 fichiers, 35 tests)
- `TITANE_E2E_FULL=1 pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --grep CHAT_XP_GENERATION_SYNC`: PASS (1/1)
- `pnpm run check`: PASS
- `bash scripts/autoheal/detect_recurrence.sh`: PASS
- `bash scripts/verify_instructions.sh`: PASS
- `bash scripts/verify/verify_agents_index.sh`: PASS
- `bash scripts/verify/verify_prompt_files_index.sh`: PASS

# Risks
- Risque faible de bruit runtime local (HMR, logs monitor) sans impact fonctionnel sur les assertions qualifiees.
- Aucune regression bloquante detectee sur les tests executes.

# Verdict
SEALED

# Next Step
- Push de MAIN vers origin si demande utilisateur explicite.

# Rollback Note
Utiliser le plan documente dans `proof_packs/CSP_XP_MAIN_SEAL_2026-04-24/ROLLBACK.md`.
