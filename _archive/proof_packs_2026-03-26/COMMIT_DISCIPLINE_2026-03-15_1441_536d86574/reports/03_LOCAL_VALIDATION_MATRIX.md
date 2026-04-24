# 03 — MATRICE DE VALIDATION LOCALE

## Revalidations Exécutées Localement (cet audit)

| Fichier                               | Validation                                                   | Tier            | Résultat                     | Heure |
| ------------------------------------- | ------------------------------------------------------------ | --------------- | ---------------------------- | ----- |
| src-tauri/src/main.rs                 | cargo check (HEAD actuel)                                    | T3 BUILD_LOCAL  | ✅ EXIT 0                    | 14:42 |
| src-tauri/src/commands/chat.rs        | cargo check                                                  | T3 BUILD_LOCAL  | ✅ EXIT 0                    | 14:42 |
| src/pages/CameraPage.tsx              | estimationCount champ vérifié dans types/visionAffect.ts:232 | T2 STATIC_LOCAL | ✅ CONFIRMÉ                  | 14:42 |
| src/pages/ChatPage.tsx                | ChatWindow.tsx existence vérifiée src/components/            | T2 STATIC_LOCAL | ✅ CONFIRMÉ                  | 14:42 |
| scripts/autoheal/autoheal_rules.jsonl | python3 JSON validate 266 lignes                             | T2 STATIC_LOCAL | ✅ 0 erreurs                 | 14:42 |
| send_message IPC                      | grep runtime invokes sans legacy                             | T2 STATIC_LOCAL | ✅ 0 invoke actif en runtime | 14:42 |
| verify_instructions.sh                | bash gate                                                    | T2 STATIC_LOCAL | ✅ PASS=20 FAIL=0            | 14:42 |
| detect_recurrence.sh                  | bash gate                                                    | T2 STATIC_LOCAL | ✅ PASS entries=266          | 14:42 |

## Validation Commit HEAD~1 (77735901e — AUDIO)

| Claim                                        | Proof Local                                                              | Tier               |
| -------------------------------------------- | ------------------------------------------------------------------------ | ------------------ |
| stop_speaking enregistré                     | grep main.rs l.1932 ✅                                                   | T1 TEXTUAL         |
| is_speaking enregistré                       | grep main.rs l.1933 ✅                                                   | T1 TEXTUAL         |
| get_recording_status enregistré + allowlisté | grep main.rs l.1936 + capabilities ✅                                    | T1 TEXTUAL         |
| mock stubs compilent                         | cargo build EXIT 0 (session précédente) + cargo check HEAD actuel EXIT 0 | T3 BUILD_LOCAL ✅  |
| gates PASS                                   | verify_instructions PASS=20                                              | T2 STATIC_LOCAL ✅ |

## Validation Commit HEAD (536d86574 — VISION+CHAT)

| Claim                              | Proof Local                                                          | Tier                    |
| ---------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| chat.rs Err au lieu de Ok stub     | diff confirmé, grep 0 invoke runtime                                 | T2 STATIC_LOCAL ✅      |
| estimationCount > 0 conditionne UI | champ défini types/visionAffect.ts:232, VisionDebugOverlay l'utilise | T2 STATIC_LOCAL ✅      |
| ChatWindow monté                   | ChatWindow.tsx existe src/components/, import correct                | T2 STATIC_LOCAL ✅      |
| compile OK                         | cargo check HEAD EXIT 0                                              | T3 BUILD_LOCAL ✅       |
| RuntimeUI réel                     | NON TESTÉ                                                            | T4 ABSENT — BLOCKED_ENV |

## Tiers Manquants

- T4 RUNTIME_LOCAL : aucun test de l'application en runtime
- T5 PRODUCT_LOCAL : aucune vérification de l'UX réelle (Node.js v18 incompatible)
