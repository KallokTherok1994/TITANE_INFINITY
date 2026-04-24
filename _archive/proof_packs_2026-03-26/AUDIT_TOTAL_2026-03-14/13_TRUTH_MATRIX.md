# 13 — TRUTH MATRIX — TITANE_INFINITY

**Date:** 2026-03-14 | **HEAD:** e8b2c27b

| FIELD                             | EXPECTED                        | OBSERVED                                      | PROVED? | STATUS  | SOURCE                                     |
| --------------------------------- | ------------------------------- | --------------------------------------------- | ------- | ------- | ------------------------------------------ |
| Branch                            | copilot/audit-total-repo-titane | copilot/audit-total-repo-titane               | ✅ YES  | PASS    | git branch --show-current                  |
| HEAD                              | e8b2c27b                        | e8b2c27b                                      | ✅ YES  | PASS    | git rev-parse --short HEAD                 |
| Working tree                      | Clean                           | Clean                                         | ✅ YES  | PASS    | git status                                 |
| Package version                   | 27.2.0                          | 27.2.0                                        | ✅ YES  | PASS    | package.json                               |
| Tauri version                     | 27.2.0                          | 27.2.0                                        | ✅ YES  | PASS    | src-tauri/Cargo.toml                       |
| tauri.conf.json version           | 27.2.0                          | 27.2.0                                        | ✅ YES  | PASS    | tauri.conf.json productName/version        |
| verify_instructions               | PASS=20 FAIL=0                  | PASS=20 FAIL=0                                | ✅ YES  | PASS    | bash scripts/verify_instructions.sh        |
| detect_recurrence                 | PASS                            | PASS                                          | ✅ YES  | PASS    | bash scripts/autoheal/detect_recurrence.sh |
| autoheal_rules.jsonl valid        | All valid JSON                  | 189 lines, 0 parse errors                     | ✅ YES  | PASS    | python3 json parse                         |
| autoheal_rules.jsonl count        | ≥1                              | 189                                           | ✅ YES  | PASS    | wc -l                                      |
| autoheal last entries content     | Non-empty description           | AH-0158→0162 have empty fields                | ✅ YES  | FAIL    | python3 parse last 5                       |
| G1 no-offline-without-reason      | PASS                            | PASS                                          | ✅ YES  | PASS    | bash gate                                  |
| G2 no-force-local-in-prod         | PASS                            | PASS                                          | ✅ YES  | PASS    | bash gate                                  |
| G3 legacy-divergence              | PASS                            | PASS (with obs)                               | ✅ YES  | PASS    | bash gate                                  |
| G4 provider-decision-certified    | PASS                            | FAIL                                          | ✅ YES  | FAIL    | bash gate — 3 missing files                |
| G4 BASELINE.md                    | Present                         | Missing                                       | ✅ YES  | FAIL    | gate check                                 |
| G4 STRUCTURAL_TEST.log            | Present                         | Missing                                       | ✅ YES  | FAIL    | gate check                                 |
| G4 STRUCTURAL_RUNS_SUMMARY.md     | Present                         | Missing                                       | ✅ YES  | FAIL    | gate check                                 |
| G5 ci-wiring                      | PASS                            | PASS                                          | ✅ YES  | PASS    | bash gate                                  |
| G6 build-reproducibility          | PASS                            | BLOCKED                                       | ✅ YES  | BLOCKED | No build env                               |
| G7 tauri-allowlist-lock           | PASS                            | PASS                                          | ✅ YES  | PASS    | bash gate                                  |
| G8 provider-api-only              | PASS                            | PASS                                          | ✅ YES  | PASS    | bash gate                                  |
| G9 release-seal                   | PASS                            | PASS                                          | ✅ YES  | PASS    | bash gate                                  |
| CSP no unsafe-inline              | No unsafe-inline                | unsafe-inline in script-src                   | ✅ YES  | FAIL    | python3 parse tauri.conf.json              |
| CSP no unsafe-eval                | No unsafe-eval                  | No unsafe-eval                                | ✅ YES  | PASS    | python3 parse                              |
| IPC invoke() centralized          | Only in tauriClient.ts          | Centralized + bridge abstractions             | ✅ YES  | PASS    | grep src/                                  |
| IPC response { ok,content,error } | Enforced                        | normalizeIpcResponse + IpcResponse<T>         | ✅ YES  | PASS    | grep src/                                  |
| No direct fetch() in UI           | Zero                            | Zero (0 results)                              | ✅ YES  | PASS    | grep -r "fetch(" src/                      |
| No axios in UI                    | Zero                            | Zero (0 results)                              | ✅ YES  | PASS    | grep -r axios src/                         |
| No WebSocket in UI                | Zero                            | Zero (0 results)                              | ✅ YES  | PASS    | grep -r "new WebSocket" src/               |
| OllamaTransport IPC-only          | All network via IPC             | httpGenerate → ipcGenerate redirect           | ✅ YES  | PASS    | cat ollamaTransport.ts                     |
| G_NETWORK_ONE_DOOR                | PASS                            | PASS                                          | ✅ YES  | PASS    | bash gate                                  |
| G_FRONTEND_NO_WEB                 | PASS                            | PASS                                          | ✅ YES  | PASS    | bash gate                                  |
| G_NO_TEST_SKIPS                   | PASS                            | PASS                                          | ✅ YES  | PASS    | bash gate                                  |
| Fallback chain in Rust            | Present                         | pick_fallback_model() + multi_ai_set_fallback | ✅ YES  | PASS    | grep src-tauri/src/                        |
| Tauri allowlist no wildcards      | No wildcards                    | 0 wildcards, 216 commands                     | ✅ YES  | PASS    | G7 output                                  |
| dist/ build artifacts             | Not required in source          | Not present                                   | ✅ YES  | N/A     | ls dist/                                   |
| GitHub release v27.2.0            | Published                       | Published 2026-03-13                          | ✅ YES  | PASS    | V70 proof pack                             |
| Kernel doctrine "online-first"    | All layers match                | guardian.agent.md says "local-first"          | ✅ YES  | FAIL    | grep .github/copilot-agents/               |
| No hardcoded API keys             | Zero                            | Zero found                                    | ✅ YES  | PASS    | grep scans                                 |
| E2E files present                 | Present                         | 21 spec files in e2e/                         | ✅ YES  | PASS    | find e2e/                                  |
| E2E answer_is_useful assertion    | Expected                        | NOT FOUND in e2e                              | ✅ YES  | UNKNOWN | grep tests/ e2e/                           |
| E2E answer_matches_question       | Expected                        | NOT FOUND in e2e                              | ✅ YES  | UNKNOWN | grep tests/ e2e/                           |
| Test count src/                   | >0                              | 204 test files                                | ✅ YES  | PASS    | find src/                                  |
| rg (ripgrep) installed            | Available                       | NOT INSTALLED                                 | ✅ YES  | FAIL    | gate scripts use rg                        |
| Hardcoded prod URLs in active UI  | Zero                            | Wikipedia/Wikidata in ConversationSection     | ✅ YES  | INFO    | grep src/                                  |
| TODO/FIXME count                  | Manageable                      | 63 in src/                                    | ✅ YES  | INFO    | grep count                                 |
| @deprecated markers               | Low                             | 21 @deprecated, 38 total                      | ✅ YES  | INFO    | grep count                                 |
