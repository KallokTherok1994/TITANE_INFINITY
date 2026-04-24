# ROLLBACK

Date: 2026-03-15
Pack: `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0`

Rollback Commands

- `git restore -- src-tauri/src/commands/governance_commands.rs`
- `git restore -- src/features/governance-center/services/governanceService.ts`
- `git restore -- scripts/autoheal/autoheal_rules.jsonl`
- `git restore -- proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/05_ADMIN_INTERACTIONS_FULL_INDEX.md`
- `git restore -- proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/06_ADMIN_TRUTH_CHAIN.md`
- `git clean -f -- proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/14_governance_backend_signatures_postfix.txt proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/15_governance_service_contract_postfix.txt proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/16_cargo_check_postfix_2.log proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/17_tsc_noemit_postfix.log proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/18_autoheal_gate_postfix.log proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/admin_phase/19_verify_instructions_postfix.log proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/VERDICT.md proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/ROLLBACK.md`
