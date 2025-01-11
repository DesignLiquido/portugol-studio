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
            it('Atribuição por indice', () => {
                const retornoLexador = lexador.mapear([
                    'programa {',
                    'funcao inicio() {',
                    'inteiro numeros[10]',
                    'numeros[1] = "5"',
                    '}',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);


                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Atribuição de variáveis válida', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

        });

        describe('Casos de Falha', () => {
            it('Variável indefinida, não declarada (escreva)', () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        escreva(mensagem)',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);


                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
            it('Variável indefinida, não declarada (atribuição)', () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'message = "olá mundo"',
                    '}',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
            it('Atribuição de variáveis inválida', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(5);


                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toEqual("Não é possível atribuir um valor do tipo 'cadeia' a uma variável do tipo 'real'.");
                expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toEqual("Não é possível atribuir um valor do tipo 'cadeia' a uma variável do tipo 'inteiro'.");
                expect(retornoAnalisadorSemantico.diagnosticos[2].mensagem).toEqual("Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'lógico'.");
                expect(retornoAnalisadorSemantico.diagnosticos[3].mensagem).toEqual("Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'cadeia'.");
                expect(retornoAnalisadorSemantico.diagnosticos[4].mensagem).toEqual("Não é possível atribuir um valor do tipo 'real' a uma variável do tipo 'inteiro'.");
            });

            it('Erro ao atribuir uma variável não declarada', () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro b = a',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);

                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe("Variável não declarada: a.");
            });

            it('Erro ao atribuir valor de tipo incompatível', () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro a = 2',
                    '        cadeia b = a',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                    "Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'cadeia'."
                );
            });



            it('Chamada de função inexistente', () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'saudacao()',
                    '}',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
            it('Chamada de função com tipos de parâmetros diferentes', () => {
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
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
            it('Reatribuição de valores a uma constante', () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'const inteiro numero = 3',
                    'numero = 4',
                    '}',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
        });
    })
})