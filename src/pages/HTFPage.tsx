// HTF Module — L'Humain à tout faire
// Page principale /htf — 5 onglets

import React, { useEffect } from 'react';
import { HTFDashboard } from '../components/htf/HTFDashboard';
import { HTFSubmissionWizard } from '../components/htf/HTFSubmissionWizard';
import { HTFClientPanel } from '../components/htf/HTFClientPanel';
import { HTFEstimationResult } from '../components/htf/HTFEstimationResult';
import { useHTFStore } from '../stores/useHTFStore';
import { installHtfSkillIfAbsent } from '../services/htf/installHtfSkill';

type Tab = 'dashboard' | 'soumission' | 'crm' | 'historique' | 'connaissance';

export function HTFPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>('dashboard');
  const { submissions, loadAll, activeEstimation } = useHTFStore();

  useEffect(() => {
    installHtfSkillIfAbsent();
    loadAll();
  }, [loadAll]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'soumission', label: 'Nouvelle soumission', icon: '📋' },
    { id: 'crm', label: 'Clients', icon: '👥' },
    { id: 'historique', label: 'Historique', icon: '🗂️' },
    { id: 'connaissance', label: 'Base HTF', icon: '📚' },
  ];

  return (
    <div data-testid="htf-module-page" className="htf-page min-h-screen bg-white">
      {/* Header */}
      <div className="htf-page__header bg-green-700 text-white px-6 py-4">
        <h1 className="text-2xl font-bold">🏡 L'Humain à tout faire</h1>
        <p className="text-green-100 text-sm">
          Kevin Thibault · Saguenay · www.humainatoutfaire.com
        </p>
      </div>

      {/* Tabs */}
      <div
        data-testid="htf-tabs"
        className="htf-page__tabs flex overflow-x-auto border-b border-gray-200 bg-gray-50"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            data-testid={`htf-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-green-600 text-green-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="htf-page__content">
        {activeTab === 'dashboard' && <HTFDashboard />}

        {activeTab === 'soumission' && (
          <div className="flex flex-col md:flex-row gap-4 p-4">
            <div className="flex-1">
              <HTFSubmissionWizard />
            </div>
            {activeEstimation && (
              <div className="flex-1">
                <HTFEstimationResult estimation={activeEstimation as never} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'crm' && <HTFClientPanel />}

        {activeTab === 'historique' && (
          <div data-testid="htf-historique" className="p-4 space-y-3">
            <h3 className="text-lg font-bold text-gray-700">
              🗂️ Historique des soumissions
            </h3>
            {submissions.length === 0 && (
              <p className="text-sm text-gray-400 italic">
                Aucune soumission enregistrée
              </p>
            )}
            {submissions.map(sub => (
              <div
                key={sub.id}
                data-testid={`htf-historique-item-${sub.id}`}
                className="rounded-lg border border-gray-200 p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{sub.numero}</p>
                  <p className="text-xs text-gray-500">
                    {sub.clientNom ?? 'Client non spécifié'}
                  </p>
                  <p className="text-xs text-gray-400">{sub.dateCreation.slice(0, 10)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700 text-sm">
                    {sub.totalAvecTaxes.toFixed(2)} $
                  </p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      sub.statut === 'acceptee'
                        ? 'bg-green-100 text-green-700'
                        : sub.statut === 'envoyee'
                          ? 'bg-yellow-100 text-yellow-700'
                          : sub.statut === 'refusee'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {sub.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'connaissance' && (
          <div data-testid="htf-connaissance" className="p-4 space-y-3">
            <h3 className="text-lg font-bold text-gray-700">
              📚 Base de connaissance HTF
            </h3>
            <p className="text-sm text-gray-600">
              La base de connaissance HTF est chargée automatiquement dans le contexte
              TITANE∞. Elle comprend 5 modules :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Identité de L'Humain à tout faire</li>
              <li>Manuel de formation T1/T2/T3 avec POS</li>
              <li>Règles de tarification et calcul</li>
              <li>Catalogue complet des services et matériaux</li>
              <li>Modèle officiel de soumission</li>
            </ul>
            <p className="text-xs text-gray-400 mt-2">
              Activez le mode chat « HTF — Soumission » pour générer des soumissions par
              IA.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
