// Autor: Arthur Alves Raymundi - 26000661
// Rota GET /demandas: lista as demandas do banco Oracle, com filtros, busca e ordenação pela URL.
//
// Exemplos:
//   /demandas                                  -> todas
//   /demandas?status=aberta&prioridade=alta    -> filtros (pode combinar quantos quiser)
//   /demandas?busca=login                      -> procura no título ou na descrição
//   /demandas?ordenarPor=prazo                 -> ordena (prioridade, dataCriacao, prazo ou status)
//
// Filtros aceitos: status, prioridade, tipo, responsavelId, projetoId.
// As consultas ao banco ficam em listagemBanco.js.

import { Router } from "express";
import { buscarDemandasLista } from "./listagemBanco.js";

const router = Router();

// Valores aceitos em cada filtro (os mesmos combinados da equipe, sem acento e em minúsculo).
const STATUS_ACEITOS = ["aberta", "andamento", "revisao", "concluida", "cancelada"];
const PRIORIDADES_ACEITAS = ["critica", "alta", "media", "baixa"];
const TIPOS_ACEITOS = ["tarefa", "defeito", "melhoria", "documentacao"];
const ORDENACOES_ACEITAS = ["prioridade", "dataCriacao", "prazo", "status"];
const TAMANHO_MAXIMO_BUSCA = 100;

// Confere se o id veio como número inteiro positivo ("3" vale, "abc" e "-1" não).
function idValido(valor) {
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0;
}

router.get("/demandas", async (req, res) => {
    const { status, prioridade, tipo, responsavelId, projetoId, busca, ordenarPor } = req.query;

    // 1. Validações no servidor (as do front não bastam: dá para chamar a API direto pela URL).
    if (status && !STATUS_ACEITOS.includes(status)) {
        return res.status(400).json({ erro: "Status inválido. Use aberta, andamento, revisao, concluida ou cancelada." });
    }

    if (prioridade && !PRIORIDADES_ACEITAS.includes(prioridade)) {
        return res.status(400).json({ erro: "Prioridade inválida. Use critica, alta, media ou baixa." });
    }

    if (tipo && !TIPOS_ACEITOS.includes(tipo)) {
        return res.status(400).json({ erro: "Tipo inválido. Use tarefa, defeito, melhoria ou documentacao." });
    }

    if (responsavelId && !idValido(responsavelId)) {
        return res.status(400).json({ erro: "responsavelId deve ser um número inteiro positivo." });
    }

    if (projetoId && !idValido(projetoId)) {
        return res.status(400).json({ erro: "projetoId deve ser um número inteiro positivo." });
    }

    if (busca && busca.length > TAMANHO_MAXIMO_BUSCA) {
        return res.status(400).json({ erro: `A busca deve ter no máximo ${TAMANHO_MAXIMO_BUSCA} caracteres.` });
    }

    if (ordenarPor && !ORDENACOES_ACEITAS.includes(ordenarPor)) {
        return res.status(400).json({ erro: "ordenarPor deve ser: prioridade, dataCriacao, prazo ou status." });
    }

    // 2. Consulta no banco. Os ids vão como número; a busca vai sem espaços nas pontas.
    try {
        const demandas = await buscarDemandasLista({
            status,
            prioridade,
            tipo,
            responsavelId: responsavelId ? Number(responsavelId) : null,
            projetoId: projetoId ? Number(projetoId) : null,
            busca: busca ? busca.trim() : "",
            ordenarPor
        });

        return res.status(200).json(demandas);
    } catch (erro) {
        // 503 = o servidor está de pé, mas o banco não respondeu.
        console.error("Erro ao listar demandas:", erro.message);
        return res.status(503).json({ erro: "Não foi possível consultar as demandas no banco." });
    }
});

export default router;
