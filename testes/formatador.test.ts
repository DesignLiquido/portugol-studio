import * as sistemaOperacional from 'os';

import { FormatadorPortugolStudio } from '@designliquido/delegua/fontes/formatadores';

import { AvaliadorSintaticoPortugolStudio } from '../fontes';
import { LexadorPortugolStudio } from '../fontes/lexador/lexador-portugol-studio';

describe('Formatadores > Portugol Studio', () => {
    const formatador = new FormatadorPortugolStudio(sistemaOperacional.EOL);
    const avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
    const lexador = new LexadorPortugolStudio();

    it('Olá mundo', () => {
        const retornoLexador = lexador.mapear([
            'programa',
            '{',
            '   ',
            '    funcao inicio()',
            '    {',
            '        escreva("Olá Mundo")',
            '    }',
            '}'
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(7);
    });

});
