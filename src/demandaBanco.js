// Autor: Luis Travaglini
// Consultas Oracle usadas pelo cadastro e pela edição de demandas.
import oracledb from "oracledb";
import { conectarOracle } from "./bancoOracle.js";
import { registrarHistoricoEdicao } from "./historicoDemanda.js";

const campos = `id AS "id", titulo AS "titulo", descricao AS "descricao",
    tipo AS "tipo", prioridade AS "prioridade", status AS "status",
    projeto_id AS "projetoId", responsavel_id AS "responsavelId",
    data_criacao AS "dataCriacao", data_atualizacao AS "dataAtualizacao",
    TO_CHAR(prazo, 'YYYY-MM-DD') AS "prazo"`;

export async function buscarProjetos() {
    const conexao = await conectarOracle();
    try {
        const resultado = await conexao.execute('SELECT id AS "id", nome AS "nome" FROM projetos ORDER BY nome', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return resultado.rows;
    } finally { await conexao.close(); }
}

export async function buscarUsuariosCadastro() {
    const conexao = await conectarOracle();
    try {
        const resultado = await conexao.execute('SELECT id AS "id", nome AS "nome" FROM usuarios ORDER BY nome', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return resultado.rows;
    } finally { await conexao.close(); }
}

export async function buscarDemandaCadastro(id) {
    const conexao = await conectarOracle();
    try {
        const resultado = await conexao.execute(`SELECT ${campos} FROM demandas WHERE id = :id`, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return resultado.rows[0];
    } finally { await conexao.close(); }
}

// Atualização e histórico são confirmados juntos; se houver erro, nada é salvo.
export async function atualizarDemandaComHistorico(dados, id, usuarioId) {
    const conexao = await conectarOracle();
    try {
        const resultadoAnterior = await conexao.execute(
            `SELECT ${campos} FROM demandas WHERE id = :id FOR UPDATE`,
            { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const anterior = resultadoAnterior.rows[0];
        if (!anterior) return null;

        await conexao.execute(`UPDATE demandas SET titulo=:titulo, descricao=:descricao,
            tipo=:tipo, prioridade=:prioridade, projeto_id=:projetoId, responsavel_id=:responsavelId,
            prazo=TO_DATE(:prazo, 'YYYY-MM-DD'), data_atualizacao=SYSTIMESTAMP WHERE id=:id`,
            { ...dados, id });
        await registrarHistoricoEdicao(conexao, id, usuarioId, anterior, dados);
        const resultado = await conexao.execute(
            `SELECT ${campos} FROM demandas WHERE id = :id`,
            { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        await conexao.commit();
        return resultado.rows[0];
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        await conexao.close();
    }
}

export async function gravarDemanda(dados, id) {
    const conexao = await conectarOracle();
    try {
        const parametros = { ...dados };
        if (id !== null) {
            parametros.id = id;
            const resultado = await conexao.execute(`UPDATE demandas SET titulo=:titulo, descricao=:descricao,
                tipo=:tipo, prioridade=:prioridade, projeto_id=:projetoId, responsavel_id=:responsavelId,
                prazo=TO_DATE(:prazo, 'YYYY-MM-DD'), data_atualizacao=SYSTIMESTAMP WHERE id=:id`, parametros);
            if (!resultado.rowsAffected) return null;
        } else {
            parametros.idCriado = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER };
            const resultado = await conexao.execute(`INSERT INTO demandas
                (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, prazo)
                VALUES (:titulo, :descricao, :tipo, :prioridade, 'aberta', :projetoId, :responsavelId,
                    TO_DATE(:prazo, 'YYYY-MM-DD')) RETURNING id INTO :idCriado`, parametros);
            id = resultado.outBinds.idCriado[0];
        }
        const resultado = await conexao.execute(`SELECT ${campos} FROM demandas WHERE id=:id`, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        await conexao.commit();
        return resultado.rows[0];
    } finally { await conexao.close(); }
}
