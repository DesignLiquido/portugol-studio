import { Construto } from "@designliquido/delegua";

import { VisitantePortugolStudioInterface } from "../interfaces";

export class Limpa implements Construto {
    linha: number;
    hashArquivo: number;

    constructor(hashArquivo: number, linha: number) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
    }

    async aceitar(visitante: VisitantePortugolStudioInterface): Promise<any> {
        return await visitante.visitarExpressaoLimpa(this);
    }
}
