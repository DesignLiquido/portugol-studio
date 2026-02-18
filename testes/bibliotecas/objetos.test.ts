import {
    criar_objeto_via_json,
    criar_objeto_via_xml,
    criar_objeto,
    atribuir_propriedade,
    obter_propriedade_tipo_inteiro,
    obter_propriedade_tipo_real,
    obter_propriedade_tipo_logico,
    obter_propriedade_tipo_caracter,
    obter_propriedade_tipo_cadeia,
    obter_propriedade_tipo_objeto,
    obter_propriedade_tipo_objeto_em_vetor,
    obter_propriedade_tipo_caracter_em_vetor,
    obter_propriedade_tipo_logico_em_vetor,
    obter_propriedade_tipo_real_em_vetor,
    obter_propriedade_tipo_inteiro_em_vetor,
    obter_propriedade_tipo_cadeia_em_vetor,
    obter_tamanho_vetor_propriedade,
    liberar_objeto,
    obter_json,
    contem_propriedade,
    tipo_propriedade,
    TIPO_INTEIRO
} from './../../fontes/bibliotecas/objetos';
import { InterpretadorInterface } from '@designliquido/delegua/interfaces';
describe('Biblioteca de Objetos', () => {
    describe('Criar objeto via JSON', () => {
        it('Trivial', async () => {
            const json = '{"nome": "Charlotte"}';
            const index = await criar_objeto_via_json({} as InterpretadorInterface, json);
            const nome = await obter_propriedade_tipo_cadeia({} as InterpretadorInterface, index, 'nome');
            expect(nome).toBe('Charlotte');
        });
    });

    describe('Criar objeto via XML', () => {
        it('Trivial', async () => {
            const xml = '<root><nome>Charlotte</nome></root>';
            const index = await criar_objeto_via_xml({} as InterpretadorInterface, xml);
            const nome = await obter_propriedade_tipo_cadeia({} as InterpretadorInterface, index, 'nome');
            expect(nome).toBe('Charlotte');
        });
    });

    describe('Criar objeto', () => {
        it('Trivial', async () => {
            const index = await criar_objeto();
            expect(index).toBeGreaterThan(-1);
        });
    });

    describe('Atribuir propriedade', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'idade', 25);
            const idade = await obter_propriedade_tipo_inteiro({} as InterpretadorInterface, endereco, 'idade');
            expect(idade).toBe(25);
        });
    });

    describe('Obter propriedade do tipo inteiro', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'idade', 25);
            const idade = await obter_propriedade_tipo_inteiro({} as InterpretadorInterface, endereco, 'idade');
            expect(idade).toBe(25);
        });

        it('Falha - Tipo Inválido', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'idade', 'texto em vez de inteiro');
            await expect(
                obter_propriedade_tipo_inteiro({} as InterpretadorInterface, endereco, 'idade')
            ).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Obter propriedade do tipo real', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'altura', 1.75);
            const altura = await obter_propriedade_tipo_real({} as InterpretadorInterface, endereco, 'altura');
            expect(altura).toBe(1.75);
        });

        it('Falha - Tipo Inválido', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'altura', 'texto em vez de real');
            await expect(obter_propriedade_tipo_real({} as InterpretadorInterface, endereco, 'altura')).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Obter propriedade do tipo logico', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'isAdmin', true);
            const isAdmin = await obter_propriedade_tipo_logico({} as InterpretadorInterface, endereco, 'isAdmin');
            expect(isAdmin).toBe(true);
        });

        it('Falha - Tipo Inválido', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'isAdmin', 'texto em vez de booleano');
            await expect(
                obter_propriedade_tipo_logico({} as InterpretadorInterface, endereco, 'isAdmin')
            ).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Obter propriedade do tipo caracter', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'inicial', 'A');
            const inicial = await obter_propriedade_tipo_caracter({} as InterpretadorInterface, endereco, 'inicial');
            expect(inicial).toBe('A');
        });

        it('Falha - Tipo Inválido', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'inicial', 123); // Not a character
            await expect(
                obter_propriedade_tipo_caracter({} as InterpretadorInterface, endereco, 'inicial')
            ).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Obter propriedade do tipo cadeia', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'nome', 'Charlotte');
            const nome = await obter_propriedade_tipo_cadeia({} as InterpretadorInterface, endereco, 'nome');
            expect(nome).toBe('Charlotte');
        });

        it('Falha - Tipo Inválido', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'nome', { object: 'instead of string' });
            await expect(obter_propriedade_tipo_cadeia({} as InterpretadorInterface, endereco, 'nome')).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Obter propriedade do tipo objeto', () => {
        it('Trivial', async () => {
            const json = `
            {
                "character": {
                    "id": 1,
                    "name": "Charlotte Wiltshire",
                    "position": "Lead Protagonist",
                    "email": "charlotte.wiltshire@example.com"
                }
            }`;
            const index = await criar_objeto_via_json({} as InterpretadorInterface, json);
            const retrievedSubEndereco = await obter_propriedade_tipo_objeto(
                {} as InterpretadorInterface,
                index,
                'character'
            );
            const resultProp = await obter_propriedade_tipo_cadeia(
                {} as InterpretadorInterface,
                retrievedSubEndereco,
                'name'
            );
            expect(resultProp).toBe('Charlotte Wiltshire');
        });

        it('Falha - Tipo Inválido', async () => {
            const json = `
            {
                "character": "notAnObject"
            }`;
            const index = await criar_objeto_via_json({} as InterpretadorInterface, json);
            await expect(
                obter_propriedade_tipo_objeto({} as InterpretadorInterface, index, 'character')
            ).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });
    describe('Obter propriedade do tipo objeto em vetor', () => {
        it('Trivial', async () => {
            const json = `
                {
                    "characters": [
                        {
                            "id": 1,
                            "name": "Charlotte Wiltshire",
                            "position": "Lead Protagonist",
                            "email": "charlotte.wiltshire@example.com"
                        },
                        {
                            "id": 2,
                            "name": "Scarlett Eyler",
                            "position": "Supporting Character",
                            "email": "scarlett.eyler@example.com"
                        }
                    ]
                }
            `;
            const vetor = await criar_objeto_via_json({} as InterpretadorInterface, json);
            const retrievedSubEndereco = await obter_propriedade_tipo_objeto_em_vetor(
                {} as InterpretadorInterface,
                vetor,
                'characters',
                0
            );
            const resultProp = await obter_propriedade_tipo_cadeia(
                {} as InterpretadorInterface,
                retrievedSubEndereco,
                'name'
            );
            expect(resultProp).toBe('Charlotte Wiltshire');
        });

        it('Falha - Não é um vetor', async () => {
            const json = `
                {
                    "characters": "notAnArray"
                }
            `;
            const vetor = await criar_objeto_via_json({} as InterpretadorInterface, json);
            await expect(
                obter_propriedade_tipo_objeto_em_vetor({} as InterpretadorInterface, vetor, 'characters', 0)
            ).rejects.toThrow(/não é um vetor/);
        });

        it('Falha- Índice Inválido', async () => {
            const json = `
                {
                    "characters": [
                        {
                            "id": 1,
                            "name": "Charlotte Wiltshire",
                            "position": "Lead Protagonist",
                            "email": "charlotte.wiltshire@example.com"
                        }
                    ]
                }
            `;
            const vetor = await criar_objeto_via_json({} as InterpretadorInterface, json);
            await expect(
                obter_propriedade_tipo_objeto_em_vetor({} as InterpretadorInterface, vetor, 'characters', 1)
            ).rejects.toThrow(/índice de vetor inválido/);
        });
        it('Falha - Tipo Ínvalido"', async () => {
            const json = `
            {
                "characters": [
                    "notAnObject"
                ]
            }
        `;
            const vetor = await criar_objeto_via_json({} as InterpretadorInterface, json);
            await expect(
                obter_propriedade_tipo_objeto_em_vetor({} as InterpretadorInterface, vetor, 'characters', 0)
            ).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Obter propriedade do tipo caracter em vetor', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'caracteres', ['A', 'B', 'C']);
        });

        it('Trivial', async () => {
            const primeiroCaracter = await obter_propriedade_tipo_caracter_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'caracteres',
                0
            );
            expect(primeiroCaracter).toBe('A');

            const segundoCaracter = await obter_propriedade_tipo_caracter_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'caracteres',
                1
            );
            expect(segundoCaracter).toBe('B');

            const terceiroCaracter = await obter_propriedade_tipo_caracter_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'caracteres',
                2
            );
            expect(terceiroCaracter).toBe('C');
        });

        it('Falha - Não é um vetor', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'caracteres', 'notAnArray');
            await expect(
                obter_propriedade_tipo_caracter_em_vetor({} as InterpretadorInterface, endereco, 'caracteres', 0)
            ).rejects.toThrow(/não é um vetor/);
        });

        it('Falha- Índice Inválido', async () => {
            await expect(
                obter_propriedade_tipo_caracter_em_vetor({} as InterpretadorInterface, endereco, 'caracteres', 3)
            ).rejects.toThrow(/índice de vetor inválido/);
        });

        it('Falha - Tipo Ínvalido', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'caracteres', ['A', 'B', 1]);
            await expect(
                obter_propriedade_tipo_caracter_em_vetor({} as InterpretadorInterface, endereco, 'caracteres', 2)
            ).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Obter propriedade do tipo logico em vetor', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'logicos', [true, false]);
        });

        it('Trivial', async () => {
            const primeiroLogico = await obter_propriedade_tipo_logico_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'logicos',
                0
            );
            expect(primeiroLogico).toBe(true);

            const segundoLogico = await obter_propriedade_tipo_logico_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'logicos',
                1
            );
            expect(segundoLogico).toBe(false);
        });

        it('Falha - Não é um vetor', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'logicos', 'notAnArray');
            await expect(
                obter_propriedade_tipo_logico_em_vetor({} as InterpretadorInterface, endereco, 'logicos', 0)
            ).rejects.toThrow(/não é um vetor/);
        });

        it('Falha- Índice Inválido', async () => {
            await expect(
                obter_propriedade_tipo_logico_em_vetor({} as InterpretadorInterface, endereco, 'logicos', 2)
            ).rejects.toThrow(/índice de vetor inválido/);
        });

        it('Falha - Tipo Ínvalido', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'logicos', [true, 'notBoolean']);
            await expect(
                obter_propriedade_tipo_logico_em_vetor({} as InterpretadorInterface, endereco, 'logicos', 1)
            ).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Obter propriedade do tipo real em vetor', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'reais', [1.1, 2.2, 3.3]);
        });

        it('Trivial', async () => {
            const primeiroReal = await obter_propriedade_tipo_real_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'reais',
                0
            );
            expect(primeiroReal).toBe(1.1);

            const segundoReal = await obter_propriedade_tipo_real_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'reais',
                1
            );
            expect(segundoReal).toBe(2.2);

            const terceiroReal = await obter_propriedade_tipo_real_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'reais',
                2
            );
            expect(terceiroReal).toBe(3.3);
        });

        it('Falha - Não é um vetor', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'reais', 'notAnArray');
            await expect(
                obter_propriedade_tipo_real_em_vetor({} as InterpretadorInterface, endereco, 'reais', 0)
            ).rejects.toThrow(/não é um vetor/);
        });

        it('Falha- Índice Inválido', async () => {
            await expect(
                obter_propriedade_tipo_real_em_vetor({} as InterpretadorInterface, endereco, 'reais', 3)
            ).rejects.toThrow(/índice de vetor inválido/);
        });

        it('Falha - Tipo Ínvalido', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'reais', [1.1, 'notNumber', 3.3]);
            await expect(
                obter_propriedade_tipo_real_em_vetor({} as InterpretadorInterface, endereco, 'reais', 1)
            ).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Obter propriedade do tipo inteiro em vetor', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'inteiros', [1, 2, 3]);
        });

        it('Trivial', async () => {
            const primeiroInteiro = await obter_propriedade_tipo_inteiro_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'inteiros',
                0
            );
            expect(primeiroInteiro).toBe(1);

            const segundoInteiro = await obter_propriedade_tipo_inteiro_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'inteiros',
                1
            );
            expect(segundoInteiro).toBe(2);

            const terceiroInteiro = await obter_propriedade_tipo_inteiro_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'inteiros',
                2
            );
            expect(terceiroInteiro).toBe(3);
        });

        it('Falha - Não é um vetor', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'inteiros', 'notAnArray');
            await expect(
                obter_propriedade_tipo_inteiro_em_vetor({} as InterpretadorInterface, endereco, 'inteiros', 0)
            ).rejects.toThrow(/não é um vetor/);
        });

        it('Falha- Índice Inválido', async () => {
            await expect(
                obter_propriedade_tipo_inteiro_em_vetor({} as InterpretadorInterface, endereco, 'inteiros', 3)
            ).rejects.toThrow(/índice de vetor inválido/);
        });

        it('Falha - Tipo Ínvalido', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'inteiros', [1, 'notInteger', 3]);
            await expect(
                obter_propriedade_tipo_inteiro_em_vetor({} as InterpretadorInterface, endereco, 'inteiros', 1)
            ).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Obter propriedade do tipo cadeia em vetor', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'cadeias', ['um', 'dois', 'três']);
        });

        it('Trivial', async () => {
            const primeiraCadeia = await obter_propriedade_tipo_cadeia_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'cadeias',
                0
            );
            expect(primeiraCadeia).toBe('um');

            const segundaCadeia = await obter_propriedade_tipo_cadeia_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'cadeias',
                1
            );
            expect(segundaCadeia).toBe('dois');

            const terceiraCadeia = await obter_propriedade_tipo_cadeia_em_vetor(
                {} as InterpretadorInterface,
                endereco,
                'cadeias',
                2
            );
            expect(terceiraCadeia).toBe('três');
        });

        it('Falha - Não é um vetor', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'cadeias', 'notAnArray');
            await expect(
                obter_propriedade_tipo_cadeia_em_vetor({} as InterpretadorInterface, endereco, 'cadeias', 0)
            ).rejects.toThrow(/não é um vetor/);
        });

        it('Falha- Índice Inválido', async () => {
            await expect(
                obter_propriedade_tipo_cadeia_em_vetor({} as InterpretadorInterface, endereco, 'cadeias', 3)
            ).rejects.toThrow(/índice de vetor inválido/);
        });

        it('Falha - Tipo Ínvalido', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'cadeias', ['um', 2, 'três']);
            await expect(
                obter_propriedade_tipo_cadeia_em_vetor({} as InterpretadorInterface, endereco, 'cadeias', 1)
            ).rejects.toThrow(
                '"O tipo da propriedade informada não corresponde ao tipo identificado na função.\nAltere a função de chamada para o tipo correto."'
            );
        });
    });

    describe('Deve obter o tamanho do vetor', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'numeros', [1, 2, 3]);
        });

        it('Trivial', async () => {
            const tamanho = await obter_tamanho_vetor_propriedade({} as InterpretadorInterface, endereco, 'numeros');
            expect(tamanho).toBe(3);
        });
    });

    describe('Deve liberar um objeto', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await liberar_objeto({} as InterpretadorInterface, endereco);
            await expect(obter_json({} as InterpretadorInterface, endereco)).rejects.toThrow();
        });
    });

    describe('Deve retornar o JSON de um objeto', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'nome', 'Charlotte');
            const json = await obter_json({} as InterpretadorInterface, endereco);
            expect(json).toBe(JSON.stringify({ nome: 'Charlotte' }));
        });
    });

    describe('Verificar se uma propriedade existe', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'nome', 'Charlotte');
            const exists = await contem_propriedade({} as InterpretadorInterface, endereco, 'nome');
            expect(exists).toBe(true);
        });
    });

    describe('Obter tipo da propriedade', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade({} as InterpretadorInterface, endereco, 'idade', 25);
            const tipo = await tipo_propriedade({} as InterpretadorInterface, endereco, 'idade');
            expect(tipo).toBe(TIPO_INTEIRO);
        });
    });
});
