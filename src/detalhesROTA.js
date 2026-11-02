// Autor: João Pedro Cayres Villela — Autoria exclusiva deste arquivo

import { Router } from "express";
import { executarQuery } from "./bancoOracle.js";

const router = Router();

// 1. GET /demandas/:id
router.get("/demandas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const resOracle = await executarQuery(
            "SELECT * FROM DEMANDAS WHERE ID = :id", 
            [id]
        );

        if (resOracle.rows.length === 0) {
            return res.status(404).json({ mensagem: "Demanda não encontrada" });
        }

        return res.status(200).json(resOracle.rows[0]);
    } catch (erro) {
        return res.status(500).json({ mensagem: "Erro interno no servidor de banco de dados." });
    }
});

// 2. GET /demandas/:id/comentarios
router.get("/demandas/:id/comentarios", async (req, res) => {
    try {
        const idDemanda = Number(req.params.id);
        const resOracle = await executarQuery(
            "SELECT * FROM COMENTARIOS WHERE DEMANDA_ID = :id ORDER BY DATA_HORA ASC", 
            [idDemanda]
        );

        return res.status(200).json(resOracle.rows);
    } catch (erro) {
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

        await executarQuery(
            "INSERT INTO COMENTARIOS (DEMANDA_ID, USUARIO_ID, TEXTO) VALUES (:1, :2, :3)",
            [idDemanda, usuarioId, texto.trim()]
        );

        return res.status(201).json({ mensagem: "Comentário registrado com sucesso." });
    } catch (erro) {
        return res.status(500).json({ mensagem: "Erro ao inserir comentário no banco Oracle." });
    }
});

// 4. PATCH /demandas/:id/status (Ciclo de Vida)
router.patch("/demandas/:id/status", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { novoStatus, usuarioNome } = req.body;

        const busca = await executarQuery("SELECT STATUS FROM DEMANDAS WHERE ID = :id", [id]);
        if (busca.rows.length === 0) {
            return res.status(404).json({ mensagem: "Demanda não encontrada" });
        }

        const statusAtual = busca.rows[0].STATUS;
        const transicoesValidas = {
            "Aberta": ["Em andamento"],
            "Em andamento": ["Em revisão"],
            "Em revisão": ["Concluída", "Em andamento"],
            "Concluída": [],
            "Cancelada": []
        };

        if (!transicoesValidas[statusAtual] || !transicoesValidas[statusAtual].includes(novoStatus)) {
            return res.status(400).json({ 
                mensagem: `Transição inválida de '${statusAtual}' para '${novoStatus}'.` 
            });
        }

        // Atualiza status e insere registro de histórico
        await executarQuery(
            "UPDATE DEMANDAS SET STATUS = :1, DATA_ATUALIZACAO = CURRENT_TIMESTAMP WHERE ID = :2",
            [novoStatus, id]
        );

        await executarQuery(
            "INSERT INTO HISTORICO_ALTERACOES (DEMANDA_ID, USUARIO, DESCRICAO) VALUES (:1, :2, :3)",
            [id, usuarioNome || "Usuário", `alterou o status de '${statusAtual}' para '${novoStatus}'`]
        );

        return res.status(200).json({ mensagem: "Status atualizado com sucesso." });
    } catch (erro) {
        return res.status(500).json({ mensagem: "Erro ao atualizar status." });
    }
});

// 5. PATCH /demandas/:id/cancelar (Sem DELETE Físico)
router.patch("/demandas/:id/cancelar", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { usuarioNome } = req.body;

        const busca = await executarQuery("SELECT STATUS FROM DEMANDAS WHERE ID = :id", [id]);
        if (busca.rows.length === 0) {
            return res.status(404).json({ mensagem: "Demanda não encontrada" });
        }

        const statusAnterior = busca.rows[0].STATUS;
        if (statusAnterior === "Concluída") {
            return res.status(400).json({ mensagem: "Uma demanda concluída não pode ser cancelada." });
        }

        // Altera para Cancelada sem DELETE físico
        await executarQuery(
            "UPDATE DEMANDAS SET STATUS = 'Cancelada', DATA_ATUALIZACAO = CURRENT_TIMESTAMP WHERE ID = :1",
            [id]
        );

        await executarQuery(
            "INSERT INTO HISTORICO_ALTERACOES (DEMANDA_ID, USUARIO, DESCRICAO) VALUES (:1, :2, :3)",
            [id, usuarioNome || "Usuário", `cancelou a demanda (status anterior: '${statusAnterior}')`]
        );

        return res.status(200).json({ mensagem: "Demanda cancelada com sucesso." });
    } catch (erro) {
        return res.status(500).json({ mensagem: "Erro ao cancelar demanda." });
    }
});

// 6. GET /demandas/:id/historico
router.get("/demandas/:id/historico", async (req, res) => {
    try {
        const idDemanda = Number(req.params.id);
        const resOracle = await executarQuery(
            "SELECT * FROM HISTORICO_ALTERACOES WHERE DEMANDA_ID = :id ORDER BY DATA_HORA DESC",
            [idDemanda]
        );

        return res.status(200).json(resOracle.rows);
    } catch (erro) {
        return res.status(500).json({ mensagem: "Erro ao buscar histórico." });
    }
});

export default router;