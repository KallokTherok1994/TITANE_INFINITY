VERDICT: PASS

Scope sealed:
- TOTAL_DEV native desktop path is now proven on the real Tauri window via the canonical WDIO runner.
- Certification is based on three consecutive passing runs after rebuilding the release executable with current assets.

Residual note:
- The debug executable path is not used as certification authority because, under this launcher path, it did not reach app-ready.
- The release executable rebuilt from src-tauri/tauri.conf.json is the authoritative runtime for this proof.
