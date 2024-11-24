import {
    AcessoIndiceVariavel,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Comentario,
    Construto,
    FuncaoConstruto,
    Literal,
    Unario,
    Variavel,
} from '@designliquido/delegua/construtos';
import {
    Escreva,
    Declaracao,
    Se,
    Enquanto,
    Para,
    Escolha,
    Fazer,
    FuncaoDeclaracao,
    Expressao,
    Leia,
    Var,
    Bloco,
    EscrevaMesmaLinha,
    Retorna,
    Const,
    Importar,
} from '@designliquido/delegua/declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '@designliquido/delegua/interfaces/retornos';
import { AvaliadorSintaticoBase } from '@designliquido/delegua/avaliador-sintatico/avaliador-sintatico-base';

import { ParametroInterface, SimboloInterface } from '@designliquido/delegua/interfaces';

import { RetornoDeclaracao } from '@designliquido/delegua/avaliador-sintatico/retornos';
import { ErroAvaliadorSintatico } from '@designliquido/delegua/avaliador-sintatico/erro-avaliador-sintatico';
import { TipoDadosElementar } from '@designliquido/delegua/tipo-dados-elementar';

import { Matriz, Limpa } from '../construtos';
import tiposDeSimbolos from '../tipos-de-simbolos/lexico-regular';
import { Simbolo } from '@designliquido/delegua/lexador';
import tiposDeDados from '../tipos-de-dados';

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 */
export class AvaliadorSintaticoPortugolStudio extends AvaliadorSintaticoBase {
    private declaracoes: Declaracao[] = [];

    verificarTipoSimboloAtual(tipo: string) {
        return this.simbolos[this.atual] && this.simbolos[this.atual].tipo === tipo;
    }

    avancarEDevolverAnterior() {
        this.atual += 1;
        return this.simbolos[this.atual - 1];
    }

    estaNoFinal(): boolean {
        return (
            (this.blocos === 1 && this.simbolos[this.atual].tipo === tiposDeSimbolos.CHAVE_DIREITA) ||
            this.atual === this.simbolos.length
        );
    }

    declaracaoEscreva(): Escreva {
        throw new Error('Método não implementado.');
    }

    private validarEscopoProgramaEAvaliacaoSintatica(): void {
        // Um programa completamente vazio é inválido.
        if (this.simbolos.length === 0) {
            throw this.erro(
                new Simbolo('VAZIO', '', '', -1, this.hashArquivo),
                "Esperada expressão 'programa' para inicializar programa."
            );
        }

        // Podem haver comentários antes da declaração do programa em si.
        while (
            [tiposDeSimbolos.COMENTARIO, tiposDeSimbolos.LINHA_COMENTARIO].includes(this.simbolos[this.atual].tipo)
        ) {
            this.declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        }

        this.consumir(tiposDeSimbolos.PROGRAMA, "Esperada expressão 'programa' para inicializar programa.");

        this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            "Esperada chave esquerda após expressão 'programa' para inicializar programa."
        );

        this.blocos += 1;

        while (!this.estaNoFinal()) {
            const declaracaoOuVetor: any = this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(declaracaoOuVetor)) {
                this.declaracoes = this.declaracoes.concat(declaracaoOuVetor);
            } else {
                this.declaracoes.push(declaracaoOuVetor);
            }
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, 'Esperado chave direita final para término do programa.');

        // Podem haver comentários depois da declaração do programa em si.
        while (
            this.simbolos[this.atual] &&
            [tiposDeSimbolos.COMENTARIO, tiposDeSimbolos.LINHA_COMENTARIO].includes(this.simbolos[this.atual].tipo)
        ) {
            this.declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        }

        const encontrarDeclaracaoInicio = this.declaracoes.filter(
            (d) => d instanceof FuncaoDeclaracao && d.simbolo.lexema === 'inicio'
        );

        if (encontrarDeclaracaoInicio.length <= 0) {
            throw this.erro(this.simbolos[0], "Função 'inicio()' para iniciar o programa não foi definida.");
        }

        // A última declaração do programa deve ser uma chamada a inicio()
        const declaracaoInicio = encontrarDeclaracaoInicio[0];
        this.declaracoes.push(
            new Expressao(new Chamada(declaracaoInicio.hashArquivo, (declaracaoInicio as any).funcao, null, []))
        );
    }

    override comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL_IGUAL)) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, simboloAnterior, direito);
        }

        return expressao;
    }

    override primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                // Se o próximo símbolo é um incremento ou um decremento,
                // aqui deve retornar um unário correspondente.
                // Caso contrário, apenas retornar um construto de variável.
                if (
                    this.simbolos[this.atual] &&
                    [tiposDeSimbolos.INCREMENTAR, tiposDeSimbolos.DECREMENTAR].includes(this.simbolos[this.atual].tipo)
                ) {
                    const simboloIncrementoDecremento: SimboloInterface = this.avancarEDevolverAnterior();
                    return new Unario(
                        this.hashArquivo,
                        simboloIncrementoDecremento,
                        new Variavel(this.hashArquivo, simboloIdentificador),
                        'DEPOIS'
                    );
                }

                return new Variavel(this.hashArquivo, simboloIdentificador);

            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);

            case tiposDeSimbolos.CADEIA:
            case tiposDeSimbolos.CARACTER:
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.REAL:
                const simboloVariavel: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloVariavel.linha), simboloVariavel.literal);
            case tiposDeSimbolos.FALSO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), false);
            case tiposDeSimbolos.VERDADEIRO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), true);
            default:
                throw this.erro(simboloAtual, 'Não deveria cair aqui.');
        }
    }

    override chamar(): Construto {
        let expressao = this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperado nome do método após '.'.");
                expressao = new AcessoMetodoOuPropriedade(this.hashArquivo, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indices = [];
                do {
                    indices.push(this.expressao());
                } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

                const indice = indices[0];
                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                expressao = new AcessoIndiceVariavel(this.hashArquivo, expressao, indice, simboloFechamento);
            } else {
                break;
            }
        }

        return expressao;
    }

    /**
     * Se símbolo de operação é `+`, `-`, `+=` ou `-=`, monta objeto `Binario` para
     * ser avaliado pelo Interpretador.
     * @returns Um Construto, normalmente um `Binario`, ou `Unario` se houver alguma operação unária para ser avaliada.
     */
    override adicaoOuSubtracao(): Construto {
        let expressao = this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.MAIS_IGUAL,
                tiposDeSimbolos.MENOS_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.multiplicar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    override atribuir(): Construto {
        const expressao = this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            const setaAtribuicao = this.simbolos[this.atual - 1];
            const valor = this.atribuir();

            if (expressao instanceof Variavel) {
                const simbolo = expressao.simbolo;
                return new Atribuir(this.hashArquivo, simbolo, valor);
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    expressao.linha,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }

            this.erro(setaAtribuicao, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    declaracaoEscrevaMesmaLinha(): EscrevaMesmaLinha {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em escreva.");

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em escreva.");

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    /**
     * Declaração para inclusão de uma biblioteca.
     * Exemplo: `inclua biblioteca Matematica --> mat` seria o mesmo que
     * `const mat = importar('Matematica')` em Delégua, ou
     * `inclua biblioteca Matematica` (sem o nome da variável) seria o
     * mesmo que `const Matematica = importar('Matematica')`
     * @returns Uma declaração do tipo `Importar`.
     */
    declaracaoInclua(): Const {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.BIBLIOTECA, 'Esperado palavra reservada "biblioteca" após "inclua".');
        const nomeBiblioteca = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador com nome de biblioteca após palavra reservada "biblioteca"'
        );
        let constanteBiblioteca = nomeBiblioteca;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SETA)) {
            constanteBiblioteca = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado identificador com nome de constante de biblioteca após seta de atribuição em declaração "inclua".'
            );
        }

        return new Const(
            constanteBiblioteca,
            new Importar(new Literal(this.hashArquivo, nomeBiblioteca.linha, nomeBiblioteca.lexema), null)
        );
    }

    blocoEscopo(): Declaracao[] {
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '}' antes do bloco.");
        this.blocos += 1;

        let declaracoes: Array<RetornoDeclaracao> = [];

        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
            const declaracaoOuVetor: any = this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(declaracaoOuVetor)) {
                declaracoes = declaracoes.concat(declaracaoOuVetor);
            } else {
                declaracoes.push(declaracaoOuVetor);
            }
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o bloco.");
        this.blocos -= 1;
        return declaracoes;
    }

    declaracaoSe(): Se {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'se'.");
        const condicao = this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição do se.");

        const caminhoEntao = this.resolverDeclaracaoForaDeBloco();

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            caminhoSenao = this.resolverDeclaracaoForaDeBloco();
        }

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    declaracaoEnquanto(): Enquanto {
        try {
            this.avancarEDevolverAnterior();
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'enquanto'.");
            const condicao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição.");
            const corpo = this.resolverDeclaracaoForaDeBloco();

            return new Enquanto(condicao, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoEscolha(): Escolha {
        try {
            this.avancarEDevolverAnterior();

            const condicao = this.expressao();
            this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' antes do escopo do 'escolha'.");
            this.blocos += 1;

            const caminhos = [];
            let caminhoPadrao = null;
            while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {
                    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CONTRARIO)) {
                        if (caminhoPadrao !== null) {
                            const excecao = new ErroAvaliadorSintatico(
                                this.simbolos[this.atual],
                                "Você só pode ter um 'contrario' em cada declaração de 'escolha'."
                            );
                            this.erros.push(excecao);
                            throw excecao;
                        }

                        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após declaração do 'contrario'.");

                        const declaracoes = [];
                        do {
                            declaracoes.push(this.resolverDeclaracaoForaDeBloco());

                            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARE);
                        } while (
                            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO) &&
                            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CONTRARIO) &&
                            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA)
                        );

                        caminhoPadrao = {
                            declaracoes,
                        };
                        continue;
                    }

                    const caminhoCondicoes = [this.expressao()];
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após o 'caso'.");

                    while (this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        caminhoCondicoes.push(this.expressao());
                        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após declaração do 'caso'.");
                    }

                    let declaracoes = [];
                    do {
                        const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
                        if (Array.isArray(retornoDeclaracao)) {
                            declaracoes = declaracoes.concat(retornoDeclaracao);
                        } else {
                            declaracoes.push(retornoDeclaracao as Declaracao);
                        }
                        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARE);
                    } while (
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CONTRARIO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA)
                    );

                    caminhos.push({
                        condicoes: caminhoCondicoes,
                        declaracoes,
                    });
                }
            }

            return new Escolha(condicao, caminhos, caminhoPadrao);
        } finally {
            this.blocos -= 1;
        }
    }

    /**
     * No Portugol Studio, a palavra reservada é `faca`, sem acento.
     */
    declaracaoFazer(): Fazer {
        const simboloFaca: SimboloInterface = this.avancarEDevolverAnterior();
        try {
            this.blocos += 1;

            const caminhoFazer = this.resolverDeclaracaoForaDeBloco();

            this.consumir(tiposDeSimbolos.ENQUANTO, "Esperado declaração do 'enquanto' após o escopo do 'fazer'.");
            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração 'enquanto'.");

            const condicaoEnquanto = this.expressao();

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração do 'enquanto'.");

            return new Fazer(simboloFaca.hashArquivo, Number(simboloFaca.linha), caminhoFazer, condicaoEnquanto);
        } finally {
            this.blocos -= 1;
        }
    }

    simboloAtual(): SimboloInterface {
        return this.simbolos[this.atual];
    }

    verificarDefinicaoTipo(lexema: string): TipoDadosElementar {
        const tipos = [...Object.values(tiposDeDados)];
        const contemTipo = tipos.find((tipo) => tipo === lexema);
        if (contemTipo && this.verificarTipoProximoSimbolo(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
            const tiposVetores = ['inteiro[]', 'numero[]', 'número[]', 'real[]', 'texto[]'];
            this.avancarEDevolverAnterior();

            if (!this.verificarTipoProximoSimbolo(tiposDeSimbolos.COLCHETE_DIREITO)) {
                throw this.erro(this.simbolos[this.atual], "Esperado símbolo de fechamento do vetor ']'.");
            }

            const contemTipoVetor = tiposVetores.find((tipo) => tipo === `${lexema}[]`);

            this.avancarEDevolverAnterior();

            return contemTipoVetor as TipoDadosElementar;
        }

        return contemTipo as TipoDadosElementar;
    }

    protected logicaComumParametros(): ParametroInterface[] {
        const parametros: ParametroInterface[] = [];

        do {
            if (parametros.length >= 255) {
                this.erro(this.simbolos[this.atual], 'Não pode haver mais de 255 parâmetros');
            }

            const parametro: Partial<ParametroInterface> = {
                abrangencia: 'padrao',
            };

            if (
                !this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.CADEIA,
                    tiposDeSimbolos.REAL,
                    tiposDeSimbolos.IDENTIFICADOR,
                    tiposDeSimbolos.INTEIRO
                )
            ) {
                throw this.erro(
                    this.simbolos[this.atual],
                    'Esperado tipo de parâmetro válido para declaração de função.'
                );
            }

            const lexema = this.simbolos[this.atual - 1].lexema;
            let tipoDadoParametro = this.verificarDefinicaoTipo(lexema);
            parametro.tipoDado = {
                nome: this.simbolos[this.atual - 1].lexema,
                tipo: tipoDadoParametro,
                tipoInvalido: !tipoDadoParametro ? this.simboloAtual().lexema : null,
            };

            parametro.nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome do parâmetro.');

            // Em Portugol Studio, um parâmetro múltiplo é terminado por abre e fecha colchetes.
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    'Esperado colchete direito após colchete esquerdo ao definir parâmetro múltiplo em função.'
                );
                parametro.abrangencia = 'multiplo';
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = this.primario();
            }

            parametros.push(parametro as ParametroInterface);

            if (parametro.abrangencia === 'multiplo') break;
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        // O parêntese esquerdo é considerado o símbolo inicial para
        // fins de pragma.
        const parenteseEsquerdo = this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            `Esperado '(' após o nome ${tipo}.`
        );

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            parametros = this.logicaComumParametros();
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");

        const corpo = this.blocoEscopo();

        return new FuncaoConstruto(this.hashArquivo, Number(parenteseEsquerdo.linha), parametros, corpo);
    }

    /**
     * Declaração de apenas uma variável.
     * Neste caso, o símbolo que determina o tipo da variável já foi consumido,
     * e o retorno conta com apenas uma variável retornada.
     */
    declaracaoDeVariavel(): Var {
        switch (this.simboloAnterior().tipo) {
            case tiposDeSimbolos.INTEIRO:
                const identificador = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    `Esperado identificador após palavra reservada '${tiposDeDados.INTEIRO}'.`
                );

                this.consumir(tiposDeSimbolos.IGUAL, 'Esperado símbolo igual para inicialização de variável.');

                let inicializador: Construto;
                switch (this.simbolos[this.atual].tipo) {
                    case tiposDeSimbolos.INTEIRO:
                        const literalInicializacao = this.avancarEDevolverAnterior();
                        const valorInicializacao = Number(literalInicializacao.literal);
                        inicializador = new Literal(
                            this.hashArquivo,
                            Number(literalInicializacao.linha),
                            valorInicializacao
                        );
                        break;
                    case tiposDeSimbolos.IDENTIFICADOR:
                        // TODO: Montar escopo de variáveis conhecidas e verificar o tipo e existência até aqui.
                        const variavelInicializacao = this.avancarEDevolverAnterior();
                        inicializador = new Variavel(this.hashArquivo, variavelInicializacao);
                        break;
                    default:
                        throw this.erro(
                            this.simbolos[this.atual],
                            `Esperado literal ou identificador inteiro para atribuição de variável. Tipo atual: ${this.simbolos[this.atual].lexema}.`
                        );
                }

                return new Var(identificador, inicializador);
        }
    }

    declaracaoCadeiasCaracteres(): Var[] {
        const simboloCadeia = this.consumir(
            tiposDeSimbolos.CADEIA,
            'Esse erro nunca deve acontecer (declaracaoCadeiasCaracteres).'
        );

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'cadeia'."
            );

            const dimensoes = this.logicaComumDimensoesMatrizes();

            if (dimensoes.length > 0) {
                inicializacoes.push(
                    this.declaracaoVetorOuMatriz(simboloCadeia, identificador, dimensoes, tiposDeDados.CADEIA)
                );
            } else {
                inicializacoes.push(
                    this.declaracaoVariavelSemDimensoes(simboloCadeia, identificador, tiposDeDados.CADEIA)
                );
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    declaracaoCaracteres(): Var[] {
        const simboloCaracter = this.consumir(tiposDeSimbolos.CARACTER, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado identificador após palavra reservada '${tiposDeDados.CARACTER}'.`
            );

            const dimensoes = this.logicaComumDimensoesMatrizes();

            if (dimensoes.length > 0) {
                inicializacoes.push(
                    this.declaracaoVetorOuMatriz(simboloCaracter, identificador, dimensoes, tiposDeDados.CARACTER)
                );
            } else {
                inicializacoes.push(
                    this.declaracaoVariavelSemDimensoes(simboloCaracter, identificador, tiposDeDados.CARACTER)
                );
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    declaracaoComentarioMultilinha(): Comentario {
        const conteudos: string[] = [];
        let simboloComentario: SimboloInterface;
        let simboloAtual: SimboloInterface;

        do {
            simboloComentario = this.avancarEDevolverAnterior();
            conteudos.push(simboloComentario.literal);
            simboloAtual = this.simbolos[this.atual];
        } while (simboloAtual && simboloAtual.tipo === tiposDeSimbolos.LINHA_COMENTARIO);

        return new Comentario(simboloComentario.hashArquivo, simboloComentario.linha, conteudos, true);
    }

    declaracaoComentarioUmaLinha(): Comentario {
        const simboloComentario = this.avancarEDevolverAnterior();
        return new Comentario(simboloComentario.hashArquivo, simboloComentario.linha, simboloComentario.literal, false);
    }

    declaracaoExpressao(simboloAnterior?: SimboloInterface): Expressao {
        const expressao = this.expressao();
        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        if (!expressao) {
            throw new ErroAvaliadorSintatico(simboloAnterior, 'Esperado expressão.');
        }

        return new Expressao(expressao);
    }

    /**
     * Método recursivo que lê os valores de inicialização de uma matriz de N dimensões.
     * @param {Construto[]} dimensoes O número de dimensões faltantes.
     * Cada passo recursivo usa o primeiro valor e chama a função passando esse vetor, mas sem
     * o primeiro valor.
     */
    protected lerValoresAtribuicaoMatriz(dimensoes: Construto[]) {
        this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            'Esperado chave esquerda após sinal de igual em lado direito da atribuição de vetor.'
        );
        // Neste caso, chave esquerda não é bloco.

        const valores = [];
        do {
            if (dimensoes.length === 1) {
                valores.push(this.primario());
            } else {
                const valoresProximaDimensao = this.lerValoresAtribuicaoMatriz(dimensoes.slice(1));
                valores.push(valoresProximaDimensao);
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.CHAVE_DIREITA,
            'Esperado chave direita após valores de vetor em lado direito da atribuição de vetor.'
        );

        // TODO: Recolocar.
        /* if (dimensoes !== valores.length) {
            throw this.erro(
                simboloInteiro,
                `Esperado ${dimensoes} números, mas foram fornecidos ${valores.length} valores do lado direito da atribuição.`
            );
        } */

        return valores;
    }

    protected declaracaoVetorOuMatriz(
        simboloTipo: SimboloInterface,
        identificador: SimboloInterface,
        dimensoes: Construto[],
        tipoDados: string = 'inteiro'
    ) {
        let valorInicializacao: Matriz = new Matriz(
            this.hashArquivo,
            Number(simboloTipo.linha),
            dimensoes,
            tipoDados,
            null
        );
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            valorInicializacao.valores = this.lerValoresAtribuicaoMatriz(dimensoes);
        }

        return new Var(identificador, valorInicializacao, `${tipoDados}[]` as any);
    }

    protected declaracaoVariavelSemDimensoes(
        simboloInteiro: SimboloInterface,
        identificador: SimboloInterface,
        tipoDados: string = 'inteiro'
    ) {
        // Inicializações de variáveis podem ter valores definidos.
        let valorInicializacao: Construto = new Literal(this.hashArquivo, Number(simboloInteiro.linha), 0);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            valorInicializacao = this.expressao();
        }
        return new Var(identificador, valorInicializacao, tipoDados as any);
    }

    protected logicaComumDimensoesMatrizes(): Construto[] {
        let dimensoes = [];
        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
            // Portugol Studio permite declarar vetores sem posições definidas.
            // Quando isso acontece, definimos a quantidade de posições de uma dimensão como -1.
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                const simboloColcheteDireito = this.simbolos[this.atual - 1];
                dimensoes.push(new Literal(this.hashArquivo, simboloColcheteDireito.linha, -1));
            } else {
                let construtoNumeroPosicoes = this.primario();
                dimensoes.push(construtoNumeroPosicoes);
                this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    'Esperado fechamento de identificação de número de posições de uma dimensão de vetor ou matriz.'
                );
            }
        }

        return dimensoes;
    }

    declaracaoInteiros(): Var[] {
        const simboloInteiro = this.consumir(tiposDeSimbolos.INTEIRO, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'inteiro'."
            );

            const dimensoes = this.logicaComumDimensoesMatrizes();

            if (dimensoes.length > 0) {
                inicializacoes.push(this.declaracaoVetorOuMatriz(simboloInteiro, identificador, dimensoes));
            } else {
                inicializacoes.push(this.declaracaoVariavelSemDimensoes(simboloInteiro, identificador));
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    /**
     * Análise de uma declaração `leia()`. No VisuAlg, `leia()` aceita 1..N argumentos.
     * @returns Uma declaração `Leia`.
     */
    declaracaoLeia(): Leia {
        const simboloLeia = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes do argumento em instrução `leia`.");

        const argumentos = [];
        do {
            argumentos.push(this.resolverDeclaracaoForaDeBloco());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após o argumento em instrução `leia`.");

        return new Leia(simboloLeia, argumentos);
    }

    declaracaoLogicos(): Var[] {
        const simboloLogico = this.consumir(tiposDeSimbolos.LOGICO, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'logico'."
            );

            // Inicializações de variáveis podem ter valores definidos.
            let valorInicializacao = false;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                if (![tiposDeSimbolos.VERDADEIRO, tiposDeSimbolos.FALSO].includes(this.simbolos[this.atual].tipo)) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        'Esperado literal verdadeiro ou falso após símbolo de igual em declaração de variável.'
                    );
                }
                const literalInicializacao = this.avancarEDevolverAnterior();
                valorInicializacao = literalInicializacao.lexema.toLowerCase() === 'verdadeiro' ? true : false;
            }

            inicializacoes.push(
                new Var(
                    identificador,
                    new Literal(this.hashArquivo, Number(simboloLogico.linha), valorInicializacao),
                    'lógico'
                )
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    declaracaoRetorne(): Retorna {
        this.avancarEDevolverAnterior();
        const simboloChave = this.simbolos[this.atual];
        let valor = null;

        if (
            [
                tiposDeSimbolos.CADEIA,
                tiposDeSimbolos.CARACTER,
                tiposDeSimbolos.FALSO,
                tiposDeSimbolos.IDENTIFICADOR,
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.VERDADEIRO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            valor = this.expressao();
        }

        return new Retorna(simboloChave, valor);
    }

    declaracaoPara(): Para {
        try {
            const simboloPara: SimboloInterface = this.avancarEDevolverAnterior();
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'para'.");

            let inicializador: Var | Expressao;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                inicializador = null;
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.INTEIRO)) {
                inicializador = this.declaracaoDeVariavel();
            } else {
                inicializador = this.declaracaoExpressao();
            }

            let condicao = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                condicao = this.expressao();
            }

            let incrementar = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                incrementar = this.expressao();
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.INCREMENTAR, tiposDeSimbolos.DECREMENTAR);
            }

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após cláusulas");

            const corpo = this.resolverDeclaracaoForaDeBloco();

            return new Para(this.hashArquivo, Number(simboloPara.linha), inicializador, condicao, incrementar, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoReais(): Var[] {
        const simboloReal = this.consumir(tiposDeSimbolos.REAL, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado identificador após palavra reservada '${tiposDeDados.REAL}'.`
            );

            const dimensoes = this.logicaComumDimensoesMatrizes();

            if (dimensoes.length > 0) {
                inicializacoes.push(
                    this.declaracaoVetorOuMatriz(simboloReal, identificador, dimensoes, tiposDeDados.REAL)
                );
            } else {
                inicializacoes.push(this.declaracaoVariavelSemDimensoes(simboloReal, identificador, tiposDeDados.REAL));
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    expressao(): Construto {
        return this.atribuir();
    }

    expressaoLimpa(): Limpa {
        const simboloLimpa = this.avancarEDevolverAnterior();
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado parêntese esquerdo após palavra reservada "limpa".'
        );
        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado parêntese direito após parêntese esquerdo que acompanha palavra reservada "limpa".'
        );
        return new Limpa(simboloLimpa.hashArquivo, simboloLimpa.linha);
    }

    funcao(tipo: string): FuncaoDeclaracao {
        const simboloFuncao: SimboloInterface = this.avancarEDevolverAnterior();

        // No Portugol Studio, se temos um símbolo de tipo após `função`,
        // teremos um retorno no corpo da função.
        if (
            [
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.CADEIA,
                tiposDeSimbolos.CARACTER,
                tiposDeSimbolos.LOGICO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            // Por enquanto apenas consumimos o símbolo sem ações adicionais.
            this.avancarEDevolverAnterior();
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VAZIO);

        const nomeFuncao: SimboloInterface = this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${tipo}.`);
        return new FuncaoDeclaracao(nomeFuncao, this.corpoDaFuncao(tipo));
    }

    declaracaoDeConstantes(): any {
        let identificador: SimboloInterface;
        let tipo: SimboloInterface;
        if (
            [
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.CADEIA,
                tiposDeSimbolos.CARACTER,
                tiposDeSimbolos.LOGICO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            tipo = this.avancarEDevolverAnterior();
        }

        identificador = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da constante.');

        this.consumir(tiposDeSimbolos.IGUAL, "Esperado '=' após identificador em instrução 'constante'.");

        const inicializador = this.expressao();

        return new Const(identificador, inicializador, tipo.lexema as TipoDadosElementar);
    }

    resolverDeclaracaoForaDeBloco(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.CADEIA:
                return this.declaracaoCadeiasCaracteres();
            case tiposDeSimbolos.CARACTER:
                return this.declaracaoCaracteres();
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                const simboloInicioBloco: SimboloInterface = this.simbolos[this.atual];
                return new Bloco(simboloInicioBloco.hashArquivo, Number(simboloInicioBloco.linha), this.blocoEscopo());
            case tiposDeSimbolos.COMENTARIO:
                return this.declaracaoComentarioUmaLinha();
            case tiposDeSimbolos.CONSTANTE:
                this.avancarEDevolverAnterior();
                return this.declaracaoDeConstantes();
            case tiposDeSimbolos.ENQUANTO:
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                return this.declaracaoEscolha();
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscrevaMesmaLinha();
            case tiposDeSimbolos.FACA:
                return this.declaracaoFazer();
            case tiposDeSimbolos.FUNCAO:
                return this.funcao('funcao');
            case tiposDeSimbolos.INCLUA:
                return this.declaracaoInclua();
            case tiposDeSimbolos.INTEIRO:
                return this.declaracaoInteiros();
            case tiposDeSimbolos.LEIA:
                return this.declaracaoLeia();
            case tiposDeSimbolos.LIMPA:
                return this.expressaoLimpa();
            case tiposDeSimbolos.LINHA_COMENTARIO:
                return this.declaracaoComentarioMultilinha();
            case tiposDeSimbolos.LOGICO:
                return this.declaracaoLogicos();
            case tiposDeSimbolos.PARA:
                return this.declaracaoPara();
            case tiposDeSimbolos.PROGRAMA:
            case tiposDeSimbolos.CHAVE_DIREITA:
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.REAL:
                return this.declaracaoReais();
            case tiposDeSimbolos.RETORNE:
                return this.declaracaoRetorne();
            case tiposDeSimbolos.SE:
                return this.declaracaoSe();
            default:
                return this.declaracaoExpressao(simboloAtual);
        }
    }

    analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];
        this.declaracoes = [];

        this.validarEscopoProgramaEAvaliacaoSintatica();

        return {
            declaracoes: this.declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
