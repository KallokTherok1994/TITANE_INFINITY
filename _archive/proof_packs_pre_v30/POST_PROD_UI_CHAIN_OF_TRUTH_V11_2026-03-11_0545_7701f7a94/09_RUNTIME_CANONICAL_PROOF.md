# 09 Runtime Canonical Proof

Runtime commands executed on MAIN:
- run1: online-chat-proof canonical test
- run_visual1: V11 visual probe
- run_visual2: V11 visual probe stability rerun

Results:
- run1 PASS (1 passing, 6.7s)
- run_visual1 PASS (1 passing, 6.1s)
- run_visual2 PASS (1 passing, 6.2s)

Key markers:
- [PROOF] scenario=V11 run=run1
- [ASSISTANT_TEXT] present
- [V11_NO_IPC_FALLBACK] true in run_visual1/run_visual2

Evidence:
- artifacts/run1/wdio.log
- artifacts/run_visual1/wdio.log
- artifacts/run_visual2/wdio.log
- artifacts/runtime_markers.txt
