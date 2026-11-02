//Criador: Gabriel Souza
import oracledb from "oracledb";
import { conectarOracle } from "./bancoOracle.js";

const opcoes = { outFormat: oracledb.OUT_FORMAT_OBJECT };

export async function buscarUsuarioPorEmail(email) {
    const conexao = await conectarOracle();
    try {
        const resultado = await conexao.execute(
            `SELECT id AS "id", nome AS "nome", email AS "email",
                    senha AS "senha", perfil AS "perfil"
             FROM usuarios WHERE LOWER(email) = LOWER(:email)`,
            { email },
            opcoes
        );
        return resultado.rows[0];
    } finally {
        await conexao.close();
    }
}

export async function buscarUsuarioPorId(id) {
    const conexao = await conectarOracle();
    try {
        const resultado = await conexao.execute(
            `SELECT id AS "id", nome AS "nome", email AS "email", perfil AS "perfil"
             FROM usuarios WHERE id = :id`,
            { id },
            opcoes
        );
        return resultado.rows[0];
    } finally {
        await conexao.close();
    }
}

export async function listarUsuarios() {
    const conexao = await conectarOracle();
    try {
        const resultado = await conexao.execute(
            `SELECT id AS "id", nome AS "nome", email AS "email", perfil AS "perfil"
             FROM usuarios ORDER BY nome`,
            {},
            opcoes
        );
        return resultado.rows;
    } finally {
        await conexao.close();
    }
}

export async function cadastrarUsuario({ nome, email, senha, perfil }) {
    const conexao = await conectarOracle();
    try {
        const resultado = await conexao.execute(
            `INSERT INTO usuarios (nome, email, senha, perfil)
             VALUES (:nome, :email, :senha, :perfil)
             RETURNING id INTO :idCriado`,
            {
                nome, email, senha, perfil,
                idCriado: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );
        await conexao.commit();
        return { id: resultado.outBinds.idCriado[0], nome, email, perfil };
    } finally {
        await conexao.close();
    }
}