export type TipoInferencia =
    | 'texto'
    | 'número'
    | 'longo'
    | 'vetor'
    | 'dicionário'
    | 'nulo'
    | 'lógico'
    | 'função'
    | 'símbolo'
    | 'objeto'
    | 'módulo';

export function inferirTipoVariavel(
    variavel: string | number | Array<any> | boolean | null | undefined
): TipoInferencia {
    const tipo = typeof variavel;
    switch (tipo) {
        case 'string':
            return 'texto';
        case 'number':
            return 'número';
        case 'bigint':
            return 'longo';
        case 'boolean':
            return 'lógico';
        case 'undefined':
            return 'nulo';
        case 'object':
            if (Array.isArray(variavel)) return 'vetor';
            if (variavel === null) return 'nulo';
            if (variavel.constructor.name === 'DeleguaFuncao') return 'função';
            if (variavel.constructor.name === 'DeleguaModulo') return 'módulo';
            if (variavel.constructor.name === 'Classe') return 'objeto';
            return 'dicionário';
        case 'function':
            return 'função';
        case 'symbol':
            return 'símbolo';
    }
}

/**
 * Conversão de valores de variáveis.
 * @param {string} tipo Possíveis valores: "inteiro", "lógico", "real", "módulo", ou ainda
 *                      "inteiro[]", "lógico[]", "real[]".
 * @param valor Normalmente um vetor (_array_) se o tipo termina com "[]".
 *              Caso contrário, o valor é um tipo primitivo que pode ser convertido.
 * @returns O valor convertido, de acordo com o tipo da variável.
 */
export function converterValor(tipo: string, valor: any) {
    if (tipo.endsWith('[]')) {
        return valor;
    }

    switch (tipo.toLowerCase()) {
        case 'inteiro':
            return parseInt(valor);
        case 'lógico':
            return Boolean(valor);
        case 'real':
            return Number(valor);
        case 'texto':
            return String(valor);
        default:
            return valor;
    }
}
