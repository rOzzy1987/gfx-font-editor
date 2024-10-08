import { isCppVariableReference, type ICppVariableDefinition } from './CppModel';

export class CppGenerator {
    generate(defs: ICppVariableDefinition[]): string {
        let cpp = '';
        for (const v of defs) {
            cpp += this.generateVar(v);
        }
        return cpp;
    }

    private generateVar(v: ICppVariableDefinition) {
        const dec = this.generateDeclaration(v);
        const val = this.generateVal(v.value);

        return dec.replace('{{value}}', val);
    }

    generateDeclaration(v: ICppVariableDefinition) {
        if (v.isDefine) return `\n#define ${v.name} `;

        let dec = '';
        if (v.isExtern) dec += 'extern ';
        if (v.isConst) dec += 'const ';
        dec += v.rawType + (v.isPointer ? ' *' : ' ');
        dec += v.name + (v.isArray ? '[] ' : ' ');
        if (v.isProgMem) dec += 'PROGMEM ';

        return `\n\n${dec} = {{value}};`;
    }

    generateVal(v: any, isHex: boolean = false): string {
        if (v === null) return 'NULL';
        if (typeof v == 'boolean') return v ? '1' : '0';
        if (typeof v == 'number') return isHex ? '0x' + v.toString(16).padStart(2, '0') : v.toFixed(0);
        if (isCppVariableReference(v)) {
            return (v.cast != null && v.cast.trim() != '' ? `(${v.cast}) ` : '') + v.variableName;
        }
        if (Array.isArray(v)) {
            const strv = v.map((v2) => this.generateVal(v2, isHex)).join(', ');
            return `{ ${strv} }`;
        }
        return `"${v}"`;
    }
}
