/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.LOCAL — AI MODEL SELECTOR
 *   Sélecteur de modèles IA avec statut Ollama temps réel
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { AIProvider, AIModelOption, OllamaStatus } from '@/types/aiModel';
import { MODEL_OPTIONS } from '@/types/aiModel';

interface AIModelSelectorProps {
  currentProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  devMode?: boolean;
  className?: string;
}

export function AIModelSelector({
  currentProvider,
  onProviderChange,
  devMode = false,
  className = '',
}: AIModelSelectorProps) {
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({
    available: false,
    version: undefined,
    models: [],
    lastCheck: Date.now(),
  });
  const [isChecking, setIsChecking] = useState(false);

  // Vérifier le statut Ollama au montage et toutes les 10s
  useEffect(() => {
    checkOllamaStatus();
    const interval = setInterval(checkOllamaStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkOllamaStatus = async () => {
    try {
      setIsChecking(true);
      const status = await invoke<OllamaStatus>('ai_check_ollama_status');
      setOllamaStatus(status);
    } catch (error) {
      console.error('Erreur lors de la vérification Ollama:', error);
      setOllamaStatus({
        available: false,
        version: undefined,
        models: [],
        lastCheck: Date.now(),
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    // Si le provider est titane-local et Ollama non dispo, afficher erreur
    if (provider === 'titane-local' && !ollamaStatus.available) {
      alert(
        '⚠️ Ollama non disponible\n\n' +
          'Pour utiliser TITANE∞ Local, installez Ollama:\n\n' +
          '1. Exécutez: ./install_titane_local.sh\n' +
          '2. Ou installez manuellement: https://ollama.ai\n' +
          '3. Vérifiez le service: ollama serve\n'
      );
      return;
    }

    onProviderChange(provider);
  };

  const getStatusBadge = (option: AIModelOption) => {
    if (option.value === 'titane-local') {
      if (isChecking) {
        return (
          <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-400 animate-pulse">
            CHECKING...
          </span>
        );
      }
      if (ollamaStatus.available) {
        return (
          <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
            ● ONLINE
          </span>
        );
      }
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
          ● OFFLINE
        </span>
      );
    }

    return (
      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
        {option.badge}
      </span>
    );
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white/80">
          Modèle IA
        </label>
        {devMode && (
          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
            DEV MODE
          </span>
        )}
      </div>

      {/* Dropdown */}
      <select
        value={currentProvider}
        onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
      >
        {MODEL_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.value === 'titane-local' && !ollamaStatus.available}
            className="bg-gray-900 text-white"
          >
            {option.icon} {option.label} {option.value === 'titane-local' && !ollamaStatus.available ? '(OFFLINE)' : ''}
          </option>
        ))}
      </select>

      {/* Description + Status */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/60">
          {MODEL_OPTIONS.find((opt) => opt.value === currentProvider)?.description}
        </p>
        {MODEL_OPTIONS.find((opt) => opt.value === currentProvider) &&
          getStatusBadge(MODEL_OPTIONS.find((opt) => opt.value === currentProvider) as AIModelOption)}
      </div>

      {/* Ollama Details (si local sélectionné) */}
      {currentProvider === 'titane-local' && ollamaStatus.available && (
        <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/80">
              Modèles installés
            </span>
            <button
              onClick={checkOllamaStatus}
              disabled={isChecking}
              className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 transition-all disabled:opacity-50"
            >
              {isChecking ? '⟳' : '↻'} Rafraîchir
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {ollamaStatus.models.length > 0 ? (
              ollamaStatus.models.map((model) => (
                <span
                  key={model}
                  className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300"
                >
                  {model}
                </span>
              ))
            ) : (
              <span className="text-xs text-white/40">Aucun modèle trouvé</span>
            )}
          </div>
        </div>
      )}

      {/* Installation Instructions (si local sélectionné mais offline) */}
      {currentProvider === 'titane-local' && !ollamaStatus.available && (
        <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-300 mb-2">
            ⚠️ Ollama n'est pas disponible
          </p>
          <p className="text-xs text-red-200/60 mb-2">
            Pour utiliser TITANE∞ Local, installez Ollama:
          </p>
          <code className="text-xs text-red-200/80 block bg-black/30 px-2 py-1 rounded">
            ./install_titane_local.sh
          </code>
        </div>
      )}
    </div>
  );
}
