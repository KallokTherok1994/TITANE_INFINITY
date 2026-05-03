# 09 — RUNTIME VISIBLE METRICS

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22 — Run2

---

## Métriques complètes (run2_v22_metrics.json)

```json
{
  "runId": "run2",
  "modeDecision": "MODE_B_REAL_UI",
  "rootRendered": true,
  "whiteScreen": false,
  "actualVisibleFrontendConfirmed": true,
  "actualTargetVersion": "27.2.0",
  "mainAligned": true,
  "splash": { "exists": false, "visible": false },
  "boot": { "entryTs": false, "mainTsx": true, "ready": true },
  "tabsCount": 6,
  "selectedTabCount": 1,
  "tabSwitchWorked": true,
  "inputPresent": true,
  "inputTyped": true,
  "sendPresent": true,
  "sendEnabledAfterTyping": false,
  "sendClicked": false,
  "visibleUiChangeAfterSend": false,
  "secondarySurfaceOpened": true,
  "returnedToPrimarySurface": true,
  "backendSyncState": "CONNECTED",
  "orchestratorSyncState": "NOT_DETECTABLE_FROM_DOM",
  "providerState": "NOT_DETECTABLE_FROM_DOM",
  "memoryState": "NOT_DETECTABLE_FROM_DOM",
  "aiChatState": "ABSENT",
  "modulesState": "MODULES_LOADED",
  "reasoningProgressState": "ABSENT",
  "tabFocusRulePresent": true,
  "reflowReasonable": true,
  "potentialDoubleScroll": true,
  "contrastRatioInput": null,
  "frictions": [
    "CHAT_INPUT_NOT_VISIBLE",
    "SEND_BUTTON_NOT_VISIBLE",
    "REASONING_PROGRESS_ABSENT",
    "SEND_DISABLED_AFTER_TYPING"
  ],
  "blockers": [],
  "harnessRisks": [],
  "dominantClassification": "FAIL_LAYOUT_OR_REFLOW",
  "screenshots": 16
}
```

## Métriques S1 (boot initial)

```
url: tauri://localhost/titane
pageTitle: TITANE∞ v26.3.0 - Cognitive Operating System
bodyText: TITANE∞, TITANE, TIME, STATS, ADMIN, DEV
splashVisible: false
reactMounted: true
rootChildren: 3
ipcAvailable: true
hasMetadata: true
entryTs: false
zoom: 2
scrollContainers: 3
potentialDoubleScroll: true
```

## Health S5 (fin de session)

```json
{
  "blockingOverlays": 0,
  "scriptCount": 2,
  "visibleErrors": 0,
  "buttonCount": 104,
  "stylesheetCount": 9,
  "inputCount": 1
}
```

## Navigation S2

```
navItems: ["TITANE","TIME","STATS","ADMIN","DEV","Plus"]
URL avant: tauri://localhost/titane
URL après /time: tauri://localhost/titane#/time
DOM length delta: 53565 → 53571 (+6 chars = contenu changé)
URL retour: tauri://localhost/titane#/titane
tabSwitchWorked: true
```

## IPC S4

```json
{
  "hasInvoke": true,
  "tauriPresent": false,
  "internalsPresent": true,
  "runtimeVersion": null
}
```

## Référence fichier métriques

`artifacts/run2/run2_v22_metrics.json` — source de vérité pour tous les chiffres ci-dessus.
