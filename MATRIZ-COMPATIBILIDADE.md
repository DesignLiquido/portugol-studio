# Matriz de Compatibilidade — Portugol Studio x Delégua

Compara as funcionalidades do [Portugol Studio original (UNIVALI-LITE)](https://github.com/UNIVALI-LITE/Portugol-Studio)
com a implementação do dialeto neste pacote e no `delegua-node`.

Legenda:
- ✅ Implementado e compatível
- ⚠️ Parcial ou com divergência conhecida
- ❌ Não implementado
- 🔄 Delegado ao `delegua-node` (requer execução nesse ambiente)

---

## 1. Linguagem — Construtos de núcleo

| Construto | Status | Notas |
|---|:---:|---|
| `programa { }` | ✅ | |
| `funcao inicio()` | ✅ | |
| `funcao tipo nome(params)` | ✅ | Parâmetros tipados e tipo de retorno emitidos corretamente pelo formatador (Fase 4B) |
| Tipos primitivos: `inteiro`, `real`, `logico`, `caracter`, `cadeia` | ✅ | |
| Declaração de vetor `tipo nome[n]` | ✅ | |
| Declaração de matriz `tipo nome[n][m]` | ✅ | Validação de cardinalidade por dimensão no parser |
| `se ... senao` | ✅ | |
| `enquanto` | ✅ | |
| `faca ... enquanto` | ✅ | |
| `para (init; cond; inc)` | ✅ | |
| `escolha ... caso ... caso contrario` | ✅ | |
| `retorne` | ✅ | Validação básica de compatibilidade de tipo com a função (Fase 4D) |
| `pare` | ✅ | Dentro de `escolha`, consumido como separador de caso (sem nó AST `Sustar`) |
| `continua` | ❌ | Não tokenizado pelo lexador; construto não existe no dialeto PS |
| `escreva(...)` | ✅ | |
| `escreva_linha(...)` / `escreva` com quebra | ✅ | |
| `leia(...)` | ✅ | Validação de alvo: apenas variável ou acesso por índice (Fase 3) |
| Operadores aritméticos `+`, `-`, `*`, `/`, `%` | ✅ | |
| Operador divisão inteira `\` | ❌ | Token `DIVISAO_INTEIRA` definido nos tipos de símbolo, mas não tokenizado pelo lexador; inacessível no dialeto PS |
| Operadores relacionais `<`, `>`, `<=`, `>=`, `==`, `!=` (`<>`) | ✅ | |
| Operadores lógicos `e`, `ou`, `nao` | ✅ | |
| Atribuição composta `+=`, `-=`, `*=`, `/=` | ✅ | Tratados no formatador (Fase 4B) |
| Comentário de linha `//` | ✅ | |
| Comentário de bloco `/* */` | ✅ | |
| `inclua biblioteca X` | ✅ | Para bibliotecas fora do escopo deste pacote, retorna erro orientativo com referência ao `delegua-node` |

---

## 2. Biblioteca Matematica

Disponível neste pacote. Carregada por `inclua biblioteca Matematica`.

| Função / Constante | Status | Notas |
|---|:---:|---|
| `PI` | ✅ | Exposta como constante no módulo (Fase 4C) |
| `potencia(base, expoente)` | ✅ | |
| `raiz(radicando, indice)` | ✅ | |
| `arredondar(numero, casas)` | ✅ | |
| `logaritmo(numero, base)` | ✅ | |
| `seno(angulo)` | ✅ | |
| `cosseno(angulo)` | ✅ | |
| `tangente(angulo)` | ✅ | |
| `valor_absoluto(numero)` | ✅ | |
| `maior_numero(a, b)` | ✅ | |
| `menor_numero(a, b)` | ✅ | |

---

## 3. Biblioteca Texto

Disponível neste pacote. Carregada por `inclua biblioteca Texto`.

| Função | Status | Notas |
|---|:---:|---|
| `numero_caracteres(cadeia)` | ✅ | |
| `caixa_alta(cadeia)` | ✅ | |
| `caixa_baixa(cadeia)` | ✅ | |
| `substituir(cadeia, pesquisa, substituto)` | ✅ | Substitui apenas a primeira ocorrência (comportamento de `String.replace`) |
| `preencher_a_esquerda(car, tamanho, cadeia)` | ✅ | |
| `obter_caracter(cadeia, indice)` | ✅ | Índice base 0; lança erro para índice fora do intervalo |
| `posicao_texto(cadeia, texto, posicao_inicial)` | ✅ | Retorna -1 se não encontrado (igual ao Java) |
| `extrair_subtexto(cadeia, inicio, fim)` | ✅ | Lança erro para posições inválidas |

---

## 4. Biblioteca Tipos

Disponível neste pacote. Carregada por `inclua biblioteca Tipos`.

| Função | Status | Notas |
|---|:---:|---|
| `cadeia_e_inteiro(cad, base)` | ✅ | Bases 2, 10 e 16 |
| `cadeia_e_real(cad)` | ✅ | |
| `cadeia_e_logico(cad)` | ✅ | Casamento total (`verdadeiro` / `falso` exatos) |
| `cadeia_e_caracter(cad)` | ✅ | |
| `cadeia_para_caracter(cad)` | ✅ | |
| `cadeia_para_inteiro(cad, base)` | ✅ | Overflow com wrap de 32 bits, como o Java |
| `cadeia_para_real(cad)` | ✅ | |
| `cadeia_para_logico(cad)` | ✅ | |
| `inteiro_e_caracter(int)` | ⚠️ | Retorna `true` para 0–9; Java original aceita qualquer dígito decimal (0–9) — semanticamente equivalente |
| `inteiro_para_cadeia(int, base)` | ✅ | Inclui `lpad` para bases 2 e 16 |
| `inteiro_para_caracter(int)` | ✅ | |
| `inteiro_para_logico(int)` | ✅ | `true` se `> 0` |
| `inteiro_para_real(int)` | ✅ | |
| `caracter_e_inteiro(car)` | ✅ | |
| `caracter_e_logico(car)` | ✅ | Aceita `'s'`/`'S'` e `'n'`/`'N'` |
| `caracter_para_cadeia(car)` | ✅ | |
| `caracter_para_inteiro(car)` | ✅ | |
| `caracter_para_logico(car)` | ✅ | |
| `logico_para_cadeia(log)` | ✅ | |
| `logico_para_inteiro(log)` | ✅ | `1` para `verdadeiro`, `0` para `falso` |
| `logico_para_caracter(log)` | ✅ | `'S'` / `'N'` |
| `real_para_cadeia(real)` | ✅ | Implementada (Fase 2) |
| `real_para_inteiro(real)` | ✅ | Usa `Math.trunc` (truncamento em direção a zero, igual ao cast `(int)` do Java) |

---

## 5. Biblioteca Objetos

Disponível neste pacote. Carregada por `inclua biblioteca Objetos`.

| Função / Constante | Status | Notas |
|---|:---:|---|
| `TIPO_INTEIRO`, `TIPO_CADEIA`, `TIPO_CARACTER`, `TIPO_REAL`, `TIPO_LOGICO`, `TIPO_OBJETO`, `TIPO_VETOR` | ✅ | |
| `criar_objeto()` | ✅ | |
| `criar_objeto_via_json(json)` | ✅ | |
| `criar_objeto_via_xml(xml)` | ✅ | |
| `atribuir_propriedade(endereco, prop, valor)` | ✅ | |
| `obter_propriedade_tipo_inteiro(endereco, prop)` | ✅ | |
| `obter_propriedade_tipo_real(endereco, prop)` | ✅ | |
| `obter_propriedade_tipo_logico(endereco, prop)` | ✅ | |
| `obter_propriedade_tipo_caracter(endereco, prop)` | ✅ | |
| `obter_propriedade_tipo_cadeia(endereco, prop)` | ✅ | |
| `obter_propriedade_tipo_objeto(endereco, prop)` | ✅ | |
| `obter_propriedade_tipo_objeto_em_vetor(endereco, prop, i)` | ✅ | |
| `obter_propriedade_tipo_caracter_em_vetor(endereco, prop, i)` | ✅ | |
| `obter_propriedade_tipo_logico_em_vetor(endereco, prop, i)` | ✅ | |
| `obter_propriedade_tipo_real_em_vetor(endereco, prop, i)` | ✅ | |
| `obter_propriedade_tipo_inteiro_em_vetor(endereco, prop, i)` | ✅ | |
| `obter_propriedade_tipo_cadeia_em_vetor(endereco, prop, i)` | ✅ | |
| `obter_tamanho_vetor_propriedade(endereco, prop)` | ✅ | |
| `liberar_objeto(endereco)` | ✅ | |
| `liberar()` | ✅ | Limpa todo o cache de objetos |
| `finalizar()` | ✅ | Alias de `liberar()`; adicionado na Fase 4C |
| `obter_json(endereco)` | ✅ | |
| `contem_propriedade(endereco, prop)` | ✅ | |
| `tipo_propriedade(endereco, prop)` | ✅ | Distingue `inteiro` de `real` e `caracter` de `cadeia` (Fase 2) |

---

## 6. Biblioteca Calendario

Disponível neste pacote. Carregada por `inclua biblioteca Calendario`.

| Função / Constante | Status | Notas |
|---|:---:|---|
| `DIA_DOMINGO` … `DIA_SABADO` (1–7) | ✅ | |
| `MES_JANEIRO` … `MES_DEZEMBRO` (1–12) | ✅ | |
| `dia_mes_atual()` | ✅ | |
| `dia_semana_atual()` | ✅ | Retorna 1 (domingo) a 7 (sábado), igual ao Java (Fase 2) |
| `mes_atual()` | ✅ | |
| `ano_atual()` | ✅ | |
| `hora_atual(formato_12h)` | ✅ | |
| `minuto_atual()` | ✅ | |
| `segundo_atual()` | ✅ | |
| `milisegundo_atual()` | ✅ | |
| `dia_semana_completo(dia, caixa_alta, caixa_baixa)` | ✅ | |
| `dia_semana_curto(dia, caixa_alta, caixa_baixa)` | ✅ | Mapeamento corrigido (Fase 2) |
| `dia_semana_abreviado(dia, caixa_alta, caixa_baixa)` | ✅ | Exposta no módulo (Fase 2) |

---

## 7. Biblioteca Arquivos

🔄 **Requer `delegua-node`** — `inclua biblioteca Arquivos` neste pacote retorna erro orientativo.
Implementação completa em `delegua-node/fontes/bibliotecas/dialetos/portugol-studio/arquivos.ts`.

| Função | Status | Notas |
|---|:---:|---|
| `abrir_arquivo(caminho, modo)` | 🔄 | Modos: 0 = leitura, 1 = escrita, 2 = acrescentar |
| `fechar_arquivo(endereco)` | 🔄 | |
| `fim_arquivo(endereco)` | 🔄 | Retorna `verdadeiro` após última linha lida |
| `ler_linha(endereco)` | 🔄 | Leitura sequencial linha a linha com cursor (Fase 5) |
| `escrever_linha(linha, endereco)` | 🔄 | |
| `substituir_texto(caminho, pesquisa, substituto, apenasFirst)` | 🔄 | |
| `arquivo_existe(caminho)` | 🔄 | |
| `apagar_arquivo(caminho)` | 🔄 | |
| `criar_pasta(caminho)` | 🔄 | |
| `listar_pastas(caminho, vetor)` | 🔄 | Lança erro se vetor for menor que o número de pastas |
| `listar_arquivos(caminho, vetor)` | 🔄 | |
| `listar_arquivos_por_tipo(caminho, vetor, tipos)` | 🔄 | |
| `selecionar_arquivo()` | ❌ | Diálogo de UI nativa (desktop); não implementável em ambiente CLI/Node |

---

## 8. Biblioteca Util

🔄 **Requer `delegua-node`** — `inclua biblioteca Util` neste pacote retorna erro orientativo.
Implementação em `delegua-node/fontes/bibliotecas/dialetos/portugol-studio/util.ts`.

| Função | Status | Notas |
|---|:---:|---|
| `obter_diretorio_usuario()` | 🔄 | |
| `numero_elementos(vetor)` | 🔄 | |
| `numero_linhas(matriz)` | 🔄 | |
| `numero_colunas(matriz)` | 🔄 | |
| `sorteia(minimo, maximo)` | 🔄 | Quando `minimo == maximo`, retorna o próprio valor (Fase 5); lança erro se `minimo > maximo` |
| `aguarde(intervalo)` | 🔄 | |
| `tempo_decorrido()` | 🔄 | Tempo em ms desde a inicialização do módulo |

---

## 9. Biblioteca Internet

🔄 **Requer `delegua-node`** — `inclua biblioteca Internet` neste pacote retorna erro orientativo.
Implementação em `fontes/bibliotecas/internet.ts` (acoplada ao Node; usada via `delegua-node`).

| Função | Status | Notas |
|---|:---:|---|
| `definir_tempo_limite(ms)` | 🔄 | Timeout padrão: 2000 ms |
| `obter_texto(url)` | 🔄 | |
| `baixar_imagem(url, caminho)` | 🔄 | Detecta PNG/JPEG pelo `content-type`; salva arquivo |
| `endereco_disponivel(url)` | 🔄 | Faz HEAD request; retorna `falso` para 404 ou erro de rede |

---

## 10. Analisador Semântico

| Capacidade | Status | Notas |
|---|:---:|---|
| Declaração e escopo de variáveis | ✅ | |
| Verificação de tipo em atribuição | ✅ | Diagnóstico para tipo incompatível |
| Validação de vetor/matriz por índice | ✅ | |
| Análise de `se` (condição) | ✅ | |
| Análise de `enquanto` / `faca-enquanto` | ✅ | |
| Análise de `para` | ✅ | Inicializador, condição, incremento e corpo (Fase 4D) |
| Análise de `escolha` (corpo dos casos) | ✅ | Recursão no corpo de cada caso e `caso contrario` (Fase 4D) |
| Validação de `leia()` | ✅ | Apenas variável ou acesso por índice (Fase 3) |
| Análise de corpo de funções definidas pelo usuário | ✅ | Funções além de `inicio` analisadas com escopo próprio (Fase 4D) |
| Verificação básica de tipo em `retorne` | ✅ | Tipo de literais e variáveis retornadas verificado contra o tipo declarado da função; `tipoRetornoFuncaoAtual` rastreado durante a análise de cada função (Fase 4D) |
| Divisão por zero em expressão binária | ✅ | Diagnóstico emitido para divisão literal por zero |
| Detecção de variáveis não usadas | ⚠️ | Implementada (`verificarVariaveisNaoUsadas`) mas desativada por padrão |

---

## 11. Formatador

| Capacidade | Status | Notas |
|---|:---:|---|
| `programa { }` | ✅ | |
| `funcao` com parâmetros tipados e tipo de retorno | ✅ | Corrigido na Fase 4B |
| `se / senao` | ✅ | |
| `enquanto` / `faca-enquanto` | ✅ | |
| `para` | ✅ | |
| `escolha` (com e sem `caso contrario`) | ✅ | Guard para `caminhoPadrao` nulo (Fase 4B) |
| Declaração de variável com tipo e inicializador | ✅ | |
| Declaração de vetor/matriz | ✅ | |
| Operadores aritméticos e relacionais | ✅ | |
| Operador `!=` (`DIFERENTE`) | ✅ | Adicionado na Fase 4B |
| Operadores compostos `+=`, `-=`, `*=`, `/=` | ✅ | Adicionados na Fase 4B |
| Menos unário `-x` | ✅ | Adicionado na Fase 4B |
| Expressões lógicas `e` / `ou` | ✅ | |
| Comentários de linha | ✅ | Preserva comentário na mesma linha do código |
| Acesso a propriedade de biblioteca (`Calendario.DIA_DOMINGO`) | ✅ | |
| Dicionário | ✅ | |
| Formatação de escrita | ✅ | |
| Construtos não suportados pelo dialeto PS (`Tente`, `ParaCada`, `Classe`, etc.) | ⚠️ | Lançam erro explícito de construto não suportado em vez de crash silencioso |

---

## Resumo executivo

> Última atualização: 2026-03-22

| Categoria | Total de itens | ✅ | ⚠️ | ❌ | 🔄 |
|---|:---:|:---:|:---:|:---:|:---:|
| Linguagem (núcleo) | 25 | 23 | 0 | 2 | 0 |
| Matematica | 11 | 11 | 0 | 0 | 0 |
| Texto | 8 | 8 | 0 | 0 | 0 |
| Tipos | 23 | 22 | 1 | 0 | 0 |
| Objetos | 24 | 24 | 0 | 0 | 0 |
| Calendario | 13 | 13 | 0 | 0 | 0 |
| Arquivos | 13 | 0 | 0 | 1 | 12 |
| Util | 7 | 0 | 0 | 0 | 7 |
| Internet | 4 | 0 | 0 | 0 | 4 |
| Analisador Semântico | 12 | 11 | 1 | 0 | 0 |
| Formatador | 18 | 17 | 1 | 0 | 0 |
| **Total** | **162** | **129** | **3** | **3** | **23** |

Itens com ❌ definitivo (sem plano de implementação):
- Operador divisão inteira `\` — não tokenizado no lexador PS; ausente na gramática original do dialeto neste contexto
- `continua` — não existe como palavra reservada no dialeto PS
- `selecionar_arquivo()` — requer UI nativa de desktop; fora do escopo de ambiente CLI/Node
