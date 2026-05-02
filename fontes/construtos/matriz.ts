import { ConstrutoInterface } from '@designliquido/delegua/interfaces';

import { VisitantePortugolStudioInterface } from '../interfaces';

export class Matriz implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    dimensoes: ConstrutoInterface[];
    tipoDados: string;
    valores: any;

    constructor(hashArquivo: number, linha: number, dimensoes: ConstrutoInterface[], tipoDados: string, valores: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.dimensoes = dimensoes;
        this.tipoDados = tipoDados;
        this.valores = valores;
    }

    async aceitar(visitante: VisitantePortugolStudioInterface): Promise<any> {
        return await visitante.visitarExpressaoMatriz(this);
    }

    paraTexto(): string {
        return `<matriz />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
