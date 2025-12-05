[**TITANE∞ API Documentation v13.0.0**](../../README.md)

***

[TITANE∞ API Documentation](../../modules.md) / [hooks](../README.md) / useMemoryCore

# Function: useMemoryCore()

> **useMemoryCore**(): `object`

Defined in: [hooks/useMemoryCore.ts:27](https://github.com/KallokTherok1994/TITANE_INFINITY/blob/d1e83203e13ab021eafefc30bd09d69505f4d21a/src/hooks/useMemoryCore.ts#L27)

## Returns

`object`

### entries

> **entries**: `MemoryEntry`[]

### loading

> **loading**: `boolean`

### error

> **error**: `string`

### loadEntries()

> **loadEntries**: () => `Promise`\<`MemoryState`\>

#### Returns

`Promise`\<`MemoryState`\>

### saveEntry()

> **saveEntry**: (`content`) => `Promise`\<`void`\>

#### Parameters

##### content

`string`

#### Returns

`Promise`\<`void`\>

### clearMemory()

> **clearMemory**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### getMemoryState()

> **getMemoryState**: () => `Promise`\<`MemoryState`\>

#### Returns

`Promise`\<`MemoryState`\>
