# ROLLBACK

## Trigger

Execute rollback if post-deploy runtime regression is observed on `Titan-Stable_27.2.0_amd64.AppImage`.

## Commands

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
cp -f proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/backup_Titan-Stable_27.0.5_amd64.AppImage deployment/latest/Titan-Stable_27.0.5_amd64.AppImage
chmod +x deployment/latest/Titan-Stable_27.0.5_amd64.AppImage
rm -f deployment/latest/Titan-Stable_27.2.0_amd64.AppImage
sha256sum deployment/latest/Titan-Stable_27.0.5_amd64.AppImage
```

## Validation After Rollback

- Start restored AppImage and confirm expected boot behavior.
- Re-run smoke check and verify boot marker.
