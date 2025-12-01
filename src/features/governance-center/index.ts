/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   CENTRE GOUVERNANCE & SÉCURITÉ TITANE∞
 *   Fusion: Gouvernance + Sécurité + SecureSecrets + Politiques IA + Journal
 *   4 onglets: Secrets / Politiques / Permissions / Journal
 * ═══════════════════════════════════════════════════════════════
 */

// Page principale
export { GovernanceCenterPage } from './GovernanceCenterPage';

// Onglets
export { SecretsTab } from './tabs/SecretsTab';
export { PoliciesTab } from './tabs/PoliciesTab';
export { PermissionsTab } from './tabs/PermissionsTab';
export { SecurityLogTab } from './tabs/SecurityLogTab';

// Types
export * from './types';

// Hooks
export { useGovernance } from './hooks/useGovernance';

// Services
export { governanceService } from './services/governanceService';
