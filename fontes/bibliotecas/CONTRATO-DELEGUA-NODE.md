# Contrato de integracao com delegua-node

Este documento define o contrato minimo de fronteira para bibliotecas delegadas ao ambiente em Portugol Studio.

## Escopo delegado

As bibliotecas abaixo sao tratadas como dependentes de ambiente neste repositorio:

- Arquivos
- Internet
- Util

A implementacao real deve ser provida pelo projeto delegua-node.

## Comportamento esperado neste repositorio

Quando o codigo executar `inclua biblioteca Arquivos`, `inclua biblioteca Internet` ou `inclua biblioteca Util` neste pacote:

- O importador deve falhar de forma explicita.
- A mensagem de erro deve informar:
  - o nome da biblioteca solicitada;
  - que ela depende de recursos especificos de ambiente;
  - que a execucao exige runtime apropriado;
  - referencia ao projeto delegua-node.

## Nao objetivos deste repositorio

- Nao realizar carregamento automatico de bibliotecas delegadas.
- Nao acoplar runtime local ao ambiente do delegua-node.

## Validacao automatizada

A suite de testes do interpretador valida esse contrato em:

- testes/interpretador.test.ts

Os casos cobrem Arquivos, Internet e Util com verificacao da mensagem orientativa.
