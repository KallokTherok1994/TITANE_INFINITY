[**TITANE∞ API Documentation v13.0.0**](../../README.md)

***

[TITANE∞ API Documentation](../../modules.md) / [hooks](../README.md) / useEngineSubscription

# Function: useEngineSubscription()

> **useEngineSubscription**(`engine`): \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \}

Defined in: hooks/useEngineSubscription.ts:28

Hook pour s'abonner aux mises à jour d'un engine
Remplace le pattern useState + setInterval

## Parameters

### engine

`EngineType`

## Returns

\{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \} \| \{ `data`: `any`; `loading`: `boolean`; \}

## Example

```tsx
export const Helios = () => {
  useEngineSubscription('helios');
  const heliosData = useSingularityState(selectEngineData('helios'));
  const { data: metrics, loading } = heliosData;
  // ...
}
```
