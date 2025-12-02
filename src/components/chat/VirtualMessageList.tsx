/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ VIRTUAL MESSAGE LIST v∞
 *   Super Prompt D: Optimisation du Chat IA (streaming + rendering)
 *
 *   Features:
 *   - Virtualisation des messages (render uniquement visible)
 *   - Scroll intelligent avec buffer
 *   - Compression mémoire liste
 *   - Performance optimale 1000+ messages
 *   - Compatible React.memo + useMemo
 * ═══════════════════════════════════════════════════════════════════
 */

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo
} from 'react';
import type { AIMessage } from '../../services/ai/types';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
  /** Hauteur estimée par message (px) */
  ESTIMATED_ITEM_HEIGHT: 120,
  /** Buffer avant/après viewport (items) */
  OVERSCAN_COUNT: 3,
  /** Seuil pour activer virtualisation */
  VIRTUALIZATION_THRESHOLD: 30,
  /** Hauteur minimale d'un message */
  MIN_ITEM_HEIGHT: 60,
  /** Hauteur maximale d'un message (évite bugs) */
  MAX_ITEM_HEIGHT: 800,
} as const;

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface VirtualMessageListProps {
  messages: AIMessage[];
  renderMessage: (message: AIMessage, index: number, isLast: boolean) => React.ReactNode;
  isLoading?: boolean;
  className?: string;
  onScrollToBottom?: () => void;
}

interface ItemMeasurement {
  offset: number;
  height: number;
}

// ═══════════════════════════════════════════════════════════════════
// VIRTUAL MESSAGE LIST COMPONENT
// ═══════════════════════════════════════════════════════════════════

export const VirtualMessageList = memo(function VirtualMessageList({
  messages,
  renderMessage,
  isLoading = false,
  className = '',
  onScrollToBottom,
}: VirtualMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const measurementsRef = useRef<Map<number, ItemMeasurement>>(new Map());
  const isAtBottomRef = useRef(true);

  // ═══════════════════════════════════════════════════════════════════
  // SKIP VIRTUALIZATION FOR SMALL LISTS
  // ═══════════════════════════════════════════════════════════════════

  const shouldVirtualize = messages.length > CONFIG.VIRTUALIZATION_THRESHOLD;

  // ═══════════════════════════════════════════════════════════════════
  // CONTAINER SIZE OBSERVATION
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);

    return () => resizeObserver.disconnect();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // SCROLL HANDLER
  // ═══════════════════════════════════════════════════════════════════

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // Check if at bottom (with tolerance)
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    isAtBottomRef.current = isAtBottom;

    if (isAtBottom && onScrollToBottom) {
      onScrollToBottom();
    }
  }, [onScrollToBottom]);

  // ═══════════════════════════════════════════════════════════════════
  // AUTO-SCROLL TO BOTTOM ON NEW MESSAGES
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (isAtBottomRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length]);

  // ═══════════════════════════════════════════════════════════════════
  // CALCULATE VISIBLE RANGE
  // ═══════════════════════════════════════════════════════════════════

  const { visibleRange, totalHeight, offsetTop } = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        visibleRange: { start: 0, end: messages.length },
        totalHeight: 0,
        offsetTop: 0,
      };
    }

    // Build cumulative heights
    let cumulativeHeight = 0;
    const offsets: number[] = [];

    for (let i = 0; i < messages.length; i++) {
      offsets.push(cumulativeHeight);
      const measurement = measurementsRef.current.get(i);
      const height = measurement?.height ?? CONFIG.ESTIMATED_ITEM_HEIGHT;
      cumulativeHeight += height;
    }

    const totalHeight = cumulativeHeight;

    // Find visible range
    const scrollBottom = scrollTop + containerHeight;

    let startIndex = 0;
    for (let i = 0; i < messages.length; i++) {
      if (offsets[i] + CONFIG.ESTIMATED_ITEM_HEIGHT >= scrollTop) {
        startIndex = i;
        break;
      }
    }

    let endIndex = messages.length;
    for (let i = startIndex; i < messages.length; i++) {
      if (offsets[i] > scrollBottom) {
        endIndex = i;
        break;
      }
    }

    // Apply overscan
    startIndex = Math.max(0, startIndex - CONFIG.OVERSCAN_COUNT);
    endIndex = Math.min(messages.length, endIndex + CONFIG.OVERSCAN_COUNT);

    return {
      visibleRange: { start: startIndex, end: endIndex },
      totalHeight,
      offsetTop: offsets[startIndex] ?? 0,
    };
  }, [messages.length, scrollTop, containerHeight, shouldVirtualize]);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER VISIBLE MESSAGES
  // ═══════════════════════════════════════════════════════════════════

  const visibleMessages = useMemo(() => {
    return messages.slice(visibleRange.start, visibleRange.end);
  }, [messages, visibleRange.start, visibleRange.end]);

  // ═══════════════════════════════════════════════════════════════════
  // ITEM MEASUREMENT CALLBACK
  // ═══════════════════════════════════════════════════════════════════

  const measureItem = useCallback((index: number, element: HTMLElement | null) => {
    if (!element || !shouldVirtualize) return;

    const height = Math.min(
      Math.max(element.offsetHeight, CONFIG.MIN_ITEM_HEIGHT),
      CONFIG.MAX_ITEM_HEIGHT
    );

    const current = measurementsRef.current.get(index);
    if (!current || Math.abs(current.height - height) > 5) {
      measurementsRef.current.set(index, {
        offset: current?.offset ?? 0,
        height,
      });
    }
  }, [shouldVirtualize]);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  // Non-virtualized render for small lists
  if (!shouldVirtualize) {
    return (
      <div
        ref={containerRef}
        className={`virtual-message-list ${className}`}
        onScroll={handleScroll}
        style={{ overflowY: 'auto', height: '100%' }}
      >
        {messages.map((message, index) => (
          <div key={message.metadata?.uiId ?? `msg-${index}`}>
            {renderMessage(message, index, index === messages.length - 1)}
          </div>
        ))}

        {isLoading && (
          <div className="virtual-message-list__loading">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
        )}
      </div>
    );
  }

  // Virtualized render for large lists
  return (
    <div
      ref={containerRef}
      className={`virtual-message-list ${className}`}
      onScroll={handleScroll}
      style={{ overflowY: 'auto', height: '100%' }}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            position: 'absolute',
            top: offsetTop,
            left: 0,
            right: 0,
          }}
        >
          {visibleMessages.map((message, relativeIndex) => {
            const absoluteIndex = visibleRange.start + relativeIndex;
            const isLast = absoluteIndex === messages.length - 1;

            return (
              <div
                key={message.metadata?.uiId ?? `msg-${absoluteIndex}`}
                ref={(el) => measureItem(absoluteIndex, el)}
                data-index={absoluteIndex}
              >
                {renderMessage(message, absoluteIndex, isLast)}
              </div>
            );
          })}

          {isLoading && (
            <div className="virtual-message-list__loading">
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
// HOOK FOR SCROLL CONTROL
// ═══════════════════════════════════════════════════════════════════

export function useMessageListScroll(containerRef: React.RefObject<HTMLDivElement>) {
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
  }, [containerRef]);

  const scrollToMessage = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      const item = containerRef.current.querySelector(`[data-index="${index}"]`);
      if (item) {
        item.scrollIntoView({ behavior, block: 'center' });
      }
    }
  }, [containerRef]);

  return { scrollToBottom, scrollToMessage };
}

export default VirtualMessageList;
