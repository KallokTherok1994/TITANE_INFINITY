# OPERATIONAL TRUTH SURFACE — CLINE RUNTIME MATRIX

**PURPOSE**: Track which surfaces are actually implemented vs declared  
**AUTHORITY**: Truth report `reports/cline_rules_hooks_truth_report.md` + runtime evidence  
**DATE**: 2026-03-24  
**STATUS**: `RUNTIME_ACTIVE` — updated after each governance session

---

## SURFACE TRUTH MATRIX

| Surface                                     | Declared                                                                                   | Runtime Active        | Validator Enforced     | Proof Source                                           | Last Checked |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------- | ---------------------- | ------------------------------------------------------ | ------------ |
| PreToolUse: prod token gate                 | `GO_FOR_PROD_BUILD__TITANE_INFINITY` / `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`               | ✅ YES                | ✅ YES (hook blocks)   | hooks/PreToolUse                                       | 2026-03-24   |
| PreToolUse: secret detection in src/\*\*    | Warns on API_KEY/SECRET/PASSWORD/TOKEN                                                     | ✅ YES                | ✅ YES (hook warns)    | hooks/PreToolUse                                       | 2026-03-24   |
| PreToolUse: .js file blocking               | Was active, removed Mar 20                                                                 | ❌ NO                 | N/A                    | truth report P2                                        | 2026-03-20   |
| PostToolUse: operations logging             | Writes to operations.log                                                                   | ✅ YES                | ✅ YES (file evidence) | .clinerules/logs/operations.log                        | 2026-03-24   |
| PostToolUse: fake-PASS classification       | Was active, removed Mar 20                                                                 | ❌ NO                 | N/A                    | truth report P1                                        | 2026-03-20   |
| PostToolUse: AutoHeal auto-capture          | Declared in kernel Rule 10                                                                 | ❌ NO (manual only)   | N/A                    | 40-autoheal-rollback.md                                | 2026-03-24   |
| PostToolUse: proof verification before PASS | Declared in kernel Rule 2                                                                  | ❌ NO (manual)        | N/A                    | truth report                                           | 2026-03-20   |
| TaskStart: context injection                | Project type + safeguards                                                                  | ✅ YES                | ✅ YES (hook injects)  | hooks/TaskStart                                        | 2026-03-24   |
| UserPromptSubmit: deploy/test reminders     | Token-accurate reminders                                                                   | ✅ YES                | ✅ YES (hook injects)  | hooks/UserPromptSubmit                                 | 2026-03-24   |
| AutoHeal: manual capture                    | JSONL schema full compliance                                                               | ✅ YES                | ⚠️ PARTIAL (manual)    | scripts/autoheal/autoheal_rules.jsonl                  | 2026-03-24   |
| verify_instructions.sh                      | PASS=20 checks                                                                             | ✅ YES                | ✅ YES (validator)     | scripts/verify_instructions.sh                         | 2026-03-24   |
| detect_recurrence.sh                        | Recurrence detection                                                                       | ✅ YES                | ✅ YES (validator)     | scripts/autoheal/detect_recurrence.sh                  | 2026-03-24   |
| 4-Ring boundary validation                  | Declared in Rule 3                                                                         | ❌ NO                 | N/A                    | 00-kernel.md                                           | 2026-03-24   |
| Network governance (One Door)               | Declared in Rule 5                                                                         | ❌ NO (architectural) | N/A                    | 00-kernel.md                                           | 2026-03-24   |
| IPC contract validation                     | Declared in Rule 6                                                                         | ❌ NO (architectural) | N/A                    | 00-kernel.md                                           | 2026-03-24   |
| Proof pack generation                       | Declared in Rule 12                                                                        | ❌ NO (manual)        | N/A                    | 00-kernel.md                                           | 2026-03-24   |
| AGENTS.md usage                             | Layer 2 in hierarchy                                                                       | ❌ DOES NOT EXIST     | N/A                    | file check                                             | 2026-03-24   |
| .github/instructions/ usage                 | Layer 4 in hierarchy                                                                       | ❌ DOES NOT EXIST     | N/A                    | file check                                             | 2026-03-24   |
| .github/agents/ usage                       | Layer 5 in hierarchy                                                                       | ❌ DOES NOT EXIST     | N/A                    | file check                                             | 2026-03-24   |
| OMEGA: Auto mode classifier                 | omegaModeClassifier.ts — classifyMode() per turn                                           | ✅ YES                | ✅ YES (43 evals pass) | **tests**/orchestration/omegaModeClassifier.test.ts    | 2026-03-26   |
| OMEGA: TraceMeta in ConversationResponse    | OmegaTraceMeta field + Rust TraceMeta struct                                               | ✅ YES                | ✅ YES (IPC wired)     | types.rs + conversationEngine.ts + commands.rs         | 2026-03-26   |
| OMEGA: resolveMode() override logic         | High-confidence auto overrides default; user non-default wins                              | ✅ YES                | ✅ YES (Lane D evals)  | omegaModeClassifier.ts:resolveMode()                   | 2026-03-26   |
| OMEGA: IPC classifierMeta propagation       | Frontend classifier metadata → backend omega_meta → TraceMeta honest                       | ✅ YES                | ✅ YES (cargo check)   | conversationEngine.ts + commands.rs                    | 2026-03-26   |
| OMEGA: AI config wiring                     | Classifier profile → temperature + maxTokens per effort level                              | ✅ YES                | ✅ YES (cargo check)   | conversationEngine.ts + commands.rs                    | 2026-03-26   |
| OMEGA: Champion/challenger framework        | Registry JSON + TypeScript scaffold                                                        | ✅ YES                | ⚠️ PARTIAL (disabled)  | config/championChallenger.json + championChallenger.ts | 2026-03-26   |
| OMEGA: Eval harness Lanes A+B+C+D+F         | 43 tests: mode classification + model class + memory policy + fallback honesty + stability | ✅ YES                | ✅ YES (43/43 pass)    | **tests**/orchestration/omegaModeClassifier.test.ts    | 2026-03-26   |
| OMEGA: Classifier hardening                 | Code review + test + config + factual question signals added                               | ✅ YES                | ✅ YES (no regression) | omegaModeClassifier.ts                                 | 2026-03-26   |
| OMEGA: Memory governance classification     | STABLE_PREFERENCE/NOISE/DURABLE_CONSTRAINT required                                        | ❌ NOT IMPLEMENTED    | N/A                    | MEMORY_CONSUMPTION_MAP.md                              | 2026-03-26   |

---

## STATUS LEGEND

- ✅ YES: Functionally active, provable by file/command/hook evidence
- ⚠️ PARTIAL: Some aspect active, some not
- ❌ NO: Declared but not implemented, or disabled
- ❌ DOES NOT EXIST: File/directory referenced does not exist
- N/A: Not applicable (removed feature or non-existent surface)

---

## MAINTENANCE

Update this matrix:

- After each hook modification
- After each governance session
- After each validator change
- When a new surface is declared or deprecated

Source of truth: `reports/cline_rules_hooks_truth_report.md` + direct hook inspection
