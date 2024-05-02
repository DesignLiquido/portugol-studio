import { VisitanteComumInterface } from "@designliquido/delegua";

import { Limpa } from "../construtos/limpa";

export interface VisitantePortugolStudioInterface extends VisitanteComumInterface {
    visitarExpressaoLimpa(expressao: Limpa): Promise<any>;
}