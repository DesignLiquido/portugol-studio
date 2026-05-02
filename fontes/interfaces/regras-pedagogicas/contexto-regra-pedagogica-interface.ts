import { DiagnosticoAnalisadorSemanticoInterface, GerenciadorEscopos, SimboloInterface } from "@designliquido/delegua";
import { Declaracao } from "@designliquido/delegua/declaracoes";

import { CorrecaoSugestaoPedagogica } from "./correcao-sugestao-pedagogica-interface";

export interface ContextoRegraPedagogica {
    corpoMetodoPrincipal: Declaracao[];
    diagnosticos: DiagnosticoAnalisadorSemanticoInterface[];
    gerenciadorEscopos: GerenciadorEscopos;
    sugestao: (
        simbolo: SimboloInterface,
        mensagem: string,
        correcoes: CorrecaoSugestaoPedagogica[]
    ) => void;
}
