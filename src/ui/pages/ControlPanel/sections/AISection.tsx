/**
 * TITANE∞ OS - Section IA & APIs
 * Configuration Gemini et autres APIs
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface AIConfig {
  gemini_api_key: string;
  gemini_model: string;
  temperature: number;
  max_tokens: number;
}

export const AISection: React.FC = () => {
  const [config, setConfig] = useState<AIConfig>({
    gemini_api_key: '',
    gemini_model: 'gemini-pro',
    temperature: 0.7,
    max_tokens: 2048
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const aiConfig = await invoke<AIConfig>('get_ai_config');
      setConfig(aiConfig);
    } catch (error) {
      console.error('Erreur chargement config IA:', error);
    }
  };

  const saveConfig = async () => {
    try {
      await invoke('set_ai_config', { config });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
    }
  };

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">IA & APIs</h2>
        <button className="cp-button" onClick={saveConfig}>
          {saved ? '✅ Sauvegardé' : '💾 Sauvegarder'}
        </button>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">Configuration Gemini</h3>
        <div className="cp-card-content">
          <div className="cp-input-group">
            <label className="cp-input-label">Clé API Gemini</label>
            <input
              type="password"
              className="cp-input"
              value={config.gemini_api_key}
              onChange={(e) => setConfig({ ...config, gemini_api_key: e.target.value })}
              placeholder="Entrez votre clé API"
            />
          </div>

          <div className="cp-input-group">
            <label className="cp-input-label">Modèle</label>
            <select
              className="cp-input"
              value={config.gemini_model}
              onChange={(e) => setConfig({ ...config, gemini_model: e.target.value })}
            >
              <option value="gemini-pro">Gemini Pro</option>
              <option value="gemini-pro-vision">Gemini Pro Vision</option>
            </select>
          </div>

          <div className="cp-input-group">
            <label className="cp-input-label">Température: {config.temperature}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
            />
          </div>

          <div className="cp-input-group">
            <label className="cp-input-label">Tokens maximum</label>
            <input
              type="number"
              className="cp-input"
              value={config.max_tokens}
              onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
