# Rollback Reference

## This session (proof pack only)
git revert HEAD --no-edit  # removes proof pack commit — safe, no product change

## Prior governance commits (post-seal)
git revert 2081cc719 9f905f7a5 700f0ba92 54478c390 2f9461f90 5bd4a6448 d15e2a692 --no-edit

## Full v28.6.0 release rollback
git revert 43d74641a b93675c91 --no-edit
gh release delete v28.6.0 --repo KallokTherok1994/TITANE_INFINITY --yes
# Fallback: deployment/latest/TITANE-Infinity_28.5.0_amd64.AppImage (90M, 2026-03-20)

## Rollback target
- Prior stable: v28.5.0 (deployment/latest/ AppImage present)
- Prior proof pack: POST_PROD_TRUTH_RECONCILIATION_2026-03-21_1448_d15e2a692/
