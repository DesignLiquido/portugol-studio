import { AvaliadorSintaticoPortugolStudio } from "../fontes";
import { InterpretadorPortugolStudio } from "../fontes/interpretador/interpretador-portugol-studio";
import { LexadorPortugolStudio } from "../fontes/lexador/lexador-portugol-studio";


describe('Interpretador (Portugol Studio)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPortugolStudio;
        let avaliadorSintatico: AvaliadorSintaticoPortugolStudio;
        let interpretador: InterpretadorPortugolStudio;

        beforeEach(() => {
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
            interpretador = new InterpretadorPortugolStudio(process.cwd());
        });

        describe('Cenários de sucesso', () => {
            it('Trivial', async () => {
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

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saida).toEqual("Olá Mundo")
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            describe('Para', () => {
                it('Condição de parada como variável', async () => {
                    const _saidas: string[] = [];
                    const retornoLexador = lexador.mapear([
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

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                        _saidas.push(saida);
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(10);
                });
            })

            describe('Leia', () => {
                it('Trivial', async () => {
                    // Aqui vamos simular a resposta para cinco variáveis de `leia()`.
                    const respostas = [1, 2, 3, 4, 5];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.pop());
                        }
                    };

                    const retornoLexador = lexador.mapear([
                        'programa',
                        '{',
                        '    funcao inicio()',
                        '    {',
                        '        inteiro numero1, numero2, numero3, numero4, numero5',
                        '        leia(numero1, numero2, numero3, numero4, numero5)',
                        '        escreva(numero1 + numero2 + numero3 + numero4 + numero5)',
                        '    }',
                        '}'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    interpretador.funcaoDeRetorno = (saida: string) => {
                        expect(saida).toEqual("15")
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Leia com condicional se', async () => {
                    const respostas = [1];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.pop());
                        }
                    };

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

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saida).toEqual("É igual a 1")
                    }

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            it('Atribuição variaveis com soma', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '   ',
                    '    funcao inicio()',
                    '    {',
                    '        inteiro a = 2',
                    '        inteiro b = 3',
                    '        a = a + b',
                    '        escreva("O resultado é: ", a)',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saida).toEqual("O resultado é:  5")
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '   ',
                    '    funcao inicio()',
                    '    {',
                    '        inteiro a = 2',
                    '        inteiro b = a',
                    '        escreva("variáveis a:",a," b:",b)',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Faça', async () => {
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
                    '           escreva("Ok\t", valor,"\n")',
                    '           valor--',
                    '           eNegativo = valor < 0',
                    '        }',
                    '        enquanto(nao eNegativo)',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Funcao Vazio', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '   ',
                    '    funcao inicio()',
                    '    {',
                    '        imprime_linha()',
                    '    }',
                    '',
                    '    funcao vazio imprime_linha()',
                    '    {',
                    '       escreva("\n---------------------")',
                    '    }',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
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

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Retorne', async () => {
                const respostas = [1];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.pop());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'programa',
                    '{  ',
                        'funcao inicio()',
                        '{  ',
                            'inteiro numero',
                            'escreva("Quantos elementos da sequência de Fibonacci deseja calcular? ")',
                            'leia(numero)',
                            'para (inteiro i = 1; i <= numero ; i++)',
                            '{',
                            '   escreva(fibonacci(i), " ")',
                            '}',
                            'escreva("\n")',
                        '}',
                        'funcao inteiro fibonacci(inteiro posicao)',
                        '{	',
                            'se (posicao == 1)',
                            '{',
                                'retorne 0',
                            '}',
                            'senao se (posicao == 2)',
                            '{',
                                'retorne 1',
                            '}',
                            'retorne fibonacci(posicao - 1) + fibonacci(posicao - 2)',
                        '}',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Constante', async () => {
                const respostas = ["Abigail", 4, 5, 10];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.pop());
                    }
                };

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

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            describe('Escolha', () => {
                it('Trivial', async () => {
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
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Com valores de entrada', async () => {
                    // Aqui vamos simular a resposta para uma variável de `leia()`.
                    const respostas = ['1', '3', '7', '2', '10', '4', '0'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
                    };

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

                    let _saidas = "";
                    interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                        _saidas += saida;
                    }

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('A Soma é:  10');
                    expect(_saidas).toContain('A Soma é:  6');
                });
            });

            it('Leia', async () => {
                // Aqui vamos simular a resposta para uma variável de `leia()`.
                const respostas = ['1200'];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    },
                };

                const retornoLexador = lexador.mapear([
                    `programa`,
                    `{`,
                    `    inteiro numero,a1,a2,a3,a4`,
                    `    funcao inicio()`,
                    `    {`,
                    `        escreva("Quantas pessoas Foram ao Jogo de Futebol?  ")`,
                    `        leia(numero)`,
                    `        a1 = numero*10/100`,
                    `        a2 = numero*50/100`,
                    `        escreva("\n A Renda de pessoas A R$ 5 foi: ", a1)`,
                    `        escreva("\n A Renda de pessoas A R$ 10 foi: ", a2)`,
                    `    }`,
                    `}`], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Biblioteca matemática', async () => {
                let _saidas = "";
                interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                    _saidas += saida;
                }

                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    inclua biblioteca Matematica',
                    '    funcao inicio()',
                    '    {',
                    '        escreva(Matematica.raiz(81.0, 2.0))',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toContain('9');
            });

            it('Biblioteca matemática, com nome de variável', async () => {
                let _saidas = "";
                interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                    _saidas += saida;
                }

                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    inclua biblioteca Matematica --> mat',
                    '    funcao inicio()',
                    '    {',
                    '        escreva(mat.raiz(81.0, 2.0))',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toContain('9');
            });

            describe('Matrizes', () => {
                it('Declaração com índice variável', async () => {
                    let _saidas = "";
                    interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                        _saidas += saida;
                    }

                    const retornoLexador = lexador.mapear([
                        `programa {`,
                        `    funcao inicio() {`,
                        `      const inteiro numeros = 3`,
                        `      inteiro listaNumeros[numeros]`,
                        `      escreva(listaNumeros[0])`,
                        `    }`,
                        `}`
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('0');
                });

                it('Operações Básicas', async () => {
                    let _saidas = "";
                    interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                        _saidas += saida;
                    }

                    const retornoLexador = lexador.mapear([
                        'programa',
                        '{',
                        '    funcao inicio()',
                        '    {',
                        '        //Declaração de uma matriz de inteiros',
                        '        // de duas linhas e duas colunas já inicializado.',
                        '        inteiro matriz[2][2] = {{15,22},{10,11}}',

                        '        //Atribui -1 na primeira linha e segunda',
                        '        // coluna da matriz.',
                        '        matriz[0][1] = -1',

                        '        //Imprime o valor 15 correspondente ',
                        '        // a primeira linha e primeira coluna da matriz.',
                        '        inteiro i = 0',
                        '        escreva(matriz[i][0])',
                        '        escreva("\n")',

                        '        //Imprime o valor 11 correspondente  ',
                        '        // a última linha e última coluna da matriz.',
                        '        escreva(matriz[1][1])',

                        '        //Declaração de uma matriz de reais de ',
                        '        // duas linhas e quatro colunas.',
                        '        real outra_matriz[2][4]',

                        '        //Declaração de uma matriz de caracteres onde o tamanho',
                        '        // de linhas e colunas são definidos pela inicialização',
                        `        caracter jogo_velha[][] = {{'X','O','X'}`,
                        `                                  ,{'O','X','O'}`,
                        `                                  ,{' ',' ','X'}}`,
                        '    }',
                        '}'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas.length).toBeGreaterThanOrEqual(4);
                });

                it('Matrizes com Para', async () => {
                    let _saidas = "";
                    interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                        _saidas += saida;
                    }

                    const retornoLexador = lexador.mapear([
                        'programa',
                        '{',
                        '    funcao inicio()',
                        '    {',
                        '        cadeia nome[] = { "João", "Ana" , "Tiago", "Luiz", "Carlos" }',
                        '        real altura[] = { 5.7, 8.8, 9.75, 1.32, 9.93 }',
                        '        // Cria o cabeçalho da tabela',
                        '        escreva ("--------------------\n")',
                        '        escreva ("       TABELA       \n")',
                        '        escreva ("--------------------\n")',
                        '        para (inteiro posicao = 0; posicao < 5; posicao++)',
                        '        {',
                        '            escreva (nome[posicao], "\t\t", altura [posicao], "\n")',
                        '        }',
                        '    }',
                        '}'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas.length).toBeGreaterThan(0);
                });
            });

            describe('Função limpa()', () => {
                it('Trivial', async () => {
                    const metodoVisitarExpressaoLimpa = jest.spyOn(interpretador, 'visitarExpressaoLimpa');

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
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(metodoVisitarExpressaoLimpa).toHaveBeenCalledTimes(1);
                });
            });

            describe('Vetores', () => {
                it("Atribuição", async () => {
                    let _saidas: string[] = [];
                    interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                        _saidas.push(saida);
                    }

                    const retornoLexador = lexador.mapear([
                        'programa',
                        '{',
                        '    inclua biblioteca Util --> util',
                        '    funcao inicio() ',
                        '    {',
                        '        inteiro vetor[3]',
                        '        vetor[0] = 1',
                        '    }',
                        '}'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Uso com Bibliotecas', () => {
                it('Util.sorteio', async () => {
                    let _saidas: string[] = [];
                    interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                        _saidas.push(saida);
                    }

                    const retornoLexador = lexador.mapear([
                        'programa',
                        '{',
                        '    inclua biblioteca Util --> util',
                        '    funcao inicio() ',
                        '    {',
                        '        inteiro vetor[10]',
                        '        // preenche o vetor',
                        '        para (inteiro posicao = 0; posicao < 10; posicao++)',
                        '        {',
                        '            vetor[posicao] = util.sorteia(1, 100) // Sorteia um número e atribui à posição do vetor',
                        '        }',
                        '        // Exibe o vetor na ordem original',
                        '        escreva ("Vetor na ordem original:\n")',
                        '        para(inteiro posicao = 0; posicao < 10; posicao++)',
                        '        {',
                        '            escreva (vetor[posicao], " ")',
                        '        }',
                        '        // Exibe o vetor na ordem inversa',
                        '        escreva ("\n\nVetor na ordem inversa:\n")',
                        '        para(inteiro posicao = 9; posicao >=0; posicao--)',
                        '        {',
                        '            escreva (vetor[posicao], " ")',
                        '        }',
                        '    }',
                        '}'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(22);
                });
            });

            it('Reconhece variável global e a utiliza corretamente', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    inteiro totalGolsMarcados = 8',
                    '    funcao inicio()',
                    '    {',
                    '        escreva(totalGolsMarcados)',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                let saida = "";
                interpretador.funcaoDeRetornoMesmaLinha = (resultado: string) => {
                    console.log(resultado)
                    saida = resultado;
                };

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(saida).toBe("8");
            });

        });
    });
});
