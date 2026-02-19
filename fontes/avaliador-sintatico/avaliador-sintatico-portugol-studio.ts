import {
    AcessoIndiceVariavel,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    FuncaoConstruto,
    ImportarComoConstruto,
    Leia,
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
    Var,
    Bloco,
    EscrevaMesmaLinha,
    Retorna,
    Const,
    Comentario,
} from '@designliquido/delegua/declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '@designliquido/delegua/interfaces/retornos';
import { AvaliadorSintaticoBase } from '@designliquido/delegua/avaliador-sintatico/avaliador-sintatico-base';
import { PilhaEscopos } from '@designliquido/delegua/avaliador-sintatico';
import { InformacaoEscopo } from '@designliquido/delegua/avaliador-sintatico/informacao-escopo';
import { InformacaoElementoSintatico } from '@designliquido/delegua/informacao-elemento-sintatico';
import { TipoInferencia } from '@designliquido/delegua/inferenciador';

import { ParametroInterface, SimboloInterface } from '@designliquido/delegua/interfaces';

import { Simbolo } from '@designliquido/delegua/lexador';
import { ErroAvaliadorSintatico } from '@designliquido/delegua/avaliador-sintatico/erro-avaliador-sintatico';

import { Matriz, Limpa } from '../construtos';

import tiposDeSimbolos from '../tipos-de-simbolos/lexico-regular';
import tiposDeDados from '../tipos-de-dados';

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 */
export class AvaliadorSintaticoPortugolStudio extends AvaliadorSintaticoBase {
    private declaracoes: Declaracao[] = [];
    private pilhaEscopos: PilhaEscopos;

    constructor() {
        super();
        this.pilhaEscopos = new PilhaEscopos();
    }

    verificarTipoSimboloAtual(tipo: string) {
        return this.simbolos[this.atual] && this.simbolos[this.atual].tipo === tipo;
    }

    avancarEDevolverAnterior() {
        this.atual += 1;
        return this.simbolos[this.atual - 1];
    }

    estaNoFinal(): boolean {
        if (this.atual >= this.simbolos.length) {
            return true;
        }
        return this.blocos === 1 && this.simbolos[this.atual].tipo === tiposDeSimbolos.CHAVE_DIREITA;
    }

    async declaracaoEscreva(): Promise<Escreva> {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em escreva.");

        const argumentos: Construto[] = [];

        do {
            argumentos.push(await this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em escreva.");

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    private async validarEscopoProgramaEAvaliacaoSintatica(): Promise<void> {
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
            this.declaracoes.push(await this.resolverDeclaracaoForaDeBloco() as Declaracao);
        }

        this.consumir(tiposDeSimbolos.PROGRAMA, "Esperada expressão 'programa' para inicializar programa.");

        this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            "Esperada chave esquerda após expressão 'programa' para inicializar programa."
        );

        this.blocos += 1;
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        while (!this.estaNoFinal()) {
            const declaracaoOuVetor: any = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(declaracaoOuVetor)) {
                this.declaracoes = this.declaracoes.concat(declaracaoOuVetor);
            } else {
                this.declaracoes.push(declaracaoOuVetor);
            }
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, 'Esperado chave direita final para término do programa.');
        this.pilhaEscopos.removerUltimo();

        // Podem haver comentários depois da declaração do programa em si.
        while (
            this.simbolos[this.atual] &&
            [tiposDeSimbolos.COMENTARIO, tiposDeSimbolos.LINHA_COMENTARIO].includes(this.simbolos[this.atual].tipo)
        ) {
            this.declaracoes.push(await this.resolverDeclaracaoForaDeBloco() as Declaracao);
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
            new Expressao(new Chamada(declaracaoInicio.hashArquivo, (declaracaoInicio as any).funcao, []))
        );
    }

    override async comparacaoIgualdade(): Promise<Construto> {
        let expressao = await this.comparar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL_IGUAL)) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            const direito = await this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, simboloAnterior, direito);
        }

        return expressao;
    }

    override async primario(): Promise<Construto> {
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
                const expressao = await this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);

            case tiposDeSimbolos.CADEIA:
            case tiposDeSimbolos.CARACTER:
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.REAL:
                const simboloVariavel: SimboloInterface = this.avancarEDevolverAnterior();
                const dicionarioTiposDelegua = {
                    CADEIA: 'texto',
                    CARACTER: 'texto',
                    INTEIRO: 'inteiro',
                    REAL: 'número',
                };

                return new Literal(
                    this.hashArquivo,
                    Number(simboloVariavel.linha),
                    simboloVariavel.literal,
                    dicionarioTiposDelegua[simboloAtual.tipo]
                );
            case tiposDeSimbolos.FALSO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), false, 'lógico');
            case tiposDeSimbolos.VERDADEIRO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), true, 'lógico');
            default:
                throw this.erro(simboloAtual, `Não deveria cair aqui. Token inesperado: ${simboloAtual.tipo} ("${simboloAtual.lexema}") na linha ${simboloAtual.linha}`);
        }
    }

    override async chamar(): Promise<Construto> {
        let expressao = await this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = await this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperado nome do método após '.'.");
                expressao = new AcessoMetodoOuPropriedade(this.hashArquivo, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indices = [];
                do {
                    indices.push(await this.expressao());
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
    override async adicaoOuSubtracao(): Promise<Construto> {
        let expressao = await this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.MAIS_IGUAL,
                tiposDeSimbolos.MENOS_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.multiplicar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    override async atribuir(): Promise<Construto> {
        const expressao = await this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            const operadorAtribuicao = this.simbolos[this.atual - 1];
            const valor = await this.atribuir();

            if (expressao instanceof Variavel) {
                return new Atribuir(this.hashArquivo, expressao, valor);
            }

            if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    expressao.linha,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }

            this.erro(operadorAtribuicao, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    async declaracaoEscrevaMesmaLinha(): Promise<EscrevaMesmaLinha> {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em escreva.");

        const argumentos: Construto[] = [];

        do {
            argumentos.push(await this.expressao());
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
            new ImportarComoConstruto(new Literal(this.hashArquivo, nomeBiblioteca.linha, nomeBiblioteca.lexema))
        );
    }

    async blocoEscopo(): Promise<Declaracao[]> {
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '}' antes do bloco.");
        this.blocos += 1;
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        let declaracoes: Array<Declaracao> = [];

        while (!this.estaNoFinal() && !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA)) {
            const declaracaoOuVetor: any = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(declaracaoOuVetor)) {
                declaracoes = declaracoes.concat(declaracaoOuVetor);
            } else {
                declaracoes.push(declaracaoOuVetor);
            }
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o bloco.");
        this.blocos -= 1;
        this.pilhaEscopos.removerUltimo();
        return declaracoes;
    }

    async declaracaoSe(): Promise<Se> {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'se'.");
        const condicao = await this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição do se.");

        const caminhoEntao = await this.resolverDeclaracaoForaDeBloco() as Declaracao;

        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.COMENTARIO) ||
               this.verificarTipoSimboloAtual(tiposDeSimbolos.LINHA_COMENTARIO)) {
            this.avancarEDevolverAnterior();
        }

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            caminhoSenao = await this.resolverDeclaracaoForaDeBloco();
        }

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    async declaracaoEnquanto(): Promise<Enquanto> {
        try {
            this.avancarEDevolverAnterior();
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'enquanto'.");
            const condicao = await this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição.");
            const corpo = await this.resolverDeclaracaoForaDeBloco();

            return new Enquanto(condicao, corpo as Bloco);
        } finally {
            this.blocos -= 1;
        }
    }

    async declaracaoEscolha(): Promise<Escolha> {
        try {
            this.avancarEDevolverAnterior();

            const condicao = await this.expressao();
            this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' antes do escopo do 'escolha'.");
            this.blocos += 1;

            const caminhos = [];
            let caminhoPadrao = null;
            while (!this.estaNoFinal() && !this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
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
                            declaracoes.push(await this.resolverDeclaracaoForaDeBloco());

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

                    const caminhoCondicoes = [await this.expressao()];
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após o 'caso'.");

                    while (this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        caminhoCondicoes.push(await this.expressao());
                        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após declaração do 'caso'.");
                    }

                    let declaracoes = [];
                    do {
                        const retornoDeclaracao = await this.resolverDeclaracaoForaDeBloco();
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
    async declaracaoFazer(): Promise<Fazer> {
        const simboloFaca: SimboloInterface = this.avancarEDevolverAnterior();
        try {
            this.blocos += 1;

            const caminhoFazer = await this.resolverDeclaracaoForaDeBloco();

            this.consumir(tiposDeSimbolos.ENQUANTO, "Esperado declaração do 'enquanto' após o escopo do 'fazer'.");
            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração 'enquanto'.");

            const condicaoEnquanto = await this.expressao();

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração do 'enquanto'.");

            return new Fazer(simboloFaca.hashArquivo, Number(simboloFaca.linha), caminhoFazer as Bloco, condicaoEnquanto);
        } finally {
            this.blocos -= 1;
        }
    }

    simboloAtual(): SimboloInterface {
        return this.simbolos[this.atual];
    }

    verificarDefinicaoTipo(lexema: string): TipoInferencia {
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

            return contemTipoVetor as TipoInferencia;
        }

        return contemTipo as TipoInferencia;
    }

    protected async logicaComumParametros(): Promise<ParametroInterface[]> {
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
            parametro.tipoDado = tipoDadoParametro;

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
                parametro.valorPadrao = await this.primario();
            }

            parametros.push(parametro as ParametroInterface);

            if (parametro.abrangencia === 'multiplo') break;
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    async corpoDaFuncao(tipo: string): Promise<FuncaoConstruto> {
        // O parêntese esquerdo é considerado o símbolo inicial para
        // fins de pragma.
        const parenteseEsquerdo = this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            `Esperado '(' após o nome ${tipo}.`
        );

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            parametros = await this.logicaComumParametros();
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");

        const corpo = await this.blocoEscopo();

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
                            valorInicializacao,
                            'inteiro'
                        );
                        break;
                    case tiposDeSimbolos.IDENTIFICADOR:
                        const variavelInicializacao = this.avancarEDevolverAnterior();
                        const nomeVariavel = variavelInicializacao.lexema;

                        if (!this.pilhaEscopos.variavelJaDefinida(nomeVariavel)) {
                            throw this.erro(
                                variavelInicializacao,
                                `Variável '${nomeVariavel}' não declarada até este ponto.`
                            );
                        }

                        const tipoVariavel = this.pilhaEscopos.obterTipoVariavelPorNome(nomeVariavel);
                        if (tipoVariavel && tipoVariavel !== 'inteiro') {
                            throw this.erro(
                                variavelInicializacao,
                                `Esperado variável do tipo 'inteiro', mas '${nomeVariavel}' é do tipo '${tipoVariavel}'.`
                            );
                        }

                        inicializador = new Variavel(this.hashArquivo, variavelInicializacao);
                        break;
                    default:
                        throw this.erro(
                            this.simbolos[this.atual],
                            `Esperado literal ou identificador inteiro para atribuição de variável. Tipo atual: ${this.simbolos[this.atual].lexema}.`
                        );
                }

                return new Var(identificador, inicializador, 'inteiro');
        }
    }

    async declaracaoCadeiasCaracteres(): Promise<Var[]> {
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

            const dimensoes = await this.logicaComumDimensoesMatrizes();

            if (dimensoes.length > 0) {
                inicializacoes.push(
                    await this.declaracaoVetorOuMatriz(simboloCadeia, identificador, dimensoes, tiposDeDados.CADEIA)
                );
            } else {
                inicializacoes.push(
                    await this.declaracaoVariavelSemDimensoes(simboloCadeia, identificador, tiposDeDados.CADEIA)
                );
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    async declaracaoCaracteres(): Promise<Var[]> {
        const simboloCaracter = this.consumir(tiposDeSimbolos.CARACTER, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado identificador após palavra reservada '${tiposDeDados.CARACTER}'.`
            );

            const dimensoes = await this.logicaComumDimensoesMatrizes();

            if (dimensoes.length > 0) {
                inicializacoes.push(
                    await this.declaracaoVetorOuMatriz(simboloCaracter, identificador, dimensoes, tiposDeDados.CARACTER)
                );
            } else {
                inicializacoes.push(
                    await this.declaracaoVariavelSemDimensoes(simboloCaracter, identificador, tiposDeDados.CARACTER)
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

    async declaracaoExpressao(simboloAnterior?: SimboloInterface): Promise<Expressao> {
        const expressao = await this.expressao();
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
    protected async lerValoresAtribuicaoMatriz(dimensoes: Construto[]): Promise<any[]> {
        this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            'Esperado chave esquerda após sinal de igual em lado direito da atribuição de vetor.'
        );
        // Neste caso, chave esquerda não é bloco.

        const valores: any[] = [];
        do {
            if (dimensoes.length === 1) {
                valores.push(await this.primario());
            } else {
                const valoresProximaDimensao = await this.lerValoresAtribuicaoMatriz(dimensoes.slice(1));
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

    protected async declaracaoVetorOuMatriz(
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
            valorInicializacao.valores = await this.lerValoresAtribuicaoMatriz(dimensoes);
        }

        const tipoDadosFinal = `${tipoDados}[]`;
        this.pilhaEscopos.definirInformacoesVariavel(
            identificador.lexema,
            new InformacaoElementoSintatico(identificador.lexema, tipoDadosFinal)
        );

        return new Var(identificador, valorInicializacao, tipoDadosFinal);
    }

    protected async declaracaoVariavelSemDimensoes(
        simboloInteiro: SimboloInterface,
        identificador: SimboloInterface,
        tipoDados: string = 'inteiro'
    ): Promise<Var> {
        // Inicializações de variáveis podem ter valores definidos.
        let valorInicializacao: Construto = new Literal(this.hashArquivo, Number(simboloInteiro.linha), 0);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            valorInicializacao = await this.expressao();
        }

        this.pilhaEscopos.definirInformacoesVariavel(
            identificador.lexema,
            new InformacaoElementoSintatico(identificador.lexema, tipoDados)
        );

        return new Var(identificador, valorInicializacao, tipoDados as any);
    }

    protected async logicaComumDimensoesMatrizes(): Promise<Construto[]> {
        let dimensoes = [];
        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
            // Portugol Studio permite declarar vetores sem posições definidas.
            // Quando isso acontece, definimos a quantidade de posições de uma dimensão como -1.
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                const simboloColcheteDireito = this.simbolos[this.atual - 1];
                dimensoes.push(new Literal(this.hashArquivo, simboloColcheteDireito.linha, -1));
            } else {
                let construtoNumeroPosicoes = await this.primario();
                dimensoes.push(construtoNumeroPosicoes);
                this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    'Esperado fechamento de identificação de número de posições de uma dimensão de vetor ou matriz.'
                );
            }
        }

        return dimensoes;
    }

    async declaracaoInteiros(): Promise<Var[]> {
        const simboloInteiro = this.consumir(tiposDeSimbolos.INTEIRO, '');

        const inicializacoes: Var[] = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'inteiro'."
            );

            const dimensoes = await this.logicaComumDimensoesMatrizes();

            if (dimensoes.length > 0) {
                inicializacoes.push(await this.declaracaoVetorOuMatriz(simboloInteiro, identificador, dimensoes));
            } else {
                inicializacoes.push(await this.declaracaoVariavelSemDimensoes(simboloInteiro, identificador));
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    /**
     * Análise de uma declaração `leia()`. No VisuAlg, `leia()` aceita 1..N argumentos.
     * @returns Uma declaração `Leia`.
     */
    async expressaoLeia(): Promise<Leia> {
        const simboloLeia = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes do argumento em instrução `leia`.");

        const argumentos = [];
        do {
            argumentos.push(await this.resolverDeclaracaoForaDeBloco());
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

    async declaracaoRetorne(): Promise<Retorna> {
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
            valor = await this.expressao();
        }

        return new Retorna(simboloChave, valor);
    }

    async declaracaoPara(): Promise<Para> {
        try {
            const simboloPara: SimboloInterface = this.avancarEDevolverAnterior();
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'para'.");

            let inicializador: Var | Expressao;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                inicializador = null;
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.INTEIRO)) {
                inicializador = await this.declaracaoDeVariavel();
            } else {
                inicializador = await this.declaracaoExpressao();
            }

            let condicao = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                condicao = await this.expressao();
            }

            let incrementar = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                incrementar = await this.expressao();
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.INCREMENTAR, tiposDeSimbolos.DECREMENTAR);
            }

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após cláusulas");

            const corpo = await this.resolverDeclaracaoForaDeBloco() as Bloco;

            return new Para(this.hashArquivo, Number(simboloPara.linha), inicializador, condicao, incrementar, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    async declaracaoReais(): Promise<Var[]> {
        const simboloReal = this.consumir(tiposDeSimbolos.REAL, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado identificador após palavra reservada '${tiposDeDados.REAL}'.`
            );

            const dimensoes = await this.logicaComumDimensoesMatrizes();

            if (dimensoes.length > 0) {
                inicializacoes.push(
                    await this.declaracaoVetorOuMatriz(simboloReal, identificador, dimensoes, tiposDeDados.REAL)
                );
            } else {
                inicializacoes.push(await this.declaracaoVariavelSemDimensoes(simboloReal, identificador, tiposDeDados.REAL));
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    async expressao(): Promise<Construto> {
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

    async funcao(tipo: string): Promise<FuncaoDeclaracao> {
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
        return new FuncaoDeclaracao(nomeFuncao, await this.corpoDaFuncao(tipo));
    }

    async declaracaoDeConstantes(): Promise<Const> {
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

        const inicializador = await this.expressao();

        this.pilhaEscopos.definirInformacoesVariavel(
            identificador.lexema,
            new InformacaoElementoSintatico(identificador.lexema, tipo.lexema)
        );

        return new Const(identificador, inicializador, tipo.lexema as TipoInferencia);
    }

    async resolverDeclaracaoForaDeBloco(): Promise<Declaracao | Declaracao[]> {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.CADEIA:
                return await this.declaracaoCadeiasCaracteres();
            case tiposDeSimbolos.CARACTER:
                return await this.declaracaoCaracteres();
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                const simboloInicioBloco: SimboloInterface = this.simbolos[this.atual];
                return new Bloco(simboloInicioBloco.hashArquivo, Number(simboloInicioBloco.linha), await this.blocoEscopo());
            case tiposDeSimbolos.COMENTARIO:
                return this.declaracaoComentarioUmaLinha();
            case tiposDeSimbolos.CONSTANTE:
                this.avancarEDevolverAnterior();
                return await this.declaracaoDeConstantes();
            case tiposDeSimbolos.ENQUANTO:
                return await this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                return await this.declaracaoEscolha();
            case tiposDeSimbolos.ESCREVA:
                return await this.declaracaoEscrevaMesmaLinha();
            case tiposDeSimbolos.FACA:
                return await this.declaracaoFazer();
            case tiposDeSimbolos.FUNCAO:
                return await this.funcao('funcao');
            case tiposDeSimbolos.INCLUA:
                return this.declaracaoInclua();
            case tiposDeSimbolos.INTEIRO:
                return await this.declaracaoInteiros();
            case tiposDeSimbolos.LEIA:
                return new Expressao(await this.expressaoLeia());
            case tiposDeSimbolos.LIMPA:
                return new Expressao(this.expressaoLimpa());
            case tiposDeSimbolos.LINHA_COMENTARIO:
                return this.declaracaoComentarioMultilinha();
            case tiposDeSimbolos.LOGICO:
                return this.declaracaoLogicos();
            case tiposDeSimbolos.PARA:
                return await this.declaracaoPara();
            case tiposDeSimbolos.PROGRAMA:
            case tiposDeSimbolos.CHAVE_DIREITA:
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.REAL:
                return await this.declaracaoReais();
            case tiposDeSimbolos.RETORNE:
                return await this.declaracaoRetorne();
            case tiposDeSimbolos.SE:
                return await this.declaracaoSe();
            default:
                return await this.declaracaoExpressao(simboloAtual);
        }
    }

    async analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<Declaracao>> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];
        this.declaracoes = [];

        await this.validarEscopoProgramaEAvaliacaoSintatica();

        return {
            declaracoes: this.declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
