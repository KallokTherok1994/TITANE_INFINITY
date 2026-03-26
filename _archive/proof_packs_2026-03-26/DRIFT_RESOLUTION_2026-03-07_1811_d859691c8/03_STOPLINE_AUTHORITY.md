# 03 Stop-Line Authority

Inherited stop-line authority source:

- `proof_packs/FINAL_100_SCOPE_2026-03-07_1717_d859691c8/17_FINAL_VERDICT.md`
- `proof_packs/FINAL_100_SCOPE_2026-03-07_1717_d859691c8/05_FINAL_GAP_MATRIX.md`

Inherited blocking condition relevant to this lane:

- Unexpected tracked drift in:
	- `runtime/stable/manifest.json`
	- `titane-infinity.desktop`

Authority handling in this lane:

- Freeze inherited authority.
- Resolve only drift contradiction (no broad scope reopen).
- Recompute local stop-line status after per-file decision + impacted checks.

