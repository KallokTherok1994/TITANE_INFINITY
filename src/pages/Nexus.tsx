/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — NEXUS PAGE (FIXED)
 *   Réseau cognitif avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { useTitaneCore } from '../hooks';
import { extractNumber } from '../utils/dataUtils';
import './ModulePages.css';

export const Nexus = () => {
  const { getNexusGraph } = useTitaneCore();
  const [graph, setGraph] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const data = await getNexusGraph();
        setGraph(data);
      } catch (err) {
        console.error('Failed to fetch Nexus graph:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
    const interval = setInterval(fetchGraph, 5000);
    return () => clearInterval(interval);
  }, [getNexusGraph]);

  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">🧠</span>
          <p>Chargement du graphe Nexus...</p>
        </div>
      </div>
    );
  }

  const nodes = extractNumber(graph?.nodes, 0);
  const connections = extractNumber(graph?.connections, 0);

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">🧠</span>
          Nexus — Réseau Cognitif
        </h1>
        <p className="module-page__subtitle">Architecture neurale et connexions actives</p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Nœuds Actifs"
          icon="🔵"
          value={nodes}
          subtitle="Points de traitement"
          variant="primary"
        />

        <ModuleCard
          title="Connexions"
          icon="🔗"
          value={connections}
          subtitle="Liens actifs"
          variant="success"
        />

        <ModuleCard
          title="Densité du Réseau"
          icon="📊"
          value={nodes > 0 ? Math.round((connections / nodes) * 100) : 0}
          unit="%"
          subtitle="Interconnectivité"
          variant="warning"
        />
      </div>
    </div>
  );
};
