// HTF Module — L'Humain à tout faire
// Dashboard : métriques clés

import React from 'react';
import { useHTFStore } from '../../stores/useHTFStore';
import { getLearningInsights } from '../../services/htf/htfLearningService';

export function HTFDashboard() {
  const { submissions, clients, loadAll } = useHTFStore();

  React.useEffect(() => {
    loadAll();
  }, [loadAll]);

  const insights = getLearningInsights();

  const totalRevenu = submissions
    .filter((s) => s.statut === 'acceptee')
    .reduce((acc, s) => acc + s.totalAvecTaxes, 0);

  const nbAcceptees = submissions.filter((s) => s.statut === 'acceptee').length;
  const nbEnvoyees = submissions.filter((s) => s.statut === 'envoyee').length;
  const tauxConversion = submissions.length > 0
    ? Math.round((nbAcceptees / submissions.length) * 100)
    : 0;

  return (
    <div data-testid="htf-dashboard" className="htf-dashboard p-4 space-y-6">
      <div className="htf-dashboard__header">
        <h2 className="text-xl font-bold text-green-700">
          🏡 L'Humain à tout faire — Tableau de bord
        </h2>
        <p className="text-sm text-gray-500">Kevin Thibault · Saguenay</p>
      </div>

      <div className="htf-dashboard__metrics grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          data-testid="htf-metric-soumissions"
          className="htf-metric rounded-lg bg-green-50 p-4 border border-green-200"
        >
          <p className="text-2xl font-bold text-green-700">{submissions.length}</p>
          <p className="text-sm text-gray-600">Soumissions</p>
        </div>

        <div
          data-testid="htf-metric-clients"
          className="htf-metric rounded-lg bg-blue-50 p-4 border border-blue-200"
        >
          <p className="text-2xl font-bold text-blue-700">{clients.length}</p>
          <p className="text-sm text-gray-600">Clients</p>
        </div>

        <div
          data-testid="htf-metric-conversion"
          className="htf-metric rounded-lg bg-amber-50 p-4 border border-amber-200"
        >
          <p className="text-2xl font-bold text-amber-700">{tauxConversion}%</p>
          <p className="text-sm text-gray-600">Taux conversion</p>
        </div>

        <div
          data-testid="htf-metric-revenu"
          className="htf-metric rounded-lg bg-purple-50 p-4 border border-purple-200"
        >
          <p className="text-2xl font-bold text-purple-700">
            {totalRevenu.toFixed(0)} $
          </p>
          <p className="text-sm text-gray-600">Revenu accepté</p>
        </div>
      </div>

      {nbEnvoyees > 0 && (
        <div
          data-testid="htf-pending-alert"
          className="rounded-lg bg-yellow-50 border border-yellow-300 p-3 text-sm text-yellow-800"
        >
          ⏳ {nbEnvoyees} soumission{nbEnvoyees > 1 ? 's' : ''} en attente de réponse
        </div>
      )}

      {insights.nbrEntrees > 0 && (
        <div
          data-testid="htf-learning-insights"
          className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm"
        >
          <p className="font-semibold text-gray-700">
            Apprentissage continu — {insights.nbrEntrees} travaux complétés
          </p>
          <p className="text-gray-500">
            Facteur de précision global : {(insights.facteurMoyenGlobal * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
