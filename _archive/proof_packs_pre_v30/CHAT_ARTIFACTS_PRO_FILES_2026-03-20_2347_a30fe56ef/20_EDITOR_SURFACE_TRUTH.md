# 20_EDITOR_SURFACE_TRUTH
| Path | Component | Type | Truth |
|---|---|---|---|
| src/components/sections/ConversationSection.tsx | Chat input + messages | chat textarea/list | TEXTAREA_ONLY |
| src/components/conversation/ModeBuilder.tsx | ModeBuilder modal | prompt/config editor | OPENABLE_FROM_CHAT_FOR_DOCUMENT_INTENTS |
| src/ui/pages/CreationStudio.tsx | CreationStudio | generation preview + copy | PREVIEW_ONLY / PARTIAL_CHAIN |

## Runtime conclusions
- Dedicated document artifact editor openable directly from chat intent: YES (ModeBuilder)
- Code-editor-class surface (Monaco-like) in this flow: NO
- Honest blocked state remains explicit for unsupported requests (ex: code editor unavailable).
