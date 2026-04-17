import { ErroAvaliadorSintatico } from "@designliquido/delegua/avaliador-sintatico";
import { Expressao, FuncaoDeclaracao } from "@designliquido/delegua/declaracoes";

import { AvaliadorSintaticoPortugolStudio } from "../fontes";
import { LexadorPortugolStudio } from "../fontes/lexador/lexador-portugol-studio";
import { Limpa } from "../fontes/construtos";


describe('Avaliador sintático (Portugol Studio)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPortugolStudio;
        let avaliadorSintatico: AvaliadorSintaticoPortugolStudio;

        beforeEach(() => {
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
        });

        describe('Casos de Sucesso', () => {
            it('Olá Mundo', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'programa',
                        '{',
                        '    funcao inicio()',
                        '    {',
                        '        escreva("Olá Mundo")',
                        '    }',
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
            });

            it('Comentários', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        '/* Teste */',
                        'programa ',
                        '{ ',
                        '	funcao inicio () ',
                        '	{',
                        '		escreva("Olá Mundo!\n")',
                        '	} ',
                        '}',
                        '/* Outro teste */',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });

            it('Estruturas de dados', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'programa',
                        '{',
                        '    inteiro variavel',
                        '    ',
                        '    funcao inicio()',
                        '    {',
                        '        inteiro outra_variavel',
                        '        real altura = 1.79',
                        '        cadeia frase = "Isso é uma variável do tipo cadeia"',
                        '        caracter inicial = \'P\'',
                        '        logico exemplo = verdadeiro',
                        '        escreva(altura)',
                        '    }',
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThanOrEqual(2);
            });

            it('Agrupamento', async () => {
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
                    '        escreva("\nA area do triangulo é: ", area)',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Escolha', async () => {
                const retornoLexador = lexador.mapear([
                    'programa {',
                    '    funcao calculadora (){ ',
                    '        inteiro opcao',
                    '        faca {',
                    '            escreva("Escolha uma opção\n")',
                    '            escreva("1 - Soma\n 2 - Subtração\n 0 - Sair")',
                    '            leia(opcao)',
                    '            escolha (opcao){',
                    '                caso 1:',
                    '                somar ()',
                    '                pare',
                    '                caso 2:',
                    '                subtrair ()',
                    '                pare ',
                    '                caso 0:',
                    '                escreva("Saindo da calculadora...\n")',
                    '                pare',
                    '                caso contrario:',
                    '                escreva ("Opção invalida")',
                    '            } ',
                    '        } enquanto(opcao!=0)',
                    '    }',
                    '    funcao somar (){',
                    '        real num1,num2',
                    '        escreva("Informe o primeiro numero: ")',
                    '        leia (num1)',
                    '        escreva("Informe o segundo numero: ")',
                    '        leia (num2)',
                    '        escreva(" A Soma é: ",num1 + num2)',
                    '    } ',
                    '    funcao subtrair (){',
                    '        real num1,num2',
                    '        escreva("Informe o primeiro numero: ")',
                    '        leia (num1)',
                    '        escreva("Informe o segundo numero: ")',
                    '        leia (num2)',
                    '        escreva(" A Soma é: ",num1 - num2)',
                    '    }',
                    '    funcao inicio(){',
                    '            calculadora ()',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Funções', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '      mensagem("Bem Vindo")',
                    '      escreva("O resultado do primeiro cálculo é: ", calcula (3.0, 4.0))',
                    '      escreva("\nO resultado do segundo cálculo é: ", calcula (7.0, 2.0), "\n")',
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
                    '        escreva ("\n", texto, "\n")',
                    '        ',
                    '        para (i = 0; i < 50; i++)',
                    '        {',
                    '          escreva ("-")',
                    '        }',
                    '        ',
                    '        escreva("\n")',
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

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Leia', async () => {
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

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Estrutura condicional - se e senao.', async () => {
                const resultado = lexador.mapear(
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

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Estruturas de repetição - Enquanto', async () => {
                const resultado = lexador.mapear([
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

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Estruturas de repetição - Faca ... Enquanto', async () => {
                const resultado = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        inteiro idade',
                    '        ',
                    '        faca',
                    '        {',
                    '            escreva ("Informe sua idade (valores aceitos de 5 a 150): ")',
                    '            leia (idade)',
                    '        }',
                    '        enquanto (idade < 5 ou idade > 120)',
                    '        ',
                    '        escreva ("\nCorreto!\n")',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Estruturas de repetição - Enquanto com pare', async () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro i = 1',
                    '        enquanto (i <= 10) {',
                    '            se (i == 5) {',
                    '                pare',
                    '            }',
                    '            escreva(i)',
                    '            i++',
                    '        }',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Estruturas de repetição - Faca...Enquanto com pare', async () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro i = 1',
                    '        faca {',
                    '            se (i == 5) {',
                    '                pare',
                    '            }',
                    '            escreva(i)',
                    '            i++',
                    '        } enquanto (i <= 10)',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            describe('Estruturas de repetição - Para', () => {
                it('Trivial', async () => {
                    const resultado = lexador.mapear([
                        'programa {',
                        '    funcao inicio() {',
                        '      para (inteiro i = 1; i <= 10; i++) {',
                        '        escreva(i)',
                        '      }',
                        '    }',
                        '  }'
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
                });

                it('Condição de parada como variável', async () => {
                    const resultado = lexador.mapear([
                        'programa',
                        '{',
                        '    funcao inicio()',
                        '    {',
                        '        inteiro passos = 10',
                        '        inteiro passos_inicial = 0',
                        '        para (inteiro passo = passos_inicial; passo < passos; passo++)',
                        '        {',
                        '            escreva("Olá")',
                        '        }',
                        '	}',
                        '}'
                        ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
                });

                it('Com pare para sair do loop', async () => {
                    const resultado = lexador.mapear([
                        'programa {',
                        '    funcao inicio() {',
                        '        para (inteiro i = 1; i <= 10; i++) {',
                        '            se (i == 5) {',
                        '                pare',
                        '            }',
                        '            escreva(i)',
                        '        }',
                        '    }',
                        '}'
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
                });
            });

            it('Atribuição de Variáveis', async () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro a = 2',
                    '        inteiro b = a',
                    '        escreva("variáveis a:",a," b:",b)',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Atribuição de Vetores', async () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro numeros[5] = {23,42,10,24,66}',
                    '        escreva("zero:", numeros[5])',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Importação de bibliotecas', async () => {
                const resultado = lexador.mapear([
                    'programa',
                    '{',
                    '    inclua biblioteca Matematica',
                    '    funcao inicio()',
                    '    {',
                    '        escreva(Matematica.raiz(4.0, 2.0))',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThanOrEqual(2);
            });

            it('Importação de bibliotecas, com nome de constante definido', async () => {
                const resultado = lexador.mapear([
                    'programa',
                    '{',
                    '    inclua biblioteca Matematica --> mat',
                    '    funcao inicio()',
                    '    {',
                    '        escreva(mat.raiz(4.0, 2.0))',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThanOrEqual(2);
            });

            it('Matrizes', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        //Declaração de uma matriz de inteiros',
                    '        // de duas linhas e duas colunas já inicializado.',
                    '        inteiro matriz[2][2] = {{15,22},{10,11}}',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('limpa()', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    `        escreva('1, 2, 3')`,
                    '        limpa()',
                    `        escreva('4, 5, 6')`,
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
                const declaracaoFuncao = retornoAvaliadorSintatico.declaracoes[0];
                expect(declaracaoFuncao).toBeInstanceOf(FuncaoDeclaracao);
                expect((declaracaoFuncao as FuncaoDeclaracao).funcao.corpo.length).toBe(3);
                const declaracaoLimpa = (declaracaoFuncao as FuncaoDeclaracao).funcao.corpo[1];
                expect(declaracaoLimpa).toBeInstanceOf(Expressao);
                expect(((declaracaoLimpa as any).expressao)).toBeInstanceOf(Limpa);
            });
        });

        describe('Casos de Falha', () => {
            it('Falha - Função `inicio()` não definida', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'programa',
                        '{',
                        '    funcao teste()',
                        '    {',
                        '        escreva("Olá Mundo")',
                        '    }',
                        '}'
                    ],
                    -1
                );

                await expect(avaliadorSintatico.analisar(retornoLexador, -1)).rejects.toThrow(ErroAvaliadorSintatico);
                await expect(avaliadorSintatico.analisar(retornoLexador, -1)).rejects.toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: expect.stringContaining("Função 'inicio()' para iniciar o programa não foi definida.")
                    })
                )
            });

            it('Falha - Programa vazio', async () => {
                const retornoLexador = lexador.mapear([''], -1);

                await expect(avaliadorSintatico.analisar(retornoLexador, -1)).rejects.toThrow(ErroAvaliadorSintatico);
                await expect(avaliadorSintatico.analisar(retornoLexador, -1)).rejects.toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: expect.stringContaining("Esperada expressão 'programa' para inicializar programa.")
                    })
                )
            })

            it('Falha - Programa escreva com string não finalizada', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        escreva("Olá Mundo)',
                    '    }',
                    '}'
                ], -1)

                // @FixMe - Mensagem de erro não está sendo exibida corretamente.
                const resultado = await avaliadorSintatico.analisar(retornoLexador, -1);
                expect(resultado.erros.length).toBeGreaterThan(0);
            })

            it('Falha - Leia sem variável', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        leia()',
                    '    }',
                    '}'
                ], -1);

                const resultado = await avaliadorSintatico.analisar(retornoLexador, -1);
                expect(resultado.erros.length).toBeGreaterThan(0);
            });

            it('Falha - Bloco de programa não finalizado (chave direita ausente)', async () => {
                const retornoLexador = lexador.mapear([
                    'programa{  funcao inicio () {        escreva("Olá Mundo!")} '
                ], -1);

                await expect(avaliadorSintatico.analisar(retornoLexador, -1)).rejects.toThrow(ErroAvaliadorSintatico);
                await expect(avaliadorSintatico.analisar(retornoLexador, -1)).rejects.toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: expect.stringContaining('Esperado chave direita final para término do programa.')
                    })
                );
            });

            it('Falha - Vetor com quantidade de valores menor que a dimensão declarada', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        inteiro numeros[3] = {1, 2}',
                    '    }',
                    '}'
                ], -1);

                const resultado = await avaliadorSintatico.analisar(retornoLexador, -1);
                expect(resultado.erros[0]).toMatchObject({
                    name: 'Error',
                    message: expect.stringContaining('Esperado 3 valores na dimensão 1, mas foram fornecidos 2.')
                });
            });

            it('Falha - Matriz com quantidade de colunas menor que a dimensão declarada', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        inteiro matriz[2][2] = {{1, 2}, {3}}',
                    '    }',
                    '}'
                ], -1);

                const resultado = await avaliadorSintatico.analisar(retornoLexador, -1);
                expect(resultado.erros[0]).toMatchObject({
                    name: 'Error',
                    message: expect.stringContaining('Esperado 2 valores na dimensão 2, mas foram fornecidos 1.')
                });
            });
        });
    });
});