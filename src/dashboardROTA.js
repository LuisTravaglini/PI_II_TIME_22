// Autor: Arthur
// Rota GET /dashboard: devolve os números e listas que a tela de dashboard mostra.
//
// Critérios adotados pela equipe:
// - "Em aberto": demanda que ainda não terminou (status Aberta, Em andamento ou Em revisão).
// - "Próxima do prazo": demanda em aberto, com prazo preenchido, que vence de hoje até daqui a 7 dias.

import { Router } from "express";
import { demandas } from "./dados.js";

const router = Router();

const STATUS_EM_ABERTO = ["aberta", "andamento", "revisao"];
const DIAS_PARA_PRAZO = 7;

// Retorna true se a demanda ainda não foi concluída nem cancelada.
function estaEmAberto(demanda) {
    return STATUS_EM_ABERTO.includes(demanda.status);
}

// Quantos dias faltam até o prazo (negativo se já passou).
function diasAtePrazo(prazo) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataPrazo = new Date(`${prazo}T00:00:00`);
    const umDiaEmMilissegundos = 1000 * 60 * 60 * 24;

    return Math.round((dataPrazo - hoje) / umDiaEmMilissegundos);
}

router.get("/dashboard", (req, res) => {
    // Começa todos os contadores em zero.
    const porStatus = { aberta: 0, andamento: 0, revisao: 0, concluida: 0, cancelada: 0 };
    const porPrioridade = { baixa: 0, media: 0, alta: 0, critica: 0 };
    const porTipo = { tarefa: 0, defeito: 0, melhoria: 0, documentacao: 0 };

    // Passa por cada demanda somando 1 no contador certo.
    for (const demanda of demandas) {
        porStatus[demanda.status]++;
        porPrioridade[demanda.prioridade]++;
        porTipo[demanda.tipo]++;
    }

    // Críticas em aberto: em aberto E prioridade crítica.
    const criticasEmAberto = demandas.filter((demanda) => {
        return estaEmAberto(demanda) && demanda.prioridade === "critica";
    });

    // Próximas do prazo: em aberto, com prazo, vencendo entre hoje e daqui a 7 dias.
    const proximasDoPrazo = demandas.filter((demanda) => {
        if (!estaEmAberto(demanda) || demanda.prazo === "") {
            return false;
        }

        const dias = diasAtePrazo(demanda.prazo);
        return dias >= 0 && dias <= DIAS_PARA_PRAZO;
    });

    res.json({
        total: demandas.length,
        porStatus,
        porPrioridade,
        porTipo,
        criticasEmAberto,
        proximasDoPrazo
    });
});

export default router;
