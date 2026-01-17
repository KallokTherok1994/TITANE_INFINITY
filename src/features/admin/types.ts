/**
 * TITANE∞ v25.2.2 — Admin Center Types
 * Module ADMIN unifié - Types & Interfaces
 * © 2025 TITANE Team. All rights reserved.
 */

export type AdminTab =
  | 'system' // Centre Système (Diagnostics, DevTools, Cluster, Introspection, HyperVision)
  | 'config' // Configuration HUB
  | 'audio' // Audio & Voix
  | 'design' // Design (Gesign)
  | 'governance'; // Gouvernance & Sécurité

export interface AdminTabDefinition {
  id: AdminTab;
  label: string;
  icon: string;
  description: string;
  badge?: string;
}

export const ADMIN_TABS: AdminTabDefinition[] = [
  {
    id: 'system',
    label: 'Système',
    icon: '⚙️',
    description: 'Diagnostics, DevTools, Cluster, Introspection, HyperVision',
    badge: 'v∞',
  },
  {
    id: 'config',
    label: 'Configuration',
    icon: '🎛️',
    description: 'Configuration Hub - Gestion centralisée',
    badge: 'v19.5',
  },
  {
    id: 'audio',
    label: 'Audio & Voix',
    icon: '🔊',
    description: 'Centre Audio, Voix TTS, Profils vocaux',
    badge: 'v19.2',
  },
  {
    id: 'design',
    label: 'Design',
    icon: '🎨',
    description: 'Design System, Apparence, Tokens UI',
    badge: 'v16',
  },
  {
    id: 'governance',
    label: 'Gouvernance',
    icon: '🛡️',
    description: 'Sécurité, Secrets, Politiques IA, Permissions',
    badge: 'SECURE',
  },
];
