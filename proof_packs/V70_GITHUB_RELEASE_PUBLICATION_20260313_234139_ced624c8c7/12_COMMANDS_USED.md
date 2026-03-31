# Commands Used

- git branch --show-current
- git status --short
- git fetch origin MAIN
- git rev-parse --short HEAD
- git rev-parse --short origin/MAIN
- gh release list -L 10
- git ls-remote --tags origin
- ls -lh deployment/latest/...
- sha256sum deployment/latest/...
- node scripts/gate-appimage-index.mjs
- gh auth status
- git add proof_packs/V70_GITHUB_RELEASE_PUBLICATION_20260313_234139_ced624c8c7
- git commit -m "docs(release): add V70 GitHub release publication proof pack"
- git push origin MAIN
- git tag -a v27.2.0-v69-sealed-20260313
- git push origin v27.2.0-v69-sealed-20260313
- gh release create v27.2.0-v69-sealed-20260313 ...
- gh release view v27.2.0-v69-sealed-20260313
