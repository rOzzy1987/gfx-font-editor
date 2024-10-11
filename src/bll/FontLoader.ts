import { isCppVariableReference, type ICppVariableDefinition } from './CppModel';
import { CppParser } from './CppParser';
import { type IFont, type IGlyph } from './FontModel';

export class FontLoader {
    loadCpp(input: string): IFont {
        const parser = new CppParser();
        const vars = parser.parse(input);

        if (vars.filter((s) => s.rawType == 'GFXfont').length > 0) {
            return this.loadGfx(vars);
        }
        throw 'Parsing failed! Are you sure it is an Adafruit GFX font?';
    }

    private loadGfx(vars: ICppVariableDefinition[]): IFont {
        const fontDef = vars.filter((s) => s.rawType == 'GFXfont')[0];

        if (!Array.isArray(fontDef.value)) throw 'Font definition parse error!';

        const glyphArr = isCppVariableReference(fontDef.value[1])
            ? (vars.find((v) => v.name == fontDef.value[1].variableName)?.value ?? [])
            : fontDef.value[1];

        if (!Array.isArray(glyphArr)) throw 'Glyph definition parse error!';
        const bitmap = isCppVariableReference(fontDef.value[0])
            ? (vars.find((v) => v.name == fontDef.value[0].variableName)?.value ?? [])
            : fontDef.value[0];

        if (!Array.isArray(glyphArr)) throw 'Glyph definition parse error!';
        if (!Array.isArray(bitmap)) throw 'Bitmap definition parse error!';

        const firstChar = Number(fontDef.value[2]);
        const lastChar = Number(fontDef.value[3]);
        const glyphs = [];
        for (let i = firstChar, j = 0; i <= lastChar; i++, j++) {
            glyphs.push(this.getGfxGlyph(i, glyphArr[j], bitmap));
        }

        return {
            name: fontDef.name,
            firstChar: Number(fontDef.value[2]),
            lastChar: Number(fontDef.value[3]),
            glyphs: glyphs.filter((g) => (g.cols > 0 && g.rows > 0) || g.xAdvance > 0),
            height: Number(fontDef.value[4])
        };
    }

    private getGfxGlyph(i: number, arr: any, src: any[]): IGlyph {
        if (!Array.isArray(arr)) throw 'Glyph parse error: ' + arr;

        const result = {
            bitmap: [] as number[][],
            char: String.fromCharCode(Number(i)),
            charCode: Number(i),
            cols: Number(arr[1]),
            rows: Number(arr[2]),
            xAdvance: Number(arr[3]),
            xOffset: Number(arr[4]),
            base: Number(arr[5])
        };

        const bmp = [] as number[][];
        const start = Number(arr[0]);
        for (let row = 0, bit = 0; row < result.rows; row++) {
            bmp.push([]);
            for (let col = 0; col < result.cols; col++, bit++) {
                bmp[row].push((Number(src[start + Math.floor(bit / 8)]) >> (7 - (bit % 8))) & 1);
            }
        }

        result.bitmap = bmp;
        return result;
    }
}

const Loader = new FontLoader();

export default Loader;
