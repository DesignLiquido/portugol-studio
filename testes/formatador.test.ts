import * as sistemaOperacional from 'os';

import { AvaliadorSintaticoPortugolStudio } from '../fontes/avaliador-sintatico/avaliador-sintatico-portugol-studio';
import { FormatadorPortugolStudio } from '../fontes/formatador/formatador-portugol-studio';
import { LexadorPortugolStudio } from '../fontes/lexador/lexador-portugol-studio';

describe('Formatador', () => {
    const formatador = new FormatadorPortugolStudio(sistemaOperacional.EOL);
    const avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
    const lexador = new LexadorPortugolStudio();

    it('Olá mundo', () => {
        const retornoLexador = lexador.mapear(
            ['programa{funcao inicio(){escreva("Olá Mundo")}}'], -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(8);
        expect(linhasResultado[0]).toContain("programa");
        expect(linhasResultado[1]).toContain("{");
        expect(linhasResultado[2]).toContain("funcao inicio()");
        expect(linhasResultado[3]).toContain("{");
        expect(linhasResultado[4]).toContain('escreva("Olá Mundo")');
        expect(linhasResultado[5]).toContain('}');
        expect(linhasResultado[6]).toContain('}');
    });

    it('Leia com condicional se', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa{',
                ' funcao inicio()',
                '   {',
                '   inteiro n',
                '     leia(n)',
                '        se(n== 1 ){',
                '         escreva("É igual a 1")',
                '        }',
                '        senao {',
                '                escreva("Não é igual a 1")}',
                ' }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(14);
        expect(linhasResultado[0]).toContain("programa");
        expect(linhasResultado[1]).toContain("{");
        expect(linhasResultado[2]).toContain("funcao inicio()");
        expect(linhasResultado[3]).toContain("{");
        expect(linhasResultado[4]).toContain("inteiro n = 0");
        expect(linhasResultado[5]).toContain("leia(n)");
        expect(linhasResultado[6]).toContain("se (n == 1) {");
        expect(linhasResultado[7]).toContain('escreva("É igual a 1")');
        expect(linhasResultado[8]).toContain("} senao {");
        expect(linhasResultado[9]).toContain('escreva("Não é igual a 1")');
    });

    it('Sucesso - Agrupamento', () => {
        const retornoLexador = lexador.mapear(
            [
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

        expect(linhasResultado).toHaveLength(14);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });

    /* TODO - Por resolver */
    it('Faca', async () => {
        const retornoLexador = lexador.mapear(
            [
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
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(17);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });

    it('Estruturas de dados', async () => {
        const retornoLexador = lexador.mapear(
            [
                'programa',
                '{  ',
                'inteiro variavel',

                'funcao inicio()',
                '{  ',
                'inteiro outra_variavel',

                'real altura = 1.79',

                'cadeia frase = "Isso é uma variável do tipo cadeia"',

                "caracter inicial = 'P'",

                'logico exemplo = verdadeiro',

                'escreva(altura)',
                '}',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(14);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });

    it('Constante', async () => {
        const retornoLexador = lexador.mapear(
            [
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
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado.length).toBeGreaterThanOrEqual(37);
    });
    it('Escolha', async () => {
        const retornoLexador = lexador.mapear(
            [
                'programa',
                '{',
                'funcao inicio()',
                '{',
                'escolha (77)',
                '{',
                'caso 1:',
                'escreva ("Voce é lindo(a)!")',
                'pare', // Impede que as instruções do caso 2 sejam executadas
                'caso 2:',
                'escreva ("Voce é um monstro!")',
                'pare', // Impede que as instruções do caso 2 sejam executadas
                'caso 3:',
                'escreva ("Tchau!")',
                'pare',
                'caso contrario:', // Será executado para qualquer opção diferente de 1, 2 ou 3
                'escreva ("Opção Inválida !")',
                '}',
                'escreva("\n")',
                '}',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado.length).toBeGreaterThanOrEqual(18);
    });

    it('Enquanto', async () => {
        const retornoLexador = lexador.mapear(
            [
                'programa',
                '{',
                '    funcao inicio()',
                '    {',
                '        inteiro numero, atual = 1, fatorial = 1',
                '        escreva("Digite um numero: ")',
                '        leia(numero)',
                '        enquanto (atual <= numero)',
                '        {',
                '            fatorial = fatorial * atual',
                '            atual = atual + 1',
                '        }',
                '        escreva("O fatorial de ", numero, " é: ", fatorial, "\n")',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado.length).toBeGreaterThanOrEqual(17);
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

        expect(linhasResultado).toHaveLength(18);
    });
    it('Para', async () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '      para (inteiro i = 1; i <= 10; i++) {',
                '        escreva(i)',
                '      }',
                '    }',
                '  }',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(12);
    });
    it('Atribuição de Vetores', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        inteiro numeros[5] = {23,42,10,24,66}',
                '        escreva("zero:", numeros[5])',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(9);
    });
    it('Atribuição de Variáveis', async () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        inteiro a = 2',
                '        inteiro b = a',
                '        escreva("variáveis a:",a," b:",b)',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(10);
    });

    it('Funções', () => {
        const retornoLexador = lexador.mapear(
            [
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
                '}',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(31);
    });

    it('Comentários Multilinha', () => {
        const retornoLexador = lexador.mapear(
            [
                '/*',
                'Este é um comentário',
                'multilinha',
                '*/',
                'programa {',
                '    funcao inicio() {',
                '        escreva("Teste")',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(resultado).toContain('Este é um comentário');
        expect(resultado).toContain('multilinha');
        expect(linhasResultado.length).toBeGreaterThan(8);
    });

    it('Operadores Binários - Módulo', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        inteiro resto',
                '        resto = 10 % 3',
                '        escreva(resto)',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('10 % 3');
    });

    it('Operadores Binários - Maior Igual e Menor Igual', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        inteiro a = 5',
                '        inteiro b = 10',
                '        se (a >= 5) {',
                '            escreva("maior ou igual")',
                '        }',
                '        se (b <= 10) {',
                '            escreva("menor ou igual")',
                '        }',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('>=');
        expect(resultado).toContain('<=');
    });

    it('Operadores Unários - Negação', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        logico ativo = falso',
                '        se (nao ativo) {',
                '            escreva("inativo")',
                '        }',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('nao ');
        expect(resultado).toContain('falso');
    });

    it('Literais Booleanos', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        logico verdade = verdadeiro',
                '        logico mentira = falso',
                '        escreva(verdade, mentira)',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('verdadeiro');
        expect(resultado).toContain('falso');
    });

    it('Atribuição Por Índice', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        inteiro numeros[3]',
                '        numeros[0] = 10',
                '        numeros[1] = 20',
                '        escreva(numeros[0])',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('numeros[0] = 10');
        expect(resultado).toContain('numeros[1] = 20');
    });

    it('Declaração Var com tipo logico', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        logico ativo = verdadeiro',
                '        escreva(ativo)',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('logico');
        expect(resultado).toContain('verdadeiro');
    });

    it('Operador de Subtração', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        inteiro a = 10',
                '        inteiro b = 5',
                '        inteiro resultado = a - b',
                '        escreva(resultado)',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain(' - ');
    });

    it('Vetor de Texto', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        cadeia nomes[2]',
                '        nomes[0] = "Ana"',
                '        escreva(nomes[0])',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('cadeia');
        expect(resultado).toContain('"Ana"');
        expect(resultado).toContain('nomes[0]');
    });

    it('Operador de Maior', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao inicio() {',
                '        inteiro x = 10',
                '        se (x > 5) {',
                '            escreva("maior")',
                '        }',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain(' > ');
    });

    it('Retorno sem valor', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa {',
                '    funcao vazia() {',
                '        escreva("executando")',
                '        retorne',
                '    }',
                '    funcao inicio() {',
                '        vazia()',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('retorne');
        expect(resultado).toContain('funcao vazia()');
    });

    it('Múltiplos comentários de linha única', () => {
        const retornoLexador = lexador.mapear(
            [
                '// Comentário 1',
                '// Comentário 2',
                'programa {',
                '    funcao inicio() {',
                '        // Comentário 3',
                '        escreva("teste")',
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('Comentário 1');
        expect(resultado).toContain('Comentário 2');
    });

    it('Chamadas de função sem argumentos - limpa()', () => {
        const retornoLexador = lexador.mapear(
            [
                'programa',
                '{',
                '    funcao inicio()',
                '    {',
                "        escreva('123')",
                '        limpa()',
                "        escreva('456')",
                '    }',
                '}',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('limpa()');
        expect(resultado).toContain('escreva("123")');
        expect(resultado).toContain('escreva("456")');

        // Verify that all three statements are on separate lines
        const linhasResultado = resultado.split(sistemaOperacional.EOL);
        const linhaLimpa = linhasResultado.findIndex(linha => linha.includes('limpa()'));
        const linhaEscreva123 = linhasResultado.findIndex(linha => linha.includes('escreva("123")'));
        const linhaEscreva456 = linhasResultado.findIndex(linha => linha.includes('escreva("456")'));

        expect(linhaLimpa).toBeGreaterThan(-1);
        expect(linhaEscreva123).toBeGreaterThan(-1);
        expect(linhaEscreva456).toBeGreaterThan(-1);
        expect(linhaLimpa).not.toEqual(linhaEscreva123);
        expect(linhaLimpa).not.toEqual(linhaEscreva456);
    });
});
