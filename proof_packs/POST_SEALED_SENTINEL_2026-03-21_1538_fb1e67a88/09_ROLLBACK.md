# Rollback Reference

## This session (proof pack only)
git revert HEAD --no-edit  # safe, no product change

## v28.6.0 rollback (if reopen trigger proven)
git revert 43d74641a b93675c91 --no-edit
gh release delete v28.6.0 --repo KallokTherok1994/TITANE_INFINITY --yes
# Fallback binary: deployment/latest/TITANE-Infinity_28.5.0_amd64.AppImage
