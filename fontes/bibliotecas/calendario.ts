import { InterpretadorInterface } from '@designliquido/delegua/interfaces';

// Dias
export const DIA_DOMINGO = 1;
export const DIA_SEGUNDA_FEIRA = 2;
export const DIA_TERCA_FEIRA = 3;
export const DIA_QUARTA_FEIRA = 4;
export const DIA_QUINTA_FEIRA = 5;
export const DIA_SEXTA_FEIRA = 6;
export const DIA_SABADO = 7;

// Meses
export const MES_JANEIRO = 1;
export const MES_FEVEREIRO = 2;
export const MES_MARCO = 3;
export const MES_ABRIL = 4;
export const MES_MAIO = 5;
export const MES_JUNHO = 6;
export const MES_JULHO = 7;
export const MES_AGOSTO = 8;
export const MES_SETEMBRO = 9;
export const MES_OUTUBRO = 10;
export const MES_NOVEMBRO = 11;
export const MES_DEZEMBRO = 12;

export async function dia_mes_atual(): Promise<number> {
    const data = new Date();
    return data.getDate();
}

export async function dia_semana_atual(): Promise<number> {
    const data = new Date();
    return data.getDay() + 1;
}

export async function mes_atual(): Promise<number> {
    const data = new Date();
    return data.getMonth() + 1;
}

export async function ano_atual(): Promise<number> {
    const data = new Date();
    return data.getFullYear();
}

export async function hora_atual(interpretador: InterpretadorInterface, formato_12h: boolean): Promise<number> {
    const data = new Date();
    if (!formato_12h) {
        return data.getHours();
    }

    let hora = data.getHours() % 12;
    if (hora === 0) {
        hora = 12;
    }
    return hora;
}

export async function minuto_atual(): Promise<number> {
    const data = new Date();
    return data.getMinutes();
}

export async function segundo_atual(): Promise<number> {
    const data = new Date();
    return data.getSeconds();
}

export async function milisegundo_atual(): Promise<number> {
    const data = new Date();
    return data.getMilliseconds();
}

export async function dia_semana_completo(
    interpretador: InterpretadorInterface,
    numero_dia: number,
    caixa_alta: boolean,
    caixa_baixa: boolean
): Promise<string> {
    const dias: string[] = [
        'Domingo',
        'Segunda-Feira',
        'Terça-Feira',
        'Quarta-Feira',
        'Quinta-Feira',
        'Sexta-Feira',
        'Sábado',
    ];

    if (numero_dia > 0 && numero_dia < 8) {
        let dia: string = dias[numero_dia - 1];

        if (caixa_alta) {
            dia = dia.toUpperCase();
        } else if (caixa_baixa) {
            dia = dia.toLowerCase();
        }

        return dia;
    }

    throw new Error(`'${numero_dia}' não corresponde a um dia da semana válido.`);
}

export async function dia_semana_curto(
    interpretador: InterpretadorInterface,
    numero_dia: number,
    caixa_alta: boolean,
    caixa_baixa: boolean
): Promise<string> {
    const dias: string[] = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

    if (numero_dia > 0 && numero_dia < 8) {
        let dia: string = dias[numero_dia - 1];

        if (caixa_alta) {
            dia = dia.toUpperCase();
        } else if (caixa_baixa) {
            dia = dia.toLowerCase();
        }

        return dia;
    }

    throw new Error(`'${numero_dia}' não corresponde a um dia da semana válido.`);
}

export async function dia_semana_abreviado(
    interpretador: InterpretadorInterface,
    numero_dia: number,
    caixa_alta: boolean,
    caixa_baixa: boolean
): Promise<string> {
    const dias: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

    if (numero_dia > 0 && numero_dia < 8) {
        let dia: string = dias[numero_dia - 1];

        if (caixa_alta) {
            dia = dia.toUpperCase();
        } else if (caixa_baixa) {
            dia = dia.toLowerCase();
        }

        return dia;
    }

    throw new Error(`'${numero_dia}' não corresponde a um dia da semana válido.`);
}
