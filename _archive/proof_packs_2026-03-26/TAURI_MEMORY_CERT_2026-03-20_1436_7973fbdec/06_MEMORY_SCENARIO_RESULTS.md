# 06_MEMORY_SCENARIO_RESULTS

- Run initial: artifacts/run1/wdio-memory-chat-proof-ui.log
  - MEMORY_PROOF_VERDICT=PASS_MEMORY_REAL
  - storageCount=8
  - providerUsed=OLLAMA
  - providerReason=OK
- Run compacté: artifacts/run2_compact/wdio-memory-chat-proof-ui.log
  - MEMORY_PROOF_VERDICT=PASS_MEMORY_REAL
  - MEMORY_PROOF_RESPONSE contient code=ORION-482-LICHEN, nom=Alice, couleur=bleu azur
  - storageCount=8
- X3 final: 11_E2E_MEMORY_X3_COMPACT.log
  - run1: PASS_MEMORY_REAL
  - run2: PASS_MEMORY_REAL
  - run3: PASS_MEMORY_REAL
  - run_x3 SUMMARY: PASS=3/3 FAIL=0/3
