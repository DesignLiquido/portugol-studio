const horaInicial: number = Date.now();

export async function numero_elementos(vetor: any[]): Promise<number> {
    return vetor.length;
}

export async function numero_linhas(matriz: any[][]): Promise<number> {
    return matriz.length;
}

export async function numero_colunas(matriz: any[][]): Promise<number> {
    return matriz[0].length;
}

export async function sorteia(minimo: number, maximo: number): Promise<number> {
    if (minimo > maximo) {
        throw new Error(`O valor mínimo (${minimo}) é maior do que o valor máximo (${maximo})`);
    } else if (minimo === maximo) {
        throw new Error(`Os valores mínimo e máximo são iguais: ${minimo}`);
    }

    return Math.floor(Math.random() * (maximo + 1 - minimo)) + minimo;

}

export async function aguarde(intervalo: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, intervalo));
}

export async function tempo_decorrido(): Promise<number> {
    const tempoAtual = Date.now();
    return Math.floor(tempoAtual - horaInicial);
}