import { Declaracao, Expressao } from '@designliquido/delegua/declaracoes';
import { SimboloInterface } from '@designliquido/delegua/interfaces';
import { Atribuir, Leia, Variavel } from '@designliquido/delegua/construtos';

import { ContextoRegraPedagogica, CorrecaoSugestaoPedagogica } from './tipos-regras-pedagogicas';

function obterExpressaoDeclaracao(declaracao: Declaracao) {
    if (declaracao instanceof Expressao) {
        return declaracao.expressao;
    }

    return null;
}

function obterAtribuicaoVariavelParaVariavel(declaracao: Declaracao): {
    destino: Variavel;
    origem: Variavel;
    simbolo: SimboloInterface;
} | null {
    const expressao = obterExpressaoDeclaracao(declaracao);
    if (!(expressao instanceof Atribuir)) {
        return null;
    }

    if (!(expressao.alvo instanceof Variavel) || !(expressao.valor instanceof Variavel)) {
        return null;
    }

    return {
        destino: expressao.alvo,
        origem: expressao.valor,
        simbolo: expressao.alvo.simbolo,
    };
}

function desenveloparExpressaoLeia(argumento: any): any {
    if (argumento instanceof Expressao) {
        return desenveloparExpressaoLeia(argumento.expressao);
    }

    return argumento;
}

function obterVariaveisLeia(declaracao: Declaracao): Variavel[] {
    const expressao = obterExpressaoDeclaracao(declaracao);
    if (!(expressao instanceof Leia)) {
        return [];
    }

    const variaveis: Variavel[] = [];
    for (const argumento of expressao.argumentos) {
        const resolvido = desenveloparExpressaoLeia(argumento);
        if (resolvido instanceof Variavel) {
            variaveis.push(resolvido);
        }
    }

    return variaveis;
}

function criarCorrecaoSugestao(
    simbolo: SimboloInterface,
    titulo: string,
    textoOriginal: string,
    textoSubstituto: string
): CorrecaoSugestaoPedagogica {
    const colunaInicio = simbolo.colunaInicio ?? 0;
    const colunaFim = simbolo.colunaFim ?? colunaInicio + textoOriginal.length;

    return {
        titulo,
        textoOriginal,
        textoSubstituto,
        linha: simbolo.linha,
        colunaInicio,
        colunaFim,
    };
}

export function aplicarRegraOrdemLeituraEscrita(contexto: ContextoRegraPedagogica): void {
    const declaracoes = contexto.corpoMetodoPrincipal;

    for (let i = 0; i < declaracoes.length; i++) {
        const variaveisLidas = obterVariaveisLeia(declaracoes[i]);
        if (variaveisLidas.length < 2) {
            continue;
        }

        const primeira = variaveisLidas[0].simbolo.lexema;
        const segunda = variaveisLidas[1].simbolo.lexema;

        for (let j = i + 1; j < declaracoes.length - 1; j++) {
            const atribuicao1 = obterAtribuicaoVariavelParaVariavel(declaracoes[j]);
            const atribuicao2 = obterAtribuicaoVariavelParaVariavel(declaracoes[j + 1]);

            if (!atribuicao1 || !atribuicao2) {
                continue;
            }

            const ehPadraoTrocaSemAuxiliar =
                atribuicao1.destino.simbolo.lexema === primeira &&
                atribuicao1.origem.simbolo.lexema === segunda &&
                atribuicao2.destino.simbolo.lexema === segunda &&
                atribuicao2.origem.simbolo.lexema === primeira;

            if (!ehPadraoTrocaSemAuxiliar) {
                continue;
            }

            const correcao = criarCorrecaoSugestao(
                atribuicao2.simbolo,
                'Reordene a troca de valores',
                `${segunda} = ${primeira}`,
                `${segunda} = aux`
            );

            contexto.sugestao(
                atribuicao2.simbolo,
                `A ordem de escrita pode sobrescrever o valor original de '${segunda}'. Considere preservar o valor antes da troca.`,
                [correcao]
            );

            return;
        }
    }
}
