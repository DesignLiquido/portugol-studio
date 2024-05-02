import { Construto } from "@designliquido/delegua";

import { VisitantePortugolStudioInterface } from "../interfaces";

export class Limpa implements Construto {
    linha: number;
    hashArquivo: number;

    constructor(hashArquivo: number, linha: number) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
    }

    aceitar(visitante: VisitantePortugolStudioInterface): Promise<any> {
        throw new Error("Method not implemented.");
    }
}
