[**TITANE∞ API Documentation v13.0.0**](../../../README.md)

***

[TITANE∞ API Documentation](../../../modules.md) / [services/tauriBridge](../README.md) / invokeTauriCommand

# Function: invokeTauriCommand()

> **invokeTauriCommand**\<`T`\>(`command`, `params?`, `options?`): `Promise`\<`CoreResponse`\<`T`\>\>

Defined in: services/tauriBridge.ts:67

Wrapper centralisé pour toutes les commandes Tauri
- Logging automatique
- Error handling unifié
- Timeout configurable
- Retry logic optionnel

## Type Parameters

### T

`T` = `any`

## Parameters

### command

`string`

### params?

`Record`\<`string`, `any`\>

### options?

#### timeout?

`number`

#### retries?

`number`

#### retryDelay?

`number`

## Returns

`Promise`\<`CoreResponse`\<`T`\>\>
