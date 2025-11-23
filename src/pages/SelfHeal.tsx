/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — SELFHEAL PAGE (FIXED)
 *   Auto-réparation avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { useTitaneCore } from '../hooks';
import { extractNumber, extractString } from '../utils/dataUtils';
import './ModulePages.css';

export const SelfHeal = () => {
  const { getSelfHealData } = useTitaneCore();
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSelfHealData();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch SelfHeal data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [getSelfHealData]);

  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">🛡️</span>
          <p>Chargement SelfHeal...</p>
        </div>
      </div>
    );
  }

  const repairs = extractNumber(data?.repairs, 0);
  const successRate = extractNumber(data?.success_rate, 0);
  const status = extractString(data?.status, 'Unknown');

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">🛡️</span>
          SelfHeal — Auto-Réparation
        </h1>
        <p className="module-page__subtitle">Système d'auto-correction et maintenance</p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Réparations Effectuées"
          icon="🔧"
          value={repairs}
          status={status}
          subtitle="Actions correctives totales"
          variant="success"
        />

        <ModuleCard
          title="Taux de Succès"
          icon="✅"
          value={successRate}
          unit="%"
          subtitle="Efficacité des corrections"
          variant={successRate > 95 ? 'success' : successRate > 80 ? 'warning' : 'error'}
        />

        <ModuleCard
          title="État Système"
          icon="📊"
          status={status}
          subtitle="Statut actuel"
          variant="primary"
        />
      </div>
    </div>
  );
};
