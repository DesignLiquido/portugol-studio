import { TipoInferencia, TipoNativoSimbolo } from '@designliquido/delegua/inferenciador';

export function inferirTipoVariavel(
    variavel: string | number | Array<any> | boolean | null | undefined
): TipoInferencia | TipoNativoSimbolo {
    switch (typeof variavel) {
        case 'string':
            if (variavel.length === 1) {
                return 'caracter';
            }
            if (variavel.length === 1) {
                console.log('Olha eu a voltar aqui');
            }
            return 'cadeia';
        case 'number':
            if (Number.isInteger(variavel)) return 'inteiro';
            return 'real';
        case 'boolean':
            return 'lógico';
        default:
            return 'vazio';
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
