import { Construto } from '@designliquido/delegua/construtos';
import { VisitantePortugolStudioInterface } from '../interfaces';

export class Matriz implements Construto {
    linha: number;
    hashArquivo: number;
    dimensoes: Construto[];
    tipoDados: string;
    valores: any;

    constructor(hashArquivo: number, linha: number, dimensoes: Construto[], tipoDados: string, valores: any) {
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
