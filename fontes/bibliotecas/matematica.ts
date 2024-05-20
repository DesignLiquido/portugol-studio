import { InterpretadorInterface } from "@designliquido/delegua/interfaces";

export const PI = Math.PI;

export async function potencia(interpretador: InterpretadorInterface, base: number, expoente: number): Promise<number> {
    return Promise.resolve(Math.pow(base, expoente));
}

export async function raiz(interpretador: InterpretadorInterface, radicando: number, indice: number): Promise<number> {
    return Promise.resolve(Math.pow(radicando, 1 / indice));
}

export async function arredondar(interpretador: InterpretadorInterface, numero: number, casas: number): Promise<number> {
    let fator = 1;
        
    for (let i = 1; i <= casas; i++) {
        fator *= 10;
    }
            
    return Promise.resolve(Math.round(numero * fator) / fator);
}

export async function logaritmo(interpretador: InterpretadorInterface, numero: number, base: number) {
    return Promise.resolve(Math.log(numero) / Math.log(base));
}

export async function seno(interpretador: InterpretadorInterface, angulo: number) {
    return Promise.resolve(Math.sin(angulo));
}

export async function cosseno(interpretador: InterpretadorInterface, angulo: number) {
    return Promise.resolve(Math.cos(angulo));
}

export async function tangente(interpretador: InterpretadorInterface, angulo: number) {
    return Promise.resolve(Math.tan(angulo));
}

export async function valor_absoluto(interpretador: InterpretadorInterface, numero: number){
    return Promise.resolve(Math.abs(numero));
}

export async function maior_numero(interpretador: InterpretadorInterface, numeroA: number, numeroB: number){
    return Promise.resolve(Math.max(numeroA, numeroB));
}

export async function menor_numero(interpretador: InterpretadorInterface, numeroA: number, numeroB: number){
    return Promise.resolve(Math.min(numeroA, numeroB));
}