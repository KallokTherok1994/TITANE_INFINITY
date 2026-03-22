# G6: Build Reproducibility — BLOCKED_ENV

**Status:** BLOCKED_ENV  
**Reason:** Tauri build system dependencies not available in this environment.  
**Required packages:** libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev libasound2-dev

**To provision (Debian/Ubuntu):**
```bash
sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev libssl-dev libasound2-dev
```

**Reference:** https://tauri.app/start/prerequisites/

**Unblock:** After installing deps, re-run `G6_SKIP_ENV_CHECK=1 bash scripts/gates/g6-build-reproducibility.sh` or in a fully provisioned CI environment.

G6 does not register as a blocking FAIL in environments where build deps are intentionally absent.
