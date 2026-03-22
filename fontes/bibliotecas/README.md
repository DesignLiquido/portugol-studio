# Bibliotecas do Portugol Studio

Aqui são implementadas as bibliotecas que não possuem dependência com o Node.js. As bibliotecas com essa dependência são implementadas em https://github.com/DesignLiquido/delegua-node. 

Estratégia adotada para bibliotecas dependentes de ambiente:
- Mantemos os stubs/contratos neste pacote para compatibilidade de dialeto.
- A implementação real de bibliotecas como Arquivos, Internet e Util é resolvida via delegua-node.
- Quando a integração não estiver disponível no runtime atual, o importador retorna erro orientativo apontando para delegua-node.
- O contrato de fronteira e mensagem orientativa está detalhado em `CONTRATO-DELEGUA-NODE.md`.

Repositório base usado como referência: https://github.com/UNIVALI-LITE/Portugol-Studio/tree/master/core/src/main/java/br/univali/portugol/nucleo/bibliotecas. 

