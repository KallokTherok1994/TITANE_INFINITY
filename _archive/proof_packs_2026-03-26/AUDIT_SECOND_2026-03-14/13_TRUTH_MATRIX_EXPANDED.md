# 13 — TRUTH MATRIX EXPANDED

**Date:** 2026-03-14

---

## TRUTH MATRIX

| FIELD                      | EXPECTED                                   | OBSERVED                                                                       | PROVED?       | STATUS               | SOURCE                                               | TRUST_LEVEL |
| -------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ | ------------- | -------------------- | ---------------------------------------------------- | ----------- |
| target_runtime             | Tauri desktop app                          | Source code present; no binary                                                 | ❌ NO         | BLOCKED              | ls dist/, cargo absent                               | LOW         |
| runtime_mode               | Online-first, local fallback               | Source shows online-first logic                                                | ⚠️ PARTIAL    | WEAK_PROOF           | conversationEngine.ts                                | MEDIUM      |
| build_truth                | Reproducible Tauri build                   | No dist/, no Rust toolchain                                                    | ❌ NO         | BLOCKED              | ls dist/ → not found                                 | LOW         |
| boot_truth                 | App boots to chat                          | No binary available                                                            | ❌ NO         | BLOCKED              | No AppImage/binary                                   | LOW         |
| ui_render_truth            | Chat UI renders correctly                  | Source present, no runtime                                                     | ❌ UNVERIFIED | UNKNOWN              | React components exist                               | LOW         |
| command_called             | IPC invoke goes through tauriClient.ts     | tauriClient.ts exists + TauriBridge + utils/invoke also route via secureInvoke | ⚠️ PARTIAL    | WEAK_PROOF           | src/lib/tauriClient.ts, src/os/bridge/TauriBridge.ts | MEDIUM      |
| provider_requested         | Backend receives provider request          | Rust source shows provider routing                                             | ⚠️ PARTIAL    | WEAK_PROOF           | src-tauri/src/providers/                             | MEDIUM      |
| provider_used              | Real provider executes                     | Source: provider chain in Rust                                                 | ❌ UNVERIFIED | UNKNOWN              | No runtime proof                                     | LOW         |
| network_used               | External AI called when allowed            | IPC transport exists; real network call unverified                             | ❌ UNVERIFIED | UNKNOWN              | No binary/network test                               | LOW         |
| timeout_reason             | Timeout triggers fallback with reason_code | Source shows timeout handling                                                  | ⚠️ PARTIAL    | WEAK_PROOF           | src/utils/tauriProtector.ts:665                      | MEDIUM      |
| fallback_triggered         | Fallback logic fires on timeout/error      | pick_fallback_model() in Rust source                                           | ⚠️ PARTIAL    | WEAK_PROOF           | src-tauri/src/providers/ollama.rs                    | MEDIUM      |
| fallback_used              | Fallback response returned to user         | Source shows fallback return path                                              | ❌ UNVERIFIED | UNKNOWN              | No runtime proof                                     | LOW         |
| memory_read                | Memory retrieved for context               | Rust source has memory commands                                                | ⚠️ PARTIAL    | WEAK_PROOF           | src-tauri/src/commands/                              | MEDIUM      |
| memory_write               | Conversation saved to memory               | Source shows write path                                                        | ⚠️ PARTIAL    | WEAK_PROOF           | src/services/unified/SQLiteVectorStore.ts            | MEDIUM      |
| assistant_text_non_empty   | Response contains text                     | Source-level: conversationEngine returns assistant_message                     | ⚠️ PARTIAL    | WEAK_PROOF           | src/services/conversationEngine.ts                   | MEDIUM      |
| answer_is_useful           | Response is helpful and relevant           | No test validates this                                                         | ❌ NO         | **FALSE_CONFIDENCE** | No test found                                        | LOW         |
| answer_matches_question    | Response addresses the question            | No test validates this                                                         | ❌ NO         | **FALSE_CONFIDENCE** | No test found                                        | LOW         |
| degraded_message_only      | Offline fallback shows degraded mode       | Source shows OFFLINE mode handling                                             | ⚠️ PARTIAL    | WEAK_PROOF           | useConversationEngine.ts:361                         | MEDIUM      |
| ui_mode_displayed          | UI shows correct mode (online/offline)     | Source has mode display logic                                                  | ⚠️ PARTIAL    | WEAK_PROOF           | ConversationSection.tsx                              | MEDIUM      |
| backend_mode_truth         | Backend reports mode truthfully            | reason_code + mode fields in response                                          | ⚠️ PARTIAL    | WEAK_PROOF           | conversationEngine.ts:163-235                        | MEDIUM      |
| truth_alignment_ui_backend | UI shows same mode as backend reports      | Source logic aligns; runtime unverified                                        | ❌ UNVERIFIED | UNKNOWN              | No runtime E2E proof                                 | LOW         |
| gate_reliability           | All governance gates check code            | G1/G3/rc-network: hollow (rg absent); G7/G8/G_FRONTEND: real                   | ❌ PARTIAL    | **FALSE_CONFIDENCE** | gate re-run evidence                                 | LOW         |
| proof_harness_strength     | Tests prove real product behavior          | P3 structural = simulated; full E2E = disabled                                 | ❌ LOW        | **FALSE_CONFIDENCE** | structural spec source                               | LOW         |
| release_truth              | Latest release matches source              | deployment/latest has v27 artifacts                                            | ⚠️ PARTIAL    | WEAK_PROOF           | ls deployment/latest/                                | MEDIUM      |
| doctrine_alignment         | All files follow kernel doctrine           | guardian.agent.md fixed; G1/G3 hollow gates contradict governance doctrine     | ⚠️ PARTIAL    | WEAK_PROOF           | first audit fix + gate analysis                      | MEDIUM      |

---

## SUMMARY

| Trust Level | Count | Fields                                                                                                                                                                                                                                     |
| ----------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HIGH        | 0     | —                                                                                                                                                                                                                                          |
| MEDIUM      | 11    | runtime_mode, command_called, provider_requested, timeout_reason, fallback_triggered, memory_read, memory_write, assistant_text_non_empty, degraded_message_only, ui_mode_displayed, backend_mode_truth, release_truth, doctrine_alignment |
| LOW         | 13    | target_runtime, build_truth, boot_truth, ui_render_truth, provider_used, network_used, fallback_used, answer_is_useful, answer_matches_question, truth_alignment_ui_backend, gate_reliability, proof_harness_strength                      |

**No field achieves HIGH trust** because no runtime binary is available for verification.

**Critical gaps:**

- `answer_is_useful` and `answer_matches_question`: Not verified by any test at any level
- `gate_reliability`: 4 gates are hollow (G1, G3, rc-network-surface) or partially fake (G3, G9)
- `proof_harness_strength`: The only "x3 certification" is simulated
