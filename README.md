# portugol-studio

Nossa implementação do dialeto Portugol Studio usando TypeScript, baseado no núcleo de Delégua.

  <p align="center">
    <img src="./recursos/imagens/badge-statements.svg" />
    <img src="./recursos/imagens/badge-lines.svg" />
    <img src="./recursos/imagens/badge-functions.svg" />
    <img src="./recursos/imagens/badge-branches.svg" />
    <a href="https://github.com/DesignLiquido/portugol-studio/issues" target="_blank">
      <img src="https://img.shields.io/github/issues/Designliquido/portugol-studio" />
    </a>
    <a href="https://www.npmjs.com/package/@designliquido/portugol-studio" target="_blank">
      <img src="https://img.shields.io/npm/v/@designliquido/portugol-studio" />
    </a>
    <img src="https://img.shields.io/npm/dw/@designliquido/portugol-studio" />
    <img src="https://img.shields.io/github/license/Designliquido/portugol-studio" />
  </p>

## Sobre este dialeto

Este dialeto tenta implementar da forma mais fidedigna possível todos os comportamentos de execução da aplicação Portugol Studio original para Desktop, até então na versão 2.7.5, e alguns comportamentos da implementação para Web, chamada Portugol Webstudio. Em teoria, a aplicação original funciona para todos os sistemas operacionais, mas os instaladores para MacOS são bastante instáveis, e falham de tempos em tempos. Além disso, há diferenças entre os códigos que podem ser executados no Portugol Studio mas não no Portugol Webstudio, e vice-versa. A ideia aqui é universalizar as implementações em um úncio dialeto que funciona em qualquer sistema operacional e qualquer dispositivo.

Inicialmente, este dialeto foi implementado dentro do núcleo de Delégua, já que tínhamos a ideia de utilizar o sistema de tipagem do Portugol Studio para desenhar a tipagem em Delégua. Com a incorporação de mais dialetos ao núcleo, a manutenção do monolito começou a trazer impactos ao núcleo como um todo, com instruções que sequer existem em um dialeto tendo que ser implementadas porque outro dialeto a possui. Portanto, este dialeto foi separado do núcleo de Delégua, mas ainda o utiliza como dependência. 

## Componentes implementados

Este dialeto implementa os seguintes componentes:

- **Lexador**: responsável pela análise léxica da linguagem: converte um texto em símbolos (_tokens_) que são utilizados na avaliação sintática;
- **Avaliador Sintático**: responsável por converter símbolos em estruturas de alto nível. Essas estruturas de alto nível podem ser usadas para execução de código, formatação de código, tradução do fonte em outra linguagem de programação e análise semântica;
- **Interpretador**: recebe estruturas de alto nível da avaliação sintática e as executa como instruções;
- **Formatador**: recebe estruturas de alto nível da avaliação sintática e devolve um fonte do Portugol Studio formatado conforme o manual de estilo de código da Design Líquido;
- **Tradutor**: recebe estruturas de alto nível da avaliação sintática e o traduz para outra linguagem de programação. Nesta implementação, temos o tradutor de Portugol Studio para Delégua;
- **Analisador Semântico**: recebe estruturas de alto nível e verifica se a execução do código correspondente faz sentido ou não. O código de entrada pode estar perfeitamente escrito quanto ao léxico e sintaxe, mas podem haver problemas como variáveis que não existem, funções que retornam um tipo incorreto, execuções impossíveis como divisões por zero, entre outras heurísticas.

## Finalidade educacional

A finalidade educacional deste dialeto serve a dois grandes propósitos:

- Permitir a qualquer pessoa executar código em Portugol Studio, independente de sistema operacional e dispositivo;
- Possibilitar a alunos que estejam estudando disciplinas de ciência da computação ou tecnologia da informação, como compiladores, a entender como esses componentes funcionando, já que boa parte deles faz parte do currículo eletivo de diversas instituições de ensino pelo mundo. O material disponível para tal é farto na língua inglesa, mas não na língua portuguesa.

## Compatibilidade com JavaScript e Node.js

Este dialeto é distribuído como um pacote do [NPM](https://npmjs.com), e é compatível com qualquer versão de JavaScript e Node.js. O código é escrito em TypeScript, mas transpilado para JavaScript ES5, virtualmente compatível com 100% dos navegadores de internet disponíveis atualmente.

Este dialeto pode ser utilizado como base para construir outras aplicações, como _sites_ de internet, aplicativos para dispositivos móveis e até mesmo scripts executados por linha de comando. É também agregado ao [pacote de Delégua para Node.js](https://github.com/DesignLiquido/delegua-node), o que permite a execução de fontes por linha de comando.

## Bibliotecas e integração com delegua-node

Adotamos a estratégia de integração conhecida no projeto como **Opção B** para bibliotecas dependentes de ambiente:

- Este pacote mantém os contratos de dialeto e a compatibilidade de importação das bibliotecas.
- Bibliotecas com dependência de ambiente/SO (como `Arquivos`, `Internet` e `Util`) têm implementação real fornecida pelo [delegua-node](https://github.com/DesignLiquido/delegua-node).
- Quando essa integração não está disponível no runtime atual, o importador retorna erro orientativo explícito apontando para o `delegua-node`.
- Não há carregamento automático dessas bibliotecas neste pacote: ao importá-las aqui, a orientação é executar o código em um ambiente apropriado (ex.: `delegua-node`).

Bibliotecas compartilhadas suportadas diretamente neste pacote:

- `Calendario`
- `Matematica`
- `Objetos`
- `Texto`
- `Tipos`