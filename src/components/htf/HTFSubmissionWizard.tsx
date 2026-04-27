// HTF Module — L'Humain à tout faire
// Assistant IA pour générer une soumission (wizard 5 étapes)

import React, { useState } from 'react';
import { useHTFStore } from '../../stores/useHTFStore';
import { generateEstimation } from '../../services/htf/htfEstimationService';
import { saveSubmission } from '../../services/htf/htfSubmissionService';
import type { HTFSubmission } from '../../services/htf/types';

type Step = 'description' | 'surface' | 'options' | 'review' | 'done';

export function HTFSubmissionWizard() {
  const {
    activeClient,
    setActiveEstimation,
    setIsGenerating,
    addSubmission,
    isGenerating,
  } = useHTFStore();

  const [step, setStep] = useState<Step>('description');
  const [description, setDescription] = useState('');
  const [surfaceM2, setSurfaceM2] = useState<number | ''>('');
  const [urgence, setUrgence] = useState(false);
  const [finSemaine, setFinSemaine] = useState(false);
  const [estimation, setEstimation] = useState<HTFSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);
    try {
      const majorations = [];
      if (urgence)
        majorations.push({
          type: 'urgence_24h' as const,
          multiplicateur: 1.35,
          description: 'Urgence < 24h',
        });
      if (finSemaine)
        majorations.push({
          type: 'fin_semaine' as const,
          multiplicateur: 1.2,
          description: 'Fin de semaine',
        });

      const est = await generateEstimation({
        descriptionProjet: description,
        clientId: activeClient?.id,
        clientNom: activeClient?.nom,
        surfaceM2: surfaceM2 !== '' ? surfaceM2 : undefined,
        majorations,
      });

      const sub: HTFSubmission = { ...est };
      saveSubmission(sub);
      addSubmission(sub);
      setActiveEstimation(sub);
      setEstimation(sub);
      setStep('done');
    } catch (e) {
      setError(String(e));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div data-testid="htf-submission-wizard" className="htf-wizard p-4 space-y-4">
      <h3 className="text-lg font-bold text-green-700">📋 Nouvelle soumission HTF</h3>

      {error && (
        <div
          data-testid="htf-wizard-error"
          className="rounded bg-red-50 border border-red-300 p-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {step === 'description' && (
        <div data-testid="htf-step-description" className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Description du projet *
          </label>
          <textarea
            data-testid="htf-input-description"
            className="w-full rounded border border-gray-300 p-2 text-sm"
            rows={4}
            placeholder="Ex: Pose d'une terrasse en dalles béton 60×60 de 24m², accès latéral..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <button
            data-testid="htf-btn-next-surface"
            disabled={description.trim().length < 10}
            onClick={() => setStep('surface')}
            className="rounded bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      )}

      {step === 'surface' && (
        <div data-testid="htf-step-surface" className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Superficie estimée (m²) — facultatif
          </label>
          <input
            data-testid="htf-input-surface"
            type="number"
            min={1}
            className="rounded border border-gray-300 p-2 text-sm w-40"
            placeholder="24"
            value={surfaceM2}
            onChange={e =>
              setSurfaceM2(e.target.value === '' ? '' : Number(e.target.value))
            }
          />
          <div className="flex gap-3">
            <button
              onClick={() => setStep('description')}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              ← Retour
            </button>
            <button
              data-testid="htf-btn-next-options"
              onClick={() => setStep('options')}
              className="rounded bg-green-600 px-4 py-2 text-sm text-white"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {step === 'options' && (
        <div data-testid="htf-step-options" className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Options</label>
          <label className="flex items-center gap-2 text-sm">
            <input
              data-testid="htf-opt-urgence"
              type="checkbox"
              checked={urgence}
              onChange={e => setUrgence(e.target.checked)}
            />
            Urgence moins de 24h (+35%)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              data-testid="htf-opt-fin-semaine"
              type="checkbox"
              checked={finSemaine}
              onChange={e => setFinSemaine(e.target.checked)}
            />
            Fin de semaine (+20%)
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setStep('surface')}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              ← Retour
            </button>
            <button
              data-testid="htf-btn-generate"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              {isGenerating ? 'Génération...' : '⚡ Générer la soumission'}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && estimation && (
        <div
          data-testid="htf-step-done"
          className="space-y-2 rounded-lg bg-green-50 p-4 border border-green-200"
        >
          <p className="font-bold text-green-700">✅ Soumission générée</p>
          <p className="text-sm text-gray-700">N° {estimation.numero}</p>
          <p className="text-lg font-bold text-green-800">
            {estimation.totalAvecTaxes.toFixed(2)} $
          </p>
          <button
            data-testid="htf-btn-nouvelle"
            onClick={() => {
              setStep('description');
              setDescription('');
              setSurfaceM2('');
              setEstimation(null);
            }}
            className="rounded border border-green-600 px-3 py-2 text-sm text-green-700"
          >
            + Nouvelle soumission
          </button>
        </div>
      )}
    </div>
  );
}
