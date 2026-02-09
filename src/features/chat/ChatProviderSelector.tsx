/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * CHAT PROVIDER SELECTOR — Sélection du provider IA
 * Composant optimisé avec React.memo pour éviter les re-renders inutiles
 */

import React, { useMemo } from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface ChatProviderSelectorProps {
  selectedProvider?: string;
  onChange: (provider: string) => void;
  providers: Array<{
    id: string;
    name: string;
    icon: string;
    available: boolean;
  }>;
}

export const ChatProviderSelector: React.FC<ChatProviderSelectorProps> = React.memo(
  ({ selectedProvider = 'auto', onChange, providers }) => {
    // Mémoriser le nombre de providers disponibles
    const availableCount = useMemo(
      () => providers.filter(p => p.available).length,
      [providers]
    );

    // Mémoriser la sélection d'options
    const options = useMemo(
      () => (
        <>
          <option value="auto">⚡ Auto (Cascade intelligente)</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id} disabled={!provider.available}>
              {provider.icon} {provider.name} {!provider.available && '(indisponible)'}
            </option>
          ))}
        </>
      ),
      [providers]
    );

    return (
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-gray-400" />
        <select
          value={selectedProvider}
          onChange={e => onChange(e.target.value)}
          className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-1.5 text-sm text-white outline-none transition-colors focus:border-blue-500"
          data-testid="provider-select"
        >
          {options}
        </select>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Sparkles className="h-3 w-3" />
          <span>
            IA ({availableCount}/{providers.length})
          </span>
        </div>
      </div>
    );
  }
);

ChatProviderSelector.displayName = 'ChatProviderSelector';
