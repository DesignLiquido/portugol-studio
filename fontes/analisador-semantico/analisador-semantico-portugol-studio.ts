import {
    Declaracao,
    Escreva,
    EscrevaMesmaLinha
} from '@designliquido/delegua/declaracoes';

import { AnalisadorSemanticoBase } from '@designliquido/delegua/analisador-semantico/analisador-semantico-base';
import { SimboloInterface } from '@designliquido/delegua/interfaces';
import { DiagnosticoAnalisadorSemantico, DiagnosticoSeveridade } from '@designliquido/delegua/interfaces/erros';
import { FuncaoHipoteticaInterface } from '@designliquido/delegua/interfaces/funcao-hipotetica-interface';
import { RetornoAnalisadorSemantico } from '@designliquido/delegua/interfaces/retornos/retorno-analisador-semantico';
import { VariavelHipoteticaInterface } from '@designliquido/delegua/interfaces/variavel-hipotetica-interface';

import { PilhaVariaveis } from './pilha-variaveis';
export class AnalisadorSemanticoPortugolStudio extends AnalisadorSemanticoBase {
    pilhaVariaveis: PilhaVariaveis;
    variaveis: { [nomeVariavel: string]: VariavelHipoteticaInterface };
    funcoes: { [nomeFuncao: string]: FuncaoHipoteticaInterface };
    atual: number;
    diagnosticos: DiagnosticoAnalisadorSemantico[];

    constructor() {
        super();
        this.pilhaVariaveis = new PilhaVariaveis();
        this.variaveis = {};
        this.funcoes = {};
        this.atual = 0;
        this.diagnosticos = [];
    }

    adicionarDiagnostico(
        simbolo: SimboloInterface,
        mensagem: string,
        severidade: DiagnosticoSeveridade = DiagnosticoSeveridade.ERRO
    ): void {
        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: severidade,
        });
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any>{
        console.log(declaracao)

        return Promise.resolve()
    }
    visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any>{
        console.log(declaracao)

        return Promise.resolve()
    }

    analisar(declaracoes: Declaracao[]): RetornoAnalisadorSemantico {
        this.variaveis = {};
        this.atual = 0;
        this.diagnosticos = [];
        while (this.atual < declaracoes.length) {
            console.log(declaracoes[this.atual])
            declaracoes[this.atual].aceitar(this);
            this.atual++;
        }

        return {
            diagnosticos: this.diagnosticos,
        } as RetornoAnalisadorSemantico;
    }

}