# CHAT_SETTINGS_OVERRIDE_MATRIX

| setting               | source persistée                           | valeur par défaut                                        | valeur effective              | override ?                      | preuve                                                                   | statut                                   |
| --------------------- | ------------------------------------------ | -------------------------------------------------------- | ----------------------------- | ------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| systemPrompt base     | chatModes.config.ts SYSTEM_PROMPTS.default | 4-line generic                                           | 4-line generic                | NO (no persisted override)      | getSystemPrompt('default')                                               | THIN — needs upgrade                     |
| mode                  | useChatModeStore localStorage              | 'default'                                                | 'default' unless user selects | YES (user can change mode)      | ConversationSection mode state                                           | PASS                                     |
| persona               | localStorage[titane_persona_profile]       | null/empty                                               | user-set if present           | YES (appended to system prompt) | conversationEngine.ts:299-320                                            | PASS                                     |
| provider              | ChatProviderSelector localStorage          | depends on user                                          | user-selected                 | YES                             | ConversationSection:ChatProviderSelector                                 | PASS                                     |
| ttsEnabled            | localStorage[titane_user_preferences_v1]   | true                                                     | user-set                      | YES                             | usePreferences.ts                                                        | PASS (audio, not prompt)                 |
| depth/verbosity       | NOT persisted in conversationEngine path   | N/A — controlled by responsePolicy only in chatEngine.ts | N/A for main path             | NO                              | conversationEngine.ts does not read depth/verbosity settings             | WIRED_BUT_UNPROVEN                       |
| response mode profile | NOT consumed by conversationEngine.ts      | N/A                                                      | N/A                           | NO                              | responsePolicy.ts.getEffectiveProfile() NOT called by conversationEngine | SECONDARY_AUTHORITY (chatEngine.ts only) |

## KEY FINDING

No persisted settings override `SYSTEM_PROMPTS.default` in the conversationEngine.ts chain.
The fix to `SYSTEM_PROMPTS.default` will be effective immediately without needing to clear any persisted state.
