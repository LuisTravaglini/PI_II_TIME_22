// Autor: João Pedro Cayres Villela — Autoria exclusiva deste arquivo

import { Router } from "express";
import { executarQuery, executarTransacao, paraCamel } from "./bancoOracle.js";

const router = Router();

// Status usados no banco. Têm que ser IGUAIS aos do banco/carga_inicial.sql
// e aos que o front envia. Se o grupo usar outro padrão, só mude aqui.
const ABERTA = "aberta";
const ANDAMENTO = "andamento";
const REVISAO = "revisao";
const CONCLUIDA = "concluida";
const CANCELADA = "cancelada";

const transicoesValidas = {
    [ABERTA]: [ANDAMENTO],
    [ANDAMENTO]: [REVISAO],
    [REVISAO]: [CONCLUIDA, ANDAMENTO],
    [CONCLUIDA]: [],
    [CANCELADA]: []
};

// ORA-02291: chave estrangeira não encontrada (demanda ou usuário inexistente)
function chaveInexistente(erro) {
    return erro && erro.errorNum === 2291;
}

// 1. GET /demandas/:id
router.get("/demandas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const resOracle = await executarQuery(
            `SELECT ID, TITULO, DESCRICAO, TIPO, PRIORIDADE, STATUS, PROJETO_ID, RESPONSAVEL_ID,
                    DATA_CRIACAO, DATA_ATUALIZACAO, TO_CHAR(PRAZO, 'YYYY-MM-DD') AS PRAZO
               FROM DEMANDAS WHERE ID = :id`,
            [id]
        );

        if (resOracle.rows.length === 0) {
            return res.status(404).json({ mensagem: "Demanda não encontrada" });
        }

        return res.status(200).json(paraCamel(resOracle.rows[0]));
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro interno no servidor de banco de dados." });
    }
});

// 2. GET /demandas/:id/comentarios
router.get("/demandas/:id/comentarios", async (req, res) => {
    try {
        const idDemanda = Number(req.params.id);
        const resOracle = await executarQuery(
            `SELECT c.ID, c.DEMANDA_ID, c.USUARIO_ID, u.NOME AS USUARIO_NOME, c.TEXTO, c.DATA_HORA
               FROM COMENTARIOS c
               JOIN USUARIOS u ON u.ID = c.USUARIO_ID
              WHERE c.DEMANDA_ID = :id
              ORDER BY c.DATA_HORA ASC, c.ID ASC`,
            [idDemanda]
        );

        return res.status(200).json(resOracle.rows.map(paraCamel));
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro ao buscar comentários." });
    }
});

// 3. POST /demandas/:id/comentarios
router.post("/demandas/:id/comentarios", async (req, res) => {
    try {
        const idDemanda = Number(req.params.id);
        const { usuarioId, texto } = req.body;

        if (!texto || texto.trim() === "") {
            return res.status(400).json({ mensagem: "O comentário não pode estar vazio." });
        }
        if (!usuarioId) {
            return res.status(400).json({ mensagem: "Informe o usuário do comentário." });
        }

        await executarQuery(
            "INSERT INTO COMENTARIOS (DEMANDA_ID, USUARIO_ID, TEXTO) VALUES (:1, :2, :3)",
            [idDemanda, Number(usuarioId), texto.trim()]
        );

        return res.status(201).json({ mensagem: "Comentário registrado com sucesso." });
    } catch (erro) {
        if (chaveInexistente(erro)) {
            return res.status(400).json({ mensagem: "Demanda ou usuário não encontrado." });
        }
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro ao inserir comentário no banco Oracle." });
    }
});

// 4. PATCH /demandas/:id/status (Ciclo de Vida)
router.patch("/demandas/:id/status", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { novoStatus, usuarioId } = req.body;

        if (!novoStatus || !usuarioId) {
            return res.status(400).json({ mensagem: "Informe novoStatus e usuarioId." });
        }

        const busca = await executarQuery("SELECT STATUS FROM DEMANDAS WHERE ID = :id", [id]);
        if (busca.rows.length === 0) {
            return res.status(404).json({ mensagem: "Demanda não encontrada" });
        }

        const statusAtual = busca.rows[0].STATUS;

        if (!transicoesValidas[statusAtual] || !transicoesValidas[statusAtual].includes(novoStatus)) {
            return res.status(400).json({
                mensagem: `Transição inválida de '${statusAtual}' para '${novoStatus}'.`
            });
        }

        // Atualiza o status e grava o histórico juntos (ou os dois, ou nenhum).
        await executarTransacao([
            [
                "UPDATE DEMANDAS SET STATUS = :1, DATA_ATUALIZACAO = SYSTIMESTAMP WHERE ID = :2",
                [novoStatus, id]
            ],
            [
                `INSERT INTO HISTORICO_ALTERACOES (DEMANDA_ID, USUARIO_ID, CAMPO, VALOR_ANTERIOR, VALOR_NOVO)
                 VALUES (:1, :2, :3, :4, :5)`,
                [id, Number(usuarioId), "status", statusAtual, novoStatus]
            ]
        ]);

        return res.status(200).json({ mensagem: "Status atualizado com sucesso." });
    } catch (erro) {
        if (chaveInexistente(erro)) {
            return res.status(400).json({ mensagem: "Usuário não encontrado." });
        }
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro ao atualizar status." });
    }
});

// 5. PATCH /demandas/:id/cancelar (Sem DELETE Físico)
router.patch("/demandas/:id/cancelar", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { usuarioId } = req.body;

        if (!usuarioId) {
            return res.status(400).json({ mensagem: "Informe o usuarioId." });
        }

        const busca = await executarQuery("SELECT STATUS FROM DEMANDAS WHERE ID = :id", [id]);
        if (busca.rows.length === 0) {
            return res.status(404).json({ mensagem: "Demanda não encontrada" });
        }

        const statusAnterior = busca.rows[0].STATUS;
        if (statusAnterior === CONCLUIDA) {
            return res.status(400).json({ mensagem: "Uma demanda concluída não pode ser cancelada." });
        }
        if (statusAnterior === CANCELADA) {
            return res.status(400).json({ mensagem: "A demanda já está cancelada." });
        }

        // Muda para cancelada sem DELETE físico e registra no histórico.
        await executarTransacao([
            [
                "UPDATE DEMANDAS SET STATUS = :1, DATA_ATUALIZACAO = SYSTIMESTAMP WHERE ID = :2",
                [CANCELADA, id]
            ],
            [
                `INSERT INTO HISTORICO_ALTERACOES (DEMANDA_ID, USUARIO_ID, CAMPO, VALOR_ANTERIOR, VALOR_NOVO)
                 VALUES (:1, :2, :3, :4, :5)`,
                [id, Number(usuarioId), "status", statusAnterior, CANCELADA]
            ]
        ]);

        return res.status(200).json({ mensagem: "Demanda cancelada com sucesso." });
    } catch (erro) {
        if (chaveInexistente(erro)) {
            return res.status(400).json({ mensagem: "Usuário não encontrado." });
        }
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro ao cancelar demanda." });
    }
});

// 6. GET /demandas/:id/historico
router.get("/demandas/:id/historico", async (req, res) => {
    try {
        const idDemanda = Number(req.params.id);
        const resOracle = await executarQuery(
            `SELECT h.ID, h.DEMANDA_ID, h.USUARIO_ID, u.NOME AS USUARIO,
                    h.CAMPO, h.VALOR_ANTERIOR, h.VALOR_NOVO, h.DATA_HORA
               FROM HISTORICO_ALTERACOES h
               JOIN USUARIOS u ON u.ID = h.USUARIO_ID
              WHERE h.DEMANDA_ID = :id
              ORDER BY h.DATA_HORA DESC, h.ID DESC`,
            [idDemanda]
        );

        // Monta "descricao" para a tela continuar mostrando o texto como antes.
        const historico = resOracle.rows.map((linha) => {
            const item = paraCamel(linha);
            item.descricao = item.valorAnterior
                ? `alterou ${item.campo} de '${item.valorAnterior}' para '${item.valorNovo}'`
                : `definiu ${item.campo} como '${item.valorNovo}'`;
            return item;
        });

        return res.status(200).json(historico);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro ao buscar histórico." });
    }
});

export default router;