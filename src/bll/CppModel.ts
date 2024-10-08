export interface ICppVariableDefinition {
    name: string;
    rawType: string;
    isProgMem: boolean;
    isConst: boolean;
    isArray: boolean;
    isPointer: boolean;
    isDefine: boolean;
    isExtern: boolean;
    value: any;
    rawValue: string;
}

export interface ICppVariableReference {
    cast: string | null;
    variableName: string;
}

export function isCppVariableReference(obj: any): obj is ICppVariableReference {
    return typeof obj == 'object' && 'variableName' in obj;
}

export interface ICppFile {}
