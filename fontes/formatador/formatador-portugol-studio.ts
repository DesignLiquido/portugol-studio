import { VisitanteComumInterface } from '@designliquido/delegua/interfaces';
import {
    Bloco,
    CabecalhoPrograma,
    Classe,
    Comentario,
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
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    TendoComo,
    Tente,
    TextoDocumentacao,
    Var,
    VarMultiplo,
} from '@designliquido/delegua/declaracoes';
import {
    AcessoIndiceVariavel,
    AcessoIntervaloVariavel,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    ComentarioComoConstruto,
    Construto,
    DefinirValor,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    FuncaoConstruto,
    ImportarComoConstruto,
    Isto,
    Leia,
    Literal,
    Logico,
    ReferenciaFuncao,
    Separador,
    Super,
    TipoDe,
    Tupla,
    TuplaN,
    Unario,
    Variavel,
    Vetor,
} from '@designliquido/delegua/construtos';
import { Matriz } from '../construtos/matriz';
import { Limpa } from '../construtos/limpa';
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

    /* istanbul ignore next */
    visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoIntervaloVariavel(expressao: AcessoIntervaloVariavel): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoTextoDocumentacao(declaracao: TextoDocumentacao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoSeparador(expressao: Separador): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoArgumentoReferenciaFuncao(expressao: ArgumentoReferenciaFuncao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoMetodoOuPropriedade(expressao: AcessoMetodoOuPropriedade): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoComentario(declaracao: Comentario): void | Promise<any> {
        if (declaracao.multilinha) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}/`;

            for (let linhaConteudo of declaracao.conteudo as string[]) {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}* ${linhaConteudo.replace(/\s+/g, ' ')}${this.quebraLinha}`;
            }

            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)} */${this.quebraLinha}`;
        } else {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}// `;
            this.codigoFormatado += (declaracao.conteudo as string).replace(/\s+/g, ' ');
            this.codigoFormatado += `${this.quebraLinha}`;
        }
    }

    /* istanbul ignore next */
    visitarDeclaracaoTendoComo(declaracao: TendoComo): void | Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarDeclaracaoClasse(declaracao: Classe) {
        throw new Error('Método não implementado');
    }

    visitarDeclaracaoConst(declaracao: Const): any {
        if (declaracao.inicializador) {
            if (declaracao.inicializador instanceof Importar) {
                this.visitarDeclaracaoImportar(declaracao.inicializador, declaracao.simbolo.lexema);
            } else if (declaracao.inicializador instanceof ImportarComoConstruto) {
                this.visitarExpressaoImportarComoConstruto(declaracao.inicializador, declaracao.simbolo.lexema);
            } else {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}const ${declaracao.tipo} ${
                    declaracao.simbolo.lexema
                }`;
                this.codigoFormatado += ` = `;

                this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
            }
        }

        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
    }

    /* istanbul ignore next */
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
            this.formatarDeclaracaoOuConstruto(expressao.alvo);
            this.codigoFormatado += ` = `;
            this.formatarDeclaracaoOuConstruto(expressao.valor);
        }

        if (this.devePularLinha) {
            this.codigoFormatado += `${this.quebraLinha}`;
        }
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        if (this.deveIndentar) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
        }

        this.formatarDeclaracaoOuConstruto(declaracao.expressao);
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}funcao ${declaracao.simbolo.lexema}()${this.quebraLinha}`;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}{${this.quebraLinha}`;

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
        this.codigoFormatado += `${this.quebraLinha}${' '.repeat(this.indentacaoAtual)}faca${this.quebraLinha}`;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}{${this.quebraLinha}`;
        this.indentacaoAtual += this.tamanhoIndentacao;

        for (let declaracaoBloco of declaracao.caminhoFazer.declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}enquanto (`;
        this.devePularLinha = false;
        this.formatarDeclaracaoOuConstruto(declaracao.condicaoEnquanto);

        this.codigoFormatado += `)${this.quebraLinha}`;
        this.devePularLinha = true;
    }

    visitarDeclaracaoImportar(declaracao: Importar, nomeConstante?: string) {
        // O caminho vem como um literal, mas na verdade não é bem um literal.
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}inclua biblioteca ${declaracao.caminho.valor}`;

        if (nomeConstante && nomeConstante.length > 0) {
            this.codigoFormatado += ` --> ${nomeConstante}`;
        }
    }

    visitarExpressaoImportarComoConstruto(expressao: ImportarComoConstruto, nomeConstante?: string) {
        // ImportarComoConstruto contém um Literal com o nome da biblioteca
        const nomeBiblioteca = (expressao as any).caminho?.valor || (expressao as any).valor;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}inclua biblioteca ${nomeBiblioteca}`;

        if (nomeConstante && nomeConstante.length > 0) {
            this.codigoFormatado += ` --> ${nomeConstante}`;
        }
    }

    visitarExpressaoMatriz(expressao: Matriz) {
        // Para Matriz, precisamos formatar as dimensões
        // Por exemplo, [500] para inteiro[500]
        for (let dimensao of expressao.dimensoes) {
            this.codigoFormatado += `[`;
            this.formatarDeclaracaoOuConstruto(dimensao);
            this.codigoFormatado += `]`;
        }
    }

    visitarDeclaracaoPara(declaracao: Para): any {
        this.codigoFormatado += `${this.quebraLinha}${' '.repeat(this.indentacaoAtual)}para (`;
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
        this.codigoFormatado += `)${this.quebraLinha}`;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}{${this.quebraLinha}`;

        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracao.corpo.declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    /* istanbul ignore next */
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error('Método não implementado');
    }

    visitarDeclaracaoSe(declaracao: Se) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}se (`;
        this.formatarDeclaracaoOuConstruto(declaracao.condicao);
        this.codigoFormatado += `) {${this.quebraLinha}`;

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

    /* istanbul ignore next */
    visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error('Método não implementado');
    }

    visitarDeclaracaoVar(declaracao: Var): any {
        if (declaracao.tipo) {
            let tipoDado: string;

            switch (declaracao.tipo) {
                case 'inteiro[]':
                    tipoDado = 'inteiro';
                    break;
                case 'texto[]':
                case 'caracter[]':
                    tipoDado = 'caracter';
                    break;
                case 'lógico':
                    tipoDado = 'logico';
                    break;
                default:
                    tipoDado = declaracao.tipo;
                    break;
            }

            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}${tipoDado} ${declaracao.simbolo.lexema}`;

            if (declaracao.inicializador) {
                // Se o inicializador é uma Matriz, não adicionamos ' = ', apenas formatamos as dimensões
                if (declaracao.inicializador instanceof Matriz) {
                    this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
                    if (this.devePularLinha) {
                        this.codigoFormatado += this.quebraLinha;
                    }
                } else if (declaracao.inicializador instanceof Vetor) {
                    this.codigoFormatado += `[${declaracao.inicializador.valores.length}]`;
                    this.codigoFormatado += ` = `;
                    this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
                    if (this.devePularLinha) {
                        this.codigoFormatado += this.quebraLinha;
                    }
                } else {
                    this.codigoFormatado += ` = `;
                    this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
                    if (this.devePularLinha) {
                        this.codigoFormatado += this.quebraLinha;
                    }
                }
            }
        } else {
            this.codigoFormatado += `${declaracao.simbolo.lexema} = `;
            this.formatarDeclaracaoOuConstruto(declaracao.inicializador);
        }
    }

    /* istanbul ignore next */
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        throw new Error('Método não implementado');
    }

    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel) {
        this.formatarDeclaracaoOuConstruto(expressao.entidadeChamada);
        this.codigoFormatado += `[`;
        this.formatarDeclaracaoOuConstruto(expressao.indice);
        this.codigoFormatado += `]`;
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        throw new Error('Método não implementado');
    }

    visitarExpressaoAcessoMetodo(expressao: any) {
        this.formatarDeclaracaoOuConstruto(expressao.objeto);
        this.codigoFormatado += `.${expressao.simbolo.lexema}`;
    }

    visitarExpressaoAgrupamento(expressao: Agrupamento): any {
        this.codigoFormatado += '(';
        this.formatarDeclaracaoOuConstruto(expressao.expressao);
        this.codigoFormatado += ')';
    }

    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): any {
        this.formatarDeclaracaoOuConstruto(expressao.objeto);
        this.codigoFormatado += '[';
        this.formatarDeclaracaoOuConstruto(expressao.indice);
        this.codigoFormatado += '] = ';
        this.formatarDeclaracaoOuConstruto(expressao.valor);
        this.codigoFormatado += this.quebraLinha;
    }

    /* istanbul ignore next */
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

    /* istanbul ignore next */
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Método não implementado');
    }

    visitarExpressaoDeChamada(expressao: Chamada) {
        this.formatarDeclaracaoOuConstruto(expressao.entidadeChamada);
        this.codigoFormatado += '(';

        for (let i = 0; i < expressao.argumentos.length; i++) {
            this.formatarDeclaracaoOuConstruto(expressao.argumentos[i]);
            if (i < expressao.argumentos.length - 1) {
                this.codigoFormatado += ', ';
            }
        }

        this.codigoFormatado += ')';
    }

    /* istanbul ignore next */
    visitarExpressaoDefinirValor(expressao: any) {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error('Método não implementado');
    }

    visitarExpressaoDeVariavel(expressao: Variavel) {
        this.codigoFormatado += `${expressao.simbolo.lexema}`;
    }

    /* istanbul ignore next */
    visitarExpressaoDicionario(expressao: any) {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoFalhar(expressao: any): Promise<any> {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
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

    /* istanbul ignore next */
    visitarExpressaoIsto(expressao: any) {
        throw new Error('Método não implementado');
    }

    visitarExpressaoLeia(expressao: Leia): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}leia(`;
        this.deveIndentar = false;
        for (let argumento of expressao.argumentos) {
            this.formatarDeclaracaoOuConstruto(argumento);
            this.codigoFormatado += `, `;
        }

        if (expressao.argumentos.length > 0) {
            this.codigoFormatado = this.codigoFormatado.slice(0, -2);
        }

        this.codigoFormatado += `)${this.quebraLinha}`;
        this.deveIndentar = true;
    }

    visitarExpressaoLimpa(expressao: Limpa): any {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}limpa()`;
        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
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

    /* istanbul ignore next */
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

    /* istanbul ignore next */
    visitarExpressaoSuper(expressao: Super) {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
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
        switch (declaracaoOuConstruto.constructor) {
            case AcessoIndiceVariavel:
                this.visitarExpressaoAcessoIndiceVariavel(declaracaoOuConstruto as AcessoIndiceVariavel);
                break;
            case AcessoMetodoOuPropriedade:
                this.visitarExpressaoAcessoMetodo(declaracaoOuConstruto as AcessoMetodoOuPropriedade);
                break;
            case Agrupamento:
                this.visitarExpressaoAgrupamento(declaracaoOuConstruto as Agrupamento);
                break;
            case AtribuicaoPorIndice:
                this.visitarExpressaoAtribuicaoPorIndice(declaracaoOuConstruto as AtribuicaoPorIndice);
                break;
            case Atribuir:
                this.visitarExpressaoDeAtribuicao(declaracaoOuConstruto as Atribuir);
                break;
            case Binario:
                this.visitarExpressaoBinaria(declaracaoOuConstruto as Binario);
                break;
            case Bloco:
                this.visitarExpressaoBloco(declaracaoOuConstruto as Bloco);
                break;
            case Chamada:
                this.visitarExpressaoDeChamada(declaracaoOuConstruto as Chamada);
                break;
            case Classe:
                this.visitarDeclaracaoClasse(declaracaoOuConstruto as Classe);
                break;
            case Comentario:
                this.visitarDeclaracaoComentario(declaracaoOuConstruto as Comentario);
                break;
            case Continua:
                this.visitarExpressaoContinua(declaracaoOuConstruto as Continua);
                break;
            case DefinirValor:
                this.visitarExpressaoDefinirValor(declaracaoOuConstruto as DefinirValor);
                break;
            case Dicionario:
                this.visitarExpressaoDicionario(declaracaoOuConstruto as Dicionario);
                break;
            case Escolha:
                this.visitarDeclaracaoEscolha(declaracaoOuConstruto as Escolha);
                break;
            case Enquanto:
                this.visitarDeclaracaoEnquanto(declaracaoOuConstruto as Enquanto);
                break;
            case Escreva:
                this.visitarDeclaracaoEscreva(declaracaoOuConstruto as Escreva);
                break;
            case EscrevaMesmaLinha:
                this.visitarDeclaracaoEscrevaMesmaLinha(declaracaoOuConstruto as Escreva);
                break;
            case Expressao:
                this.visitarDeclaracaoDeExpressao(declaracaoOuConstruto as Expressao);
                break;
            case ExpressaoRegular:
                this.visitarExpressaoExpressaoRegular(declaracaoOuConstruto as ExpressaoRegular);
                break;
            case Falhar:
                this.visitarExpressaoFalhar(declaracaoOuConstruto as Falhar);
                break;
            case Fazer:
                this.visitarDeclaracaoFazer(declaracaoOuConstruto as Fazer);
                break;
            case FuncaoConstruto:
                this.visitarExpressaoFuncaoConstruto(declaracaoOuConstruto as FuncaoConstruto);
                break;
            case FuncaoDeclaracao:
                this.visitarDeclaracaoDefinicaoFuncao(declaracaoOuConstruto as FuncaoDeclaracao);
                break;
            case Importar:
                this.visitarDeclaracaoImportar(declaracaoOuConstruto as Importar);
                break;
            case ImportarComoConstruto:
                this.visitarExpressaoImportarComoConstruto(declaracaoOuConstruto as ImportarComoConstruto);
                break;
            case Isto:
                this.visitarExpressaoIsto(declaracaoOuConstruto as Isto);
                break;
            case Matriz:
                this.visitarExpressaoMatriz(declaracaoOuConstruto as Matriz);
                break;
            case Leia:
                this.visitarExpressaoLeia(declaracaoOuConstruto as Leia);
                break;
            case Limpa:
                this.visitarExpressaoLimpa(declaracaoOuConstruto as Limpa);
                break;
            case Literal:
                this.visitarExpressaoLiteral(declaracaoOuConstruto as Literal);
                break;
            case Logico:
                this.visitarExpressaoLogica(declaracaoOuConstruto as Logico);
                break;
            case Para:
                this.visitarDeclaracaoPara(declaracaoOuConstruto as Para);
                break;
            case ParaCada:
                this.visitarDeclaracaoParaCada(declaracaoOuConstruto as ParaCada);
                break;
            case Retorna:
                this.visitarExpressaoRetornar(declaracaoOuConstruto as Retorna);
                break;
            case Se:
                this.visitarDeclaracaoSe(declaracaoOuConstruto as Se);
                break;
            case Super:
                this.visitarExpressaoSuper(declaracaoOuConstruto as Super);
                break;
            case Sustar:
                this.visitarExpressaoSustar(declaracaoOuConstruto as Sustar);
                break;
            case Tente:
                this.visitarDeclaracaoTente(declaracaoOuConstruto as Tente);
                break;
            case TipoDe:
                this.visitarExpressaoTipoDe(declaracaoOuConstruto as TipoDe);
                break;
            case Unario:
                this.visitarExpressaoUnaria(declaracaoOuConstruto as Unario);
                break;
            case Const:
                this.visitarDeclaracaoConst(declaracaoOuConstruto as Const);
                break;
            case Var:
                this.visitarDeclaracaoVar(declaracaoOuConstruto as Var);
                break;
            case Variavel:
                this.visitarExpressaoDeVariavel(declaracaoOuConstruto as Variavel);
                break;
            case Vetor:
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
        this.codigoFormatado = '';

        // Comentários podem vir antes da declaração do programa.
        while (declaracoes[0] instanceof Comentario) {
            const comentario: Comentario = declaracoes.shift() as any;
            this.visitarDeclaracaoComentario(comentario);
        }

        // O avaliador sintático devolve uma última declaração `Expressao`
        // que é simplemente uma chamada à função `inicio()`, mas que é
        // irrelevante aqui, então simplesmente a descartamos.
        declaracoes.pop();

        this.codigoFormatado += `programa ${this.quebraLinha}{${this.quebraLinha}`;
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
