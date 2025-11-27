/**
 * TITANE_INFINITY v24.20 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.20 — IMMERSIVE AVATAR COMPONENT
 *   2D/3D Avatar avec lip-sync, expressions, wake-word feedback
 *   v24.20: RAF throttling 60fps, skip unchanged frames, performance optimized
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { immersiveAvatarBridge, type MorphTarget, type FacialExpression } from '@/services/immersiveAvatarBridgeV23';

interface TitaneAvatarProps {
  mode?: '2D' | '3D';
  size?: number;
  showExpression?: boolean;
  enableWakeWord?: boolean;
  enableImmersion?: boolean;
}

export const TitaneAvatar: React.FC<TitaneAvatarProps> = ({
  mode: _mode = '2D',
  size = 200,
  showExpression = true,
  enableWakeWord = true,
  enableImmersion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // v24.20: RAF throttling refs (60fps cap)
  const lastFrameTimeRef = useRef<number>(0);
  const targetFPS = 60;
  const frameDuration = 1000 / targetFPS; // 16.67ms

  // v24.20: Skip unchanged frames
  const lastMorphRef = useRef<MorphTarget | null>(null);

  const [_currentMorph, setCurrentMorph] = useState<MorphTarget>({
    jaw_open: 0.1,
    lip_rounding: 0.2,
    tongue_position: 0.4,
    lip_spread: 0.3,
    duration_ms: 0,
  });

  const [currentExpression, setCurrentExpression] = useState<FacialExpression>('neutral');
  const [isImmersive, setIsImmersive] = useState(false);
  const [wakeWordActive, setWakeWordActive] = useState(false);

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (enableImmersion) {
      immersiveAvatarBridge.enableImmersion();
      setIsImmersive(true);
    }
  }, [enableImmersion]);

  // ═══════════════════════════════════════════════════════════════
  // EXPRESSION UPDATE (poll every 2s)
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    const updateExpression = async () => {
      try {
        const expression = await immersiveAvatarBridge.getExpression();
        setCurrentExpression(expression);
      } catch (err) {
        console.error('[TitaneAvatar] Failed to get expression:', err);
      }
    };

    updateExpression();
    const interval = setInterval(updateExpression, 2000); // Update every 2s
    return () => clearInterval(interval);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // WAKE-WORD DETECTION REACTION
  // ═══════════════════════════════════════════════════════════════

  const handleWakeWord = useCallback(async () => {
    if (!enableWakeWord) return;

    try {
      await immersiveAvatarBridge.onWakeWord();
      setWakeWordActive(true);

      // Visual feedback: halo animation
      setTimeout(() => setWakeWordActive(false), 1500);
    } catch (err) {
      console.error('[TitaneAvatar] Wake-word reaction failed:', err);
    }
  }, [enableWakeWord]);

  // Expose handleWakeWord to parent components via global event
  useEffect(() => {
    const handleGlobalWakeWord = () => handleWakeWord();
    window.addEventListener('titane:wakeword', handleGlobalWakeWord);
    return () => window.removeEventListener('titane:wakeword', handleGlobalWakeWord);
  }, [handleWakeWord]);

  // ═════════════════════════════════════════════════════════════════
  // LIP-SYNC ANIMATION LOOP (60 FPS with throttling v24.20)
  // ═════════════════════════════════════════════════════════════════

  const renderAvatar = useCallback((morph: MorphTarget) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Background circle (presence)
    if (isImmersive || wakeWordActive) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);

      // Halo effect on wake-word
      if (wakeWordActive) {
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(157, 124, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(157, 124, 255, 0)');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = 'rgba(157, 124, 255, 0.1)';
      }

      ctx.fill();
      ctx.restore();
    }

    // Face circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
    ctx.fillStyle = getExpressionColor(currentExpression);
    ctx.fill();
    ctx.strokeStyle = '#9d7cff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Eyes
    drawEyes(ctx, size, currentExpression);

    // Mouth (with morph targets)
    drawMouth(ctx, size, morph, currentExpression);

    // Brows
    drawBrows(ctx, size, currentExpression);

  }, [size, currentExpression, isImmersive, wakeWordActive]);

  useEffect(() => {
    const animate = async (timestamp: number) => {
      try {
        // v24.20: RAF throttling (60fps cap)
        const elapsed = timestamp - lastFrameTimeRef.current;
        if (elapsed < frameDuration) {
          animationFrameRef.current = requestAnimationFrame(animate);
          return; // Skip frame if < 16.67ms
        }
        lastFrameTimeRef.current = timestamp;

        // Advance lip-sync frame
        await immersiveAvatarBridge.advanceLipSync();

        // Get current morph target
        const morph = await immersiveAvatarBridge.getCurrentMorph();

        // v24.20: Skip render if morph unchanged (performance boost)
        const changed = (
          !lastMorphRef.current ||
          lastMorphRef.current.jaw_open !== morph.jaw_open ||
          lastMorphRef.current.lip_rounding !== morph.lip_rounding ||
          lastMorphRef.current.tongue_position !== morph.tongue_position ||
          lastMorphRef.current.lip_spread !== morph.lip_spread
        );

        if (changed || wakeWordActive) {
          setCurrentMorph(morph);
          lastMorphRef.current = morph;
          renderAvatar(morph);
        }

      } catch (err) {
        console.error('[TitaneAvatar] Animation loop error:', err);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // v24.20: Start with initial timestamp
    lastFrameTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderAvatar, frameDuration, wakeWordActive]);

  // ═════════════════════════════════════════════════════════════════
  // DRAWING HELPERS
  // ═══════════════════════════════════════════════════════════════

  const drawEyes = (ctx: CanvasRenderingContext2D, size: number, expression: FacialExpression) => {
    const centerX = size / 2;
    const centerY = size / 2 - size / 10;
    const eyeRadius = size / 20;
    const eyeSpacing = size / 6;

    ctx.save();
    ctx.fillStyle = '#ffffff';

    // Left eye
    ctx.beginPath();
    if (expression === 'attentive' || expression === 'warm_focus') {
      // Wider eyes
      ctx.arc(centerX - eyeSpacing, centerY, eyeRadius * 1.2, 0, Math.PI * 2);
    } else if (expression === 'relaxed_brows') {
      // Narrower eyes (relaxed)
      ctx.ellipse(centerX - eyeSpacing, centerY, eyeRadius * 0.8, eyeRadius * 0.6, 0, 0, Math.PI * 2);
    } else {
      // Normal eyes
      ctx.arc(centerX - eyeSpacing, centerY, eyeRadius, 0, Math.PI * 2);
    }
    ctx.fill();

    // Right eye
    ctx.beginPath();
    if (expression === 'attentive' || expression === 'warm_focus') {
      ctx.arc(centerX + eyeSpacing, centerY, eyeRadius * 1.2, 0, Math.PI * 2);
    } else if (expression === 'relaxed_brows') {
      ctx.ellipse(centerX + eyeSpacing, centerY, eyeRadius * 0.8, eyeRadius * 0.6, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(centerX + eyeSpacing, centerY, eyeRadius, 0, Math.PI * 2);
    }
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing, centerY, eyeRadius / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing, centerY, eyeRadius / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawMouth = (
    ctx: CanvasRenderingContext2D,
    size: number,
    morph: MorphTarget,
    expression: FacialExpression
  ) => {
    const centerX = size / 2;
    const centerY = size / 2 + size / 5;
    const baseWidth = size / 5;
    const baseHeight = size / 15;

    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Apply morph targets
    const width = baseWidth * (1 + morph.lip_spread * 0.5);
    const height = baseHeight * (1 + morph.jaw_open * 2);
    const rounding = morph.lip_rounding;

    if (expression === 'soft_smile' || expression === 'warm_focus') {
      // Smile curve
      ctx.arc(centerX, centerY - height, width, 0.2, Math.PI - 0.2);
    } else if (expression === 'explain_mode') {
      // Slightly open (speaking)
      ctx.ellipse(centerX, centerY, width * (1 + rounding * 0.3), height * 1.5, 0, 0, Math.PI * 2);
    } else {
      // Neutral or dynamic (with jaw_open)
      ctx.ellipse(centerX, centerY, width * (1 + rounding * 0.3), height, 0, 0, Math.PI * 2);
    }

    ctx.stroke();
    ctx.restore();
  };

  const drawBrows = (ctx: CanvasRenderingContext2D, size: number, expression: FacialExpression) => {
    const centerX = size / 2;
    const centerY = size / 2 - size / 6;
    const browLength = size / 8;
    const browSpacing = size / 6;

    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    if (expression === 'lifted_brows') {
      // Lifted brows (surprise/wake-word)
      ctx.beginPath();
      ctx.moveTo(centerX - browSpacing - browLength / 2, centerY - size / 15);
      ctx.lineTo(centerX - browSpacing + browLength / 2, centerY - size / 12);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX + browSpacing - browLength / 2, centerY - size / 12);
      ctx.lineTo(centerX + browSpacing + browLength / 2, centerY - size / 15);
      ctx.stroke();
    } else if (expression === 'relaxed_brows') {
      // Relaxed brows (lower, softer)
      ctx.beginPath();
      ctx.moveTo(centerX - browSpacing - browLength / 2, centerY);
      ctx.lineTo(centerX - browSpacing + browLength / 2, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX + browSpacing - browLength / 2, centerY);
      ctx.lineTo(centerX + browSpacing + browLength / 2, centerY);
      ctx.stroke();
    } else {
      // Normal brows
      ctx.beginPath();
      ctx.moveTo(centerX - browSpacing - browLength / 2, centerY - size / 20);
      ctx.lineTo(centerX - browSpacing + browLength / 2, centerY - size / 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX + browSpacing - browLength / 2, centerY - size / 25);
      ctx.lineTo(centerX + browSpacing + browLength / 2, centerY - size / 20);
      ctx.stroke();
    }

    ctx.restore();
  };

  const getExpressionColor = (expression: FacialExpression): string => {
    const colors = {
      neutral: 'rgba(157, 124, 255, 0.3)',
      soft_smile: 'rgba(255, 136, 221, 0.3)',
      attentive: 'rgba(0, 221, 255, 0.3)',
      warm_focus: 'rgba(255, 170, 68, 0.3)',
      explain_mode: 'rgba(119, 153, 255, 0.3)',
      lifted_brows: 'rgba(255, 221, 136, 0.3)',
      relaxed_brows: 'rgba(136, 204, 255, 0.3)',
      tiny_nod: 'rgba(153, 255, 153, 0.3)',
    };
    return colors[expression] || colors.neutral;
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="titane-avatar-container" style={{ position: 'relative', width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          border: isImmersive ? '2px solid #9d7cff' : '1px solid rgba(157, 124, 255, 0.3)',
          borderRadius: '50%',
          boxShadow: wakeWordActive ? '0 0 20px rgba(157, 124, 255, 0.8)' : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      />

      {showExpression && (
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            color: '#9d7cff',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {currentExpression.replace('_', ' ')}
        </div>
      )}
    </div>
  );
};

export default TitaneAvatar;
