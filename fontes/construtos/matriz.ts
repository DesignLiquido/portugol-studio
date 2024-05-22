import { Construto } from "@designliquido/delegua/construtos";
import { VisitantePortugolStudioInterface } from "../interfaces";

export class Matriz implements Construto {
    linha: number;
    hashArquivo: number;
    dimensoes: Construto[];
    valores: any;

    constructor(hashArquivo: number, linha: number, dimensoes: Construto[], valores: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.dimensoes = dimensoes;
        this.valores = valores;
    }

    async aceitar(visitante: VisitantePortugolStudioInterface): Promise<any> {
        return await visitante.visitarExpressaoMatriz(this);
    }
}
