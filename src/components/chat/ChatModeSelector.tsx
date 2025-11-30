/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — CHAT MODE SELECTOR
 *   Sélecteur de modes élégant et compact
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ChatModeId, ChatModeConfigExtended, ChatModeCategory } from '../../services/ai/chatModes.config';
import {
  CHAT_MODES_CONFIG,
  getAccessibleModes,
  type PermissionLevel
} from '../../services/ai/chatModes.config';
import './ChatModeSelector.css';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatModeSelectorProps {
  /** Mode actuellement sélectionné */
  currentMode: ChatModeId;
  /** Callback de changement de mode */
  onModeChange: (mode: ChatModeId) => void;
  /** Niveau de permission utilisateur (0-5) */
  userPermissionLevel?: PermissionLevel;
  /** Style d'affichage */
  variant?: 'dropdown' | 'pills' | 'compact';
  /** Désactivé */
  disabled?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LABELS CATÉGORIES
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ChatModeCategory, string> = {
  general: '🌐 Général',
  creative: '✨ Créatif',
  productivity: '📊 Productivité',
  personal: '💜 Personnel',
  technical: '⚙️ Technique',
  strategic: '♟️ Stratégique',
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({
  currentMode,
  onModeChange,
  userPermissionLevel = 3,
  variant = 'dropdown',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<ChatModeId | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modes accessibles selon permission
  const accessibleModes = useMemo(
    () => getAccessibleModes(userPermissionLevel),
    [userPermissionLevel]
  );

  // Mode courant config
  const currentModeConfig = useMemo(
    () => CHAT_MODES_CONFIG[currentMode],
    [currentMode]
  );

  // Groupement par catégorie
  const modesByCategory = useMemo(() => {
    const grouped: Partial<Record<ChatModeCategory, ChatModeConfigExtended[]>> = {};

    accessibleModes.forEach(mode => {
      if (!grouped[mode.category]) {
        grouped[mode.category] = [];
      }
      const categoryModes = grouped[mode.category];
      if (categoryModes) {
        categoryModes.push(mode);
      }
    });

    return grouped;
  }, [accessibleModes]);

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  }, [disabled]);

  const handleModeSelect = useCallback((mode: ChatModeId) => {
    onModeChange(mode);
    setIsOpen(false);
  }, [onModeChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, mode: ChatModeId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleModeSelect(mode);
    }
  }, [handleModeSelect]);

  // ═══ RENDER DROPDOWN ═══
  if (variant === 'dropdown') {
    return (
      <div
        ref={dropdownRef}
        className={`chat-mode-selector chat-mode-selector--dropdown ${className} ${disabled ? 'chat-mode-selector--disabled' : ''}`}
      >
        {/* Trigger Button */}
        <button
          type="button"
          className="chat-mode-selector__trigger"
          onClick={handleToggle}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          style={{ '--mode-color': currentModeConfig.themeColor } as React.CSSProperties}
        >
          <span className="chat-mode-selector__icon">{currentModeConfig.icon}</span>
          <span className="chat-mode-selector__label">{currentModeConfig.label}</span>
          <span className={`chat-mode-selector__chevron ${isOpen ? 'chat-mode-selector__chevron--open' : ''}`}>
            ▾
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="chat-mode-selector__menu" role="listbox">
            {Object.entries(modesByCategory).map(([category, modes]) => (
              <div key={category} className="chat-mode-selector__group">
                <div className="chat-mode-selector__group-label">
                  {CATEGORY_LABELS[category as ChatModeCategory]}
                </div>
                {modes?.map(mode => (
                  <div
                    key={mode.id}
                    className={`chat-mode-selector__option ${mode.id === currentMode ? 'chat-mode-selector__option--selected' : ''}`}
                    onClick={() => handleModeSelect(mode.id)}
                    onKeyDown={(e) => handleKeyDown(e, mode.id)}
                    onMouseEnter={() => setHoveredMode(mode.id)}
                    onMouseLeave={() => setHoveredMode(null)}
                    role="option"
                    aria-selected={mode.id === currentMode}
                    tabIndex={0}
                    style={{ '--mode-color': mode.themeColor } as React.CSSProperties}
                  >
                    <span className="chat-mode-selector__option-icon">{mode.icon}</span>
                    <div className="chat-mode-selector__option-content">
                      <span className="chat-mode-selector__option-label">{mode.label}</span>
                      {hoveredMode === mode.id && (
                        <span className="chat-mode-selector__option-desc">{mode.description}</span>
                      )}
                    </div>
                    {mode.id === currentMode && (
                      <span className="chat-mode-selector__check">✓</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══ RENDER PILLS ═══
  if (variant === 'pills') {
    return (
      <div className={`chat-mode-selector chat-mode-selector--pills ${className}`}>
        {accessibleModes.slice(0, 6).map(mode => (
          <button
            key={mode.id}
            type="button"
            className={`chat-mode-pill ${mode.id === currentMode ? 'chat-mode-pill--active' : ''}`}
            onClick={() => handleModeSelect(mode.id)}
            disabled={disabled}
            title={mode.description}
            style={{ '--mode-color': mode.themeColor } as React.CSSProperties}
          >
            <span className="chat-mode-pill__icon">{mode.icon}</span>
            <span className="chat-mode-pill__label">{mode.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // ═══ RENDER COMPACT ═══
  return (
    <div className={`chat-mode-selector chat-mode-selector--compact ${className}`}>
      <select
        value={currentMode}
        onChange={(e) => handleModeSelect(e.target.value as ChatModeId)}
        disabled={disabled}
        className="chat-mode-selector__select"
      >
        {accessibleModes.map(mode => (
          <option key={mode.id} value={mode.id}>
            {mode.icon} {mode.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChatModeSelector;
