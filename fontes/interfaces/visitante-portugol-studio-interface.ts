import { InterpretadorInterface, VisitanteComumInterface } from "@designliquido/delegua";

import { Limpa } from "../construtos/limpa";
import { Matriz } from "../construtos/matriz";

export interface VisitantePortugolStudioInterface extends VisitanteComumInterface, InterpretadorInterface {
    visitarExpressaoLimpa(expressao: Limpa): void | Promise<any>;
    visitarExpressaoMatriz(expressao: Matriz): void | Promise<any>;
}
