/**
 * TITANE∞ v26.4.0 — Dashboard Feature
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

// 🔧 P1_BUILD_CHUNKS_FIX: RealTimeCharts removed from static exports
// Reason: Conflict with dynamic import in OverviewSection.tsx
// Strategy: Keep 100% lazy loading via React.lazy() for performance
// export { RealTimeCharts } from './RealTimeCharts'; // ❌ REMOVED

export { DashboardEditor } from './DashboardEditor';
export { QuickStatCard } from './QuickStatCard';
