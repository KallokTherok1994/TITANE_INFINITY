/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — ADAPTIVE ENGINE PAGE (FIXED)
 *   Optimisation dynamique avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { useTitaneCore } from '../hooks';
import { extractNumber, extractString } from '../utils/dataUtils';
import './ModulePages.css';

export const AdaptiveEngine = () => {
  const { getAdaptiveData } = useTitaneCore();
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAdaptiveData();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch Adaptive Engine data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [getAdaptiveData]);

  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">🎯</span>
          <p>Chargement Adaptive Engine...</p>
        </div>
      </div>
    );
  }

  const adjustments = extractNumber(data?.adjustments, 0);
  const efficiency = extractNumber(data?.efficiency, 0);
  const status = extractString(data?.status, 'Unknown');

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">🎯</span>
          Adaptive Engine — Optimisation
        </h1>
        <p className="module-page__subtitle">Ajustements dynamiques et apprentissage adaptatif</p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Ajustements Effectués"
          icon="⚙️"
          value={adjustments}
          subtitle="Optimisations totales"
          variant="primary"
        />

        <ModuleCard
          title="Efficacité"
          icon="📈"
          value={efficiency}
          unit="%"
          status={status}
          subtitle="Performance globale"
          variant={efficiency > 85 ? 'success' : efficiency > 70 ? 'warning' : 'error'}
        />

        <ModuleCard
          title="État"
          icon="💫"
          status={status}
          subtitle="Statut du moteur"
          variant="success"
        />
      </div>
    </div>
  );
};
