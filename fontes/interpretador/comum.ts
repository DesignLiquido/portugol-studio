import { AcessoIndiceVariavel, ImportarComoConstruto, Leia, Variavel } from '@designliquido/delegua/construtos';
import { Declaracao, Expressao, Importar } from '@designliquido/delegua/declaracoes';
import { DeleguaModulo, FuncaoPadrao } from '@designliquido/delegua/interpretador/estruturas';
import { ErroEmTempoDeExecucao } from '@designliquido/delegua/excecoes';
import { ConstrutoInterface, VariavelInterface } from '@designliquido/delegua';

import { VisitantePortugolStudioInterface } from '../interfaces';
import { Matriz } from '../construtos/matriz';
import { converterValor } from './inferenciador';

import * as calendario from '../bibliotecas/calendario';
import * as matematica from '../bibliotecas/matematica';
import * as objetos from '../bibliotecas/objetos';
import * as texto from '../bibliotecas/texto';
import * as tipos from '../bibliotecas/tipos';

function carregarBibliotecaCalendario(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        dia_mes_atual: new FuncaoPadrao(0, calendario.dia_mes_atual),
        dia_semana_atual: new FuncaoPadrao(0, calendario.dia_semana_atual),
        mes_atual: new FuncaoPadrao(0, calendario.mes_atual),
        ano_atual: new FuncaoPadrao(0, calendario.ano_atual),
        hora_atual: new FuncaoPadrao(0, calendario.hora_atual),
        minuto_atual: new FuncaoPadrao(0, calendario.minuto_atual),
        segundo_atual: new FuncaoPadrao(0, calendario.segundo_atual),
        milisegundo_atual: new FuncaoPadrao(0, calendario.milisegundo_atual),
        dia_semana_completo: new FuncaoPadrao(0, calendario.dia_semana_completo),
        dia_semana_curto: new FuncaoPadrao(0, calendario.dia_semana_curto),
        dia_semana_abreviado: new FuncaoPadrao(0, calendario.dia_semana_abreviado),
    };

    const objetoCalendario = new DeleguaModulo('Calendario');
    objetoCalendario.componentes = { ...metodos };

    const componentesCalendario = objetoCalendario.componentes as Record<string, any>;
    componentesCalendario.DIA_DOMINGO = calendario.DIA_DOMINGO;
    componentesCalendario.DIA_SEGUNDA_FEIRA = calendario.DIA_SEGUNDA_FEIRA;
    componentesCalendario.DIA_TERCA_FEIRA = calendario.DIA_TERCA_FEIRA;
    componentesCalendario.DIA_QUARTA_FEIRA = calendario.DIA_QUARTA_FEIRA;
    componentesCalendario.DIA_QUINTA_FEIRA = calendario.DIA_QUINTA_FEIRA;
    componentesCalendario.DIA_SEXTA_FEIRA = calendario.DIA_SEXTA_FEIRA;
    componentesCalendario.DIA_SABADO = calendario.DIA_SABADO;
    componentesCalendario.MES_JANEIRO = calendario.MES_JANEIRO;
    componentesCalendario.MES_FEVEREIRO = calendario.MES_FEVEREIRO;
    componentesCalendario.MES_MARCO = calendario.MES_MARCO;
    componentesCalendario.MES_ABRIL = calendario.MES_ABRIL;
    componentesCalendario.MES_MAIO = calendario.MES_MAIO;
    componentesCalendario.MES_JUNHO = calendario.MES_JUNHO;
    componentesCalendario.MES_JULHO = calendario.MES_JULHO;
    componentesCalendario.MES_AGOSTO = calendario.MES_AGOSTO;
    componentesCalendario.MES_SETEMBRO = calendario.MES_SETEMBRO;
    componentesCalendario.MES_OUTUBRO = calendario.MES_OUTUBRO;
    componentesCalendario.MES_NOVEMBRO = calendario.MES_NOVEMBRO;
    componentesCalendario.MES_DEZEMBRO = calendario.MES_DEZEMBRO;

    return objetoCalendario;
}

function carregarBibliotecaMatematica(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        potencia: new FuncaoPadrao(2, matematica.potencia),
        raiz: new FuncaoPadrao(2, matematica.raiz),
        arredondar: new FuncaoPadrao(2, matematica.arredondar),
        logaritmo: new FuncaoPadrao(2, matematica.logaritmo),
        seno: new FuncaoPadrao(1, matematica.seno),
        cosseno: new FuncaoPadrao(1, matematica.cosseno),
        tangente: new FuncaoPadrao(1, matematica.tangente),
        valor_absoluto: new FuncaoPadrao(1, matematica.valor_absoluto),
        maior_numero: new FuncaoPadrao(2, matematica.maior_numero),
        menor_numero: new FuncaoPadrao(2, matematica.menor_numero),
    };

    const objetoMatematica = new DeleguaModulo('Matematica');
    objetoMatematica.componentes = metodos;
    const componentesMatematica = objetoMatematica.componentes as Record<string, any>;
    componentesMatematica.PI = matematica.PI;
    return objetoMatematica;
}

function carregarBibliotecaObjetos(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        atribuir_propriedade: new FuncaoPadrao(3, objetos.atribuir_propriedade),
        contem_propriedade: new FuncaoPadrao(2, objetos.contem_propriedade),
        criar_objeto: new FuncaoPadrao(0, objetos.criar_objeto),
        criar_objeto_via_json: new FuncaoPadrao(1, objetos.criar_objeto_via_json),
        criar_objeto_via_xml: new FuncaoPadrao(1, objetos.criar_objeto_via_xml),
        finalizar: new FuncaoPadrao(0, objetos.finalizar),
        liberar: new FuncaoPadrao(0, objetos.liberar),
        liberar_objeto: new FuncaoPadrao(1, objetos.liberar_objeto),
        obter_json: new FuncaoPadrao(1, objetos.obter_json),
        obter_propriedade_tipo_cadeia: new FuncaoPadrao(2, objetos.obter_propriedade_tipo_cadeia),
        obter_propriedade_tipo_cadeia_em_vetor: new FuncaoPadrao(3, objetos.obter_propriedade_tipo_cadeia_em_vetor),
        obter_propriedade_tipo_caracter: new FuncaoPadrao(2, objetos.obter_propriedade_tipo_caracter),
        obter_propriedade_tipo_caracter_em_vetor: new FuncaoPadrao(3, objetos.obter_propriedade_tipo_caracter_em_vetor),
        obter_propriedade_tipo_inteiro: new FuncaoPadrao(2, objetos.obter_propriedade_tipo_inteiro),
        obter_propriedade_tipo_inteiro_em_vetor: new FuncaoPadrao(3, objetos.obter_propriedade_tipo_inteiro_em_vetor),
        obter_propriedade_tipo_logico: new FuncaoPadrao(2, objetos.obter_propriedade_tipo_logico),
        obter_propriedade_tipo_logico_em_vetor: new FuncaoPadrao(3, objetos.obter_propriedade_tipo_logico_em_vetor),
        obter_propriedade_tipo_objeto: new FuncaoPadrao(2, objetos.obter_propriedade_tipo_objeto),
        obter_propriedade_tipo_objeto_em_vetor: new FuncaoPadrao(3, objetos.obter_propriedade_tipo_objeto_em_vetor),
        obter_propriedade_tipo_real: new FuncaoPadrao(2, objetos.obter_propriedade_tipo_real),
        obter_propriedade_tipo_real_em_vetor: new FuncaoPadrao(3, objetos.obter_propriedade_tipo_real_em_vetor),
        obter_tamanho_vetor_propriedade: new FuncaoPadrao(2, objetos.obter_tamanho_vetor_propriedade),
        tipo_propriedade: new FuncaoPadrao(2, objetos.tipo_propriedade),
    };

    const objetoObjetos = new DeleguaModulo('Objetos');
    objetoObjetos.componentes = metodos;
    return objetoObjetos;
}

function carregarBibliotecaTexto(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        numero_caracteres: new FuncaoPadrao(1, texto.numero_caracteres),
        caixa_alta: new FuncaoPadrao(1, texto.caixa_alta),
        caixa_baixa: new FuncaoPadrao(1, texto.caixa_baixa),
        substituir: new FuncaoPadrao(3, texto.substituir),
        preencher_a_esquerda: new FuncaoPadrao(3, texto.preencher_a_esquerda),
        obter_caracter: new FuncaoPadrao(2, texto.obter_caracter),
        posicao_texto: new FuncaoPadrao(3, texto.posicao_texto),
        extrair_subtexto: new FuncaoPadrao(3, texto.extrair_subtexto),
    };

    const objetoTexto = new DeleguaModulo('Texto');
    objetoTexto.componentes = metodos;
    return objetoTexto;
}

function carregarBibliotecaTipos(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        cadeia_e_inteiro: new FuncaoPadrao(2, tipos.cadeia_e_inteiro),
        cadeia_e_real: new FuncaoPadrao(1, tipos.cadeia_e_real),
        cadeia_e_logico: new FuncaoPadrao(1, tipos.cadeia_e_logico),
        cadeia_e_caracter: new FuncaoPadrao(1, tipos.cadeia_e_caracter),
        cadeia_para_caracter: new FuncaoPadrao(1, tipos.cadeia_para_caracter),
        cadeia_para_inteiro: new FuncaoPadrao(2, tipos.cadeia_para_inteiro),
        cadeia_para_real: new FuncaoPadrao(1, tipos.cadeia_para_real),
        cadeia_para_logico: new FuncaoPadrao(1, tipos.cadeia_para_logico),
        inteiro_e_caracter: new FuncaoPadrao(1, tipos.inteiro_e_caracter),
        inteiro_para_cadeia: new FuncaoPadrao(2, tipos.inteiro_para_cadeia),
        inteiro_para_caracter: new FuncaoPadrao(1, tipos.inteiro_para_caracter),
        inteiro_para_logico: new FuncaoPadrao(1, tipos.inteiro_para_logico),
        inteiro_para_real: new FuncaoPadrao(1, tipos.inteiro_para_real),
        caracter_e_inteiro: new FuncaoPadrao(1, tipos.caracter_e_inteiro),
        caracter_e_logico: new FuncaoPadrao(1, tipos.caracter_e_logico),
        caracter_para_cadeia: new FuncaoPadrao(1, tipos.caracter_para_cadeia),
        caracter_para_inteiro: new FuncaoPadrao(1, tipos.caracter_para_inteiro),
        caracter_para_logico: new FuncaoPadrao(1, tipos.caracter_para_logico),
        logico_para_cadeia: new FuncaoPadrao(1, tipos.logico_para_cadeia),
        logico_para_inteiro: new FuncaoPadrao(1, tipos.logico_para_inteiro),
        logico_para_caracter: new FuncaoPadrao(1, tipos.logico_para_caracter),
        real_para_cadeia: new FuncaoPadrao(1, tipos.real_para_cadeia),
        real_para_inteiro: new FuncaoPadrao(1, tipos.real_para_inteiro),
    };

    const objetoTipos = new DeleguaModulo('Tipos');
    objetoTipos.componentes = metodos;
    return objetoTipos;
}

/**
 * Avaliação de argumentos para `escreva`. Diferentemente de outros dialetos, aqui não ocorre `trimEnd`, já que `\n`
 * É significativo para Portugol Studio.
 * @param interpretador A instância do interpretador.
 * @param argumentos Os argumentos.
 * @returns {string} O texto formatado.
 */
export async function avaliarArgumentosEscreva(
    interpretador: VisitantePortugolStudioInterface,
    argumentos: ConstrutoInterface[]
): Promise<string> {
    let formatoTexto: string = '';

    for (const argumento of argumentos) {
        const resultadoAvaliacao = await interpretador.avaliar(argumento);
        let valor = interpretador.resolverValor(resultadoAvaliacao);
        formatoTexto += `${interpretador.paraTexto(valor)} `;
    }

    return formatoTexto;
}

const bibliotecasDelegadasAoDeleguaNode = ['Arquivos', 'Internet', 'Util'];

function erroBibliotecaDelegada(caminho: string): never {
    throw new ErroEmTempoDeExecucao(
        undefined,
        `Biblioteca '${caminho}' depende de recursos específicos de ambiente e deve ser executada em um runtime que ofereça essa biblioteca, como o projeto delegua-node.`
    );
}

export function logicaComumImportacao(caminho: string): DeleguaModulo {
    switch (caminho) {
        case 'Calendario':
            return carregarBibliotecaCalendario();
        case 'Matematica':
            return carregarBibliotecaMatematica();
        case 'Objetos':
            return carregarBibliotecaObjetos();
        case 'Texto':
            return carregarBibliotecaTexto();
        case 'Tipos':
            return carregarBibliotecaTipos();
        default:
            if (bibliotecasDelegadasAoDeleguaNode.includes(caminho)) {
                erroBibliotecaDelegada(caminho);
            }

            throw new ErroEmTempoDeExecucao(undefined, `Biblioteca não implementada: ${caminho}.`);
    }
}

export async function visitarDeclaracaoImportarComum(declaracao: Importar): Promise<DeleguaModulo> {
    return Promise.resolve(logicaComumImportacao(declaracao.caminho.valor));
}

export async function visitarExpressaoImportarComum(expressao: ImportarComoConstruto): Promise<DeleguaModulo> {
    const caminho = typeof expressao.caminho.valor === 'string' ? expressao.caminho.valor : String(expressao.caminho.valor);
    return Promise.resolve(logicaComumImportacao(caminho));
}

function desenveloparConstruto(expressao: ConstrutoInterface | Declaracao): ConstrutoInterface {
    if (expressao instanceof Expressao) {
        return desenveloparConstruto((<Expressao>expressao).expressao);
    }

    // TODO: Verificar sem tem mais algum caso de declaração não coberto aqui.
    return expressao as ConstrutoInterface;
}

/**
 * Execução da leitura de valores da entrada configurada no
 * início da aplicação.
 * @param {Leia} expressao Expressão do tipo Leia.
 * @returns Não retorna valor.
 */
export async function visitarExpressaoLeiaComum(
    interpretador: VisitantePortugolStudioInterface,
    interfaceEntradaSaida: { question: (mensagem: string, funcaoResolucao: (resposta: any) => any) => void },
    expressao: Leia
): Promise<void> {
    const mensagem = '> ';
    for (let argumento of expressao.argumentos) {
        const promessaLeitura: Function = () =>
            new Promise((resolucao) =>
                interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                    resolucao(resposta);
                })
            );

        const valorLido = await promessaLeitura();
        const construtoVariavel = desenveloparConstruto(argumento);

        if (construtoVariavel instanceof AcessoIndiceVariavel) {
            // Aqui faz a mesma coisa que `AtribuicaoPorIndice`.
            // Pode ser interessante modificar o avaliador sintático para emitir este
            // construto e simplificar esta parte.
            const promises = await Promise.all([
                interpretador.avaliar(construtoVariavel.entidadeChamada),
                interpretador.avaliar(construtoVariavel.indice),
            ]);

            const variavel: VariavelInterface = promises[0];
            const indice = interpretador.resolverValor(promises[1]);

            variavel.valor[indice] = converterValor(variavel.subtipo as string, valorLido);
            continue;
        }

        if (construtoVariavel instanceof Variavel) {
            interpretador.pilhaEscoposExecucao.definirVariavel(construtoVariavel.simbolo.lexema, valorLido);
            continue;
        }

        throw new ErroEmTempoDeExecucao(
            undefined,
            'Argumento inválido em leia(). Esperado variável ou posição indexada de vetor/matriz.'
        );
    }
}

export async function visitarExpressaoMatrizComum(
    interpretador: VisitantePortugolStudioInterface,
    expressao: Matriz
): Promise<any> {
    if (expressao.valores && expressao.valores.length > 0) {
        return await resolverValoresMatriz(interpretador, expressao.valores);
    }

    // Caso não existam valores de inicialização, cada dimensão é inicializada
    // com valores padrão, de acordo com seu tipo.
    return await inicializarDimensaoMatrizVazia(interpretador, expressao.dimensoes, expressao.tipoDados);
}

async function inicializarDimensaoMatrizVazia(
    interpretador: VisitantePortugolStudioInterface,
    dimensoes: any[],
    tipoDeDados: string
): Promise<any> {
    const valoresResolvidos = [];
    const copiaDimensoes = [...dimensoes];
    const dimensaoAtual = copiaDimensoes.shift();
    const tamanhoDimensao = await interpretador.avaliar(dimensaoAtual);
    const valorTamanhoDimensao = interpretador.resolverValor(tamanhoDimensao);

    for (let i = 0; i < valorTamanhoDimensao; i++) {
        if (copiaDimensoes.length > 0) {
            valoresResolvidos.push(await inicializarDimensaoMatrizVazia(interpretador, copiaDimensoes, tipoDeDados));
        } else {
            switch (tipoDeDados) {
                case 'inteiro':
                case 'real':
                    valoresResolvidos.push(0);
                    break;
                case 'caracter':
                case 'cadeia':
                    valoresResolvidos.push('');
                    break;
                case 'logico':
                case 'lógico':
                    valoresResolvidos.push(false);
                    break;
            }
        }
    }

    return valoresResolvidos;
}

/**
 * Função recursiva que visita todos os valores de uma matriz, quando os valores são conhecidos.
 * @param interpretador A instância do interpretador.
 * @param valores A matriz de valores das dimensões ainda não resolvidas.
 */
async function resolverValoresMatriz(interpretador: VisitantePortugolStudioInterface, valores: any[]): Promise<any[]> {
    const valoresResolvidos = [];

    for (let i = 0; i < valores.length; i++) {
        if (Array.isArray(valores[i])) {
            valoresResolvidos.push(await resolverValoresMatriz(interpretador, valores[i]));
        } else {
            valoresResolvidos.push(await interpretador.avaliar(valores[i]));
        }
    }

    return valoresResolvidos;
}
