# DIFF FILES

## diff --git a/src/App.tsx

```diff
@@ -116,9 +116,6 @@ const Experience = lazy(() =>
 const Experience = lazy(() =>
   import('./pages/Experience').then(m => ({ default: m.Experience }))
 );
-// v29.1: kept for rollback — route redirected to /dev
-// eslint-disable-next-line @typescript-eslint/no-unused-vars
-const Stats = lazy(() => import('./pages/Stats').then(m => ({ default: m.Stats })));
 
 // ✨ v24 - Performance: Lazy load SingularityMonitor

@@ -885,12 +882,6 @@ const AppRouter: React.FC = () => {
         route: '/time',
         description: 'Centre Temporel',
       },
-      {
-        id: 'stats',
-        label: 'STATS',
-        route: '/dev',
-        description: 'Métriques moteurs fusionnées dans DEV Cockpit > Diagnostics',
-      },
       {
         id: 'admin',
```

## diff --git a/e2e/desktop/page-objects/uiPages.po.js

```diff
@@ -87,7 +87,6 @@ export const topLevelPageOrder = [
   uiPages.titane,
   uiPages.time,
-  uiPages.stats,
   uiPages.admin,
   uiPages.dev,
```
