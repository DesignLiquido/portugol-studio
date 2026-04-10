import { Declaracao, Expressao } from '@designliquido/delegua/declaracoes';
import { SimboloInterface } from '@designliquido/delegua/interfaces';
import { Atribuir, Variavel } from '@designliquido/delegua/construtos';
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

export function aplicarRegraUsoVariavelAuxiliar(contexto: ContextoRegraPedagogica): void {
    const declaracoes = contexto.corpoMetodoPrincipal;

    for (let i = 0; i < declaracoes.length - 1; i++) {
        const atribuicao1 = obterAtribuicaoVariavelParaVariavel(declaracoes[i]);
        const atribuicao2 = obterAtribuicaoVariavelParaVariavel(declaracoes[i + 1]);

        if (!atribuicao1 || !atribuicao2) {
            continue;
        }

        const a = atribuicao1.destino.simbolo.lexema;
        const b = atribuicao1.origem.simbolo.lexema;

        const trocaSemAuxiliar =
            atribuicao2.destino.simbolo.lexema === b && atribuicao2.origem.simbolo.lexema === a;

        if (!trocaSemAuxiliar) {
            continue;
        }

        const correcao = criarCorrecaoSugestao(
            atribuicao1.simbolo,
            'Use variável auxiliar',
            `${a} = ${b}`,
            `aux = ${a}`
        );

        contexto.sugestao(
            atribuicao1.simbolo,
            `Considere utilizar uma variável auxiliar para trocar os valores de '${a}' e '${b}' de forma segura.`,
            [correcao]
        );

        return;
    }
}
