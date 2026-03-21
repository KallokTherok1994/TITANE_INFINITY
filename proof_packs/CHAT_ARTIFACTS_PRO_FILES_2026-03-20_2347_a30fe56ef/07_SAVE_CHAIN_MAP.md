# 07_SAVE_CHAIN_MAP
chat export action (ConversationSection) -> export helper (chat/conversation exportImport) ->
if Tauri available: plugin-dialog save() -> selected path -> plugin-fs writeTextFile() -> result status
if not Tauri: browser blob download fallback -> result status

Result contract now explicit:
- SAVED_TAURI
- SAVED_BROWSER_DOWNLOAD
- SAVE_CANCELLED_HONEST
- SAVE_DIALOG_BLOCKED
- WRITE_FAILED

Rupture points tracked:
- dialog cancel => SAVE_CANCELLED_HONEST
- write exception => WRITE_FAILED
- browser fallback exception => SAVE_DIALOG_BLOCKED
