export async function numero_caracteres(cadeia: string){
    return Promise.resolve(cadeia.length);
}

export async function caixa_alta(cad: string){
    return Promise.resolve(cad.toUpperCase());
}

export async function caixa_baixa(cad: string){
    return Promise.resolve(cad.toLowerCase());
}

export async function substituir(cad: string, texto_pesquisa: string, texto_substituto: string){
    return Promise.resolve(cad.replace(texto_pesquisa,texto_substituto));
}

export async function preencher_a_esquerda(car: string, tamanho: number, cad: string): Promise<string> {
    if (cad.length < tamanho) {
        const diferenca = tamanho - cad.length;
        const enchimento = car.repeat(diferenca);
        cad = enchimento + cad;
    }
    return Promise.resolve(cad);
}

export async function obter_caracter(cad: string, indice: number): Promise<string> {
    if (indice < 0) {
        throw new Error(`O índice do caracter (${indice}) é menor que 0`);
    } else if (indice > cad.length - 1) {
        throw new Error(`O índice do caracter (${indice}) é maior que o número de caracteres na cadeia (${cad.length})`);
    } else {
        return cad.charAt(indice);
    }
}

export async function posicao_texto(cadeia: string, texto : string, posicao_inicial: number){
    return Promise.resolve(cadeia.indexOf(texto, posicao_inicial));
}

export async function extrair_subtexto(cadeia: string, posicao_inicial: number, posicao_final: number): Promise<string> {
    try {
        return cadeia.substring(posicao_inicial, posicao_final);
    } catch (excecao) {
        throw new Error("Posição inicial ou final inválida. A posição deve estar entre 0 e o tamanho da cadeia");
    }
}