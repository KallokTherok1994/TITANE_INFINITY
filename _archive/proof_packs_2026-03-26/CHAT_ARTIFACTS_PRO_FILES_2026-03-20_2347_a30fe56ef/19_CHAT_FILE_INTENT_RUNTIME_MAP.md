# 19_CHAT_FILE_INTENT_RUNTIME_MAP

## Runtime chain (current)

1. User prompt enters ConversationSection handleSend.
2. Input sanitized.
3. `buildArtifactActionContract` classifies intent.
4. If intent != ANSWER_ONLY:

- route resolved by `resolveArtifactRoute`.
- canonical manifest created by `buildProfessionalDocumentManifest`.
- anti-lie guard `validateNoFakeArtifactResponse` executed.

5. Route outcomes:

- BLOCKED: assistant posts explicit blocked message with reason OPEN_FROM_CHAT_UNPROVEN.
- ROUTED: assistant posts artifact-route message + manifest-backed draft.

6. If intent == ANSWER_ONLY, normal chat path preserved.

## Truth labels

- answer-only preserved: YES
- file-intent detection present: YES
- artifact route contract present: YES
- open-editor from chat: AVAILABLE_FOR_DOCUMENT_INTENTS (ModeBuilder)
- canonical manifest attached to route: YES
- fake success prevented: YES (anti-lie validator + explicit blocked tags)
