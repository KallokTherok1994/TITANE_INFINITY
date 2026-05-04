/**
 * TITANE∞ — Tool Selector Panel
 * Panneau de sélection des outils/raccourcis chat avec catégories.
 * data-testid stables pour E2E Playwright.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  CHAT_TOOLS,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ORDER,
  type ChatTool,
  type ChatToolCategory,
} from '@/features/chat/chatToolsRegistry';
import './ToolSelectorPanel.css';

export interface ToolSelectorPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onToolSelect: (tool: ChatTool) => void;
  isOnline: boolean;
  deepAnalysisActive: boolean;
  disabled?: boolean;
  className?: string;
}

export function ToolSelectorPanel({
  isOpen,
  onToggle,
  onClose,
  onToolSelect,
  isOnline,
  deepAnalysisActive,
  disabled = false,
  className,
}: ToolSelectorPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Fermeture au clic extérieur
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, onClose]);

  // Fermeture avec Échap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToolClick = useCallback(
    (tool: ChatTool) => {
      onToolSelect(tool);
    },
    [onToolSelect]
  );

  // Regrouper les outils par catégorie dans l'ordre défini
  const toolsByCategory = TOOL_CATEGORY_ORDER.reduce<Record<ChatToolCategory, ChatTool[]>>(
    (acc, cat) => {
      acc[cat] = CHAT_TOOLS.filter(t => t.category === cat);
      return acc;
    },
    { generate: [], research: [], reflect: [], config: [] }
  );

  return (
    <div className={`tool-selector-wrapper${className ? ` ${className}` : ''}`}>
      {/* ─── Bouton déclencheur ─── */}
      <button
        ref={btnRef}
        type="button"
        className={`chat-toolbar-btn tool-selector-btn${isOpen ? ' active' : ''}`}
        data-testid="tool-selector-btn"
        onClick={onToggle}
        disabled={disabled}
        title="Sélectionner un outil / Tapez / pour ouvrir"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="toolbar-btn-icon" aria-hidden="true">⚡</span>
      </button>

      {/* ─── Panel ─── */}
      {isOpen && (
        <div
          ref={panelRef}
          className="tool-selector-panel"
          data-testid="tool-selector-panel"
          role="dialog"
          aria-label="Sélecteur d'outils TITANE"
        >
          {/* Status bar */}
          <div className="tool-selector-status">
            <span
              className={`tool-status-badge${isOnline ? ' online' : ' offline'}`}
              data-testid="tool-status-online"
              title={isOnline ? 'Connecté — recherche web disponible' : 'Hors ligne'}
            >
              <span className="tool-status-dot" aria-hidden="true" />
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
            {deepAnalysisActive && (
              <span
                className="tool-status-badge deep"
                data-testid="tool-status-deep"
                title="Analyse approfondie 5 phases active"
              >
                🔬 Analyse profonde ACTIVE
              </span>
            )}
          </div>

          {/* Header */}
          <div className="tool-selector-header">
            <span className="tool-selector-title">Outils TITANE</span>
            <span className="tool-selector-hint">Tapez <kbd>/</kbd> pour ouvrir</span>
          </div>

          {/* Catégories */}
          {TOOL_CATEGORY_ORDER.map(cat => {
            const tools = toolsByCategory[cat];
            if (tools.length === 0) return null;
            const catMeta = TOOL_CATEGORIES[cat];
            return (
              <div key={cat} className="tool-category-section">
                <div className="tool-category-header">
                  <span aria-hidden="true">{catMeta.icon}</span>
                  <span>{catMeta.label}</span>
                </div>
                <div className="tool-category-grid">
                  {tools.map(tool => (
                    <button
                      key={tool.id}
                      type="button"
                      className="tool-card"
                      data-testid={`tool-item-${tool.id}`}
                      onClick={() => handleToolClick(tool)}
                      title={tool.description}
                    >
                      <span className="tool-card-icon" aria-hidden="true">{tool.icon}</span>
                      <div className="tool-card-text">
                        <span className="tool-card-label">{tool.label}</span>
                        <span className="tool-card-desc">{tool.description}</span>
                      </div>
                      {tool.autoSend && (
                        <span
                          className="tool-card-auto-badge"
                          title="Envoi automatique"
                          aria-label="envoi automatique"
                        >
                          ↗
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
