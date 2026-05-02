import { ConstrutoInterface } from '@designliquido/delegua/interfaces';

import { VisitantePortugolStudioInterface } from '../interfaces';

export class Limpa implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    constructor(hashArquivo: number, linha: number) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
    }

    async aceitar(visitante: VisitantePortugolStudioInterface): Promise<any> {
        return await visitante.visitarExpressaoLimpa(this);
    }

    paraTexto(): string {
        return `<limpa />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
