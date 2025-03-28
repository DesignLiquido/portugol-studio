import { InterpretadorInterface } from '@designliquido/delegua/interfaces';
import {
    dia_mes_atual,
    dia_semana_abreviado,
    dia_semana_atual,
    dia_semana_completo,
    dia_semana_curto,
    mes_atual,
    ano_atual,
    hora_atual,
    minuto_atual,
    milisegundo_atual,
    segundo_atual,
} from '../../fontes/bibliotecas/calendario';
describe('Biblioteca Calendario', () => {
    describe('Dia do Mês Atual', () => {
        it('Trivial', async () => {
            const dataAtual = new Date();
            const diaEsperado = dataAtual.getDate();
            const resultado = await dia_mes_atual();
            expect(resultado).toBe(diaEsperado);
        });
    });
    describe('Dia da Semana Atual', () => {
        it('Trivial', async () => {
            const dataAtual = new Date();
            let diaEsperado = dataAtual.getDay() + 1;
            if (diaEsperado === 7) diaEsperado = 0;
            const resultado = await dia_semana_atual();
            expect(resultado).toBe(diaEsperado);
        });
    });

    describe('Mês Atual', () => {
        it('Trivial', async () => {
            const dataAtual = new Date();
            const mesEsperado = dataAtual.getMonth() + 1;
            const resultado = await mes_atual();
            expect(resultado).toBe(mesEsperado);
        });
    });

    describe('Ano Atual', () => {
        it('Trivial', async () => {
            const dataAtual = new Date();
            const anoEsperado = dataAtual.getFullYear();
            const resultado = await ano_atual();
            expect(resultado).toBe(anoEsperado);
        });
    });
    describe('Hora Atual', () => {
        it('Formato 24 horas', async () => {
            const dataAtual = new Date();
            const horaEsperada = dataAtual.getHours();
            const resultado = await hora_atual({} as InterpretadorInterface, false);
            expect(resultado).toBe(horaEsperada);
        });

        it('Formato 12 horas', async () => {
            const dataAtual = new Date();
            let horaEsperada = dataAtual.getHours() % 12;
            if (horaEsperada === 0) {
                horaEsperada = 12;
            }
            const resultado = await hora_atual({} as InterpretadorInterface, true);
            expect(resultado).toBe(horaEsperada);
        });
    });
    describe('Minuto Atual', () => {
        it('Trivial', async () => {
            const dataAtual = new Date();
            const minutoEsperado = dataAtual.getMinutes();
            const resultado = await minuto_atual();
            expect(resultado).toBe(minutoEsperado);
        });
    });

    describe('Segundo Atual', () => {
        it('Trivial', async () => {
            const dataAtual = new Date();
            const segundoEsperado = dataAtual.getSeconds();
            const resultado = await segundo_atual();
            expect(resultado).toBe(segundoEsperado);
        });
    });

    describe('Milissegundo Atual', () => {
        it('Trivial', async () => {
            const dataAtual = new Date();
            const milissegundoEsperado = dataAtual.getMilliseconds();
            const resultado = await milisegundo_atual();
            expect(resultado).toBeGreaterThanOrEqual(milissegundoEsperado);
        });
    });
    describe('Dia da Semana Completo', () => {
        it('Trivial', async () => {
            const numeroDia = 1;
            const caixaAlta = false;
            const caixaBaixa = false;
            const resultado = await dia_semana_completo({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa);
            expect(resultado).toBe('Domingo');
        });

        it('Caixa alta', async () => {
            const numeroDia = 4;
            const caixaAlta = true;
            const caixaBaixa = false;
            const resultado = await dia_semana_completo({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa);
            expect(resultado).toBe('QUARTA-FEIRA');
        });

        it('Caixa baixa', async () => {
            const numeroDia = 6;
            const caixaAlta = false;
            const caixaBaixa = true;
            const resultado = await dia_semana_completo({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa);
            expect(resultado).toBe('sexta-feira');
        });

        it('Falha - Dia invalido', async () => {
            const numeroDia = 10;
            const caixaAlta = false;
            const caixaBaixa = false;
            await expect(dia_semana_completo({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa)).rejects.toThrow(
                `'${numeroDia}' não corresponde a um dia da semana válido.`
            );
        });
    });

    describe('Dia da Semana Curto', () => {
        it('Trivial', async () => {
            const numeroDia = 1;
            const caixaAlta = false;
            const caixaBaixa = false;
            const resultado = await dia_semana_curto({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa);
            expect(resultado).toBe('Domingo');
        });

        it('Caixa alta', async () => {
            const numeroDia = 4;
            const caixaAlta = true;
            const caixaBaixa = false;
            const resultado = await dia_semana_curto({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa);
            expect(resultado).toBe('QUARTA');
        });

        it('Caixa baixa', async () => {
            const numeroDia = 6;
            const caixaAlta = false;
            const caixaBaixa = true;
            const resultado = await dia_semana_curto({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa);
            expect(resultado).toBe('sexta');
        });

        it('Falha - Dia invalido', async () => {
            const numeroDia = 10;
            const caixaAlta = false;
            const caixaBaixa = false;
            await expect(dia_semana_curto({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa)).rejects.toThrow(
                `'${numeroDia}' não corresponde a um dia da semana válido.`
            );
        });
    });
    describe('Dia da Semana Abreviado', () => {
        it('Trivial', async () => {
            const numeroDia = 1; 
            const caixaAlta = false;
            const caixaBaixa = false;
            const resultado = await dia_semana_abreviado({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa);
            expect(resultado).toBe('Dom');
        });

        it('Caixa alta', async () => {
            const numeroDia = 4; 
            const caixaAlta = true;
            const caixaBaixa = false;
            const resultado = await dia_semana_abreviado({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa);
            expect(resultado).toBe('QUA');
        });

        it('Caixa baixa', async () => {
            const numeroDia = 6; 
            const caixaAlta = false;
            const caixaBaixa = true;
            const resultado = await dia_semana_abreviado({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa);
            expect(resultado).toBe('sex');
        });

        it('Falha - Dia invalido', async () => {
            const numeroDia = 10; 
            const caixaAlta = false;
            const caixaBaixa = false;
            await expect(dia_semana_abreviado({} as InterpretadorInterface, numeroDia, caixaAlta, caixaBaixa)).rejects.toThrow(
                `'${numeroDia}' não corresponde a um dia da semana válido.`
            );
        });
    });
});
