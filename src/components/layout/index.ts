/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v8.0 - Layout Components Index (Tailwind CSS)
 * Export centralisé de tous les composants de layout
 * ═══════════════════════════════════════════════════════════════
 */

// Main Layout Components (Tailwind migrated)
export { AppShell, type AppShellProps } from './AppShell';
export { AppShellWithDevTools, type AppShellWithDevToolsProps } from './AppShellWithDevTools';
export { Sidebar, type SidebarProps, type SidebarItem } from './Sidebar';
export { Header, type HeaderProps } from './Header';
export { MobileNav, type MobileNavProps } from './MobileNav';

// Utility Layout Components (original)
export { Grid, Col, type GridProps, type ColProps, type GridColumns, type ColSpan } from './Grid';
export { Container, type ContainerProps, type ContainerSize } from './Container';
export { Stack, type StackProps, type StackDirection, type StackAlign, type StackJustify } from './Stack';
