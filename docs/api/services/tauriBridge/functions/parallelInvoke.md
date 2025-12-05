[**TITANE∞ API Documentation v13.0.0**](../../../README.md)

***

[TITANE∞ API Documentation](../../../modules.md) / [services/tauriBridge](../README.md) / parallelInvoke

# Function: parallelInvoke()

> **parallelInvoke**\<`T`\>(`commands`, `options?`): `Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>

Defined in: services/tauriBridge.ts:474

Execute commands in parallel (shorthand)

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
