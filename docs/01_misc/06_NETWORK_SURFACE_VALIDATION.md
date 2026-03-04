=== run_x3 START: 2026-03-01T00:42:59Z ===
CMD: bash -lc rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket|https?://" src -g 'i in 1 2 3 ; do echo ===== BUILD RUN

--- RUN 1/3: 00:42:59Z ---
BUILD: -c: ligne 1: fin de fichier (EOF) prématurée lors de la recherche du « ' » correspondant
--- RUN 1/3: FAIL (exit 2) ---

--- RUN 2/3: 00:42:59Z ---
BUILD: -c: ligne 1: fin de fichier (EOF) prématurée lors de la recherche du « ' » correspondant
--- RUN 2/3: FAIL (exit 2) ---

--- RUN 3/3: 00:42:59Z ---
BUILD: -c: ligne 1: fin de fichier (EOF) prématurée lors de la recherche du « ' » correspondant
--- RUN 3/3: FAIL (exit 2) ---

=== run_x3 SUMMARY: PASS=0/3 FAIL=3/3 ===
VERDICT: BLOCKED (3 failure(s) in 3 runs)
=== run_x3 START: 2026-03-01T00:43:13Z ===
CMD: /tmp/rc_network_gate.sh

--- RUN 1/3: 00:43:13Z ---
--- RUN 1/3: PASS ---

--- RUN 2/3: 00:43:13Z ---
--- RUN 2/3: PASS ---

--- RUN 3/3: 00:43:14Z ---
--- RUN 3/3: PASS ---

=== run_x3 SUMMARY: PASS=3/3 FAIL=0/3 ===
VERDICT: PASS (3/3)
=== run_x3 START: 2026-03-01T15:25:53Z ===
CMD: bash scripts/gates/rc-network-surface-gate.sh

--- RUN 1/3: 15:25:53Z ---
✅ RC network gate PASS: no executable network patterns found in src/
   raw: /tmp/rc_network_raw.log
   exec: /tmp/rc_network_exec.log
--- RUN 1/3: PASS ---

--- RUN 2/3: 15:25:53Z ---
✅ RC network gate PASS: no executable network patterns found in src/
   raw: /tmp/rc_network_raw.log
   exec: /tmp/rc_network_exec.log
--- RUN 2/3: PASS ---

--- RUN 3/3: 15:25:53Z ---
✅ RC network gate PASS: no executable network patterns found in src/
   raw: /tmp/rc_network_raw.log
   exec: /tmp/rc_network_exec.log
--- RUN 3/3: PASS ---

=== run_x3 SUMMARY: PASS=3/3 FAIL=0/3 ===
VERDICT: PASS (3/3)
