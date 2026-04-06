# 04_CHAT_FILE_INTENT_MAP
Current truth:
- answer-only: implemented (regular sendMessage flow in ConversationSection)
- generate file: NOT explicit class routing found
- open editor: NOT explicit from chat intent
- export: UI button driven, not intent-router driven
- save: now explicit in export helpers with truthful result contract

Classification:
- ANSWER_ONLY: PROVEN_RUNTIME
- CREATE_FILE: CHAT_FILE_INTENT_UNPROVEN
- OPEN_EDITOR: CHAT_FILE_INTENT_UNPROVEN
- GENERATE_AND_OPEN: CHAT_FILE_INTENT_UNPROVEN
- GENERATE_AND_EXPORT: PARTIAL_CHAIN (manual UI export)
- GENERATE_AND_SAVE: PARTIAL_CHAIN (button path only)
- EDIT_EXISTING_ARTIFACT: PARTIAL
- UNSUPPORTED_OR_BLOCKED: required for missing intents but not canonically exposed
