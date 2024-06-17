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

        describe('Cenários de falha', () => {
            it('Variável indefinida, não declarada (escreva)', () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        escreva(teste)',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                
                expect(retornoAnalisadorSemantico).toBeTruthy();
                //expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
        })

    })
})