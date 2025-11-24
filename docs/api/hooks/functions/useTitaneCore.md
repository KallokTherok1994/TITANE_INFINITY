[**TITANE∞ API Documentation v13.0.0**](../../README.md)

***

[TITANE∞ API Documentation](../../modules.md) / [hooks](../README.md) / useTitaneCore

# Function: useTitaneCore()

> **useTitaneCore**(`autoRefresh`): `object`

Defined in: [hooks/useTitaneCore.ts:28](https://github.com/KallokTherok1994/TITANE_INFINITY/blob/d1e83203e13ab021eafefc30bd09d69505f4d21a/src/hooks/useTitaneCore.ts#L28)

TITANE_INFINITY v13 — Proprietary License
© 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
Unauthorized use, reproduction, modification, distribution or extraction
of the software, its architecture, engines or components is strictly prohibited.
See LICENSE.md for the full legal terms (FR/EN).

## Parameters

### autoRefresh

`boolean` = `true`

## Returns

`object`

### systemStatus

> **systemStatus**: `SystemStatus`

### loading

> **loading**: `boolean`

### error

> **error**: `string`

### getSystemStatus()

> **getSystemStatus**: () => `Promise`\<`SystemStatus`\>

#### Returns

`Promise`\<`SystemStatus`\>

### getHeliosMetrics()

> **getHeliosMetrics**: () => `Promise`\<`HeliosMetrics`\>

#### Returns

`Promise`\<`HeliosMetrics`\>

### getNexusGraph()

> **getNexusGraph**: () => `Promise`\<`NexusGraph`\>

#### Returns

`Promise`\<`NexusGraph`\>

### getHarmoniaFlows()

> **getHarmoniaFlows**: () => `Promise`\<`HarmoniaFlows`\>

#### Returns

`Promise`\<`HarmoniaFlows`\>

### getSentinelStatus()

> **getSentinelStatus**: () => `Promise`\<`SentinelAlerts`\>

#### Returns

`Promise`\<`SentinelAlerts`\>

### getWatchdogData()

> **getWatchdogData**: () => `Promise`\<\{ `data`: `WatchdogData`; `logs`: `string`[]; \}\>

#### Returns

`Promise`\<\{ `data`: `WatchdogData`; `logs`: `string`[]; \}\>

### getSelfHealData()

> **getSelfHealData**: () => `Promise`\<`SelfHealData`\>

#### Returns

`Promise`\<`SelfHealData`\>

### getAdaptiveData()

> **getAdaptiveData**: () => `Promise`\<`AdaptiveData`\>

#### Returns

`Promise`\<`AdaptiveData`\>
