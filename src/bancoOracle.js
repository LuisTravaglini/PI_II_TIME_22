// Autor: Luis Travaglini
// Preparação da conexão compartilhada com o banco Oracle da equipe.
// As credenciais devem ser definidas no ambiente e nunca no código.
import oracledb from "oracledb";

export async function conectarOracle() {
    const { TRAK_DB_USER, TRAK_DB_PASSWORD, TRAK_DB_CONNECT_STRING } = process.env;
    if (!TRAK_DB_USER || !TRAK_DB_PASSWORD || !TRAK_DB_CONNECT_STRING) {
        throw new Error("Configure TRAK_DB_USER, TRAK_DB_PASSWORD e TRAK_DB_CONNECT_STRING.");
    }
    return oracledb.getConnection({
        user: TRAK_DB_USER,
        password: TRAK_DB_PASSWORD,
        connectString: TRAK_DB_CONNECT_STRING
    });
}

// Acrescentado para o detalhesROTA.js 

// Converte { PROJETO_ID: 1 } em { projetoId: 1 }, o formato que as telas usam.
export function paraCamel(linha) {
    const novo = {};
    for (const [chave, valor] of Object.entries(linha)) {
        const nome = chave.toLowerCase().replace(/_([a-z])/g, (_, letra) => letra.toUpperCase());
        novo[nome] = valor;
    }
    return novo;
}

// Executa um comando, confirma (commit) e sempre fecha a conexão.
export async function executarQuery(sql, binds = []) {
    const conexao = await conectarOracle();
    try {
        return await conexao.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            autoCommit: true
        });
    } finally {
        await conexao.close();
    }
}

// Executa vários comandos como uma unidade: ou todos dão certo, ou nenhum.
// comandos = [[sql, binds], [sql, binds], ...]
export async function executarTransacao(comandos) {
    const conexao = await conectarOracle();
    try {
        for (const [sql, binds] of comandos) {
            await conexao.execute(sql, binds);
        }
        await conexao.commit();
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        await conexao.close();
    }
}