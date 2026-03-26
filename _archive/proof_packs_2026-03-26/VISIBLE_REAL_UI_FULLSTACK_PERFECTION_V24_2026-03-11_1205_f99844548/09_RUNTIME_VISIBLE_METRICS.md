# V24 Metrics Snapshot

| run | mode | reasoning_state | testid | topology | send_path | class |
|---|---|---|---|---|---|---|
| `run_baseline` | `MODE_B_REAL_UI` | `ABSENT` | `false` | `false` | `NATIVE_SETTER_INPUTEVENT` | `FAIL_LAYOUT_OR_REFLOW` |
| `run_postfix_1` | `MODE_B_REAL_UI` | `ABSENT` | `false` | `false` | `NATIVE_SETTER_INPUTEVENT` | `FAIL_LAYOUT_OR_REFLOW` |
| `run_postfix_2` | `MODE_B_REAL_UI` | `ABSENT` | `false` | `false` | `NATIVE_SETTER_INPUTEVENT` | `FAIL_LAYOUT_OR_REFLOW` |
| `run_postfix_3` | `MODE_B_REAL_UI` | `ABSENT` | `false` | `false` | `NATIVE_SETTER_INPUTEVENT` | `FAIL_LAYOUT_OR_REFLOW` |
| `run_postbuild_final` | `MODE_B_REAL_UI` | `done` | `true` | `false` | `NATIVE_SETTER_INPUTEVENT` | `UI_MINOR_NON_BLOCKING` |
| `run_postbuild_topology` | `MODE_B_REAL_UI` | `done` | `true` | `true` | `NATIVE_SETTER_INPUTEVENT` | `UI_MINOR_NON_BLOCKING` |

Status: PASS

## V24.1 Continuation Addendum (2026-03-11)

Retained continuity checks from authoritative worktree:

- `run_postbuild_4` completed (`POSTBUILD4_RC=0`) with `reasoningProgressState=done`, `reasoningProgressTestIdPresent=true`, `reasoningProgressHasTopology=false`.
- Clean rerun continuity already present in pack:
- `run_postbuild_5_clean` (`POSTBUILD5_RC=0`)
- `run_postbuild_final_clean` (`POSTBUILD_FINAL_RC=0`)
- `run_postbuild_topology_clean` (`POSTBUILD_TOPOLOGY_RC=0`)
- Latest retained metrics on rebuilt artifact (`run_postbuild_topology`) confirm:
- `sendActivationPath=NATIVE_SETTER_INPUTEVENT`
- `sendHarnessDiagnosis=HARNESS_DEFECT_JS_VALUE_NOT_REACT`
- `reasoningProgressState=done`
- `reasoningProgressTestIdPresent=true`
- `reasoningProgressHasTopology=true`
- `dominantClassification=UI_MINOR_NON_BLOCKING`

Continuation status: PASS