# 08 Expected vs Observed Post-Package

| Marqueur UI | Attendu après artefact final | Observé post-package | Criticité | Statut | Preuve |
|-------------|------------------------------|----------------------|-----------|--------|--------|
| Artefact final AppImage | `TITANE-Infinity_27.2.0_amd64.AppImage` présent | Présent, SHA256 `640c1134...` | HIGH | PASS | `raw/05_manifest_checksums_latest_verify.log` |
| Artefact final deb | `TITANE-Infinity_27.2.0_amd64.deb` présent | Présent, SHA256 `105f2cf3...` | HIGH | PASS | `raw/05_manifest_checksums_latest_verify.log` |
| latest non-stale | plus de 26.4.0 visible | `NO_STALE_26x_VISIBLE` | HIGH | PASS | `raw/05_manifest_checksums_latest_verify.log` |
| Manifest cohérent | commit+hashes alignés | `MANIFEST_v27.2.0.json` aligné avec fichiers réels | HIGH | PASS | `raw/05_manifest_checksums_latest_verify.log` |
| Checksums cohérents | `sha256sum -c` tout vert | 3/3 Réussi | HIGH | PASS | `raw/04_latest_refresh_and_manifest.log` |
| Cible runtime non-stale | ne pas utiliser `/usr/bin` stale | WDIO ciblé via `TAURI_BINARY_PATH` sur AppImage/deb payload | HIGH | PASS | `07_POST_PACKAGE_RUNTIME_UI_TRUTH.md` |
| Surface canonique | app et shell présents | run1-3 AppImage PASS | HIGH | PASS | `artifacts/run1/wdio.log` |
| Interaction critique | input/send/response | run1-3 PASS + run_deb2 PASS | HIGH | PASS | `artifacts/run3/wdio.log` / `artifacts/run_deb2/wdio.log` |
| Install deb système | installé via sudo | BLOCKED (mot de passe requis) | MEDIUM | BLOCKED | `raw/06_install_deb.log` |
