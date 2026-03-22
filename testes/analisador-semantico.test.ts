import { AnalisadorSemanticoPortugolStudio } from '../fontes/analisador-semantico';
import { AvaliadorSintaticoPortugolStudio } from "../fontes/avaliador-sintatico";
import { LexadorPortugolStudio } from "../fontes/lexador";

describe('Analisador sêmantico', () => {
    describe('analisar()', () => {
        let lexador: LexadorPortugolStudio;
        let avaliadorSintatico: AvaliadorSintaticoPortugolStudio;
        let analisadorSemantico: AnalisadorSemanticoPortugolStudio;

        beforeEach(() => {
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
            analisadorSemantico = new AnalisadorSemanticoPortugolStudio();
        });

        describe('Casos de Sucesso', () => {
            it('Atribuição por índice', async () => {
                const retornoLexador = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro numeros[10]',
                    '        numeros[1] = "5"',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Atribuição de variáveis válida', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'real x',
                    'inteiro y',
                    'x = 25.4',
                    'y = 10',
                    'escreva(x, y)',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Atribuição válida entre variáveis do mesmo tipo', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    inteiro a = 5',
                    '    inteiro b = 0',
                    '    funcao inicio()',
                    '    {',
                    '        b = a',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Reconhece e utiliza variável global corretamente', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'inteiro totalGolsMarcados = 0',
                    'funcao inicio() {',
                    'escreva(totalGolsMarcados)',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Leia com variável e índice de vetor válidos', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'inteiro n = 0',
                    'inteiro numeros[2]',
                    'leia(n, numeros[0])',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });

        describe('Casos de Falha', () => {
            it('Variável indefinida, não declarada (escreva)', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        escreva(mensagem)',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);


                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
            it('Variável indefinida, não declarada (atribuição)', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio() {',
                    '        message = "olá mundo"',
                    '    }',
                    '}'
                ], -1);
                
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
            it('Atribuição de variáveis inválida', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'real x',
                    'inteiro y',
                    'caracter a',
                    'cadeia b',
                    'logico l',
                    'x = "25"',
                    'y = "6x"',
                    'l = 24',
                    'b = 34',
                    'x = 25',
                    'y = 25.4',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(5);


                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toEqual("Não é possível atribuir um valor do tipo 'cadeia' a uma variável do tipo 'real'.");
                expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toEqual("Não é possível atribuir um valor do tipo 'cadeia' a uma variável do tipo 'inteiro'.");
                expect(retornoAnalisadorSemantico.diagnosticos[2].mensagem).toEqual("Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'lógico'.");
                expect(retornoAnalisadorSemantico.diagnosticos[3].mensagem).toEqual("Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'cadeia'.");
                expect(retornoAnalisadorSemantico.diagnosticos[4].mensagem).toEqual("Não é possível atribuir um valor do tipo 'real' a uma variável do tipo 'inteiro'.");
            });

            it('Erro ao atribuir uma variável não declarada', async () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro b = a',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe("Variável não declarada: a.");
            });

            it('Erro ao atribuir valor de tipo incompatível', async () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro a = 2',
                    '        cadeia b = a',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                    "Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'cadeia'."
                );
            });



            it('Chamada de função inexistente', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'saudacao()',
                    '}',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
            it('Chamada de função com tipos de parâmetros diferentes', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'saudacao(4)',
                    '}',
                    'funcao saudacao(cadeia message) {',
                    'escreva(message)',
                    '}',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Atribuição de variável inteira a variável cadeia (tipos incompatíveis)', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    cadeia a',
                    '    inteiro b = 0',
                    '    funcao inicio()',
                    '    {',
                    '        a = b',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                    "Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'cadeia'."
                );
            });

            it('Reatribuição de valores a uma constante', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio() {',
                    '        const inteiro numero = 3',
                    '        numero = 4',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Leia com argumento inválido', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio() {',
                    '        inteiro n = 0',
                    '        leia(n + 1)',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                    'Argumento inválido em leia(). Esperado variável ou posição indexada de vetor/matriz.'
                );
            });
        });
    })
})