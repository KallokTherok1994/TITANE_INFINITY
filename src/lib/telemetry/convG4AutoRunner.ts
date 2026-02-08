/**
 * TITANE∞ — G4 Conversations Auto Runner (in-app)
 * Triggered by VITE_TITANE_G4=1
 */

import { g4Emit, g4Log, g4Mark } from '@/lib/telemetry/convG4Collector';

const RUN_KEY = 'titane_g4_autorun_phase';
const RUN_GUARD = 'titane_g4_autorun_done';

const getRunPhaseFromUrl = (): string | null => {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get('g4');
  } catch {
    return null;
  }
};

const getRunPhaseFromWindowName = (): string | null => {
  if (typeof window === 'undefined') return null;
  const name = window.name || '';
  if (!name.startsWith('g4:')) return null;
  return name.slice(3) || null;
};

const getRunPhase = (): string | null => {
  const fromName = getRunPhaseFromWindowName();
  if (fromName) return fromName;
  const fromUrl = getRunPhaseFromUrl();
  if (fromUrl) return fromUrl;
  try {
    return window.localStorage.getItem(RUN_KEY);
  } catch {
    return null;
  }
};

const setRunPhaseInUrl = (value: string | null): void => {
  try {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('g4', value);
    } else {
      url.searchParams.delete('g4');
    }
    window.history.replaceState({}, '', url.toString());
  } catch {
    // ignore URL errors
  }
};

const setRunPhase = (value: string | null): void => {
  try {
    if (value === null) {
      if (typeof window !== 'undefined') {
        window.name = '';
      }
      window.localStorage.removeItem(RUN_KEY);
      setRunPhaseInUrl(null);
      return;
    }
    if (typeof window !== 'undefined') {
      window.name = `g4:${value}`;
    }
    window.localStorage.setItem(RUN_KEY, value);
    setRunPhaseInUrl(value);
  } catch {
    // ignore storage errors
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type TitaneController = {
  setTab: (tabId: 'conversation' | 'overview') => void;
};

type ConvController = {
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  clickConversation: (index: number) => Promise<void>;
  getConversationsCount: () => number;
};

const waitForControllers = async (timeoutMs = 30000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const w = window as typeof window & {
      __G4_TITANE__?: TitaneController;
      __G4_CONV__?: ConvController;
    };
    if (w.__G4_TITANE__ && w.__G4_CONV__) {
      return { titane: w.__G4_TITANE__, conv: w.__G4_CONV__ };
    }
    await sleep(200);
  }
  return null;
};

export const maybeRunG4AutoRunner = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  const envFlag = import.meta.env?.VITE_TITANE_G4 === '1';
  const devAuto = import.meta.env?.DEV === true && '__TAURI_INTERNALS__' in window;
  if (!envFlag && !devAuto) return;

  const phase = getRunPhase() || 'start';
  
  // Only guard if we're already done (not on first run or post-reload)
  if (phase !== 'start' && phase !== 'post-reload' && sessionStorage.getItem(RUN_GUARD) === '1') {
    return;
  }

  const controllers = await waitForControllers();
  if (!controllers) {
    await g4Log('G4_ERROR', { message: 'Controllers not ready' });
    sessionStorage.setItem(RUN_GUARD, '1');
    return;
  }
  const stepsDone = new Set<string>();
  const markStep = async (step: string) => {
    stepsDone.add(step);
    await g4Mark(step);
    await g4Emit(step, 'G4_AUTORUNNER_STEP', { step });
  };

  try {
    if (phase === 'start') {
      await g4Emit('BOOT', 'G4_AUTORUNNER_START', { phase });
      await markStep('BOOT');

      await markStep('TOGGLE#1');
      controllers.conv.toggleSidebar();
      await sleep(300);

      await markStep('TOGGLE#2');
      controllers.conv.toggleSidebar();
      await sleep(300);

      await markStep('TOGGLE#3');
      controllers.conv.toggleSidebar();
      await sleep(300);

      await markStep('TAB_SWITCH');
      controllers.titane.setTab('overview');
      await sleep(300);
      controllers.titane.setTab('conversation');
      await sleep(300);

      await markStep('RELOAD');
      setRunPhase('post-reload');
      await sleep(200);
      window.location.reload();
      return;
    }

    if (phase === 'post-reload') {
      await markStep('POST_RELOAD_SIDEBAR');
      controllers.conv.openSidebar();
      await sleep(300);

      const count = controllers.conv.getConversationsCount();
      if (count >= 2) {
        await markStep('POST_RELOAD_CLICKS');
        await controllers.conv.clickConversation(0);
        await sleep(200);
        await controllers.conv.clickConversation(1);
      } else {
        await g4Log('CONV_UI', { message: 'NO_CONVERSATIONS_VISIBLE' });
      }

      setRunPhase('done');
      sessionStorage.setItem(RUN_GUARD, '1');
      await g4Emit('POST_RELOAD_SIDEBAR', 'G4_COMPLETE', { ok: true });
      await g4Log('CONV_HOST', { phase: 'G4_DONE' });
      setRunPhase(null);
    }
  } catch (error) {
    const expected = [
      'BOOT',
      'TOGGLE#1',
      'TOGGLE#2',
      'TOGGLE#3',
      'TAB_SWITCH',
      'RELOAD',
      'POST_RELOAD_SIDEBAR',
    ];
    const missing = expected.filter(step => !stepsDone.has(step));
    if (missing.length > 0) {
      await g4Emit('ERROR', 'G4_MISSING_MARKER', { missing });
    }
    await g4Log('G4_ERROR', { message: String(error) });
    sessionStorage.setItem(RUN_GUARD, '1');
    setRunPhase(null);
  }
};
