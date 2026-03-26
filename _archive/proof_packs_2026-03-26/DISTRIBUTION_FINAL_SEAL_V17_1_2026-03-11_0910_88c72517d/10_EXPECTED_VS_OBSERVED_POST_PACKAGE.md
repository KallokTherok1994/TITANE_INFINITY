# 10 Expected Vs Observed Post Package

| Check | Expected | Observed | Status |
|---|---|---|---|
| HEAD alignment | HEAD == origin/MAIN | `88c72517d` == `88c72517d` | PASS |
| Bundle presence | deb + AppImage 27.2.0 exist | both present with hashes | PASS |
| latest canonical | only current 27.2.0 package set | `NO_STALE_26x_VISIBLE` | PASS |
| checksums | `sha256sum -c` all pass | AppImage/deb/binary PASS | PASS |
| runtime package UI | WDIO post-package run passes | `WDIO_UI_QUALITY_EXIT=0` | PASS |
| measurable UI quality | Q1-Q4 all passing | all flags PASS in metrics JSON | PASS |
