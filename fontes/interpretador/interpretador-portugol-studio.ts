import { Importar, Leia } from '@designliquido/delegua/declaracoes';
import { InterpretadorBase } from '@designliquido/delegua/interpretador/interpretador-base';
import { EscopoExecucao } from '@designliquido/delegua/interfaces/escopo-execucao';
import { EspacoVariaveis } from '@designliquido/delegua/espaco-variaveis';
import { DeleguaModulo } from '@designliquido/delegua/estruturas';

import { Matriz } from '../construtos/matriz';
import { PilhaEscoposExecucaoPortugolStudio } from './pilha-escopos-execucao-portugol-studio';
import * as comum from './comum';

export class InterpretadorPortugolStudio extends InterpretadorBase {
    constructor(diretorioBase: string, performance = false, funcaoDeRetorno: Function = null) {
        super(diretorioBase, performance, funcaoDeRetorno);
        this.pilhaEscoposExecucao = new PilhaEscoposExecucaoPortugolStudio();
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
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
}
