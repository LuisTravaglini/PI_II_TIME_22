// Autor: Arthur Alves Raymundi - 26000661
// Rota GET /demandas: lista as demandas, com filtros, busca e ordenação pela URL.
//
// Exemplos:
//   /demandas                                  -> todas
//   /demandas?status=aberta&prioridade=alta    -> filtros (pode combinar quantos quiser)
//   /demandas?busca=login                      -> procura no título ou na descrição
//   /demandas?ordenarPor=prazo                 -> ordena (prioridade, dataCriacao, prazo ou status)
//
// Filtros aceitos: status, prioridade, tipo, responsavelId, projetoId.

import { Router } from "express";
import { demandas, projetos, usuarios } from "./dados.js";

const router = Router();

// Ordem usada para ordenar prioridade e status (o menor número vem primeiro).
const ORDEM_PRIORIDADE = { critica: 1, alta: 2, media: 3, baixa: 4 };
const ORDEM_STATUS = { aberta: 1, andamento: 2, revisao: 3, concluida: 4, cancelada: 5 };
const ORDENACOES_ACEITAS = ["prioridade", "dataCriacao", "prazo", "status"];

// Troca os ids de projeto e responsável pelos nomes, para a tela mostrar direto.
function montarDemandaParaLista(demanda) {
    const projeto = projetos.find((p) => p.id === demanda.projetoId);
    const responsavel = usuarios.find((u) => u.id === demanda.responsavelId);

    return {
        id: demanda.id,
        titulo: demanda.titulo,
        tipo: demanda.tipo,
        prioridade: demanda.prioridade,
        status: demanda.status,
        projeto: projeto ? projeto.nome : null,
        responsavel: responsavel ? responsavel.nome : null,   // null = sem responsável
        dataCriacao: demanda.dataCriacao,
        prazo: demanda.prazo
    };
}

// Compara duas datas "AAAA-MM-DD". Datas vazias (sem prazo) vão para o fim.
function compararDatas(dataA, dataB) {
    if (dataA === "" && dataB === "") return 0;
    if (dataA === "") return 1;
    if (dataB === "") return -1;

    // Nesse formato, comparar como texto já dá a ordem certa ("2026-09-01" < "2026-10-05").
    return dataA.localeCompare(dataB);
}

router.get("/demandas", (req, res) => {
    const { status, prioridade, tipo, responsavelId, projetoId, busca, ordenarPor } = req.query;

    // Começa com todas e vai tirando o que não passa em cada filtro.
    let resultado = demandas;

    // 1. Filtros: cada um só é aplicado se veio na URL.
    if (status) {
        resultado = resultado.filter((d) => d.status === status);
    }

    if (prioridade) {
        resultado = resultado.filter((d) => d.prioridade === prioridade);
    }

    if (tipo) {
        resultado = resultado.filter((d) => d.tipo === tipo);
    }

    // Tudo que vem na URL é texto, por isso o Number(...) para comparar com os ids.
    if (responsavelId) {
        resultado = resultado.filter((d) => d.responsavelId === Number(responsavelId));
    }

    if (projetoId) {
        resultado = resultado.filter((d) => d.projetoId === Number(projetoId));
    }

    // 2. Busca textual no título ou na descrição (sem diferenciar maiúscula de minúscula).
    if (busca) {
        const termo = busca.toLowerCase().trim();

        resultado = resultado.filter((d) => {
            return d.titulo.toLowerCase().includes(termo) || d.descricao.toLowerCase().includes(termo);
        });
    }

    // 3. Ordenação.
    if (ordenarPor) {
        if (!ORDENACOES_ACEITAS.includes(ordenarPor)) {
            return res.status(400).json({
                erro: "ordenarPor deve ser: prioridade, dataCriacao, prazo ou status."
            });
        }

        // [...resultado] faz uma cópia, para o sort não bagunçar a lista original do dados.js.
        resultado = [...resultado].sort((a, b) => {
            if (ordenarPor === "prioridade") {
                return ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade];
            }

            if (ordenarPor === "status") {
                return ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status];
            }

            // dataCriacao ou prazo
            return compararDatas(a[ordenarPor], b[ordenarPor]);
        });
    }

    // 4. Monta a resposta com os nomes no lugar dos ids.
    res.json(resultado.map(montarDemandaParaLista));
});

export default router;
