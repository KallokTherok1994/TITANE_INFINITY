/**
 * TITANE∞ v26.2.0 — LazyImage Component (Titanium Dark)
 * Lazy-loaded image with Titanium Dark design system
 * Optimizes performance with Intersection Observer
 * @license MIT
 */

import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

export interface LazyImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'placeholder'
> {
  src: string;
  alt: string;
  placeholder?: string;
  rootMargin?: string;
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * LazyImage Component - Image Optimization
 *
 * Features:
 * - Intersection Observer lazy-loading
 * - Native loading="lazy" fallback
 * - Blur-up placeholder transition
 * - Async decoding (non-blocking)
 * - Titanium Dark placeholder
 *
 * Usage:
 * ```tsx
 * <LazyImage
 *   src="/assets/screenshot.png"
 *   alt="Dashboard view"
 *   width={1920}
 *   height={1080}
 *   className="rounded-lg"
 * />
 * ```
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%231a1a1a'/%3E%3C/svg%3E",
  className = '',
  width,
  height,
  rootMargin = '50px',
  threshold = 0.01,
  onLoad,
  onError,
  ...restProps
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Intersection Observer for lazy-loading
    if (!imgRef.current) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load image immediately
      setImageSrc(src);
      return;
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Image visible in viewport → load
            setImageSrc(src);

            // Disconnect observer after loading
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin, // Load 50px before scroll (UX anticipation)
        threshold, // Trigger when 1% visible
      }
    );

    observerRef.current.observe(imgRef.current);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, rootMargin, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`
        transition-opacity duration-300
        ${isLoaded ? 'opacity-100' : 'opacity-50'}
        ${hasError ? 'border-2 border-error-500' : ''}
        ${className}
      `}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy" // Native lazy-loading fallback (97%+ support)
      decoding="async" // Async decode (non-blocking main thread)
      {...restProps}
    />
  );
};

LazyImage.displayName = 'LazyImage';

export default LazyImage;
