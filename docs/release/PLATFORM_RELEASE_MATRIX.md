# TITANE_INFINITY — Platform Release Matrix

| Platform surface | Current state | Proof boundary |
|---|---|---|
| Windows 11 local dev | primary | Local PowerShell validators and DEV Tauri proof. |
| Windows MSI v35.x | build proven, install blocked | Current MSI artifact + SHA256 PASS; local install smoke blocked by Windows Installer admin privilege requirement. |
| Windows MSI v34.0.12 | historically proven | Historical artifact/checksum only; cannot prove v35.x. |
| Linux v35.1.9 | proven | Linux AppImage/DEB/RPM proof only; cannot prove Windows lanes. |
| Android | separate | APK/AAB/device proof separate from desktop release proof. |
| macOS | not active | No current release proof. |

## Windows v35.1.9 MSI Proof

- MSI: `titane-infinity_35.1.9_x64_en-US.msi`
- SHA256: `dc1445107a54e5a83b1059ef0093f4633ffd60965adc91f8d9cef95eef7dc937`
- Build: PASS on Windows 11 local host via WiX MSI.
- Install smoke: `BLOCKED_ADMIN_REQUIRED` (`msiexec` exit 1603 / Error 1925).
- Rollback: `DOCUMENTED_NOT_EXECUTED`.
- Final state: `WINDOWS_11_MSI_V35_BUILD_AND_SMOKE_BLOCKED`.

## Anti-Contamination

Linux proof cannot satisfy Windows lanes. Windows CI artifact proof cannot satisfy local install lanes. Historical proof cannot satisfy current version lanes. Generated or legacy docs cannot satisfy current authority lanes.
