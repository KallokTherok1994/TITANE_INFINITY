const ZOOM_STORAGE_KEY = 'titane_zoom_level';

export const BASE_ZOOM_SCALE = 0.75;
export const MIN_ZOOM_SCALE = 0.5;
export const MAX_ZOOM_SCALE = 2;

const roundZoomScale = (scale: number): number =>
  Math.round(scale * 1000) / 1000;

export const clampZoomScale = (scale: number): number =>
  roundZoomScale(Math.min(MAX_ZOOM_SCALE, Math.max(MIN_ZOOM_SCALE, scale)));

export const parseZoomScale = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const numeric = Number.parseFloat(trimmed);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  const isPercentage = trimmed.endsWith('%') || numeric > 5;
  return clampZoomScale(isPercentage ? numeric / 100 : numeric);
};

export const formatZoomScale = (scale: number): string => {
  const normalized = clampZoomScale(scale);
  return Number.isInteger(normalized) ? String(normalized) : String(normalized);
};

export const getStoredZoomScale = (): number | null => {
  try {
    return parseZoomScale(window.localStorage.getItem(ZOOM_STORAGE_KEY));
  } catch {
    return null;
  }
};

export const readCurrentZoomScale = (): number => {
  if (typeof document === 'undefined') {
    return BASE_ZOOM_SCALE;
  }

  const root = document.documentElement;

  const inlineScale = parseZoomScale(root.style.zoom);
  if (inlineScale !== null) {
    return inlineScale;
  }

  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    const computedScale = parseZoomScale(window.getComputedStyle(root).zoom);
    if (computedScale !== null) {
      return computedScale;
    }
  }

  return getStoredZoomScale() ?? BASE_ZOOM_SCALE;
};

export const applyZoomScale = (scale: number): number => {
  const normalized = clampZoomScale(scale);

  if (typeof document !== 'undefined') {
    document.documentElement.style.zoom = formatZoomScale(normalized);
  }

  try {
    window.localStorage.setItem(ZOOM_STORAGE_KEY, formatZoomScale(normalized));
  } catch {
    // Ignore storage failures - zoom still applies inline.
  }

  return normalized;
};

export const mapTauriZoomLevelToScale = (level: number): number =>
  clampZoomScale(BASE_ZOOM_SCALE * level);
