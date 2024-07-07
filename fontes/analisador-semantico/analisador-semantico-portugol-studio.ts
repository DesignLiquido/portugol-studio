import {
    Const,
    Declaracao,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    FuncaoDeclaracao,
    Var
} from '@designliquido/delegua/declaracoes';

import { AnalisadorSemanticoBase } from '@designliquido/delegua/analisador-semantico/analisador-semantico-base';
import { SimboloInterface } from '@designliquido/delegua/interfaces';
import { DiagnosticoAnalisadorSemantico, DiagnosticoSeveridade } from '@designliquido/delegua/interfaces/erros';
import { FuncaoHipoteticaInterface } from '@designliquido/delegua/interfaces/funcao-hipotetica-interface';
import { RetornoAnalisadorSemantico } from '@designliquido/delegua/interfaces/retornos/retorno-analisador-semantico';
import { VariavelHipoteticaInterface } from '@designliquido/delegua/interfaces/variavel-hipotetica-interface';

import { PilhaVariaveis } from './pilha-variaveis';
import {
    AtribuicaoPorIndice,
    Atribuir,
    Chamada,
    FormatacaoEscrita,
    FuncaoConstruto,
    Literal,
    Variavel,
    Vetor,
} from '@designliquido/delegua/construtos';
import { inferirTipoVariavel } from 'fontes/interpretador/inferenciador';
export class AnalisadorSemanticoPortugolStudio extends AnalisadorSemanticoBase {
    pilhaVariaveis: PilhaVariaveis;
    variaveis: { [nomeVariavel: string]: VariavelHipoteticaInterface };
    funcoes: { [nomeFuncao: string]: FuncaoHipoteticaInterface };
    atual: number;
    diagnosticos: DiagnosticoAnalisadorSemantico[];
    corpoMetodoPrincipal = []

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

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        declaracao.argumentos.forEach((argumento) => {
            if (argumento instanceof Variavel) {
                if (!this.variaveis[argumento.simbolo.lexema]) {
                    this.adicionarDiagnostico(
                        argumento.simbolo,
                        `Variável não declarada: ${argumento.simbolo.lexema}`
                    )
                    //return Promise.resolve();
                }
            }
        });
        return Promise.resolve()
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<any> {
        for (let parametro of declaracao.funcao.parametros) {
            if (parametro.hasOwnProperty('tipoDado') && !parametro.tipoDado.tipo) {
                this.adicionarDiagnostico(declaracao.simbolo, `O tipo '${parametro.tipoDado.tipoInvalido}' não é valido`);
            }
        }

        if (declaracao.funcao.parametros.length >= 255) {
            this.adicionarDiagnostico(declaracao.simbolo, 'Não pode haver mais de 255 parâmetros');
        }

        this.funcoes[declaracao.simbolo.lexema] = {
            valor: declaracao.funcao,
        };
        return Promise.resolve()
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: false,
            tipo: declaracao.tipo,
            valor:
                declaracao.inicializador !== null
                    ? declaracao.inicializador.valor !== undefined
                        ? declaracao.inicializador.valor
                        : declaracao.inicializador
                    : undefined,
            valorDefinido: true
        };
        return Promise.resolve();
    }

    visitarExpressaoDeVariavel(expressao: Variavel): Promise<any> {
        /* TODO - Atualmente o tipo "caracter vem como instância de variável,
        causando assim erros como reportado na issue #31
         */
        return Promise.resolve()
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        const { simbolo, valor } = expressao;
        let variavel = this.variaveis[simbolo.lexema];
        if (!variavel) {
            this.adicionarDiagnostico(simbolo, `Variável não declarada: ${simbolo.lexema}.`);
            return Promise.resolve();
        }

        if (variavel.imutavel) {
            this.adicionarDiagnostico(
                simbolo,
                "Não é possível alterar o valor de uma constante."
            );
            return Promise.resolve();
        }

        if (variavel.tipo) {
            if (valor instanceof Literal) {
                let valorLiteral = typeof (valor as Literal).valor;
                if (valorLiteral === 'string') {
                    if (!['cadeia', 'caracter'].includes(variavel.tipo.toLowerCase())) {
                        this.adicionarDiagnostico(simbolo, `Esperado tipo '${variavel.tipo}' na atribuição.`);
                        return Promise.resolve();
                    }
                }
                if (valorLiteral === 'number') {
                    if (!['inteiro', 'real'].includes(variavel.tipo.replace("[]", "").toLowerCase())) {
                        this.adicionarDiagnostico(simbolo, `Esperado tipo '${variavel.tipo.replace("[]", "")}' na atribuição.`);
                        return Promise.resolve();
                    }
                }
            }
        }

        if (variavel) {
            this.variaveis[simbolo.lexema].valor = valor;
        }
    }

    visitarExpressaoDeChamada(expressao: Chamada): Promise<any> {
        if (expressao.entidadeChamada instanceof Variavel) {
            const variavel = expressao.entidadeChamada as Variavel;
            const funcaoChamada = this.variaveis[variavel.simbolo.lexema] || this.funcoes[variavel.simbolo.lexema];
            if (!funcaoChamada) {
                this.adicionarDiagnostico(variavel.simbolo, `Função não declarada: ${variavel.simbolo.lexema}`);
                return Promise.resolve();
            }

            const funcao = funcaoChamada.valor as FuncaoConstruto;
            if (funcao.parametros.length != expressao.argumentos.length) {
                this.adicionarDiagnostico(
                    variavel.simbolo,
                    `Esperava ${funcao.parametros.length} ${funcao.parametros.length > 1 ? 'parâmetros' : 'parâmetro'
                    }, mas foi passado ${expressao.argumentos.length}.`
                );
            }

            for (let [indice, argumento] of expressao.argumentos.entries()) {
                const parametroCorrespondente = funcao.parametros[indice];
                if (parametroCorrespondente.tipoDado) {
                    const tipoDadoParametro = parametroCorrespondente.tipoDado.tipo.toLowerCase();

                    if (argumento instanceof Variavel) {
                        const lexemaVariavelCorrespondente = (argumento as Variavel).simbolo.lexema;
                        const tipoVariavelCorrespondente = this.variaveis[lexemaVariavelCorrespondente].tipo.toLowerCase();

                        if (tipoVariavelCorrespondente !== tipoDadoParametro) {
                            this.adicionarDiagnostico(
                                variavel.simbolo,
                                `O tipo do valor passado para o parâmetro '${parametroCorrespondente.nome.lexema}' (${tipoVariavelCorrespondente}) é diferente do esperado pela função (${tipoDadoParametro}).`
                            );
                        }
                    }

                    if (argumento instanceof Literal) {
                        switch (argumento.valor.constructor.name) {
                            case 'Number':
                                if (!['inteiro', 'real'].includes(tipoDadoParametro)) {
                                    this.adicionarDiagnostico(
                                        variavel.simbolo,
                                        `O tipo do valor passado para o parâmetro '${parametroCorrespondente.nome.lexema}' (inteiro ou real) é diferente do esperado pela função (${tipoDadoParametro}).`
                                    );
                                }
                                break;
                        }
                    }
                }
                else {
                    this.adicionarDiagnostico(
                        variavel.simbolo,
                        "Tipo de dados não especificado"
                    );
                }
            }
        }

        return Promise.resolve();
    }

    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> {
        const atribuir = new Atribuir(
            expressao.hashArquivo,
            expressao.objeto.simbolo,
            expressao.valor,
            expressao.indice
        )

        this.visitarExpressaoDeAtribuicao(atribuir)
        return Promise.resolve()
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        switch (declaracao.expressao.constructor.name) {
            case 'Atribuir':
                this.visitarExpressaoDeAtribuicao(declaracao.expressao as Atribuir);
                break;
            case 'Chamada':
                this.visitarExpressaoDeChamada(declaracao.expressao as Chamada);
                break;
            case 'Variavel':
                this.visitarExpressaoDeVariavel(declaracao.expressao as Variavel);
                break;
            case 'AtribuicaoPorIndice':
                this.visitarExpressaoAtribuicaoPorIndice(declaracao.expressao as AtribuicaoPorIndice);
                break;
            default:
                console.log(declaracao.expressao);
                break;
        }

        return Promise.resolve();
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: true,
            tipo: declaracao.tipo,
            valor:
                declaracao.inicializador !== null
                    ? declaracao.inicializador.valor !== undefined
                        ? declaracao.inicializador.valor
                        : declaracao.inicializador
                    : undefined,
            valorDefinido: true
        };
        return Promise.resolve();
    }

    analisar(declaracoes: Declaracao[]): RetornoAnalisadorSemantico {
        this.variaveis = {};
        this.atual = 0;
        this.diagnosticos = [];
        this.corpoMetodoPrincipal = [];

        const declaracaoMetodoPrincipal = declaracoes.find(declaracao =>
            declaracao instanceof FuncaoDeclaracao && declaracao.simbolo.lexema === "inicio"
        );


        if (declaracaoMetodoPrincipal) {
            this.corpoMetodoPrincipal = (declaracaoMetodoPrincipal as FuncaoDeclaracao).funcao.corpo;
        }

        for (const declaracao of declaracoes) {
            if (declaracao instanceof FuncaoDeclaracao) {
                if (declaracao.simbolo.lexema !== "inicio") {
                    declaracao.aceitar(this)
                }
            }
        }
        while (this.atual < this.corpoMetodoPrincipal.length) {
            this.corpoMetodoPrincipal[this.atual].aceitar(this)
            this.atual++;
        }
        
        return {
            diagnosticos: this.diagnosticos,
        } as RetornoAnalisadorSemantico;
    }

}