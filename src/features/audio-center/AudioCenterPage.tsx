/**
 * TITANE∞ v26.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v26.3.0 — AUDIO CENTER PAGE
 *   Interface de configuration audio complète
 *   v22Ω AI Performance Optimizations Compatible
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useAudio } from './hooks/useAudio';
import { AudioDiagnosticsPanel } from '@/components/audio';
import type { TTSEngine, VoiceProfile } from './types';

// ─────────────────────────────────────────────────────────────────
//  Voice Card Component
// ─────────────────────────────────────────────────────────────────

interface VoiceCardProps {
  voice: VoiceProfile;
  isSelected: boolean;
  onSelect: () => void;
  onTest: () => void;
}

const VoiceCard: React.FC<VoiceCardProps> = ({ voice, isSelected, onSelect, onTest }) => (
  <div
    onClick={onSelect}
    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
      isSelected
        ? 'border-cyan-500 bg-cyan-500/10'
        : 'border-neutral-700 hover:border-neutral-600 bg-neutral-800/50'
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-medium text-white">{voice.name}</h4>
        <p className="text-sm text-neutral-400">{voice.description}</p>
      </div>
      {voice.isRealistic && (
        <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded">
          Réaliste
        </span>
      )}
    </div>

    <div className="flex items-center gap-2 mt-3">
      <span
        className={`px-2 py-0.5 text-xs rounded ${
          voice.engine === 'piper'
            ? 'bg-purple-500/20 text-purple-400'
            : voice.engine === 'elevenlabs'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-neutral-600/50 text-neutral-400'
        }`}
      >
        {voice.engine.toUpperCase()}
      </span>
      <span className="text-xs text-neutral-500">{voice.language}</span>
      <span className="text-xs text-neutral-500">•</span>
      <span className="text-xs text-neutral-500 capitalize">{voice.gender}</span>

      <button
        onClick={e => {
          e.stopPropagation();
          onTest();
        }}
        className="ml-auto px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
      >
        🔊 Test
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────
//  Slider Component
// ─────────────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit = '',
  onChange,
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-neutral-300">{label}</span>
      <span className="text-cyan-400 font-mono">
        {value.toFixed(1)}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────
//  Device Selector Component
// ─────────────────────────────────────────────────────────────────

interface DeviceSelectorProps {
  label: string;
  icon: string;
  devices: Array<{ id: string; name: string; isActive: boolean }>;
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  label,
  icon,
  devices,
  selectedId,
  onSelect,
  isLoading,
}) => {
  // Sécurité: S'assurer que devices est toujours un tableau
  const safeDevices = Array.isArray(devices) ? devices : [];

  return (
    <div className="space-y-2">
      <label className="text-sm text-neutral-300 flex items-center gap-2">
        <span>{icon}</span> {label}
      </label>
      <select
        value={selectedId}
        onChange={e => onSelect(e.target.value)}
        disabled={isLoading || safeDevices.length === 0}
        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white
                   focus:border-cyan-500 focus:outline-none disabled:opacity-50"
      >
        {safeDevices.length === 0 ? (
          <option value="">Aucun appareil disponible</option>
        ) : (
          safeDevices.map(device => (
            <option key={device.id} value={device.id}>
              {device.name} {device.isActive ? '(Actif)' : ''}
            </option>
          ))
        )}
      </select>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  Test Result Component
// ─────────────────────────────────────────────────────────────────

interface TestResultProps {
  result: { success: boolean; errorMessage?: string } | null;
  type: 'speaker' | 'microphone';
}

const TestResult: React.FC<TestResultProps> = ({ result, type }) => {
  if (!result) return null;

  return (
    <div
      className={`p-3 rounded-lg mt-3 ${
        result.success
          ? 'bg-emerald-500/10 border border-emerald-500/30'
          : 'bg-red-500/10 border border-red-500/30'
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{result.success ? '✅' : '❌'}</span>
        <span className={result.success ? 'text-emerald-400' : 'text-red-400'}>
          {result.success
            ? `Test ${type === 'speaker' ? 'haut-parleur' : 'microphone'} réussi !`
            : result.errorMessage || 'Échec du test'}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  Main Audio Center Page
// ─────────────────────────────────────────────────────────────────

export const AudioCenterPage: React.FC = () => {
  const {
    config,
    outputDevices,
    inputDevices,
    availableVoices,
    isLoading,
    isTesting,
    testResult,
    updateTTSSettings,
    speak,
    setOutputDevice,
    setInputDevice,
    setVolume,
    setMicGain,
    testSpeaker,
    testMicrophone,
    refreshDevices,
    setBalance,
    setInputOption,
  } = useAudio();

  const [activeTab, setActiveTab] = useState<
    'voice' | 'devices' | 'diagnostics' | 'advanced'
  >('voice');
  const [testType, setTestType] = useState<'speaker' | 'microphone'>('speaker');
  const [voiceMessage, setVoiceMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleVoiceSelect = async (voice: VoiceProfile) => {
    setVoiceMessage(null);
    try {
      await updateTTSSettings({
        engine: voice.engine as TTSEngine,
        voiceId: voice.id,
        language: voice.language,
      });
      setVoiceMessage({ type: 'success', text: `Voix sélectionnée: ${voice.name}` });
    } catch (e) {
      setVoiceMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Impossible de sélectionner la voix',
      });
    }
  };

  const handleTestVoice = async (voice: VoiceProfile) => {
    const testText = voice.language.startsWith('fr')
      ? `Bonjour, je suis ${voice.name.split(' ')[0]}, votre assistante vocale TITANE Infinity.`
      : `Hello, I am ${voice.name.split(' ')[0]}, your TITANE Infinity voice assistant.`;

    setVoiceMessage(null);
    try {
      await updateTTSSettings({ engine: voice.engine as TTSEngine, voiceId: voice.id });
      await speak(testText);
    } catch (e) {
      setVoiceMessage({
        type: 'error',
        text:
          e instanceof Error
            ? e.message
            : 'Test voix échoué (backend indisponible ou engine non installé)',
      });
    }
  };

  return (
    <div className="h-full overflow-auto bg-neutral-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur border-b border-neutral-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">🎧</span>
              Centre Audio TITANE∞
            </h1>
            <p className="text-neutral-400 mt-1">
              Configuration voix, microphone et haut-parleurs
            </p>
          </div>

          <button
            onClick={refreshDevices}
            disabled={isLoading}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
          >
            🔄 Actualiser
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6">
          {[
            { id: 'voice', label: '🎤 Voix', icon: '🎤' },
            { id: 'devices', label: '🔊 Appareils', icon: '🔊' },
            { id: 'diagnostics', label: '🔧 Diagnostic', icon: '🔧' },
            { id: 'advanced', label: '⚙️ Avancé', icon: '⚙️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="p-6 space-y-6">
        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <>
            {voiceMessage && (
              <div
                className={`p-3 rounded-lg border ${
                  voiceMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {voiceMessage.type === 'success' ? '✅ ' : '❌ '}
                {voiceMessage.text}
              </div>
            )}
            {/* Voice Selection */}
            <section className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>👩</span> Sélection de la Voix
              </h2>
              <p className="text-neutral-400 text-sm mb-4">
                Choisissez une voix réaliste pour une expérience immersive
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {availableVoices.map((voice: VoiceProfile) => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                    isSelected={config.tts.voiceId === voice.id}
                    onSelect={() => handleVoiceSelect(voice)}
                    onTest={() => handleTestVoice(voice)}
                  />
                ))}
              </div>
            </section>

            {/* Voice Parameters */}
            <section className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🎚️</span> Paramètres de la Voix
              </h2>

              <div className="grid gap-6 md:grid-cols-3">
                <Slider
                  label="Vitesse"
                  value={config.tts.rate}
                  min={0.5}
                  max={2.0}
                  onChange={rate => updateTTSSettings({ rate })}
                />
                <Slider
                  label="Hauteur"
                  value={config.tts.pitch}
                  min={0.5}
                  max={2.0}
                  onChange={pitch => updateTTSSettings({ pitch })}
                />
                <Slider
                  label="Volume"
                  value={config.tts.volume}
                  min={0}
                  max={1}
                  onChange={volume => updateTTSSettings({ volume })}
                />
              </div>

              {/* Test Button */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => {
                    setTestType('speaker');
                    testSpeaker();
                  }}
                  disabled={isTesting}
                  className="px-6 py-3 bg-linear-to-r from-cyan-600 to-purple-600 hover:from-cyan-500
                           hover:to-purple-500 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  {isTesting && testType === 'speaker'
                    ? '🔊 Test en cours...'
                    : '🔊 Tester la Voix'}
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emotions"
                    checked={config.tts.emotionEnabled}
                    onChange={e =>
                      updateTTSSettings({ emotionEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-cyan-500"
                  />
                  <label htmlFor="emotions" className="text-sm text-neutral-300">
                    Émotions activées
                  </label>
                </div>
              </div>

              {testType === 'speaker' && (
                <TestResult result={testResult} type="speaker" />
              )}
            </section>
          </>
        )}

        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <>
            {/* Output Devices */}
            <section className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🔊</span> Sortie Audio (Haut-parleurs)
              </h2>

              <DeviceSelector
                label="Périphérique de sortie"
                icon="🔈"
                devices={outputDevices}
                selectedId={config.output.deviceId}
                onSelect={setOutputDevice}
                isLoading={isLoading}
              />

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Slider
                  label="Volume principal"
                  value={config.output.volume}
                  min={0}
                  max={1}
                  onChange={setVolume}
                />
                <Slider
                  label="Balance"
                  value={config.output.balance}
                  min={-1}
                  max={1}
                  onChange={balance => setBalance(balance)}
                />
              </div>

              <button
                onClick={() => {
                  setTestType('speaker');
                  testSpeaker('Test du haut-parleur. Un, deux, trois.');
                }}
                disabled={isTesting}
                className="mt-4 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {isTesting && testType === 'speaker'
                  ? '🔊 Test...'
                  : '🔊 Tester le haut-parleur'}
              </button>

              {testType === 'speaker' && (
                <TestResult result={testResult} type="speaker" />
              )}
            </section>

            {/* Input Devices */}
            <section className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🎙️</span> Entrée Audio (Microphone)
              </h2>

              <DeviceSelector
                label="Périphérique d'entrée"
                icon="🎤"
                devices={inputDevices}
                selectedId={config.input.deviceId}
                onSelect={setInputDevice}
                isLoading={isLoading}
              />

              <div className="mt-6">
                <Slider
                  label="Gain du microphone"
                  value={config.input.gain}
                  min={0}
                  max={2}
                  onChange={setMicGain}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                {[
                  { key: 'noiseSuppression', label: 'Réduction du bruit' },
                  { key: 'echoCancellation', label: 'Annulation de l&apos;écho' },
                  { key: 'autoGainControl', label: 'Gain automatique' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm text-neutral-300"
                  >
                    <input
                      type="checkbox"
                      checked={config.input[key as keyof typeof config.input] as boolean}
                      onChange={() => {
                        const currentValue = config.input[
                          key as keyof typeof config.input
                        ] as boolean;
                        setInputOption(
                          key as
                            | 'noiseSuppression'
                            | 'echoCancellation'
                            | 'autoGainControl',
                          !currentValue
                        );
                      }}
                      className="w-4 h-4 accent-cyan-500"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <button
                onClick={() => {
                  setTestType('microphone');
                  testMicrophone();
                }}
                disabled={isTesting}
                className="mt-4 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {isTesting && testType === 'microphone'
                  ? '🎙️ Enregistrement...'
                  : '🎙️ Tester le microphone'}
              </button>

              {testType === 'microphone' && (
                <TestResult result={testResult} type="microphone" />
              )}
            </section>
          </>
        )}

        {/* Diagnostics Tab */}
        {activeTab === 'diagnostics' && (
          <section className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🔧</span> Diagnostic Audio
            </h2>
            <p className="text-neutral-400 text-sm mb-6">
              Vérifiez et résolvez les problèmes audio de votre système.
            </p>

            <AudioDiagnosticsPanel className="max-w-2xl" />
          </section>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <section className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>⚙️</span> Paramètres Avancés
            </h2>

            <div className="space-y-6">
              {/* ElevenLabs API Key */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  🔑 Clé API ElevenLabs (pour voix premium)
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  className="w-full md:w-96 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg
                           text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Optionnel. Permet d&apos;utiliser les voix ElevenLabs ultra-réalistes.
                </p>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  🌍 Langue par défaut
                </label>
                <select
                  value={config.tts.language}
                  onChange={e => updateTTSSettings({ language: e.target.value })}
                  className="w-full md:w-64 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg
                           text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="fr-FR">🇫🇷 Français (France)</option>
                  <option value="en-US">🇺🇸 English (US)</option>
                  <option value="en-GB">🇬🇧 English (UK)</option>
                  <option value="de-DE">🇩🇪 Deutsch</option>
                  <option value="es-ES">🇪🇸 Español</option>
                </select>
              </div>

              {/* Auto Fallback */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoFallback"
                  checked={config.tts.autoFallback}
                  onChange={e => updateTTSSettings({ autoFallback: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500"
                />
                <label htmlFor="autoFallback" className="text-sm text-neutral-300">
                  Fallback automatique (utiliser eSpeak si Piper échoue)
                </label>
              </div>

              {/* Engine Info */}
              <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-700">
                <h3 className="font-medium text-white mb-2">
                  ℹ️ Moteurs TTS disponibles
                </h3>
                <ul className="space-y-1 text-sm text-neutral-400">
                  <li>
                    • <strong className="text-purple-400">Piper</strong> - Voix locale
                    réaliste (fr_FR-siwis)
                  </li>
                  <li>
                    • <strong className="text-neutral-300">eSpeak</strong> - Voix
                    synthétique locale (fallback)
                  </li>
                  <li>
                    • <strong className="text-amber-400">ElevenLabs</strong> - Voix cloud
                    premium (API requise)
                  </li>
                  <li>
                    • <strong className="text-blue-400">Web Speech</strong> - Voix
                    navigateur (dernier recours)
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AudioCenterPage;
