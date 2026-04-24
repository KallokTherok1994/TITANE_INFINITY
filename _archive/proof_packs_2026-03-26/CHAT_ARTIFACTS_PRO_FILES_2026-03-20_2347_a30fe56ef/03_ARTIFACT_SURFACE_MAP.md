# 03_ARTIFACT_SURFACE_MAP

| Surface                                         | Trigger                               | Visible     | Reachable | Active | Editor Type                  | Desktop Proven            | Save Proven                                     | Status         |
| ----------------------------------------------- | ------------------------------------- | ----------- | --------- | ------ | ---------------------------- | ------------------------- | ----------------------------------------------- | -------------- |
| src/components/sections/ConversationSection.tsx | Export JSON/MD buttons                | YES         | YES       | YES    | TEXTAREA chat + message list | PARTIAL                   | AFTER PATCH: TAURI save path + browser fallback | PARTIAL_CHAIN  |
| src/features/chat/exportImport.ts               | downloadConversation/downloadMarkdown | N/A service | YES       | YES    | N/A                          | AFTER PATCH: YES in Tauri | YES with explicit status                        | PROVEN_RUNTIME |
| src/features/conversation/exportImport.ts       | duplicate export helpers              | N/A service | YES       | YES    | N/A                          | AFTER PATCH: YES in Tauri | YES with explicit status                        | PROVEN_RUNTIME |
| src/ui/pages/CreationStudio.tsx                 | copy artifact buttons                 | YES         | YES       | YES    | code/text panel              | NO                        | NO                                              | UI_ONLY        |
| src-tauri/src/doc_engine/export.rs              | backend doc export engine             | N/A backend | YES       | YES    | N/A                          | YES                       | Markdown/HTML/TXT/JSON yes, PDF no              | PARTIAL_CHAIN  |
