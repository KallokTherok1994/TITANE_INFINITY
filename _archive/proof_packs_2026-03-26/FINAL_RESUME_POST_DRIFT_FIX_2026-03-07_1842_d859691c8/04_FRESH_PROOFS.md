# 04 Fresh Proofs

Impacted gate reruns (post-fix):

| Gate | Command | Exit | Status | Proof |
|---|---|---:|---|---|
| `G_PRE_DEPLOYMENT_CHECK` | `timeout 360 bash scripts/verify/pre-deployment-check.sh --quick` | `0` | `PASS` | `raw/11_gate_predeploy.log`, `raw/11_gate_predeploy.exit` |
| `G_BEFORE_DEV_WRAPPER_TRANSPARENCY` | `timeout 20 bash scripts/tauri/before-dev.sh` | `124` | `PASS` (expected timeout after successful Vite start) | `raw/12_gate_before_dev.log`, `raw/12_gate_before_dev.exit` |

Governance and closure gates:

| Gate | Exit | Status | Proof |
|---|---:|---|---|
| `G_AH_RECURRENCE_GUARD_PASS` | `0` | `PASS` | `raw/26_detect_recurrence_postfix.log`, `raw/26_detect_recurrence_postfix.exit` |
| `G_INSTRUCTION_COMPLIANCE` | `0` | `PASS` | `raw/27_verify_instructions_postfix.log`, `raw/27_verify_instructions_postfix.exit` |
| `G_AUTOFIX_REGISTRY_CHECK` | `0` | `PASS` | `raw/28_registry_check.log`, `raw/28_registry_check.exit` |

Drift freeze integrity (no contradiction):

- `APPIMAGE_272_EXISTS=YES`
- `APPIMAGE_2705_EXISTS=NO`
- `DRIFT_MANIFEST_CERT_STATUS=FORBIDDEN_SCAN_PASSED`
- `DRIFT_DESKTOP_EXEC_272=YES`

Proof: `raw/30_drift_freeze_check.env`.

