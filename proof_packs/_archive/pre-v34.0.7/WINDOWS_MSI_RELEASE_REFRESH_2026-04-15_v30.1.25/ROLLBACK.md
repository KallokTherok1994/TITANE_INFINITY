# ROLLBACK

1. Re-upload the previously published Windows assets again if a deterministic rollback of the refresh is required:
   `cd /tmp/titane-win-release-refresh && GH_PAGER=cat gh release upload v30.1.25 --repo KallokTherok1994/TITANE_INFINITY "TITANE Infinity_30.1.25_x64_en-US.msi" "SHA256SUMS.txt" --clobber`
2. Restore the local proof surfaces if this refresh session should be discarded before commit:
   `git restore -- RELEASE_SURFACE_INVENTORY.md scripts/autoheal/autoheal_rules.jsonl`
3. Remove the local report and proof pack if this refresh proof should not remain in the repository:
   `rm -rf proof_packs/WINDOWS_MSI_RELEASE_REFRESH_2026-04-15_v30.1.25 reports/WINDOWS_MSI_RELEASE_REFRESH_2026-04-15_v30.1.25.md`