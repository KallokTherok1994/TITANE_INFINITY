# Rollback

## This session's patch
git revert 9f905f7a5 --no-edit
git push origin MAIN

## Prior session patches (post-seal governance)
git revert 700f0ba92 54478c390 2f9461f90 5bd4a6448 d15e2a692 --no-edit

## Full v28.6.0 release rollback
git revert 43d74641a b93675c91 --no-edit
gh release delete v28.6.0 --repo KallokTherok1994/TITANE_INFINITY --yes
# Fallback binary: deployment/latest/TITANE-Infinity_28.5.0_amd64.AppImage
