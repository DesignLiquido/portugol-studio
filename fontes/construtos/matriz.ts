import { VisitanteComumInterface } from "@designliquido/delegua";
import { Construto } from "@designliquido/delegua/construtos";

import { InterpretadorPortugolStudio } from "../interpretador";

export class Matriz implements Construto {
    linha: number;
    hashArquivo: number;
    dimensoes: number[];
    valores: any;

    constructor(hashArquivo: number, linha: number, dimensoes: number[], valores: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.dimensoes = dimensoes;
        this.valores = valores;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await (visitante as InterpretadorPortugolStudio).visitarExpressaoMatriz(this);
    }
}
