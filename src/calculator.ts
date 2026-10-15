import * as fontkit from 'fontkit';
import { SYSTEM_FONTS, CHAR_WEIGHTS, FontMetrics, SystemFallbackName } from './metrics';

export interface FallbackCSSOptions {
  fontPath: string;
  customFontUrl?: string;
  fallbackFont?: SystemFallbackName;
  fallbackName?: string;
}

export interface CalculatedOverrides {
  fontFamily: string;
  fallbackName: string;
  localSrc: string;
  sizeAdjust: string;
  ascentOverride: string;
  descentOverride: string;
  lineGapOverride: string;
  css: string;
}

/**
 * Extracts raw OpenType/WOFF2 metrics from a font file on disk
 */
export function extractFontMetrics(fontPath: string): FontMetrics {
  const font = fontkit.openSync(fontPath);
  if ('fonts' in font) {
    throw new Error('Font collections (TTC) are not supported directly. Provide a single TTF/OTF/WOFF2.');
  }

  let weightedWidthSum = 0;
  let totalWeight = 0;

  for (const [char, weight] of Object.entries(CHAR_WEIGHTS)) {
    const codePoint = char.codePointAt(0)!;
    if (font.hasGlyphForCodePoint(codePoint)) {
      const glyph = font.glyphForCodePoint(codePoint);
      weightedWidthSum += glyph.advanceWidth * weight;
      totalWeight += weight;
    }
  }

  const xWidthAvg = totalWeight > 0 ? weightedWidthSum / totalWeight : font.unitsPerEm * 0.5;

  return {
    familyName: font.familyName,
    unitsPerEm: font.unitsPerEm,
    ascent: font.ascent,
    descent: font.descent,
    lineGap: font.lineGap,
    xWidthAvg,
  };
}

/**
 * Pure mathematical calculation of CSS overrides from two FontMetrics objects
 */
export function computeOverridesFromMetrics(
  target: FontMetrics,
  fallbackFont: SystemFallbackName = 'Arial',
  customFallbackName?: string,
  customFontUrl?: string
): CalculatedOverrides {
  const fallback = SYSTEM_FONTS[fallbackFont];
  const fallbackName = customFallbackName || `${target.familyName} Fallback`;

  // Normalize character widths to 1 em unit
  const targetNormalizedWidth = target.xWidthAvg / target.unitsPerEm;
  const fallbackNormalizedWidth = fallback.xWidthAvg / fallback.unitsPerEm;

  // size-adjust scales the fallback font horizontally so characters occupy identical width
  const sizeAdjustRatio = targetNormalizedWidth / fallbackNormalizedWidth;
  const sizeAdjustPct = (sizeAdjustRatio * 100).toFixed(2) + '%';

  // Vertical overrides must be divided by sizeAdjustRatio so vertical height stays locked
  const adjustedEm = target.unitsPerEm * sizeAdjustRatio;
  const ascentPct = ((Math.abs(target.ascent) / adjustedEm) * 100).toFixed(2) + '%';
  const descentPct = ((Math.abs(target.descent) / adjustedEm) * 100).toFixed(2) + '%';
  const lineGapPct = ((Math.abs(target.lineGap) / adjustedEm) * 100).toFixed(2) + '%';

  const primaryFontRule = customFontUrl
    ? `@font-face {
  font-family: '${target.familyName}';
  src: url('${customFontUrl}') format('woff2');
  font-display: swap;
}\n\n`
    : '';

  const css = `${primaryFontRule}@font-face {
  font-family: '${fallbackName}';
  src: local('${fallback.familyName}');
  size-adjust: ${sizeAdjustPct};
  ascent-override: ${ascentPct};
  descent-override: ${descentPct};
  line-gap-override: ${lineGapPct};
}

:root {
  --font-${target.familyName.toLowerCase().replace(/\s+/g, '-')}: '${target.familyName}', '${fallbackName}', sans-serif;
}`;

  return {
    fontFamily: target.familyName,
    fallbackName,
    localSrc: fallback.familyName,
    sizeAdjust: sizeAdjustPct,
    ascentOverride: ascentPct,
    descentOverride: descentPct,
    lineGapOverride: lineGapPct,
    css,
  };
}

/**
 * High-level helper to generate zero-CLS CSS directly from a font file path
 */
export function generateZeroClsCss(options: FallbackCSSOptions): CalculatedOverrides {
  const metrics = extractFontMetrics(options.fontPath);
  return computeOverridesFromMetrics(
    metrics,
    options.fallbackFont || 'Arial',
    options.fallbackName,
    options.customFontUrl
  );
}
