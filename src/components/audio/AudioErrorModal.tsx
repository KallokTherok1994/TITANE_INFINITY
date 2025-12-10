/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ — Audio Error Modal
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @file        AudioErrorModal.tsx
 * @version     v19.5.2+
 * @phase       Phase 3 — P1-8: Modal d'erreur audio conviviale
 *
 * OBJECTIF:
 * - Modal conviviale pour les erreurs audio (microphone, permissions, audio context)
 * - Guidance utilisateur avec messages clairs et actions de résolution
 * - Intégration avec useVAD et audio hooks
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { AlertCircle, Mic, MicOff, RefreshCw, Settings, X } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export type AudioErrorType =
  | 'MicrophoneNotFound'
  | 'PermissionDenied'
  | 'DeviceBusy'
  | 'AudioContextFailed'
  | 'StreamError'
  | 'Unknown';

export interface AudioError {
  type: AudioErrorType;
  message?: string;
  timestamp: number;
  deviceLabel?: string;
}

export interface AudioErrorModalProps {
  error: AudioError | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => Promise<void>;
  onOpenSettings?: () => void;
}

// =============================================================================
// ERROR METADATA
// =============================================================================

interface ErrorMetadata {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  troubleshooting: string[];
  actions: Array<{
    label: string;
    action: 'retry' | 'settings' | 'close';
    primary?: boolean;
  }>;
}

const ERROR_METADATA: Record<AudioErrorType, ErrorMetadata> = {
  MicrophoneNotFound: {
    icon: MicOff,
    iconColor: 'text-orange-500',
    title: 'Microphone introuvable',
    description:
      "Aucun microphone n'a été détecté sur votre système. Veuillez vérifier la connexion de votre périphérique audio.",
    troubleshooting: [
      'Vérifiez que votre microphone est bien branché',
      'Si vous utilisez un casque USB, débranchez-le et rebranchez-le',
      'Vérifiez que le microphone est activé dans les paramètres système',
      'Essayez de redémarrer votre navigateur',
    ],
    actions: [
      { label: 'Réessayer', action: 'retry', primary: true },
      { label: 'Paramètres système', action: 'settings' },
      { label: 'Fermer', action: 'close' },
    ],
  },

  PermissionDenied: {
    icon: AlertCircle,
    iconColor: 'text-red-500',
    title: 'Permission refusée',
    description:
      "L'accès au microphone a été refusé. TITANE∞ a besoin de votre permission pour utiliser le microphone.",
    troubleshooting: [
      "Cliquez sur l'icône de cadenas dans la barre d'adresse",
      "Autorisez l'accès au microphone pour ce site",
      "Si vous avez bloqué l'accès, supprimez le site de la liste noire",
      'Rechargez la page après avoir accordé la permission',
    ],
    actions: [
      { label: 'Réessayer', action: 'retry', primary: true },
      { label: 'Paramètres navigateur', action: 'settings' },
      { label: 'Fermer', action: 'close' },
    ],
  },

  DeviceBusy: {
    icon: Mic,
    iconColor: 'text-yellow-500',
    title: 'Microphone occupé',
    description:
      'Le microphone est actuellement utilisé par une autre application. Veuillez fermer les autres applications qui utilisent le microphone.',
    troubleshooting: [
      'Fermez les autres onglets ou applications qui utilisent le microphone',
      'Vérifiez si une visioconférence est en cours (Zoom, Teams, etc.)',
      'Redémarrez votre navigateur si le problème persiste',
      'Sur Windows, vérifiez le Gestionnaire des tâches',
    ],
    actions: [
      { label: 'Réessayer', action: 'retry', primary: true },
      { label: 'Fermer', action: 'close' },
    ],
  },

  AudioContextFailed: {
    icon: AlertCircle,
    iconColor: 'text-red-500',
    title: 'Erreur du contexte audio',
    description:
      'Le moteur audio du navigateur a rencontré une erreur. Cela peut être dû à une limitation du navigateur ou à un problème système.',
    troubleshooting: [
      'Redémarrez votre navigateur',
      'Vérifiez que votre système audio fonctionne correctement',
      'Essayez un autre navigateur (Chrome, Firefox, Edge)',
      'Mettez à jour votre navigateur vers la dernière version',
    ],
    actions: [
      { label: 'Réessayer', action: 'retry', primary: true },
      { label: 'Fermer', action: 'close' },
    ],
  },

  StreamError: {
    icon: AlertCircle,
    iconColor: 'text-orange-500',
    title: 'Erreur du flux audio',
    description:
      "Le flux audio du microphone s'est interrompu de manière inattendue. Cela peut être dû à une déconnexion du périphérique.",
    troubleshooting: [
      'Vérifiez la connexion de votre microphone',
      'Débranchez et rebranchez le microphone',
      'Vérifiez les câbles et connexions',
      'Essayez un autre port USB si applicable',
    ],
    actions: [
      { label: 'Réessayer', action: 'retry', primary: true },
      { label: 'Fermer', action: 'close' },
    ],
  },

  Unknown: {
    icon: AlertCircle,
    iconColor: 'text-gray-500',
    title: 'Erreur inconnue',
    description:
      "Une erreur audio inattendue s'est produite. Veuillez réessayer ou contacter le support si le problème persiste.",
    troubleshooting: [
      "Réessayez l'opération",
      'Redémarrez votre navigateur',
      'Vérifiez la console développeur (F12) pour plus de détails',
      'Contactez le support technique si le problème persiste',
    ],
    actions: [
      { label: 'Réessayer', action: 'retry', primary: true },
      { label: 'Fermer', action: 'close' },
    ],
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export const AudioErrorModal: React.FC<AudioErrorModalProps> = ({
  error,
  isOpen,
  onClose,
  onRetry,
  onOpenSettings,
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  if (!isOpen || !error) return null;

  const metadata = ERROR_METADATA[error.type];
  const IconComponent = metadata.icon;

  const handleAction = async (action: 'retry' | 'settings' | 'close') => {
    switch (action) {
      case 'retry':
        if (onRetry) {
          setIsRetrying(true);
          try {
            await onRetry();
            onClose();
          } catch (err) {
            console.error('[AudioErrorModal] Retry failed:', err);
          } finally {
            setIsRetrying(false);
          }
        }
        break;

      case 'settings':
        if (onOpenSettings) {
          onOpenSettings();
        } else {
          // Fallback: Open browser settings
          alert(
            "Veuillez ouvrir les paramètres de votre navigateur et autoriser l'accès au microphone."
          );
        }
        break;

      case 'close':
        onClose();
        break;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-labelledby="audio-error-modal-title"
        aria-describedby="audio-error-modal-description"
      >
        <div
          className="bg-gradient-to-br from-[#1a1a2e]/95 to-[#0f0f1e]/95 backdrop-blur-md border border-cyan-500/20 rounded-xl shadow-2xl max-w-lg w-full pointer-events-auto overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon + Title */}
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 ${metadata.iconColor}`}>
                <IconComponent className="w-8 h-8" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h2
                  id="audio-error-modal-title"
                  className="text-xl font-semibold text-white mb-2"
                >
                  {metadata.title}
                </h2>
                <p
                  id="audio-error-modal-description"
                  className="text-gray-300 text-sm leading-relaxed"
                >
                  {metadata.description}
                </p>

                {/* Error message (if available) */}
                {error.message && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-xs font-mono break-all">
                      {error.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="px-6 pb-4">
            <h3 className="text-sm font-medium text-cyan-400 mb-2 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Solutions possibles
            </h3>
            <ul className="space-y-1.5">
              {metadata.troubleshooting.map((step, index) => (
                <li key={index} className="text-gray-400 text-xs flex items-start">
                  <span className="text-cyan-500 mr-2 mt-0.5">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex justify-end space-x-3">
            {metadata.actions.map(action => (
              <button
                key={action.action}
                onClick={() => handleAction(action.action)}
                disabled={isRetrying && action.action === 'retry'}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${
                    action.primary
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }
                  ${isRetrying && action.action === 'retry' ? 'opacity-50 cursor-not-allowed' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isRetrying && action.action === 'retry' ? (
                  <span className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Réessai...
                  </span>
                ) : (
                  action.label
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioErrorModal;
