# ROLLBACK

## En cas de régression après ce PROD deploy

### Restaurer les anciens artifacts dans deployment/latest

```bash
git restore -- \
  deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage \
  deployment/latest/TITANE-Infinity_27.2.0_amd64.deb \
  deployment/latest/titane-infinity \
  deployment/latest/SHA256SUMS.txt \
  deployment/latest/SHA256SUMS_v28.0.0.txt \
  deployment/latest/CHECKSUMS.sha256 \
  deployment/latest/MANIFEST.json
```

### Rollback de la normalisation IPC si nécessaire

```bash
git revert 7d210d2a8  # fix(ipc): normalize conversation_generate payload
```

## SHA256 des anciens artifacts (v27.2.0 pré-fix)

```
c56ea5a8e9c787413028708e5831e331706378c23a4ce2f48e69707eaaf48286  TITANE-Infinity_27.2.0_amd64.AppImage
48988daf0e19297aa1d97b088929418dee8da29cd2e79fd5b60f1d184a648c40  TITANE-Infinity_27.2.0_amd64.deb
5602052eb4a90810ac11f418b4b8e5dcfe0c3c1d2bf955fb388a9b42beafdf7b  titane-infinity
```
