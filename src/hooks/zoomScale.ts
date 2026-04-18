const ZOOM_STORAGE_KEY = 'titane_zoom_level';
const ZOOM_CSS_VAR = '--titane-ui-scale';
export const ZOOM_SCALE_CHANGED_EVENT = 'titane:zoom-scale-changed';
const ROOT_FONT_SIZE_PX = 16;

export const BASE_ZOOM_SCALE = 1;
export const MIN_ZOOM_SCALE = 0.5;
export const MAX_ZOOM_SCALE = 2;
export const ZOOM_SCALE_STEP = 0.1;

const roundZoomScale = (scale: number): number => Math.round(scale * 1000) / 1000;

export const clampZoomScale = (scale: number): number =>
  roundZoomScale(Math.min(MAX_ZOOM_SCALE, Math.max(MIN_ZOOM_SCALE, scale)));

export const stepZoomScale = (currentScale: number, direction: 1 | -1): number =>
  clampZoomScale(currentScale + direction * ZOOM_SCALE_STEP);

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

const parseFontSizeScale = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }

  const numeric = Number.parseFloat(value.trim());
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return clampZoomScale(numeric / ROOT_FONT_SIZE_PX);
};

export const readCurrentZoomScale = (): number => {
  if (typeof document === 'undefined') {
    return BASE_ZOOM_SCALE;
  }

  const root = document.documentElement;

  const inlineCssVarScale = parseZoomScale(root.style.getPropertyValue(ZOOM_CSS_VAR));
  if (inlineCssVarScale !== null) {
    return inlineCssVarScale;
  }

  const inlineFontSizeScale = parseFontSizeScale(root.style.fontSize);
  if (inlineFontSizeScale !== null) {
    return inlineFontSizeScale;
  }

  const inlineScale = parseZoomScale(root.style.zoom);
  if (inlineScale !== null) {
    return inlineScale;
  }

  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    const computedStyle = window.getComputedStyle(root);
    const computedCssVarScale = parseZoomScale(
      computedStyle.getPropertyValue(ZOOM_CSS_VAR)
    );
    if (computedCssVarScale !== null) {
      return computedCssVarScale;
    }

    const computedFontSizeScale = parseFontSizeScale(computedStyle.fontSize);
    if (computedFontSizeScale !== null) {
      return computedFontSizeScale;
    }

    const computedScale = parseZoomScale(computedStyle.zoom);
    if (computedScale !== null) {
      return computedScale;
    }
  }

  return getStoredZoomScale() ?? BASE_ZOOM_SCALE;
};

const syncZoomCssVariable = (scale: number): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.style.setProperty(ZOOM_CSS_VAR, formatZoomScale(scale));
};

const dispatchZoomScaleChanged = (scale: number): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ZOOM_SCALE_CHANGED_EVENT, {
      detail: { scale },
    })
  );
};

export const applyZoomScale = (scale: number): number => {
  const normalized = clampZoomScale(scale);

  if (typeof document !== 'undefined') {
    document.documentElement.style.removeProperty('zoom');
    document.documentElement.style.fontSize = `${ROOT_FONT_SIZE_PX * normalized}px`;
    syncZoomCssVariable(normalized);
  }

  try {
    window.localStorage.setItem(ZOOM_STORAGE_KEY, formatZoomScale(normalized));
  } catch {
    // Ignore storage failures - zoom still applies inline.
  }

  dispatchZoomScaleChanged(normalized);

  return normalized;
};

export const mapTauriZoomLevelToScale = (level: number): number =>
  clampZoomScale(BASE_ZOOM_SCALE * level);

export const getZoomCssVariableName = (): string => ZOOM_CSS_VAR;
