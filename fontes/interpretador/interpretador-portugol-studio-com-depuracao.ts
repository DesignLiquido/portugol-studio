import { Importar, Leia } from '@designliquido/delegua/declaracoes';
import { InterpretadorComDepuracao } from '@designliquido/delegua/interpretador/interpretador-com-depuracao';
import { PilhaEscoposExecucaoPortugolStudio } from './pilha-escopos-execucao-portugol-studio';
import { DeleguaModulo } from '@designliquido/delegua/estruturas';

import { Matriz } from '../construtos/matriz';
import * as comum from './comum';

export class InterpretadorPortugolStudioComDepuracao extends InterpretadorComDepuracao {
    mensagemPrompt: string;

    constructor(diretorioBase: string, funcaoDeRetorno: Function = null, funcaoDeRetornoMesmaLinha: Function = null) {
        super(diretorioBase, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.mensagemPrompt = '> ';
        this.pilhaEscoposExecucao = new PilhaEscoposExecucaoPortugolStudio();
    }

    async visitarDeclaracaoImportar(declaracao: Importar): Promise<DeleguaModulo> {
        return comum.visitarExpressaoImportarComum(declaracao);
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        return comum.visitarExpressaoLeiaComum(this.interfaceEntradaSaida, this.pilhaEscoposExecucao, expressao);
    }

    async visitarExpressaoMatriz(expressao: Matriz): Promise<any> {
        return comum.visitarExpressaoMatrizComum(this, expressao);
    }

    /**
     * No Portugol Studio, como o bloco de execução da função `inicio` é criado
     * pelo avaliador sintático, precisamos ter uma forma aqui de avançar o
     * primeiro bloco pós execução de comando, seja ele qual for.
     */
    private avancarPrimeiroEscopoAposInstrucao(): void {
        const escopoUm = this.pilhaEscoposExecucao.naPosicao(1);
        if (!escopoUm) return;
        escopoUm.declaracaoAtual = escopoUm.declaracoes.length;
    }

    async instrucaoContinuarInterpretacao(escopo?: number): Promise<any> {
        const retornoExecucao = await super.instrucaoContinuarInterpretacao(escopo);
        this.avancarPrimeiroEscopoAposInstrucao();
        return retornoExecucao;
    }

    async instrucaoPasso(escopo?: number): Promise<any> {
        const retornoExecucaoPasso = await super.instrucaoPasso(escopo);
        this.avancarPrimeiroEscopoAposInstrucao();
        return retornoExecucaoPasso;
    }
}
