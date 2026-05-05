// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   UnifiedLauncherPanel — Cross-platform launch wizard
//   OS detection → Ollama check → Facebook Auth (optional) → Launch
//   data-testid: "unified-launcher-panel"
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { safeInvokeCanonical } from '@/utils/invoke';
import { FacebookLoginButton } from '@/components/auth/FacebookLoginButton';
import { OAuthProfileCard } from '@/components/auth/OAuthProfileCard';
import { useOAuthStore } from '@/core/auth/oauthStore';

type Platform = 'windows' | 'linux' | 'android' | 'unknown';
type Step = 'detecting' | 'ollama' | 'auth' | 'ready' | 'error';

interface OllamaStatus {
  reachable: boolean;
  model?: string;
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android')) return 'android';
  if (ua.includes('win')) return 'windows';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

interface UnifiedLauncherPanelProps {
  onLaunchComplete?: () => void;
  className?: string;
}

export const UnifiedLauncherPanel: React.FC<UnifiedLauncherPanelProps> = ({
  onLaunchComplete,
  className = '',
}) => {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [step, setStep] = useState<Step>('detecting');
  const [ollama, setOllama] = useState<OllamaStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { profile, loadProfile } = useOAuthStore();

  // Step 1 — Detect platform
  useEffect(() => {
    setPlatform(detectPlatform());
    setStep('ollama');
  }, []);

  // Step 2 — Check Ollama
  useEffect(() => {
    if (step !== 'ollama') return;
    safeInvokeCanonical<{ ok: boolean; model?: string }>('ai_check_ollama_status')
      .then(res => {
        const data = res.ok ? res.content : null;
        setOllama({ reachable: data?.ok ?? false, model: data?.model });
        setStep('auth');
      })
      .catch(() => {
        setOllama({ reachable: false });
        setStep('auth');
      });
  }, [step]);

  // Step 3 — Load cached OAuth profile
  useEffect(() => {
    if (step !== 'auth') return;
    loadProfile()
      .then(() => setStep('ready'))
      .catch(() => setStep('ready'));
  }, [step, loadProfile]);

  const handleLaunch = () => {
    onLaunchComplete?.();
  };

  const platformLabel: Record<Platform, string> = {
    windows: 'Windows',
    linux: 'Linux',
    android: 'Android',
    unknown: 'Desktop',
  };

  return (
    <div
      data-testid="unified-launcher-panel"
      className={[
        'flex flex-col gap-4 p-5 rounded-2xl',
        'bg-black/60 backdrop-blur-sm border border-white/10',
        'text-white max-w-sm w-full mx-auto',
        className,
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">
          ∞
        </span>
        <div>
          <h2 className="font-bold text-lg leading-tight">TITANE∞ Launcher</h2>
          <p className="text-xs text-white/50" data-testid="unified-launcher-platform">
            {platform !== 'unknown' ? platformLabel[platform] : 'Détection…'}
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 text-xs" data-testid="unified-launcher-steps">
        <StepBadge label="OS" done={step !== 'detecting'} active={step === 'detecting'} />
        <StepBadge
          label="Ollama"
          done={['auth', 'ready', 'error'].includes(step)}
          active={step === 'ollama'}
        />
        <StepBadge label="Auth" done={step === 'ready'} active={step === 'auth'} />
      </div>

      {/* Ollama status */}
      {ollama && (
        <div
          data-testid="unified-launcher-ollama-status"
          className={[
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
            ollama.reachable
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
          ].join(' ')}
        >
          <span aria-hidden="true">{ollama.reachable ? '✓' : '⚠'}</span>
          {ollama.reachable
            ? `Ollama actif${ollama.model ? ` — ${ollama.model}` : ''}`
            : 'Ollama hors-ligne — mode dégradé'}
        </div>
      )}

      {/* Auth section */}
      {step === 'ready' && (
        <div data-testid="unified-launcher-auth-section">
          {profile ? (
            <OAuthProfileCard />
          ) : (
            <div>
              <p className="text-xs text-white/50 mb-2">Connexion optionnelle</p>
              <FacebookLoginButton label="Facebook (optionnel)" />
            </div>
          )}
        </div>
      )}

      {/* Launch button */}
      {step === 'ready' && (
        <button
          type="button"
          onClick={handleLaunch}
          data-testid="unified-launcher-launch-button"
          className={[
            'w-full py-2.5 px-4 rounded-xl font-bold text-sm',
            'bg-gradient-to-r from-violet-600 to-indigo-600',
            'hover:from-violet-500 hover:to-indigo-500',
            'active:scale-[0.98] transition-all duration-150',
            'shadow-lg shadow-violet-500/20',
          ].join(' ')}
        >
          Lancer TITANE∞
        </button>
      )}

      {/* Loading state */}
      {step !== 'ready' && step !== 'error' && (
        <div
          data-testid="unified-launcher-loading"
          className="flex items-center gap-2 text-xs text-white/50"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="animate-spin inline-block w-3 h-3 border border-white/30 border-t-white rounded-full" />
          {step === 'detecting' && 'Détection de la plateforme…'}
          {step === 'ollama' && 'Vérification Ollama…'}
          {step === 'auth' && 'Chargement du profil…'}
        </div>
      )}

      {errorMsg && (
        <p
          role="alert"
          data-testid="unified-launcher-error"
          className="text-xs text-red-400"
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
};

// ─── Internal StepBadge ──────────────────────────────────────────

interface StepBadgeProps {
  label: string;
  done: boolean;
  active: boolean;
}

const StepBadge: React.FC<StepBadgeProps> = ({ label, done, active }) => (
  <span
    className={[
      'px-2 py-0.5 rounded-full border text-xs font-medium transition-colors',
      done
        ? 'bg-green-500/20 border-green-500/40 text-green-400'
        : active
          ? 'bg-violet-500/20 border-violet-500/40 text-violet-400 animate-pulse'
          : 'bg-white/5 border-white/10 text-white/30',
    ].join(' ')}
  >
    {done ? `✓ ${label}` : label}
  </span>
);

export default UnifiedLauncherPanel;
