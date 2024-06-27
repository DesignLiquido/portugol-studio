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
    TIPO_INTEIRO,
    TIPO_CADEIA,
    TIPO_CARACTER,
    TIPO_REAL,
    TIPO_LOGICO,
    TIPO_OBJETO,
    TIPO_VETOR,
} from './../../fontes/bibliotecas/objetos';

describe('Biblioteca de Objetos', () => {
    describe('Criar objeto via JSON', () => {
        it('Trivial', async () => {
            const json = '{"nome": "Charlotte"}';
            const index = await criar_objeto_via_json(json);
            const nome = await obter_propriedade_tipo_cadeia(index, 'nome');
            expect(nome).toBe('Charlotte');
        });
    });

    describe('Criar objeto via XML', () => {
        it('Trivial', async () => {
            const xml = '<root><nome>Charlotte</nome></root>';
            const index = await criar_objeto_via_xml(xml);
            const nome = await obter_propriedade_tipo_cadeia(index, 'nome');
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
            await atribuir_propriedade(endereco, 'idade', 25);
            const idade = await obter_propriedade_tipo_inteiro(endereco, 'idade');
            expect(idade).toBe(25);
        });
    });

    describe('Obter propriedade do tipo inteiro', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade(endereco, 'idade', 25);
            const idade = await obter_propriedade_tipo_inteiro(endereco, 'idade');
            expect(idade).toBe(25);
        });
    });

    describe('Obter propriedade do tipo real', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade(endereco, 'altura', 1.75);
            const altura = await obter_propriedade_tipo_real(endereco, 'altura');
            expect(altura).toBe(1.75);
        });
    });

    describe('Obter propriedade do tipo logico', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade(endereco, 'isAdmin', true);
            const isAdmin = await obter_propriedade_tipo_logico(endereco, 'isAdmin');
            expect(isAdmin).toBe(true);
        });
    });

    describe('Obter propriedade do tipo caracter', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade(endereco, 'inicial', 'A');
            const inicial = await obter_propriedade_tipo_caracter(endereco, 'inicial');
            expect(inicial).toBe('A');
        });
    });

    describe('Obter propriedade do tipo cadeia', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade(endereco, 'nome', 'Charlotte');
            const nome = await obter_propriedade_tipo_cadeia(endereco, 'nome');
            expect(nome).toBe('Charlotte');
        });
    });
    describe('Obter propriedade do tipo objeto', () => {
        it('Trivial', async () => {
            const json = `
            {
            "character":{
                "id": 1,
                "name": "Charlotte Wiltshire",
                "position": "Lead Protagonist",
                "email": "charlotte.wiltshire@example.com"
                }
            }`;
            const index = await criar_objeto_via_json(json);
            const retrievedSubEndereco = await obter_propriedade_tipo_objeto(index, 'character');
            const nestedProp = await obter_propriedade_tipo_cadeia(retrievedSubEndereco, 'name');
            expect(nestedProp).toBe('Charlotte Wiltshire');
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
            const vetor = await criar_objeto_via_json(json);
            const retrievedSubEndereco = await obter_propriedade_tipo_objeto_em_vetor(vetor, 'characters', 0);
            const resultProp = await obter_propriedade_tipo_cadeia(retrievedSubEndereco, 'name');
            expect(resultProp).toBe('Charlotte Wiltshire');
        });
    
        it('Falha - Não é um vetor', async () => {
            const json = `
                {
                    "characters": "notAnArray"
                }
            `;
            const vetor = await criar_objeto_via_json(json);
            await expect(obter_propriedade_tipo_objeto_em_vetor(vetor, 'characters', 0))
                .rejects.toThrow(/não é um vetor/);
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
            const vetor = await criar_objeto_via_json(json);
            await expect(obter_propriedade_tipo_objeto_em_vetor(vetor, 'characters', 1))
                .rejects.toThrow(/índice de vetor inválido/);
        });
            it('Falha - Tipo Inválido', async () => {
        const json = `
            {
                "characters": [
                    "notAnObject"
                ]
            }
        `;
        const vetor = await criar_objeto_via_json(json);
        await expect(obter_propriedade_tipo_objeto_em_vetor(vetor, 'characters', 0))
            .rejects.toThrow('Tipo Inválido');
    });
    });
        
    describe('Obter propriedade do tipo caracter em vetor', () => {
        let endereco;
    
        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade(endereco, 'caracteres', ['A', 'B', 'C']);
        });
    
        it('Trivial', async () => {
            const primeiroCaracter = await obter_propriedade_tipo_caracter_em_vetor(endereco, 'caracteres', 0);
            expect(primeiroCaracter).toBe('A');
    
            const segundoCaracter = await obter_propriedade_tipo_caracter_em_vetor(endereco, 'caracteres', 1);
            expect(segundoCaracter).toBe('B');
    
            const terceiroCaracter = await obter_propriedade_tipo_caracter_em_vetor(endereco, 'caracteres', 2);
            expect(terceiroCaracter).toBe('C');
        });
    
        it('Falha - Não é um vetor', async () => {
            await atribuir_propriedade(endereco, 'caracteres', 'notAnArray');
            await expect(obter_propriedade_tipo_caracter_em_vetor(endereco, 'caracteres', 0))
                .rejects.toThrow(/não é um vetor/);
        });
    
        it('Falha- Índice Inválido', async () => {
            await expect(obter_propriedade_tipo_caracter_em_vetor(endereco, 'caracteres', 3))
                .rejects.toThrow(/índice de vetor inválido/);
        });

        it('Falha - Tipo Inválido', async () => {
            await atribuir_propriedade(endereco, 'caracteres', ['A', 'B', 1]);
            await expect(obter_propriedade_tipo_caracter_em_vetor(endereco, 'caracteres', 2))
                .rejects.toThrow('Tipo Inválido');
        });
    });
        
    describe('Obter propriedade do tipo logico em vetor', () => {
        let endereco;
    
        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade(endereco, 'logicos', [true, false]);
        });
    
        it('Trivial', async () => {
            const primeiroLogico = await obter_propriedade_tipo_logico_em_vetor(endereco, 'logicos', 0);
            expect(primeiroLogico).toBe(true);
    
            const segundoLogico = await obter_propriedade_tipo_logico_em_vetor(endereco, 'logicos', 1);
            expect(segundoLogico).toBe(false);
        });
    
        it('Falha - Não é um vetor', async () => {
            await atribuir_propriedade(endereco, 'logicos', 'notAnArray');
            await expect(obter_propriedade_tipo_logico_em_vetor(endereco, 'logicos', 0))
                .rejects.toThrow(/não é um vetor/);
        });
    
        it('Falha- Índice Inválido', async () => {
            await expect(obter_propriedade_tipo_logico_em_vetor(endereco, 'logicos', 2))
                .rejects.toThrow(/índice de vetor inválido/);
        });

        it('Falha - Tipo Inválido', async () => {
            await atribuir_propriedade(endereco, 'logicos', [true, 'notBoolean']);
            await expect(obter_propriedade_tipo_logico_em_vetor(endereco, 'logicos', 1))
                .rejects.toThrow('Tipo Inválido');
        });
    });
    
    describe('Obter propriedade do tipo real em vetor', () => {
        let endereco;
    
        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade(endereco, 'reais', [1.1, 2.2, 3.3]);
        });
    
        it('Trivial', async () => {
            const primeiroReal = await obter_propriedade_tipo_real_em_vetor(endereco, 'reais', 0);
            expect(primeiroReal).toBe(1.1);
    
            const segundoReal = await obter_propriedade_tipo_real_em_vetor(endereco, 'reais', 1);
            expect(segundoReal).toBe(2.2);
    
            const terceiroReal = await obter_propriedade_tipo_real_em_vetor(endereco, 'reais', 2);
            expect(terceiroReal).toBe(3.3);
        });
    
        it('Falha - Não é um vetor', async () => {
            await atribuir_propriedade(endereco, 'reais', 'notAnArray');
            await expect(obter_propriedade_tipo_real_em_vetor(endereco, 'reais', 0))
                .rejects.toThrow(/não é um vetor/);
        });
    
        it('Falha- Índice Inválido', async () => {
            await expect(obter_propriedade_tipo_real_em_vetor(endereco, 'reais', 3))
                .rejects.toThrow(/índice de vetor inválido/);
        });

        it('Falha - Tipo Inválido', async () => {
            await atribuir_propriedade(endereco, 'reais', [1.1, 'notNumber', 3.3]);
            await expect(obter_propriedade_tipo_real_em_vetor(endereco, 'reais', 1))
                .rejects.toThrow('Tipo Inválido');
        });
    });
    
    describe('Obter propriedade do tipo inteiro em vetor', () => {
        let endereco;
    
        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade(endereco, 'inteiros', [1, 2, 3]);
        });
    
        it('Trivial', async () => {
            const primeiroInteiro = await obter_propriedade_tipo_inteiro_em_vetor(endereco, 'inteiros', 0);
            expect(primeiroInteiro).toBe(1);
    
            const segundoInteiro = await obter_propriedade_tipo_inteiro_em_vetor(endereco, 'inteiros', 1);
            expect(segundoInteiro).toBe(2);
    
            const terceiroInteiro = await obter_propriedade_tipo_inteiro_em_vetor(endereco, 'inteiros', 2);
            expect(terceiroInteiro).toBe(3);
        });
    
        it('Falha - Não é um vetor', async () => {
            await atribuir_propriedade(endereco, 'inteiros', 'notAnArray');
            await expect(obter_propriedade_tipo_inteiro_em_vetor(endereco, 'inteiros', 0))
                .rejects.toThrow(/não é um vetor/);
        });
    
        it('Falha- Índice Inválido', async () => {
            await expect(obter_propriedade_tipo_inteiro_em_vetor(endereco, 'inteiros', 3))
                .rejects.toThrow(/índice de vetor inválido/);
        });

        it('Falha - Tipo Inválido', async () => {
            await atribuir_propriedade(endereco, 'inteiros', [1, 'notInteger', 3]);
            await expect(obter_propriedade_tipo_inteiro_em_vetor(endereco, 'inteiros', 1))
                .rejects.toThrow('Tipo Inválido');
        });
    
    });
    
    describe('Obter propriedade do tipo cadeia em vetor', () => {
        let endereco;
    
        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade(endereco, 'cadeias', ['um', 'dois', 'três']);
        });
    
        it('Trivial', async () => {
            const primeiraCadeia = await obter_propriedade_tipo_cadeia_em_vetor(endereco, 'cadeias', 0);
            expect(primeiraCadeia).toBe('um');
    
            const segundaCadeia = await obter_propriedade_tipo_cadeia_em_vetor(endereco, 'cadeias', 1);
            expect(segundaCadeia).toBe('dois');
    
            const terceiraCadeia = await obter_propriedade_tipo_cadeia_em_vetor(endereco, 'cadeias', 2);
            expect(terceiraCadeia).toBe('três');
        });
    
        it('Falha - Não é um vetor', async () => {
            await atribuir_propriedade(endereco, 'cadeias', 'notAnArray');
            await expect(obter_propriedade_tipo_cadeia_em_vetor(endereco, 'cadeias', 0))
                .rejects.toThrow(/não é um vetor/);
        });
    
        it('Falha- Índice Inválido', async () => {
            await expect(obter_propriedade_tipo_cadeia_em_vetor(endereco, 'cadeias', 3))
                .rejects.toThrow(/índice de vetor inválido/);
        });

        it('Falha - Tipo Inválido', async () => {
            await atribuir_propriedade(endereco, 'cadeias', ['um', 2, 'três']);
            await expect(obter_propriedade_tipo_cadeia_em_vetor(endereco, 'cadeias', 1))
                .rejects.toThrow('Tipo Inválido');
        });
    });
    
    describe('Deve obter o tamanho do vetor', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
            await atribuir_propriedade(endereco, 'numeros', [1, 2, 3]);
        });

        it('Trivial', async () => {
            const tamanho = await obter_tamanho_vetor_propriedade(endereco, 'numeros');
            expect(tamanho).toBe(3);
        });
    });

    describe('Deve liberar um objeto', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await liberar_objeto(endereco);
            await expect(obter_json(endereco)).rejects.toThrow();
        });
    });

    describe('Deve retornar o JSON de um objeto', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade(endereco, 'nome', 'Charlotte');
            const json = await obter_json(endereco);
            expect(json).toBe(JSON.stringify({ nome: 'Charlotte' }));
        });
    });

    describe('Verificar se uma propriedade existe', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade(endereco, 'nome', 'Charlotte');
            const exists = await contem_propriedade(endereco, 'nome');
            expect(exists).toBe(true);
        });
    });

    describe('Obter tipo da propriedade', () => {
        let endereco: number;

        beforeEach(async () => {
            endereco = await criar_objeto();
        });

        it('Trivial', async () => {
            await atribuir_propriedade(endereco, 'idade', 25);
            const tipo = await tipo_propriedade(endereco, 'idade');
            expect(tipo).toBe(TIPO_INTEIRO);
        });
    });
});
