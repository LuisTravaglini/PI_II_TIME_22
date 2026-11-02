// Autor: Arthur Alves Raymundi - 26000661
// Consultas Oracle usadas pela listagem de demandas (GET /demandas) e pelo dashboard (GET /dashboard).
// Usa a mesma conexão do resto do sistema (bancoOracle.js), criada pelo Luis.

import oracledb from "oracledb";
import { conectarOracle } from "./bancoOracle.js";

// Colunas devolvidas para a tela. Os apelidos entre aspas fazem o Oracle devolver
// os nomes iguais aos usados no JavaScript (sem eles viriam em MAIÚSCULO).
// As datas saem como texto "AAAA-MM-DD", o mesmo formato que o front já usa.
const CAMPOS_LISTA = `d.id AS "id", d.titulo AS "titulo", d.tipo AS "tipo",
    d.prioridade AS "prioridade", d.status AS "status",
    p.nome AS "projeto", u.nome AS "responsavel",
    TO_CHAR(d.data_criacao, 'YYYY-MM-DD') AS "dataCriacao",
    TO_CHAR(d.prazo, 'YYYY-MM-DD') AS "prazo"`;

// LEFT JOIN no usuário porque a demanda pode estar sem responsável.
const TABELAS_LISTA = `demandas d
    JOIN projetos p ON p.id = d.projeto_id
    LEFT JOIN usuarios u ON u.id = d.responsavel_id`;

// Ordem de cada ordenação aceita. O texto do ORDER BY vem SEMPRE daqui,
// nunca direto da URL, para ninguém conseguir injetar SQL pelo ?ordenarPor=.
const ORDENACOES = {
    prioridade: `CASE d.prioridade WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 ELSE 4 END`,
    status: `CASE d.status WHEN 'aberta' THEN 1 WHEN 'andamento' THEN 2 WHEN 'revisao' THEN 3
        WHEN 'concluida' THEN 4 ELSE 5 END`,
    dataCriacao: "d.data_criacao",
    prazo: "d.prazo NULLS LAST"   // demandas sem prazo vão para o fim
};

// Executa uma consulta e sempre fecha a conexão, mesmo se der erro.
async function consultar(sql, parametros) {
    const conexao = await conectarOracle();
    try {
        const resultado = await conexao.execute(sql, parametros, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return resultado.rows;
    } finally {
        await conexao.close();
    }
}

// Lista as demandas aplicando só os filtros que vieram preenchidos.
// filtros = { status, prioridade, tipo, responsavelId, projetoId, busca, ordenarPor }
export async function buscarDemandasLista(filtros) {
    const condicoes = [];
    const parametros = {};

    // Cada filtro vira um pedaço do WHERE com parâmetro (:nome), nunca com o valor colado no texto.
    if (filtros.status) {
        condicoes.push("d.status = :status");
        parametros.status = filtros.status;
    }

    if (filtros.prioridade) {
        condicoes.push("d.prioridade = :prioridade");
        parametros.prioridade = filtros.prioridade;
    }

    if (filtros.tipo) {
        condicoes.push("d.tipo = :tipo");
        parametros.tipo = filtros.tipo;
    }

    if (filtros.responsavelId) {
        condicoes.push("d.responsavel_id = :responsavelId");
        parametros.responsavelId = filtros.responsavelId;
    }

    if (filtros.projetoId) {
        condicoes.push("d.projeto_id = :projetoId");
        parametros.projetoId = filtros.projetoId;
    }

    // Busca no título ou na descrição, sem diferenciar maiúscula de minúscula.
    if (filtros.busca) {
        condicoes.push("(LOWER(d.titulo) LIKE :busca OR LOWER(d.descricao) LIKE :busca)");
        parametros.busca = `%${filtros.busca.toLowerCase()}%`;
    }

    let sql = `SELECT ${CAMPOS_LISTA} FROM ${TABELAS_LISTA}`;

    if (condicoes.length > 0) {
        sql += ` WHERE ${condicoes.join(" AND ")}`;
    }

    // Sem ordenação escolhida, mostra as mais novas primeiro. O d.id no fim desempata.
    const ordem = filtros.ordenarPor ? ORDENACOES[filtros.ordenarPor] : "d.data_criacao DESC";
    sql += ` ORDER BY ${ordem}, d.id`;

    return consultar(sql, parametros);
}

// Busca os campos que o dashboard precisa de todas as demandas.
// As contas (totais por status, prioridade etc.) continuam no dashboardROTA.js.
export async function buscarDemandasDashboard() {
    return consultar(`SELECT id AS "id", titulo AS "titulo", tipo AS "tipo",
        prioridade AS "prioridade", status AS "status",
        TO_CHAR(prazo, 'YYYY-MM-DD') AS "prazo"
        FROM demandas ORDER BY prazo NULLS LAST, id`, {});
}
