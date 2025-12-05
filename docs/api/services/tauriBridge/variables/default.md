[**TITANE∞ API Documentation v13.0.0**](../../../README.md)

***

[TITANE∞ API Documentation](../../../modules.md) / [services/tauriBridge](../README.md) / default

# Variable: default

> **default**: `object`

Defined in: services/tauriBridge.ts:495

## Type Declaration

### invokeTauriCommand()

> **invokeTauriCommand**: \<`T`\>(`command`, `params?`, `options`) => `Promise`\<`CoreResponse`\<`T`\>\>

Wrapper centralisé pour toutes les commandes Tauri
- Logging automatique
- Error handling unifié
- Timeout configurable
- Retry logic optionnel

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### command

`string`

##### params?

`Record`\<`string`, `any`\>

##### options?

###### timeout?

`number`

###### retries?

`number`

###### retryDelay?

`number`

#### Returns

`Promise`\<`CoreResponse`\<`T`\>\>

### batchInvoke()

> **batchInvoke**: \<`T`\>(`commands`, `options`) => `Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>

Execute multiple Tauri commands in batch

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### commands

[`BatchCommand`](../type-aliases/BatchCommand.md)[]

Array of commands to execute

##### options

[`BatchOptions`](../type-aliases/BatchOptions.md) = `{}`

Batch execution options

#### Returns

`Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>

Array of results (one per command)

### parallelInvoke()

> **parallelInvoke**: \<`T`\>(`commands`, `options?`) => `Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>

Execute commands in parallel (shorthand)

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### commands

[`BatchCommand`](../type-aliases/BatchCommand.md)[]

##### options?

`Omit`\<[`BatchOptions`](../type-aliases/BatchOptions.md), `"mode"`\>

#### Returns

`Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>

### sequentialInvoke()

> **sequentialInvoke**: \<`T`\>(`commands`, `options?`) => `Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>

Execute commands sequentially (shorthand)

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### commands

[`BatchCommand`](../type-aliases/BatchCommand.md)[]

##### options?

`Omit`\<[`BatchOptions`](../type-aliases/BatchOptions.md), `"mode"`\>

#### Returns

`Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>

### getSingularityState()

> **getSingularityState**: () => `Promise`\<`CoreResponse`\<`any`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`\>\>

### syncSingularityState()

> **syncSingularityState**: (`state`) => `Promise`\<`CoreResponse`\<`void`\>\>

#### Parameters

##### state

`any`

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>

### getHeliosModules()

> **getHeliosModules**: () => `Promise`\<`CoreResponse`\<`any`[]\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`[]\>\>

### getHeliosHealth()

> **getHeliosHealth**: () => `Promise`\<`CoreResponse`\<`any`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`\>\>

### getActiveProjects()

> **getActiveProjects**: (`limit`) => `Promise`\<`CoreResponse`\<`any`[]\>\>

#### Parameters

##### limit

`number` = `10`

#### Returns

`Promise`\<`CoreResponse`\<`any`[]\>\>

### getRecentMemories()

> **getRecentMemories**: (`limit`) => `Promise`\<`CoreResponse`\<`any`[]\>\>

#### Parameters

##### limit

`number` = `20`

#### Returns

`Promise`\<`CoreResponse`\<`any`[]\>\>

### getNexusStatus()

> **getNexusStatus**: () => `Promise`\<`CoreResponse`\<`any`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`\>\>

### getPersonaMultipliers()

> **getPersonaMultipliers**: () => `Promise`\<`CoreResponse`\<`any`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`\>\>

### sendChatMessage()

> **sendChatMessage**: (`messages`, `config`) => `Promise`\<`CoreResponse`\<`string`\>\>

#### Parameters

##### messages

`any`[]

##### config

`any`

#### Returns

`Promise`\<`CoreResponse`\<`string`\>\>

### startVoiceRecording()

> **startVoiceRecording**: () => `Promise`\<`CoreResponse`\<`void`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>

### stopVoiceRecording()

> **stopVoiceRecording**: () => `Promise`\<`CoreResponse`\<`any`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`\>\>

### voiceSpeak()

> **voiceSpeak**: (`text`, `voice?`) => `Promise`\<`CoreResponse`\<`void`\>\>

#### Parameters

##### text

`string`

##### voice?

`string`

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>

### engineInit()

> **engineInit**: () => `Promise`\<`CoreResponse`\<`void`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>

### engineTick()

> **engineTick**: () => `Promise`\<`CoreResponse`\<`void`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>

### engineMetrics()

> **engineMetrics**: () => `Promise`\<`CoreResponse`\<`any`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`\>\>

### engineHealth()

> **engineHealth**: () => `Promise`\<`CoreResponse`\<`any`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`\>\>

### engineModules()

> **engineModules**: () => `Promise`\<`CoreResponse`\<`any`[]\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`[]\>\>

### getDevToolsLogs()

> **getDevToolsLogs**: () => `Promise`\<`CoreResponse`\<`string`[]\>\>

#### Returns

`Promise`\<`CoreResponse`\<`string`[]\>\>

### clearDevToolsLogs()

> **clearDevToolsLogs**: () => `Promise`\<`CoreResponse`\<`void`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>

### getSystemStatus()

> **getSystemStatus**: () => `Promise`\<`CoreResponse`\<`any`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`\>\>

### getSystemMetrics()

> **getSystemMetrics**: () => `Promise`\<`CoreResponse`\<`any`\>\>

#### Returns

`Promise`\<`CoreResponse`\<`any`\>\>

### readFile()

> **readFile**: (`path`) => `Promise`\<`CoreResponse`\<`string`\>\>

Read file content

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`CoreResponse`\<`string`\>\>

### writeFile()

> **writeFile**: (`path`, `content`) => `Promise`\<`CoreResponse`\<`void`\>\>

Write file content

#### Parameters

##### path

`string`

##### content

`string`

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>

### listFiles()

> **listFiles**: (`path`, `options`) => `Promise`\<`CoreResponse`\<[`FileInfo`](../interfaces/FileInfo.md)[]\>\>

List files in directory (v19.0 Task 5)

#### Parameters

##### path

`string`

##### options

[`ListFilesOptions`](../interfaces/ListFilesOptions.md) = `{}`

#### Returns

`Promise`\<`CoreResponse`\<[`FileInfo`](../interfaces/FileInfo.md)[]\>\>

### deleteFile()

> **deleteFile**: (`path`, `recursive`) => `Promise`\<`CoreResponse`\<`void`\>\>

Delete file or directory (v19.0 Task 5)

#### Parameters

##### path

`string`

##### recursive

`boolean` = `false`

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>

### copyFile()

> **copyFile**: (`source`, `dest`, `overwrite`) => `Promise`\<`CoreResponse`\<`void`\>\>

Copy file or directory (v19.0 Task 5)

#### Parameters

##### source

`string`

##### dest

`string`

##### overwrite

`boolean` = `false`

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>

### moveFile()

> **moveFile**: (`source`, `dest`, `overwrite`) => `Promise`\<`CoreResponse`\<`void`\>\>

Move/rename file or directory (v19.0 Task 5)

#### Parameters

##### source

`string`

##### dest

`string`

##### overwrite

`boolean` = `false`

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>

### getFileInfo()

> **getFileInfo**: (`path`) => `Promise`\<`CoreResponse`\<[`FileInfo`](../interfaces/FileInfo.md)\>\>

Get file metadata (v19.0 Task 5)

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`CoreResponse`\<[`FileInfo`](../interfaces/FileInfo.md)\>\>

### fileExists()

> **fileExists**: (`path`) => `Promise`\<`CoreResponse`\<`boolean`\>\>

Check if file/directory exists (v19.0 Task 5)

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`CoreResponse`\<`boolean`\>\>

### createDirectory()

> **createDirectory**: (`path`, `recursive`) => `Promise`\<`CoreResponse`\<`void`\>\>

Create directory (v19.0 Task 5)

#### Parameters

##### path

`string`

##### recursive

`boolean` = `true`

#### Returns

`Promise`\<`CoreResponse`\<`void`\>\>
