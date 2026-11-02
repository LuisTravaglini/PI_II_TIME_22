// Autor: João Pedro Cayres Villela 

import { Router } from "express";
import { demandas, comentarios, usuarios, historico } from "./dados.js"; 

const router = Router();


// 1. GET /demandas/:id

router.get("/demandas/:id", (req, res) => {
    const id = Number(req.params.id);
    const demanda = demandas.find(d => d.id === id);

    if (!demanda) {
        return res.status(404).json({ mensagem: "Demanda não encontrada" });
    }

    return res.status(200).json(demanda);
});


// 2. GET /demandas/:id/comentarios

router.get("/demandas/:id/comentarios", (req, res) => {
    const idDemanda = Number(req.params.id);

    const demandaExiste = demandas.some(d => d.id === idDemanda);
    if (!demandaExiste) {
        return res.status(404).json({ mensagem: "Demanda não encontrada" });
    }

    const listaComentarios = comentarios.filter(c => c.demandaId === idDemanda);
    return res.status(200).json(listaComentarios);
});


// 3. POST /demandas/:id/comentarios

router.post("/demandas/:id/comentarios", (req, res) => {
    const idDemanda = Number(req.params.id);
    const { usuarioId, texto } = req.body;

    const demandaExiste = demandas.some(d => d.id === idDemanda);
    if (!demandaExiste) {
        return res.status(404).json({ mensagem: "Demanda não encontrada" });
    }

    if (typeof texto !== "string" || texto.trim() === "") {
        return res.status(400).json({ mensagem: "O comentário não pode estar vazio." });
    }
    
    if (!usuarioId) {
        return res.status(400).json({ mensagem: "O ID do usuário é obrigatório." });
    }

    const usuarioExiste = usuarios.some(u => u.id === Number(usuarioId));
    if (!usuarioExiste) {
        return res.status(400).json({ mensagem: "Usuário não encontrado." });
    }

    const novoComentario = {
        id: comentarios.length + 1,
        demandaId: idDemanda,
        usuarioId: Number(usuarioId),
        texto: texto.trim(),
        dataHora: new Date().toISOString()
    };

    comentarios.push(novoComentario);

    return res.status(201).json(novoComentario);
});


// 4. PATCH /demandas/:id/status 

router.patch("/demandas/:id/status", (req, res) => {
    const id = Number(req.params.id);
    const { novoStatus, usuarioNome } = req.body;

    const demanda = demandas.find(d => d.id === id);
    if (!demanda) {
        return res.status(404).json({ mensagem: "Demanda não encontrada" });
    }

    const statusAtual = demanda.status;

    const transicoesValidas = {
        "Aberta": ["Em andamento"],
        "Em andamento": ["Em revisão"],
        "Em revisão": ["Concluída", "Em andamento"],
        "Concluída": [],
        "Cancelada": []
    };

    if (!transicoesValidas[statusAtual] || !transicoesValidas[statusAtual].includes(novoStatus)) {
        return res.status(400).json({ 
            mensagem: `Transição de status inválida de '${statusAtual}' para '${novoStatus}'.` 
        });
    }

    historico.push({
        id: historico.length + 1,
        demandaId: id,
        usuario: usuarioNome || "Usuário",
        descricao: `alterou o status de '${statusAtual}' para '${novoStatus}'`,
        dataHora: new Date().toISOString()
    });

    demanda.status = novoStatus;
    demanda.dataAtualizacao = new Date().toISOString();

    return res.status(200).json(demanda);
});


// 5. PATCH /demandas/:id/cancelar

router.patch("/demandas/:id/cancelar", (req, res) => {
    const id = Number(req.params.id);
    const { usuarioNome } = req.body;

    const demanda = demandas.find(d => d.id === id);
    if (!demanda) {
        return res.status(404).json({ mensagem: "Demanda não encontrada" });
    }

    if (demanda.status === "Concluída") {
        return res.status(400).json({ mensagem: "Uma demanda já concluída não pode ser cancelada." });
    }

    const statusAnterior = demanda.status;
    demanda.status = "Cancelada";
    demanda.dataAtualizacao = new Date().toISOString();

    historico.push({
        id: historico.length + 1,
        demandaId: id,
        usuario: usuarioNome || "Usuário",
        descricao: `cancelou a demanda (status anterior: '${statusAnterior}')`,
        dataHora: new Date().toISOString()
    });

    return res.status(200).json({ mensagem: "Demanda cancelada com sucesso", demanda });
});

// 6. GET /demandas/:id/historico

router.get("/demandas/:id/historico", (req, res) => {
    const idDemanda = Number(req.params.id);

    const demandaExiste = demandas.some(d => d.id === idDemanda);
    if (!demandaExiste) {
        return res.status(404).json({ mensagem: "Demanda não encontrada" });
    }

    const historicoDemanda = historico.filter(h => h.demandaId === idDemanda);
    return res.status(200).json(historicoDemanda);
});

export default router;