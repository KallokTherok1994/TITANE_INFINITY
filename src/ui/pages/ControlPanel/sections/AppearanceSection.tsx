/**
 * TITANE∞ OS v24.7 - Section Apparence
 * Configuration Design System avec personnalisation avancée
 * Interface, Tableau de bord et Menu
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import {
  ControlPanelToggleList,
  type ToggleConfig,
} from '../components/ControlPanelToggle';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface DesignSystemConfig {
  // Mode & Densité
  mode: 'light' | 'dark' | 'auto';
  density: 'compact' | 'normal' | 'comfortable';

  // Interface
  animations_enabled: boolean;
  transparency_enabled: boolean;
  blur_effects: boolean;
  accent_color: string;
  font_family: 'system' | 'inter' | 'jetbrains' | 'roboto';
  font_size: 'small' | 'medium' | 'large';
  border_radius: 'none' | 'small' | 'medium' | 'large';

  // Tableau de bord
  dashboard_layout: 'grid' | 'list' | 'compact';
  show_welcome_banner: boolean;
  show_quick_actions: boolean;
  show_recent_activity: boolean;
  show_system_status: boolean;
  widget_animations: boolean;

  // Menu
  menu_position: 'left' | 'top' | 'hidden';
  menu_style: 'icons' | 'text' | 'both';
  menu_collapsed: boolean;
  show_menu_tooltips: boolean;
  show_menu_badges: boolean;
}

const DEFAULT_CONFIG: DesignSystemConfig = {
  mode: 'auto',
  density: 'normal',
  animations_enabled: true,
  transparency_enabled: false,
  blur_effects: true,
  accent_color: '#6366f1',
  font_family: 'system',
  font_size: 'medium',
  border_radius: 'medium',
  dashboard_layout: 'grid',
  show_welcome_banner: true,
  show_quick_actions: true,
  show_recent_activity: true,
  show_system_status: true,
  widget_animations: true,
  menu_position: 'left',
  menu_style: 'both',
  menu_collapsed: false,
  show_menu_tooltips: true,
  show_menu_badges: true,
};

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════

const ACCENT_COLORS = [
  { value: '#6366f1', label: 'Indigo', emoji: '💜' },
  { value: '#8b5cf6', label: 'Violet', emoji: '🟣' },
  { value: '#06b6d4', label: 'Cyan', emoji: '🔵' },
  { value: '#10b981', label: 'Émeraude', emoji: '🟢' },
  { value: '#f59e0b', label: 'Ambre', emoji: '🟡' },
  { value: '#ef4444', label: 'Rouge', emoji: '🔴' },
  { value: '#ec4899', label: 'Rose', emoji: '💗' },
  { value: '#64748b', label: 'Gris', emoji: '⚪' },
];

const FONT_FAMILIES = [
  { value: 'system', label: 'Système', preview: 'Aa' },
  { value: 'inter', label: 'Inter', preview: 'Aa' },
  { value: 'jetbrains', label: 'JetBrains Mono', preview: 'Aa' },
  { value: 'roboto', label: 'Roboto', preview: 'Aa' },
];

const INTERFACE_TOGGLES: readonly ToggleConfig<
  'animations_enabled' | 'transparency_enabled' | 'blur_effects'
>[] = [
  {
    key: 'animations_enabled',
    title: 'Animations',
    description: 'Activer les animations et transitions fluides',
    icon: '✨',
  },
  {
    key: 'transparency_enabled',
    title: 'Transparence',
    description: 'Activer les effets de transparence (expérimental)',
    icon: '🔮',
  },
  {
    key: 'blur_effects',
    title: 'Effets de flou',
    description: 'Activer les effets de flou en arrière-plan',
    icon: '🌫️',
  },
];

const DASHBOARD_TOGGLES: readonly ToggleConfig<
  | 'show_welcome_banner'
  | 'show_quick_actions'
  | 'show_recent_activity'
  | 'show_system_status'
  | 'widget_animations'
>[] = [
  {
    key: 'show_welcome_banner',
    title: 'Bannière de bienvenue',
    description: 'Afficher le message de bienvenue personnalisé',
    icon: '👋',
  },
  {
    key: 'show_quick_actions',
    title: 'Actions rapides',
    description: 'Afficher les raccourcis vers les fonctions principales',
    icon: '⚡',
  },
  {
    key: 'show_recent_activity',
    title: 'Activité récente',
    description: "Afficher l'historique des actions récentes",
    icon: '📋',
  },
  {
    key: 'show_system_status',
    title: 'État du système',
    description: 'Afficher les indicateurs de santé système',
    icon: '💚',
  },
  {
    key: 'widget_animations',
    title: 'Animations widgets',
    description: 'Animer les widgets du tableau de bord',
    icon: '🎬',
  },
];

const MENU_TOGGLES: readonly ToggleConfig<
  'menu_collapsed' | 'show_menu_tooltips' | 'show_menu_badges'
>[] = [
  {
    key: 'menu_collapsed',
    title: 'Menu réduit par défaut',
    description: 'Démarrer avec le menu en mode compact',
    icon: '📐',
  },
  {
    key: 'show_menu_tooltips',
    title: 'Infobulles',
    description: 'Afficher les descriptions au survol',
    icon: '💬',
  },
  {
    key: 'show_menu_badges',
    title: 'Badges de notification',
    description: 'Afficher les compteurs de notifications',
    icon: '🔔',
  },
];

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════

export const AppearanceSection: React.FC = () => {
  const [config, setConfig] = useState<DesignSystemConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'interface' | 'dashboard' | 'menu'>(
    'interface'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const loadedConfig = (await tauriClient.getDesignConfig()) as DesignSystemConfig;
      setConfig({ ...DEFAULT_CONFIG, ...loadedConfig });
    } catch (error) {
      console.error('Erreur chargement config:', error);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const saveConfig = useCallback(async (newConfig: DesignSystemConfig) => {
    try {
      setIsSaving(true);
      setSaved(false);
      await tauriClient.cpSetDesignConfig({ config: newConfig });
      setConfig(newConfig);
      setSaved(true);
      // Reset saved indicator après 2s
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Handlers génériques
  const updateConfig = useCallback(
    <K extends keyof DesignSystemConfig>(key: K, value: DesignSystemConfig[K]) => {
      setConfig(prev => {
        const newConfig = { ...prev, [key]: value };
        saveConfig(newConfig);
        return newConfig;
      });
    },
    [saveConfig]
  );

  const toggleField = useCallback(
    (key: keyof DesignSystemConfig) => {
      setConfig(prev => {
        const newConfig = { ...prev, [key]: !prev[key] };
        saveConfig(newConfig);
        return newConfig;
      });
    },
    [saveConfig]
  );

  // Sous-config pour les toggles
  const interfaceToggles = useMemo(
    () => ({
      animations_enabled: config.animations_enabled,
      transparency_enabled: config.transparency_enabled,
      blur_effects: config.blur_effects,
    }),
    [config.animations_enabled, config.transparency_enabled, config.blur_effects]
  );

  const dashboardToggles = useMemo(
    () => ({
      show_welcome_banner: config.show_welcome_banner,
      show_quick_actions: config.show_quick_actions,
      show_recent_activity: config.show_recent_activity,
      show_system_status: config.show_system_status,
      widget_animations: config.widget_animations,
    }),
    [
      config.show_welcome_banner,
      config.show_quick_actions,
      config.show_recent_activity,
      config.show_system_status,
      config.widget_animations,
    ]
  );

  const menuToggles = useMemo(
    () => ({
      menu_collapsed: config.menu_collapsed,
      show_menu_tooltips: config.show_menu_tooltips,
      show_menu_badges: config.show_menu_badges,
    }),
    [config.menu_collapsed, config.show_menu_tooltips, config.show_menu_badges]
  );

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Apparence</h2>
        <div className="cp-section-actions">
          {saved && <span className="cp-badge success">✅ Sauvegardé</span>}
          {isSaving && <span className="cp-badge">⏳ Enregistrement…</span>}
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="cp-tabs">
        <button
          className={`cp-tab ${activeTab === 'interface' ? 'active' : ''}`}
          onClick={() => setActiveTab('interface')}
        >
          🎨 Interface
        </button>
        <button
          className={`cp-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Tableau de bord
        </button>
        <button
          className={`cp-tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          📁 Menu
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: INTERFACE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'interface' && (
        <>
          {/* Mode d'affichage */}
          <div className="cp-card">
            <h3 className="cp-card-title">🌗 Mode d&apos;affichage</h3>
            <div className="cp-card-content">
              <div className="cp-mode-selector">
                <button
                  className={`cp-mode-option ${config.mode === 'light' ? 'active' : ''}`}
                  onClick={() => updateConfig('mode', 'light')}
                >
                  <span className="cp-mode-icon">☀️</span>
                  <span className="cp-mode-label">Clair</span>
                </button>
                <button
                  className={`cp-mode-option ${config.mode === 'dark' ? 'active' : ''}`}
                  onClick={() => updateConfig('mode', 'dark')}
                >
                  <span className="cp-mode-icon">🌙</span>
                  <span className="cp-mode-label">Sombre</span>
                </button>
                <button
                  className={`cp-mode-option ${config.mode === 'auto' ? 'active' : ''}`}
                  onClick={() => updateConfig('mode', 'auto')}
                >
                  <span className="cp-mode-icon">🔄</span>
                  <span className="cp-mode-label">Auto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Couleur d'accent */}
          <div className="cp-card">
            <h3 className="cp-card-title">🎨 Couleur d&apos;accent</h3>
            <div className="cp-card-content">
              <div className="cp-color-picker">
                {ACCENT_COLORS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    className={`cp-color-option ${config.accent_color === value ? 'active' : ''}`}
                    style={{ '--color': value } as React.CSSProperties}
                    onClick={() => updateConfig('accent_color', value)}
                    title={label}
                  >
                    <span className="cp-color-dot" />
                    <span className="cp-color-emoji">{emoji}</span>
                  </button>
                ))}
              </div>
              <p className="cp-helper-text">
                Couleur utilisée pour les boutons, liens et éléments interactifs
              </p>
            </div>
          </div>

          {/* Typographie */}
          <div className="cp-card">
            <h3 className="cp-card-title">🔤 Typographie</h3>
            <div className="cp-card-content">
              <div className="cp-input-group">
                <label className="cp-input-label">Police de caractères</label>
                <div className="cp-font-selector">
                  {FONT_FAMILIES.map(({ value, label, preview }) => (
                    <button
                      key={value}
                      className={`cp-font-option ${config.font_family === value ? 'active' : ''}`}
                      onClick={() =>
                        updateConfig(
                          'font_family',
                          value as DesignSystemConfig['font_family']
                        )
                      }
                    >
                      <span
                        className="cp-font-preview"
                        style={{ fontFamily: value === 'system' ? 'inherit' : value }}
                      >
                        {preview}
                      </span>
                      <span className="cp-font-label">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cp-input-group">
                <label className="cp-input-label">Taille du texte</label>
                <div className="cp-size-selector">
                  <button
                    className={`cp-size-option ${config.font_size === 'small' ? 'active' : ''}`}
                    onClick={() => updateConfig('font_size', 'small')}
                  >
                    <span style={{ fontSize: '12px' }}>A</span>
                    <span>Petit</span>
                  </button>
                  <button
                    className={`cp-size-option ${config.font_size === 'medium' ? 'active' : ''}`}
                    onClick={() => updateConfig('font_size', 'medium')}
                  >
                    <span style={{ fontSize: '14px' }}>A</span>
                    <span>Moyen</span>
                  </button>
                  <button
                    className={`cp-size-option ${config.font_size === 'large' ? 'active' : ''}`}
                    onClick={() => updateConfig('font_size', 'large')}
                  >
                    <span style={{ fontSize: '18px' }}>A</span>
                    <span>Grand</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Densité & Coins */}
          <div className="cp-card">
            <h3 className="cp-card-title">📐 Densité & Style</h3>
            <div className="cp-card-content">
              <div className="cp-input-group">
                <label className="cp-input-label">Densité d&apos;affichage</label>
                <div className="cp-density-selector">
                  <button
                    className={`cp-density-option ${config.density === 'compact' ? 'active' : ''}`}
                    onClick={() => updateConfig('density', 'compact')}
                  >
                    <span className="cp-density-preview cp-density-compact" />
                    <span className="cp-density-label">Compact</span>
                  </button>
                  <button
                    className={`cp-density-option ${config.density === 'normal' ? 'active' : ''}`}
                    onClick={() => updateConfig('density', 'normal')}
                  >
                    <span className="cp-density-preview cp-density-normal" />
                    <span className="cp-density-label">Normal</span>
                  </button>
                  <button
                    className={`cp-density-option ${config.density === 'comfortable' ? 'active' : ''}`}
                    onClick={() => updateConfig('density', 'comfortable')}
                  >
                    <span className="cp-density-preview cp-density-comfortable" />
                    <span className="cp-density-label">Confortable</span>
                  </button>
                </div>
              </div>

              <div className="cp-input-group">
                <label className="cp-input-label">Arrondi des coins</label>
                <div className="cp-radius-selector">
                  <button
                    className={`cp-radius-option ${config.border_radius === 'none' ? 'active' : ''}`}
                    onClick={() => updateConfig('border_radius', 'none')}
                  >
                    <span className="cp-radius-preview" style={{ borderRadius: '0' }} />
                    <span>Aucun</span>
                  </button>
                  <button
                    className={`cp-radius-option ${config.border_radius === 'small' ? 'active' : ''}`}
                    onClick={() => updateConfig('border_radius', 'small')}
                  >
                    <span className="cp-radius-preview" style={{ borderRadius: '4px' }} />
                    <span>Petit</span>
                  </button>
                  <button
                    className={`cp-radius-option ${config.border_radius === 'medium' ? 'active' : ''}`}
                    onClick={() => updateConfig('border_radius', 'medium')}
                  >
                    <span className="cp-radius-preview" style={{ borderRadius: '8px' }} />
                    <span>Moyen</span>
                  </button>
                  <button
                    className={`cp-radius-option ${config.border_radius === 'large' ? 'active' : ''}`}
                    onClick={() => updateConfig('border_radius', 'large')}
                  >
                    <span
                      className="cp-radius-preview"
                      style={{ borderRadius: '16px' }}
                    />
                    <span>Grand</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Effets visuels */}
          <div className="cp-card">
            <h3 className="cp-card-title">✨ Effets visuels</h3>
            <div className="cp-card-content">
              <ControlPanelToggleList<
                'animations_enabled' | 'transparency_enabled' | 'blur_effects'
              >
                config={interfaceToggles}
                toggles={INTERFACE_TOGGLES}
                onToggle={toggleField}
              />
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: TABLEAU DE BORD */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <>
          {/* Layout du tableau de bord */}
          <div className="cp-card">
            <h3 className="cp-card-title">📐 Disposition</h3>
            <div className="cp-card-content">
              <div className="cp-layout-selector">
                <button
                  className={`cp-layout-option ${config.dashboard_layout === 'grid' ? 'active' : ''}`}
                  onClick={() => updateConfig('dashboard_layout', 'grid')}
                >
                  <div className="cp-layout-preview cp-layout-grid">
                    <div />
                    <div />
                    <div />
                    <div />
                  </div>
                  <span>Grille</span>
                </button>
                <button
                  className={`cp-layout-option ${config.dashboard_layout === 'list' ? 'active' : ''}`}
                  onClick={() => updateConfig('dashboard_layout', 'list')}
                >
                  <div className="cp-layout-preview cp-layout-list">
                    <div />
                    <div />
                    <div />
                  </div>
                  <span>Liste</span>
                </button>
                <button
                  className={`cp-layout-option ${config.dashboard_layout === 'compact' ? 'active' : ''}`}
                  onClick={() => updateConfig('dashboard_layout', 'compact')}
                >
                  <div className="cp-layout-preview cp-layout-compact">
                    <div />
                    <div />
                  </div>
                  <span>Compact</span>
                </button>
              </div>
              <p className="cp-helper-text">
                Organisation des widgets sur le tableau de bord principal
              </p>
            </div>
          </div>

          {/* Widgets visibles */}
          <div className="cp-card">
            <h3 className="cp-card-title">🧩 Widgets</h3>
            <div className="cp-card-content">
              <ControlPanelToggleList<
                | 'show_welcome_banner'
                | 'show_quick_actions'
                | 'show_recent_activity'
                | 'show_system_status'
                | 'widget_animations'
              >
                config={dashboardToggles}
                toggles={DASHBOARD_TOGGLES}
                onToggle={toggleField}
              />
            </div>
          </div>

          {/* Aperçu du tableau de bord */}
          <div className="cp-card">
            <h3 className="cp-card-title">👁️ Aperçu</h3>
            <div className="cp-card-content">
              <div className="cp-dashboard-preview">
                <div
                  className={`cp-dashboard-mock cp-dashboard-${config.dashboard_layout}`}
                >
                  {config.show_welcome_banner && (
                    <div className="cp-mock-widget cp-mock-banner">👋 Bienvenue</div>
                  )}
                  {config.show_quick_actions && (
                    <div className="cp-mock-widget cp-mock-actions">⚡ Actions</div>
                  )}
                  {config.show_recent_activity && (
                    <div className="cp-mock-widget cp-mock-activity">📋 Activité</div>
                  )}
                  {config.show_system_status && (
                    <div className="cp-mock-widget cp-mock-status">💚 Système</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: MENU */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'menu' && (
        <>
          {/* Position du menu */}
          <div className="cp-card">
            <h3 className="cp-card-title">📍 Position</h3>
            <div className="cp-card-content">
              <div className="cp-menu-position-selector">
                <button
                  className={`cp-menu-position-option ${config.menu_position === 'left' ? 'active' : ''}`}
                  onClick={() => updateConfig('menu_position', 'left')}
                >
                  <div className="cp-position-preview cp-position-left">
                    <div className="cp-position-sidebar" />
                    <div className="cp-position-content" />
                  </div>
                  <span>Gauche</span>
                </button>
                <button
                  className={`cp-menu-position-option ${config.menu_position === 'top' ? 'active' : ''}`}
                  onClick={() => updateConfig('menu_position', 'top')}
                >
                  <div className="cp-position-preview cp-position-top">
                    <div className="cp-position-header" />
                    <div className="cp-position-content" />
                  </div>
                  <span>Haut</span>
                </button>
                <button
                  className={`cp-menu-position-option ${config.menu_position === 'hidden' ? 'active' : ''}`}
                  onClick={() => updateConfig('menu_position', 'hidden')}
                >
                  <div className="cp-position-preview cp-position-hidden">
                    <div className="cp-position-content cp-position-full" />
                  </div>
                  <span>Masqué</span>
                </button>
              </div>
            </div>
          </div>

          {/* Style du menu */}
          <div className="cp-card">
            <h3 className="cp-card-title">🎨 Style d&apos;affichage</h3>
            <div className="cp-card-content">
              <div className="cp-menu-style-selector">
                <button
                  className={`cp-menu-style-option ${config.menu_style === 'icons' ? 'active' : ''}`}
                  onClick={() => updateConfig('menu_style', 'icons')}
                >
                  <div className="cp-style-preview">
                    <span>🏠</span>
                    <span>💬</span>
                    <span>⚙️</span>
                  </div>
                  <span>Icônes seules</span>
                </button>
                <button
                  className={`cp-menu-style-option ${config.menu_style === 'text' ? 'active' : ''}`}
                  onClick={() => updateConfig('menu_style', 'text')}
                >
                  <div className="cp-style-preview cp-style-text">
                    <span>Accueil</span>
                    <span>Chat</span>
                  </div>
                  <span>Texte seul</span>
                </button>
                <button
                  className={`cp-menu-style-option ${config.menu_style === 'both' ? 'active' : ''}`}
                  onClick={() => updateConfig('menu_style', 'both')}
                >
                  <div className="cp-style-preview cp-style-both">
                    <span>🏠 Accueil</span>
                    <span>💬 Chat</span>
                  </div>
                  <span>Icônes + Texte</span>
                </button>
              </div>
            </div>
          </div>

          {/* Options du menu */}
          <div className="cp-card">
            <h3 className="cp-card-title">⚙️ Options</h3>
            <div className="cp-card-content">
              <ControlPanelToggleList<
                'menu_collapsed' | 'show_menu_tooltips' | 'show_menu_badges'
              >
                config={menuToggles}
                toggles={MENU_TOGGLES}
                onToggle={toggleField}
              />
            </div>
          </div>

          {/* Aperçu du menu */}
          <div className="cp-card">
            <h3 className="cp-card-title">👁️ Aperçu</h3>
            <div className="cp-card-content">
              <div
                className={`cp-menu-preview cp-menu-${config.menu_position} ${config.menu_collapsed ? 'collapsed' : ''}`}
              >
                <div className="cp-menu-mock">
                  {config.menu_style !== 'text' && (
                    <span className="cp-menu-icon">🏠</span>
                  )}
                  {config.menu_style !== 'icons' && !config.menu_collapsed && (
                    <span className="cp-menu-text">Accueil</span>
                  )}
                  {config.show_menu_badges && <span className="cp-menu-badge">3</span>}
                </div>
                <div className="cp-menu-mock">
                  {config.menu_style !== 'text' && (
                    <span className="cp-menu-icon">💬</span>
                  )}
                  {config.menu_style !== 'icons' && !config.menu_collapsed && (
                    <span className="cp-menu-text">Chat</span>
                  )}
                </div>
                <div className="cp-menu-mock">
                  {config.menu_style !== 'text' && (
                    <span className="cp-menu-icon">⚙️</span>
                  )}
                  {config.menu_style !== 'icons' && !config.menu_collapsed && (
                    <span className="cp-menu-text">Paramètres</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
