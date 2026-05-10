# UI Desktop Remote CI Readiness v59

**Session**: `TITANE_UI_DESKTOP_IPC_RESPONSE_REFLECTION_AND_REMOTE_SYNC_v59`
**Date**: 2026-05-10

---

## Remote CI Readiness Assessment

### Current State: LOCAL_ONLY

All v59 proofs were produced on the local workstation (`titane-os@TITANE-OS`) using:
- `src-tauri/target/release/titane-infinity` (local build)
- `/usr/bin/WebKitWebDriver` (local WebKitWebDriver)
- tauri-driver port 4444 / native-port 4445

### Remote CI Requirements

| Requirement | Status | Notes |
|---|---|---|
| `TITANE_ENFORCE_BINARY_FRESHNESS=0` | ✅ Used in v59 | Prevents freshness gate failures |
| `TITANE_E2E_FULL=1` | ✅ Used in v59 | Enables full module coverage |
| `TITANE_PROOF_ARTIFACT` env | ✅ Configured | Artifact path injectable |
| WebKitWebDriver available | ⏳ Remote TBD | Must be ≥ 2.40 |
| Binary artifact path | ⏳ Remote TBD | Must match `wdio.desktop.conf.cjs` binary path |
| Display (XVFB or headless) | ⏳ Remote TBD | WDIO needs Xvfb on CI |

### Remote Sync Readiness Checklist

- [ ] Confirm WebKitWebDriver version on CI matches local
- [ ] Confirm binary path in CI artifact matches `TITANE_BINARY` env or wdio conf default
- [ ] Add `Xvfb` launch step before `node scripts/e2e/run-desktop-suite.js`
- [ ] Set `TITANE_PROOF_ARTIFACT` to a workspace-relative path for CI artifact upload
- [ ] Add `pnpm run verify:backend-proof-depth` as a CI gate after spec run

### Suggested CI Job Snippet

```yaml
- name: Run v59 IPC reflection specs
  env:
    TITANE_ENFORCE_BINARY_FRESHNESS: "0"
    TITANE_E2E_FULL: "1"
    TITANE_PROOF_ARTIFACT: "artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl"
    WDIO_SPEC: "e2e/desktop/ui-desktop-ipc-response-reflection-*.wdio.test.js"
    DISPLAY: ":99"
  run: |
    Xvfb :99 -screen 0 1280x720x24 &
    node scripts/e2e/run-desktop-suite.js
    pnpm run verify:backend-proof-depth

- name: Upload proof artifact
  uses: actions/upload-artifact@v4
  with:
    name: v59-proof-depth
    path: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl
```

### Verdict

**LOCAL: PROVEN** — All 5 specs PASS locally with `code=0`.
**REMOTE: PENDING** — Checklist above must be completed before claiming CI parity.
