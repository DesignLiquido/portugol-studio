import { EscopoExecucao } from '@designliquido/delegua/interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '@designliquido/delegua/interfaces/pilha-escopos-execucao-interface';
import { SimboloInterface, VariavelInterface } from '@designliquido/delegua/interfaces';
import { Simbolo } from '@designliquido/delegua/lexador';
import { ErroEmTempoDeExecucao } from '@designliquido/delegua/excecoes';
import { DescritorTipoClasse, DeleguaFuncao } from '@designliquido/delegua/interpretador/estruturas';
import { EspacoMemoria } from '@designliquido/delegua/interpretador/espaco-memoria';

import { TipoInferencia, inferirTipoVariavel, converterValor } from './inferenciador';

export class PilhaEscoposExecucaoPortugolStudio implements PilhaEscoposExecucaoInterface {
    pilha: EscopoExecucao[];

    constructor() {
        this.pilha = [];
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            espacoMemoria: new EspacoMemoria(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.empilhar(escopoExecucao);
    }

    migrarReferenciaMontaoParaEscopoDeVariavel(nomeVariavel: string, enderecoMontao: string): void {
        throw new Error('Método não implementado.');
    }

    registrarReferenciaMontao(endereco: string): void {
        throw new Error('Método não implementado.');
    }

    obterTodasDeclaracoesClasse() {
        throw new Error('Método não implementado.');
    }

    empilhar(item: EscopoExecucao): void {
        this.pilha.push(item);
    }

    eVazio(): boolean {
        return this.pilha.length === 0;
    }

    elementos(): number {
        return this.pilha.length;
    }

    naPosicao(posicao: number): EscopoExecucao {
        return this.pilha[posicao];
    }

    topoDaPilha(): EscopoExecucao {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha[this.pilha.length - 1];
    }

    removerUltimo(): EscopoExecucao {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha.pop();
    }

    definirConstante(nomeConstante: string, valor: any, tipo?: string): void {
        const constante = this.pilha[this.pilha.length - 1].espacoMemoria.valores[nomeConstante];

        let tipoConstante;
        if (constante && constante.hasOwnProperty('tipo')) {
            tipoConstante = constante.tipo;
        } else if (tipo) {
            tipoConstante = tipo;
        } else {
            tipoConstante = inferirTipoVariavel(valor);
        }

        const tipoAbsoluto = tipoConstante.endsWith('[]') ? tipoConstante.slice(0, -2) : undefined;

        let elementoAlvo: VariavelInterface = {
            valor: converterValor(tipoConstante, valor),
            tipo: tipoConstante,
            subtipo: tipoAbsoluto,
            imutavel: true,
        };

        this.pilha[this.pilha.length - 1].espacoMemoria.valores[nomeConstante] = elementoAlvo;
    }

    definirVariavel(nomeVariavel: string, valor: any, tipo?: string) {
        let variavel: VariavelInterface;
        let profundidadeVariavel: number = 0;
        for (let i = 1; i <= this.pilha.length; i++) {
            profundidadeVariavel = this.pilha.length - i;
            const espacoMemoria = this.pilha[profundidadeVariavel].espacoMemoria;
            if (espacoMemoria.valores[nomeVariavel] !== undefined) {
                variavel = espacoMemoria.valores[nomeVariavel];
                break;
            }
        }

        let tipoVariavel;
        if (variavel && variavel.hasOwnProperty('tipo')) {
            tipoVariavel = variavel.tipo;
        } else if (tipo) {
            tipoVariavel = tipo;
        } else {
            tipoVariavel = inferirTipoVariavel(valor);
        }

        const tipoAbsoluto = tipoVariavel.endsWith('[]') ? tipoVariavel.slice(0, -2) : undefined;

        let elementoAlvo: VariavelInterface = {
            valor: converterValor(tipoVariavel, valor),
            tipo: tipoVariavel,
            subtipo: tipoAbsoluto,
            imutavel: false,
        };

        const profundadeResolvida = profundidadeVariavel > 0 ? profundidadeVariavel : this.pilha.length - 1;
        this.pilha[profundadeResolvida].espacoMemoria.valores[nomeVariavel] = elementoAlvo;
    }

    atribuirVariavelEm(distancia: number, simbolo: any, valor: any): void {
        const espacoMemoriaAncestral = this.pilha[this.pilha.length - distancia].espacoMemoria;
        if (espacoMemoriaAncestral.valores[simbolo.lexema].imutavel) {
            throw new ErroEmTempoDeExecucao(simbolo, `Constante '${simbolo.lexema}' não pode receber novos valores.`);
        }
        espacoMemoriaAncestral.valores[simbolo.lexema] = {
            valor,
            tipo: inferirTipoVariavel(valor) as any,
            imutavel: false,
        };
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const espacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria;
            if (espacoMemoria.valores[simbolo.lexema] !== undefined) {
                const variavel = espacoMemoria.valores[simbolo.lexema];
                if (variavel.imutavel) {
                    throw new ErroEmTempoDeExecucao(
                        simbolo,
                        `Constante '${simbolo.lexema}' não pode receber novos valores.`
                    );
                }
                const tipo = (
                    variavel && variavel.hasOwnProperty('tipo') ? variavel.tipo : inferirTipoVariavel(valor)
                ).toLowerCase() as TipoInferencia;

                const valorResolvido = converterValor(tipo, valor);
                espacoMemoria.valores[simbolo.lexema] = {
                    valor: valorResolvido,
                    tipo: tipo as any,
                    imutavel: false,
                };
                return;
            }
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexema + "'.");
    }

    obterEscopoPorTipo(tipo: string): EscopoExecucao | undefined {
        for (let i = 1; i <= this.pilha.length; i++) {
            const escopoAtual = this.pilha[this.pilha.length - i];
            if (escopoAtual.tipo === tipo) {
                return escopoAtual;
            }
        }

        return undefined;
    }

    obterVariavelEm(distancia: number, nome: string): VariavelInterface {
        const espacoMemoriaAncestral = this.pilha[this.pilha.length - distancia].espacoMemoria;
        return espacoMemoriaAncestral.valores[nome];
    }

    obterValorVariavel(simbolo: SimboloInterface): VariavelInterface {
        for (let i = 1; i <= this.pilha.length; i++) {
            const espacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria;
            if (espacoMemoria.valores[simbolo.lexema] !== undefined) {
                return espacoMemoria.valores[simbolo.lexema];
            }
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida: '" + simbolo.lexema + "'.");
    }

    obterVariavelPorNome(nome: string): VariavelInterface {
        for (let i = 1; i <= this.pilha.length; i++) {
            const espacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria;
            if (espacoMemoria.valores[nome] !== undefined) {
                return espacoMemoria.valores[nome];
            }
        }

        throw new ErroEmTempoDeExecucao(
            new Simbolo('especial', nome, nome, -1, -1),
            "Variável não definida: '" + nome + "'."
        );
    }

    /**
     * Método usado pelo depurador para obter todas as variáveis definidas.
     */
    obterTodasVariaveis(todasVariaveis: VariavelInterface[] = []): any[] {
        for (let i = 1; i <= this.pilha.length - 1; i++) {
            const valoresAmbiente = this.pilha[this.pilha.length - i].espacoMemoria.valores;

            const vetorObjeto: VariavelInterface[] = Object.entries(valoresAmbiente).map((chaveEValor, indice) => ({
                nome: chaveEValor[0],
                valor: chaveEValor[1].valor,
                tipo: chaveEValor[1].tipo,
                imutavel: chaveEValor[1].imutavel,
            }));
            todasVariaveis = todasVariaveis.concat(vetorObjeto);
        }

        return todasVariaveis;
    }

    /**
     * Obtém todas as funções declaradas ou por código-fonte, ou pelo desenvolvedor
     * em console, do último escopo.
     */
    obterTodasDeleguaFuncao(): { [nome: string]: DeleguaFuncao } {
        const retorno = {};
        const espacoMemoria = this.pilha[this.pilha.length - 1].espacoMemoria;
        for (const [nome, corpo] of Object.entries(espacoMemoria.valores)) {
            const corpoValor = corpo.hasOwnProperty('valor') ? corpo.valor : corpo;
            if (corpoValor instanceof DeleguaFuncao) {
                retorno[nome] = corpoValor;
            }
        }

        return retorno;
    }

    /**
     * Obtém todas as declarações de classe do último escopo.
     * @returns
     */
    obterTodasDeclaracaoClasse(): any {
        const retorno = {};
        const espacoMemoria = this.pilha[this.pilha.length - 1].espacoMemoria;
        for (const [nome, corpo] of Object.entries(espacoMemoria.valores)) {
            const corpoValor = corpo.hasOwnProperty('valor') ? corpo.valor : corpo;
            if (corpoValor instanceof DescritorTipoClasse) {
                retorno[nome] = corpoValor;
            }
        }

        return retorno;
    }

    registrarReferenciaFuncao(idFuncao: string, funcao: DeleguaFuncao): void {
        const espacoMemoriaAtual = this.pilha[this.pilha.length - 1].espacoMemoria;
        espacoMemoriaAtual.referenciasFuncoes[idFuncao] = funcao;
    }

    obterReferenciaFuncao(idFuncao: string): DeleguaFuncao {
        for (let i = 1; i <= this.pilha.length; i++) {
            const espacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria;
            if (espacoMemoria.referenciasFuncoes[idFuncao] !== undefined) {
                return espacoMemoria.referenciasFuncoes[idFuncao];
            }
        }

        throw new ErroEmTempoDeExecucao(
            new Simbolo('especial', idFuncao, idFuncao, -1, -1),
            "Referência para função não encontrada: '" + idFuncao + "'."
        );
    }
}
