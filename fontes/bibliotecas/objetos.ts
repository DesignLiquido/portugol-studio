import { parseString } from 'xml2js';
import { InterpretadorInterface } from '@designliquido/delegua/interfaces';

type Objeto = { [key: string]: any };

let cacheObjetos: Objeto[] = [];

export const TIPO_INTEIRO = 1;
export const TIPO_CADEIA = 2;
export const TIPO_CARACTER = 3;
export const TIPO_REAL = 4;
export const TIPO_LOGICO = 5;
export const TIPO_OBJETO = 6;
export const TIPO_VETOR = 7;

export async function criar_objeto_via_json(interpretador: InterpretadorInterface, json: string): Promise<number> {
    const obj = JSON.parse(json);
    return cacheObjetos.push(obj) - 1;
}

export async function criar_objeto_via_xml(interpretador: InterpretadorInterface, xml: string): Promise<number> {
    const obj = parseXml(xml);
    const objJSON = JSON.parse(obj);
    return cacheObjetos.push(objJSON) - 1;
}

export async function criar_objeto(): Promise<number> {
    return cacheObjetos.push({}) - 1;
}

export async function atribuir_propriedade(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string,
    valor: any
): Promise<void> {
    cacheObjetos[endereco][propriedade] = valor;
}

export async function obter_propriedade_tipo_inteiro(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string
): Promise<number> {
    const valor = cacheObjetos[endereco][propriedade];
    if (typeof valor !== 'number') {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return valor;
}

export async function obter_propriedade_tipo_real(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string
): Promise<number> {
    const valor = cacheObjetos[endereco][propriedade];
    if (typeof valor !== 'number') {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return valor;
}

export async function obter_propriedade_tipo_logico(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string
): Promise<boolean> {
    const valor = cacheObjetos[endereco][propriedade];
    if (typeof valor !== 'boolean') {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return valor;
}

export async function obter_propriedade_tipo_caracter(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string
): Promise<string> {
    const valor = cacheObjetos[endereco][propriedade];
    if (typeof valor !== 'string' || valor.length !== 1) {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return valor;
}

export async function obter_propriedade_tipo_cadeia(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string
): Promise<string> {
    const valor = cacheObjetos[endereco][propriedade];
    if (typeof valor !== 'string') {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return valor;
}

export async function obter_propriedade_tipo_objeto(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string
): Promise<number> {
    const valor = cacheObjetos[endereco][propriedade];
    if (typeof valor !== 'object' || Array.isArray(valor)) {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return cacheObjetos.push(valor) - 1;
}

export async function obter_propriedade_tipo_objeto_em_vetor(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string,
    indice: number
): Promise<number> {
    const vetor = cacheObjetos[endereco][propriedade];
    validarVetor(vetor, indice, propriedade);
    if (typeof vetor[indice] !== 'object' || vetor[indice] === null) {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return cacheObjetos.push(vetor[indice]) - 1;
}

export async function obter_propriedade_tipo_caracter_em_vetor(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string,
    indice: number
): Promise<string> {
    const vetor = cacheObjetos[endereco][propriedade];
    validarVetor(vetor, indice, propriedade);
    if (typeof vetor[indice] !== 'string' || vetor[indice].length !== 1) {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return vetor[indice];
}

export async function obter_propriedade_tipo_logico_em_vetor(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string,
    indice: number
): Promise<boolean> {
    const vetor = cacheObjetos[endereco][propriedade];
    validarVetor(vetor, indice, propriedade);
    if (typeof vetor[indice] !== 'boolean') {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return vetor[indice];
}

export async function obter_propriedade_tipo_real_em_vetor(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string,
    indice: number
): Promise<number> {
    const vetor = cacheObjetos[endereco][propriedade];
    validarVetor(vetor, indice, propriedade);
    if (typeof vetor[indice] !== 'number' || !Number.isFinite(vetor[indice])) {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return vetor[indice];
}

export async function obter_propriedade_tipo_inteiro_em_vetor(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string,
    indice: number
): Promise<number> {
    const vetor = cacheObjetos[endereco][propriedade];
    validarVetor(vetor, indice, propriedade);
    if (typeof vetor[indice] !== 'number' || !Number.isInteger(vetor[indice])) {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return vetor[indice];
}

export async function obter_propriedade_tipo_cadeia_em_vetor(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string,
    indice: number
): Promise<string> {
    const vetor = cacheObjetos[endereco][propriedade];
    validarVetor(vetor, indice, propriedade);
    if (typeof vetor[indice] !== 'string') {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return vetor[indice];
}

export async function obter_tamanho_vetor_propriedade(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string
): Promise<number> {
    const vetor = cacheObjetos[endereco][propriedade];
    if (!Array.isArray(vetor)) {
        throw new Error(
            '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
        );
    }
    return vetor.length;
}

export async function liberar_objeto(interpretador: InterpretadorInterface, endereco: number): Promise<void> {
    delete cacheObjetos[endereco];
}

export async function obter_json(interpretador: InterpretadorInterface, endereco: number): Promise<string> {
    const objeto = cacheObjetos[endereco];
    if (!objeto) {
        throw new Error('Não foi possível obter o JSON deste objeto.');
    }
    return JSON.stringify(objeto);
}

export async function contem_propriedade(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string
): Promise<boolean> {
    return cacheObjetos[endereco].hasOwnProperty(propriedade);
}

export async function tipo_propriedade(
    interpretador: InterpretadorInterface,
    endereco: number,
    propriedade: string
): Promise<number> {
    const valor = cacheObjetos[endereco][propriedade];
    if (typeof valor === 'string') {
        return valor.length === 1 ? TIPO_CARACTER : TIPO_CADEIA;
    }
    if (typeof valor === 'number') {
        return TIPO_INTEIRO;
    }
    if (typeof valor === 'boolean') {
        return TIPO_LOGICO;
    }
    if (typeof valor === 'object' && !Array.isArray(valor)) {
        return TIPO_OBJETO;
    }
    if (Array.isArray(valor)) {
        return TIPO_VETOR;
    }
    throw new Error('Tipo de propriedade desconhecida');
}

function validarVetor(vetor: any, indice: number, propriedade: string) {
    if (!Array.isArray(vetor)) {
        throw new Error('A propriedade "' + propriedade + '" não é um vetor.');
    }

    if (indice < 0 || indice >= vetor.length) {
        throw new Error(
            'Você tentou acessar um índice de vetor inválido.\n' +
                'O índice deve ser menor que o número de elementos que o vetor possui.\n' +
                'Por exemplo, se foi declarado um vetor com 5 elementos (inteiro vetor[5]), o maior índice possível é 4.\n' +
                'Além disso, o índice de um vetor não pode ser negativo.'
        );
    }
}

function parseXml(xmlString: string) {
    let resultString = '';

    parseString(
        xmlString,
        {
            explicitArray: false,
            explicitRoot: false,
            mergeAttrs: true,
        },
        (err, result) => {
            if (err) {
                console.error('Erro processando XML:', err);
                resultString = 'Erro processando XML';
            } else {
                resultString = JSON.stringify(result);
            }
        }
    );
    return resultString;
}
