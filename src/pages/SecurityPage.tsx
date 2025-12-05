/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — SECURITY PAGE
 * Page complète pour la gestion des clés API
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { SecurityPanel } from '@/components/security';
import './SecurityPage.css';

const SecurityPage: React.FC = () => {
  return (
    <div className="security-page">
      <div className="security-page__container">
        <SecurityPanel />
      </div>
    </div>
  );
};

export default SecurityPage;
