# ROLLBACK

1. Revert Git en mode traceable: `git revert <commit>` (ordre inverse si plusieurs commits).
2. Restaurer release precedente cote deployment: recopier les artefacts precedents vers `deployment/latest/` puis regenerer `SHA256SUMS.txt`, `SIZES.txt`, `MANIFEST.json`, `VERSION.txt`.
3. Restaurer package systeme precedent: `sudo dpkg -i deployment/latest/titane-infinity_<version_precedente>_amd64.deb`.
4. Relancer sync launchers/icones: `bash scripts/post-build/update-desktop-icons.sh`.
5. Verifier l etat final: `which -a titane-infinity`, `dpkg -s titane-infinity | rg '^Version:'`, lecture des launchers user/system.
