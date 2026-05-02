import { DiagnosticoSeveridade } from '@designliquido/delegua/interfaces/erros';

import { ContextoRegraPedagogica } from '../../interfaces/regras-pedagogicas';

export function aplicarRegraVariaveisNaoUsadas(contexto: ContextoRegraPedagogica): void {
    const naoUsadas = contexto.gerenciadorEscopos.obterVariaveisNaoUsadas();

    for (const variavel of naoUsadas) {
        const temErro = contexto.diagnosticos.some(
            (d) => d.severidade === DiagnosticoSeveridade.ERRO && d.simbolo?.lexema === variavel.nome
        );

        if (temErro) {
            continue;
        }

        contexto.sugestao(
            {
                lexema: variavel.nome,
                linha: variavel.linha,
                tipo: variavel.tipo,
                hashArquivo: variavel.hashArquivo,
                literal: null,
            },
            `Variável '${variavel.nome}' foi declarada mas nunca usada.`,
            []
        );
    }
}
