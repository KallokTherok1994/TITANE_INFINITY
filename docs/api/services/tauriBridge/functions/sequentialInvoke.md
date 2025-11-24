[**TITANE∞ API Documentation v13.0.0**](../../../README.md)

***

[TITANE∞ API Documentation](../../../modules.md) / [services/tauriBridge](../README.md) / sequentialInvoke

# Function: sequentialInvoke()

> **sequentialInvoke**\<`T`\>(`commands`, `options?`): `Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>

Defined in: services/tauriBridge.ts:484

Execute commands sequentially (shorthand)

## Type Parameters

### T

`T` = `any`

## Parameters

### commands

[`BatchCommand`](../type-aliases/BatchCommand.md)[]

### options?

`Omit`\<[`BatchOptions`](../type-aliases/BatchOptions.md), `"mode"`\>

## Returns

`Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>
