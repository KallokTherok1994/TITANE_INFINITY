/**
 * TITANE∞ - Design Center contrast utilities
 * Ensures readable foreground text colors against dynamic backgrounds.
 */

type RGB = { r: number; g: number; b: number };

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseHexColor(input: string): RGB | null {
  const value = input.trim();
  const shortHex = /^#([0-9a-fA-F]{3,4})$/;
  const longHex = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/;

  const shortMatch = value.match(shortHex);
  if (shortMatch) {
    const raw = shortMatch[1] ?? '';
    if (raw.length < 3) return null;
    return {
      r: parseInt(`${raw[0]}${raw[0]}`, 16),
      g: parseInt(`${raw[1]}${raw[1]}`, 16),
      b: parseInt(`${raw[2]}${raw[2]}`, 16),
    };
  }

  const longMatch = value.match(longHex);
  if (longMatch) {
    const raw = longMatch[1] ?? '';
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16),
    };
  }

  return null;
}

function parseRgbColor(input: string): RGB | null {
  const value = input.trim();
  const rgbPattern = /^rgba?\(([^)]+)\)$/i;
  const match = value.match(rgbPattern);
  if (!match) return null;

  const channels = (match[1] ?? '')
    .split(',')
    .map(part => Number.parseFloat(part.trim()))
    .filter(num => Number.isFinite(num));

  if (channels.length < 3) return null;

  return {
    r: clampByte(channels[0] ?? 0),
    g: clampByte(channels[1] ?? 0),
    b: clampByte(channels[2] ?? 0),
  };
}

function parseColor(input: string): RGB | null {
  return parseHexColor(input) ?? parseRgbColor(input);
}

function toLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(color: RGB): number {
  return 0.2126 * toLinear(color.r) + 0.7152 * toLinear(color.g) + 0.0722 * toLinear(color.b);
}

export function contrastRatio(foreground: string, background: string): number {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) {
    return 1;
  }

  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function pickReadableTextColor(background: string): string {
  const light = '#ffffff';
  const dark = '#111111';
  return contrastRatio(light, background) >= contrastRatio(dark, background) ? light : dark;
}

export function ensureReadableTextColor(
  preferredText: string,
  background: string,
  minContrast = 4.5
): string {
  if (contrastRatio(preferredText, background) >= minContrast) {
    return preferredText;
  }
  return pickReadableTextColor(background);
}

export function ensureReadableTextColorForBackgrounds(
  preferredText: string,
  backgrounds: string[],
  minContrast = 4.5
): string {
  const validBackgrounds = backgrounds.filter(bg => parseColor(bg) !== null);
  if (validBackgrounds.length === 0) {
    return preferredText;
  }

  const minRatioFor = (candidate: string): number =>
    validBackgrounds.reduce((min, background) => {
      const ratio = contrastRatio(candidate, background);
      return Math.min(min, ratio);
    }, Number.POSITIVE_INFINITY);

  if (parseColor(preferredText) && minRatioFor(preferredText) >= minContrast) {
    return preferredText;
  }

  const candidates = Array.from(
    new Set([
      ...validBackgrounds.map(background => pickReadableTextColor(background)),
      '#ffffff',
      '#111111',
    ])
  );

  let best = candidates[0] ?? '#111111';
  let bestScore = minRatioFor(best);

  for (const candidate of candidates.slice(1)) {
    const score = minRatioFor(candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}
