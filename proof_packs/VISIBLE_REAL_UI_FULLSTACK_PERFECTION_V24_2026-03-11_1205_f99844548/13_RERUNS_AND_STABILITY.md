# V24 Reruns Stability

- `run_postfix_1` => suite PASS, friction profile unchanged.
- `run_postfix_2` => suite PASS, friction profile unchanged.
- `run_postfix_3` => suite PASS, friction profile unchanged.
- `run_postbuild_final` => suite PASS, reasoning selectors/state restored, only non-blocking harness friction remains.
- `run_postbuild_topology` => suite PASS, topology detection restored.

Stability conclusion:

- Behavior is stable and reproducible; rebuilt artifact closes the reasoning visibility gap.

Status: PASS

## V24.1 Continuation Matrix (2026-03-11)

| run | send usable | reasoning state | topology | blockers | classification |
|---|---|---|---|---|---|
| `run_baseline` | `inputPresent=true`, `sendPresent=true`, `inputTyped=false`, `sendClicked=false` | `ABSENT` | `false` | `-` | `FAIL_LAYOUT_OR_REFLOW` |
| `run_postbuild_1` | usable (`sendClicked=true`, `visibleUiChangeAfterSend=true`) | `ABSENT` | `false` | `-` | `FAIL_LAYOUT_OR_REFLOW` |
| `run_postbuild_2` | usable (`sendClicked=true`, `visibleUiChangeAfterSend=true`) | `ABSENT` | `false` | `-` | `FAIL_LAYOUT_OR_REFLOW` |
| `run_postbuild_3` | usable (`sendClicked=true`, `visibleUiChangeAfterSend=true`) | `ABSENT` | `false` | `-` | `FAIL_LAYOUT_OR_REFLOW` |
| `run_postbuild_4` | usable (`sendClicked=true`, `visibleUiChangeAfterSend=true`) | `done` + testid present | `false` | `-` | `FAIL_LAYOUT_OR_REFLOW` |
| `run_postbuild_5` | usable (`sendClicked=true`, `visibleUiChangeAfterSend=true`) | `done` + testid present | `false` | `-` | `FAIL_LAYOUT_OR_REFLOW` |
| `run_postbuild_final` | usable (`sendClicked=true`, `visibleUiChangeAfterSend=true`) | `done` + testid present | `false` | `-` | `UI_MINOR_NON_BLOCKING` |
| `run_postbuild_topology` | usable (`sendClicked=true`, `visibleUiChangeAfterSend=true`) | `done` + testid present | `true` | `-` | `UI_MINOR_NON_BLOCKING` |

Stability conclusion (continuation):

- No regression after run4 resume point.
- Final retained run with topology keeps all 5 steps PASS and preserves non-blocking-only residuals.

Continuation status: PASS
