import { InterpretadorInterface } from '@designliquido/delegua/interfaces';
import { potencia, raiz, arredondar, logaritmo, PI, seno, cosseno, tangente,valor_absoluto,maior_numero,menor_numero } from '../../fontes/bibliotecas/matematica';

describe('Biblioteca Matemática', () => {
    describe('Potência', () => {
        it('Trivial', async () => {
            const resultado = await potencia({} as InterpretadorInterface, 2, 8);
            expect(resultado).toBe(256);
        });
    });

    describe('Raiz', () => {
        it('Trivial', async () => {
            const resultado = await raiz({} as InterpretadorInterface, 16, 2);
            expect(resultado).toBe(4);
        });
    });

    describe('Arredondar', () => {
        it('Trivial', async () => {
            const resultado = await arredondar({} as InterpretadorInterface, 3.14159, 2);
            expect(resultado).toBe(3.14);
        });

        it('Para Cima', async () => {
            const resultado = await arredondar({} as InterpretadorInterface, 3.149, 2);
            expect(resultado).toBe(3.15);
        });

        it('Para Baixo', async () => {
            const resultado = await arredondar({} as InterpretadorInterface, 3.141, 2);
            expect(resultado).toBe(3.14);
        });

        it('Sem Arredondar', async () => {
            const resultado = await arredondar({} as InterpretadorInterface, 3.0, 2);
            expect(resultado).toBe(3.0);
        });
    });

    describe('Logaritmo', () => {
        it('Logaritmo base 2', async () => {
            const resultado = await logaritmo({} as InterpretadorInterface, 8, 2);
            expect(resultado).toBe(3);
        });

        it('Logaritmo base 10', async () => {
            const resultado = await logaritmo({} as InterpretadorInterface, 100, 10);
            expect(resultado).toBe(2);
        });
    });

    describe('Seno', () => {
        it('90 graus', async () => {
            const resultado = await seno({} as InterpretadorInterface, PI / 2);
            expect(resultado).toBeCloseTo(1);
        });

        it('180 graus', async () => {
            const resultado = await seno({} as InterpretadorInterface, PI);
            expect(resultado).toBeCloseTo(0);
        });

        it('270 graus', async () => {
            const resultado = await seno({} as InterpretadorInterface, (3 * PI) / 2);
            expect(resultado).toBeCloseTo(-1);
        });

        it('360 graus', async () => {
            const resultado = await seno({} as InterpretadorInterface, 2 * PI);
            expect(resultado).toBeCloseTo(0);
        });
    });

    describe('Cosseno', () => {
        it('90 graus', async () => {
            const resultado = await cosseno({} as InterpretadorInterface, PI / 2);
            expect(resultado).toBeCloseTo(0);
        });

        it('180 graus', async () => {
            const resultado = await cosseno({} as InterpretadorInterface, 2 * PI);
            expect(resultado).toBeCloseTo(1);
        });

        it('270 graus', async () => {
            const resultado = await cosseno({} as InterpretadorInterface, (3 * PI) / 2);
            expect(resultado).toBeCloseTo(0);
        });

        it('360 graus', async () => {
            const resultado = await cosseno({} as InterpretadorInterface, 2 * PI);
            expect(resultado).toBeCloseTo(1);
        });
    });

    describe('Tangente', () => {
        it('45 graus', async () => {
            const resultado = await tangente({} as InterpretadorInterface, PI / 4); 
            expect(resultado).toBeCloseTo(1);
        });
    
        it('135 graus', async () => {
            const resultado = await tangente({} as InterpretadorInterface, (3 * PI) / 4);
            expect(resultado).toBeCloseTo(-1);
        });
    
        it('180 graus', async () => {
            const resultado = await tangente({} as InterpretadorInterface, PI); 
            expect(resultado).toBeCloseTo(0);
        });
    
        it('360 graus', async () => {
            const resultado = await tangente({} as InterpretadorInterface, 2 * PI); 
            expect(resultado).toBeCloseTo(0);
        });
    });

    describe('Valor Absoluto', () => {
        it('Positivo', async () => {
            const resultado = await valor_absoluto({} as InterpretadorInterface, 5);
            expect(resultado).toBe(5);
        });
    
        it('Negativo', async () => {
            const resultado = await valor_absoluto({} as InterpretadorInterface, -8);
            expect(resultado).toBe(8);
        });
    
        it('Zero', async () => {
            const resultado = await valor_absoluto({} as InterpretadorInterface, 0);
            expect(resultado).toBe(0);
        });
    });
    describe('Maior Número', () => {
        it('Primeiro numero maior', async () => {
            const resultado = await maior_numero({} as InterpretadorInterface, 10, 5);
            expect(resultado).toBe(10);
        });
    
        it('Segundo numero maior', async () => {
            const resultado = await maior_numero({} as InterpretadorInterface, 3, 8);
            expect(resultado).toBe(8);
        });
    
        it('Iguais', async () => {
            const resultado = await maior_numero({} as InterpretadorInterface, 6, 6);
            expect(resultado).toBe(6);
        });
    });

    describe('Menor Número', () => {
        it('Primeiro numero maior', async () => {
            const resultado = await menor_numero({} as InterpretadorInterface, 10, 5);
            expect(resultado).toBe(5);
        });
    
        it('Segundo numero maior', async () => {
            const resultado = await menor_numero({} as InterpretadorInterface, 3, 8);
            expect(resultado).toBe(3);
        });
    
        it('Iguais', async () => {
            const resultado = await menor_numero({} as InterpretadorInterface, 6, 6);
            expect(resultado).toBe(6);
        });
    });
});
