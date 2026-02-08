# V7_AGENTGPT_KEYPOINTS

Source: [docs/reference/agentgpt-ui/ANALYSE-AGENTGPT.pdf](docs/reference/agentgpt-ui/ANALYSE-AGENTGPT.pdf)

Méthode d’extraction:

```
pdftotext -layout docs/reference/agentgpt-ui/ANALYSE-AGENTGPT.pdf - | rg -n "AppShell|AppLayout|Sidebar|TitanePage|MessageList|ErrorBoundary|Menu" -m 50
```

Extraits prouvés (verbatim, numéros de lignes issus de la sortie pdftotext):

- L337–340 : « AppShell / Layout principal : composant central ( src/components/layout/AppShell.tsx ) … Des versions héritées ( src/layouts/AppLayout.tsx et src/ui/AppLayout.tsx ) subsistent mais seront supprimées »
- L341–343 : « Sidebar Navigation : composant Sidebar.tsx … La liste des menus est externalisée dans un composant Menu.tsx »
- L346 : « Titane Page : la page principale TitanePage.tsx (environ 2071 lignes) »
- L351–352 : « Chat / Messages : le composant MessageList.tsx … comporte un ErrorBoundary … La version optimisée MessageListOptimized.tsx … »

Notes (sans invention):
- Les éléments ci‑dessus sont explicitement mentionnés dans l’analyse (preuves via sortie pdftotext).
- Toute autre hypothèse non prouvée doit être marquée UNPROVEN dans les phases suivantes.
