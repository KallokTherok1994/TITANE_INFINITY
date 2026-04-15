# GATE REPORT

- WINDOWS_RERUN_24466843763_COMPLETED: PASS
- WINDOWS_RERUN_ARTIFACT_PRESENT: PASS
- WINDOWS_RERUN_MSI_SHA256_VERIFIED: PASS
- WINDOWS_NODE20_ANNOTATION_BLOCK_ABSENT_IN_WATCHER_SUMMARY: PASS
- GITHUB_RELEASE_V30_1_25_CREATED: PASS
- GITHUB_RELEASE_WINDOWS_MSI_ASSET_UPLOADED: PASS
- GITHUB_RELEASE_SHA256SUMS_ASSET_UPLOADED: PASS

Notes:

- The absence of the old Node 20 warning is evidenced by the completed watcher summary for run `24466843763`, which contains no `ANNOTATIONS` block after upgrading the workflow actions.
- Release asset naming was normalized by GitHub on upload, but the published asset digest matches the verified MSI payload.