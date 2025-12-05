[**TITANE∞ API Documentation v13.0.0**](../../README.md)

***

[TITANE∞ API Documentation](../../modules.md) / [hooks](../README.md) / useAIChatStreaming

# Function: useAIChatStreaming()

> **useAIChatStreaming**(): `object`

Defined in: hooks/useAIChatStreaming.ts:19

## Returns

`object`

### messages

> **messages**: `ChatMessage`[]

### isStreaming

> **isStreaming**: `boolean`

### error

> **error**: `string`

### sendMessage()

> **sendMessage**: (`content`) => `Promise`\<`void`\>

#### Parameters

##### content

`string`

#### Returns

`Promise`\<`void`\>

### cancelStreaming()

> **cancelStreaming**: () => `void`

#### Returns

`void`

### clearMessages()

> **clearMessages**: () => `void`

#### Returns

`void`

### sendMessageNoStreaming()

> **sendMessageNoStreaming**: (`content`) => `Promise`\<`void`\>

#### Parameters

##### content

`string`

#### Returns

`Promise`\<`void`\>
