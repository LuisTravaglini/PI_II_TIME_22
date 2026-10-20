// Autor: Luis Travaglini
// Reunião 4 — API Backend do sistema TRAK.
// Este arquivo contém as rotas de listagem de projetos e cadastro de demandas.

import { Router } from "express";
import { demandas, projetos, usuarios } from "./dados.js";

const router = Router();

const tiposPermitidos = ["tarefa", "defeito", "melhoria", "documentacao"];
const prioridadesPermitidas = ["critica", "alta", "media", "baixa"];

function normalizarTexto(valor) {
    return String(valor)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function dataValida(data) {
    if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const [ano, mes, dia] = data.split("-").map(Number);
    const dataConvertida = new Date(Date.UTC(ano, mes - 1, dia));

    return dataConvertida.getUTCFullYear() === ano
        && dataConvertida.getUTCMonth() === mes - 1
        && dataConvertida.getUTCDate() === dia;
}

// Lista os projetos de teste disponíveis para cadastrar uma demanda.
router.get("/projetos", (req, res) => {
    return res.status(200).json(projetos);
});

// Cadastra uma demanda e valida os dados recebidos no corpo (body) da requisição.
router.post("/demandas", (req, res) => {
    const { titulo, descricao, tipo, prioridade, projetoId, responsavelId, prazo } = req.body || {};

    if (!titulo || !String(titulo).trim()) {
        return res.status(400).json({ erro: "O título é obrigatório." });
    }

    if (!descricao || !String(descricao).trim()) {
        return res.status(400).json({ erro: "A descrição é obrigatória." });
    }

    const tipoNormalizado = normalizarTexto(tipo);
    if (!tiposPermitidos.includes(tipoNormalizado)) {
        return res.status(400).json({
            erro: "Tipo inválido. Use Tarefa, Defeito, Melhoria ou Documentação."
        });
    }

    const prioridadeNormalizada = normalizarTexto(prioridade);
    if (!prioridadesPermitidas.includes(prioridadeNormalizada)) {
        return res.status(400).json({
            erro: "Prioridade inválida. Use Crítica, Alta, Média ou Baixa."
        });
    }

    const projetoIdNumero = Number(projetoId);
    const projetoExiste = Number.isInteger(projetoIdNumero)
        && projetos.some((projeto) => projeto.id === projetoIdNumero);

    if (!projetoExiste) {
        return res.status(400).json({ erro: "O projeto informado não existe." });
    }

    let responsavelIdNumero = null;
    if (responsavelId !== undefined && responsavelId !== null && responsavelId !== "") {
        responsavelIdNumero = Number(responsavelId);
        const responsavelExiste = Number.isInteger(responsavelIdNumero)
            && usuarios.some((usuario) => usuario.id === responsavelIdNumero);

        if (!responsavelExiste) {
            return res.status(400).json({ erro: "O responsável informado não existe." });
        }
    }

    if (prazo !== undefined && prazo !== null && prazo !== "" && !dataValida(prazo)) {
        return res.status(400).json({
            erro: "O prazo deve estar no formato AAAA-MM-DD e conter uma data válida."
        });
    }

    const agora = new Date().toISOString();
    const novaDemanda = {
        id: demandas.length ? Math.max(...demandas.map((demanda) => demanda.id)) + 1 : 1,
        titulo: String(titulo).trim(),
        descricao: String(descricao).trim(),
        tipo: tipoNormalizado,
        prioridade: prioridadeNormalizada,
        status: "aberta",
        projetoId: projetoIdNumero,
        responsavelId: responsavelIdNumero,
        dataCriacao: agora,
        dataAtualizacao: agora,
        prazo: prazo || ""
    };

    demandas.push(novaDemanda);

    return res.status(201).json(novaDemanda);
});

export default router;
