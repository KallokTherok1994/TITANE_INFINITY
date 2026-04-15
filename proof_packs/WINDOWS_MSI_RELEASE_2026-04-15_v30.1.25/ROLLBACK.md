# ROLLBACK

1. Delete the GitHub release if publication must be reverted:
   `GH_PAGER=cat gh release delete v30.1.25 --repo KallokTherok1994/TITANE_INFINITY --yes`
2. Restore the local repo proof surfaces if this release-publication session should be discarded before commit:
   `git restore -- RELEASE_SURFACE_INVENTORY.md scripts/autoheal/autoheal_rules.jsonl`
3. Remove the local report and proof pack if this publication proof should not remain in the repository:
   `rm -rf proof_packs/WINDOWS_MSI_RELEASE_2026-04-15_v30.1.25 reports/WINDOWS_MSI_RELEASE_2026-04-15_v30.1.25.md`