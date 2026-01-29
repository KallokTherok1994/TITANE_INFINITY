/**
 * TITANE∞ v26.2.0 — API Support Detection & Safety
 * © 2025 Humain Total / Kevin Thibault / TITANE Team
 * 
 * Détection et validation de support pour les APIs media/capture
 * Prévention des crashes sur navigateurs non-supportés
 */

/**
 * Ensemble de vérifications pour les APIs supportées
 * Chaque check retourne true si l'API est disponible
 */
export const APISupport = {
  /**
   * Vérifier si Screen Capture (getDisplayMedia) est supportée
   */
  async supportsScreenCapture(): Promise<boolean> {
    try {
      return !!(navigator.mediaDevices?.getDisplayMedia);
    } catch {
      return false;
    }
  },

  /**
   * Vérifier si getUserMedia (caméra/micro) est supportée
   */
  async supportsGetUserMedia(): Promise<boolean> {
    try {
      return !!(navigator.mediaDevices?.getUserMedia);
    } catch {
      return false;
    }
  },

  /**
   * Vérifier s'il existe au moins un microphone disponible
   */
  async hasMicrophone(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(d => d.kind === 'audioinput' && d.label !== '');
    } catch {
      return false;
    }
  },

  /**
   * Vérifier s'il existe au moins une caméra disponible
   */
  async hasCamera(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(d => d.kind === 'videoinput' && d.label !== '');
    } catch {
      return false;
    }
  },

  /**
   * Vérifier si MediaRecorder est disponible
   * Requis pour l'enregistrement audio/vidéo
   */
  supportsMediaRecorder(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      window.MediaRecorder &&
      navigator.mediaDevices?.getUserMedia
    );
  },

  /**
   * Vérifier si Web Speech API (reconnaissance vocale) est supportée
   */
  supportsWebSpeechRecognition(): boolean {
    if (typeof window === 'undefined') return false;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  },

  /**
   * Vérifier si Speech Synthesis (TTS) est supportée
   */
  supportsSpeechSynthesis(): boolean {
    return !!(typeof window !== 'undefined' && window.speechSynthesis);
  },

  /**
   * Obtenir le navigateur détecté pour comparaisons
   */
  getBrowserInfo(): {
    name: string;
    version: string;
    isChromium: boolean;
    isFirefox: boolean;
    isSafari: boolean;
  } {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    let isChromium = false;
    let isFirefox = false;
    let isSafari = false;

    if (ua.includes('Firefox')) {
      name = 'Firefox';
      isFirefox = true;
      const match = ua.match(/Firefox\/([\d.]+)/);
      version = match?.[1] ?? 'Unknown';
    } else if (ua.includes('Edg')) {
      name = 'Edge';
      isChromium = true;
      const match = ua.match(/Edg\/([\d.]+)/);
      version = match?.[1] ?? 'Unknown';
    } else if (ua.includes('Chrome')) {
      name = 'Chrome';
      isChromium = true;
      const match = ua.match(/Chrome\/([\d.]+)/);
      version = match?.[1] ?? 'Unknown';
    } else if (ua.includes('Safari')) {
      name = 'Safari';
      isSafari = true;
      const match = ua.match(/Version\/([\d.]+)/);
      version = match?.[1] ?? 'Unknown';
    }

    return { name, version, isChromium, isFirefox, isSafari };
  },

  /**
   * Message d'erreur utilisateur-friendly basé sur le contexte
   */
  getErrorMessage(context: 'screen-capture' | 'microphone' | 'camera' | 'media-recorder'): string {
    const browser = this.getBrowserInfo();
    
    switch (context) {
      case 'screen-capture':
        return browser.isSafari
          ? 'Capture d\'écran : Safari nécessite macOS 12.1+. Vérifiez les permissions dans Paramètres > Confidentialité.'
          : 'Capture d\'écran non disponible. Vérifiez les permissions ou essayez un autre navigateur.';

      case 'microphone':
        return browser.isSafari
          ? 'Microphone non disponible. Vérifiez les permissions dans Paramètres > Confidentialité > Microphone.'
          : 'Aucun microphone détecté. Vérifiez la connexion du matériel et les permissions du navigateur.';

      case 'camera':
        return browser.isSafari
          ? 'Caméra non disponible. Vérifiez les permissions dans Paramètres > Confidentialité > Caméra.'
          : 'Aucune caméra détectée. Vérifiez la connexion du matériel et les permissions du navigateur.';

      case 'media-recorder':
        return 'Enregistrement audio/vidéo non supporté dans ce navigateur. Utilisez Chrome, Edge ou Firefox.';

      default:
        return 'Fonctionnalité non disponible.';
    }
  },

  /**
   * Diagnostic complet des APIs supportées
   * Utile pour debug en développement
   */
  async getDiagnostics(): Promise<Record<string, any>> {
    return {
      browser: this.getBrowserInfo(),
      screenCapture: await this.supportsScreenCapture(),
      userMedia: await this.supportsGetUserMedia(),
      hasMicrophone: await this.hasMicrophone(),
      hasCamera: await this.hasCamera(),
      mediaRecorder: this.supportsMediaRecorder(),
      webSpeech: this.supportsWebSpeechRecognition(),
      speechSynthesis: this.supportsSpeechSynthesis(),
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * Hook React pour détecter les changements de périphériques média
 * (utile pour mettre à jour l'UI quand l'utilisateur branche/débranche un micro/caméra)
 */
export function useMediaDevices() {
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);

  React.useEffect(() => {
    const updateDevices = async () => {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        setDevices(list);
      } catch (err) {
        console.error('[useMediaDevices] Error:', err);
      }
    };

    updateDevices();

    // Écouter les changements de périphériques
    navigator.mediaDevices?.addEventListener('devicechange', updateDevices);

    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', updateDevices);
    };
  }, []);

  return {
    hasAudioInput: devices.some(d => d.kind === 'audioinput'),
    hasVideoInput: devices.some(d => d.kind === 'videoinput'),
    audioInputs: devices.filter(d => d.kind === 'audioinput'),
    videoInputs: devices.filter(d => d.kind === 'videoinput'),
  };
}

// Fix pour le hook React
import React from 'react';
