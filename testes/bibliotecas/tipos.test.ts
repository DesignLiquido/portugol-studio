import {
    cadeia_e_caracter,
    cadeia_e_inteiro,
    cadeia_e_logico,
    cadeia_e_real,
    cadeia_para_caracter,
    cadeia_para_inteiro,
    cadeia_para_logico,
    cadeia_para_real,
    logico_para_cadeia,
    logico_para_caracter,
    logico_para_inteiro,
    caracter_e_inteiro,
    caracter_e_logico,
    caracter_para_cadeia,
    caracter_para_inteiro,
    caracter_para_logico,
    inteiro_e_caracter,
    inteiro_para_cadeia,
    inteiro_para_caracter,
    real_para_inteiro,
    inteiro_para_logico,
    inteiro_para_real,
} from '../../fontes/bibliotecas/tipos';
describe('Tipos', () => {
    describe('Verificação de Cadeia e Inteiro', () => {
        it('Binario', () => {
            const cad = '1010';
            const base = 2;
            expect(cadeia_e_inteiro(cad, base)).toBe(true);
        });

        it('Decimal', () => {
            const cad = '-123';
            const base = 10;
            expect(cadeia_e_inteiro(cad, base)).toBe(true);
        });

        it('Hexadecimal', () => {
            const cad = '0xFF';
            const base = 16;
            expect(cadeia_e_inteiro(cad, base)).toBe(true);
        });

        it('Base invalida', () => {
            const cad = '1010';
            const base = 8;
            expect(() => cadeia_e_inteiro(cad, base)).toThrow(
                `A base informada (${base}) é inválida. A base deve ser um dos seguintes valores: 2; 10; 16.`
            );
        });
    });

    describe('Verificação de Cadeia e Real', () => {
        it('Numero Real', () => {
            const cad = '-123.45';
            expect(cadeia_e_real(cad)).toBe(true);
        });

        it('Numero Inteiro', () => {
            const cad = '123';
            expect(cadeia_e_real(cad)).toBe(false);
        });
    });

    describe('Verificação de Cadeia e Lógico', () => {
        it('Valor Lógico', () => {
            const cad = 'verdadeiro';
            expect(cadeia_e_logico(cad)).toBe(true);
        });

        it('Valor Não Lógico', () => {
            const cad = 'Valor negado';
            expect(cadeia_e_logico(cad)).toBe(false);
        });
    });
    describe('Verificação de Cadeia e Caractere', () => {
        it('Unico Caractere', () => {
            const cad = 'a';
            expect(cadeia_e_caracter(cad)).toBe(true);
        });

        it('Multiplos Caracteres', () => {
            const cad = 'abc';
            expect(cadeia_e_caracter(cad)).toBe(false);
        });
    });

    describe('Conversão de Cadeia para Caractere', () => {
        it('Trivial', () => {
            const valor = 'a';
            const resultado = cadeia_para_caracter(valor);
            expect(resultado).toBe('a');
        });

        it('Falha - Multiplos Caracteres', () => {
            const valor = 'abc';
            expect(() => cadeia_para_caracter(valor)).toThrow(`O valor '${valor}' não é um caractere válido`);
        });
    });

    describe('Conversão de Cadeia para Inteiro', () => {
        it('Binario para inteiro', () => {
            const valor = '1010';
            const base = 2;
            const resultado = cadeia_para_inteiro(valor, base);
            expect(resultado).toBe(10);
        });

        it('Decimal para inteiro', () => {
            const valor = '123';
            const base = 10;
            const resultado = cadeia_para_inteiro(valor, base);
            expect(resultado).toBe(123);
        });

        it('Hexadecimal para Inteiro', () => {
            const valor = '1A';
            const base = 16;
            const resultado = cadeia_para_inteiro(valor, base);
            expect(resultado).toBe(26);
        });

        it('Falha - Base Invalida', () => {
            const valor = '1010';
            const base = 8;
            expect(() => cadeia_para_inteiro(valor, base)).toThrow(
                `A base informada (${base}) é inválida. A base deve ser um dos seguintes valores: 2; 10; 16`
            );
        });

        it('Falha - Inteiro Invalido', () => {
            const valor = 'abc';
            const base = 10;
            expect(() => cadeia_para_inteiro(valor, base)).toThrow(`O valor '${valor}' não é um número inteiro válido`);
        });
    });

    describe('Conversão de Cadeia para Real', () => {
        it('Real Valido', () => {
            const valor = '123.45';
            const resultado = cadeia_para_real(valor);
            expect(resultado).toBe(123.45);
        });

        it('Falha - Real Invalido', () => {
            const valor = 'abc';
            expect(() => cadeia_para_real(valor)).toThrow(`O valor '${valor}' não é um número real válido`);
        });
    });

    describe('Conversão de Cadeia para Lógico', () => {
        it('Converter verdadeiro para true', () => {
            const valor = 'verdadeiro';
            const resultado = cadeia_para_logico(valor);
            expect(resultado).toBe(true);
        });

        it('Converter falso para false', () => {
            const valor = 'falso';
            const resultado = cadeia_para_logico(valor);
            expect(resultado).toBe(false);
        });

        it('Falha - Lógico Invalido', () => {
            const valor = 'true';
            expect(() => cadeia_para_logico(valor)).toThrow(`O valor '${valor}' não é um valor lógico válido`);
        });
    });

    describe('Verificação de Inteiro e Caractere', () => {
        it('Retorna true de 0 a 9', () => {
            const _int = 5;
            expect(inteiro_e_caracter(_int)).toBe(true);
        });

        it('Falso fora de 0 a 9', () => {
            const _int = 10;
            expect(inteiro_e_caracter(_int)).toBe(false);
        });
    });

    describe('Conversão de Inteiro para Caractere', () => {
        it('Converter de 0 a 9 para string', () => {
            const valor = 5;
            const resultado = inteiro_para_caracter(valor);
            expect(resultado).toBe('5');
        });

        it('Falha - Valor Fora De 0 a 9', () => {
            const valor = 10;
            expect(() => inteiro_para_caracter(valor)).toThrow(`O valor '${valor}' não é um caractere válido`);
        });
    });

    describe('Conversão de Inteiro para Lógico', () => {
        it('True Para Int Positivo', () => {
            const valor = 5;
            const resultado = inteiro_para_logico(valor);
            expect(resultado).toBe(true);
        });

        it('Falso Para 0', () => {
            const valor = 0;
            const resultado = inteiro_para_logico(valor);
            expect(resultado).toBe(false);
        });
    });
    describe('Conversão de Inteiro para Cadeia', () => {
        it('Converter Int Para String Binaria', () => {
            const valor = 10;
            const base = 2;
            const resultado = inteiro_para_cadeia(valor, base);
            expect(resultado).toBe('00000000000000000000000000001010');
        });

        it('Converter String Para Decimal', () => {
            const valor = 123;
            const base = 10;
            const resultado = inteiro_para_cadeia(valor, base);
            expect(resultado).toBe('123');
        });

        it('Converter String Para Hexadecimal', () => {
            const valor = 255;
            const base = 16;
            const resultado = inteiro_para_cadeia(valor, base);
            expect(resultado).toBe('000000FF');
        });

        it('Falha - Base Invalida', () => {
            const valor = 10;
            const base = 8;
            expect(() => inteiro_para_cadeia(valor, base)).toThrow(
                `A base informada (${base}) é inválida. A base deve ser um dos seguintes valores: 2; 10; 16`
            );
        });

        it('Falha - Inteiro Invalido', () => {
            const valor = 123.3;
            const base = 10;
            expect(() => inteiro_para_cadeia(valor as number, base)).toThrow(
                `O valor '${valor}' não é um número inteiro válido`
            );
        });
    });

    describe('Conversão de Inteiro para Real', () => {
        it('Inteiro Como Real', () => {
            const valor = 123;
            const resultado = inteiro_para_real(valor);
            expect(resultado).toBe(123);
        });
    });

    describe('Verificação de Caractere e Inteiro', () => {
        it('True para String de Caractere Unico', () => {
            const valor = '5';
            expect(caracter_e_inteiro(valor)).toBe(true);
        });

        it('Falso para String de Caracteres Multiplos', () => {
            const valor = 'abc';
            expect(caracter_e_inteiro(valor)).toBe(false);
        });
    });

    describe('Verificação de Caractere e Lógico', () => {
        it('True para "s" ou "n"', () => {
            const valor = 's';
            expect(caracter_e_logico(valor)).toBe(true);
        });

        it('Falso para Outras Strings', () => {
            const valor = 'abc';
            expect(caracter_e_logico(valor)).toBe(false);
        });
    });

    describe('Conversão de Caractere para Cadeia', () => {
        it('Retornar a Mesma String', () => {
            const valor = 'abc';
            const resultado = caracter_para_cadeia(valor);
            expect(resultado).toBe('abc');
        });
    });

    describe('Conversão de Caractere para Inteiro', () => {
        it('Converter String de 0 a 9 para Inteiro', () => {
            const valor = '5';
            const resultado = caracter_para_inteiro(valor);
            expect(resultado).toBe(5);
        });
    });

    describe('Conversão de Caractere para Lógico', () => {
        it('Retornar "true" para "s"', () => {
            const valor = 's';
            const resultado = caracter_para_logico(valor);
            expect(resultado).toBe(true);
        });

        it('Retornar "false" para "n"', () => {
            const valor = 'n';
            const resultado = caracter_para_logico(valor);
            expect(resultado).toBe(false);
        });

        it('Falha - Logico Invalido', () => {
            const valor = 'abc';
            expect(() => caracter_para_logico(valor)).toThrow(`O valor '${valor}' não é um valor lógico válido`);
        });
    });

    describe('Conversão de Lógico para Cadeia', () => {
        it('Converter "true" para "verdadeiro"', () => {
            const valor = true;
            const resultado = logico_para_cadeia(valor);
            expect(resultado).toBe('verdadeiro');
        });

        it('Converter "false" para "falso"', () => {
            const valor = false;
            const resultado = logico_para_cadeia(valor);
            expect(resultado).toBe('falso');
        });
    });

    describe('Conversão de Lógico para Inteiro', () => {
        it('Converter "true" para 1', () => {
            const valor = true;
            const resultado = logico_para_inteiro(valor);
            expect(resultado).toBe(1);
        });

        it('Converter "false" para 0', () => {
            const valor = false;
            const resultado = logico_para_inteiro(valor);
            expect(resultado).toBe(0);
        });
    });

    describe('Conversão de Lógico para Caractere', () => {
        it('Converter "true" para "S"', () => {
            const valor = true;
            const resultado = logico_para_caracter(valor);
            expect(resultado).toBe('S');
        });

        it('Converter "false" para "N"', () => {
            const valor = false;
            const resultado = logico_para_caracter(valor);
            expect(resultado).toBe('N');
        });
    });

    describe('Conversão de Real para Inteiro', () => {
        it('Deve Retornar a Parte Real de Um Inteiro', () => {
            const valor = 123.45;
            const resultado = real_para_inteiro(valor);
            expect(resultado).toBe(123);
        });
    });
});

