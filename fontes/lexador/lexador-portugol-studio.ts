import { RetornoLexador } from '@designliquido/delegua/interfaces/retornos';
import { ErroLexador } from '@designliquido/delegua/lexador/erro-lexador';
import { LexadorBase } from '@designliquido/delegua/lexador/lexador-base';
import { SimboloInterface } from '@designliquido/delegua/interfaces';

import { palavrasReservadas } from './palavras-reservadas';

import tiposDeSimbolos from '../tipos-de-simbolos/lexico-regular';

/**
 * O Lexador é responsável por transformar o código em uma coleção de tokens de linguagem.
 * Cada token de linguagem é representado por um tipo, um lexema e informações da linha de código em que foi expresso.
 * Também é responsável por mapear as palavras reservadas da linguagem, que não podem ser usadas por outras
 * estruturas, tais como nomes de variáveis, funções, literais, classes e assim por diante.
 *
 * O Lexador de Portugol Studio possui algumas particularidades:
 * - Aspas simples são para caracteres individuais, e aspas duplas para cadeias de caracteres.
 * - Literais de vetores usam chaves, e não colchetes.
 */
export class LexadorPortugolStudio extends LexadorBase {
    protected logicaComumCaracteres(delimitador: string) {
        while (this.simboloAtual() !== delimitador && !this.eFinalDoCodigo()) {
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: this.linha + 1,
                caractere: this.simboloAnterior(),
                mensagem: 'Cadeia de caracteres não finalizada.',
            } as ErroLexador);
            return;
        }

        const valor = this.codigo[this.linha].substring(this.inicioSimbolo + 1, this.atual);
        return valor;
    }

    analisarCaracter() {
        const valor = this.logicaComumCaracteres("'");
        this.adicionarSimbolo(tiposDeSimbolos.CARACTER, valor);
    }

    analisarTexto(): void {
        const valor = this.logicaComumCaracteres('"');
        this.adicionarSimbolo(tiposDeSimbolos.CADEIA, valor);
    }

    analisarNumero(): void {
        let real = false;
        while (this.eDigito(this.simboloAtual())) {
            this.avancar();
        }

        if (this.simboloAtual() == '.' && this.eDigito(this.proximoSimbolo())) {
            real = true;
            this.avancar();

            while (this.eDigito(this.simboloAtual())) {
                this.avancar();
            }
        }

        const numeroCompleto = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);

        this.adicionarSimbolo(real ? tiposDeSimbolos.REAL : tiposDeSimbolos.INTEIRO, parseFloat(numeroCompleto));
    }

    identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const codigo: string = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);

        const tipo: string = codigo in palavrasReservadas ? palavrasReservadas[codigo] : tiposDeSimbolos.IDENTIFICADOR;

        this.adicionarSimbolo(tipo);
    }

    comentarioMultilinha(): void {
        let conteudo = '';
        while (!this.eFinalDoCodigo()) {
            this.avancar();
            conteudo += this.codigo[this.linha].charAt(this.atual);
            if (this.simboloAtual() === '*' && this.proximoSimbolo() === '/') {
                const linhas = conteudo.split('\0');
                for (let linha of linhas) {
                    this.adicionarSimbolo(tiposDeSimbolos.LINHA_COMENTARIO, linha.trim());
                }

                // Remove o asterisco da última linha
                let lexemaUltimaLinha = this.simbolos[this.simbolos.length - 1].lexema;
                lexemaUltimaLinha = lexemaUltimaLinha.substring(0, lexemaUltimaLinha.length - 1);
                this.simbolos[this.simbolos.length - 1].lexema = lexemaUltimaLinha;
                this.simbolos[this.simbolos.length - 1].literal = lexemaUltimaLinha;

                this.avancar();
                this.avancar();
                break;
            }
        }
    }

    comentarioUmaLinha(): void {
        this.avancar();
        const linhaAtual = this.linha;
        let ultimoAtual = this.atual;
        while (linhaAtual === this.linha && !this.eFinalDoCodigo()) {
            ultimoAtual = this.atual;
            this.avancar();
        }

        const conteudo = this.codigo[linhaAtual].substring(this.inicioSimbolo + 2, ultimoAtual);
        this.adicionarSimbolo(tiposDeSimbolos.COMENTARIO, conteudo.trim());
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            case '[':
                this.adicionarSimbolo(tiposDeSimbolos.COLCHETE_ESQUERDO);
                this.avancar();
                break;
            case ']':
                this.adicionarSimbolo(tiposDeSimbolos.COLCHETE_DIREITO);
                this.avancar();
                break;
            case '(':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO);
                this.avancar();
                break;
            case ')':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO);
                this.avancar();
                break;
            case '{':
                this.adicionarSimbolo(tiposDeSimbolos.CHAVE_ESQUERDA);
                this.avancar();
                break;
            case '}':
                this.adicionarSimbolo(tiposDeSimbolos.CHAVE_DIREITA);
                this.avancar();
                break;
            case ',':
                this.adicionarSimbolo(tiposDeSimbolos.VIRGULA);
                this.avancar();
                break;
            case '.':
                this.adicionarSimbolo(tiposDeSimbolos.PONTO);
                this.avancar();
                break;
            case '-':
                this.inicioSimbolo = this.atual;
                this.avancar();
                switch (this.simboloAtual()) {
                    case '=':
                        this.avancar();
                        this.adicionarSimbolo(tiposDeSimbolos.MENOS_IGUAL);
                        break;
                    case '-':
                        // Aqui temos dois casos:
                        // 1. Decremento ('--')
                        // 2. Apelido para importação de biblioteca ('-->')
                        this.avancar();
                        if (this.simboloAtual() === '>') {
                            this.avancar();
                            this.adicionarSimbolo(tiposDeSimbolos.SETA, '-->');
                        } else {
                            this.adicionarSimbolo(tiposDeSimbolos.DECREMENTAR);
                        }

                        break;
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                        break;
                }

                break;
            case '+':
                this.inicioSimbolo = this.atual;
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.MAIS_IGUAL);
                } else if (this.simboloAtual() === '+') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.INCREMENTAR);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.ADICAO);
                }

                break;

            case ':':
                this.adicionarSimbolo(tiposDeSimbolos.DOIS_PONTOS);
                this.avancar();
                break;
            case '%':
                this.adicionarSimbolo(tiposDeSimbolos.MODULO);
                this.avancar();
                break;
            case '*':
                this.inicioSimbolo = this.atual;
                this.avancar();
                switch (this.simboloAtual()) {
                    case '=':
                        this.avancar();
                        this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO_IGUAL);
                        break;
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                        break;
                }
                break;
            case '!':
                this.inicioSimbolo = this.atual;
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.DIFERENTE);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.NEGACAO);
                }

                break;
            case '=':
                this.inicioSimbolo = this.atual;
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.IGUAL_IGUAL);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.IGUAL);
                }

                break;

            case '<':
                this.inicioSimbolo = this.atual;
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_IGUAL);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR);
                }
                break;

            case '>':
                this.inicioSimbolo = this.atual;
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR_IGUAL);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR);
                }
                break;

            case '/':
                this.avancar();
                switch (this.simboloAtual()) {
                    case '/':
                        this.comentarioUmaLinha();
                        break;
                    case '*':
                        this.comentarioMultilinha();
                        break;
                    case '=':
                        this.adicionarSimbolo(tiposDeSimbolos.DIVISAO_IGUAL);
                        this.avancar();
                        break;
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
                        break;
                }

                break;

            // Esta sessão ignora espaços em branco na tokenização.
            // Ponto-e-vírgula é opcional em Delégua, então pode apenas ser ignorado.
            case ' ':
            case '\0':
            case '\r':
            case '\t':
            case ';':
                this.avancar();
                break;

            case '"':
                this.avancar();
                this.analisarTexto();
                this.avancar();
                break;

            case "'":
                this.avancar();
                this.analisarCaracter();
                this.avancar();
                break;

            default:
                if (this.eDigito(caractere)) this.analisarNumero();
                else if (this.eAlfabeto(caractere)) this.identificarPalavraChave();
                else {
                    this.erros.push({
                        linha: this.linha + 1,
                        caractere: caractere,
                        mensagem: 'Caractere inesperado.',
                    } as ErroLexador);
                    this.avancar();
                }
        }
    }

    mapear(codigo: string[], hashArquivo: number): RetornoLexador<SimboloInterface> {
        this.erros = [];
        this.simbolos = [];
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;

        this.codigo = codigo || [''];
        this.hashArquivo = hashArquivo;

        for (let iterador = 0; iterador < this.codigo.length; iterador++) {
            this.codigo[iterador] += '\0';
        }

        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }

        return {
            simbolos: this.simbolos,
            erros: this.erros,
        } as RetornoLexador<SimboloInterface>;
    }
}
