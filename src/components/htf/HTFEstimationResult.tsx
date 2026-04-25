// HTF Module — L'Humain à tout faire
// Affichage d'une estimation/soumission générée

import React from 'react';
import { exportSubmissionText } from '../../services/htf/htfSubmissionService';
import type { HTFSubmission } from '../../services/htf/types';

interface HTFEstimationResultProps {
  estimation: HTFSubmission;
}

export function HTFEstimationResult({ estimation }: HTFEstimationResultProps) {
  function handleCopyText() {
    const text = exportSubmissionText(estimation);
    navigator.clipboard.writeText(text).catch(() => undefined);
  }

  return (
    <div data-testid="htf-estimation-result" className="htf-estimation-result p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-green-700">Soumission {estimation.numero}</h3>
          <p className="text-xs text-gray-500">
            Valide jusqu'au {estimation.dateValidite} · {estimation.statut}
          </p>
        </div>
        <button
          data-testid="htf-btn-copy-text"
          onClick={handleCopyText}
          className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
        >
          📋 Copier
        </button>
      </div>

      {estimation.clientNom && (
        <p data-testid="htf-result-client" className="text-sm font-medium text-gray-800">
          Client : {estimation.clientNom}
        </p>
      )}

      <div
        data-testid="htf-result-description"
        className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700"
      >
        {estimation.descriptionProjet}
      </div>

      {estimation.items.length > 0 && (
        <div data-testid="htf-result-items">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Détail</h4>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Description</th>
                <th className="text-right p-2">Qté</th>
                <th className="text-right p-2">P.U.</th>
                <th className="text-right p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {estimation.items.map((item, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="p-2">{item.description}</td>
                  <td className="text-right p-2">{item.quantite} {item.unite}</td>
                  <td className="text-right p-2">{item.prixUnitaire.toFixed(2)} $</td>
                  <td className="text-right p-2 font-medium">{item.total.toFixed(2)} $</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        data-testid="htf-result-totaux"
        className="rounded-lg bg-green-50 border border-green-200 p-3 space-y-1 text-sm"
      >
        <div className="flex justify-between">
          <span className="text-gray-600">Sous-total HT</span>
          <span>{estimation.sousTotal.toFixed(2)} $</span>
        </div>
        <div className="flex justify-between text-gray-500 text-xs">
          <span>TPS (5%)</span>
          <span>{estimation.tps.toFixed(2)} $</span>
        </div>
        <div className="flex justify-between text-gray-500 text-xs">
          <span>TVQ (9,975%)</span>
          <span>{estimation.tvq.toFixed(2)} $</span>
        </div>
        <div className="flex justify-between font-bold text-green-800 text-base border-t border-green-300 pt-1 mt-1">
          <span>TOTAL</span>
          <span data-testid="htf-result-total">{estimation.totalAvecTaxes.toFixed(2)} $</span>
        </div>
        <p className="text-xs text-gray-500 pt-1">
          Acompte 30% : {(estimation.totalAvecTaxes * 0.3).toFixed(2)} $
        </p>
      </div>

      {estimation.planMiseEnOeuvre.length > 0 && (
        <div data-testid="htf-result-plan">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Plan de mise en œuvre</h4>
          <ol className="list-decimal list-inside space-y-1">
            {estimation.planMiseEnOeuvre.map((step) => (
              <li key={step.ordre} className="text-sm text-gray-600">
                <span className="font-medium">{step.titre}</span>
                {step.dureeEstimeeH > 0 && (
                  <span className="text-xs text-gray-400 ml-2">
                    (~{step.dureeEstimeeH}h, {step.niveau})
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
