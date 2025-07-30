import { EscrevaMesmaLinha, Importar } from '@designliquido/delegua/declaracoes';
import { InterpretadorBase } from '@designliquido/delegua/interpretador/interpretador-base';
import { EscopoExecucao } from '@designliquido/delegua/interfaces/escopo-execucao';
import { EspacoMemoria } from '@designliquido/delegua/interpretador/espaco-memoria';
import { DeleguaModulo } from '@designliquido/delegua/interpretador/estruturas';
import { Leia } from '@designliquido/delegua/construtos';

import { Matriz } from '../construtos/matriz';
import { PilhaEscoposExecucaoPortugolStudio } from './pilha-escopos-execucao-portugol-studio';
import { VisitantePortugolStudioInterface } from '../interfaces';
import { Limpa } from '../construtos';

import * as comum from './comum';

export class InterpretadorPortugolStudio extends InterpretadorBase implements VisitantePortugolStudioInterface {
    funcaoLimpa: Function = () => {
        console.warn('Função "limpa()" não está ligada a uma interface de entrada e saída.');
    };

    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoLimpa: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetorno);

        if (funcaoLimpa !== null) {
            this.funcaoLimpa = funcaoLimpa;
        }

        this.pilhaEscoposExecucao = new PilhaEscoposExecucaoPortugolStudio();
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            espacoMemoria: new EspacoMemoria(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
    }

    async visitarExpressaoLimpa(expressao: Limpa): Promise<any> {
        this.funcaoLimpa();
        return Promise.resolve();
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
        return comum.visitarExpressaoLeiaComum(this, this.interfaceEntradaSaida, expressao);
    }

    async visitarExpressaoMatriz(expressao: Matriz): Promise<any> {
        return comum.visitarExpressaoMatrizComum(this, expressao);
    }

    /**
     * Execução de uma escrita na saída padrão, sem quebras de linha, e sem remoção de espaços ao final.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        try {
            const formatoTexto: string = await comum.avaliarArgumentosEscreva(this, declaracao.argumentos);
            this.funcaoDeRetornoMesmaLinha(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: declaracao.linha,
                hashArquivo: declaracao.hashArquivo,
            });
        }
    }
}
