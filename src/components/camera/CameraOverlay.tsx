/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.20.0 — CAMERA OVERLAY
 *   Overlay pour afficher le flux caméra activé via chat
 *   Super Prompt #3 — Feature #2
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Camera } from 'lucide-react';
import './CameraOverlay.css';

interface CameraOverlayProps {
  stream: MediaStream | null;
  onClose: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({
  stream,
  onClose,
  position = 'bottom-left',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attacher le stream au video element
  useEffect(() => {
    if (!videoRef.current || !stream) return;

    const video = videoRef.current;

    try {
      video.srcObject = stream;
      video.play().catch(err => {
        console.error('[CameraOverlay] Play error:', err);
        setError('Impossible de démarrer le flux vidéo');
      });
    } catch (err) {
      console.error('[CameraOverlay] Stream attach error:', err);
      setError("Erreur lors de l'attachement du flux");
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  if (!stream) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`camera-overlay ${position} ${isExpanded ? 'expanded' : 'compact'}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className="camera-overlay-header">
          <div className="camera-overlay-title">
            <Camera size={14} />
            <span>Vision Active</span>
            <div className="camera-overlay-indicator" />
          </div>
          <div className="camera-overlay-actions">
            <button
              className="camera-overlay-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Réduire' : 'Agrandir'}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button className="camera-overlay-btn" onClick={onClose} title="Fermer">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Video */}
        <div className="camera-overlay-video-container">
          {error ? (
            <div className="camera-overlay-error">
              <Camera size={32} opacity={0.3} />
              <p>{error}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="camera-overlay-video"
              autoPlay
              playsInline
              muted
            />
          )}
        </div>

        {/* Footer */}
        <div className="camera-overlay-footer">
          <span className="camera-overlay-status">🔒 Flux 100% local</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraOverlay;
