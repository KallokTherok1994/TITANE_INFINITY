[**TITANE∞ API Documentation v13.0.0**](../../README.md)

***

[TITANE∞ API Documentation](../../modules.md) / [hooks](../README.md) / useFileOperations

# Function: useFileOperations()

> **useFileOperations**(): `object`

Defined in: hooks/useFileOperations.ts:42

## Returns

### files

> **files**: [`FileInfo`](../../services/tauriBridge/interfaces/FileInfo.md)[]

### currentFile

> **currentFile**: [`FileInfo`](../../services/tauriBridge/interfaces/FileInfo.md)

### loading

> **loading**: `boolean`

### progress

> **progress**: `number`

### error

> **error**: `string`

### list()

> **list**: (`path`, `options?`) => `Promise`\<[`FileInfo`](../../services/tauriBridge/interfaces/FileInfo.md)[]\>

List files in directory

#### Parameters

##### path

`string`

##### options?

[`ListFilesOptions`](../../services/tauriBridge/interfaces/ListFilesOptions.md)

#### Returns

`Promise`\<[`FileInfo`](../../services/tauriBridge/interfaces/FileInfo.md)[]\>

### info()

> **info**: (`path`) => `Promise`\<[`FileInfo`](../../services/tauriBridge/interfaces/FileInfo.md)\>

Get file info

#### Parameters

##### path

`string`

#### Returns

`Promise`\<[`FileInfo`](../../services/tauriBridge/interfaces/FileInfo.md)\>

### exists()

> **exists**: (`path`) => `Promise`\<`false` \| `CoreResponse`\<`boolean`\>\>

Check if file exists

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`false` \| `CoreResponse`\<`boolean`\>\>

### remove()

> **remove**: (`path`, `recursive`) => `Promise`\<`void`\>

Delete file or directory

#### Parameters

##### path

`string`

##### recursive

`boolean` = `false`

#### Returns

`Promise`\<`void`\>

### copy()

> **copy**: (`source`, `dest`, `overwrite`) => `Promise`\<`void`\>

Copy file or directory

#### Parameters

##### source

`string`

##### dest

`string`

##### overwrite

`boolean` = `false`

#### Returns

`Promise`\<`void`\>

### move()

> **move**: (`source`, `dest`, `overwrite`) => `Promise`\<`void`\>

Move/rename file or directory

#### Parameters

##### source

`string`

##### dest

`string`

##### overwrite

`boolean` = `false`

#### Returns

`Promise`\<`void`\>

### createDir()

> **createDir**: (`path`, `recursive`) => `Promise`\<`void`\>

Create directory

#### Parameters

##### path

`string`

##### recursive

`boolean` = `true`

#### Returns

`Promise`\<`void`\>

### upload()

> **upload**: (`path`, `content`, `onProgress?`) => `Promise`\<`void`\>

Upload file (write with progress)

#### Parameters

##### path

`string`

##### content

`string`

##### onProgress?

(`progress`) => `void`

#### Returns

`Promise`\<`void`\>

### download()

> **download**: (`path`, `onProgress?`) => `Promise`\<`string`\>

Download file (read with progress)

#### Parameters

##### path

`string`

##### onProgress?

(`progress`) => `void`

#### Returns

`Promise`\<`string`\>

### reset()

> **reset**: () => `void`

Reset state

#### Returns

`void`
