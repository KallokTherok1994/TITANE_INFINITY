# V25 Send Path Truth

Measured send behavior:
- `sendEnabledBeforeTyping=false`
- `sendEnabledAfterTyping=true`
- `sendActivationPath=NATIVE_SETTER_INPUTEVENT`
- `sendHarnessDiagnosis=HARNESS_LIMITATION_JS_VALUE_NOT_REACT`
- `sendClicked=true`

P1 classification:
- `SEND_DISABLED_AFTER_TYPING` is not retained as product blocker.
- Final class: `HARNESS_LIMITATION` (non-blocking product-wise for this run).

Proof:
- Send is actually triggered and produces visible assistant response.
