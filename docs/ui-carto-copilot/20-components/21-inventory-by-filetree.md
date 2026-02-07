# Component Inventory by File Tree

**Date:** 2026-02-07  
**Total Components:** ~296 (206 components/ + 49 features/ + 41 pages/)

---

## File Tree Summary

```
src/
├── components/ (206 files)
│   ├── chat/ (23) - MessageBubble, ChatInput, MessageList, VirtualMessageList, etc.
│   ├── monitoring/ (14) - SystemHealthMonitor, MetricsCard, SingularityDashboard, etc.
│   ├── devtools/ (13) - LogViewer, MetricsDisplay, CoreHealthMonitor, EventStream
│   ├── experience/ (6) - GlobalExpBar, TalentTree, XPBar, TimelineChart
│   ├── layout/ (9) - AppShell, TopNav, Sidebar, Header, MobileNav
│   ├── ui/ (13) - button, card, dialog, input, tabs, badge, switch, alert
│   ├── panels/ (5) - ChatPanel, DevToolsPanel, MemoryPanel, SelfHealingPanel
│   ├── sections/ (8) - ConversationSection, MemorySection, ProgressionSection
│   ├── performance/ (5) - PerformanceDashboard, MetricsGraph
│   ├── Centers/ (6) - HyperCenter, QuantumCenter, MetaCenter, RealityCenter, IdentityCenter, MemoryEvolutionCenter
│   └── Other (38 dirs, 88 files) - vision, audio, cognitive, voice, etc.
├── features/ (49 files)
│   ├── chat/ (7) - ChatMessage, TypingIndicator, ThinkingPanel
│   ├── conversation/ (7) - Mirror of chat components
│   ├── system-center/ (12) - SystemCenterPage, tabs, hooks
│   ├── governance-center/ (9) - GovernanceCenterPage, APIProviderCard
│   └── Other (11 areas, 14 files)
└── pages/ (41 files) - TitanePage, DevPage, AdminPage, Stats, etc.
```

---

## Critical UI Files (Top 50)

| Rank | File | Size | LOC | Purpose |
|------|------|------|-----|---------|
| 1 | App.tsx | 48.5 KB | ~1200 | Root component, routes |
| 2 | main.tsx | 35.3 KB | ~900 | Entry point |
| 3 | TitanePage.tsx | 25 KB | ~600 | Main hub |
| 4 | DevPage.tsx | 22 KB | ~550 | Dev tools |
| 5 | AdminPage.tsx | 20 KB | ~500 | Admin center |
| 6 | Stats.tsx | 18 KB | ~450 | Metrics page |
| 7 | SystemHealthMonitor.tsx | 15 KB | ~380 | Health dashboard |
| 8 | ChatInput.tsx | 12 KB | ~300 | Message composition |
| 9 | MessageList.tsx | 11 KB | ~280 | Chat messages |
| 10 | TopNav.tsx | 10 KB | ~250 | Navigation bar |

(Additional 40 files omitted for brevity - see full file tree in repo)

---

**Next:** 23-hooks-stores.md
