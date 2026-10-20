// Autor:               João Pedro Cayres Villela

import { Router } from "express";
import { demandas, comentarios, usuarios } from "./dados.js"; 

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
    // Cria o objeto do novo comentário (com dataHora registrada automaticamente)
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

export default router;
