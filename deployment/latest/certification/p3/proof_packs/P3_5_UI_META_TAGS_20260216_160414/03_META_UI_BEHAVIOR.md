# P3-5 META UI BEHAVIOR

## STOP-THE-LINE: 08_FILES_CHANGED anomaly

See 02_COMMANDS_RUN.txt for the captured diff/contents of the anomaly.

## Meta UI plan (pending)

### Storage

- `src/services/conversationEngine.ts` now reads `raw.meta` into `response.meta`.
- `src/hooks/useConversationEngine.ts` stores `response.meta` as `metadata.providerMeta` on assistant messages.

### Rendering

- `src/components/sections/ConversationSection.tsx` renders meta-driven tags for assistant messages:
	- provider_used
	- mode
	- provider_class
	- cache_hit (if true)
	- reason_code (only if not OK)

### Sample meta excerpt

```json
{
	"provider_used": "local",
	"provider_class": "local",
	"mode": "LOCAL",
	"reason_code": "OK",
	"network_used": false,
	"cache_hit": false
}
```
