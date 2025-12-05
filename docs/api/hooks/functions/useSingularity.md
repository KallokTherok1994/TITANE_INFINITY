[**TITANE∞ API Documentation v13.0.0**](../../README.md)

***

[TITANE∞ API Documentation](../../modules.md) / [hooks](../README.md) / useSingularity

# Function: useSingularity()

> **useSingularity**(`autoInit`): `object`

Defined in: [hooks/useSingularity.ts:40](https://github.com/KallokTherok1994/TITANE_INFINITY/blob/d1e83203e13ab021eafefc30bd09d69505f4d21a/src/hooks/useSingularity.ts#L40)

Hook pour accéder à l'état de singularité

## Parameters

### autoInit

`boolean` = `true`

Initialiser automatiquement le moteur (défaut: true)

## Returns

`object`

État de singularité et méthodes de contrôle

### state

> **state**: `SingularityState`

### consciousness

> **consciousness**: `number` = `state.consciousness`

### autoCoherence

> **autoCoherence**: `number` = `state.autoCoherence`

### formStability

> **formStability**: `number` = `state.formStability`

### expressionQuality

> **expressionQuality**: `number` = `state.expressionQuality`

### field

> **field**: `object` = `state.singularityField`

#### field.energy

> **energy**: `number`

#### field.motion

> **motion**: `number`

#### field.symbolism

> **symbolism**: `number`

#### field.depth

> **depth**: `number`

#### field.presence

> **presence**: `number`

### unity

> **unity**: `UnityState` = `state.unity`

### quantum

> **quantum**: `QuantumField` = `state.quantum`

### convergence

> **convergence**: `ConvergenceState` = `state.convergence`

### overmind

> **overmind**: `OvermindState` = `state.overmind`

### omnipresence

> **omnipresence**: `OmnipresenceState` = `state.omnipresence`

### globalHarmony

> **globalHarmony**: `number` = `state.unity.globalHarmony`

### globalEntropy

> **globalEntropy**: `number` = `state.unity.globalEntropy`

### systemHealth

> **systemHealth**: `number` = `state.unity.systemHealth`

### isInitialized

> **isInitialized**: `boolean`

### updateState()

> **updateState**: (`partial`) => `void`

#### Parameters

##### partial

`Partial`\<`SingularityState`\>

#### Returns

`void`

### reset()

> **reset**: () => `void`

#### Returns

`void`

### signature

> **signature**: `string` = `state.signature`

### essence

> **essence**: `string` = `state.essence`

### timestamp

> **timestamp**: `number` = `state.timestamp`

## Example

```tsx
function MyComponent() {
  const { state, isInitialized, consciousness } = useSingularity();

  return (
    <div>
      <p>Consciousness: {consciousness}/4</p>
      <p>Harmony: {(state.unity.globalHarmony * 100).toFixed(0)}%</p>
    </div>
  );
}
```
