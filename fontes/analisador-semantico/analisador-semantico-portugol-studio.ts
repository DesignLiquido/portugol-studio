import {
    Bloco,
    Const,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Para,
    Se,
    Retorna,
    Var,
} from '@designliquido/delegua/declaracoes';

import { AnalisadorSemanticoBase } from '@designliquido/delegua/analisador-semantico/analisador-semantico-base';
import { GerenciadorEscopos } from '@designliquido/delegua/analisador-semantico/gerenciador-escopos';
import { DiagnosticoAnalisadorSemanticoInterface, DiagnosticoSeveridade, RetornoAnalisadorSemanticoInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { FuncaoHipoteticaInterface } from '@designliquido/delegua/interfaces/funcao-hipotetica-interface';
import { VariavelHipoteticaInterface } from '@designliquido/delegua/interfaces/variavel-hipotetica-interface';
import { TipoInferencia } from '@designliquido/delegua/inferenciador';

import {
    AcessoIndiceVariavel,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    FuncaoConstruto,
    Leia,
    Literal,
    Logico,
    Vetor,
    Variavel,
} from '@designliquido/delegua/construtos';

import { PilhaVariaveis } from './pilha-variaveis';
import { inferirTipoVariavel } from '../interpretador/inferenciador';
import { ContextoRegraPedagogica } from '../interfaces/regras-pedagogicas';
import { aplicarRegraOrdemLeituraEscrita, aplicarRegraUsoVariavelAuxiliar, aplicarRegraVariaveisNaoUsadas } from './regras-pedagogicas';

import tiposDeDados from '../tipos-de-dados';

export class AnalisadorSemanticoPortugolStudio extends AnalisadorSemanticoBase {
    pilhaVariaveis: PilhaVariaveis;
    variaveis: { [nomeVariavel: string]: VariavelHipoteticaInterface };
    funcoes: { [nomeFuncao: string]: FuncaoHipoteticaInterface };
    atual: number;
    diagnosticos: DiagnosticoAnalisadorSemanticoInterface[];
    corpoMetodoPrincipal: Declaracao[] = [];
    /** Tipo de retorno declarado da função sendo analisada no momento. Nulo fora de funções. */
    tipoRetornoFuncaoAtual: string | null = null;

    constructor() {
        super();
        this.pilhaVariaveis = new PilhaVariaveis();
        this.variaveis = {};
        this.funcoes = {};
        this.atual = 0;
        this.diagnosticos = [];
        this.gerenciadorEscopos = new GerenciadorEscopos();
    }

    /**
     * Verifica o tipo atribuído a uma declaração
     */
    private verificarTipoAtribuido(declaracao: Var | Const): void {
        if (!declaracao.tipo || !declaracao.inicializador) {
            return;
        }

        // Verifica vetores tipados
        if (['vetor', 'qualquer[]', 'inteiro[]', 'texto[]'].includes(declaracao.tipo)) {
            if (declaracao.inicializador instanceof Vetor) {
                const vetor = declaracao.inicializador;

                // Ignora vetores vazios (declarações como inteiro numeros[10])
                if (vetor.valores.length === 0) {
                    return;
                }

                if (declaracao.tipo === 'inteiro[]') {
                    const apenasValores = vetor.valores.find((v: any) => typeof v?.valor !== 'number');
                    if (apenasValores) {
                        this.erro(
                            declaracao.simbolo,
                            `Atribuição inválida para '${declaracao.simbolo.lexema}': é esperado um valor do tipo vetor de inteiro ou real.`
                        );
                    }
                }

                if (declaracao.tipo === 'texto[]') {
                    const apenasValores = vetor.valores.find((v: any) => typeof v?.valor !== 'string');
                    if (apenasValores) {
                        this.erro(
                            declaracao.simbolo,
                            `Atribuição inválida para '${declaracao.simbolo.lexema}': é esperado um valor do tipo vetor de texto.`
                        );
                    }
                }
            }
            // NOTA: Não reportamos erro se o inicializador não for um Vetor, pois pode ser
            // uma declaração de array vazio (inteiro numeros[10]) ou uma variável
        }

        // Verifica literais - mas ignora se o tipo do literal é "qualquer" (não determinado ainda)
        if (declaracao.inicializador instanceof Literal) {
            const literal = declaracao.inicializador;

            // Ignora validação se o tipo do literal não foi determinado
            if (literal.tipo === 'qualquer') {
                return;
            }

            if (declaracao.tipo === 'texto' && literal.tipo !== 'texto') {
                this.erro(
                    declaracao.simbolo,
                    `Atribuição inválida para '${declaracao.simbolo.lexema}': é esperado um valor do tipo texto. Atual: ${literal.tipo}.`
                );
            }

            if (
                ['inteiro', 'número', 'real'].includes(declaracao.tipo) &&
                !['inteiro', 'número', 'real', 'qualquer'].includes(literal.tipo)
            ) {
                this.erro(
                    declaracao.simbolo,
                    `Atribuição inválida para '${declaracao.simbolo.lexema}': é esperado um valor do tipo número. Atual: ${literal.tipo}.`
                );
            }
        }
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

    /**
     * Verifica interpolações de texto e marca variáveis como usadas
     */
    protected verificarInterpolacaoTexto(texto: string, literal: Literal): void {
        // Regex para encontrar ${identificador}
        const regexInterpolacao = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
        let match;

        while ((match = regexInterpolacao.exec(texto)) !== null) {
            const nomeVariavel = match[1];

            // Verifica se a variável existe
            const variavel = this.gerenciadorEscopos.buscar(nomeVariavel);
            const funcao = this.funcoes[nomeVariavel];

            if (!variavel && !funcao) {
                this.erro(
                    {
                        lexema: nomeVariavel,
                        tipo: 'IDENTIFICADOR',
                        linha: literal.linha,
                        hashArquivo: literal.hashArquivo,
                        literal: null,
                    },
                    `Variável ou função '${nomeVariavel}' usada em interpolação não existe.`
                );
            } else if (variavel) {
                // Marca como usada
                this.gerenciadorEscopos.marcarComoUsada(nomeVariavel);

                // Verifica se foi inicializada
                if (!variavel.inicializada) {
                    this.aviso(
                        {
                            lexema: nomeVariavel,
                            tipo: 'IDENTIFICADOR',
                            linha: literal.linha,
                            hashArquivo: literal.hashArquivo,
                            literal: null,
                        },
                        `Variável '${nomeVariavel}' usada em interpolação pode não ter sido inicializada.`
                    );
                }
            }
        }
    }

    /**
     * Verifica a existência de uma variável e marca como usada
     */
    private verificarVariavel(variavel: Variavel): Promise<any> {
        const variavelEscopo = this.gerenciadorEscopos.buscar(variavel.simbolo.lexema);

        if (!variavelEscopo) {
            this.erro(
                variavel.simbolo,
                `Variável '${variavel.simbolo.lexema}' ainda não foi declarada até este ponto.`
            );
            return Promise.resolve();
        }

        // Marca como usada
        this.gerenciadorEscopos.marcarComoUsada(variavel.simbolo.lexema);

        // Verifica se foi inicializada
        if (!variavelEscopo.inicializada) {
            this.aviso(
                variavel.simbolo,
                `Variável '${variavel.simbolo.lexema}' pode não ter sido inicializada antes do uso.`
            );
        }

        return Promise.resolve();
    }

    /**
     * Verifica condições em estruturas de controle
     */
    private verificarCondicao(condicao: any, contexto: 'fluxo-controle' | 'enquanto' | 'faca-enquanto' | 'se' = 'fluxo-controle'): Promise<any> {
        if (condicao instanceof Agrupamento) {
            return this.verificarCondicao(condicao.expressao, contexto);
        }

        if (condicao instanceof Variavel) {
            return this.verificarVariavelBinaria(condicao, contexto);
        }

        if (condicao instanceof Binario) {
            return this.verificarBinario(condicao);
        }

        if (condicao instanceof Logico) {
            return this.verificarLogico(condicao);
        }

        if (condicao instanceof Chamada) {
            return this.verificarChamada(condicao);
        }

        return Promise.resolve();
    }

    /**
     * Verifica variável em contexto binário/condicional
     */
    private verificarVariavelBinaria(variavel: Variavel, contexto: 'fluxo-controle' | 'enquanto' | 'faca-enquanto' | 'se' = 'fluxo-controle'): Promise<any> {
        this.verificarVariavel(variavel);
        const variavelHipotetica = this.gerenciadorEscopos.buscar(variavel.simbolo.lexema);

        if (
            variavelHipotetica &&
            !(variavelHipotetica.valor instanceof Binario) &&
            typeof variavelHipotetica.valor !== 'boolean'
        ) {
            this.erro(variavel.simbolo, `Esperado tipo 'lógico' na condição do '${contexto}'.`);
        }

        return Promise.resolve();
    }

    /**
     * Verifica expressões binárias
     */
    private verificarBinario(binario: Binario): Promise<any> {
        this.verificarExistenciaConstruto(binario.direita);
        this.verificarExistenciaConstruto(binario.esquerda);
        this.verificarOperadorBinario(binario);
        return Promise.resolve();
    }

    /**
     * Verifica operadores binários
     */
    private verificarOperadorBinario(binario: Binario): void {
        if (binario.esquerda instanceof Binario) {
            this.verificarOperadorBinario(binario.esquerda);
        }

        if (binario.direita instanceof Binario) {
            this.verificarOperadorBinario(binario.direita);
        }

        const operadoresMatematicos = ['ADICAO', 'SUBTRACAO', 'MULTIPLICACAO', 'DIVISAO', 'MODULO'];
        if (operadoresMatematicos.includes(binario.operador.tipo)) {
            this.verificarTiposOperandos(binario);
        }

        if (binario.operador.tipo === 'DIVISAO') {
            this.verificarDivisaoPorZero(binario);
        }
    }

    /**
     * Verifica se os tipos dos operandos são compatíveis
     */
    private verificarTiposOperandos(binario: Binario): void {
        const tipoEsquerda = this.obterTipoExpressao(binario.esquerda);
        const tipoDireita = this.obterTipoExpressao(binario.direita);

        if (tipoEsquerda && tipoDireita && tipoEsquerda !== tipoDireita) {
            // Verificar se são tipos numéricos compatíveis
            const tiposNumericos = ['inteiro', 'número', 'real'];
            const ambosNumericos = tiposNumericos.includes(tipoEsquerda) && tiposNumericos.includes(tipoDireita);

            if (!ambosNumericos) {
                this.aviso(
                    binario.operador,
                    `Operação entre tipos diferentes: tipo esquerdo '${tipoEsquerda}' e tipo direito '${tipoDireita}'. O resultado será resolvido implicitamente.`
                );
            }
        }
    }

    /**
     * Verifica divisão por zero recursivamente
     */
    private verificarDivisaoPorZero(binario: Binario): void {
        const valorDireita = this.avaliarExpressaoConstante(binario.direita);
        if (valorDireita === 0) {
            this.erro(binario.operador, `Divisão por zero.`);
        }
    }

    /**
     * Tenta avaliar uma expressão em tempo de compilação para detectar valores constantes
     */
    private avaliarExpressaoConstante(expressao: any): any {
        if (expressao instanceof Literal) {
            return expressao.valor;
        }

        if (expressao instanceof Variavel) {
            const variavel = this.gerenciadorEscopos.buscar(expressao.simbolo.lexema);
            if (!variavel) {
                return null;
            }

            if (variavel.imutavel && variavel.inicializada) {
                return variavel.valor;
            }

            if (variavel.inicializada && variavel.valor !== undefined) {
                return variavel.valor;
            }

            return null;
        }

        if (expressao instanceof Binario) {
            const esquerda = this.avaliarExpressaoConstante(expressao.esquerda);
            const direita = this.avaliarExpressaoConstante(expressao.direita);

            if (esquerda !== null && direita !== null) {
                return this.calcularOperacaoBinaria(expressao.operador.tipo, esquerda, direita);
            }
        }

        if (expressao instanceof Agrupamento) {
            return this.avaliarExpressaoConstante(expressao.expressao);
        }

        return null;
    }

    /**
     * Calcula o resultado de uma operação binária em tempo de compilação
     */
    private calcularOperacaoBinaria(operador: string, esquerda: any, direita: any): any {
        try {
            switch (operador) {
                case 'ADICAO':
                    return esquerda + direita;
                case 'SUBTRACAO':
                    return esquerda - direita;
                case 'MULTIPLICACAO':
                    return esquerda * direita;
                case 'DIVISAO':
                    return esquerda / direita;
                case 'MODULO':
                    return esquerda % direita;
                case 'MAIOR':
                    return esquerda > direita;
                case 'MAIOR_IGUAL':
                    return esquerda >= direita;
                case 'MENOR':
                    return esquerda < direita;
                case 'MENOR_IGUAL':
                    return esquerda <= direita;
                case 'IGUAL':
                    return esquerda === direita;
                case 'DIFERENTE':
                    return esquerda !== direita;
                default:
                    return null;
            }
        } catch (e) {
            return null;
        }
    }

    /**
     * Verifica a existência de um construto
     */
    private verificarExistenciaConstruto(construto: any): void {
        if (construto instanceof Variavel) {
            if (!this.gerenciadorEscopos.buscar(construto.simbolo.lexema)) {
                this.erro(
                    construto.simbolo,
                    `Variável ${construto.simbolo.lexema} ainda não foi declarada até este ponto.`
                );
                return;
            }
            this.gerenciadorEscopos.marcarComoUsada(construto.simbolo.lexema);
            return;
        }

        if (construto instanceof Binario) {
            this.verificarBinario(construto);
        }
    }

    /**
     * Verifica expressões lógicas
     */
    private verificarLogico(logico: Logico): Promise<any> {
        this.verificarLadoLogico(logico.direita);
        this.verificarLadoLogico(logico.esquerda);
        return Promise.resolve();
    }

    /**
     * Verifica chamadas de função em condições
     */
    private verificarChamada(chamada: Chamada): Promise<any> {
        if (chamada.entidadeChamada instanceof Variavel) {
            const entidadeChamadaVariavel = chamada.entidadeChamada;
            if (!this.funcoes[entidadeChamadaVariavel.simbolo.lexema]) {
                this.erro(
                    entidadeChamadaVariavel.simbolo,
                    `Chamada da função '${entidadeChamadaVariavel.simbolo.lexema}' não existe.`
                );
            }
        }
        return Promise.resolve();
    }

    /**
     * Verifica o lado de uma expressão lógica
     */
    private verificarLadoLogico(lado: any): void {
        if (lado instanceof Variavel) {
            this.verificarVariavelBinaria(lado);
        }
    }

    /**
     * Executa regras pedagógicas opcionais (não bloqueantes).
     */
    private executarRegrasPedagogicas(): void {
        const contexto: ContextoRegraPedagogica = {
            corpoMetodoPrincipal: this.corpoMetodoPrincipal,
            diagnosticos: this.diagnosticos,
            gerenciadorEscopos: this.gerenciadorEscopos,
            sugestao: this.sugestao.bind(this),
        };

        aplicarRegraVariaveisNaoUsadas(contexto);
        aplicarRegraOrdemLeituraEscrita(contexto);
        aplicarRegraUsoVariavelAuxiliar(contexto);
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        declaracao.argumentos.forEach((argumento) => {
            // Marca variáveis como usadas
            this.marcarVariaveisUsadasEmExpressao(argumento);

            if (argumento instanceof Variavel) {
                const variavelExistente = this.gerenciadorEscopos.buscar(argumento.simbolo.lexema);
                if (!variavelExistente) {
                    this.erro(argumento.simbolo, `Variável não declarada: ${argumento.simbolo.lexema}`);
                }
            }
        });

        return Promise.resolve();
    }

    async visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<any> {
        for (let parametro of declaracao.funcao.parametros) {
            if (parametro.hasOwnProperty('tipoDado') && !parametro.tipoDado) {
                this.adicionarDiagnostico(declaracao.simbolo, `O tipo '${parametro.tipoDado}' não é valido`);
            }
        }

        if (declaracao.funcao.parametros.length >= 255) {
            this.adicionarDiagnostico(declaracao.simbolo, 'Não pode haver mais de 255 parâmetros');
        }

        this.funcoes[declaracao.simbolo.lexema] = {
            valor: declaracao.funcao,
        };

        // Analisa o corpo de funções definidas pelo usuário (exceto 'inicio', tratado em analisar())
        if (declaracao.simbolo.lexema !== 'inicio') {
            const tipoRetornoAnterior = this.tipoRetornoFuncaoAtual;
            this.tipoRetornoFuncaoAtual = declaracao.tipo || null;

            this.gerenciadorEscopos.empilharEscopo();

            for (const parametro of declaracao.funcao.parametros) {
                this.gerenciadorEscopos.declarar(parametro.nome.lexema, {
                    nome: parametro.nome.lexema,
                    tipo: (parametro.tipoDado as TipoInferencia) || 'qualquer',
                    imutavel: false,
                    valor: undefined,
                    inicializada: true,
                    usada: false,
                    hashArquivo: parametro.nome.hashArquivo,
                    linha: parametro.nome.linha,
                });
            }

            for (const declaracaoCorpo of declaracao.funcao.corpo) {
                await declaracaoCorpo.aceitar(this);
            }

            this.gerenciadorEscopos.desempilharEscopo();
            this.tipoRetornoFuncaoAtual = tipoRetornoAnterior;
        }

        return Promise.resolve();
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        const { simbolo, inicializador } = declaracao;

        // Só verifica tipo atribuído se houver inicializador
        if (inicializador) {
            this.verificarTipoAtribuido(declaracao);
        }

        // Marca variáveis usadas no inicializador
        if (inicializador) {
            this.marcarVariaveisUsadasEmExpressao(inicializador);

            // Verifica se inicializador é uma variável
            if (inicializador instanceof Variavel) {
                const { simbolo: simboloInicializador } = inicializador;
                const variavelExistente = this.gerenciadorEscopos.buscar(simboloInicializador.lexema);

                if (!variavelExistente) {
                    this.erro(simboloInicializador, `Variável não declarada: ${simboloInicializador.lexema}.`);
                    return Promise.resolve();
                }

                const tipoInferido = variavelExistente.tipo || inferirTipoVariavel(variavelExistente.valor);
                if (tipoInferido !== declaracao.tipo) {
                    const erroTipo = this.validarCompatibilidadeTipos(tipoInferido, declaracao.tipo);
                    if (erroTipo) {
                        this.erro(simbolo, erroTipo);
                        return Promise.resolve();
                    }
                }
            }
        }

        // Determina o valor do inicializador
        let valorInicializador = undefined;
        if (inicializador) {
            if (inicializador.hasOwnProperty('valor')) {
                valorInicializador = (inicializador as any).valor;
            } else {
                valorInicializador = inicializador;
            }
        }

        // Declara a variável usando GerenciadorEscopos
        const variavel = {
            nome: simbolo.lexema,
            tipo: (declaracao.tipo as TipoInferencia) || 'qualquer',
            imutavel: false,
            valor: valorInicializador,
            inicializada: inicializador !== null && inicializador !== undefined,
            usada: false,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
        };

        const declaradaComSucesso = this.gerenciadorEscopos.declarar(simbolo.lexema, variavel);

        if (!declaradaComSucesso) {
            const variavelExistente = this.gerenciadorEscopos.buscarNoEscopoAtual(simbolo.lexema);
            this.aviso(simbolo, `Variável '${simbolo.lexema}' já foi declarada na linha ${variavelExistente?.linha}.`);
        }

        // Mantém compatibilidade com o dicionário antigo
        this.variaveis[simbolo.lexema] = {
            imutavel: false,
            tipo: declaracao.tipo as TipoInferencia,
            valor: valorInicializador,
            valorDefinido: true,
        };

        return Promise.resolve();
    }

    visitarExpressaoDeVariavel(expressao: Variavel): Promise<any> {
        // Verifica a variável e marca como usada
        if (expressao instanceof Variavel) {
            return this.verificarVariavel(expressao);
        }
        return Promise.resolve();
    }

    private validarCompatibilidadeTipos(tipoInferido: string, tipoEsperado: string): string | null {
        switch (tipoEsperado) {
            case tiposDeDados.CADEIA:
                if (tipoInferido !== tiposDeDados.CARACTER) {
                    return `Não é possível atribuir um valor do tipo '${tipoInferido}' a uma variável do tipo '${tipoEsperado}'.`;
                }
                break;
            case tiposDeDados.REAL:
                if (tipoInferido !== tiposDeDados.INTEIRO) {
                    return `Não é possível atribuir um valor do tipo '${tipoInferido}' a uma variável do tipo '${tipoEsperado}'.`;
                }
                break;
            default:
                return `Não é possível atribuir um valor do tipo '${tipoInferido}' a uma variável do tipo '${tipoEsperado}'.`;
        }
        return null;
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        const { valor, alvo } = expressao;
        let simboloAlvo: SimboloInterface;

        // Determina o símbolo do alvo
        switch (alvo.constructor) {
            case Variavel:
                const alvoVariavel = alvo as Variavel;
                simboloAlvo = alvoVariavel.simbolo;
                break;
            default:
                return Promise.resolve();
        }

        // Busca a variável no gerenciador de escopos
        const variavel = this.gerenciadorEscopos.buscar(simboloAlvo.lexema);
        if (!variavel) {
            this.erro(simboloAlvo, `Variável '${simboloAlvo.lexema}' ainda não foi declarada até este ponto.`);
            return Promise.resolve();
        }

        // Verifica se é uma constante
        if (variavel.imutavel) {
            this.erro(simboloAlvo, `Constante '${simboloAlvo.lexema}' não pode ser modificada.`);
            return Promise.resolve();
        }

        // Marca como inicializada após atribuição
        this.gerenciadorEscopos.marcarComoInicializada(simboloAlvo.lexema, valor);

        // Verifica o tipo do valor sendo atribuído
        if (variavel.tipo) {
            if (valor instanceof Literal) {
                // ValorLiteral pode ser um Construto em Delégua 1, precisamos verificar se é um valor primitivo
                const isPrimitivo = typeof valor.valor !== 'object' || valor.valor === null || !('linha' in valor.valor);

                if (isPrimitivo) {
                    const valorPrimitivo = valor.valor as string | number | boolean | any[];
                    const tipoInferido = inferirTipoVariavel(valorPrimitivo);
                    if (tipoInferido !== variavel.tipo) {
                        const erroTipo = this.validarCompatibilidadeTipos(tipoInferido, variavel.tipo);
                        if (erroTipo) {
                            this.erro(simboloAlvo, erroTipo);
                            return Promise.resolve();
                        }
                    }
                }
            }

            if (valor instanceof Variavel) {
                const variavelValor = this.gerenciadorEscopos.buscar(valor.simbolo.lexema);

                if (!variavelValor) {
                    this.erro(valor.simbolo, `Variável não declarada: ${valor.simbolo.lexema}.`);
                    return Promise.resolve();
                }

                const tipoInferido = variavelValor.tipo || inferirTipoVariavel(variavelValor.valor);
                if (tipoInferido !== variavel.tipo) {
                    const erroTipo = this.validarCompatibilidadeTipos(tipoInferido, variavel.tipo);
                    if (erroTipo) {
                        this.erro(valor.simbolo, erroTipo);
                        return Promise.resolve();
                    }
                }
            }

            // Verifica vetores
            if (valor instanceof Vetor && !variavel.tipo.includes('[]')) {
                this.erro(simboloAlvo, `Atribuição inválida, esperado tipo '${variavel.tipo}' na atribuição.`);
                return Promise.resolve();
            }
        }

        // Mantém compatibilidade com o dicionário antigo
        if (this.variaveis[simboloAlvo.lexema]) {
            this.variaveis[simboloAlvo.lexema].valor = valor;
        }

        return Promise.resolve();
    }

    visitarExpressaoDeChamada(expressao: Chamada): Promise<any> {
        // Marca argumentos como usados
        for (const argumento of expressao.argumentos) {
            if (argumento instanceof Variavel) {
                this.gerenciadorEscopos.marcarComoUsada(argumento.simbolo.lexema);
            }
        }

        if (expressao.entidadeChamada instanceof Variavel) {
            const variavel = expressao.entidadeChamada as Variavel;
            const funcaoChamada =
                this.gerenciadorEscopos.buscar(variavel.simbolo.lexema) || this.funcoes[variavel.simbolo.lexema];

            if (!funcaoChamada) {
                this.erro(variavel.simbolo, `Função não declarada: ${variavel.simbolo.lexema}`);
                return Promise.resolve();
            }

            const funcao = funcaoChamada.valor as FuncaoConstruto;
            if (funcao.parametros.length != expressao.argumentos.length) {
                this.erro(
                    variavel.simbolo,
                    `Esperava ${funcao.parametros.length} ${funcao.parametros.length > 1 ? 'parâmetros' : 'parâmetro'}, mas foi passado ${expressao.argumentos.length}.`
                );
            }

            for (let [indice, argumento] of expressao.argumentos.entries()) {
                const parametroCorrespondente = funcao.parametros[indice];
                if (parametroCorrespondente && parametroCorrespondente.tipoDado) {
                    const tipoDadoParametro = parametroCorrespondente.tipoDado.toLowerCase();

                    if (argumento instanceof Variavel) {
                        const lexemaVariavelCorrespondente = (argumento as Variavel).simbolo.lexema;
                        const variavelCorrespondente = this.gerenciadorEscopos.buscar(lexemaVariavelCorrespondente);

                        if (variavelCorrespondente) {
                            const tipoVariavelCorrespondente = variavelCorrespondente.tipo.toLowerCase();

                            if (tipoVariavelCorrespondente !== tipoDadoParametro) {
                                this.erro(
                                    variavel.simbolo,
                                    `O tipo do valor passado para o parâmetro '${parametroCorrespondente.nome.lexema}' (${tipoVariavelCorrespondente}) é diferente do esperado pela função (${tipoDadoParametro}).`
                                );
                            }
                        }
                    }

                    if (argumento instanceof Literal) {
                        switch (argumento.valor?.constructor.name) {
                            case 'Number':
                                if (!['inteiro', 'real'].includes(tipoDadoParametro)) {
                                    this.erro(
                                        variavel.simbolo,
                                        `O tipo do valor passado para o parâmetro '${parametroCorrespondente.nome.lexema}' (inteiro ou real) é diferente do esperado pela função (${tipoDadoParametro}).`
                                    );
                                }
                                break;
                        }
                    }
                } else if (parametroCorrespondente && !parametroCorrespondente.tipoDado) {
                    this.aviso(variavel.simbolo, 'Tipo de dados não especificado');
                }
            }
        }

        return Promise.resolve();
    }

    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> {
        const atribuir = new Atribuir(expressao.hashArquivo, expressao.objeto, expressao.valor, expressao.indice);

        this.visitarExpressaoDeAtribuicao(atribuir);
        return Promise.resolve();
    }

    private desenveloparExpressaoLeia(argumento: any): any {
        if (argumento instanceof Expressao) {
            return this.desenveloparExpressaoLeia(argumento.expressao);
        }

        return argumento;
    }

    visitarExpressaoLeia(expressao: Leia): Promise<any> {
        for (const argumento of expressao.argumentos) {
            const construto = this.desenveloparExpressaoLeia(argumento);

            if (construto instanceof Variavel) {
                this.verificarVariavel(construto);
                continue;
            }

            if (construto instanceof AcessoIndiceVariavel) {
                if (construto.entidadeChamada instanceof Variavel) {
                    this.verificarVariavel(construto.entidadeChamada);
                }

                if (construto.indice instanceof Variavel) {
                    this.verificarVariavel(construto.indice);
                }

                continue;
            }

            const simbolo = (construto as any)?.simbolo || {
                lexema: 'leia',
                tipo: 'LEIA',
                linha: expressao.simbolo.linha,
                hashArquivo: expressao.simbolo.hashArquivo,
                literal: null,
            };

            this.erro(simbolo, 'Argumento inválido em leia(). Esperado variável ou posição indexada de vetor/matriz.');
        }

        return Promise.resolve();
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        switch (declaracao.expressao.constructor) {
            case Atribuir:
                this.visitarExpressaoDeAtribuicao(declaracao.expressao as Atribuir);
                break;
            case Chamada:
                this.visitarExpressaoDeChamada(declaracao.expressao as Chamada);
                break;
            case Variavel:
                this.visitarExpressaoDeVariavel(declaracao.expressao as Variavel);
                break;
            case AtribuicaoPorIndice:
                this.visitarExpressaoAtribuicaoPorIndice(declaracao.expressao as AtribuicaoPorIndice);
                break;
            case Leia:
                this.visitarExpressaoLeia(declaracao.expressao as Leia);
                break;
            default:
                console.log(declaracao.expressao);
                break;
        }

        return Promise.resolve();
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        // Só verifica tipo atribuído se houver inicializador
        if (declaracao.inicializador) {
            this.verificarTipoAtribuido(declaracao);
            this.marcarVariaveisUsadasEmExpressao(declaracao.inicializador);
        }

        // Verifica se já existe
        const constanteCorrespondente = this.gerenciadorEscopos.buscarNoEscopoAtual(declaracao.simbolo.lexema);
        if (constanteCorrespondente) {
            this.erro(declaracao.simbolo, 'Declaração de constante já feita.');
            return Promise.resolve();
        }

        // Determina o valor do inicializador
        let valorInicializador = undefined;
        if (declaracao.inicializador) {
            if (declaracao.inicializador.hasOwnProperty('valor')) {
                valorInicializador = (declaracao.inicializador as any).valor;
            } else {
                valorInicializador = declaracao.inicializador;
            }
        }

        // Declara a constante usando GerenciadorEscopos
        this.gerenciadorEscopos.declarar(declaracao.simbolo.lexema, {
            nome: declaracao.simbolo.lexema,
            tipo: (declaracao.tipo as TipoInferencia) || 'qualquer',
            imutavel: true,
            valor: valorInicializador,
            inicializada: true,
            usada: false,
            hashArquivo: declaracao.simbolo.hashArquivo,
            linha: declaracao.simbolo.linha,
        });

        // Mantém compatibilidade com o dicionário antigo
        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: true,
            tipo: declaracao.tipo as TipoInferencia,
            valor: valorInicializador,
            valorDefinido: true,
        };

        return Promise.resolve();
    }

    /**
     * Visita declaração de escreva com validações adicionais
     */
    visitarDeclaracaoEscreva(declaracao: Escreva): Promise<void> {
        if (declaracao.argumentos.length === 0) {
            const { linha, hashArquivo } = declaracao;
            const simbolo: SimboloInterface = {
                literal: '',
                tipo: '',
                lexema: 'escreva',
                linha,
                hashArquivo,
            };
            this.erro(simbolo, `É preciso ter um ou mais parametros para 'escreva(...)'`);
            return Promise.resolve();
        }

        for (const argumento of declaracao.argumentos) {
            this.marcarVariaveisUsadasEmExpressao(argumento);

            // Verifica interpolação de texto
            if (argumento instanceof Literal && argumento.tipo === 'texto' && typeof argumento.valor === 'string') {
                this.verificarInterpolacaoTexto(argumento.valor, argumento);
            }

            // Verifica se variáveis existem
            if (argumento instanceof Variavel) {
                const possivelVariavel = this.gerenciadorEscopos.buscar(argumento.simbolo.lexema);
                const possivelFuncao = this.funcoes[argumento.simbolo.lexema];

                if (!possivelVariavel && !possivelFuncao) {
                    this.erro(argumento.simbolo, `Variável ou função '${argumento.simbolo.lexema}' não existe.`);
                    continue;
                }

                if (possivelVariavel && possivelVariavel.valor === undefined) {
                    this.aviso(argumento.simbolo, `Variável '${argumento.simbolo.lexema}' não foi inicializada.`);
                }
            }
        }

        return Promise.resolve();
    }

    /**
     * Visita declaração de enquanto com validação de condição
     */
    async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<void> {
        await this.verificarCondicao(declaracao.condicao, 'enquanto');
        await this.visitarCorpoCondicionalOuLoop(declaracao.corpo);
    }

    private async visitarCorpoCondicionalOuLoop(corpo: Declaracao | Bloco | null | undefined): Promise<void> {
        if (!corpo) {
            return;
        }

        if (corpo instanceof Bloco) {
            for (const declaracao of corpo.declaracoes) {
                await declaracao.aceitar(this);
            }

            return;
        }

        await corpo.aceitar(this);
    }

    async visitarDeclaracaoSe(declaracao: Se): Promise<void> {
        await this.verificarCondicao(declaracao.condicao, 'se');
        await this.visitarCorpoCondicionalOuLoop(declaracao.caminhoEntao as any);
        await this.visitarCorpoCondicionalOuLoop(declaracao.caminhoSenao as any);
    }

    async visitarDeclaracaoFazer(declaracao: Fazer): Promise<void> {
        await this.visitarCorpoCondicionalOuLoop(declaracao.caminhoFazer as any);
        await this.verificarCondicao(declaracao.condicaoEnquanto, 'faca-enquanto');
    }

    async visitarDeclaracaoPara(declaracao: Para): Promise<void> {
        if (declaracao.inicializador) {
            if (Array.isArray(declaracao.inicializador)) {
                for (const init of declaracao.inicializador) {
                    await init.aceitar(this);
                }
            } else {
                await declaracao.inicializador.aceitar(this);
            }
        }

        if (declaracao.condicao) {
            await this.verificarCondicao(declaracao.condicao, 'fluxo-controle');
        }

        if (declaracao.incrementar) {
            this.marcarVariaveisUsadasEmExpressao(declaracao.incrementar);
        }

        await this.visitarCorpoCondicionalOuLoop(declaracao.corpo);
    }

    /**
     * Visita declaração de escolha com validação de tipos e recursão nos corpos dos casos
     */
    async visitarDeclaracaoEscolha(declaracao: Escolha): Promise<void> {
        const identificadorOuLiteral = declaracao.identificadorOuLiteral;
        const tipo = identificadorOuLiteral.tipo;

        for (let caminho of declaracao.caminhos) {
            for (let condicao of caminho.condicoes) {
                switch (condicao.constructor) {
                    case Literal:
                        const condicaoLiteral = condicao as Literal;
                        if (condicaoLiteral.tipo !== tipo) {
                            this.erro(
                                {
                                    lexema: condicaoLiteral.valor,
                                    tipo: condicaoLiteral.tipo,
                                    linha: condicaoLiteral.linha,
                                    hashArquivo: condicaoLiteral.hashArquivo,
                                } as SimboloInterface,
                                `'caso ${condicaoLiteral.valor}:' não é do mesmo tipo esperado em 'escolha' (esperado: ${tipo}, atual: ${condicaoLiteral.tipo}).`
                            );
                        }
                        break;

                    case Variavel:
                        const condicaoVariavel = condicao as Variavel;
                        this.verificarVariavel(condicaoVariavel);
                        const variavelHipotetica = this.gerenciadorEscopos.buscar(condicaoVariavel.simbolo.lexema);

                        if (variavelHipotetica && typeof variavelHipotetica.valor !== tipo) {
                            this.erro(
                                condicaoVariavel.simbolo,
                                `'caso ${condicaoVariavel.simbolo.lexema}:' não é do mesmo tipo esperado em 'escolha'`
                            );
                        }
                        break;
                }
            }

            for (const declaracaoCorpo of caminho.declaracoes) {
                await declaracaoCorpo.aceitar(this);
            }
        }

        if (declaracao.caminhoPadrao?.declaracoes) {
            for (const declaracaoCorpo of declaracao.caminhoPadrao.declaracoes) {
                await declaracaoCorpo.aceitar(this);
            }
        }
    }

    /**
     * Visita declaração de retorna com validação básica do valor retornado
     */
    visitarExpressaoRetornar(declaracao: Retorna): Promise<any> {
        if (declaracao.valor) {
            this.marcarVariaveisUsadasEmExpressao(declaracao.valor);

            if (declaracao.valor instanceof Variavel) {
                this.verificarVariavel(declaracao.valor);
            }

            // Validação básica de compatibilidade de tipo com o tipo de retorno declarado da função
            if (this.tipoRetornoFuncaoAtual && this.tipoRetornoFuncaoAtual !== 'qualquer' && this.tipoRetornoFuncaoAtual !== 'vazio') {
                let tipoRetornado: string | null = null;

                if (declaracao.valor instanceof Literal) {
                    tipoRetornado = inferirTipoVariavel((declaracao.valor as any).valor) as string;
                } else if (declaracao.valor instanceof Variavel) {
                    const variavelEncontrada = this.gerenciadorEscopos.buscar(declaracao.valor.simbolo.lexema);
                    if (variavelEncontrada) {
                        tipoRetornado = variavelEncontrada.tipo || inferirTipoVariavel(variavelEncontrada.valor) as string;
                    }
                }

                if (tipoRetornado && tipoRetornado !== this.tipoRetornoFuncaoAtual) {
                    const erroTipo = this.validarCompatibilidadeTipos(tipoRetornado, this.tipoRetornoFuncaoAtual);
                    if (erroTipo) {
                        this.adicionarDiagnostico(
                            declaracao.simboloChave,
                            `Tipo de retorno incompatível: função declarada como '${this.tipoRetornoFuncaoAtual}' mas retorna '${tipoRetornado}'.`
                        );
                    }
                }
            }
        }

        return Promise.resolve(null);
    }

    async analisar(declaracoes: Declaracao[]): Promise<RetornoAnalisadorSemanticoInterface> {
        // Inicializa o estado do analisador
        this.gerenciadorEscopos = new GerenciadorEscopos();
        this.variaveis = {};
        this.funcoes = {};
        this.atual = 0;
        this.diagnosticos = [];
        this.corpoMetodoPrincipal = [];

        const declaracaoMetodoPrincipal = declaracoes.find(
            (declaracao) => declaracao instanceof FuncaoDeclaracao && declaracao.simbolo.lexema === 'inicio'
        );

        if (declaracaoMetodoPrincipal) {
            const declaracaoMetodoPrincipalResolvida = declaracaoMetodoPrincipal as FuncaoDeclaracao;
            this.corpoMetodoPrincipal = declaracaoMetodoPrincipalResolvida.funcao.corpo as Declaracao[];
        }

        // Processa declarações globais (exceto o método principal)
        for (const declaracao of declaracoes) {
            if (declaracao instanceof FuncaoDeclaracao || declaracao instanceof Var || declaracao instanceof Const) {
                if (declaracao.simbolo.lexema !== 'inicio') {
                    declaracao.aceitar(this);
                }
            }
        }

        // Processa o corpo do método principal
        while (this.atual < this.corpoMetodoPrincipal.length) {
            await this.corpoMetodoPrincipal[this.atual].aceitar(this);
            this.atual++;
        }

        // Regras pedagógicas opcionais (emitidas como sugestão).
        this.executarRegrasPedagogicas();

        return {
            diagnosticos: this.diagnosticos,
        } as RetornoAnalisadorSemanticoInterface;
    }
}
