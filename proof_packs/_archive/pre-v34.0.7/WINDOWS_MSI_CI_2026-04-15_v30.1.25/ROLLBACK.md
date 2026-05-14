# ROLLBACK

1. Restore the Windows workflow action versions if this hardening must be reverted:
   `git restore -- .github/workflows/windows-msi-on-demand.yml`
2. Remove the Windows CI proof surfaces if this reporting session is intentionally discarded before commit:
   `rm -rf proof_packs/WINDOWS_MSI_CI_2026-04-15_v30.1.25 reports/WINDOWS_MSI_CI_2026-04-15_v30.1.25.md`
3. Restore release inventory and AutoHeal state if this follow-up should not remain recorded:
   `git restore -- RELEASE_SURFACE_INVENTORY.md scripts/autoheal/autoheal_rules.jsonl`