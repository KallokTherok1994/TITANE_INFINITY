/**
 * IMAGE OPTIMIZATION UTILITIES - v35.0.0
 * ═════════════════════════════════════════════════════════════
 * 
 * Provides image lazy-loading and preloading strategies
 * for optimal LCP and CLS (Cumulative Layout Shift).
 * 
 * Usage:
 *   import { useImageLazyLoad, preloadImage } from '@utils/imageOptimization';
 *   
 *   // Lazy-load an image
 *   <img {...useImageLazyLoad()} src={imageSrc} alt={alt} />
 *   
 *   // Preload critical images
 *   useEffect(() => {
 *     preloadImage(criticalImageSrc);
 *   }, []);
 */

import { useEffect, useRef, useState } from 'react';
import type { FC, RefObject } from 'react';

/* ────────────────────────────────────────────────────────────
   1. LAZY-LOADING WITH INTERSECTION OBSERVER
   ──────────────────────────────────────────────────────────── */

/**
 * Hook to detect if an image is visible in viewport
 * Replaces native loading="lazy" for older browsers
 */
export const useImageLazyLoad = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      rootMargin: '50px', // Start loading 50px before entering viewport
      threshold: 0,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, [options]);

  return {
    ref,
    isVisible,
    loading: 'lazy' as const,
    decoding: 'async' as const, // Parallel decode
  };
};

/* ────────────────────────────────────────────────────────────
   2. IMAGE PRELOADING
   ──────────────────────────────────────────────────────────── */

/**
 * Preload an image for immediate availability
 * Use for critical above-fold images
 * @param src - Image source URL
 * @param sizes - Optional responsive sizes
 */
export const preloadImage = (src: string, sizes?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    if (sizes) {
      img.sizes = sizes;
    }
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    img.src = src;
  });
};

/**
 * Preload multiple images in parallel
 * @param sources - Array of image URLs
 */
export const preloadImages = async (sources: string[]): Promise<void> => {
  await Promise.all(sources.map((src) => preloadImage(src)));
};

/* ────────────────────────────────────────────────────────────
   3. RESPONSIVE IMAGE OPTIMIZATION
   ──────────────────────────────────────────────────────────── */

/**
 * Generate srcSet for responsive images
 * @param basePath - Base path without extension
 * @param sizes - Image sizes to generate
 * @example
 *   generateSrcSet('/image', [400, 800, 1200])
 *   // Returns: '/image-400.jpg 400w, /image-800.jpg 800w, ...'
 */
export const generateSrcSet = (basePath: string, sizes: number[]): string => {
  return sizes
    .map((size) => `${basePath}-${size}w.jpg ${size}w`)
    .join(', ');
};

/* ────────────────────────────────────────────────────────────
   4. REQUEST IDLE CALLBACK PRELOADING
   ──────────────────────────────────────────────────────────── */

/**
 * Preload component in browser idle time
 * Ideal for below-fold components or next-route resources
 * @param componentPath - Dynamic import path
 * @param fallbackDelay - Fallback delay if requestIdleCallback not supported
 */
export const preloadComponentIdle = (
  componentPath: string,
  fallbackDelay: number = 2000
): void => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import(componentPath).catch((err) => {
        console.warn(`Failed to preload component: ${componentPath}`, err);
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      import(componentPath).catch((err) => {
        console.warn(`Failed to preload component (fallback): ${componentPath}`, err);
      });
    }, fallbackDelay);
  }
};

/**
 * Preload multiple components in idle time
 * @param paths - Array of dynamic import paths
 */
export const preloadComponentsIdle = (paths: string[]): void => {
  paths.forEach((path) => preloadComponentIdle(path));
};

/* ────────────────────────────────────────────────────────────
   5. INTERSECTION OBSERVER FOR COMPONENTS
   ──────────────────────────────────────────────────────────── */

/**
 * Hook to detect when a component enters viewport
 * Useful for triggering data loading, analytics, etc.
 */
export const useIntersectionObserver = (
  ref: RefObject<HTMLElement>,
  callback?: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setIsVisible(entry.isIntersecting);
      callback?.(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, [ref, callback, options]);

  return isVisible;
};

/* ────────────────────────────────────────────────────────────
   6. IMAGE PERFORMANCE METRICS
   ──────────────────────────────────────────────────────────── */

/**
 * Hook to measure image loading performance
 * Useful for debugging and performance monitoring
 */
export const useImagePerformance = (src: string) => {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    size: number;
    naturalWidth: number;
    naturalHeight: number;
  } | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    const img = new Image();

    img.onload = () => {
      const loadTime = performance.now() - startTime;
      setMetrics({
        loadTime,
        size: img.naturalWidth * img.naturalHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });
    };

    img.src = src;
  }, [src]);

  return metrics;
};

/* ────────────────────────────────────────────────────────────
   7. LAZY COMPONENT WITH FALLBACK
   ──────────────────────────────────────────────────────────── */

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

const SkeletonImage: FC<{ className?: string }> = ({ className }) => (
  <div className={`loading-skeleton ${className ?? ''}`} />
);

export const LazyImage: FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  sizes,
  loading = 'lazy',
}) => {
  const { ref, isVisible } = useImageLazyLoad();

  return (
    <div className="lazy-image-container">
      {!isVisible && placeholder && <img src={placeholder} alt={alt} className={className} />}
      {isVisible && (
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={className}
          loading={loading}
          decoding="async"
          sizes={sizes}
        />
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   END - imageOptimization.tsx
   ──────────────────────────────────────────────────────────── */
