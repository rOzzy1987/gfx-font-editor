import { type ICppVariableDefinition } from './CppModel';

enum CppBlockType {
    UNPROCESSED,
    PREPROCESSOR,
    BLOCKCOMMENT,
    COMMENT
}

interface IBlock {
    type: number;
    raw: string;
}

export class CppParser {
    private static slCommentPattern = /(\/\/(?:.*)(?:\n|$))/gm;
    private static mlCommentPattern = /(\/\*(?:(?:.|\n)*?)\*\/)/gm;
    private static defineNumberPattern = /(?:\n|^)(?:\s*)#define(?:\s+)([a-zA-Z0-9_]+)(?:\s+)([0-9]+)(?:\s*)(?:\n|$)/gm;
    private static preprocessPattern = /((?:\n|^)#(?:.*?)(?:\n|$))/gm;
    private static progmemPattern = /(?:progmem|PROGMEM)/gm;
    private static variablePattern =
        /((?:unsigned(?:\s+))?[a-zA-Z0-9_]+(?:\*?))(?:\s+)((?:\*?)(?:[a-zA-Z0-9_]+))(?:(?:\s*)(\[(?:[0-9]*)\]))?(?:\s*)=/gm;
    // /([a-zA-Z0-9_]+(?:\*?))(?:\s+)((?:\*?)(?:[a-zA-Z0-9_]+))(?:(?:\s*)(\[(?:[0-9]*)\]))?(?:\s*)=/gm

    parse(input: string): ICppVariableDefinition[] {
        let blocks = [{ raw: input, type: CppBlockType.UNPROCESSED }];
        blocks = this.cutBlocksRegex(blocks, CppParser.mlCommentPattern, CppBlockType.BLOCKCOMMENT);
        blocks = this.cutBlocksRegex(blocks, CppParser.slCommentPattern, CppBlockType.COMMENT);

        const defines: ICppVariableDefinition[] = [];
        for (const b of blocks) {
            let m: RegExpExecArray | null;
            do {
                m = CppParser.defineNumberPattern.exec(b.raw);
                if (m != null) {
                    defines.push({
                        isDefine: true,
                        isArray: false,
                        isConst: true,
                        isPointer: false,
                        isProgMem: false,
                        isExtern: false,
                        name: m[1],
                        value: Number(m[2]),
                        rawValue: m[2],
                        rawType: '#define'
                    });
                }
            } while (m != null);
            CppParser.defineNumberPattern.lastIndex = 0;
        }

        blocks = this.cutBlocksRegex(blocks, CppParser.preprocessPattern, CppBlockType.PREPROCESSOR);
        blocks = blocks.filter((b) => b.type == CppBlockType.UNPROCESSED);

        let code = '';
        for (const b of blocks) {
            code += b.raw;
        }

        const statements = code
            .split(';')
            .filter((s) => s.trim() != '')
            .map(CppParser.parseStatement)
            .filter((vd) => vd != null)
            .concat(defines);

        return statements;
    }

    private static parseStatement(stmt: string): ICppVariableDefinition | null {
        stmt = stmt.trim();
        const result: any = {};

        let m: RegExpExecArray | null = CppParser.progmemPattern.exec(stmt);
        if (m != null && m.length > 0) {
            stmt = stmt.replace(m[0], ' ').trim();
            result.isProgMem = true;
        } else result.isProgMem = false;
        CppParser.progmemPattern.lastIndex = 0;

        result.isConst = stmt.startsWith('const ');
        if (result.isConst) {
            stmt = stmt.substring(5).trim();
            stmt = stmt.replace(' const ', '');
        }

        m = CppParser.variablePattern.exec(stmt);
        CppParser.variablePattern.lastIndex = 0;
        if (m == null || m?.length == 0) {
            return null;
        }
        result.isArray = m[3] != undefined;
        result.rawType = m[1];
        result.name = m[2];

        if (result.rawType.indexOf('*')) result.isPointer = true;
        else if (result.name.indexOf('*')) {
            result.isPointer = true;
            result.rawType += '*';
            result.name = result.name.substring(1);
        } else result.isPointer = false;

        stmt = stmt.substring(m[0].length).trim();

        result.rawValue = stmt;

        CppParser.parseValue(result);

        return result;
    }

    private static parseValue(item: ICppVariableDefinition) {
        item.value = this.parseValExpr(item.rawValue);
    }
    private static parseValExpr(v: string): any {
        v = v.trim();
        if (v.startsWith('{') && v.endsWith('}')) {
            v = v.substring(1, v.length - 1);
            const ii = v.split(',');
            const oi = [];
            for (let i = 0; i < ii.length; i++) {
                if (ii[i].indexOf('{') >= 0) {
                    let sv = '';
                    do {
                        sv += ii[i] + ',';
                        i++;
                    } while (
                        sv.split('').filter((c) => c == '}').length < sv.split('').filter((c) => c == '{').length &&
                        i <= ii.length
                    );
                    oi.push(sv.substring(0, sv.length - 1));
                    i--;
                } else oi.push(ii[i]);
            }
            return oi
                .map((x) => x.trim())
                .filter((x) => x != '')
                .map(CppParser.parseValExpr);
        }
        if (
            /^0x(?:[a-fA-F0-9]+)$/gm.test(v) ||
            /^0b(?:(?:0|1)+)$/gm.test(v) ||
            /^-?([0-9]+\.)?[0-9]+(d|lf|m)?$/gm.test(v) ||
            /^true|false$/gm.test(v)
        ) {
            return eval(v);
        }
        const m = /^(\(\s*[a-zA-Z_0-9_]+\s*(?:\*\s*)?\))\s*([a-zA-Z0-9_]+)$/gm.exec(v);
        if (m != null) {
            return { variableName: m[2], cast: m[1] };
        }
        return v;
    }

    cutBlocksRegex(blocks: IBlock[], pattern: RegExp, type: CppBlockType): IBlock[] {
        const result = [];
        let m: RegExpExecArray | null;

        for (const b of blocks) {
            if (b.type == CppBlockType.UNPROCESSED) {
                let raw = b.raw;
                do {
                    m = pattern.exec(raw);
                    pattern.lastIndex = 0;
                    if (m != null) {
                        const i = m.index;
                        result.push({ raw: raw.substring(0, i), type: CppBlockType.UNPROCESSED });
                        result.push({ raw: m[1], type: type });
                        raw = raw.substring(i + m[1].length);
                    }
                } while (m != null);
                result.push({ raw, type: CppBlockType.UNPROCESSED });
            } else {
                result.push(b);
            }
        }

        return result.filter((b) => b.raw.trim() != '');
    }
}
