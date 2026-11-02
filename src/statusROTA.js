//Criador: Gabriel Souza
import { Router } from "express";
import { demandas } from "./dados.js";
import { PERFIS } from "./perfis.js";
import { exigirPermissao } from "./permissoes.js";

const router = Router();

const statusPermitidos = ["aberta", "andamento", "revisao", "concluida"];

function hoje() {
    return new Date().toISOString().slice(0, 10);
}

router.patch("/demandas/:id/status", exigirPermissao("alterar_status"), (req, res) => {
    const id = Number(req.params.id);
    const {status} = req.body || {};
    const demanda = demandas.find(d => d.id === id);

    if(!demanda) {
        res.status(404).json({erro: "Demanda não encontrada"});
    } else if(!statusPermitidos.includes(status)) {
        res.status(400).json({erro: "Status inválido. Use aberta, andamento, revisao ou concluída. Pra cancelar, use a rota de cancelamento."});
    } else if (demanda.status === "cancelada") {
        res.status(409).json({erro: "Uma demanda cancelada não pode mudar de status."});
    } else if (req.usuario.perfil === PERFIS.MEMBRO && demanda.responsavelId !== req.usuario.id) {
        res.status(403).json({erro: "Membros só alteram o status das demandas em que são responsáveis."});
    } else {
        demanda.status = status;
        demanda.dataAtualizacao = hoje();
        res.status(200).json(demanda);
    }
});

router.patch("/demandas/:id/cancelar", exigirPermissao("cancelar_demanda"), (req, res) => {
    const id = Number(req.params.id);
    const demanda = demandas.find(d => d.id === id);

    if (!demanda) {
        res.status(404).json({ erro: "Demanda não encontrada." });
    } else if (demanda.status === "cancelada") {
        res.status(409).json({ erro: "A demanda já está cancelada." });
    } else if (demanda.status === "concluida") {
        res.status(409).json({ erro: "Uma demanda concluída não pode ser cancelada." });
    } else {
        demanda.status = "cancelada";
        demanda.dataAtualizacao = hoje();
        res.status(200).json(demanda);
    }
});

export default router;
