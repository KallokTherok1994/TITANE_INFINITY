# Rollback

## This session's patches (2 commits)
git revert 2f9461f90 d15e2a692 --no-edit
git push origin MAIN

## Full v28.6.0 release rollback (if required)
git revert 43d74641a b93675c91 --no-edit
/home/titane-os/.local/bin/gh release delete v28.6.0 --repo KallokTherok1994/TITANE_INFINITY --yes
