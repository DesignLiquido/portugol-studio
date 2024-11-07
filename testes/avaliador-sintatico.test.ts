import { ErroAvaliadorSintatico } from "@designliquido/delegua/avaliador-sintatico";
import { FuncaoDeclaracao } from "@designliquido/delegua/declaracoes";

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
            it('Olá Mundo', () => {
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
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
            });

            it('Comentários', () => {
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
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });

            it('Estruturas de dados', () => {
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
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Escolha', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Funções', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('Leia', () => {
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

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Estrutura condicional - se e senao.', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Estruturas de repetição - Enquanto', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Estruturas de repetição - Faca ... Enquanto', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            describe('Estruturas de repetição - Para', () => {
                it('Trivial', () => {
                    const resultado = lexador.mapear([
                        'programa {',
                        '    funcao inicio() {',
                        '      para (inteiro i = 1; i <= 10; i++) {',
                        '        escreva(i)',
                        '      }',
                        '    }',
                        '  }'
                    ], -1);
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);
    
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
                });

                it('Condição de parada como variável', () => {
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
    
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);
    
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
                });
            });

            it('Atribuição de Variáveis', () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro a = 2',
                    '        inteiro b = a',
                    '        escreva("variáveis a:",a," b:",b)',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Atribuição de Vetores', () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro numeros[5] = {23,42,10,24,66}',
                    '        escreva("zero:", numeros[5])',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('Importação de bibliotecas', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThanOrEqual(2);
            });

            it('Importação de bibliotecas, com nome de constante definido', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThanOrEqual(2);
            });

            it('Matrizes', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
            });

            it('limpa()', () => {
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

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
                const declaracaoFuncao = retornoAvaliadorSintatico.declaracoes[0];
                expect(declaracaoFuncao).toBeInstanceOf(FuncaoDeclaracao);
                expect((declaracaoFuncao as FuncaoDeclaracao).funcao.corpo.length).toBe(3);
                expect((declaracaoFuncao as FuncaoDeclaracao).funcao.corpo[1]).toBeInstanceOf(Limpa);
            });
        });

        describe('Casos de Falha', () => {
            it('Falha - Função `inicio()` não definida', () => {
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

                const t = () => {
                    avaliadorSintatico.analisar(retornoLexador, -1);
                };

                expect(t).toThrow(ErroAvaliadorSintatico);
                expect(t).toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: expect.stringContaining("Função 'inicio()' para iniciar o programa não foi definida.")
                    })
                )
            });

            it('Falha - Programa vazio', () => {
                const retornoLexador = lexador.mapear([''], -1);

                const t = () => {
                    avaliadorSintatico.analisar(retornoLexador, -1);
                }

                expect(t).toThrow(ErroAvaliadorSintatico);
                expect(t).toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: expect.stringContaining("Esperada expressão 'programa' para inicializar programa.")
                    })
                )
            })

            it('Falha - Programa escreva com string não finalizada', () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        escreva("Olá Mundo)',
                    '    }',
                    '}'
                ], -1)

                const t = () => {
                    avaliadorSintatico.analisar(retornoLexador, -1);
                }

                expect(t).toThrow(ErroAvaliadorSintatico);
                // @FixMe - Mensagem de erro não está sendo exibida corretamente.
                expect(t).toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: expect.stringContaining("Esperado ')' após os valores em escreva.")
                    })
                )
            })

            it('Falha - Leia sem variável', () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        leia()',
                    '    }',
                    '}'
                ], -1);

                const t = () => {
                    avaliadorSintatico.analisar(retornoLexador, -1);
                }

                expect(t).toThrow(ErroAvaliadorSintatico);
            });
        });
    });
});