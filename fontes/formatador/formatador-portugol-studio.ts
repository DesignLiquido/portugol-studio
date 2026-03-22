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
    ultimaLinhaFormatada: number;

    constructor(quebraLinha: string, tamanhoIndentacao: number = 4) {
        this.quebraLinha = quebraLinha;
        this.tamanhoIndentacao = tamanhoIndentacao;

        this.indentacaoAtual = 0;
        this.codigoFormatado = '';
        this.devePularLinha = true;
        this.deveIndentar = true;
        this.ultimaLinhaFormatada = -1;
    }

    visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> | void {
        const valores = (expressao as any)?.valores ?? [];
        this.codigoFormatado += '(';
        for (let i = 0; i < valores.length; i++) {
            this.formatarDeclaracaoOuConstruto(valores[i]);
            if (i < valores.length - 1) {
                this.codigoFormatado += ', ';
            }
        }
        this.codigoFormatado += ')';
    }

    visitarExpressaoAcessoIntervaloVariavel(expressao: AcessoIntervaloVariavel): Promise<any> | void {
        const entidade = (expressao as any).entidadeChamada ?? (expressao as any).objeto;
        const indiceInicial = (expressao as any).indiceInicial ?? (expressao as any).inicio;
        const indiceFinal = (expressao as any).indiceFinal ?? (expressao as any).fim;

        if (entidade) {
            if ((entidade as any)?.simbolo?.lexema && entidade.constructor === Object) {
                this.codigoFormatado += (entidade as any).simbolo.lexema;
            } else {
                this.formatarDeclaracaoOuConstruto(entidade);
            }
        }

        this.codigoFormatado += '[';
        if (indiceInicial) {
            this.formatarDeclaracaoOuConstruto(indiceInicial);
        }
        this.codigoFormatado += '..';
        if (indiceFinal) {
            this.formatarDeclaracaoOuConstruto(indiceFinal);
        }
        this.codigoFormatado += ']';
    }

    visitarDeclaracaoTextoDocumentacao(declaracao: TextoDocumentacao): Promise<any> | void {
        const conteudo = (declaracao as any)?.texto ?? (declaracao as any)?.conteudo;
        if (!conteudo) {
            return;
        }

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}// ${String(conteudo).replace(/\s+/g, ' ')}${this.quebraLinha}`;
    }

    visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<any> | void {
        const conteudo = (expressao as any)?.conteudo;
        if (conteudo) {
            this.codigoFormatado += `/* ${String(conteudo).replace(/\s+/g, ' ')} */`;
        }
    }

    visitarExpressaoSeparador(expressao: Separador): Promise<any> | void {
        const valor = (expressao as any)?.valor;
        this.codigoFormatado += typeof valor === 'string' ? valor : ', ';
    }

    visitarExpressaoArgumentoReferenciaFuncao(expressao: ArgumentoReferenciaFuncao): Promise<any> | void {
        const argumento = (expressao as any)?.valor ?? (expressao as any)?.argumento ?? expressao;
        if (argumento && argumento !== expressao) {
            this.formatarDeclaracaoOuConstruto(argumento as any);
        }
    }

    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void {
        const simbolo = (expressao as any)?.simbolo;
        const nome = (expressao as any)?.nome;
        if (simbolo?.lexema) {
            this.codigoFormatado += simbolo.lexema;
            return;
        }

        if (typeof nome === 'string') {
            this.codigoFormatado += nome;
        }
    }

    visitarExpressaoAcessoMetodoOuPropriedade(expressao: AcessoMetodoOuPropriedade): Promise<any> | void {
        this.visitarExpressaoAcessoMetodo(expressao);
    }

    visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> | void {
        const objeto = (expressao as any).objeto || (expressao as any).entidadeChamada;
        const simbolo = (expressao as any).simbolo || (expressao as any).nome;

        if (objeto) {
            this.formatarDeclaracaoOuConstruto(objeto);
        }

        if (simbolo?.lexema) {
            this.codigoFormatado += `.${simbolo.lexema}`;
            return;
        }

        if (typeof simbolo === 'string') {
            this.codigoFormatado += `.${simbolo}`;
        }
    }

    visitarDeclaracaoComentario(declaracao: Comentario): void | Promise<any> {
        if (declaracao.multilinha) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}/`;

            for (let linhaConteudo of declaracao.conteudo as string[]) {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}* ${linhaConteudo.replace(/\s+/g, ' ')}${this.quebraLinha}`;
            }

            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)} */${this.quebraLinha}`;
        } else {
            const comentarioLinha = (declaracao as any).linha;
            const eComentarioInline = comentarioLinha !== undefined &&
                                       this.ultimaLinhaFormatada !== -1 &&
                                       comentarioLinha === this.ultimaLinhaFormatada + 1;

            if (eComentarioInline) {
                if (this.codigoFormatado.endsWith(this.quebraLinha)) {
                    this.codigoFormatado = this.codigoFormatado.slice(0, -this.quebraLinha.length);
                }
                
                this.codigoFormatado += ` // `;
                this.codigoFormatado += (declaracao.conteudo as string).replace(/\s+/g, ' ');
                this.codigoFormatado += `${this.quebraLinha}`;
            } else {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}// `;
                this.codigoFormatado += (declaracao.conteudo as string).replace(/\s+/g, ' ');
                this.codigoFormatado += `${this.quebraLinha}`;
            }
        }
    }

    visitarDeclaracaoTendoComo(declaracao: TendoComo): void | Promise<any> {
        const inicializacao = (declaracao as any)?.inicializacao;
        const corpo = (declaracao as any)?.corpo;

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}tendo`;
        if (inicializacao) {
            this.codigoFormatado += ' (';
            this.formatarDeclaracaoOuConstruto(inicializacao);
            this.codigoFormatado += ')';
        }
        this.codigoFormatado += ` {${this.quebraLinha}`;

        if (corpo?.declaracoes) {
            this.formatarBlocoOuVetorDeclaracoes(corpo.declaracoes);
        }

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}inicio_algoritmo${this.quebraLinha}`;
        return Promise.resolve();
    }

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        const valores = (expressao as any)?.valores ?? [];
        this.codigoFormatado += '(';
        for (let i = 0; i < valores.length; i++) {
            this.formatarDeclaracaoOuConstruto(valores[i]);
            if (i < valores.length - 1) {
                this.codigoFormatado += ', ';
            }
        }
        this.codigoFormatado += ')';
        return Promise.resolve();
    }

    visitarDeclaracaoClasse(declaracao: Classe) {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}classe ${(declaracao as any).simbolo?.lexema ?? ''}${this.quebraLinha}`;
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}{${this.quebraLinha}`;

        const metodos = (declaracao as any).metodos ?? [];
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (const metodo of metodos) {
            this.formatarDeclaracaoOuConstruto(metodo);
        }
        this.indentacaoAtual -= this.tamanhoIndentacao;

        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}}${this.quebraLinha}`;
    }

    visitarDeclaracaoConst(declaracao: Const): any {
        if (declaracao.inicializador) {
            if (declaracao.inicializador instanceof Importar) {
                this.visitarDeclaracaoImportar(declaracao.inicializador, declaracao.simbolo.lexema);
            } else if (declaracao.inicializador instanceof ImportarComoConstruto) {
                this.visitarExpressaoImportarComoConstruto(declaracao.inicializador, declaracao.simbolo.lexema);
            } else {
                if (this.deveIndentar) {
                    this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
                }
                this.codigoFormatado += `const ${declaracao.tipo} ${
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

    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        const inicializadores = (declaracao as any).inicializadores ?? [];
        const simbolos = (declaracao as any).simbolos ?? [];
        const tipo = (declaracao as any).tipo ?? '';

        for (let i = 0; i < simbolos.length; i++) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}const ${tipo} ${simbolos[i]?.lexema ?? simbolos[i]}`;
            if (inicializadores[i] !== undefined) {
                this.codigoFormatado += ' = ';
                this.formatarDeclaracaoOuConstruto(inicializadores[i]);
            }
            this.codigoFormatado += this.quebraLinha;
        }

        return Promise.resolve();
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
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}funcao `;

        if (declaracao.tipo && declaracao.tipo !== 'qualquer') {
            this.codigoFormatado += `${declaracao.tipo} `;
        }

        this.codigoFormatado += `${declaracao.simbolo.lexema}(`;

        const parametros = declaracao.funcao.parametros ?? [];
        for (let i = 0; i < parametros.length; i++) {
            const param = parametros[i];
            if (param.tipoDado) {
                this.codigoFormatado += `${param.tipoDado} `;
            }
            this.codigoFormatado += param.nome.lexema;
            if (i < parametros.length - 1) {
                this.codigoFormatado += ', ';
            }
        }

        this.codigoFormatado += `)${this.quebraLinha}`;
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

        if (declaracao.caminhoPadrao?.declaracoes?.length) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}caso contrario:${this.quebraLinha}`;
            for (let padrao of declaracao.caminhoPadrao.declaracoes) {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
                this.formatarDeclaracaoOuConstruto(padrao);
            }
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

    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error("Construto 'para cada' não é suportado no dialeto Portugol Studio.");
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

    visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error("Construto 'tente/pegue/finalmente' não é suportado no dialeto Portugol Studio.");
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

            if (this.deveIndentar) {
                this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}`;
            }
            this.codigoFormatado += `${tipoDado} ${declaracao.simbolo.lexema}`;

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

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        const inicializadores = (declaracao as any).inicializadores ?? [];
        const simbolos = (declaracao as any).simbolos ?? [];
        const tipo = (declaracao as any).tipo ?? '';

        for (let i = 0; i < simbolos.length; i++) {
            this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}${tipo} ${simbolos[i]?.lexema ?? simbolos[i]}`;
            if (inicializadores[i] !== undefined) {
                this.codigoFormatado += ' = ';
                this.formatarDeclaracaoOuConstruto(inicializadores[i]);
            }
            this.codigoFormatado += this.quebraLinha;
        }

        return Promise.resolve();
    }

    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel) {
        this.formatarDeclaracaoOuConstruto(expressao.entidadeChamada);
        this.codigoFormatado += `[`;
        this.formatarDeclaracaoOuConstruto(expressao.indice);
        this.codigoFormatado += `]`;
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        const entidade = expressao?.entidadeChamada ?? expressao?.objeto;
        const indices = expressao?.indices ?? [expressao?.indicePrimario, expressao?.indiceSecundario].filter(Boolean);

        if (entidade) {
            if ((entidade as any)?.simbolo?.lexema && entidade.constructor === Object) {
                this.codigoFormatado += (entidade as any).simbolo.lexema;
            } else {
                this.formatarDeclaracaoOuConstruto(entidade);
            }
        }

        for (const indice of indices) {
            this.codigoFormatado += '[';
            this.formatarDeclaracaoOuConstruto(indice);
            this.codigoFormatado += ']';
        }
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

    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        this.visitarExpressaoAcessoElementoMatriz(expressao);
        this.codigoFormatado += ' = ';
        this.formatarDeclaracaoOuConstruto(expressao?.valor);
        this.codigoFormatado += this.quebraLinha;

        return Promise.resolve();
    }

    visitarExpressaoBinaria(expressao: Binario) {
        this.formatarDeclaracaoOuConstruto(expressao.esquerda);
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                this.codigoFormatado += ' + ';
                break;
            case tiposDeSimbolos.DIFERENTE:
                this.codigoFormatado += ' != ';
                break;
            case tiposDeSimbolos.DIVISAO:
                this.codigoFormatado += ' / ';
                break;
            case tiposDeSimbolos.DIVISAO_IGUAL:
                this.codigoFormatado += ' /= ';
                break;
            case tiposDeSimbolos.DIVISAO_INTEIRA:
                this.codigoFormatado += ' \\ ';
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
            case tiposDeSimbolos.MAIS_IGUAL:
                this.codigoFormatado += ' += ';
                break;
            case tiposDeSimbolos.MENOR:
                this.codigoFormatado += ' < ';
                break;
            case tiposDeSimbolos.MENOR_IGUAL:
                this.codigoFormatado += ' <= ';
                break;
            case tiposDeSimbolos.MENOS_IGUAL:
                this.codigoFormatado += ' -= ';
                break;
            case tiposDeSimbolos.MULTIPLICACAO:
                this.codigoFormatado += ` * `;
                break;
            case tiposDeSimbolos.MULTIPLICACAO_IGUAL:
                this.codigoFormatado += ' *= ';
                break;
            case tiposDeSimbolos.MODULO:
                this.codigoFormatado += ` % `;
                break;
            case tiposDeSimbolos.SUBTRACAO:
                this.codigoFormatado += ` - `;
                break;
            default:
                this.codigoFormatado += ` ${expressao.operador.lexema ?? ''} `;
                break;
        }
        this.formatarDeclaracaoOuConstruto(expressao.direita);
    }

    visitarExpressaoBloco(declaracao: Bloco): any {
        this.formatarBlocoOuVetorDeclaracoes(declaracao.declaracoes);
    }

    /* istanbul ignore next */
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}continue`;
        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }

        return new ContinuarQuebra();
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

    visitarExpressaoDefinirValor(expressao: any) {
        const objeto = expressao?.objeto ?? expressao?.entidadeChamada;
        const nomePropriedade = expressao?.nome ?? expressao?.simbolo ?? expressao?.propriedade;
        const valor = expressao?.valor;

        if (objeto) {
            this.formatarDeclaracaoOuConstruto(objeto);
        }

        if (nomePropriedade?.lexema) {
            this.codigoFormatado += `.${nomePropriedade.lexema}`;
        } else if (typeof nomePropriedade === 'string') {
            this.codigoFormatado += `.${nomePropriedade}`;
        }

        this.codigoFormatado += ' = ';
        this.formatarDeclaracaoOuConstruto(valor);

        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }
    }

    visitarExpressaoDeleguaFuncao(expressao: any) {
        const simbolo = expressao?.simbolo;
        if (simbolo?.lexema) {
            this.codigoFormatado += simbolo.lexema;
            return;
        }

        this.codigoFormatado += 'funcao';
    }

    visitarExpressaoDeVariavel(expressao: Variavel) {
        this.codigoFormatado += `${expressao.simbolo.lexema}`;
    }

    visitarExpressaoDicionario(expressao: any) {
        const chaves = expressao?.chaves ?? [];
        const valores = expressao?.valores ?? [];

        this.codigoFormatado += '{';
        for (let i = 0; i < chaves.length; i++) {
            this.formatarDeclaracaoOuConstruto(chaves[i]);
            this.codigoFormatado += ': ';
            this.formatarDeclaracaoOuConstruto(valores[i]);

            if (i < chaves.length - 1) {
                this.codigoFormatado += ', ';
            }
        }
        this.codigoFormatado += '}';
    }

    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        throw new Error("Construto de expressão regular não é suportado no dialeto Portugol Studio.");
    }

    visitarExpressaoFalhar(expressao: any): Promise<any> {
        throw new Error("Construto 'falhar' não é suportado no dialeto Portugol Studio.");
    }

    /* istanbul ignore next */
    visitarExpressaoFimPara(declaracao: FimPara) {
        return;
    }

    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        const expressao = (declaracao as any).expressao ?? (declaracao as any).valor ?? declaracao;

        if (expressao && expressao !== declaracao) {
            this.formatarDeclaracaoOuConstruto(expressao as any);
            return;
        }

        if ((declaracao as any).hasOwnProperty('casasDecimais')) {
            this.codigoFormatado += `${(declaracao as any).casasDecimais}`;
        }
    }

    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto) {
        this.indentacaoAtual += this.tamanhoIndentacao;

        for (let declaracaoCorpo of expressao.corpo) {
            this.formatarDeclaracaoOuConstruto(declaracaoCorpo);

            // Track line number for inline comment detection
            if ((declaracaoCorpo as any).linha !== undefined && !(declaracaoCorpo instanceof Comentario)) {
                this.ultimaLinhaFormatada = (declaracaoCorpo as any).linha;
            }
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
    }

    /* istanbul ignore next */
    visitarExpressaoIsto(expressao: any) {
        this.codigoFormatado += 'isto';
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

    visitarExpressaoLogica(expressao: any) {
        this.formatarDeclaracaoOuConstruto(expressao.esquerda);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.E:
                this.codigoFormatado += ' e ';
                break;
            case tiposDeSimbolos.OU:
                this.codigoFormatado += ' ou ';
                break;
            default:
                this.codigoFormatado += ` ${expressao.operador.lexema ?? ''} `;
                break;
        }

        this.formatarDeclaracaoOuConstruto(expressao.direita);
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
        this.codigoFormatado += 'super';
    }

    /* istanbul ignore next */
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        this.codigoFormatado += `${' '.repeat(this.indentacaoAtual)}pare`;
        if (this.devePularLinha) {
            this.codigoFormatado += this.quebraLinha;
        }

        return new SustarQuebra();
    }

    /* istanbul ignore next */
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        this.codigoFormatado += 'tipo';
        if ((expressao as any)?.valor) {
            this.codigoFormatado += '(';
            this.formatarDeclaracaoOuConstruto((expressao as any).valor);
            this.codigoFormatado += ')';
        }

        return Promise.resolve();
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
            case tiposDeSimbolos.SUBTRACAO:
                operador = '-';
                break;
            default:
                operador = expressao.operador.lexema ?? '';
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
            /* istanbul ignore next */
            case AcessoIntervaloVariavel:
                this.visitarExpressaoAcessoIntervaloVariavel(declaracaoOuConstruto as AcessoIntervaloVariavel);
                break;
            case AcessoMetodoOuPropriedade:
                this.visitarExpressaoAcessoMetodoOuPropriedade(declaracaoOuConstruto as AcessoMetodoOuPropriedade);
                break;
            /* istanbul ignore next */
            case AcessoPropriedade:
                this.visitarExpressaoAcessoPropriedade(declaracaoOuConstruto as AcessoPropriedade);
                break;
            case Agrupamento:
                this.visitarExpressaoAgrupamento(declaracaoOuConstruto as Agrupamento);
                break;
            /* istanbul ignore next */
            case ArgumentoReferenciaFuncao:
                this.visitarExpressaoArgumentoReferenciaFuncao(declaracaoOuConstruto as ArgumentoReferenciaFuncao);
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
            /* istanbul ignore next */
            case Classe:
                this.visitarDeclaracaoClasse(declaracaoOuConstruto as Classe);
                break;
            case Comentario:
                this.visitarDeclaracaoComentario(declaracaoOuConstruto as Comentario);
                break;
            /* istanbul ignore next */
            case ComentarioComoConstruto:
                this.visitarExpressaoComentario(declaracaoOuConstruto as ComentarioComoConstruto);
                break;
            /* istanbul ignore next */
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
            /* istanbul ignore next */
            case Escreva:
                this.visitarDeclaracaoEscreva(declaracaoOuConstruto as Escreva);
                break;
            case EscrevaMesmaLinha:
                this.visitarDeclaracaoEscrevaMesmaLinha(declaracaoOuConstruto as Escreva);
                break;
            case Expressao:
                this.visitarDeclaracaoDeExpressao(declaracaoOuConstruto as Expressao);
                break;
            /* istanbul ignore next */
            case ExpressaoRegular:
                this.visitarExpressaoExpressaoRegular(declaracaoOuConstruto as ExpressaoRegular);
                break;
            /* istanbul ignore next */
            case Falhar:
                this.visitarExpressaoFalhar(declaracaoOuConstruto as Falhar);
                break;
            case Fazer:
                this.visitarDeclaracaoFazer(declaracaoOuConstruto as Fazer);
                break;
            /* istanbul ignore next */
            case FuncaoConstruto:
                this.visitarExpressaoFuncaoConstruto(declaracaoOuConstruto as FuncaoConstruto);
                break;
            case FuncaoDeclaracao:
                this.visitarDeclaracaoDefinicaoFuncao(declaracaoOuConstruto as FuncaoDeclaracao);
                break;
            case Importar:
                this.visitarDeclaracaoImportar(declaracaoOuConstruto as Importar);
                break;
            /* istanbul ignore next */
            case ImportarComoConstruto:
                this.visitarExpressaoImportarComoConstruto(declaracaoOuConstruto as ImportarComoConstruto);
                break;
            /* istanbul ignore next */
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
            /* istanbul ignore next */
            case ParaCada:
                this.visitarDeclaracaoParaCada(declaracaoOuConstruto as ParaCada);
                break;
            case Retorna:
                this.visitarExpressaoRetornar(declaracaoOuConstruto as Retorna);
                break;
            case Se:
                this.visitarDeclaracaoSe(declaracaoOuConstruto as Se);
                break;
            /* istanbul ignore next */
            case Super:
                this.visitarExpressaoSuper(declaracaoOuConstruto as Super);
                break;
            /* istanbul ignore next */
            case Sustar:
                this.visitarExpressaoSustar(declaracaoOuConstruto as Sustar);
                break;
            /* istanbul ignore next */
            case Tente:
                this.visitarDeclaracaoTente(declaracaoOuConstruto as Tente);
                break;
            /* istanbul ignore next */
            case TipoDe:
                this.visitarExpressaoTipoDe(declaracaoOuConstruto as TipoDe);
                break;
            case Unario:
                this.visitarExpressaoUnaria(declaracaoOuConstruto as Unario);
                break;
            case Const:
                this.visitarDeclaracaoConst(declaracaoOuConstruto as Const);
                break;
            /* istanbul ignore next */
            case ConstMultiplo:
                this.visitarDeclaracaoConstMultiplo(declaracaoOuConstruto as ConstMultiplo);
                break;
            case FimPara:
                this.visitarExpressaoFimPara(declaracaoOuConstruto as FimPara);
                break;
            case Var:
                this.visitarDeclaracaoVar(declaracaoOuConstruto as Var);
                break;
            /* istanbul ignore next */
            case VarMultiplo:
                this.visitarDeclaracaoVarMultiplo(declaracaoOuConstruto as VarMultiplo);
                break;
            case Variavel:
                this.visitarExpressaoDeVariavel(declaracaoOuConstruto as Variavel);
                break;
            /* istanbul ignore next */
            case ReferenciaFuncao:
                this.visitarExpressaoReferenciaFuncao(declaracaoOuConstruto as ReferenciaFuncao);
                break;
            /* istanbul ignore next */
            case Separador:
                this.visitarExpressaoSeparador(declaracaoOuConstruto as Separador);
                break;
            /* istanbul ignore next */
            case TextoDocumentacao:
                this.visitarDeclaracaoTextoDocumentacao(declaracaoOuConstruto as TextoDocumentacao);
                break;
            /* istanbul ignore next */
            case Tupla:
                this.visitarExpressaoTupla(declaracaoOuConstruto as Tupla);
                break;
            /* istanbul ignore next */
            case TuplaN:
                this.visitarExpressaoTuplaN(declaracaoOuConstruto as TuplaN);
                break;
            case Vetor:
                this.visitarExpressaoVetor(declaracaoOuConstruto as Vetor);
                break;
            /* istanbul ignore next */
            default:
                console.log(declaracaoOuConstruto.constructor.name);
                break;
        }
    }

    private formatarBlocoOuVetorDeclaracoes(declaracoes: Declaracao[]) {
        this.indentacaoAtual += this.tamanhoIndentacao;
        for (let declaracaoBloco of declaracoes) {
            this.formatarDeclaracaoOuConstruto(declaracaoBloco);

            // Track line number for inline comment detection
            if ((declaracaoBloco as any).linha !== undefined && !(declaracaoBloco instanceof Comentario)) {
                this.ultimaLinhaFormatada = (declaracaoBloco as any).linha;
            }
        }
        this.indentacaoAtual -= this.tamanhoIndentacao;
    }

    formatar(declaracoes: Declaracao[]): string {
        this.indentacaoAtual = 0;
        this.codigoFormatado = '';
        this.ultimaLinhaFormatada = -1;

        // Trabalha em uma cópia para não mutar o array original.
        const copia = declaracoes.slice();

        // Comentários podem vir antes da declaração do programa.
        while (copia[0] instanceof Comentario) {
            const comentario: Comentario = copia.shift() as any;
            this.visitarDeclaracaoComentario(comentario);
        }

        // O avaliador sintático devolve uma última declaração `Expressao`
        // que é simplemente uma chamada à função `inicio()`, mas que é
        // irrelevante aqui, então simplesmente a descartamos.
        copia.pop();

        this.codigoFormatado += `programa ${this.quebraLinha}{${this.quebraLinha}`;
        this.devePularLinha = true;
        this.deveIndentar = true;
        this.indentacaoAtual += this.tamanhoIndentacao;

        for (let declaracao of copia) {
            this.formatarDeclaracaoOuConstruto(declaracao);

            // Track line number at the top-level declaration only
            if ((declaracao as any).linha !== undefined && !(declaracao instanceof Comentario)) {
                this.ultimaLinhaFormatada = (declaracao as any).linha;
            }
        }

        this.indentacaoAtual -= this.tamanhoIndentacao;
        this.codigoFormatado += `}${this.quebraLinha}`;

        return this.codigoFormatado;
    }
}
