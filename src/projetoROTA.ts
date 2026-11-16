// Feito por: Gabriel Souza

import { Router } from "express";
import oracledb from "oracledb";
import { conectarOracle } from "./bancoOracle.js";
import { buscarUsuariosCadastro } from "./demandaBanco.js";

const router = Router();

const PERFIS_QUE_CRIAM = ["administrador", "lider"];
const TAMANHO_MINIMO = 3;
const TAMANHO_MAXIMO = 150; // mesmo limite da coluna projetos.nome

router.post("/projetos", async (req, res) => {
    if (!req.usuario) return res.status(401).json({ erro: "Faça login para continuar." });
    if (!PERFIS_QUE_CRIAM.includes(req.usuario.perfil)) {
        return res.status(403).json({ erro: "Seu perfil não tem permissão para criar projetos." });
    }

    const { nome, membros } = req.body || {};

    if (typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({ erro: "O nome do projeto é obrigatório." });
    }
    const nomeLimpo = nome.trim().replace(/\s+/g, " ");
    if (nomeLimpo.length < TAMANHO_MINIMO) {
        return res.status(400).json({ erro: `O nome deve ter pelo menos ${TAMANHO_MINIMO} caracteres.` });
    }
    if (nomeLimpo.length > TAMANHO_MAXIMO) {
        return res.status(400).json({ erro: `O nome deve ter no máximo ${TAMANHO_MAXIMO} caracteres.` });
    }

    if (membros !== undefined && !Array.isArray(membros)) {
        return res.status(400).json({ erro: "A lista de membros é inválida." });
    }
    const idsInformados = (membros || []).map(Number);
    if (idsInformados.some((id) => !Number.isInteger(id) || id < 1)) {
        return res.status(400).json({ erro: "A lista de membros contém um usuário inválido." });
    }

    // Quem cria o projeto sempre fica vinculado a ele; sem isso um líder não enxergaria o que criou.
    const idsMembros = [...new Set<number>([...idsInformados, Number(req.usuario.id)])];

    let conexao;
    try {
        const usuariosExistentes = (await buscarUsuariosCadastro()).map((usuario) => usuario.id);
        if (!idsMembros.every((id) => usuariosExistentes.includes(id))) {
            return res.status(400).json({ erro: "Um dos membros informados não existe." });
        }

        conexao = await conectarOracle();

        const duplicado = await conexao.execute(
            "SELECT 1 FROM projetos WHERE LOWER(nome) = LOWER(:nome)",
            { nome: nomeLimpo }
        );
        if (duplicado.rows && duplicado.rows.length > 0) {
            return res.status(409).json({ erro: "Já existe um projeto com esse nome." });
        }

        const resultado = await conexao.execute(
            "INSERT INTO projetos (nome) VALUES (:nome) RETURNING id INTO :idCriado",
            { nome: nomeLimpo, idCriado: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
        );
        const idProjeto = (resultado.outBinds as { idCriado: number[] }).idCriado[0];

        for (const usuarioId of idsMembros) {
            await conexao.execute(
                "INSERT INTO usuarios_projetos (usuario_id, projeto_id) VALUES (:usuarioId, :projetoId)",
                { usuarioId, projetoId: idProjeto }
            );
        }

        await conexao.commit();
        return res.status(201).json({ id: idProjeto, nome: nomeLimpo });
    } catch (erro) {
        if (conexao) await conexao.rollback().catch(() => {});
        console.error("Erro ao criar projeto:", erro.message);
        return res.status(503).json({ erro: "Não foi possível criar o projeto no banco." });
    } finally {
        if (conexao) await conexao.close().catch(() => {});
    }
});

export default router;