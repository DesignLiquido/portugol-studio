import { exit } from 'process';

const PADRAO_INTEIRO_NOTACAO_HEXADECIMAL: RegExp = /^(0x|0X)?([0-9]|[a-f]|[A-F])+$/;
const PADRAO_INTEIRO_NOTACAO_BINARIA: RegExp = /^(0b|0B)?[0-1]+$/;
const PADRAO_INTEIRO_NOTACAO_DECIMAL: RegExp = /^-?\d+$/;
const PADRAO_REAL: RegExp = /^-?\d+\.\d+$/;
const PADRAO_LOGICO: RegExp = /^verdadeiro|falso$/;

export function cadeia_e_inteiro(cad: string, base: number): boolean {
    switch (base) {
        case 2:
            return PADRAO_INTEIRO_NOTACAO_BINARIA.test(cad);
        case 10:
            return PADRAO_INTEIRO_NOTACAO_DECIMAL.test(cad);
        case 16:
            return PADRAO_INTEIRO_NOTACAO_HEXADECIMAL.test(cad);
        default:
            throw new Error(
                `A base informada (${base}) é inválida. A base deve ser um dos seguintes valores: 2; 10; 16.`
            );
    }
}

export function cadeia_e_real(cad: string): boolean {
    return PADRAO_REAL.test(cad);
}

export function cadeia_e_logico(cad: string): boolean {
    return PADRAO_LOGICO.test(cad);
}

export function cadeia_e_caracter(cad: string): boolean {
    return cad.length === 1;
}

export function cadeia_para_caracter(valor: string): string {
    if (valor.length === 1) {
        return valor.charAt(0);
    }
    throw new Error(`O valor '${valor}' não é um caractere válido`);
}

export function cadeia_para_inteiro(valor: string, base: number): number {
    if (base === 2 || base === 10 || base === 16) {
        if (base === 16) {
            valor = valor.replace(/^0x/i, '');
        }
        if (base === 2) {
            valor = valor.replace(/^0b/i, '');
        }
        const val: number = parseInt(valor, base);
        if (isNaN(val)) {
            throw new Error(`O valor '${valor}' não é um número inteiro válido`);
        }
        if (val >= 2147483648) {
            return val - (1 << 32);
        }
        return val;
    }
    throw new Error(`A base informada (${base}) é inválida. A base deve ser um dos seguintes valores: 2; 10; 16`);
}

export function cadeia_para_real(valor: string): number {
    if (!isNaN(parseFloat(valor))) {
        return parseFloat(valor);
    }
    throw new Error(`O valor '${valor}' não é um número real válido`);
}

export function cadeia_para_logico(valor: string): boolean {
    switch (valor.toLowerCase()) {
        case 'verdadeiro':
            return true;
        case 'falso':
            return false;
        default:
            throw new Error(`O valor '${valor}' não é um valor lógico válido`);
    }
}

export function inteiro_e_caracter(_int: number): boolean {
    return _int >= 0 && _int <= 9;
}

export function inteiro_para_cadeia(valor: number, base: number): string {
    if (cadeia_e_inteiro(valor.toString(), base)) {
        if (base === 2 || base === 10 || base === 16) {
            switch (base) {
                case 2:
                    return lpad(32, valor.toString(2));
                case 10:
                    return valor.toString();
                case 16:
                    return lpad(8, valor.toString(16).toUpperCase());
                default:
                    throw new Error(
                        `A base informada (${base}) é inválida. A base deve ser um dos seguintes valores: 2; 10; 16`
                    );
            }
        }
    }
    throw new Error(`O valor '${valor}' não é um número inteiro válido`);
}

export function inteiro_para_caracter(valor: number): string {
    if (valor >= 0 && valor <= 9) {
        return String(valor);
    }
    throw new Error(`O valor '${valor}' não é um caractere válido`);
}

export function inteiro_para_logico(valor: number): boolean {
    return valor > 0;
}

export function inteiro_para_real(valor: number): number {
    return valor;
}

export function caracter_e_inteiro(car: string): boolean {
    return cadeia_e_inteiro(car, 10);
}

export function caracter_e_logico(car: string): boolean {
    return car.toLowerCase() === 's' || car.toLowerCase() === 'n';
}

export function caracter_para_cadeia(valor: string): string {
    return valor;
}

export function caracter_para_inteiro(valor: string): number {
    return cadeia_para_inteiro(valor, 10);
}

export function caracter_para_logico(valor: string): boolean {
    if (valor.toLowerCase() === 's') {
        return true;
    }
    if (valor.toLowerCase() === 'n') {
        return false;
    }
    throw new Error(`O valor '${valor}' não é um valor lógico válido`);
}

export function logico_para_cadeia(valor: boolean): string {
    return valor ? 'verdadeiro' : 'falso';
}

export function logico_para_inteiro(valor: boolean): number {
    return valor ? 1 : 0;
}

export function logico_para_caracter(valor: boolean): string {
    return valor ? 'S' : 'N';
}

export function real_para_inteiro(valor: number): number {
    return Math.floor(valor);
}

function lpad(quantidade: number, cadeia: string): string {
    if (cadeia.length < quantidade) {
        const diferenca = quantidade - cadeia.length;
        return '0'.repeat(diferenca) + cadeia;
    }
    return cadeia;
}
