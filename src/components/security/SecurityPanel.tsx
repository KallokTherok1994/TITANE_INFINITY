/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — SECURITY PANEL
 * Interface de gestion des clés API (OpenAI, Claude, Gemini)
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { IAService, type ProviderStatus, type IAProvider } from '@/services/ia';
import AddAPIKeyModal from './AddAPIKeyModal';
import './SecurityPanel.css';

const SecurityPanel: React.FC = () => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<IAProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger le statut des providers
  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const statuses = await IAService.getProvidersStatus();
      setProviders(statuses);
    } catch (err) {
      setError('Échec de chargement des providers: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  // Ouvrir le modal pour ajouter/modifier une clé
  const handleAddKey = (service: IAProvider) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  // Tester une clé API
  const handleTestKey = async (service: IAProvider) => {
    setError(null);
    setSuccess(null);
    try {
      const result = await IAService.testAPIKey(service);
      if (result.success && result.data) {
        setSuccess(`✅ Clé ${service} valide !`);
      } else {
        setError(`❌ Clé ${service} invalide: ${result.error || 'Échec de test'}`);
      }
      await loadProviders();
    } catch (err) {
      setError('Erreur lors du test: ' + String(err));
    }
  };

  // Supprimer une clé API
  const handleDeleteKey = async (service: IAProvider) => {
    if (!confirm(`Supprimer la clé API ${service} ?`)) return;

    setError(null);
    setSuccess(null);
    try {
      const result = await IAService.deleteAPIKey(service);
      if (result.success) {
        setSuccess(`✅ Clé ${service} supprimée`);
        await loadProviders();
      } else {
        setError(`❌ Échec suppression: ${result.error}`);
      }
    } catch (err) {
      setError('Erreur lors de la suppression: ' + String(err));
    }
  };

  // Callback après ajout de clé
  const handleKeySaved = async () => {
    setModalOpen(false);
    setSelectedService(null);
    setSuccess('✅ Clé API enregistrée avec succès');
    await loadProviders();
  };

  return (
    <div className="security-panel">
      <div className="security-panel__header">
        <h2>🔐 Gestion des Clés API</h2>
        <p className="security-panel__subtitle">
          Configuration sécurisée des providers IA (AES-256-GCM)
        </p>
      </div>

      {error && (
        <div className="security-panel__alert security-panel__alert--error">
          {error}
        </div>
      )}

      {success && (
        <div className="security-panel__alert security-panel__alert--success">
          {success}
        </div>
      )}

      {loading ? (
        <div className="security-panel__loading">
          <div className="spinner" />
          <p>Chargement des providers...</p>
        </div>
      ) : (
        <div className="security-panel__grid">
          {providers.map((provider) => (
            <div
              key={provider.service}
              className={`provider-card ${provider.active ? 'provider-card--active' : ''} ${
                provider.valid === false ? 'provider-card--invalid' : ''
              }`}
            >
              <div className="provider-card__header">
                <span className="provider-card__icon">{provider.icon}</span>
                <div className="provider-card__info">
                  <h3 className="provider-card__name">{provider.name}</h3>
                  <span className="provider-card__service">{provider.service}</span>
                </div>
              </div>

              <div className="provider-card__status">
                {provider.active ? (
                  <>
                    <span
                      className={`status-badge ${
                        provider.valid === true
                          ? 'status-badge--valid'
                          : provider.valid === false
                          ? 'status-badge--invalid'
                          : 'status-badge--unknown'
                      }`}
                    >
                      {provider.valid === true
                        ? '✅ Configuré et valide'
                        : provider.valid === false
                        ? '❌ Configuré mais invalide'
                        : '⏳ Configuré (test requis)'}
                    </span>
                  </>
                ) : (
                  <span className="status-badge status-badge--inactive">
                    ⚪ Non configuré
                  </span>
                )}
              </div>

              <div className="provider-card__actions">
                {provider.active ? (
                  <>
                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() => handleTestKey(provider.service)}
                    >
                      🧪 Tester
                    </button>
                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() => handleAddKey(provider.service)}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDeleteKey(provider.service)}
                    >
                      🗑️ Supprimer
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => handleAddKey(provider.service)}
                  >
                    ➕ Ajouter clé
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && selectedService && (
        <AddAPIKeyModal
          service={selectedService}
          onClose={() => {
            setModalOpen(false);
            setSelectedService(null);
          }}
          onSuccess={handleKeySaved}
        />
      )}
    </div>
  );
};

export default SecurityPanel;
