[**TITANE∞ API Documentation v13.0.0**](../../README.md)

***

[TITANE∞ API Documentation](../../modules.md) / [hooks](../README.md) / useLivingEngines

# Function: useLivingEngines()

> **useLivingEngines**(`updateInterval`): `object`

Defined in: [hooks/useLivingEngines.ts:56](https://github.com/KallokTherok1994/TITANE_INFINITY/blob/d1e83203e13ab021eafefc30bd09d69505f4d21a/src/hooks/useLivingEngines.ts#L56)

Hook pour synchroniser Persona Engine avec UI

## Parameters

### updateInterval

`number` = `100`

## Returns

`object`

### state

> **state**: [`LivingEnginesState`](../interfaces/LivingEnginesState.md) = `enginesState`

### actions

> **actions**: `object`

#### actions.updateSystemState()

> **updateSystemState**: (`newState`) => `Promise`\<`void`\>

##### Parameters

###### newState

`SystemState`

##### Returns

`Promise`\<`void`\>

#### actions.triggerPersonaReaction()

> **triggerPersonaReaction**: (`reaction`) => `Promise`\<`void`\>

##### Parameters

###### reaction

`"warning"` | `"error"` | `"success"` | `"overload"` | `"idle"`

##### Returns

`Promise`\<`void`\>

#### actions.updateCognitiveLoad()

> **updateCognitiveLoad**: (`load`) => `Promise`\<`void`\>

##### Parameters

###### load

`number`

##### Returns

`Promise`\<`void`\>
