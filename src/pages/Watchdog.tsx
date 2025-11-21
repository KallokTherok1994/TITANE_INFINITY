/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — WATCHDOG PAGE (FIXED)
 *   Surveillance temps réel avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { useTitaneCore } from '../hooks';
import { extractNumber, extractString } from '../utils/dataUtils';
import './ModulePages.css';

export const Watchdog = () => {
  const { getWatchdogData } = useTitaneCore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getWatchdogData();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch Watchdog data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [getWatchdogData]);

  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">👁️</span>
          <p>Chargement Watchdog...</p>
        </div>
      </div>
    );
  }

  const tickMisses = extractNumber(data?.tick_misses, 0);
  const anomalies = extractNumber(data?.anomalies, 0);
  const status = extractString(data?.status, 'Unknown');

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">👁️</span>
          Watchdog — Surveillance Temps Réel
        </h1>
        <p className="module-page__subtitle">Monitoring continu et détection d'anomalies</p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Tick Manqués"
          icon="⏱️"
          value={tickMisses}
          status={status}
          subtitle="Cycles manqués"
          variant={tickMisses === 0 ? 'success' : tickMisses < 5 ? 'warning' : 'error'}
        />

        <ModuleCard
          title="Anomalies Détectées"
          icon="🔍"
          value={anomalies}
          subtitle="Comportements atypiques"
          variant={anomalies === 0 ? 'success' : anomalies < 3 ? 'warning' : 'error'}
        />

        <ModuleCard
          title="État de Surveillance"
          icon="📡"
          status={status}
          subtitle="Monitoring actif"
          variant="primary"
        />
      </div>
    </div>
  );
};
