# 11 — DIFF FILES

## Fichier modifié: src/components/twin/TwinEvolutionPanel.tsx

### CHANGE-01 (F-003): Version fallback
```diff
- <div className="twin-panel__version">v{identity?.version}</div>
+ <div className="twin-panel__version">v{identity?.version ?? 'N/A'}</div>
```

### CHANGE-02 (F-005): data-testid panel
```diff
- <div className="twin-panel">
+ <div className="twin-panel" data-testid="twin-evolution-panel">
```

### CHANGE-03 (F-004/F-005): aria-label + data-testid sur tabs
```diff
  <button
    className={`twin-panel__tab ...`}
    onClick={() => setActiveTab('fusion')}
+   aria-label="Onglet Fusion"
+   data-testid="twin-tab-fusion"
  >

  <button
    className={`twin-panel__tab ...`}
    onClick={() => setActiveTab('values')}
+   aria-label="Onglet Valeurs"
+   data-testid="twin-tab-values"
  >

  <button
    className={`twin-panel__tab ...`}
    onClick={() => setActiveTab('evolution')}
+   aria-label="Onglet Évolution"
+   data-testid="twin-tab-evolution"
  >

  <button  // (admin tab, conditional)
+   aria-label="Onglet Administration"
+   data-testid="twin-tab-admin"
  >
```

### CHANGE-04 (F-006): FusionTab empty state au lieu de null
```diff
  const FusionTab: React.FC<FusionTabProps> = ({ fusionIndex, humanStyle }) => {
-   if (!fusionIndex) return null;
+   if (!fusionIndex) return (
+     <div className="twin-tab__empty" data-testid="twin-fusion-empty">
+       Données de fusion non disponibles
+     </div>
+   );
```

## Aucun autre fichier modifié.
