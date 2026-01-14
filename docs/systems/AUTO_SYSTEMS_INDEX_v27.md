# AUTO_SYSTEMS_INDEX_v27 — Index des systèmes AUTO-* (preuve-first)

**Date:** 2026-01-13

Objectif: pointer les surfaces réelles AutoHeal/AutoFix/Auto-Healing (scripts, docs, backend Rust/Tauri, frontend TS, tests) avec preuves (fichier + lignes).

## Gouvernance (rappel)

- Mode dev-only (interdiction builds prod / packaging): `.github/instructions/titane.instructions.md` lignes 1-31.

## 1) Documentation

- Doc auto-heal/auto-fix (historique): `docs/AUTO_HEAL_SYSTEMS.md` lignes 1-17.

## 2) Entrées scripts (package.json)

- Script d’audit auto-fix: `package.json` lignes 49-55.
  - `audit:auto-fix`: `./scripts/audit/06-auto-fix.sh`
- Script auto-heal: `package.json` lignes 62-69.
  - `auto-heal`: `./scripts/maintenance/auto-heal.sh`

## 3) Script de validation (validation “AUTO-HEAL systems”)

- Validation des scripts + doc: [scripts/validate-auto-heal.sh](../../scripts/validate-auto-heal.sh#L8-L120).
  - Preuve d’exécution: [docs/_evidence/v27/B11_auto_heal_validation_fixed_2026-01-13.txt](../../docs/_evidence/v27/B11_auto_heal_validation_fixed_2026-01-13.txt#L1-L35)
  - Vérifie l’existence/exécutabilité de:
    - `scripts/maintenance/health-check-enhanced.sh`
    - `scripts/maintenance/proactive-monitor.sh`
    - `scripts/audit/06-auto-fix.sh`
    - `scripts/verify/pre-deployment-check.sh`
  - Vérifie `docs/AUTO_HEAL_SYSTEMS.md`

## 4) Backend Rust/Tauri — surfaces Auto*

### 4.1 États et commandes “singularity_fusion::*”

- Enregistrement de states AutoFix/AutoHeal: [src-tauri/src/main.rs](../../src-tauri/src/main.rs#L506-L521).
- Commandes exposées (IPC) AutoFix/AutoHeal: [src-tauri/src/main.rs](../../src-tauri/src/main.rs#L812-L857).

- Contrat IPC (docs) ↔ tests `invoke()` (reality check):
  - Matrix: [docs/backend/IPC_CONTRACT.md](../backend/IPC_CONTRACT.md#L270-L291)
  - Détails: [docs/backend/IPC_CONTRACT.md](../backend/IPC_CONTRACT.md#L461-L489)
  - Backend map: [docs/backend/BACKEND_MAP.md](../backend/BACKEND_MAP.md#L295-L306)
  - SINGULARITY vΩ: [docs/SINGULARITY_FUSION_vΩ.md](../SINGULARITY_FUSION_vΩ.md#L641-L657)
  - Tests invoke(): [src/__tests__/singularity-fusion-integration.test.ts](../../src/__tests__/singularity-fusion-integration.test.ts#L225-L236)
  - Preuve: [docs/_evidence/v27/B13b_ipc_contract_auto_commands_clean_2026-01-13.txt](../../docs/_evidence/v27/B13b_ipc_contract_auto_commands_clean_2026-01-13.txt#L1-L160)
  - Note (écart doc ↔ repo): `docs/backend/IPC_CONTRACT.md` cite `src/services/healthService.ts` mais le fichier est absent.
    - Preuve: [docs/_evidence/v27/B14_ipc_contract_vs_repo_healthservice_gap_2026-01-13.txt](../../docs/_evidence/v27/B14_ipc_contract_vs_repo_healthservice_gap_2026-01-13.txt#L1-L60)

- Contrat IPC — reality check “caller”:
  - `IPC_CONTRACT.md` cite `src/services/healthService.ts` pour `autoheal_detect_broken_modules`, mais aucun fichier `healthService.ts` n’existe dans `src/services/`.
  - Preuve (inclut handlers Tauri + allowlists + mocks + tests): [docs/_evidence/v27/B14_ipc_contract_autoheal_detect_callers_2026-01-13.txt](../../docs/_evidence/v27/B14_ipc_contract_autoheal_detect_callers_2026-01-13.txt#L1-L120)

- Implémentation backend (Rust) AutoFix/AutoHeal:
  - Module exports: [src-tauri/src/singularity_fusion/mod.rs](../../src-tauri/src/singularity_fusion/mod.rs#L1-L33)
  - AutoFix impl: [src-tauri/src/singularity_fusion/auto_fix.rs](../../src-tauri/src/singularity_fusion/auto_fix.rs#L53-L216)
  - AutoHeal impl: [src-tauri/src/singularity_fusion/auto_heal.rs](../../src-tauri/src/singularity_fusion/auto_heal.rs#L33-L291)
  - Preuve (inventaire + extraits + fns): [docs/_evidence/v27/B12b_auto_systems_backend_map_clean_2026-01-13.txt](../../docs/_evidence/v27/B12b_auto_systems_backend_map_clean_2026-01-13.txt#L1-L120)
  - AutoFix: `singularity_fusion::autofix_*`
  - AutoHeal: `singularity_fusion::autoheal_*`

### 4.2 Module Rust “AUTO-HEAL” (v16)

- Module et logs `[AUTO-HEAL]`: `src-tauri/src/auto_heal.rs` lignes 1-112.
  - Définit `AutoHealState` + fonctions `log_event` / `log_action`.

### 4.3 “OVERDRIVE AUTO-HEAL” (v14)

- Engine avancé + logs `[AUTO-HEAL]`: `src-tauri/src/overdrive/auto_heal.rs` lignes 1-120.

### 4.4 “AUTO-HEALING” (META, v18.2)

- Engine `AutoHealingEngine`: `src-tauri/src/meta/auto_healing.rs` lignes 1-78.
  - Refuse les actions si disabled: `src-tauri/src/meta/auto_healing.rs` lignes 98-113.

### 4.5 SystemHealth: toggle auto-heal

- Commande `health_set_auto_heal`: `src-tauri/src/commands/system_health_commands.rs` lignes 110-125.

## 5) Frontend TypeScript — surfaces Auto*

### 5.1 Moteur auto-heal (frontend)

- `autoHealEngine` (logger `[AUTO-HEAL]`, types, config): `src/services/ai/autoHealEngine.ts` lignes 1-119.

### 5.2 Façade unifiée (v27)

- Façade + imports `autoHealEngine`: `src/services/ai/unifiedHealingFacade.ts` lignes 1-30.
- Entrée principale `heal()` → `autoHealEngine.detectError(...)`: `src/services/ai/unifiedHealingFacade.ts` lignes 129-176.
- Healing “simple” → `autoHealEngine.awaitHealAction(...)`: `src/services/ai/unifiedHealingFacade.ts` lignes 220-257.

### 5.3 Hook chat (stats + métadonnées)

- `omnisStats.autoHealCount`: `src/hooks/useChat.ts` lignes 214-233.
- Mapping `omegaMetadata.autoHealed`: `src/hooks/useChat.ts` lignes 1369-1400.
- Calcul `autoHealCount`: `src/hooks/useChat.ts` lignes 1791-1814.

## 6) Tests

- Scénario “trigger auto-heal” (Gemini failures): `src/__tests__/omega-provider-tests.test.ts` lignes 89-118.
- Test d’intégration IPC autoheal_*: `src/__tests__/singularity-fusion-integration.test.ts` lignes 225-236.
