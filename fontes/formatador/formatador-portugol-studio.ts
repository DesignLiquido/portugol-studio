import { VisitanteComumInterface } from '@designliquido/delegua/interfaces';
import {
    Aleatorio,
    Bloco,
    CabecalhoPrograma,
    Classe,
    Const,
    ConstMultiplo,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    InicioAlgoritmo,
    Leia,
    LeiaMultiplo,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    TendoComo,
    Tente,
    Var,
    VarMultiplo,
} from '@designliquido/delegua/declaracoes';
import {
    AcessoIndiceVariavel,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    DefinirValor,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    FuncaoConstruto,
    Isto,
    Literal,
    Logico,
    Super,
    TipoDe,
    Tupla,
    Unario,
    Variavel,
    Vetor,
} from '@designliquido/delegua/construtos';
import { ContinuarQuebra, SustarQuebra } from '@designliquido/delegua/quebras';

import tiposDeSimbolos from '../tipos-de-simbolos/lexico-regular';

export class FormatadorPortugolStudio implements VisitanteComumInterface {
    indentacaoAtual: number;
    quebraLinha: string;
    tamanhoIndentacao: number;
    codigoFormatado: string;
    devePularLinha: boolean;
    deveIndentar: boolean;

    constructor(quebraLinha: string, tamanhoIndentacao: number = 4) {
        this.quebraLinha = quebraLinha;
        this.tamanhoIndentacao = tamanhoIndentacao;

        this.indentacaoAtual = 0;
        this.codigoFormatado = '';
        this.devePularLinha = true;
        this.deveIndentar = true;
    }

    visitarDeclaracaoTendoComo(declaracao: TendoComo): void | Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoClasse(declaracao: Classe) {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoConst(declaracao: Const): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}const ${declaracao.tipo} ${
            declaracao.simbolo.lexema
        }`;
        if (declaracao.inicializador) {
            this.codigoFormatado += ` = `;
            this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
        }

        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
    }
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        if (
            expressao.valor instanceof Binario &&
            [
                tiposDeSimbolos.MAIS_IGUAL,
                tiposDeSimbolos.MENOS_IGUAL,
                tiposDeSimbolos.MULTIPLICACAO_IGUAL,
                tiposDeSimbolos.DIVISAO_IGUAL,
            ].includes(expressao.valor.operador.tipo)
        ) {
            this.visitarExpressaoBinaria(expressao.valor);
        } else {
            if (this.deveIndentar) {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
            }
            this.codigoFormatado += `${expressao.simbolo.lexema} = `;
            this.formatarDeclaracaoOuConstruto(expressao.valor);
        }

        if (this.devePularLinha) {
            this.codigoFormatado += `${this.quebraLinha}`;
        }
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        this.formatarDeclaracaoOuConstruto(declaracao.expressao);
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}funcao ${declaracao.simbolo.lexema}() {${
            this.quebraLinha
        }`;

        this.visitarExpressaoFuncaoConstruto(declaracao.funcao);
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}enquanto( `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.codigoFormatado += ` ) {`;
        this.codigoFormatado += this.quebraLinha;
        this.formatarDeclaracaoOuConstruto(declaracao.corpo);
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarDeclaracaoEscolha(declaracao: Escolha) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}escolha `;
        this.formatarDeclaracaoOuConstruto(declaracao.identificadorOuLiteral);
        this.codigoFormatado += ` {${this.quebraLinha}`;

        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let caminho of declaracao.caminhos) {
            for (let declaracoes of caminho.condicoes) {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}caso `;
                this.formatarDeclaracaoOuConstruto(declaracoes);
                this.codigoFormatado += ':';
                this.codigoFormatado += this.quebraLinha;
            }

            for (let declaracoes of caminho.declaracoes) {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
                this.formatarDeclaracaoOuConstruto(declaracoes);
            }
        }

        for (let padrao of declaracao.caminhoPadrao.declaracoes) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}caso contrario:`;
            this.codigoFormatado += this.quebraLinha;
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
            this.formatarDeclaracaoOuConstruto(padrao);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarDeclaracaoEscreva(declaracao: Escreva) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}escreva(`;
        for (let argumento of declaracao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
        }

        this.codigoFormatado += `)${this.quebraLinha}`;
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}escreva(`;
        for (let argumento of declaracao.argumentos) {
            const argumentoTratado = argumento as FormatacaoEscrita;
            this.formatarDeclaracaoOuConstruto(argumentoTratado);
            this.codigoFormatado += ', ';
        }
        if (declaracao.argumentos.length && this.codigoFormatado[this.codigoFormatado.length - 2] === ',') {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }
        this.codigoFormatado += `)${this.quebraLinha}`;
    }

    visitarDeclaracaoFazer(declaracao: Fazer) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}faca {${this.quebraLinha}`;
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracao.caminhoFazer.declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}} enquanto( `;
        this.devePularLinha = false;
        this.formatarDeclaracaoOuConstruto(declaracao.condicaoEnquanto);

        this.codigoFormatado += `)${this.quebraLinha}`;
        this.devePularLinha = true;
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoPara(declaracao: Para): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}para( `;
        this.devePularLinha = false;

        if (declaracao.inicializador) {
            this.deveIndentar = false;
            if (Array.isArray(declaracao.inicializador)) {
                for (let declaracaoInicializador of declaracao.inicializador) {
                    this.formatarDeclaracaoOuConstruto(declaracaoInicializador);
                }
            } else {
                this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
            }
            this.deveIndentar = true;
        }

        this.codigoFormatado += `; `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);

        this.codigoFormatado += `; `;
        this.formatarDeclaracaoOuConstruto(declaracao.incrementar);
        this.devePularLinha = true;
        this.codigoFormatado += `) {${this.quebraLinha}`;

        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracao.corpo.declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoSe(declaracao: Se) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}se( `;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.codigoFormatado += ` ) {${this.quebraLinha}`;

        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of (declaracao.caminhoEntao as Bloco).declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        if (declaracao.caminhoSenao) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}} senao {${this.quebraLinha}`;
            this.formatarDeclaracaoOuConstruto(declaracao.caminhoSenao);
        }
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }
    visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error('Método não implementado');
    }
    visitarDeclaracaoVar(declaracao: Var): any {
        if (declaracao.tipo) {
            let tipoDado;

            switch (declaracao.tipo) {
                case 'inteiro[]':
                    tipoDado = 'inteiro';
                    break;
                case 'texto[]':
                case 'caracter[]':
                    tipoDado = 'caracter';
                    break;
                default:
                    tipoDado = declaracao.tipo;
                    break;
            }

            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}${tipoDado} ${declaracao.simbolo.lexema}`;

            if (declaracao.inicializador instanceof Vetor) {
                this.codigoFormatado += `[${declaracao.inicializador.valores.length}]`;
            }
            this.codigoFormatado += ` = `;
            this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
            if (this.devePularLinha) {
                this.codigoFormatado += this.quebraLinha;
            }
        } else {
            console.log('Eu passo aqui');

            this.codigoFormatado += `${declaracao.simbolo.lexema} = `;
            this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
        }
    }
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel) {
        this.formatarDeclaracaoOuConstruto(expressao.entidadeChamada);
        this.codigoFormatado += `[`;
        this.formatarDeclaracaoOuConstruto(expressao.indice);
        this.codigoFormatado += `]`;
    }
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoAcessoMetodo(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoAgrupamento(expressao: Agrupamento): any {
        this.codigoFormatado += '(';
        this.formatarDeclaracaoOuConstruto(expressao.expressao);
        this.codigoFormatado += ')';
    }
    visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoBinaria(expressao: Binario) {
        this.formatarDeclaracaoOuConstruto(expressao.esquerda);
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                this.codigoFormatado += ' + ';
                break;
            case tiposDeSimbolos.DIVISAO:
                this.codigoFormatado += ' / ';
                break;
            case tiposDeSimbolos.DIVISAO_INTEIRA:
                this.codigoFormatado += '  ';
                break;
            case tiposDeSimbolos.IGUAL:
                this.codigoFormatado += ' = ';
                break;
            case tiposDeSimbolos.IGUAL_IGUAL:
                this.codigoFormatado += ' == ';
                break;
            case tiposDeSimbolos.MAIOR:
                this.codigoFormatado += ' > ';
                break;
            case tiposDeSimbolos.MAIOR_IGUAL:
                this.codigoFormatado += ' >= ';
                break;
            case tiposDeSimbolos.MENOR:
                this.codigoFormatado += ' < ';
                break;
            case tiposDeSimbolos.MENOR_IGUAL:
                this.codigoFormatado += ' <= ';
                break;
            case tiposDeSimbolos.SUBTRACAO:
                this.codigoFormatado += ` - `;
                break;
            case tiposDeSimbolos.MULTIPLICACAO:
                this.codigoFormatado += ` * `;
                break;
            case tiposDeSimbolos.MODULO:
                this.codigoFormatado += ` % `;
                break;
            default:
                console.log(expressao.operador.tipo);
                break;
        }
        this.formatarDeclaracaoOuConstruto(expressao.direita);
    }
    visitarExpressaoBloco(declaracao: Bloco): any {
        this.formatarBlocoOuVetorDeclaracoes(declaracao.declaracoes);
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Método não implementado');
    }
    visitarExpressaoDeChamada(expressao: any) {
        /*         console.log(expressao);
         */
    }
    visitarExpressaoDefinirValor(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoDeVariavel(expressao: Variavel) {
        this.codigoFormatado += `${expressao.simbolo.lexema}`;
    }
    visitarExpressaoDicionario(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        throw new Error('Método não implementado');
    }

    visitarExpressaoFalhar(expressao: any): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto) {
        this.indentacaoAtual += this.tamanhoIndentacao;

        for (let declaracaoCorpo of expressao.corpo) {
            this.formatarDeclaracaoOuConstruto(declaracaoCorpo);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
    }
    visitarExpressaoIsto(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoLeia(expressao: Leia): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}leia(`;
        for (let argumento of expressao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
            this.codigoFormatado += `, `;
        }

        if (expressao.argumentos.length > 0) {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }

        this.codigoFormatado += `)${this.quebraLinha}`;
    }
    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any> {
        throw new Error('Método não implementado');
    }

    visitarExpressaoLiteral(expressao: Literal): any {
        if (typeof expressao.valor === 'string') {
            this.codigoFormatado += `"${expressao.valor}"`;
            return;
        }
        if (typeof expressao.valor === 'boolean') {
            switch (expressao.valor) {
                case true:
                    this.codigoFormatado += 'verdadeiro';
                    break;
                default:
                    this.codigoFormatado += 'falso';
                    break;
            }
            return;
        }

        this.codigoFormatado += `${expressao.valor}`;
    }

    visitarExpressaoLogica(expressao: any) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoRetornar(declaracao: Retorna): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}retorne`;
        if (declaracao.valor) {
            this.codigoFormatado += ` `;
            this.formatarDeclaracaoOuConstruto(declaracao.valor);
        }

        this.codigoFormatado += `${this.quebraLinha}`;
    }
    visitarExpressaoSuper(expressao: Super) {
        throw new Error('Método não implementado');
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        throw new Error('Método não implementado');
    }
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        throw new Error('Método não implementado');
    }
    visitarExpressaoUnaria(expressao: Unario) {
        let operador: string;
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.INCREMENTAR:
                operador = `++`;
                break;
            case tiposDeSimbolos.DECREMENTAR:
                operador = `--`;
                break;
            case tiposDeSimbolos.NEGACAO:
                operador = 'nao ';
                break;
            default:
                console.log(expressao.operador.tipo);
                break;
        }

        switch (expressao.incidenciaOperador) {
            case 'ANTES':
                this.codigoFormatado += operador;
                this.formatarDeclaracaoOuConstruto(expressao.operando);
                break;
            case 'DEPOIS':
                this.formatarDeclaracaoOuConstruto(expressao.operando);
                this.codigoFormatado += operador;
                break;
        }

        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
    }
    visitarExpressaoVetor(expressao: Vetor): void {
        this.codigoFormatado += '[';
        for (let valor of expressao.valores) {
            this.formatarDeclaracaoOuConstruto(valor);
            this.codigoFormatado += ', ';
        }

        if (expressao.valores.length > 0) {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }

        this.codigoFormatado += `]`;
    }

    formatarDeclaracaoOuConstruto(declaracaoOuConstruto: Declaracao | Construto): void {
        switch (declaracaoOuConstruto.constructor.name) {
            case 'AcessoIndiceVariavel':
                this.visitarExpressaoAcessoIndiceVariavel(declaracaoOuConstruto as AcessoIndiceVariavel);
                break;
            case 'AcessoMetodoOuPropriedade':
                this.visitarExpressaoAcessoMetodo(declaracaoOuConstruto as AcessoMetodoOuPropriedade);
                break;
            case 'Agrupamento':
                this.visitarExpressaoAgrupamento(declaracaoOuConstruto as Agrupamento);
                break;
            case 'AtribuicaoPorIndice':
                this.visitarExpressaoAtribuicaoPorIndice(declaracaoOuConstruto as AtribuicaoPorIndice);
                break;
            case 'Atribuir':
                this.visitarExpressaoDeAtribuicao(declaracaoOuConstruto as Atribuir);
                break;
            case 'Binario':
                this.visitarExpressaoBinaria(declaracaoOuConstruto as Binario);
                break;
            case 'Bloco':
                this.visitarExpressaoBloco(declaracaoOuConstruto as Bloco);
                break;
            case 'Chamada':
                this.visitarExpressaoDeChamada(declaracaoOuConstruto as Chamada);
                break;
            case 'Classe':
                this.visitarDeclaracaoClasse(declaracaoOuConstruto as Classe);
                break;
            case 'Continua':
                this.visitarExpressaoContinua(declaracaoOuConstruto as Continua);
                break;
            case 'DefinirValor':
                this.visitarExpressaoDefinirValor(declaracaoOuConstruto as DefinirValor);
                break;
            case 'Dicionario':
                this.visitarExpressaoDicionario(declaracaoOuConstruto as Dicionario);
                break;
            case 'Escolha':
                this.visitarDeclaracaoEscolha(declaracaoOuConstruto as Escolha);
                break;
            case 'Enquanto':
                this.visitarDeclaracaoEnquanto(declaracaoOuConstruto as Enquanto);
                break;
            case 'Escreva':
                this.visitarDeclaracaoEscreva(declaracaoOuConstruto as Escreva);
                break;
            case 'EscrevaMesmaLinha':
                this.visitarDeclaracaoEscrevaMesmaLinha(declaracaoOuConstruto as Escreva);
                break;
            case 'Expressao':
                this.visitarDeclaracaoDeExpressao(declaracaoOuConstruto as Expressao);
                break;
            case 'ExpressaoRegular':
                this.visitarExpressaoExpressaoRegular(declaracaoOuConstruto as ExpressaoRegular);
                break;
            case 'Falhar':
                this.visitarExpressaoFalhar(declaracaoOuConstruto as Falhar);
                break;
            case 'Fazer':
                this.visitarDeclaracaoFazer(declaracaoOuConstruto as Fazer);
                break;
            case 'FuncaoConstruto':
                this.visitarExpressaoFuncaoConstruto(declaracaoOuConstruto as FuncaoConstruto);
                break;
            case 'FuncaoDeclaracao':
                this.visitarDeclaracaoDefinicaoFuncao(declaracaoOuConstruto as FuncaoDeclaracao);
                break;
            case 'Importar':
                this.visitarDeclaracaoImportar(declaracaoOuConstruto as Importar);
                break;
            case 'Isto':
                this.visitarExpressaoIsto(declaracaoOuConstruto as Isto);
                break;
            case 'Leia':
                this.visitarExpressaoLeia(declaracaoOuConstruto as Leia);
                break;
            case 'Literal':
                this.visitarExpressaoLiteral(declaracaoOuConstruto as Literal);
                break;
            case 'Logico':
                this.visitarExpressaoLogica(declaracaoOuConstruto as Logico);
                break;
            case 'Para':
                this.visitarDeclaracaoPara(declaracaoOuConstruto as Para);
                break;
            case 'ParaCada':
                this.visitarDeclaracaoParaCada(declaracaoOuConstruto as ParaCada);
                break;
            case 'Retorna':
                this.visitarExpressaoRetornar(declaracaoOuConstruto as Retorna);
                break;
            case 'Se':
                this.visitarDeclaracaoSe(declaracaoOuConstruto as Se);
                break;
            case 'Super':
                this.visitarExpressaoSuper(declaracaoOuConstruto as Super);
                break;
            case 'Sustar':
                this.visitarExpressaoSustar(declaracaoOuConstruto as Sustar);
                break;
            case 'Tente':
                this.visitarDeclaracaoTente(declaracaoOuConstruto as Tente);
                break;
            case 'TipoDe':
                this.visitarExpressaoTipoDe(declaracaoOuConstruto as TipoDe);
                break;
            case 'Unario':
                this.visitarExpressaoUnaria(declaracaoOuConstruto as Unario);
                break;
            case 'Const':
                this.visitarDeclaracaoConst(declaracaoOuConstruto as Const);
                break;
            case 'Var':
                this.visitarDeclaracaoVar(declaracaoOuConstruto as Var);
                break;
            case 'Variavel':
                this.visitarExpressaoDeVariavel(declaracaoOuConstruto as Variavel);
                break;
            case 'Vetor':
                this.visitarExpressaoVetor(declaracaoOuConstruto as Vetor);
                break;
            default:
                console.log(declaracaoOuConstruto.constructor.name);
                break;
        }
    }

    private formatarBlocoOuVetorDeclaracoes(declaracoes: Declaracao[]) {
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }
        this.indentacaoAtual -= this.tamanhoIndentacao;
    }

    formatar(declaracoes: Declaracao[]): string {
        this.indentacaoAtual = 0;
        this.codigoFormatado = `programa {${this.quebraLinha}`;
        this.devePularLinha = true;
        this.deveIndentar = true;
        this.indentacaoAtual += this.tamanhoIndentacao;

        for (let declaracao of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracao);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `}${this.quebraLinha}`;

        return this.codigoFormatado;
    }
}
