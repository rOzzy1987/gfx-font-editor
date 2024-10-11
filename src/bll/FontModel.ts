export interface IGlyph {
    bitmap: number[][];
    char: string;
    charCode: number;
    rows: number;
    cols: number;
    base: number;
    xOffset: number;
    xAdvance: number;
}

export interface IFont {
    name?: string;
    firstChar: number;
    lastChar: number;
    glyphs: IGlyph[];
    height: number;
}

export interface ISavedFont {
    name: string;
    date: number;
    font: IFont;
}

export class Glyph {
    bitmap: number[][] = [];
    char: string = ' ';
    charCode: number = 32;
    rows: number = 0;
    cols: number = 0;
    base: number = 0;
    xOffset: number = 0;
    xAdvance: number = 0;

    public constructor(glyph: IGlyph | null = null) {
        if (glyph == null) return;
        this.bitmap = glyph.bitmap;
        this.char = glyph.char;
        this.charCode = glyph.charCode;
        this.cols = glyph.cols;
        this.rows = glyph.rows;
        this.base = glyph.base;
        this.xOffset = glyph.xOffset;
        this.xAdvance = glyph.xAdvance;
    }
}

export class Font {
    name?: string | undefined;
    firstChar: number = 32;
    lastChar: number = 32;
    glyphs: Glyph[] = [new Glyph()];
    height: number = 12;

    public constructor(font: IFont | null = null) {
        if (font == null) return;
        this.name = font.name;
        this.firstChar = font.firstChar;
        this.lastChar = font.lastChar;
        this.glyphs = font.glyphs.map((g) => new Glyph(g));
        this.height = font.height;
    }
}
