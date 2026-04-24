# 24_ANTI_LIE_REPORT

Violations addressed this cycle:

1. Name: FILE_REQUEST_TO_PLAIN_TEXT_ONLY

- Rupture point: ConversationSection send flow had no artifact-intent route.
- Classification: ARTIFACT_ROUTE_MISSING
- Minimal fix: action contract + route + manifest + explicit blocked message.
- Rollback: restore ConversationSection and artifactIntent module.

2. Name: DOCUMENT_READY_WITHOUT_AUTHORITY

- Rupture point: no canonical manifest for chat file requests.
- Classification: DOCUMENT_AUTHORITY_FRAGMENTED
- Minimal fix: ProfessionalDocumentManifest in chat route.
- Rollback: restore artifactIntent module and ConversationSection wiring.

3. Name: EDITOR_OPEN_CLAIM_WITHOUT_EDITOR

- Rupture point: open-editor request not backed by runtime editor route.
- Classification: CLOSED_FOR_DOCUMENT_INTENTS
- Minimal fix: route open-editor document intents to ModeBuilder and keep explicit block for unsupported editor requests.

4. Name: WRONG_ARTIFACT_CLASS_OPENS_EDITOR

- Rupture point: code/config intent could incorrectly open document editor.
- Classification: NEGATIVE_ROUTE_GUARD_PROVEN
- Minimal fix: keep codeEditorAvailable=false in route capabilities for chat flow and assert no ModeBuilder opening for code intent.
- Evidence: targeted E2E negative scenario verifies OPEN_FROM_CHAT_UNPROVEN and absence of `.mode-builder-overlay`.
