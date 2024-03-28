export async function dia_mes_atual(): Promise<number> {
    const data = new Date();
    return data.getDate();
}

export async function dia_semana_atual(): Promise<number> {
    const data = new Date();
    let diaDaSemana = data.getDay() + 1;
    if (diaDaSemana === 7) diaDaSemana = 0;
    return diaDaSemana;
}

export async function mes_atual(): Promise<number> {
    const data = new Date();
    return data.getMonth() + 1;
}

export async function ano_atual(): Promise<number> {
    const data = new Date();
    return data.getFullYear();
}

export async function hora_atual(formato_12h: boolean): Promise<number> {
    const data = new Date();
    if (!formato_12h) {
        return data.getHours();
    } else {
        let hora = data.getHours() % 12;
        if (hora === 0) {
            hora = 12;
        }
        return hora;
    }
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
        let dia: string = dias[numero_dia];

        if (caixa_alta) {
            dia = dia.toUpperCase();
        } else if (caixa_baixa) {
            dia = dia.toLowerCase();
        }

        return dia;
    } else {
        throw new Error(`'${numero_dia}' não corresponde a um dia da semana válido.`);
    }
}

export async function dia_semana_curto(numero_dia: number, caixa_alta: boolean, caixa_baixa: boolean): Promise<string> {
    const dias: string[] = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

    if (numero_dia > 0 && numero_dia < 8) {
        let dia: string = dias[numero_dia];

        if (caixa_alta) {
            dia = dia.toUpperCase();
        } else if (caixa_baixa) {
            dia = dia.toLowerCase();
        }

        return dia;
    } else {
        throw new Error(`'${numero_dia}' não corresponde a um dia da semana válido.`);
    }
}

export async function dia_semana_abreviado(
    numero_dia: number,
    caixa_alta: boolean,
    caixa_baixa: boolean
): Promise<string> {
    const dias: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

    if (numero_dia > 0 && numero_dia < 8) {
        let dia: string = dias[numero_dia];

        if (caixa_alta) {
            dia = dia.toUpperCase();
        } else if (caixa_baixa) {
            dia = dia.toLowerCase();
        }

        return dia;
    } else {
        throw new Error(`'${numero_dia}' não corresponde a um dia da semana válido.`);
    }
}
