# 01 Distribution State Discovery

Primary evidence: `raw/01_state_discovery.log`.

- HEAD == origin/MAIN: `88c72517ddf12cec1078db0a92e8fdd801e60adf`
- Version marker in `src-tauri/tauri.conf.json`: `27.2.0`
- Bundle files present with expected 27.2.0 names and hashes
- `deployment/latest` contains 27.2.0 artifacts and `NO_STALE_26x_VISIBLE`
- `CHECKSUMS.sha256` validates AppImage/deb/binary with PASS
- Host install target `/usr/bin/titane-infinity` hash differs from canonical latest

Note:

- First line of `raw/01_state_discovery.log` contains terminal control-sequence pollution from an initial grouped-redirection command; all subsequent lines are valid evidence.
