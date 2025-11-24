[**TITANE∞ API Documentation v13.0.0**](../../README.md)

***

[TITANE∞ API Documentation](../../modules.md) / [hooks](../README.md) / useBatchCommands

# Function: useBatchCommands()

> **useBatchCommands**(): `object`

Defined in: hooks/useBatchCommands.ts:26

## Returns

`object`

### isExecuting

> **isExecuting**: `boolean`

### progress

> **progress**: [`BatchProgress`](../../services/tauriBridge/type-aliases/BatchProgress.md)

### results

> **results**: [`BatchResult`](../../services/tauriBridge/type-aliases/BatchResult.md)[]

### error

> **error**: `string`

### executeBatch()

> **executeBatch**: (`commands`, `options?`) => `Promise`\<[`BatchResult`](../../services/tauriBridge/type-aliases/BatchResult.md)\<`any`\>[]\>

#### Parameters

##### commands

[`BatchCommand`](../../services/tauriBridge/type-aliases/BatchCommand.md)[]

##### options?

[`BatchOptions`](../../services/tauriBridge/type-aliases/BatchOptions.md)

#### Returns

`Promise`\<[`BatchResult`](../../services/tauriBridge/type-aliases/BatchResult.md)\<`any`\>[]\>

### executeParallel()

> **executeParallel**: (`commands`, `options?`) => `Promise`\<[`BatchResult`](../../services/tauriBridge/type-aliases/BatchResult.md)\<`any`\>[]\>

#### Parameters

##### commands

[`BatchCommand`](../../services/tauriBridge/type-aliases/BatchCommand.md)[]

##### options?

`Omit`\<[`BatchOptions`](../../services/tauriBridge/type-aliases/BatchOptions.md), `"mode"`\>

#### Returns

`Promise`\<[`BatchResult`](../../services/tauriBridge/type-aliases/BatchResult.md)\<`any`\>[]\>

### executeSequential()

> **executeSequential**: (`commands`, `options?`) => `Promise`\<[`BatchResult`](../../services/tauriBridge/type-aliases/BatchResult.md)\<`any`\>[]\>

#### Parameters

##### commands

[`BatchCommand`](../../services/tauriBridge/type-aliases/BatchCommand.md)[]

##### options?

`Omit`\<[`BatchOptions`](../../services/tauriBridge/type-aliases/BatchOptions.md), `"mode"`\>

#### Returns

`Promise`\<[`BatchResult`](../../services/tauriBridge/type-aliases/BatchResult.md)\<`any`\>[]\>

### reset()

> **reset**: () => `void`

#### Returns

`void`
