import { AcessoIndiceVariavel, Construto, Variavel } from '@designliquido/delegua/construtos';
import { Declaracao, Expressao, Importar, Leia } from '@designliquido/delegua/declaracoes';
import { DeleguaModulo, FuncaoPadrao } from '@designliquido/delegua/estruturas';
import { ErroEmTempoDeExecucao } from '@designliquido/delegua/excecoes';
import { VariavelInterface } from '@designliquido/delegua';

import { VisitantePortugolStudioInterface } from '../interfaces';
import { Matriz } from '../construtos/matriz';
import { converterValor } from './inferenciador';

import * as calendario from '../bibliotecas/calendario';
import * as internet from '../bibliotecas/internet';
import * as matematica from '../bibliotecas/matematica';
import * as texto from '../bibliotecas/texto';
import * as tipos from '../bibliotecas/tipos';
import * as util from '../bibliotecas/util';

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
        dia_semana_curto: new FuncaoPadrao(0, calendario.dia_semana_completo),
    };

    const objetoCalendario = new DeleguaModulo('Calendario');
    objetoCalendario.componentes = metodos;
    return objetoCalendario;
}

function carregarBibliotecaInternet(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        definir_tempo_limite: new FuncaoPadrao(1, internet.definir_tempo_limite),
        obter_texto: new FuncaoPadrao(1, internet.obter_texto),
        baixar_imagem: new FuncaoPadrao(2, internet.baixar_imagem),
        endereco_disponivel: new FuncaoPadrao(1, internet.endereco_disponivel)
    };

    const objetoInternet = new DeleguaModulo('Internet');
    objetoInternet.componentes = metodos;
    return objetoInternet;
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
    return objetoMatematica;
}

function carregarBibliotecaTexto(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        numero_caracteres: new FuncaoPadrao(1, texto.numero_caracteres),
        caixa_alta: new FuncaoPadrao(1, texto.caixa_alta),
        caixa_baixa: new FuncaoPadrao(1, texto.caixa_baixa),
        substituir: new FuncaoPadrao(1, texto.substituir),
        preencher_a_esquerda: new FuncaoPadrao(1, texto.preencher_a_esquerda),
        obter_caracter: new FuncaoPadrao(1, texto.obter_caracter),
        posicao_texto: new FuncaoPadrao(1, texto.posicao_texto),
        extrair_subtexto: new FuncaoPadrao(1, texto.extrair_subtexto),
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
        real_para_inteiro: new FuncaoPadrao(1, tipos.real_para_inteiro)
    };

    const objetoTipos = new DeleguaModulo('Tipos');
    objetoTipos.componentes = metodos;
    return objetoTipos;
}

function carregarBibliotecaUtil(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        obter_diretorio_usuario: new FuncaoPadrao(0, util.obter_diretorio_usuario),
        numero_elementos: new FuncaoPadrao(1, util.numero_elementos),
        numero_linhas: new FuncaoPadrao(1, util.numero_linhas),
        numero_colunas: new FuncaoPadrao(1, util.numero_colunas),
        sorteia: new FuncaoPadrao(2, util.sorteia),
        aguarde: new FuncaoPadrao(1, util.aguarde),
        tempo_decorrido: new FuncaoPadrao(0, util.tempo_decorrido)
    };

    const objetoUtil = new DeleguaModulo('Util');
    objetoUtil.componentes = metodos;
    return objetoUtil;
}

/**
 * Avaliação de argumentos para `escreva`. Diferentemente de outros dialetos, aqui não ocorre `trimEnd`, já que `\n`
 * É significativo para Portugol Studio.
 * @param interpretador A instância do interpretador.
 * @param argumentos Os argumentos.
 * @returns {string} O texto formatado.
 */
export async function avaliarArgumentosEscreva(interpretador: VisitantePortugolStudioInterface, argumentos: Construto[]): Promise<string> {
    let formatoTexto: string = '';

    for (const argumento of argumentos) {
        const resultadoAvaliacao = await interpretador.avaliar(argumento);
        let valor = resultadoAvaliacao?.hasOwnProperty('valor') ? resultadoAvaliacao.valor : resultadoAvaliacao;
        formatoTexto += `${interpretador.paraTexto(valor)} `;
    }

    return formatoTexto;
}

export async function visitarExpressaoImportarComum(expressao: Importar): Promise<any> {
    switch (expressao.caminho.valor) {
        case 'Calendario':
            return carregarBibliotecaCalendario();
        case 'Internet':
            return carregarBibliotecaInternet();
        case 'Matematica':
            return carregarBibliotecaMatematica();
        case 'Texto':
            return carregarBibliotecaTexto();
        case 'Tipos':
            return carregarBibliotecaTipos();
        case 'Util':
            return carregarBibliotecaUtil();
        default:
            throw new ErroEmTempoDeExecucao(null, `Biblioteca não implementada: ${expressao.caminho}.`);
    }
}

function desenveloparConstruto(expressao: Construto | Declaracao): Construto {
    if (expressao instanceof Expressao) {
        return desenveloparConstruto((<Expressao>expressao).expressao);
    }

    return expressao;
}

/**
 * Execução da leitura de valores da entrada configurada no
 * início da aplicação.
 * @param {Leia} expressao Expressão do tipo Leia.
 * @returns Não retorna valor.
 */
export async function visitarExpressaoLeiaComum(
    interpretador: VisitantePortugolStudioInterface, 
    interfaceEntradaSaida: { question: (mensagem: string, funcaoResolucao: (resposta: any) => any) => void},
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
                interpretador.avaliar(construtoVariavel.indice)
            ]);

            const variavel: VariavelInterface = promises[0];
            const indice: VariavelInterface = promises[1];

            variavel.valor[indice.valor] = converterValor(variavel.subtipo, valorLido);
        } else {
            interpretador.pilhaEscoposExecucao.definirVariavel((construtoVariavel as any).simbolo.lexema, valorLido);
        }
    }
}

export async function visitarExpressaoMatrizComum(
    interpretador: VisitantePortugolStudioInterface, 
    expressao: Matriz
): Promise<any> {
    return await resolverValoresMatriz(interpretador, expressao.valores);
}

/**
 * Função recursiva que visita todos os valores de uma matriz.
 * @param interpretador A instância do interpretador.
 * @param valores A matriz de valores das dimensões ainda não resolvidas.
 */
async function resolverValoresMatriz(interpretador: VisitantePortugolStudioInterface, valores: any[]) {
    const valoresResolvidos = [];
    if (valores && valores.length > 0) {
        for (let i = 0; i < valores.length; i++) {
            if (Array.isArray(valores[i])) {
                valoresResolvidos.push(await resolverValoresMatriz(interpretador, valores[i]));
            } else {
                valoresResolvidos.push(await interpretador.avaliar(valores[i]));
            }
        }
    }
    
    return valoresResolvidos;
}
