/**
 * TITANE∞ vΩ∞ — Twins Page
 * © 2025 TITANE∞ — Proprietary License
 * Page hôte du Numeric Twin Engine (symbiose Kevin ↔ TITANE)
 */

import React from 'react';
import { TwinEvolutionPanel } from '../components/twin/TwinEvolutionPanel';

export const TwinsPage: React.FC = () => {
  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '24px',
      }}
    >
      <TwinEvolutionPanel isAdmin={true} compact={false} />
    </div>
  );
};

export default TwinsPage;
