import fetch from 'node-fetch';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

let timeout: number = 2000;

export async function definir_tempo_limite(time: number): Promise<void> {
    timeout = time;
}

export async function obter_texto(caminho: string): Promise<string> {
    try {
        const response = await fetch(caminho, { method: 'GET', timeout });

        const conteudo = await response.text();
        if (!conteudo) {
            throw new Error(`O caminho ${caminho} não tem nenhum conteúdo`);
        }

        return conteudo;
    } catch (error) {
        throw new Error(`Não foi possível obter o conteúdo de ${caminho}: ${error.message}`);
    }
}

export async function baixar_imagem(endereco: string, caminho: string): Promise<string> {
    let tipoDaImagem: string;
    let headerDaRequisicao: string;
    let imagemObtida: Buffer;
    let arquivo: string;

    try {
        tipoDaImagem = 'png';
        headerDaRequisicao = (await fetch(endereco, { method: 'HEAD', timeout })).headers.get('content-type');
        if (headerDaRequisicao.includes('image/png')) {
            tipoDaImagem = 'png';
        } else if (headerDaRequisicao.includes('image/jpeg') || headerDaRequisicao.includes('image/jpg')) {
            tipoDaImagem = 'jpg';
        }
        
        imagemObtida = await (await fetch(endereco, {method: 'GET', timeout})).buffer();
    } catch (error) {
        throw new Error(`Não foi possível obter o conteúdo de ${endereco}`);
    }

    arquivo = resolve(caminho + `.${tipoDaImagem}`);
    try {    
        await new Promise((resolve, reject) => {
            const stream = createWriteStream(arquivo);
            stream.on('finish', resolve);
            stream.on('error', reject);
            stream.write(imagemObtida);
            stream.end();
        });
    } catch (error) {
        throw new Error(
            `Não foi possível salvar a imagem em ${arquivo}\nGaranta que o caminho é válido e todas as pastas existem`
        );
    }

    return tipoDaImagem;
}

export async function endereco_disponivel(endereco: string): Promise<boolean> {
    try {
        const response = await fetch(endereco, { method: 'HEAD', timeout });
        const status = response.status;

        if (status === 404 || status === 0) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}
