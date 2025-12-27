import { AvaliadorSintaticoPortugolStudio, LexadorPortugolStudio } from "../fontes";
import { InterpretadorPortugolStudioComDepuracao } from "../fontes/interpretador";

describe('Interpretador com Depuração (Portugol Studio)', () => {
    let lexador: LexadorPortugolStudio;
    let avaliadorSintatico: AvaliadorSintaticoPortugolStudio;
    let interpretador: InterpretadorPortugolStudioComDepuracao;

    describe('interpretar()', () => {
        beforeEach(() => {
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
        });

        describe('Sem pontos de parada', () => {
            let _saidas: string[] = [];
            const funcaoSaida = (texto: string) => {
                _saidas.push(texto);
            }

            beforeEach(() => {
                interpretador = new InterpretadorPortugolStudioComDepuracao(
                    process.cwd(),
                    funcaoSaida,
                    funcaoSaida
                );
            });

            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    "programa {",
                    "  funcao inicio() {",
                    '    escreva("Olá mundo!")',
                    "  }",
                    "}"
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                let execucaoFinalizada: boolean = false;
                interpretador.finalizacaoDaExecucao = () => {
                    execucaoFinalizada = true;
                }

                interpretador.prepararParaDepuracao(retornoAvaliadorSintatico.declaracoes);
                await interpretador.instrucaoContinuarInterpretacao();

                expect(interpretador.pontoDeParadaAtivo).toBe(false);
                expect(execucaoFinalizada).toBe(true);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toContain("Olá mundo!");
            });
        });
    });
});
