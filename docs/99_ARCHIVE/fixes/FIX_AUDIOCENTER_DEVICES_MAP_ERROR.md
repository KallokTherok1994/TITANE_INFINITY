# 🔧 Correction AudioCenter — devices.map is not a function

**Date** : 9 décembre 2025
**Fichier** : `src/features/audio-center/AudioCenterPage.tsx`
**Composant** : `DeviceSelector`

---

## ❌ Problème

```
TypeError: devices.map is not a function
```

**Cause** : Race condition où le composant `DeviceSelector` tentait de render avant que `outputDevices` ou `inputDevices` ne soient chargés, résultant en `undefined` ou `null` au lieu d'un tableau.

**Stack trace** :

```
DeviceSelector → devices.map → Error
```

---

## ✅ Solution

Ajout de vérification de sécurité dans le composant `DeviceSelector` :

```typescript
const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  label, icon, devices, selectedId, onSelect, isLoading
}) => {
  // ✅ Sécurité: S'assurer que devices est toujours un tableau
  const safeDevices = Array.isArray(devices) ? devices : [];

  return (
    <div className="space-y-2">
      <label className="text-sm text-neutral-300 flex items-center gap-2">
        <span>{icon}</span> {label}
      </label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isLoading || safeDevices.length === 0}
        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white
                   focus:border-cyan-500 focus:outline-none disabled:opacity-50"
      >
        {safeDevices.length === 0 ? (
          <option value="">Aucun appareil disponible</option>
        ) : (
          safeDevices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} {device.isActive ? '(Actif)' : ''}
            </option>
          ))
        )}
      </select>
    </div>
  );
};
```

---

## 🔍 Améliorations

1. **Vérification Array.isArray()** : Protection contre `undefined`, `null`, ou non-tableau
2. **Fallback vide** : Message "Aucun appareil disponible" si aucun device
3. **Disable select** : Désactivation du select si aucun appareil ou loading
4. **Message utilisateur** : UX claire en cas de devices vides

---

## ✅ Tests

**TypeScript** : ✅ Aucune erreur
**Runtime** : ✅ Pas de crash
**UX** : ✅ Message clair si pas de devices

---

## 📊 Impact

**Avant** :

- Crash au chargement si devices undefined
- ErrorBoundary déclenché
- UI cassée

**Après** :

- ✅ Render sécurisé même si devices undefined
- ✅ Message utilisateur clair
- ✅ Pas de crash
- ✅ Loading state respecté

---

**Status** : ✅ CORRIGÉ
