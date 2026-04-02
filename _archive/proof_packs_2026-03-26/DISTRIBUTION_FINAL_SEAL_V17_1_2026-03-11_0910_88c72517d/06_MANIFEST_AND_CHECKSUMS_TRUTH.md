# 06 Manifest And Checksums Truth

Evidence: `raw/01_state_discovery.log`.

- `MANIFEST_v27.2.0.json` and `MANIFEST.json` resolve to the same canonical 27.2.0 artifacts.
- `CHECKSUMS.sha256` entries:
  - AppImage `640c11346eb7102b6dedd6bc68496c5cc56842510407fe256dacf461c517638f`
  - deb `105f2cf3e133b97505372c9e1541e578adb530ab53d6abc310826095de85760e`
  - binary `99a342d67de079e8b768428c04aeda5d1fc164ed1366cf68cd8baf5d7611381c`
- `sha256sum -c CHECKSUMS.sha256` => all entries PASS.

Verdict: PASS.
