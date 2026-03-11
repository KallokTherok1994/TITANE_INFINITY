# V25 Reruns And Stability

V25 execution timeline:
- First V25 attempt failed due harness interaction on health button (false negative).
- Spec patched with safe JS click path.
- Rerun completed with `RC=0` and full S1-S8 captures.
- AppImage rebuilt after runtime-surface patch (`RC=0`).
- Postbuild rerun (`run_chat_postbuild`) completed with `RC=0` and full S1-S8 captures.

Stability notes:
- Chat cycle behavior is reproducible.
- Degraded offline simulated answer is reproducible.
- Verdict stability: `FAIL` is stable for current runtime truth.

Run comparison:

- `run_chat_baseline`: `FAIL`, topology `1`, runtimeAttrs null.
- `run_chat_postbuild`: `FAIL`, topology `5`, runtimeAttrs populated (`OFFLINE/FALLBACK_OFFLINE/network=false`).
