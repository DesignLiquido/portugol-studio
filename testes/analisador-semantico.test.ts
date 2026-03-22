import { AnalisadorSemanticoPortugolStudio } from '../fontes/analisador-semantico';
import { AvaliadorSintaticoPortugolStudio } from "../fontes/avaliador-sintatico";
import { LexadorPortugolStudio } from "../fontes/lexador";

describe('Analisador sêmantico', () => {
    describe('analisar()', () => {
        let lexador: LexadorPortugolStudio;
        let avaliadorSintatico: AvaliadorSintaticoPortugolStudio;
        let analisadorSemantico: AnalisadorSemanticoPortugolStudio;

        beforeEach(() => {
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
            analisadorSemantico = new AnalisadorSemanticoPortugolStudio();
        });

        describe('Casos de Sucesso', () => {
            it('Atribuição por índice', async () => {
                const retornoLexador = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro numeros[10]',
                    '        numeros[1] = "5"',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Atribuição de variáveis válida', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'real x',
                    'inteiro y',
                    'x = 25.4',
                    'y = 10',
                    'escreva(x, y)',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Atribuição válida entre variáveis do mesmo tipo', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    inteiro a = 5',
                    '    inteiro b = 0',
                    '    funcao inicio()',
                    '    {',
                    '        b = a',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Reconhece e utiliza variável global corretamente', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'inteiro totalGolsMarcados = 0',
                    'funcao inicio() {',
                    'escreva(totalGolsMarcados)',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Leia com variável e índice de vetor válidos', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'inteiro n = 0',
                    'inteiro numeros[2]',
                    'leia(n, numeros[0])',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Condicional se com expressão lógica válida', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'logico condicao = verdadeiro',
                    'se (condicao) {',
                    'escreva("ok")',
                    '}',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });

        describe('Casos de Falha', () => {
            it('Variável indefinida, não declarada (escreva)', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        escreva(mensagem)',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);


                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
            it('Variável indefinida, não declarada (atribuição)', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio() {',
                    '        message = "olá mundo"',
                    '    }',
                    '}'
                ], -1);
                
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
            it('Atribuição de variáveis inválida', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'real x',
                    'inteiro y',
                    'caracter a',
                    'cadeia b',
                    'logico l',
                    'x = "25"',
                    'y = "6x"',
                    'l = 24',
                    'b = 34',
                    'x = 25',
                    'y = 25.4',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(5);


                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toEqual("Não é possível atribuir um valor do tipo 'cadeia' a uma variável do tipo 'real'.");
                expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toEqual("Não é possível atribuir um valor do tipo 'cadeia' a uma variável do tipo 'inteiro'.");
                expect(retornoAnalisadorSemantico.diagnosticos[2].mensagem).toEqual("Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'lógico'.");
                expect(retornoAnalisadorSemantico.diagnosticos[3].mensagem).toEqual("Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'cadeia'.");
                expect(retornoAnalisadorSemantico.diagnosticos[4].mensagem).toEqual("Não é possível atribuir um valor do tipo 'real' a uma variável do tipo 'inteiro'.");
            });

            it('Erro ao atribuir uma variável não declarada', async () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro b = a',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);

                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe("Variável não declarada: a.");
            });

            it('Erro ao atribuir valor de tipo incompatível', async () => {
                const resultado = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro a = 2',
                    '        cadeia b = a',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(resultado, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                    "Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'cadeia'."
                );
            });



            it('Chamada de função inexistente', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'saudacao()',
                    '}',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
            it('Chamada de função com tipos de parâmetros diferentes', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'saudacao(4)',
                    '}',
                    'funcao saudacao(cadeia message) {',
                    'escreva(message)',
                    '}',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Atribuição de variável inteira a variável cadeia (tipos incompatíveis)', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    cadeia a',
                    '    inteiro b = 0',
                    '    funcao inicio()',
                    '    {',
                    '        a = b',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                    "Não é possível atribuir um valor do tipo 'inteiro' a uma variável do tipo 'cadeia'."
                );
            });

            it('Reatribuição de valores a uma constante', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio() {',
                    '        const inteiro numero = 3',
                    '        numero = 4',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Leia com argumento inválido', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio() {',
                    '        inteiro n = 0',
                    '        leia(n + 1)',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                    'Argumento inválido em leia(). Esperado variável ou posição indexada de vetor/matriz.'
                );
            });

            it('Condicional se com variável não lógica', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'inteiro valor = 1',
                    'se (valor) {',
                    'escreva("x")',
                    '}',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain("condição do 'se'");
            });

            it('Enquanto analisa corpo interno', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'logico condicao = verdadeiro',
                    'enquanto (condicao) {',
                    'naoDeclarada = 10',
                    '}',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain('ainda não foi declarada');
            });

            it('Para analisa corpo interno - variavel nao declarada', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'para (inteiro i = 0; i < 10; i++) {',
                    'naoDeclarada = i',
                    '}',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                const mensagens = retornoAnalisadorSemantico.diagnosticos.map(d => d.mensagem);
                expect(mensagens.some(m => m.includes('naoDeclarada') && m.includes('declarada'))).toBe(true);
            });

            it('Para valido nao gera diagnostico', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'para (inteiro i = 0; i < 10; i++) {',
                    'escreva(i)',
                    '}',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Escolha analisa corpo dos casos', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inicio() {',
                    'inteiro x = 1',
                    'escolha (x) {',
                    'caso 1:',
                    'naoDeclarada = 5',
                    'pare',
                    '}',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                const mensagens = retornoAnalisadorSemantico.diagnosticos.map(d => d.mensagem);
                expect(mensagens.some(m => m.includes('naoDeclarada') && m.includes('declarada'))).toBe(true);
            });

            it('Funcao com parametros analisa corpo', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inteiro dobrar(inteiro n) {',
                    'retorne naoDeclarada',
                    '}',
                    'funcao inicio() {',
                    'escreva(dobrar(5))',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                const mensagens = retornoAnalisadorSemantico.diagnosticos.map(d => d.mensagem);
                expect(mensagens.some(m => m.includes('naoDeclarada'))).toBe(true);
            });

            it('Declaracao com tipo incompativel gera diagnostico (inteiro recebe texto)', async () => {
                const retornoLexador = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro x = "texto"',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThan(0);
            });

            it('Divisao por zero em expressao gera diagnostico', async () => {
                const retornoLexador = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro x = 10',
                    '        se (x / 0 == 0) {',
                    '            escreva("zero")',
                    '        }',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                const temDivisaoPorZero = retornoAnalisadorSemantico.diagnosticos.some(
                    d => d.mensagem.includes('Divisão por zero')
                );
                expect(temDivisaoPorZero).toBe(true);
            });

            it('Operador logico e em condicional valida', async () => {
                const retornoLexador = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        logico a = verdadeiro',
                    '        logico b = falso',
                    '        se (a e b) {',
                    '            escreva("ambos")',
                    '        }',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Variavel declarada mas nao usada nao gera erro (aviso desativado)', async () => {
                const retornoLexador = lexador.mapear([
                    'programa {',
                    '    funcao inicio() {',
                    '        inteiro x = 5',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                const temErro = retornoAnalisadorSemantico.diagnosticos.some(
                    d => d.mensagem.includes('x')
                );
                expect(temErro).toBe(false);
            });

            it('Funcao com parametros valida - retorne usa parametro', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inteiro dobrar(inteiro n) {',
                    'retorne n',
                    '}',
                    'funcao inicio() {',
                    'escreva(dobrar(5))',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Retorne com tipo incompativel (cadeia em funcao inteiro) gera diagnostico', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inteiro obterValor() {',
                    'retorne "texto"',
                    '}',
                    'funcao inicio() {',
                    'escreva(obterValor())',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                const temErroRetorno = retornoAnalisadorSemantico.diagnosticos.some(
                    d => d.mensagem.toLowerCase().includes('retorno') || d.mensagem.toLowerCase().includes('incompatível')
                );
                expect(temErroRetorno).toBe(true);
            });

            it('Retorne com literal inteiro em funcao inteiro nao gera diagnostico', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    'funcao inteiro obterCinco() {',
                    'retorne 5',
                    '}',
                    'funcao inicio() {',
                    'escreva(obterCinco())',
                    '}',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });
    })
})