import * as sistemaOperacional from 'os';

import { AvaliadorSintaticoPortugolStudio } from '../fontes/avaliador-sintatico/avaliador-sintatico-portugol-studio';
import { FormatadorPortugolStudio } from '../fontes/formatador/formatador-portugol-studio';
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

        expect(linhasResultado).toHaveLength(6);
    });

    it('Leia com condicional se', () => {
        const retornoLexador = lexador.mapear([
            'programa',
            '{',
            '    funcao inicio()',
            '    {',
            '        inteiro n',
            '        leia(n)',
            '        se(n == 1) {',
            '           escreva("É igual a 1")',
            '        }',
            '        senao {',
            '           escreva("Não é igual a 1")',
            '        }',
            '    }',
            '}'
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(12);
    });

    it('Sucesso - Agrupamento', () => {
        const retornoLexador = lexador.mapear([
            'programa',
            '{',
            '    funcao inicio()',
            '    {',
            '        inteiro base',
            '        inteiro altura',
            '        inteiro area',
            '        escreva("Insira a base: ")',
            '        leia(base)',
            '        escreva("Insira a altura: ")',
            '        leia(altura)',
            '        area = (base * altura) / 2',
            '        escreva("A area do triangulo é: ", area)',
            '    }',
            '}'
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(14);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });
    it('Sucesso - Leia', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa',
                '{',
                '    funcao inicio()',
                '    {',
                '        inteiro numero1, numero2, numero3, numero4, numero5',
                '        leia(numero1, numero2, numero3, numero4, numero5)',
                '        escreva(numero1 + numero2 + numero3 + numero4 + numero5)',
                '    }',
                '}',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(12);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });

    /* TODO - Por resolver */
    it('Faca', async () => {
        const retornoLexador = lexador.mapear([
            'programa',
            '{',
            '   ',
            '    funcao inicio()',
            '    {',
            '        inteiro valor = 2',
            '        logico eNegativo',
            '        faca',
            '        {',
            '           escreva("Ok", valor,"")',
            '           valor--',
            '           eNegativo = valor < 0',
            '        }',
            '        enquanto(nao eNegativo)',
            '    }',
            '}'
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(12);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });

    it('Estruturas de dados', async () => {
        const retornoLexador = lexador.mapear([
            'programa',
            '{  ',
            //variável global do tipo inteiro
            'inteiro variavel',

            'funcao inicio()',
            '{  ',
            'inteiro outra_variavel',

            'real altura = 1.79',

            'cadeia frase = "Isso é uma variável do tipo cadeia"',

            'caracter inicial = \'P\'',

            'logico exemplo = verdadeiro',

            'escreva(altura)',
            '}',
            '}',
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(12);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });

    it('Constante', async () => {
        const retornoLexador = lexador.mapear([
            'programa',
            '{',
            'funcao inicio ()',
            '{	',

            'const real PRECO_PARAFUSO = 1.50',
            'const real PRECO_ARRUELA  = 2.00',
            'const real PRECO_PORCA    = 2.50',

            'cadeia nome',
            'inteiro quantidade_parafusos, quantidade_arruelas, quantidade_porcas',
            'real total_parafusos, total_arruelas, total_porcas, total_pagar',

            'escreva("Digite seu nome: ")',
            'leia(nome)',

            'escreva("\nDigite a quantidade de parafusos que deseja comprar: ")',
            'leia(quantidade_parafusos)',

            'escreva("Digite a quantidade de arruelas que deseja comprar: ")',
            'leia(quantidade_arruelas)',

            'escreva("Digite a quantidade de porcas que deseja comprar: ")',
            'leia(quantidade_porcas)',

            'total_parafusos = PRECO_PARAFUSO * quantidade_parafusos',
            'total_arruelas = PRECO_ARRUELA * quantidade_arruelas',
            'total_porcas = PRECO_PORCA * quantidade_porcas',

            'total_pagar = total_parafusos + total_porcas + total_arruelas',

            'escreva("Cliente: ", nome, "\n")',
            'escreva("===============================\n")',
            'escreva("Parafusos: ", quantidade_parafusos, "\n")',
            'escreva("Arruelas: " , quantidade_arruelas, "\n")',
            'escreva("Porcas: ", quantidade_porcas, "\n")',
            'escreva("===============================\n")',
            'escreva("Total a pagar:  R$ ", total_pagar, "\n")',
            '}',
            '}',
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(35);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });
    it('Escolha', async () => {
        const retornoLexador = lexador.mapear([
            'programa',
            '{',
            'funcao inicio()',
            '{',
            'escolha (77)',
            '{',
            'caso 1:',
            'escreva ("Voce é lindo(a)!")',
            'pare',   // Impede que as instruções do caso 2 sejam executadas
            'caso 2:',
            'escreva ("Voce é um monstro!")',
            'pare',   // Impede que as instruções do caso 2 sejam executadas
            'caso 3:',
            'escreva ("Tchau!")',
            'pare',
            'caso contrario:', // Será executado para qualquer opção diferente de 1, 2 ou 3
            'escreva ("Opção Inválida !")',
            '}',
            'escreva("\n")',
            '}',
            '}',
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(16);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });
    it('Enquanto', async () => {
        const retornoLexador = lexador.mapear([
            'programa',
            '{',
            '    funcao inicio()',
            '    {',
            '        inteiro numero, atual = 1, fatorial = 1',
            '        ',
            '        escreva("Digite um numero: ")',
            '        leia(numero)',
            '        ',
            '        enquanto (atual <= numero)',
            '        {',
            '            fatorial = fatorial * atual',
            '            atual = atual + 1',
            '        }',
            '        ',
            '        escreva("O fatorial de ", numero, " é: ", fatorial, "\n")',
            '    }',
            '}'
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(15);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });
    it('Estrutura condicional - se e senao', async () => {
        const retornoLexador = lexador.mapear(
            [
                'programa',
                '{',
                '    funcao inicio()',
                '    {',
                '        real numeroUm, numeroDois, soma',
                '        numeroUm = 12.0',
                '        numeroDois = 20.0',
                '        soma = numeroUm + numeroDois',
                '        se (soma > 20)',
                '        {',
                '            escreva("Numero maior que 20")',
                '        }',
                '        senao',
                '        {',
                '            escreva("Numero menor que 20")',
                '        }',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(16);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });
    it('Para', async () => {
        const retornoLexador = lexador.mapear([
            'programa {',
            '    funcao inicio() {',
            '      para (inteiro i = 1; i <= 10; i++) {',
            '        escreva(i)',
            '      }',
            '    }',
            '  }'
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(8);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });
    it('Atribuição de Vetores', () => {
        const retornoLexador = lexador.mapear([
            'programa {',
            '    funcao inicio() {',
            '        inteiro numeros[5] = {23,42,10,24,66}',
            '        escreva("zero:", numeros[5])',
            '    }',
            '}'
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(7);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });
    it('Atribuição de Variáveis', async () => {
        const retornoLexador = lexador.mapear([
            'programa {',
            '    funcao inicio() {',
            '        inteiro a = 2',
            '        inteiro b = a',
            '        escreva("variáveis a:",a," b:",b)',
            '    }',
            '}'
        ], -1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(8);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });

    it('Funções', () => {
        const retornoLexador = lexador.mapear([
            'programa',
            '{',
            '    funcao inicio()',
            '    {',
            '      mensagem("Bem Vindo")',
            '      escreva("O resultado do primeiro cálculo é: ", calcula (3.0, 4.0))',
            '      escreva("O resultado do segundo cálculo é: ", calcula (7.0, 2.0), "")',
            '      mensagem("Tchau")',
            '    }',
            '',
            '    funcao mensagem (cadeia texto)',
            '    {',
            '        inteiro i',
            '        ',
            '        para (i = 0; i < 50; i++)',
            '        {',
            '          escreva ("-")',
            '        }',
            '        ',
            '        escreva ("", texto, "")',
            '        ',
            '        para (i = 0; i < 50; i++)',
            '        {',
            '          escreva ("-")',
            '        }',
            '        ',
            '        escreva("")',
            '    }',
            '',
            '    funcao real calcula (real a, real b)',
            '    {',
            '        real resultado',
            '        resultado = a * a + b * b',
            '        retorne resultado',
            '    }',
            '}'
        ], -1);

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);


        expect(linhasResultado).toHaveLength(23);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
    });
});
