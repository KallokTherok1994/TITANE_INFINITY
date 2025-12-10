/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — ADD API KEY MODAL
 * Modal pour ajouter/modifier une clé API
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { IAService, type IAProvider, ProviderNames } from '@/services/ia';
import './AddAPIKeyModal.css';

interface AddAPIKeyModalProps {
  service: IAProvider;
  onClose: () => void;
  onSuccess: () => void;
}

const AddAPIKeyModal: React.FC<AddAPIKeyModalProps> = ({
  service,
  onClose,
  onSuccess,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation côté client
    const validation = IAService.validateKeyFormat(service, apiKey);
    if (!validation.valid) {
      setError(validation.error || 'Clé invalide');
      return;
    }

    setLoading(true);
    try {
      const result = await IAService.setAPIKey(service, apiKey);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Échec de sauvegarde');
      }
    } catch (err) {
      setError('Erreur: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = (service: IAProvider): string => {
    switch (service) {
      case 'openai':
        return 'sk-proj-...';
      case 'claude':
        return 'sk-ant-...';
      case 'gemini':
        return 'AIza...';
      default:
        return 'Entrez votre clé API';
    }
  };

  const getInstructions = (service: IAProvider): string => {
    switch (service) {
      case 'openai':
        return 'Clé OpenAI (commence par "sk-proj-" ou "sk-", min. 40 caractères)';
      case 'claude':
        return 'Clé Anthropic Claude (commence par "sk-ant-", min. 50 caractères)';
      case 'gemini':
        return 'Clé Google Gemini (min. 30 caractères)';
      default:
        return 'Entrez votre clé API';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔑 Ajouter/Modifier Clé API</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="service">Provider</label>
            <input
              id="service"
              type="text"
              value={ProviderNames[service]}
              disabled
              className="input input--disabled"
            />
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">Clé API</label>
            <div className="input-with-toggle">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={getPlaceholder(service)}
                className="input"
                autoFocus
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <small className="form-hint">{getInstructions(service)}</small>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading || !apiKey.trim()}
            >
              {loading ? '⏳ Sauvegarde...' : '💾 Enregistrer'}
            </button>
          </div>
        </form>

        <div className="modal-security-notice">
          <p>
            🔐 <strong>Sécurité:</strong> Votre clé est chiffrée avec AES-256-GCM avant
            stockage. Elle ne transite jamais en clair côté frontend.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddAPIKeyModal;
