export interface FontMetrics {
  familyName: string;
  unitsPerEm: number;
  ascent: number;
  descent: number;
  lineGap: number;
  xWidthAvg: number; // Weighted average width of lowercase a-z and space
}

export type SystemFallbackName = 'Arial' | 'Times New Roman' | 'Courier New' | 'Roboto';

export const SYSTEM_FONTS: Record<SystemFallbackName, FontMetrics> = {
  Arial: {
    familyName: 'Arial',
    unitsPerEm: 2048,
    ascent: 1854,
    descent: -434,
    lineGap: 67,
    xWidthAvg: 954,
  },
  'Times New Roman': {
    familyName: 'Times New Roman',
    unitsPerEm: 2048,
    ascent: 1825,
    descent: -443,
    lineGap: 87,
    xWidthAvg: 858,
  },
  'Courier New': {
    familyName: 'Courier New',
    unitsPerEm: 2048,
    ascent: 1705,
    descent: -615,
    lineGap: 0,
    xWidthAvg: 1229,
  },
  Roboto: {
    familyName: 'Roboto',
    unitsPerEm: 2048,
    ascent: 1900,
    descent: -500,
    lineGap: 0,
    xWidthAvg: 961,
  },
};

// Standard English letter frequency weights for accurate paragraph width matching
export const CHAR_WEIGHTS: Record<string, number> = {
  ' ': 0.1828, e: 0.1026, t: 0.0751, a: 0.0653, o: 0.0615, i: 0.0566,
  n: 0.0571, s: 0.0531, r: 0.0498, h: 0.0498, l: 0.0331, d: 0.0328,
  c: 0.0223, u: 0.0227, m: 0.0202, f: 0.0198, p: 0.015, g: 0.0162,
  w: 0.017, y: 0.0142, b: 0.0125, v: 0.0079, k: 0.0056, x: 0.0014,
  j: 0.0009, q: 0.0008, z: 0.0005,
};
