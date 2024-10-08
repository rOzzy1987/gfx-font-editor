import { CppGenerator } from './CppGenerator';
import { Glyph, type IFont, type IGlyph } from './FontModel';

interface IGlyphWithCommonBitmap extends IGlyph {
    bytesOffset: number;
}

interface IBitmapMergeResult {
    glyphs: IGlyphWithCommonBitmap[];
    bytes: number[];
}

export default class GfxFontExporter {
    export(font: IFont) {
        let cpp = `
/////////
// ${font.name ?? 'GfxFont'}

#pragma once
#include <Adafruit_GFX.h>
#include <Arduino.h>
`;
        this.ensureGlyphs(font);
        const mergeResult = this.mergeBitmaps(font);
        const fontName = this.sanitizeName(font.name);

        const gen = new CppGenerator();
        const bmpVar = {
            name: fontName + '_Bitmap',
            isArray: true,
            rawType: 'uint8_t',
            isConst: true,
            isPointer: false,
            isProgMem: true,
            isExtern: false,
            isDefine: false,
            rawValue: '',
            value: 0
        };

        let bmpData = '{\n';
        const bmpArr = mergeResult.bytes.filter((_) => true);
        for (let i = 0; i < mergeResult.bytes.length; i += 16) {
            const bmpRow = bmpArr.splice(0, 16);
            bmpData += `    ${bmpRow.map((v) => gen.generateVal(v, true)).join(', ')},\n`;
        }
        bmpData += `} // ${mergeResult.bytes.length} bytes`;
        cpp += gen.generateDeclaration(bmpVar).replace('{{value}}', bmpData);

        const glyphVar = {
            name: fontName + '_Glyphs',
            isArray: true,
            rawType: 'GFXglyph',
            isConst: true,
            isPointer: false,
            isProgMem: true,
            isExtern: false,
            isDefine: false,
            rawValue: '',
            value: 0
        };

        const glyphData =
            '{\n    ' +
            mergeResult.glyphs
                .map(
                    (g) =>
                        (gen.generateVal([g.bytesOffset, g.cols, g.rows, g.xAdvance, g.xOffset, g.base]) + ',').padEnd(
                            36,
                            ' '
                        ) +
                        `// char '${String.fromCharCode(g.charCode)}' 0x${g.charCode.toString(16).toUpperCase()} (${g.charCode})`
                )
                .join('\n    ') +
            '\n}';
        cpp += gen.generateDeclaration(glyphVar).replace('{{value}}', glyphData);

        cpp += gen.generate([
            {
                name: fontName,
                isArray: false,
                rawType: 'GFXfont',
                isConst: true,
                isPointer: false,
                isProgMem: true,
                isExtern: false,
                isDefine: false,
                rawValue: '',
                value: [
                    { variableName: fontName + '_Bitmap', cast: 'uint8_t*' },
                    { variableName: fontName + '_Glyphs', cast: 'GFXglyph*' },
                    font.firstChar,
                    font.lastChar,
                    font.height
                ]
            }
        ]);

        return cpp;
    }

    private sanitizeName(name: string | undefined) {
        name = name == undefined || name.trim() == '' ? 'gfxFont' : name?.trim();
        name = name.replace(/[^a-zA-Z0-9_]/g, '_');
        let temp = '';
        while (temp != name) {
            temp = name;
            name = name?.replace('__', '_');
        }
        return name;
    }

    private mergeBitmaps(font: IFont): IBitmapMergeResult {
        const gls = font.glyphs.sort((a, b) => a.charCode - b.charCode);
        let result: number[] = [];
        const glsResult: IGlyphWithCommonBitmap[] = [];

        for (const g of gls) {
            if (g.cols <= 0 || g.rows <= 0) {
                g.cols = 0;
                g.rows = 0;
                g.bitmap = [];
            }

            const flatSrc: number[] = [];
            let ri = 0; // result index
            let si = 0; // source index

            // build byte array from bitmap
            for (const r of g.bitmap) {
                for (const c of r) {
                    if (si == 8) {
                        si = 0;
                        ri++;
                    }
                    if (flatSrc.length <= ri) {
                        flatSrc.push(0);
                    }
                    if (c > 0) {
                        flatSrc[ri] |= 1 << (7 - si);
                    }
                    si++;
                }
            }

            const gcb = {
                base: g.base,
                bytesOffset: result.length,
                char: g.char,
                charCode: g.charCode,
                cols: g.cols,
                rows: g.rows,
                xAdvance: g.xAdvance,
                xOffset: g.xOffset,
                bitmap: []
            };

            si = 0;
            for (ri = 0; ri + flatSrc.length - 1 < result.length; ri++) {
                for (si = 0; si < flatSrc.length; si++) {
                    if (result[ri + si] != flatSrc[si]) si = 10000000;
                }
                if (si == flatSrc.length) {
                    // we found a match!
                    gcb.bytesOffset = ri;
                    ri = 10000000;
                }
            }
            if (ri + flatSrc.length - 1 == result.length) {
                // for cycle ended normally, no match found

                gcb.bytesOffset = result.length;
                result = result.concat(flatSrc);
            }
            glsResult.push(gcb);
        }

        return { bytes: result, glyphs: glsResult };
    }

    private ensureGlyphs(font: IFont) {
        let minCode = 10000000;
        let maxCode = 0;
        for (const g of font.glyphs) {
            minCode = Math.min(minCode, g.charCode);
            maxCode = Math.max(maxCode, g.charCode);
        }

        if (minCode > maxCode) {
            font.glyphs = [new Glyph()];
            font.firstChar = font.glyphs[0].charCode;
            font.lastChar = font.glyphs[0].charCode;
            return;
        }

        font.firstChar = minCode;
        font.lastChar = maxCode;

        for (let i = minCode; i <= maxCode; i++) {
            const gs = font.glyphs.filter((g) => g.charCode == i);
            if (gs.length == 0) {
                const ng = new Glyph();
                ng.charCode = i;
                ng.char = String.fromCharCode(i);
                font.glyphs.push(ng);
            } else if (gs.length > 1) {
                gs.splice(0, 1);
                for (const dg of gs) {
                    font.glyphs.splice(font.glyphs.indexOf(dg), 1);
                }
            }
        }
        font.glyphs = font.glyphs.sort((a, b) => a.charCode - b.charCode);
    }
}
