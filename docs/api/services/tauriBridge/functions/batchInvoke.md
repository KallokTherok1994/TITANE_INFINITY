[**TITANE∞ API Documentation v13.0.0**](../../../README.md)

***

[TITANE∞ API Documentation](../../../modules.md) / [services/tauriBridge](../README.md) / batchInvoke

# Function: batchInvoke()

> **batchInvoke**\<`T`\>(`commands`, `options`): `Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>

Defined in: services/tauriBridge.ts:347

Execute multiple Tauri commands in batch

## Type Parameters

### T

`T` = `any`

## Parameters

### commands

[`BatchCommand`](../type-aliases/BatchCommand.md)[]

Array of commands to execute

### options

[`BatchOptions`](../type-aliases/BatchOptions.md) = `{}`

Batch execution options

## Returns

`Promise`\<[`BatchResult`](../type-aliases/BatchResult.md)\<`T`\>[]\>

Array of results (one per command)
