declare module 'fontkit' {
  export interface Glyph {
    id: number;
    advanceWidth: number;
    advanceHeight?: number;
    bbox?: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    };
  }

  export interface Font {
    familyName: string;
    subfamilyName: string;
    postscriptName: string;
    unitsPerEm: number;
    ascent: number;
    descent: number;
    lineGap: number;
    bbox: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    };
    numGlyphs: number;
    hasGlyphForCodePoint(codePoint: number): boolean;
    glyphForCodePoint(codePoint: number): Glyph;
    fonts?: Font[];
  }

  export interface FontCollection {
    fonts: Font[];
  }

  export function openSync(filename: string, postscriptName?: string): Font | FontCollection;
  export function open(
    filename: string,
    postscriptName?: string,
    callback?: (err: Error | null, font: Font | FontCollection) => void
  ): Promise<Font | FontCollection>;
  export function create(buffer: Buffer, postscriptName?: string): Font | FontCollection;
}
