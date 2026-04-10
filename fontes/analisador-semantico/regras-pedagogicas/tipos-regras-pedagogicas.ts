import { Declaracao } from '@designliquido/delegua/declaracoes';
import { GerenciadorEscopos } from '@designliquido/delegua/analisador-semantico/gerenciador-escopos';
import { SimboloInterface } from '@designliquido/delegua/interfaces';
import { DiagnosticoAnalisadorSemantico } from '@designliquido/delegua/interfaces/erros';

export interface CorrecaoSugestaoPedagogica {
    titulo: string;
    textoOriginal: string;
    textoSubstituto: string;
    linha: number;
    colunaInicio: number;
    colunaFim: number;
}

export interface ContextoRegraPedagogica {
    corpoMetodoPrincipal: Declaracao[];
    diagnosticos: DiagnosticoAnalisadorSemantico[];
    gerenciadorEscopos: GerenciadorEscopos;
    sugestao: (
        simbolo: SimboloInterface,
        mensagem: string,
        correcoes: CorrecaoSugestaoPedagogica[]
    ) => void;
}
