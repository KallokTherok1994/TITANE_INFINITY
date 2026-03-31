# 05_STALE_ARTIFACT_PREVENTION

Implemented prevention chain:

- `scripts/e2e/native-binary-policy.cjs` classifies freshness and emits explicit reason/basis.
- `scripts/e2e/run-desktop-suite.js` logs policy and blocks before WDIO when unsafe.
- `wdio.desktop.conf.cjs` consumes the same policy module for binary path coherence.
- `scripts/verify/verify-native-binary-freshness.sh` fails loudly on non-fresh classes.

Result:

- stale/runtime-mismatch is now detectable, classifiable, and gate-enforced.
- no silent fallback to stale artifact in native certification path.
