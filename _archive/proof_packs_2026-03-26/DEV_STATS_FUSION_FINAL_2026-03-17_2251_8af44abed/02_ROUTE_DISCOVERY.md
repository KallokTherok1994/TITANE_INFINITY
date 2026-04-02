# ROUTE DISCOVERY — src/App.tsx

| Route | Declaration | Target |
|-------|------------|--------|
| `/` | Navigate replace | `/titane` |
| `/titane` | ErrorBoundary > TitanePage | TitanePage |
| `/chat` | Navigate replace | `/titane` |
| `/stats` | **Navigate replace** | **`/dev`** ← CANONICAL REDIRECT ✅ |
| `/cognitive` | Navigate replace | `/dev` |
| `/time` | ErrorBoundary > TimePage | TimePage |
| `/admin` | ErrorBoundary > AdminPage | AdminPage |
| `/dev` | ErrorBoundary > DevPage | **DevPage ← CANONICAL** |
| `/one-core` | Navigate replace | `/dev` |
| `/qa-monitoring` | Navigate replace | `/dev` |
| `/monitoring` | Navigate replace | `/dev` |
| `*` | Navigate replace | `/` |

## /stats status
CANONICALLY REDIRECTED — `<Route path="/stats" element={<Navigate to="/dev" replace />} />`
Old Stats page: `src/pages/Stats.tsx` — exports StatsSystemPanels (used by DevPage) + unrouted Stats component.

## /cognitive status
CANONICALLY REDIRECTED — `<Route path="/cognitive" element={<Navigate to="/dev" replace />} />`
