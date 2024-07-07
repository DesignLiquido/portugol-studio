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
        it('Atribuição de variaveis inválida', () => {
            const retornoLexador = lexador.mapear([
                'programa',
                '{',
                    'funcao inicio() {',
                        'real x',
                        'inteiro y',
                        'caracter a',
                        'logico l',
                        'x = "25"',
                        'y = "6x"',
                        'l = 24',
                        'a = "isto é uma cadeia de caracter"',
                    '}',
                '}'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(4);
        });

        it('Atribuição por indice', () => {
            const retornoLexador = lexador.mapear([
                'programa {',
                    'funcao inicio() {',
                      'inteiro numeros[10]',
                      'numeros[1] = 5',
                    '}',
                '}'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

            console.log(retornoAnalisadorSemantico)
            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
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
                        'saudacao("4")',
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

    })
})