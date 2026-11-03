// Autor: Luis Travaglini
// Reunião 4 — API Backend do sistema TRAK.
// Este arquivo contém as rotas de listagem de projetos e cadastro de demandas.

import { Router } from "express";
import { buscarProjetos, buscarUsuariosCadastro, buscarDemandaCadastro, gravarDemanda, atualizarDemandaComHistorico } from "./demandaBanco.js";
import { exigirPermissaoDemanda } from "./permissoesDemanda.js";

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
router.get("/projetos", async (req, res) => {
    try { return res.status(200).json(await buscarProjetos()); }
    catch (erro) { console.error("Erro ao consultar projetos:", erro.code); return res.status(503).json({ erro: "Não foi possível consultar os projetos no banco." }); }
});

// Estas consultas atendem à tela de cadastro enquanto as demais telas são integradas.
router.get("/cadastro/usuarios", async (req, res) => {
    try { return res.json(await buscarUsuariosCadastro()); }
    catch (erro) { console.error("Erro ao consultar usuários:", erro.code); return res.status(503).json({ erro: "Não foi possível consultar os responsáveis no banco." }); }
});

router.get("/cadastro/demandas/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: "ID de demanda inválido." });
    try {
        const demanda = await buscarDemandaCadastro(id);
        return demanda ? res.json(demanda) : res.status(404).json({ erro: "Demanda não encontrada." });
    } catch (erro) { console.error("Erro ao consultar demanda:", erro.code); return res.status(503).json({ erro: "Não foi possível consultar a demanda no banco." }); }
});

// A BrasilAPI informa os feriados nacionais do ano do prazo.
async function verificarFeriado(prazo) {
    const resposta = await fetch(`https://brasilapi.com.br/api/feriados/v1/${prazo.slice(0, 4)}`, {
        signal: AbortSignal.timeout(8000)
    });
    if (!resposta.ok) throw new Error("Serviço de feriados indisponível.");
    const feriados = await resposta.json();
    return feriados.find((feriado) => feriado.date === prazo);
}

// Cadastro e edição compartilham as mesmas validações no servidor.
async function salvarDemanda(req, res) {
    const id = req.method === "PUT" ? Number(req.params.id) : null;
    if (id !== null && (!Number.isInteger(id) || id < 1)) return res.status(400).json({ erro: "ID de demanda inválido." });
    try {
    if (id !== null && !(await buscarDemandaCadastro(id))) return res.status(404).json({ erro: "Demanda não encontrada." });
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
        && (await buscarProjetos()).some((projeto) => projeto.id === projetoIdNumero);

    if (!projetoExiste) {
        return res.status(400).json({ erro: "O projeto informado não existe." });
    }

    let responsavelIdNumero = null;
    if (responsavelId !== undefined && responsavelId !== null && responsavelId !== "") {
        responsavelIdNumero = Number(responsavelId);
        const responsavelExiste = Number.isInteger(responsavelIdNumero)
            && (await buscarUsuariosCadastro()).some((usuario) => usuario.id === responsavelIdNumero);

        if (!responsavelExiste) {
            return res.status(400).json({ erro: "O responsável informado não existe." });
        }
    }

    if (prazo !== undefined && prazo !== null && prazo !== "" && !dataValida(prazo)) {
        return res.status(400).json({
            erro: "O prazo deve estar no formato AAAA-MM-DD e conter uma data válida."
        });
    }

    if (prazo) {
        try {
            const feriado = await verificarFeriado(prazo);
            if (feriado) {
                return res.status(400).json({ erro: `O prazo não pode cair em feriado nacional: ${feriado.name}.` });
            }
        } catch (erro) {
            return res.status(503).json({ erro: "Não foi possível verificar os feriados. Tente novamente." });
        }
    }

    const dados = {
        titulo: String(titulo).trim(),
        descricao: String(descricao).trim(),
        tipo: tipoNormalizado,
        prioridade: prioridadeNormalizada,
        projetoId: projetoIdNumero,
        responsavelId: responsavelIdNumero,
        prazo: prazo || null
    };
    const demanda = id === null
        ? await gravarDemanda(dados, null)
        : await atualizarDemandaComHistorico(dados, id, req.usuario.id);
    if (!demanda) return res.status(404).json({ erro: "Demanda não encontrada." });
    return res.status(id === null ? 201 : 200).json(demanda);
    } catch (erro) {
        console.error("Erro ao salvar demanda:", erro.code);
        return res.status(503).json({ erro: "Não foi possível acessar o banco de dados." });
    }
}

router.post("/demandas", exigirPermissaoDemanda("criar_demanda"), salvarDemanda);
router.put("/demandas/:id", exigirPermissaoDemanda("editar_demanda"), salvarDemanda);

export default router;
