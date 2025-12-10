// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — AVATAR FLOATING POPUP COMPONENT
//   Controls Popup for Floating Avatar Window
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useFloatingWindow } from './useFloatingWindow';
import { AnchorPosition } from './AvatarDisplayState';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface AvatarFloatingPopupProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onClose?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const AvatarFloatingPopup: React.FC<AvatarFloatingPopupProps> = ({
  position = 'top-right',
  onClose,
}) => {
  const {
    displayState,
    screens,
    setScale,
    setOpacity,
    toggleAlwaysOnTop,
    toggleLocked,
    toggleMirrorMode,
    setAnchor,
    moveToScreen,
    setModeEmbed,
  } = useFloatingWindow();

  const [activeTab, setActiveTab] = useState<'position' | 'appearance' | 'behavior'>(
    'appearance'
  );

  // ═════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════════

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    void setScale(value);
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    void setOpacity(value);
  };

  const handleAnchorClick = (anchor: AnchorPosition) => {
    void setAnchor(anchor);
  };

  const handleScreenChange = (screenIndex: number) => {
    void moveToScreen(screenIndex);
  };

  const handleClose = () => {
    void setModeEmbed();
    if (onClose) onClose();
  };

  // ═════════════════════════════════════════════════════════════════
  // POSITION STYLES
  // ═════════════════════════════════════════════════════════════════

  const positionClasses: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════

  return (
    <div
      className={`absolute ${positionClasses[position]} z-50 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden`}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
        <h3 className="text-sm font-semibold text-gray-100">Contrôles Avatar</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700/50">
        {(['appearance', 'position', 'behavior'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-primary-600/20 text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
            }`}
          >
            {tab === 'appearance' && '🎨 Apparence'}
            {tab === 'position' && '📍 Position'}
            {tab === 'behavior' && '⚙️ Comportement'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <>
            {/* Scale Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-300">Échelle</label>
                <span className="text-xs text-gray-400">
                  {displayState.scale.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={displayState.scale}
                onChange={handleScaleChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.1x</span>
                <span>2.0x</span>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-300">Opacité</label>
                <span className="text-xs text-gray-400">
                  {Math.round(displayState.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={displayState.opacity}
                onChange={handleOpacityChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </>
        )}

        {/* Position Tab */}
        {activeTab === 'position' && (
          <>
            {/* Anchor Grid */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">
                Position d'ancrage
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  AnchorPosition.TopLeft,
                  AnchorPosition.TopCenter,
                  AnchorPosition.TopRight,
                  AnchorPosition.CenterLeft,
                  AnchorPosition.Center,
                  AnchorPosition.CenterRight,
                  AnchorPosition.BottomLeft,
                  AnchorPosition.BottomCenter,
                  AnchorPosition.BottomRight,
                ].map(anchor => (
                  <button
                    key={anchor}
                    onClick={() => handleAnchorClick(anchor)}
                    className={`p-3 rounded-lg border transition-all ${
                      displayState.anchor === anchor
                        ? 'bg-primary-600/30 border-primary-500 text-primary-300'
                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                    title={anchor}
                  >
                    <div className="w-4 h-4 mx-auto bg-current rounded-sm opacity-50" />
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Selector */}
            {screens.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Écran</label>
                <div className="space-y-1">
                  {screens.map(screen => (
                    <button
                      key={screen.index}
                      onClick={() => handleScreenChange(screen.index)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        displayState.screen_index === screen.index
                          ? 'bg-primary-600/30 border border-primary-500 text-primary-300'
                          : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{screen.name}</span>
                        <span className="text-gray-500">
                          {screen.width}×{screen.height}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Behavior Tab */}
        {activeTab === 'behavior' && (
          <div className="space-y-3">
            {/* Always On Top Toggle */}
            <button
              onClick={() => void toggleAlwaysOnTop()}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                displayState.always_on_top
                  ? 'bg-primary-600/30 border border-primary-500'
                  : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📌</span>
                <div className="text-left">
                  <div className="text-xs font-medium text-gray-200">
                    Toujours visible
                  </div>
                  <div className="text-xs text-gray-500">
                    Reste au-dessus des fenêtres
                  </div>
                </div>
              </div>
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  displayState.always_on_top ? 'bg-primary-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 m-0.5 bg-white rounded-full transition-transform ${
                    displayState.always_on_top ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>

            {/* Locked Toggle */}
            <button
              onClick={() => void toggleLocked()}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                displayState.locked
                  ? 'bg-yellow-600/30 border border-yellow-500'
                  : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🔒</span>
                <div className="text-left">
                  <div className="text-xs font-medium text-gray-200">Verrouillé</div>
                  <div className="text-xs text-gray-500">Empêche déplacement/resize</div>
                </div>
              </div>
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  displayState.locked ? 'bg-yellow-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 m-0.5 bg-white rounded-full transition-transform ${
                    displayState.locked ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>

            {/* Mirror Mode Toggle */}
            <button
              onClick={() => void toggleMirrorMode()}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                displayState.mirror_mode
                  ? 'bg-purple-600/30 border border-purple-500'
                  : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🔄</span>
                <div className="text-left">
                  <div className="text-xs font-medium text-gray-200">Mode miroir</div>
                  <div className="text-xs text-gray-500">Flip horizontal</div>
                </div>
              </div>
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  displayState.mirror_mode ? 'bg-purple-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 m-0.5 bg-white rounded-full transition-transform ${
                    displayState.mirror_mode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700/50">
        <button
          onClick={handleClose}
          className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Ancrer dans fenêtre principale
        </button>
      </div>
    </div>
  );
};

export default AvatarFloatingPopup;
