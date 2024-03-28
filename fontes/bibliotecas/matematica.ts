export async function potencia(base: number, expoente: number): Promise<number> {
    return Promise.resolve(Math.pow(base, expoente));
}

export async function raiz(radicando: number, indice: number): Promise<number> {
    return Promise.resolve(Math.pow(radicando, 1 / indice));
}

export async function arredondar(numero: number, casas: number): Promise<number> {
    let fator = 1;
        
    for (let i = 1; i <= casas; i++) {
        fator *= 10;
    }
            
    return Promise.resolve(Math.round(numero * fator) / fator);
}

export async function logaritmo(numero: number, base: number) {
    return Promise.resolve(Math.log(numero) / Math.log(base));
}

export async function seno(angulo: number) {
    return Promise.resolve(Math.sin(angulo));
}

export async function cosseno(angulo: number) {
    return Promise.resolve(Math.cos(angulo));
}

export async function tangente(angulo: number) {
    return Promise.resolve(Math.tan(angulo));
}

export async function valor_absoluto(numero: number){
    return Promise.resolve(Math.abs(numero));
}

export async function maior_numero(numeroA: number, numeroB: number){
    return Promise.resolve(Math.max(numeroA, numeroB));
}

export async function menor_numero(numeroA: number, numeroB: number){
    return Promise.resolve(Math.min(numeroA, numeroB));
}